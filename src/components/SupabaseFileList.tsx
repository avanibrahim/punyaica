import React, { useEffect, useMemo, useState } from 'react';
import type { FileItem } from '@/lib/supaFiles';
import { publicUrl, signedUrl } from '@/lib/supaFiles';
import {
  FileText, Image as ImageIcon, Download, Eye, Trash2,
  RefreshCcw, LayoutGrid, List
} from 'lucide-react';

// ================================================================
// Utils
// ================================================================
export function bytesFmt(n: number) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

const TZ = 'Asia/Makassar';
const PDF_THUMB_QUERY = '?thumb=1&page=1&width=800';
const THUMB_TOP_PARAM = '&position=top'; // hapus kalau service-mu gak butuh

function isImagePath(path: string) {
  return /(\.(png|jpe?g|webp|gif|bmp|avif))$/i.test(path.split('?')[0] || '');
}
function ext(path: string) {
  const clean = (path || '').split('?')[0];
  const m = clean.match(/\.([a-z0-9]+)$/i);
  return m ? m[1].toLowerCase() : '';
}
function baseName(path: string) {
  const clean = (path || '').split('?')[0];
  const parts = clean.split('/')
  return parts[parts.length - 1] || 'file';
}
function formatWITA(date: Date) {
  return date.toLocaleString('id-ID', {
    timeZone: TZ, weekday: 'short', day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}
function relativeTimeID(from: Date, to: Date = new Date()) {
  const rtf = new Intl.RelativeTimeFormat('id-ID', { numeric: 'auto' });
  const diffSec = Math.round((from.getTime() - to.getTime()) / 1000);
  const abs = Math.abs(diffSec);
  const units: Array<[Intl.RelativeTimeFormatUnit, number]> = [
    ['year', 31536000], ['month', 2592000], ['week', 604800],
    ['day', 86400], ['hour', 3600], ['minute', 60], ['second', 1],
  ];
  for (const [unit, secs] of units) {
    if (abs >= secs || unit === 'second') return rtf.format(Math.round(diffSec / secs) as any, unit);
  }
  return rtf.format(0 as any, 'second');
}
function guessThumbUrl(f: FileItem) {
  if (isImagePath(f.storage_path)) return publicUrl(f.storage_path);
  if (ext(f.storage_path) === 'pdf') return publicUrl(f.storage_path) + PDF_THUMB_QUERY + THUMB_TOP_PARAM;
  return null;
}

// ====== Download helpers (paksa unduh, anti-preview) ======
function withDownloadParam(url: string, filename: string) {
  try {
    const u = new URL(url);
    if (!u.searchParams.has('download')) u.searchParams.set('download', filename);
    return u.toString();
  } catch {
    return url + (url.includes('?') ? '&' : '?') + 'download=' + encodeURIComponent(filename);
  }
}

function saveBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename || 'download';
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

async function downloadViaBlob(url: string, filename: string) {
  const res = await fetch(url, { method: 'GET', credentials: 'omit', cache: 'no-store', mode: 'cors' });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const blob = await res.blob();
  saveBlob(blob, filename);
}

// ================================================================
// Types
// ================================================================
type Variant = 'home' | 'download' | 'manage';
type ViewMode = 'grid' | 'list';
type TypeFilter = 'all' | 'pdf' | 'image' | 'other';

// ================================================================
// Component
// ================================================================
export function SupabaseFileList({
  files,
  isLoading,
  error,
  onRefresh,
  onDelete,
  showSkeleton,
  variant = 'manage',
}: {
  files: FileItem[];
  isLoading: boolean;
  error: string | null;
  onRefresh: () => void | Promise<void>;
  onDelete?: (id: number) => void | Promise<void>;
  showSkeleton?: boolean;
  variant?: Variant;
}) {
  // default ke LIST di mobile
  const [view, setView] = useState<ViewMode>('list');
  useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia('(min-width: 640px)').matches) {
      setView('grid'); // di ≥sm default grid (sesuai sebelumnya)
    }
  }, []);

  const [q, setQ] = useState('');
  const [type, setType] = useState<TypeFilter>('all');
  const [downloadingId, setDownloadingId] = useState<number | null>(null);

  const showViewBtn = true;
  const showDownloadBtn = variant === 'download' || variant === 'manage';
  const showDeleteBtn = variant === 'manage';

  const sorted = useMemo(
    () => [...files].sort(
      (a, b) => new Date(b.uploaded_at).getTime() - new Date(a.uploaded_at).getTime()
    ),
    [files]
  );
  const newestId = sorted[0]?.id as any;

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return sorted.filter((f) => {
      const e = ext(f.storage_path);
      const isImg = isImagePath(f.storage_path);
      const isPdf = e === 'pdf';
      const typeOk =
        type === 'all' ? true :
        type === 'image' ? isImg :
        type === 'pdf' ? isPdf :
        !isImg && !isPdf;
      if (!typeOk) return false;
      if (!needle) return true;
      const hay = `${(f as any).title ?? ''} ${(f as any).original_name ?? ''}`.toLowerCase();
      return hay.includes(needle);
    });
  }, [sorted, q, type]);

  // ====== Download handler (konfirmasi + paksa unduh) ======
  const getFilename = (f: FileItem) =>
    ((f as any).title?.trim?.() || (f as any).original_name || baseName(f.storage_path));

  const handleDownload = async (f: FileItem) => {
    const filename = getFilename(f);
    const ok = window.confirm(`Download \"${filename}\" ke perangkat?`);
    if (!ok) return;

    setDownloadingId(f.id as any);
    try {
      // Selalu coba signedUrl, lalu paksa "download" via query param supaya attachment
      const url = await signedUrl((f as any).storage_path, 60);
      if (url) {
        const forced = withDownloadParam(url, filename);
        await downloadViaBlob(forced, filename);
        return;
      }
      // Fallback: public URL (kalau bucket public)
      const pub = publicUrl((f as any).storage_path);
      const forcedPub = withDownloadParam(pub, filename);
      await downloadViaBlob(forcedPub, filename);
    } catch (e) {
      console.error('Download gagal:', e);
      // fallback terakhir: buka public URL di tab baru (barangkali di-handle browser)
      const pub = publicUrl((f as any).storage_path);
      const forced = withDownloadParam(pub, filename);
      window.location.href = forced;
    } finally {
      setDownloadingId(null);
    }
  };

  // ============================ STATES ============================
  if (error) {
    return (
      <div className="flex items-center justify-between gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-rose-400 sm:p-4">
        <div className="truncate">{error}</div>
        <button
          onClick={onRefresh}
          className="inline-flex h-10 items-center gap-2 rounded-lg border px-3 text-sm hover:bg-rose-500/10"
        >
          <RefreshCcw className="h-4 w-4" />
          <span className="hidden sm:inline">Coba lagi</span>
        </button>
      </div>
    );
  }

  if (isLoading || showSkeleton) {
    return (
      <div className={view === 'grid'
        ? 'grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4'
        : 'space-y-2 sm:space-y-3'}>
        {Array.from({ length: 8 }).map((_, i) =>
          view === 'grid' ? (
            <div key={i} className="animate-pulse overflow-hidden rounded-xl border bg-muted/50">
              <div className="h-40 w-full bg-muted sm:h-48" />
              <div className="space-y-2 p-3 sm:p-4">
                <div className="h-4 w-3/4 rounded bg-muted" />
                <div className="h-3 w-1/2 rounded bg-muted" />
                <div className="h-3 w-2/3 rounded bg-muted" />
              </div>
            </div>
          ) : (
            <div key={i} className="animate-pulse h-20 rounded-xl border bg-muted/50" />
          )
        )}
      </div>
    );
  }

  if (!sorted.length) {
    return (
      <div className="rounded-xl border p-8 text-center sm:rounded-2xl sm:p-10">
        <div className="mx-auto mb-3 h-10 w-10 rounded-full bg-muted" />
        <div className="text-base font-semibold">Belum ada Jurnal</div>
        <div className="text-sm text-muted-foreground">Unggah dokumen untuk mulai.</div>
        <button
          onClick={onRefresh}
          className="mt-4 inline-flex h-10 items-center gap-2 rounded-xl border px-3 text-sm hover:bg-accent hover:text-accent-foreground"
        >
          <RefreshCcw className="h-4 w-4" />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>
    );
  }

  // ============================== UI ==============================
  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Toolbar — sticky di mobile (dipangkas biar fokus ke download) */}
      <div className="flex items-center justify-end">
        <div className="inline-flex rounded-xl border p-1">
          <button
            onClick={() => setView('grid')}
            className={`inline-flex h-11 items-center gap-2 rounded-lg px-3 text-[14px] sm:text-sm ${view === 'grid' ? 'bg-accent text-accent-foreground' : ''}`}
            title="Grid"
          >
            <LayoutGrid className="h-4 w-4" />
            <span className="hidden sm:inline">Grid</span>
          </button>
          <button
            onClick={() => setView('list')}
            className={`inline-flex h-11 items-center gap-2 rounded-lg px-3 text-[14px] sm:text-sm ${view === 'list' ? 'bg-accent text-accent-foreground' : ''}`}
            title="List"
          >
            <List className="h-4 w-4" />
            <span className="hidden sm:inline">List</span>
          </button>
        </div>
      </div>

      {/* CONTENT */}
      {view === 'grid' ? (
        <div className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {filtered.map((f) => {
            const title = (f as any).title?.trim?.() || (f as any).original_name || '';
            const d = new Date((f as any).uploaded_at);
            const absolute = formatWITA(d);
            const relative = relativeTimeID(d);
            const thumb = guessThumbUrl(f);
            const newest = f.id === newestId;
            const fileExt = (ext((f as any).storage_path) || 'file').toUpperCase();
            const isDownloading = downloadingId === (f.id as any);

            return (
              <div
                key={f.id as any}
                className={`group relative overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm transition hover:shadow-md sm:rounded-2xl ${newest ? 'ring-2 ring-emerald-500/80' : ''}`}
              >
                <div className="relative">
                  {thumb ? (
                    <img
                      src={thumb}
                      alt={title}
                      className="h-40 w-full object-cover object-top sm:h-48"
                      style={{ objectPosition: 'top' }}
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex h-40 w-full items-start justify-center bg-muted sm:h-48">
                      {isImagePath((f as any).storage_path)
                        ? <ImageIcon className="mt-6 h-10 w-10 opacity-70" />
                        : <FileText className="mt-6 h-10 w-10 opacity-70" />
                      }
                    </div>
                  )}
                  <div className="absolute left-3 top-3 flex items-center gap-2">
                    {newest && (
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-medium text-emerald-700 ring-1 ring-emerald-200 sm:text-xs">
                        Terbaru
                      </span>
                    )}
                    <span className="rounded-full bg-secondary px-2 py-0.5 text-[11px] font-medium text-secondary-foreground ring-1 ring-border sm:text-xs">
                      {fileExt}
                    </span>
                  </div>
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/40 via-black/0 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                </div>

                <div className="p-3 sm:p-4">
                  <div className="mb-1 line-clamp-2 text-[14px] font-semibold sm:text-sm">{title}</div>
                  <div className="text-[12px] text-muted-foreground sm:text-xs">{(f as any).original_name}</div>

                  <div className="mt-2 flex flex-wrap items-center gap-2 text-[12px] text-muted-foreground sm:mt-3 sm:text-xs">
                    <span className="font-medium text-foreground">{bytesFmt((f as any).size)}</span>
                    <span>•</span>
                    <span title={`Diunggah: ${absolute} (WITA)`}>{relative}</span>
                    <span>•</span>
                    <span className="uppercase tracking-wide">WITA</span>
                  </div>

                  <div className="mt-3 flex items-center gap-2 sm:mt-4">
                    {showViewBtn && (
                      <a
                        href={publicUrl((f as any).storage_path)}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex h-10 items-center gap-2 rounded-lg border px-3 text-[13px] hover:bg-accent hover:text-accent-foreground sm:h-9 sm:text-sm"
                        aria-label="Lihat"
                      >
                        <Eye className="h-4 w-4" />
                        <span className="hidden sm:inline">Lihat</span>
                      </a>
                    )}
                    {showDownloadBtn && (
                      <button
                        onClick={() => handleDownload(f)}
                        className="inline-flex h-10 items-center gap-2 rounded-lg bg-emerald-500 px-3 text-[13px] font-medium text-white shadow hover:brightness-95 disabled:opacity-60 sm:h-9 sm:text-sm"
                        aria-label="Download"
                        disabled={isDownloading}
                        type="button"
                      >
                        {isDownloading ? (
                          <div className="h-4 w-4 animate-spin rounded-full border border-white/50 border-t-transparent" />
                        ) : (
                          <Download className="h-4 w-4" />
                        )}
                        <span className="hidden sm:inline">{isDownloading ? 'Mengunduh…' : 'Download'}</span>
                      </button>
                    )}
                    {showDeleteBtn && onDelete && (
                      <button
                        onClick={() => onDelete(f.id as any)}
                        className="ml-auto inline-flex h-10 items-center gap-2 rounded-lg bg-rose-500 px-3 text-[13px] font-medium text-white shadow hover:brightness-95 sm:h-9 sm:text-sm"
                        aria-label="Hapus"
                        type="button"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="hidden sm:inline">Hapus</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <ul className="divide-y divide-border rounded-xl border">
          {filtered.map((f) => {
            const title = (f as any).title?.trim?.() || (f as any).original_name || '';
            const d = new Date((f as any).uploaded_at);
            const absolute = formatWITA(d);
            const relative = relativeTimeID(d);
            const thumb = guessThumbUrl(f);
            const newest = f.id === newestId;
            const fileExt = (ext((f as any).storage_path) || 'file').toUpperCase();
            const isDownloading = downloadingId === (f.id as any);

            return (
              <li key={f.id as any} className="flex items-center gap-3 p-3 sm:gap-4 sm:p-3.5">
                <div className="relative h-16 w-24 overflow-hidden rounded-lg border bg-muted sm:h-20 sm:w-28">
                  {thumb ? (
                    <img
                      src={thumb}
                      alt={title}
                      className="h-full w-full object-cover object-top"
                      style={{ objectPosition: 'top' }}
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex h-full w-full items-start justify-center">
                      {isImagePath((f as any).storage_path)
                        ? <ImageIcon className="mt-3 h-5 w-5 opacity-70" />
                        : <FileText className="mt-3 h-5 w-5 opacity-70" />
                      }
                    </div>
                  )}
                  <span className="absolute right-1 top-1 rounded bg-secondary px-1.5 py-0.5 text-[10px] font-medium text-secondary-foreground ring-1 ring-border">
                    {fileExt}
                  </span>
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <div className="truncate text-[14px] font-semibold sm:text-sm">{title}</div>
                    {newest && (
                      <span className="shrink-0 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-medium text-emerald-700 ring-1 ring-emerald-200">
                        Terbaru
                      </span>
                    )}
                  </div>
                  <div className="truncate text-[12px] text-muted-foreground sm:text-xs">
                    {(f as any).original_name} • {bytesFmt((f as any).size)} •{' '}
                    <span title={`Diunggah: ${absolute} (WITA)`}>{relative}</span> • WITA
                  </div>

                  <div className="mt-2 flex items-center gap-1.5 sm:gap-2">
                    {showViewBtn && (
                      <a
                        href={publicUrl((f as any).storage_path)}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex h-10 items-center gap-2 rounded-lg border px-3 text-[13px] hover:bg-accent hover:text-accent-foreground sm:h-9 sm:text-sm"
                        aria-label="Lihat"
                      >
                        <Eye className="h-4 w-4" />
                        <span className="hidden sm:inline">Lihat</span>
                      </a>
                    )}
                    {showDownloadBtn && (
                      <button
                        onClick={() => handleDownload(f)}
                        className="inline-flex h-10 items-center gap-2 rounded-lg bg-emerald-500 px-3 text-[13px] font-medium text-white shadow hover:brightness-95 disabled:opacity-60 sm:h-9 sm:text-sm"
                        aria-label="Download"
                        disabled={isDownloading}
                        type="button"
                      >
                        {isDownloading ? (
                          <div className="h-4 w-4 animate-spin rounded-full border border-white/50 border-t-transparent" />
                        ) : (
                          <Download className="h-4 w-4" />
                        )}
                        <span className="hidden sm:inline">{isDownloading ? 'Mengunduh…' : 'Download'}</span>
                      </button>
                    )}
                    {showDeleteBtn && onDelete && (
                      <button
                        onClick={() => onDelete(f.id as any)}
                        className="ml-auto inline-flex h-10 items-center gap-2 rounded-lg bg-rose-500 px-3 text-[13px] font-medium text-white shadow hover:brightness-95 sm:h-9 sm:text-sm"
                        aria-label="Hapus"
                        type="button"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="hidden sm:inline">Hapus</span>
                      </button>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

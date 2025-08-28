'use client';

import { useState } from 'react';
import { Download, Eye, Trash2, RefreshCw } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  FileItem,
  formatFileSize,
  formatDate,
  getFileType,
  getFileTypeLabel,
  getFileTypeColor,
  BASE_URL,
} from '@/lib/fileUtils';

interface FileListProps {
  files: FileItem[];
  isLoading: boolean;
  error: string | null;
  onRefresh: () => void;
  onDelete: (id: number) => void;
  showSkeleton?: boolean;
}

/* ===================== DOWNLOAD HELPERS ===================== */
// Simpen Blob pakai <a download>
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

// Coba fetch -> Blob (paling “maksa” jadi file)
async function downloadViaBlob(url: string, filename: string) {
  const res = await fetch(url, {
    method: 'GET',
    credentials: 'include', // hapus jika backend gak pakai cookie/session
    cache: 'no-store',
    redirect: 'follow',
    headers: {
      Accept: 'application/octet-stream',
      'X-Requested-With': 'XMLHttpRequest',
    },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);

  // ambil nama dari header kalau ada (butuh Access-Control-Expose-Headers di server)
  const cd = res.headers.get('content-disposition') || res.headers.get('Content-Disposition') || '';
  let name = filename;
  try {
    const m1 = cd.match(/filename\*=UTF-8''([^;]+)/i);
    const m2 = cd.match(/filename="?([^\";]+)"?/i);
    const encoded = (m1?.[1] || m2?.[1])?.trim();
    if (encoded) name = decodeURIComponent(encoded);
  } catch {}

  const blob = await res.blob();
  saveBlob(blob, name);
}

// Fallback tanpa CORS: tembak iframe tersembunyi (kalau server set attachment, langsung download)
function triggerDownloadIframe(url: string) {
  const iframe = document.createElement('iframe');
  iframe.style.display = 'none';
  iframe.src = url;
  document.body.appendChild(iframe);
  setTimeout(() => iframe.remove(), 60_000);
}
/* ============================================================ */

const FileSkeleton = () => (
  <div className="flex items-center gap-4 p-4 animate-pulse">
    <div className="h-6 w-12 bg-skeleton-bg rounded-full" />
    <div className="flex-1 space-y-2">
      <div className="h-4 bg-skeleton-bg rounded w-3/4" />
      <div className="h-3 bg-skeleton-bg rounded w-1/2" />
    </div>
    <div className="flex gap-2">
      <div className="h-8 w-16 bg-skeleton-bg rounded-lg" />
      <div className="h-8 w-16 bg-skeleton-bg rounded-lg" />
      <div className="h-8 w-16 bg-skeleton-bg rounded-lg" />
    </div>
  </div>
);

const EmptyState = () => (
  <div className="text-center py-12">
    <div className="w-24 h-24 bg-journal-border rounded-full flex items-center justify-center mx-auto mb-4">
      <Download className="h-12 w-12 text-muted-foreground" />
    </div>
    <h3 className="text-lg font-medium text-foreground mb-2">Belum ada Jurnal diupload</h3>
    <p className="text-muted-foreground">Upload Jurnal pertama Anda untuk memulai</p>
  </div>
);

const ErrorState = ({ error, onRefresh }: { error: string; onRefresh: () => void }) => (
  <div className="text-center py-8">
    <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-6 max-w-md mx-auto">
      <p className="text-destructive font-medium mb-4">{error}</p>
      <button
        onClick={onRefresh}
        className="bg-secondary text-secondary-foreground font-bold rounded-lg px-4 py-2 hover:opacity-90 transition-opacity flex items-center gap-2 mx-auto"
      >
        <RefreshCw className="h-4 w-4" />
        Coba Lagi
      </button>
    </div>
  </div>
);

export const FileList = ({
  files,
  isLoading,
  error,
  onRefresh,
  onDelete,
  showSkeleton = false,
}: FileListProps) => {
  const [deletingIds, setDeletingIds] = useState<Set<number>>(new Set());

  // State untuk konfirmasi download
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingFile, setPendingFile] = useState<FileItem | null>(null);
  const [downloadingId, setDownloadingId] = useState<number | null>(null);

  const handleDelete = async (id: number, title: string) => {
    const confirmDelete = window.confirm(`Hapus file "${title}"?`);
    if (!confirmDelete) return;

    setDeletingIds((prev) => new Set(prev).add(id));
    try {
      onDelete(id); // optimistic
      const res = await fetch(`${BASE_URL}/api/files/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Gagal menghapus file');
    } catch (err) {
      console.error('Delete error:', err);
      onRefresh();
    } finally {
      setDeletingIds((prev) => {
        const ns = new Set(prev);
        ns.delete(id);
        return ns;
      });
    }
  };

  // ===== Konfirmasi → lanjut download =====
  const askDownload = (file: FileItem) => {
    setPendingFile(file);
    setConfirmOpen(true);
  };

  const doDownload = async (file: FileItem) => {
    const name = file.title || file.original_name;
    const base = `${BASE_URL}/api/files/${file.id}`;
    const primary = `${base}/download`;

    // 1) Coba pakai Blob (paksa save)
    try {
      await downloadViaBlob(primary, name);
      return;
    } catch (e) {
      console.warn('Blob gagal, fallback ke iframe:', e);
    }

    // 2) Fallback: iframe (butuh server set attachment); coba beberapa varian query yang umum
    const candidates = [
      `${base}/download?download=1`,
      `${base}/download?attachment=1`,
      `${base}/view?download=1`,
    ];
    for (const u of candidates) {
      try {
        triggerDownloadIframe(u);
        return;
      } catch {}
    }

    // 3) Fallback terakhir: buka tab (kalau server sudah set attachment, tetap unduh)
    window.open(primary, '_blank');
  };

  const confirmDownload = async () => {
    if (!pendingFile) return;
    const file = pendingFile;

    setConfirmOpen(false);
    setDownloadingId(file.id);
    try {
      await doDownload(file);
    } catch (err) {
      console.error('Download error:', err);
    } finally {
      setDownloadingId(null);
      setPendingFile(null);
    }
  };

  const handleView = (id: number) => {
    window.open(`${BASE_URL}/api/files/${id}/view`, '_blank');
  };

  // Skeleton
  if (showSkeleton || (isLoading && files.length === 0)) {
    return (
      <div className="bg-journal-card border border-journal-border rounded-2xl shadow-xl">
        <div className="p-6 border-b border-journal-divider">
          <h2 className="text-xl font-bold text-foreground">File Jurnal</h2>
        </div>
        <div className="divide-y divide-journal-divider">
          {Array.from({ length: 4 }, (_, i) => (
            <FileSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-journal-card border border-journal-border rounded-2xl shadow-xl p-6">
        <h2 className="text-xl font-bold text-foreground mb-4">File Jurnal</h2>
        <ErrorState error={error} onRefresh={onRefresh} />
      </div>
    );
  }

  if (files.length === 0) {
    return (
      <div className="bg-journal-card border border-journal-border rounded-2xl shadow-xl p-6">
        <h2 className="text-xl font-bold text-foreground mb-4">File Jurnal</h2>
        <EmptyState />
      </div>
    );
  }

  return (
    <div className="bg-journal-card border border-journal-border rounded-2xl shadow-xl">
      {/* Confirm Dialog */}
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Download file?</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingFile ? (
                <span>
                  Download jurnal <span className="font-semibold">"{pendingFile.title || pendingFile.original_name}"</span> ke perangkat kamu?
                </span>
              ) : (
                'Konfirmasi download file.'
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDownload}>Ya, download</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="p-6 border-b border-journal-divider">
        <h2 className="text-xl font-bold text-foreground">File Jurnal</h2>
        <p className="text-sm text-muted-foreground mt-1">Menampilkan {files.length} file • urut terbaru → lama</p>
      </div>

      <div className="divide-y divide-journal-divider max-h-[600px] overflow-y-auto">
        {files.map((file) => {
          const fileType = getFileType(file.mimetype, file.original_name);
          const displayTitle = file.title || file.original_name;
          const isDeleting = deletingIds.has(file.id);
          const isDownloading = downloadingId === file.id;

          return (
            <div
              key={file.id}
              className={`flex items-center gap-4 p-4 hover:bg-journal-card-hover transition-colors ${
                isDeleting ? 'opacity-50' : ''
              }`}
            >
              {/* File Type Badge */}
              <div className={`text-xs px-2 py-1 rounded-full border font-medium ${getFileTypeColor(fileType)}`}>
                {getFileTypeLabel(fileType)}
              </div>

              {/* File Info */}
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-foreground truncate" title={displayTitle}>
                  {displayTitle}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {file.original_name} • {formatFileSize(file.size)} • {formatDate(file.uploaded_at)}
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-2 flex-shrink-0">
                <button
                  onClick={() => askDownload(file)} // KONFIRMASI LALU DOWNLOAD
                  className="bg-secondary text-secondary-foreground font-bold rounded-lg px-3 py-1.5 hover:opacity-90 transition-opacity flex items-center gap-1.5 text-sm disabled:opacity-60"
                  aria-label={`Download ${displayTitle}`}
                  disabled={isDeleting || isDownloading}
                >
                  {isDownloading ? (
                    <div className="w-3.5 h-3.5 border border-secondary-foreground/40 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Download className="h-3.5 w-3.5" />
                  )}
                  <span className="hidden sm:inline">{isDownloading ? 'Mengunduh…' : 'Download'}</span>
                </button>

                <button
                  onClick={() => handleView(file.id)}
                  className="bg-blue-500/20 text-blue-300 border border-blue-500/30 font-bold rounded-lg px-3 py-1.5 hover:opacity-90 transition-opacity flex items-center gap-1.5 text-sm"
                  aria-label={`Lihat ${displayTitle}`}
                  disabled={isDeleting}
                >
                  <Eye className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Lihat</span>
                </button>

                <button
                  onClick={() => handleDelete(file.id, displayTitle)}
                  className="bg-destructive/20 text-destructive border border-destructive/30 font-bold rounded-lg px-3 py-1.5 hover:opacity-90 transition-opacity flex items-center gap-1.5 text-sm"
                  aria-label={`Hapus ${displayTitle}`}
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <div className="w-3.5 h-3.5 border border-destructive/30 border-t-destructive rounded-full animate-spin" />
                  ) : (
                    <Trash2 className="h-3.5 w-3.5" />
                  )}
                  <span className="hidden sm:inline">Hapus</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

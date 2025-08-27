import React from 'react';
import type { FileItem } from '@/lib/supaFiles';
import { publicUrl, signedUrl } from '@/lib/supaFiles';

export function bytesFmt(n: number) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

export function SupabaseFileList({
  files,
  isLoading,
  error,
  onRefresh,
  onDelete,
  showSkeleton,
}: {
  files: FileItem[];
  isLoading: boolean;
  error: string | null;
  onRefresh: () => void | Promise<void>;
  onDelete: (id: number) => void | Promise<void>;
  showSkeleton?: boolean;
}) {
  if (error) {
    return (
      <div className="bg-rose-500/10 text-rose-400 border border-rose-500/20 p-4 rounded-xl">
        {error}
      </div>
    );
  }

  if (isLoading || showSkeleton) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="animate-pulse h-16 rounded-xl bg-slate-200 dark:bg-slate-700" />
        ))}
      </div>
    );
  }

  if (!files.length) {
    return (
      <div className="text-center text-muted-foreground py-8">Belum ada Jurnal diupload.</div>
    );
  }

  return (
    <ul className="divide-y divide-border rounded-xl border">
      {files.map((f) => (
        <li key={f.id} className="p-4 flex items-center justify-between gap-4">
          <div className="min-w-0">
            <div className="font-semibold truncate">{f.title || f.original_name}</div>
            <div className="text-sm text-muted-foreground truncate">
              {f.original_name} • {bytesFmt(f.size)} • {new Date(f.uploaded_at).toLocaleString('id-ID', { timeZone: 'Asia/Makassar' })}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <a
              href={publicUrl(f.storage_path)}
              target="_blank"
              rel="noreferrer"
              className="bg-secondary text-secondary-foreground px-3 py-2 rounded-lg text-sm"
            >
              Lihat
            </a>
            <button
              onClick={async () => {
                const url = await signedUrl(f.storage_path, 60);
                window.open(url, '_blank');
              }}
              className="bg-emerald-500 text-white px-3 py-2 rounded-lg text-sm"
            >
              Download
            </button>
            <button
              onClick={() => onDelete(f.id)}
              className="bg-rose-500 text-white px-3 py-2 rounded-lg text-sm"
            >
              Hapus
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
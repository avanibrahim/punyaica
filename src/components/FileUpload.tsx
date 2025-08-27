// src/components/FileUpload.tsx
import React, { useEffect, useRef, useState } from 'react';
import { Upload, FileText } from 'lucide-react';
import { uploadFile } from '@/lib/supaFiles';

export type FileUploadProps = {
  onUploadStart?: () => void;
  onUploadSuccess?: () => void;
  onUploadError?: (error: string) => void;
  maxSizeMb?: number; // default 50MB
};

const DEFAULT_MAX_MB = 50;

function bytesFmt(n: number) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

function FileUpload({
  onUploadStart,
  onUploadSuccess,
  onUploadError,
  maxSizeMb = DEFAULT_MAX_MB,
}: FileUploadProps) {
  const [title, setTitle] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<number | null>(null);

  // --- helpers ---
  const startFakeProgress = () => {
    setUploadProgress(0);
    timerRef.current = window.setInterval(() => {
      setUploadProgress((p) => {
        if (p === null) return 0;
        if (p >= 90) return 90; // tahan di 90% sampai selesai
        const inc = p < 30 ? 8 : p < 60 ? 5 : 3;
        return p + inc;
      });
      return;
    }, 180);
  };
  const stopProgress = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };
  const validateAndSet = (f: File | null | undefined) => {
    if (!f) return;
    const MAX_BYTES = (maxSizeMb || DEFAULT_MAX_MB) * 1024 * 1024;
    if (f.size > MAX_BYTES) {
      onUploadError?.(`Ukuran file melebihi ${maxSizeMb} MB (${bytesFmt(f.size)})`);
      return;
    }
    setSelectedFile(f);
  };

  // --- events ---
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    validateAndSet(e.target.files?.[0]);
  };
  const handleDragOver: React.DragEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };
  const handleDragLeave = () => setIsDragOver(false);
  const handleDrop: React.DragEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    validateAndSet(e.dataTransfer.files?.[0]);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      onUploadError?.('Pilih file dulu ya.');
      return;
    }
    try {
      onUploadStart?.();
      setIsUploading(true);
      startFakeProgress();

      await uploadFile(selectedFile, title || undefined);

      stopProgress();
      setUploadProgress(100);
      setTimeout(() => setUploadProgress(null), 700);

      setTitle('');
      setSelectedFile(null);

      onUploadSuccess?.();
    } catch (err: any) {
      stopProgress();
      setUploadProgress(null);
      onUploadError?.(err?.message || 'Upload gagal');
    } finally {
      setIsUploading(false);
    }
  };

  useEffect(() => () => stopProgress(), []);

  // --- UI persis seperti yang kamu kirim ---
  return (
    <div className="bg-journal-card border border-journal-border rounded-2xl p-6 shadow-xl">
      <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
        <Upload className="h-5 w-5 text-primary" />
        Upload File
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-foreground mb-2">
            Judul (opsional)
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Masukkan judul file"
            className="w-full rounded-xl border border-journal-border bg-journal-bg px-3 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
            disabled={isUploading}
          />
        </div>

        <div>
          <label htmlFor="file" className="block text-sm font-medium text-foreground mb-2">
            Pilih File
          </label>
          <input
            ref={fileInputRef}
            id="file"
            type="file"
            onChange={handleFileSelect}
            className="w-full rounded-xl border border-journal-border bg-journal-bg px-3 py-2 text-foreground file:mr-2 file:border-0 file:bg-primary file:text-primary-foreground file:rounded-lg file:px-3 file:py-1 file:text-sm file:font-medium hover:file:opacity-90 focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
            disabled={isUploading}
          />
        </div>
      </div>

      {/* Drag & Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          rounded-2xl border-2 border-dashed p-6 text-center transition-all duration-200
          ${isDragOver ? 'border-primary bg-primary/5' : 'border-journal-border hover:border-primary/50'}
          ${isUploading ? 'opacity-50 pointer-events-none' : 'cursor-pointer'}
        `}
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="flex flex-col items-center gap-2">
          <Upload className={`h-8 w-8 ${isDragOver ? 'text-primary' : 'text-muted-foreground'}`} />
          <p className="text-sm font-medium text-foreground">
            {selectedFile ? selectedFile.name : 'Drag & drop file atau klik untuk memilih'}
          </p>
          <p className="text-xs text-muted-foreground">PDF, Word, Excel, Gambar, ZIP dan lainnya</p>
        </div>
      </div>

      {/* Progress Bar */}
      {uploadProgress !== null && (
        <div className="mt-4">
          <div className="flex justify-between text-sm text-muted-foreground mb-1">
            <span>Upload Progress</span>
            <span>{uploadProgress}%</span>
          </div>
          <div className="w-full bg-journal-border rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Upload Button */}
      <button
        onClick={handleUpload}
        disabled={!selectedFile || isUploading}
        className="w-full mt-4 bg-gradient-primary text-white font-bold rounded-xl px-4 py-3 hover:opacity-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
      >
        {isUploading ? (
          <span className="flex items-center justify-center gap-2">
            <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
            Uploading...
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            <FileText className="h-4 w-4" />
            Upload File
          </span>
        )}
      </button>
    </div>
  );
}

export { FileUpload };
export default FileUpload;

// src/pages/Upload.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload as UploadIcon, Sparkles, Lightbulb } from 'lucide-react';

import  Layout  from '@/components/Layout';
import { useToast } from '@/hooks/useToast';
import { ToastContainer } from '@/components/Toast';
import  FileUpload  from '@/components/FileUpload';

// ⬇️ helper Supabase yang sudah kita buat sebelumnya
import { uploadFile } from '@/lib/supaFiles';

export default function Upload() {
  const toast = useToast();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const onFilePick = (f: File | undefined) => {
    if (!f) return;
    setFile(f);
  };

  const onDrop: React.DragEventHandler<HTMLLabelElement> = e => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    onFilePick(f);
  };

  const handleUploadStart = () => { toast.info('Memulai upload...'); };
const handleUploadSuccess = () => {
  toast.success('Upload berhasil');
  setTimeout(() => navigate('/'), 1500);
};
const handleUploadError = (msg: string) => { toast.error(`Upload gagal: ${msg}`); };


  const onSubmit: React.FormEventHandler = async e => {
    e.preventDefault();
    if (!file) {
      toast.error('Pilih file dulu ya.');
      return;
    }
    try {
      setIsUploading(true);
      toast.info('Memulai upload…');

      await uploadFile(file, title || undefined);

      toast.success('Upload berhasil');
      setTitle('');
      setFile(null);

      // redirect ke daftar jurnal
      setTimeout(() => navigate('/'), 1200);
    } catch (err: any) {
      toast.error(`Upload gagal: ${err?.message || 'terjadi kesalahan'}`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <header className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-2">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">Unggah Jurnal Anda</h1>
          </div>
          <p className="text-muted-foreground flex items-center justify-center gap-2">
            <span>Drag & Drop | Progress Bar | Upload Mudah</span>
          </p>
        </header>
        
        <div className="space-y-6">
          {/* Upload Section */}
          <FileUpload
            onUploadStart={handleUploadStart}
            onUploadSuccess={handleUploadSuccess}
            onUploadError={handleUploadError}
          />


          {/* Help Section */}
          <div className="bg-gradient-accent border border-journal-border rounded-2xl p-6 shadow-xl">
            <div className="flex items-center gap-2 mb-4">
              <Lightbulb className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-bold text-foreground">Tips Upload</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">•</span>
                  <span>Drag & drop file langsung ke area upload untuk kemudahan</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">•</span>
                  <span>Judul opsional akan membantu pencarian file nantinya</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">•</span>
                  <span>Progress upload akan ditampilkan secara real-time</span>
                </li>
              </ul>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">•</span>
                  <span>Mendukung berbagai format: PDF, Word, ZIP, dll</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">•</span>
                  <span>Upload berhasil, Otomatis diarahkan ke daftar jurnal</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">•</span>
                  <span>File akan otomatis tersimpan dan bisa dicari dengan mudah</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Toast Container */}
      <ToastContainer toasts={toast.toasts} onRemove={toast.removeToast} />
    </Layout>
  );
}

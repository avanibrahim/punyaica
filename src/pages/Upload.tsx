import { useToast } from '@/hooks/useToast';
import { ToastContainer } from '@/components/Toast';
import { FileUpload } from '@/components/FileUpload';
import { Layout } from '@/components/Layout';
import { Upload as UploadIcon, Sparkles, Lightbulb } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Upload = () => {
  const toast = useToast();
  const navigate = useNavigate();

  // Handle upload success
  const handleUploadSuccess = () => {
    toast.success('Upload berhasil');
    // Redirect to journal list after successful upload
    setTimeout(() => {
      navigate('/');
    }, 1500);
  };

  // Handle upload error
  const handleUploadError = (error: string) => {
    toast.error(`Upload gagal: ${error}`);
  };

  // Handle upload start
  const handleUploadStart = () => {
    toast.info('Memulai upload...');
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <header className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-2">
            <UploadIcon className="h-8 w-8 text-primary" />
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">Upload File</h1>
          </div>
          <p className="text-muted-foreground flex items-center justify-center gap-2">
            <span>Drag & Drop</span>
            <Sparkles className="h-4 w-4" />
            <span>Progress Bar</span>
            <Sparkles className="h-4 w-4" />
            <span>Upload Mudah</span>
          </p>
        </header>

        <div className="space-y-6">
          {/* Upload Section */}
          <FileUpload 
            onUploadSuccess={handleUploadSuccess}
            onUploadError={handleUploadError}
            onUploadStart={handleUploadStart}
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
                  <span>Mendukung berbagai format: PDF, Word, Excel, Gambar, ZIP, dll</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">•</span>
                  <span>Setelah upload berhasil, Anda akan diarahkan ke daftar jurnal</span>
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
};

export default Upload;
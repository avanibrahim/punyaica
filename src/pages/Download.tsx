import { useState, useEffect } from 'react';
import { FileItem, BASE_URL } from '@/lib/fileUtils';
import { useToast } from '@/hooks/useToast';
import { ToastContainer } from '@/components/Toast';
import { FileList } from '@/components/FileList';
import { Layout } from '@/components/Layout';
import { Download as DownloadIcon, Sparkles, Info } from 'lucide-react';

const Download = () => {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSkeleton, setShowSkeleton] = useState(true);

  const toast = useToast();

  // Fetch all files from API
  const fetchFiles = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${BASE_URL}/api/files`);
      if (!response.ok) {
        throw new Error('Gagal memuat file');
      }
      
      const data: FileItem[] = await response.json();
      
      // Sort by upload date (newest first)
      const sortedFiles = data.sort((a, b) => 
        new Date(b.uploaded_at).getTime() - new Date(a.uploaded_at).getTime()
      );
      
      setFiles(sortedFiles);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchFiles().finally(() => {
      // Show skeleton for minimum 800ms for better UX
      setTimeout(() => setShowSkeleton(false), 800);
    });
  }, []);

  // Handle file deletion (optimistic update)
  const handleFileDelete = (id: number) => {
    setFiles(prev => prev.filter(file => file.id !== id));
    toast.success('File berhasil dihapus');
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <header className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-2">
            <DownloadIcon className="h-8 w-8 text-primary" />
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">Kelola File</h1>
          </div>
          <p className="text-muted-foreground flex items-center justify-center gap-2">
            <span>Download</span>
            <Sparkles className="h-4 w-4" />
            <span>Lihat</span>
            <Sparkles className="h-4 w-4" />
            <span>Hapus</span>
            <Sparkles className="h-4 w-4" />
            <span>Kelola Semua File</span>
          </p>
        </header>

        <div className="space-y-6">
          {/* Info Section */}
          <div className="bg-gradient-accent border border-journal-border rounded-2xl p-6 shadow-xl">
            <div className="flex items-center gap-2 mb-4">
              <Info className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-bold text-foreground">Kelola File Jurnal</h2>
            </div>
            <p className="text-muted-foreground mb-4">
              Halaman ini menampilkan semua file yang telah diupload. Anda dapat mendownload, melihat preview, 
              atau menghapus file sesuai kebutuhan.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-blue-700"><strong>Download:</strong> Unduh file ke perangkat</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-green-700"><strong>Lihat:</strong> Preview file di tab baru</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg border border-red-200">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-red-700"><strong>Hapus:</strong> Hapus file permanent</span>
              </div>
            </div>
          </div>

          {/* File List */}
          <FileList
            files={files}
            isLoading={isLoading}
            error={error}
            onRefresh={fetchFiles}
            onDelete={handleFileDelete}
            showSkeleton={showSkeleton}
          />
        </div>
      </div>

      {/* Toast Container */}
      <ToastContainer toasts={toast.toasts} onRemove={toast.removeToast} />
    </Layout>
  );
};

export default Download;
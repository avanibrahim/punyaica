import { useState, useEffect, ReactNode } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useToast } from '@/hooks/useToast';
import { ToastContainer } from '@/components/Toast';
import { SupabaseFileList as FileList } from '@/components/SupabaseFileList';
import Layout from '@/components/Layout';
import { Download as DownloadIcon, Sparkles, Info } from 'lucide-react';
import { listFiles, removeFile, type FileItem } from '@/lib/supaFiles';

// Reusable animated wrapper for sections
const AnimatedSection = ({ children, delay = 0, className = '' }: { children: ReactNode; delay?: number; className?: string }) => {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: false, amount: 0.2 }} // retrigger on scroll up/down
      variants={{
        hidden: { opacity: 0, y: reduce ? 0 : 24 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] },
        },
      }}
    >
      {children}
    </motion.div>
  );
};

// Simple item animation (useful for small cards/rows)
const AnimatedItem = ({ children, delay = 0, className = '' }: { children: ReactNode; delay?: number; className?: string }) => {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: reduce ? 0 : 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: false, amount: 0.2 }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
};

const Download = () => {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSkeleton, setShowSkeleton] = useState(true);

  const toast = useToast();

  const fetchFiles = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await listFiles(); // sudah order terbaru di helper
      setFiles(data);
    } catch (e: any) {
      setError(e?.message || 'Gagal memuat file');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles().finally(() => setTimeout(() => setShowSkeleton(false), 800));
  }, []);

  const handleFileDelete = async (id: number) => {
    const item = files.find((f) => f.id === id);
    if (!item) return;
    try {
      await removeFile(item);
      setFiles((prev) => prev.filter((f) => f.id !== id)); // optimistic
      toast.success('File berhasil dihapus');
    } catch (e: any) {
      toast.error(e?.message || 'Gagal menghapus file');
    }
  };

  return (
    <Layout>
      {/* Page fade-in */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <div className="max-w-6xl mx-auto px-4 py-8">
          {/* Header */}
          <AnimatedSection>
            <header className="text-center mb-8">
              <div className="flex items-center justify-center gap-3 mb-2">
                <h1 className="text-3xl md:text-4xl font-bold text-foreground">Download Jurnal</h1>
              </div>
              <p className="text-muted-foreground flex items-center justify-center gap-2">
                <span>Download Jurnal yang anda butuhkan hanya sekali klik.</span>
              </p>
            </header>
          </AnimatedSection>

          <div className="space-y-6">
            {/* Info Section */}
            <AnimatedSection>
              <div className="bg-gradient-accent border border-journal-border rounded-2xl p-6 shadow-xl">
                <div className="flex items-center gap-2 mb-4">
                  <Info className="h-5 w-5 text-primary" />
                  <h2 className="text-lg font-bold text-foreground">List Preview dan Download Jurnal</h2>
                </div>
                <p className="text-muted-foreground mb-4">
                  Halaman ini menampilkan semua file yang telah diupload. Anda dapat mendownload, melihat preview.
                </p>

                {/* Small cards with slight stagger */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <AnimatedItem>
                    <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                      <div className="w-3 h-3 bg-green-500 rounded-full" />
                      <span className="text-green-700"><strong>Download:</strong> Unduh file ke perangkat</span>
                    </div>
                  </AnimatedItem>
                  <AnimatedItem delay={0.08}>
                    <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                      <div className="w-3 h-3 bg-green-500 rounded-full" />
                      <span className="text-green-700"><strong>Lihat:</strong> Preview file di tab baru</span>
                    </div>
                  </AnimatedItem>
                </div>
              </div>
            </AnimatedSection>

            {/* File List (Supabase) */}
            <AnimatedSection>
              <FileList
                variant="download"
                files={files}
                isLoading={isLoading}
                error={error}
                onRefresh={fetchFiles}
                showSkeleton={showSkeleton}
              />
            </AnimatedSection>
          </div>
        </div>

        {/* Toast Container (subtle mount motion) */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <ToastContainer toasts={toast.toasts} onRemove={toast.removeToast} />
        </motion.div>
      </motion.div>
    </Layout>
  );
};

export default Download;

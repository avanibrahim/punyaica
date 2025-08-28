// src/pages/Upload.tsx
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload as UploadIcon, Sparkles, Lightbulb } from 'lucide-react';
import { motion, useAnimation, useInView } from 'framer-motion';

import Layout from '@/components/Layout';
import { useToast } from '@/hooks/useToast';
import { ToastContainer } from '@/components/Toast';
import FileUpload from '@/components/FileUpload';

// ⬇️ helper Supabase yang sudah kita buat sebelumnya
import { uploadFile } from '@/lib/supaFiles';

// ------- Animations helpers (smooth scroll down & up) -------
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const fadeUpSm = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

/**
 * Wrapper untuk membuat elemen beranimasi saat masuk/keluar viewport
 * - Tidak mengubah UI (hanya opacity & translateY)
 * - Animasi ulang saat scroll ke bawah atau ke atas (useInView + controls)
 */
function AnimateOnView({
  children,
  className,
  variants = fadeUp,
  amount = 0.25,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  variants?: any;
  amount?: number; // seberapa besar elemen harus terlihat untuk trigger
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const controls = useAnimation();
  const inView = useInView(ref, { amount });

  useEffect(() => {
    if (inView) controls.start('visible');
    else controls.start('hidden');
  }, [inView, controls]);

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={variants}
      transition={{ type: 'spring', stiffness: 120, damping: 20, mass: 0.6, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

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

  const handleUploadStart = () => {
    toast.info('Memulai upload...');
  };
  const handleUploadSuccess = () => {
    toast.success('Upload berhasil');
    setTimeout(() => navigate('/'), 1500);
  };
  const handleUploadError = (msg: string) => {
    toast.error(`Upload gagal: ${msg}`);
  };

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
      {/* Page container with subtle entrance */}
      <AnimateOnView className="max-w-6xl mx-auto px-4 py-8" variants={stagger}>
        {/* Header */}
        <AnimateOnView className="text-center mb-8" variants={stagger}>
          <motion.div className="flex items-center justify-center gap-3 mb-2" variants={fadeUp}>
            <motion.h1
              className="text-3xl md:text-4xl font-bold text-foreground"
              variants={fadeUp}
            >
              Unggah Jurnal Anda
            </motion.h1>
          </motion.div>
          <motion.p
            className="text-muted-foreground flex items-center justify-center gap-2"
            variants={fadeUpSm}
          >
            <span>Drag & Drop | Progress Bar | Upload Mudah</span>
          </motion.p>
        </AnimateOnView>

        <div className="space-y-6">
          {/* Upload Section */}
          <AnimateOnView variants={fadeUp}>
            <FileUpload
              onUploadStart={handleUploadStart}
              onUploadSuccess={handleUploadSuccess}
              onUploadError={handleUploadError}
            />
          </AnimateOnView>

          {/* Help Section */}
          <AnimateOnView
            className="bg-gradient-accent border border-journal-border rounded-2xl p-6 shadow-xl"
            variants={stagger}
          >
            <motion.div className="flex items-center gap-2 mb-4" variants={fadeUpSm}>
              <Lightbulb className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-bold text-foreground">Tips Upload</h2>
            </motion.div>

            <motion.div className="grid grid-cols-1 md:grid-cols-2 gap-4" variants={stagger}>
              <motion.ul className="space-y-3 text-sm text-muted-foreground" variants={stagger}>
                <motion.li className="flex items-start gap-2" variants={fadeUpSm}>
                  <span className="text-primary font-bold">•</span>
                  <span>Drag & drop file langsung ke area upload untuk kemudahan</span>
                </motion.li>
                <motion.li className="flex items-start gap-2" variants={fadeUpSm}>
                  <span className="text-primary font-bold">•</span>
                  <span>Judul opsional akan membantu pencarian file nantinya</span>
                </motion.li>
                <motion.li className="flex items-start gap-2" variants={fadeUpSm}>
                  <span className="text-primary font-bold">•</span>
                  <span>Progress upload akan ditampilkan secara real-time</span>
                </motion.li>
              </motion.ul>

              <motion.ul className="space-y-3 text-sm text-muted-foreground" variants={stagger}>
                <motion.li className="flex items-start gap-2" variants={fadeUpSm}>
                  <span className="text-primary font-bold">•</span>
                  <span>Mendukung berbagai format: PDF, Word, ZIP, dll</span>
                </motion.li>
                <motion.li className="flex items-start gap-2" variants={fadeUpSm}>
                  <span className="text-primary font-bold">•</span>
                  <span>Upload berhasil, Otomatis diarahkan ke daftar jurnal</span>
                </motion.li>
                <motion.li className="flex items-start gap-2" variants={fadeUpSm}>
                  <span className="text-primary font-bold">•</span>
                  <span>File akan otomatis tersimpan dan bisa dicari dengan mudah</span>
                </motion.li>
              </motion.ul>
            </motion.div>
          </AnimateOnView>
        </div>
      </AnimateOnView>

      {/* Toast Container */}
      <ToastContainer toasts={toast.toasts} onRemove={toast.removeToast} />
    </Layout>
  );
}

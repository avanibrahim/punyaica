import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { debounce } from '@/lib/fileUtils';
import { useToast } from '@/hooks/useToast';
import { ToastContainer } from '@/components/Toast';
import { SearchAndFilter } from '@/components/SearchAndFilter';
import { Layout } from '@/components/Layout';
import {
  listFiles,
  removeFile,
  type FileItem
} from '@/lib/supaFiles';
import { SupabaseFileList as FileList } from '@/components/SupabaseFileList';
import { BookOpen, FileText, Search, ShieldCheck, UploadCloud, List as ListIcon } from "lucide-react";

export default function JournalList() {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSkeleton, setShowSkeleton] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get('q') || '';
  const selectedType = searchParams.get('type') || '';

  const toast = useToast();

  // === Scroll-in animation super simple (tanpa framer-motion) ===
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>('.reveal');
    els.forEach((el) => {
      el.classList.add(
        'opacity-0',
        'translate-y-3',
        'transition-all',
        'duration-500',
        'will-change-transform'
      );
    });
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach(({ isIntersecting, target }) => {
          const el = target as HTMLElement;
          if (isIntersecting) {
            el.classList.remove('opacity-0', 'translate-y-3');
            el.classList.add('opacity-100', 'translate-y-0');
            io.unobserve(el);
          }
        });
      },
      { threshold: 0.15 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  const debouncedSearch = useCallback(
    debounce((q: string) => {
      const p = new URLSearchParams(searchParams);
      if (q) p.set('q', q);
      else p.delete('q');
      setSearchParams(p);
    }, 300),
    [searchParams, setSearchParams]
  );

  const handleSearchChange = (q: string) => debouncedSearch(q);
  const handleTypeChange = (t: string) => {
    const p = new URLSearchParams(searchParams);
    if (t) p.set('type', t);
    else p.delete('type');
    setSearchParams(p);
  };

  async function fetchFiles() {
    setIsLoading(true);
    setError(null);
    try {
      const data = await listFiles(searchQuery, selectedType);
      setFiles(data);
    } catch (e: any) {
      setError(e?.message || 'Gagal memuat file');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchFiles().finally(() => setTimeout(() => setShowSkeleton(false), 600));
  }, [searchQuery, selectedType]);

  const handleFileDelete = async (id: number) => {
    // Tidak dipakai saat preview-only, tetap ada untuk kompatibilitas
    const item = files.find((f) => f.id === id);
    if (!item) return;
    try {
      await removeFile(item);
      setFiles((prev) => prev.filter((f) => f.id !== id));
      toast.success('File berhasil dihapus');
    } catch (e: any) {
      toast.error(e?.message || 'Gagal menghapus');
    }
  };

  // pagination di sisi klien
  const paginated = useMemo(
    () => files.slice(0, currentPage * itemsPerPage),
    [files, currentPage]
  );
  const hasMore = files.length > currentPage * itemsPerPage;

  return (
<Layout>
<div className="pb-0">
  {/* HERO */}
  <section className="relative min-h-[70vh] pt-6 sm:pt-8 flex items-center justify-center md:justify-start overflow-hidden nature-pattern">
    <div className="absolute inset-0 bg-gradient-to-br from-green-200 to-green-50" />

    <div className="relative z-10 w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Grid: foto di kanan pada md+, tetap center di mobile */}
        <div className="grid items-center gap-6 md:gap-10 md:grid-cols-[1fr,auto] text-center md:text-left">
          {/* FOTO/LOGO — lebih kecil di mobile, besar di desktop */}
          <div className="order-1 md:order-2 flex justify-center md:justify-end">
            <div className="relative w-36 h-36 sm:w-44 sm:h-44 md:w-72 md:h-72 lg:w-96 lg:h-96 rounded-2xl overflow-hidden">
              <img
                src="/hmi.png"
                alt="Logo / Foto E-Journal"
                className="w-full h-full object-cover"
                loading="eager"
                decoding="async"
              />
              <span
                className="pointer-events-none absolute -z-10 inset-0 rounded-2xl"
                style={{ boxShadow: '0 0 120px 20px rgba(34,197,94,.28)' }}
              />
            </div>
          </div>

          {/* TEKS + CTA — di kiri pada md+, tetap center di mobile */}
          <div className="order-2 md:order-1 space-y-6 md:space-y-8 animate-fade-up">
            <h1 className="text-2xl sm:text-3xl md:text-5xl font-bold text-gray-800 leading-snug md:leading-tight">
              Manajemen
              <span className="block mt-2 md:mt-4 bg-gradient-to-r from-green-500 to-green-600 bg-clip-text text-transparent rounded-md">
                E-Journal
              </span>
            </h1>

            <p className="text-sm md:text-lg text-gray-700 max-w-3xl mx-auto md:mx-0 leading-snug md:leading-relaxed">
              Kelola, cari, filter, dan publikasikan jurnal dengan mudah. Semua berkas terpusat dan cepat ditemukan.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center md:justify-start items-center md:items-start">
              <a href="/upload">
                <button className="gradient-bg text-white px-5 py-3 md:px-8 md:py-4 text-sm md:text-lg font-semibold rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 inline-flex items-center gap-2 group">
                  Unggah Jurnal
                  <UploadCloud className="h-5 w-5 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </a>
              <a href="#list">
                <button className="px-5 py-3 md:px-8 md:py-4 text-sm md:text-lg font-semibold rounded-xl border-2 border-green-500 text-green-700 hover:bg-green-50 inline-flex items-center gap-2">
                  Lihat Daftar
                  <ListIcon className="h-5 w-5" />
                </button>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  {/* HEADER LIST */}
  <header id="list" className="text-center py-8 md:py-10">
    <h2 className="text-2xl md:text-4xl font-bold text-gray-900">Daftar Jurnal</h2>
    <p className="mt-2 text-sm md:text-base text-gray-600">
      Daftar, cari, filter, dan unggah jurnal terbaru — semua dalam satu tempat.
    </p>
  </header>

  {/* FILTER BAR */}
  <section className="z-20 px-4">
      <div className="p-3 md:p-5">
        <SearchAndFilter
          searchQuery={searchQuery}
          selectedType={selectedType}
          onSearchChange={handleSearchChange}
          onTypeChange={handleTypeChange}
        />
    </div>
  </section>

  {/* LIST */}
  <section className="px-4 mt-6">
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="p-3 md:p-4">
        <FileList
          files={paginated}
          isLoading={isLoading}
          error={error}
          onRefresh={fetchFiles}
          onDelete={handleFileDelete}
          showSkeleton={showSkeleton}
        />
      </div>
    </div>

    {hasMore && !isLoading && !error && (
      <div className="text-center mt-6">
        <button
          onClick={() => setCurrentPage((p) => p + 1)}
          className="gradient-bg text-white font-semibold rounded-xl px-5 py-3 md:px-6 md:py-3 text-sm md:text-base shadow-lg hover:shadow-xl transition-all inline-flex items-center gap-2"
        >
          Muat Lebih Banyak ({files.length - paginated.length} tersisa)
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"/></svg>
        </button>
      </div>
    )}
  </section>
</div>


  <ToastContainer toasts={toast.toasts} onRemove={toast.removeToast} />

  {/* util styles */}
  <style>{`
    .gradient-bg { background-image: linear-gradient(to right, #22c55e, #16a34a); }
    .nature-pattern {
      background:
        radial-gradient(900px 380px at -10% -10%, rgba(34,197,94,.22), transparent 60%),
        radial-gradient(700px 300px at 110% 110%, rgba(34,197,94,.16), transparent 60%);
    }
    .glass-effect { background: rgba(255,255,255,.7); backdrop-filter: blur(12px); }
    @media (prefers-color-scheme: dark) {
      .glass-effect { background: rgba(17,24,39,.6); border-color: rgba(255,255,255,.08); }
      .nature-pattern {
        background:
          radial-gradient(900px 380px at -10% -10%, rgba(34,197,94,.15), transparent 60%),
          radial-gradient(700px 300px at 110% 110%, rgba(34,197,94,.12), transparent 60%);
      }
    }
    .floating { animation: float 6s ease-in-out infinite; }
    .delay-5000 { animation-delay: 5s; }
    .delay-8000 { animation-delay: 8s; }
    @keyframes float { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-10px) } }
    .animate-fade-up { animation: fadeUp .7s ease-out both; }
    @keyframes fadeUp { from { opacity: 0; transform: translateY(18px) } to { opacity: 1; transform: translateY(0) } }
    .animate-pop { animation: pop .5s ease-out both; }
    @keyframes pop { from { transform: scale(.9); opacity: .6 } to { transform: scale(1); opacity: 1 } }
  `}</style>
</Layout>
  );
}


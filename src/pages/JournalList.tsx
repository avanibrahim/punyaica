import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { debounce } from '@/lib/fileUtils';
import { useToast } from '@/hooks/useToast';
import { ToastContainer } from '@/components/Toast';
import { SearchAndFilter } from '@/components/SearchAndFilter';
import  Layout  from '@/components/Layout';
import {
  listFiles,
  removeFile,
  type FileItem
} from '@/lib/supaFiles';
import { SupabaseFileList as FileList } from '@/components/SupabaseFileList';
import { UploadCloud, List, CheckCircle2, Shield, CloudUpload, FileDown } from "lucide-react";
import { BookOpen, FileText, Gauge, Cpu } from "lucide-react";

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

   const stats = [
    { label: "E‑Jurnal Terintegrasi", icon: BookOpen },
    { label: "Manajemen Artikel (OJS)", icon: FileText },
    { label: "Upload Jurnal", icon: CloudUpload },
    { label: "Download Jurnal", icon: FileDown },
    ];
    

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
  <section className="relative overflow-hidden pt-4 pb-8 sm:pt-12 sm:pb-20 md:pt-16 md:pb-24">
      {/* Background layers */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-100 via-green-50 to-white" />
        {/* glow */}
        <div className="absolute -top-24 -right-16 h-72 w-72 rounded-full bg-emerald-400/25 blur-3xl" aria-hidden />
        <div className="absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-emerald-300/20 blur-3xl" aria-hidden />
        {/* subtle grid */}
        <svg aria-hidden className="absolute inset-0 h-full w-full opacity-30 [mask-image:radial-gradient(ellipse_at_center,white,transparent_70%)]">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(16,185,129,0.15)" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-8 md:gap-12 md:grid-cols-2">
          {/* TEXT & CTA */}
          <div className="order-2 md:order-1 text-center md:text-left space-y-10 md:space-y-7">
            {/* Badge HMI */}
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-700 bg-white/70 px-3 py-1 text-emerald-700 shadow-sm backdrop-blur">
              <span className="text-xs font-semibold tracking-wide">HMI Gorontalo</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-[1.15] text-emerald-900">
              Manajemen <span className="whitespace-nowrap">Jurnal Ilmiah</span>
              <span className="block mt-2 md:mt-3 bg-gradient-to-r from-emerald-700 via-emerald-700 to-green-700 bg-clip-text text-transparent">
                Kader HMI
              </span>
            </h1>

            <p className="mx-auto md:mx-0 max-w-2xl text-emerald-700 text-sm sm:text-base md:text-lg leading-relaxed">
              Kelola, cari, filter, dan publikasikan jurnal dengan mudah. Semua berkas terpusat,
              terstruktur, dan cepat ditemukan untuk kebutuhan riset kader & komisariat.
            </p>

            {/* CTA */}
            <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-row sm:items-center md:items-start sm:justify-start sm:gap-4 pb-6">
              <a
                href="/upload"
                className="group inline-flex w-full justify-center sm:w-auto sm:justify-start items-center gap-2 rounded-xl px-5 py-3 md:px-7 md:py-3.5 text-sm md:text-base font-semibold text-white shadow-xl transition-all duration-300 gradient-bg hover:shadow-2xl"
              >
                Upload
              </a>

              <a
                href="#list"
                className="inline-flex w-full justify-center sm:w-auto sm:justify-start items-center gap-2 rounded-xl border-2 border-emerald-500 px-5 py-3 md:px-7 md:py-3.5 text-sm md:text-base font-semibold text-emerald-700 hover:bg-emerald-50"
              >
                Daftar
              </a>
            </div>

            {/* Feature bullets */}
            <ul className="mt-2 grid grid-cols-3 sm:grid-cols-3 gap-2 text-xs sm:text-sm text-emerald-700">
              <li className="inline-flex items-center gap-2 justify-center md:justify-start"><CheckCircle2 className="h-4 w-4 text-emerald-600" /> Pencarian Cepat</li>
              <li className="inline-flex items-center gap-2 justify-center md:justify-start"><CheckCircle2 className="h-4 w-4 text-emerald-600" /> Tag & Filter</li>
              <li className="inline-flex items-center gap-2 justify-center md:justify-start"><CheckCircle2 className="h-4 w-4 text-emerald-600" /> Publikasi Ringkas</li>
            </ul>
          </div>

          {/* IMAGE / LOGO */}
          <div className="order-1 md:order-2 flex justify-center md:justify-end">
            <div className="relative w-36 h-36 sm:w-44 sm:h-44 md:w-72 md:h-72 lg:w-96 lg:h-96 rounded-2xl overflow-hidden">
              <img
                src="/hmi.png"
                alt="Logo HMI / E‑Journal"
                className="h-full w-full object-contain p-3 md:p-6"
                loading="eager"
                decoding="async"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
    
          <section className="py-8 sm:py-10 bg-transparent border-t border-b border-emerald-100">
              <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
                  {stats.map(({ label, icon: Icon }, index) => (
                    <div key={index} className="text-center text-2xl md:text">
                    <div className="mb-1 md:mb-2">
                      {Icon && <Icon className="h-6 w-6 sm:h-7 sm:w-7 md:h-12 md:w-12 mx-auto" />}
                      </div>
                      <div className="text-emerald-900 text-xs sm:text-sm md:text-lg font-medium">{label}</div>
                    </div>
                  ))}
                </div>
              </div>
          </section>

      {/* HEADER LIST */}
      <header id="list" className="text-center py-8 md:py-10">
        <h2 className="text-2xl md:text-4xl font-bold text-emerald-900">Daftar Jurnal</h2>
        <p className="mt-2 text-sm md:text-base text-emerald-600">
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
    <div className="rounded-2xl border border-emerald-200 bg-white shadow-sm">
      <div className="p-3 md:p-4">
      <FileList
        variant="home"
        files={paginated}
        isLoading={isLoading}
        error={error}
        onRefresh={fetchFiles}
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


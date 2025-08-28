import React, { useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error('404 Error: User attempted to access non-existent route:', location.pathname);
  }, [location.pathname]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-emerald-100">
      {/* decorative glows */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-emerald-400/25 blur-3xl" aria-hidden />
        <div className="absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-green-500/20 blur-3xl" aria-hidden />
        {/* subtle grid */}
        <svg aria-hidden className="absolute inset-0 h-full w-full opacity-25 [mask-image:radial-gradient(ellipse_at_center,white,transparent_70%)]">
          <defs>
            <pattern id="grid404" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(16,185,129,0.12)" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid404)" />
        </svg>
      </div>

      <main className="relative mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center px-6 py-10 text-center">
        {/* Logo / emblem */}
        <div className="mb-6 flex items-center justify-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-emerald-200 bg-white/80 shadow-sm backdrop-blur">
            <img src="/hmi.png" alt="HMI" className="h-14 w-14 object-contain p-1" />
          </div>
        </div>

        {/* Big 404 */}
        <h1 className="bg-gradient-to-r from-emerald-700 via-emerald-600 to-green-700 bg-clip-text text-6xl font-extrabold tracking-tight text-transparent sm:text-7xl">
          404
        </h1>
        <p className="mt-3 text-base text-emerald-900/80 sm:text-lg">Oops! Halaman tidak ditemukan</p>
        <p className="mt-1 text-xs text-emerald-800/60 sm:text-sm">
          Route <span className="font-mono text-emerald-900/80">{location.pathname}</span> tidak tersedia.
        </p>

        {/* Actions */}
        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="rounded-xl border border-emerald-600/40 bg-white/70 px-4 py-2 text-sm font-semibold text-emerald-700 shadow-sm backdrop-blur transition hover:bg-emerald-50 hover:shadow"
          >
            Kembali
          </button>
          <Link
            to="/"
            className="rounded-xl bg-emerald-700 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-800 hover:shadow"
          >
            Ke Beranda
          </Link>
        </div>

        {/* tips / footer */}
        <div className="mt-8 text-xs text-emerald-900/60">
          Himpunan Mahasiswa Islam • E‑Journal
        </div>
      </main>
    </div>
  );
};

export default NotFound;

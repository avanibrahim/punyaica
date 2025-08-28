// src/components/Navbar.tsx
import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import Checkbox from "./CheckBox";

export type IconType = React.ComponentType<{ className?: string }>;
export type NavItem = { path: string; label: string; icon?: IconType };

type Props = {
  navItems?: NavItem[];
  logoSrc?: string;
  brandName?: string;
  tagline?: string;
  cta?: { path: string; label: string } | null;
};

function Navbar({
  navItems = [],
  logoSrc = "/logo.png",
  brandName = "E-Journal HMI",
  tagline = "Kelola Jurnal dengan mudah",
  cta = null,
}: Props) {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Simpan posisi Y terakhir + raf id untuk throttling
  const lastY = useRef(0);
  const rafId = useRef<number | null>(null);

  // Tutup panel mobile saat route berubah
  useEffect(() => setOpen(false), [location.pathname]);

  // Auto-hide saat scroll
  useEffect(() => {
    if (typeof window === "undefined") return;
    lastY.current = window.scrollY || 0;

    const onScroll = () => {
      if (rafId.current !== null) return; // throttle via rAF
      rafId.current = window.requestAnimationFrame(() => {
        const y = window.scrollY || 0;
        const delta = y - lastY.current;
        const abs = Math.abs(delta);

        setScrolled(y > 2);

        // Stabilkan: abaikan gerakan sangat kecil (<5px)
        if (abs > 5) {
          if (delta > 0 && y > 72 && !open) {
            // Scroll down -> sembunyikan
            setHidden(true);
          } else if (delta < 0 || y <= 0) {
            // Scroll up / sampai atas -> tampilkan
            setHidden(false);
          }
        }

        lastY.current = y;
        if (rafId.current) {
          cancelAnimationFrame(rafId.current);
          rafId.current = null;
        }
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (rafId.current) cancelAnimationFrame(rafId.current);
      rafId.current = null;
    };
  }, [open]);

  // Jangan sembunyikan saat panel mobile terbuka
  useEffect(() => {
    if (open) setHidden(false);
  }, [open]);

  const isActive = (p: string) => location.pathname === p;

  return (
    <nav
      className={[
        "sticky top-0 z-50 border-b border-journal-border ring-1 ring-black/5",
        "transition-[transform,opacity,background-color,backdrop-filter] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform",
        hidden ? "-translate-y-full opacity-0" : "translate-y-0 opacity-100",
        scrolled ? "bg-navbar-bg/95 backdrop-blur-md shadow-md" : "bg-navbar-bg/80 backdrop-blur-sm shadow-sm",
      ].join(" ")}
      aria-hidden={hidden}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-16 md:h-20 flex items-center justify-between">
          {/* Brand */}
          <Link to="/" className="flex items-center gap-2 md:gap-3 group min-w-0">
            <div className="p-1.5 md:p-2 rounded-lg transition-transform group-hover:scale-105">
              <img
                src={logoSrc}
                alt="Logo"
                className="h-9 md:h-12 w-auto transition-transform group-hover:scale-105"
                loading="eager"
                decoding="async"
              />
            </div>
            <div className="block min-w-0">
              <h1 className="text-base md:text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent tracking-tight leading-tight truncate">
                {brandName}
              </h1>
              <p className="text-[10px] md:text-xs text-muted-foreground leading-tight truncate">
                {tagline}
              </p>
            </div>
          </Link>

          {/* Desktop */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all duration-200
                ${
                  isActive(path)
                    ? "bg-primary text-primary-foreground shadow-lg"
                    : "text-muted-foreground hover:text-foreground hover:bg-journal-card-hover"
                }`}
              >
                {Icon && <Icon className="h-4 w-4" />}
                {label}
              </Link>
            ))}
            {cta && (
              <Link
                to={cta.path}
                className="ml-2 rounded-xl px-4 py-2.5 font-semibold bg-primary text-primary-foreground shadow hover:shadow-lg transition-all"
              >
                {cta.label}
              </Link>
            )}
          </div>

          {/* Mobile toggle — FIX#1: benar-benar hidden di desktop */}
          <div className="md:hidden">
            <Checkbox
              checked={open}
              onChange={setOpen}
              ariaLabel="Toggle mobile menu"
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-journal-card-hover transition-colors"
              barClassName="bg-current"
              aria-expanded={open}
              aria-controls="mobile-nav"
            />
          </div>
        </div>
      </div>

      {/* Mobile panel — FIX#2: animasi halus pake transform + opacity */}
      <div
        id="mobile-nav"
        className={[
          "md:hidden overflow-hidden border-t border-journal-border",
          "origin-top will-change-transform",
          "transition-[transform,opacity] duration-300 ease-out",
          open
            ? "opacity-100 scale-y-100 translate-y-0 h-auto pointer-events-auto"
            : "opacity-0 scale-y-0 -translate-y-1 h-0 pointer-events-none",
              ].join(" ")}
              aria-hidden={!open}
            >
            <div className="px-4 sm:px-6 lg:px-8 py-2 md:py-3">
              <div className="space-y-1">
                {navItems.map(({ path, label, icon: Icon }) => (
                  <Link
                    key={path}
                    to={path}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200
                    ${
                      isActive(path)
                        ? "bg-primary text-primary-foreground shadow-lg"
                        : "text-muted-foreground hover:text-foreground hover:bg-journal-card-hover"
                    }`}
                  >
                    {Icon && <Icon className="h-4 w-4" />}
                    {label}
                  </Link>
                ))}
                {cta && (
                  <Link
                    to={cta.path}
                    className="block mt-2 rounded-xl px-4 py-3 font-semibold bg-primary text-primary-foreground text-center shadow hover:shadow-lg transition-all"
                  >
                    {cta.label}
                  </Link>
                )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
export { Navbar as Navigation };

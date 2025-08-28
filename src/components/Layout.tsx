// src/components/Layout.tsx
import { type ReactNode } from "react";
import Navbar, { type NavItem } from "./Navbar";
import { Footer } from "./Footer";
import { Home, UploadCloud, Download } from "lucide-react";

const items: NavItem[] = [
  { path: "/",         label: "Beranda",       icon: Home },
  { path: "/upload",   label: "Upload",        icon: UploadCloud },
  { path: "/download", label: "Download",      icon: Download },
];

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-journal-bg flex flex-col">
      <Navbar navItems={items} />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

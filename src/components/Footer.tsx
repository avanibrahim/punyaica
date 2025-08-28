import { Heart, Github, Mail, Sparkles } from 'lucide-react';

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-journal-border mt-16">
    <div className="max-w-7xl mx-auto px-6 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Brand */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="p-2">
            <img
            src="logo.png"
            alt="Logo e‑Journal"
            className="h-10 w-auto group-hover:scale-105 transition-transform"
            loading="eager"
            decoding="async"
            />
            </div>
            <h3 className="text-lg font-bold bg-gradient-primary bg-clip-text text-transparent">
              E-Journal HMI
            </h3>
          </div>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Platform arsip digital Himpunan Mahasiswa Islam. Kelola SK, notulen, buletin,
            dan dokumen kaderisasi secara rapi, terstruktur, dan mudah diakses kader.
          </p>
        </div>
  
        {/* Features */}
        <div>
          <h4 className="font-semibold text-foreground mb-4">Fitur untuk Kader</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
              Unggah arsip komisariat & cabang
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
              Pencarian cepat berdasar periode & jenis dokumen
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
              Pratinjau dokumen & unduh instan
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
              Responsif untuk sekretariat & kegiatan lapangan
            </li>
          </ul>
        </div>
  
        {/* Contact */}
        <div>
          <h4 className="font-semibold text-foreground mb-4">Kontak HMI</h4>
          <div className="space-y-3">
            <a
              href="mailto:sekretariat@hmi.or.id"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors group"
            >
              <Mail className="h-4 w-4 group-hover:scale-110 transition-transform" />
              sekretariat@hmi.or.id
            </a>
          </div>
        </div>
      </div>
  
      {/* Bottom */}
      <div className="mt-8 pt-8 border-t border-journal-border">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © {currentYear} Himpunan Mahasiswa Islam - E-Journal.
          </p>
        </div>
      </div>
    </div>
  </footer>
  
  );
};
import { Heart, Github, Mail, Sparkles } from 'lucide-react';

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-secondary border-t border-journal-border mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-gradient-primary rounded-lg shadow-lg">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-lg font-bold bg-gradient-primary bg-clip-text text-transparent">
                Manajer Jurnal
              </h3>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Aplikasi modern untuk mengelola jurnal dan dokumen Anda dengan mudah. 
              Upload, cari, dan download file dengan antarmuka yang intuitif.
            </p>
          </div>

          {/* Features */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Fitur Unggulan</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                Upload dengan drag & drop
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                Pencarian dan filter cerdas
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                Preview dan download mudah
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                Antarmuka responsif
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Hubungi Kami</h4>
            <div className="space-y-3">
              <a 
                href="mailto:support@jurnalmanager.com" 
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors group"
              >
                <Mail className="h-4 w-4 group-hover:scale-110 transition-transform" />
                support@jurnalmanager.com
              </a>
              <a 
                href="https://github.com/jurnalmanager" 
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors group"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Github className="h-4 w-4 group-hover:scale-110 transition-transform" />
                GitHub Repository
              </a>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-8 pt-8 border-t border-journal-border">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © {currentYear} Manajer Jurnal. Semua hak dilindungi.
            </p>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <span>Dibuat dengan</span>
              <Heart className="h-4 w-4 text-red-500 fill-current" />
              <span>menggunakan React & Tailwind CSS</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
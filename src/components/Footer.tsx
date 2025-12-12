import { MapPin, Phone, Clock, Instagram, Facebook, Send } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-foreground py-12 sm:py-16 text-primary-foreground">
      <div className="container px-4">
        <div className="grid gap-8 sm:gap-10 md:grid-cols-3">
          {/* Brand */}
          <div>
            <Link to="/" className="inline-flex items-center gap-2 mb-4">
              <span className="text-2xl">🚀</span>
              <h3 className="text-xl sm:text-2xl font-bold">
                <span className="text-primary">GELIS</span> DELIVERY
              </h3>
            </Link>
            <p className="mb-6 text-primary-foreground/70 text-sm sm:text-base leading-relaxed">
              Layanan pesan antar makanan terpercaya dengan pilihan menu lezat dan pengiriman cepat ke lokasi Anda.
            </p>
            <div className="flex gap-3">
              <a
                href="#"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-foreground/10 transition-all hover:bg-primary hover:scale-110"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-foreground/10 transition-all hover:bg-primary hover:scale-110"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="https://wa.me/6281234567890"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-foreground/10 transition-all hover:bg-accent hover:scale-110"
                aria-label="WhatsApp"
              >
                <Send className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Kontak */}
          <div>
            <h4 className="mb-4 text-lg font-bold">Kontak</h4>
            <ul className="space-y-3 sm:space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-5 w-5 text-primary flex-shrink-0" />
                <span className="text-primary-foreground/70 text-sm sm:text-base">
                  Jl. Contoh Alamat No. 123, Kota Anda
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-primary flex-shrink-0" />
                <a href="tel:+6281234567890" className="text-primary-foreground/70 hover:text-primary transition-colors text-sm sm:text-base">
                  +62 812 3456 7890
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-primary flex-shrink-0" />
                <span className="text-primary-foreground/70 text-sm sm:text-base">
                  Setiap Hari: 10:00 - 22:00
                </span>
              </li>
            </ul>
          </div>

          {/* Info */}
          <div>
            <h4 className="mb-4 text-lg font-bold">Informasi</h4>
            <ul className="space-y-2 sm:space-y-3">
              <li>
                <Link to="/" className="text-primary-foreground/70 transition-colors hover:text-primary text-sm sm:text-base">
                  Beranda
                </Link>
              </li>
              <li>
                <Link to="/auth" className="text-primary-foreground/70 transition-colors hover:text-primary text-sm sm:text-base">
                  Login / Daftar
                </Link>
              </li>
              <li>
                <a href="#" className="text-primary-foreground/70 transition-colors hover:text-primary text-sm sm:text-base">
                  Cara Pemesanan
                </a>
              </li>
              <li>
                <a href="#" className="text-primary-foreground/70 transition-colors hover:text-primary text-sm sm:text-base">
                  FAQ
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 sm:mt-12 border-t border-primary-foreground/10 pt-6 sm:pt-8 text-center">
          <p className="text-primary-foreground/50 text-xs sm:text-sm">
            © {currentYear} GELIS DELIVERY. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

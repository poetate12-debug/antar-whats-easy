import { MapPin, Phone, Clock, Instagram, Facebook } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-foreground py-16 text-primary-foreground">
      <div className="container px-4">
        <div className="grid gap-10 md:grid-cols-3">
          {/* Brand */}
          <div>
            <h3 className="mb-4 text-2xl font-bold">
              <span className="text-primary">Antar</span>Rasa
            </h3>
            <p className="mb-6 text-primary-foreground/70">
              Layanan pesan antar makanan terpercaya dengan pilihan menu lezat dan pengiriman cepat ke lokasi Anda.
            </p>
            <div className="flex gap-4">
              <a
                href="#"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-foreground/10 transition-colors hover:bg-primary"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-foreground/10 transition-colors hover:bg-primary"
              >
                <Facebook className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Kontak */}
          <div>
            <h4 className="mb-4 text-lg font-bold">Kontak</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="mt-1 h-5 w-5 text-primary" />
                <span className="text-primary-foreground/70">
                  Jl. Contoh Alamat No. 123, Kota Anda
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-primary" />
                <span className="text-primary-foreground/70">
                  +62 812 3456 7890
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-primary" />
                <span className="text-primary-foreground/70">
                  Setiap Hari: 10:00 - 22:00
                </span>
              </li>
            </ul>
          </div>

          {/* Info */}
          <div>
            <h4 className="mb-4 text-lg font-bold">Informasi</h4>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-primary-foreground/70 transition-colors hover:text-primary">
                  Tentang Kami
                </a>
              </li>
              <li>
                <a href="#menu" className="text-primary-foreground/70 transition-colors hover:text-primary">
                  Menu
                </a>
              </li>
              <li>
                <a href="#" className="text-primary-foreground/70 transition-colors hover:text-primary">
                  Cara Pemesanan
                </a>
              </li>
              <li>
                <a href="#" className="text-primary-foreground/70 transition-colors hover:text-primary">
                  FAQ
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-primary-foreground/10 pt-8 text-center">
          <p className="text-primary-foreground/50">
            © {new Date().getFullYear()} AntarRasa. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

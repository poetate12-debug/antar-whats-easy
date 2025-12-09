import { Button } from "@/components/ui/button";
import { ChevronDown, Bike, Clock, MapPin } from "lucide-react";
import heroImage from "@/assets/hero-food.jpg";

const HeroSection = () => {
  const scrollToMenu = () => {
    document.getElementById("menu")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative min-h-screen overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt="Makanan lezat"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-foreground/70 via-foreground/50 to-background" />
      </div>

      {/* Content */}
      <div className="container relative z-10 flex min-h-screen flex-col items-center justify-center px-4 py-20 text-center">
        <div className="animate-fade-up">
          <span className="mb-4 inline-block rounded-full bg-primary/20 px-4 py-2 text-sm font-semibold text-primary-foreground backdrop-blur-sm">
            🚀 Gratis Ongkir untuk Radius 3km!
          </span>
        </div>
        
        <h1 className="animate-fade-up mb-6 text-4xl font-extrabold leading-tight text-primary-foreground md:text-6xl lg:text-7xl" style={{ animationDelay: "0.1s" }}>
          Pesan Makanan Favoritmu,
          <br />
          <span className="text-primary">Langsung ke WhatsApp!</span>
        </h1>
        
        <p className="animate-fade-up mb-8 max-w-2xl text-lg text-primary-foreground/80 md:text-xl" style={{ animationDelay: "0.2s" }}>
          Nikmati berbagai pilihan makanan lezat dengan layanan pesan antar cepat dan mudah. Cukup pilih menu, langsung terhubung ke WhatsApp!
        </p>

        <div className="animate-fade-up flex flex-col gap-4 sm:flex-row" style={{ animationDelay: "0.3s" }}>
          <Button variant="hero" size="lg" onClick={scrollToMenu}>
            Lihat Menu
            <ChevronDown className="h-5 w-5" />
          </Button>
          <Button variant="outline" size="lg" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground">
            Tentang Kami
          </Button>
        </div>

        {/* Features */}
        <div className="animate-fade-up mt-16 grid grid-cols-1 gap-6 sm:grid-cols-3" style={{ animationDelay: "0.4s" }}>
          <div className="flex items-center gap-3 rounded-xl bg-card/80 backdrop-blur-sm px-6 py-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Bike className="h-6 w-6 text-primary" />
            </div>
            <div className="text-left">
              <p className="font-bold text-foreground">Pengiriman Cepat</p>
              <p className="text-sm text-muted-foreground">30-45 menit</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl bg-card/80 backdrop-blur-sm px-6 py-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Clock className="h-6 w-6 text-primary" />
            </div>
            <div className="text-left">
              <p className="font-bold text-foreground">Buka Setiap Hari</p>
              <p className="text-sm text-muted-foreground">10:00 - 22:00</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl bg-card/80 backdrop-blur-sm px-6 py-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <MapPin className="h-6 w-6 text-primary" />
            </div>
            <div className="text-left">
              <p className="font-bold text-foreground">Area Delivery</p>
              <p className="text-sm text-muted-foreground">Radius 5 km</p>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce-slow">
        <ChevronDown className="h-8 w-8 text-primary-foreground/50" />
      </div>
    </section>
  );
};

export default HeroSection;

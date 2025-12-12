import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { wilayahData } from "@/data/wilayah";
import { warungData, getWarungByWilayahId } from "@/data/warung";
import WarungCard from "@/components/WarungCard";
import NavHeader from "@/components/NavHeader";
import Footer from "@/components/Footer";
import FloatingWhatsApp from "@/components/FloatingWhatsApp";
import PopularMenuSlider from "@/components/PopularMenuSlider";
import InstallPWAButton from "@/components/InstallPWAButton";
import { useCart } from "@/hooks/useCart";
import { Search, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";

const Home = () => {
  const navigate = useNavigate();
  const { totalItems } = useCart();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedWilayah, setSelectedWilayah] = useState<string | null>(null);

  const activeWilayah = wilayahData.filter((w) => w.isActive);

  const filteredWarungs = useMemo(() => {
    let warungs = warungData.filter((w) => w.isActive);
    
    if (selectedWilayah) {
      warungs = warungs.filter((w) => w.wilayahId === selectedWilayah);
    }
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      warungs = warungs.filter(
        (w) =>
          w.nama.toLowerCase().includes(query) ||
          (w.deskripsi && w.deskripsi.toLowerCase().includes(query))
      );
    }
    
    return warungs;
  }, [selectedWilayah, searchQuery]);

  const getWilayahName = (wilayahId: string) => {
    const wilayah = wilayahData.find((w) => w.id === wilayahId);
    return wilayah?.nama || "";
  };

  return (
    <div className="min-h-screen flex flex-col">
      <NavHeader cartCount={totalItems} />

      <main className="flex-grow">
        <div className="container mx-auto px-4 py-8">
          {/* Hero Section */}
          <div className="text-center mb-6 animate-fade-up">
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold text-foreground mb-2 sm:mb-4">
              Pesan Makanan, <span className="text-primary">Antar Cepat!</span>
            </h1>
            <p className="text-sm sm:text-lg text-muted-foreground max-w-2xl mx-auto mb-4">
              Pilih wilayah Anda untuk melihat warung-warung makan terdekat
            </p>
            
            {/* Search Bar with PWA Install Button */}
            <div className="max-w-md mx-auto flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Cari warung atau menu..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-12 text-base rounded-full border-2 border-border focus:border-primary"
                />
              </div>
              <InstallPWAButton />
            </div>
          </div>

          {/* Wilayah Pills */}
          <div className="mb-4 sm:mb-6">
            <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2">
              <button
                onClick={() => setSelectedWilayah(null)}
                className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all flex items-center gap-1 ${
                  selectedWilayah === null
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                Semua
              </button>
              {activeWilayah.map((wilayah) => {
                const warungCount = getWarungByWilayahId(wilayah.id).length;
                return (
                  <button
                    key={wilayah.id}
                    onClick={() => setSelectedWilayah(wilayah.id)}
                    className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all flex items-center gap-1 ${
                      selectedWilayah === wilayah.id
                        ? "bg-primary text-primary-foreground shadow-md"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    {wilayah.nama}
                    <span className="bg-background/20 px-1.5 py-0.5 rounded-full text-[10px]">
                      {warungCount}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Popular Menu Slider */}
          <PopularMenuSlider />

          {/* Warung List */}
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-foreground mb-3">
              {selectedWilayah
                ? `Warung di ${getWilayahName(selectedWilayah)}`
                : "Semua Warung"}
              <span className="text-muted-foreground font-normal text-sm ml-2">
                ({filteredWarungs.length})
              </span>
            </h2>

            {filteredWarungs.length > 0 ? (
              <div className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-4">
                {filteredWarungs.map((warung, index) => {
                  const wilayah = wilayahData.find((w) => w.id === warung.wilayahId);
                  return (
                    <div
                      key={warung.id}
                      className="animate-fade-up"
                      style={{ animationDelay: `${index * 30}ms` }}
                    >
                      <WarungCard
                        warung={warung}
                        ongkir={wilayah?.ongkir || 0}
                        onClick={() => navigate(`/warung/${warung.id}`)}
                      />
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <p className="text-lg">Tidak ada warung ditemukan</p>
                <p className="text-sm mt-2">Coba ubah kata kunci pencarian</p>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
      <FloatingWhatsApp />
    </div>
  );
};

export default Home;

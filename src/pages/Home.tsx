import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { wilayahData } from "@/data/wilayah";
import { warungData, getWarungByWilayahId } from "@/data/warung";
import WilayahCard from "@/components/WilayahCard";
import WarungCard from "@/components/WarungCard";
import NavHeader from "@/components/NavHeader";
import Footer from "@/components/Footer";
import FloatingWhatsApp from "@/components/FloatingWhatsApp";
import { useCart } from "@/hooks/useCart";
import { Search, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { formatPrice } from "@/lib/whatsapp";

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
          w.deskripsi.toLowerCase().includes(query)
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
          <div className="text-center mb-8 animate-fade-up">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Pesan Makanan, <span className="text-primary">Antar Cepat!</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-6">
              Pilih wilayah Anda untuk melihat warung-warung makan terdekat
            </p>
            
            {/* Search Bar */}
            <div className="max-w-md mx-auto relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Cari warung atau menu..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12 text-base rounded-full border-2 border-border focus:border-primary"
              />
            </div>
          </div>

          {/* Wilayah Pills */}
          <div className="mb-8">
            <div className="flex flex-wrap justify-center gap-3">
              <button
                onClick={() => setSelectedWilayah(null)}
                className={`px-5 py-3 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
                  selectedWilayah === null
                    ? "bg-primary text-primary-foreground shadow-lg"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                <MapPin className="w-4 h-4" />
                Terdekat
              </button>
              {activeWilayah.map((wilayah) => {
                const warungCount = getWarungByWilayahId(wilayah.id).length;
                return (
                  <button
                    key={wilayah.id}
                    onClick={() => setSelectedWilayah(wilayah.id)}
                    className={`px-5 py-3 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
                      selectedWilayah === wilayah.id
                        ? "bg-primary text-primary-foreground shadow-lg"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    <MapPin className="w-4 h-4" />
                    {wilayah.nama}
                    <span className="bg-background/20 px-2 py-0.5 rounded-full text-xs">
                      {warungCount}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Warung List */}
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-4">
              {selectedWilayah
                ? `Warung di ${getWilayahName(selectedWilayah)}`
                : "Warung Terdekat"}
              <span className="text-muted-foreground font-normal text-lg ml-2">
                ({filteredWarungs.length} warung)
              </span>
            </h2>

            {filteredWarungs.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredWarungs.map((warung, index) => {
                  const wilayah = wilayahData.find((w) => w.id === warung.wilayahId);
                  return (
                    <div
                      key={warung.id}
                      className="animate-fade-up"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <WarungCard
                        warung={warung}
                        wilayahNama={wilayah?.nama || ""}
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

import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import WarungCard from "@/components/WarungCard";
import NavHeader from "@/components/NavHeader";
import BottomNavigation from "@/components/BottomNavigation";

import PopularMenuSlider from "@/components/PopularMenuSlider";
import InstallPWAButton from "@/components/InstallPWAButton";
import { useCart } from "@/hooks/useCart";
import { Search, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

interface Wilayah {
  id: string;
  nama: string;
  slug: string;
  ongkir: number;
}

interface Warung {
  id: string;
  nama: string;
  alamat: string;
  deskripsi: string | null;
  foto_url: string | null;
  rating: number | null;
  total_reviews: number | null;
  wilayah_id: string;
  wilayah?: Wilayah;
}

const Home = () => {
  const navigate = useNavigate();
  const { totalItems } = useCart();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedWilayah, setSelectedWilayah] = useState<string | null>(null);
  const [wilayahs, setWilayahs] = useState<Wilayah[]>([]);
  const [warungs, setWarungs] = useState<Warung[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      // Fetch wilayahs
      const { data: wilayahData } = await supabase
        .from('wilayahs')
        .select('id, nama, slug, ongkir')
        .eq('is_active', true)
        .order('nama');

      if (wilayahData) {
        setWilayahs(wilayahData);
      }

      // Fetch warungs with wilayah info
      const { data: warungData } = await supabase
        .from('warungs')
        .select(`
          id,
          nama,
          alamat,
          deskripsi,
          foto_url,
          rating,
          total_reviews,
          wilayah_id,
          wilayah:wilayahs(id, nama, slug, ongkir)
        `)
        .eq('is_active', true)
        .order('nama');

      if (warungData) {
        setWarungs(warungData as unknown as Warung[]);
      }

      setIsLoading(false);
    };

    fetchData();
  }, []);

  // Count warungs per wilayah
  const warungCountByWilayah = useMemo(() => {
    const counts: Record<string, number> = {};
    warungs.forEach((w) => {
      counts[w.wilayah_id] = (counts[w.wilayah_id] || 0) + 1;
    });
    return counts;
  }, [warungs]);

  const filteredWarungs = useMemo(() => {
    let filtered = warungs;
    
    if (selectedWilayah) {
      filtered = filtered.filter((w) => w.wilayah_id === selectedWilayah);
    }
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (w) =>
          w.nama.toLowerCase().includes(query) ||
          (w.deskripsi && w.deskripsi.toLowerCase().includes(query))
      );
    }
    
    return filtered;
  }, [warungs, selectedWilayah, searchQuery]);

  const getWilayahName = (wilayahId: string) => {
    const wilayah = wilayahs.find((w) => w.id === wilayahId);
    return wilayah?.nama || "";
  };

  return (
    <div className="min-h-screen flex flex-col pb-16">
      <NavHeader cartCount={totalItems} />

      <main className="flex-grow">
        <div className="container mx-auto px-4 py-6 sm:py-8">
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

          {/* Wilayah Filter */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <MapPin className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-foreground">Pilih Wilayah</span>
            </div>
            <div className="relative">
              <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 -mx-4 px-4">
                {/* All button */}
                <button
                  onClick={() => setSelectedWilayah(null)}
                  className={`flex-shrink-0 px-4 py-2.5 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-2 border ${
                    selectedWilayah === null
                      ? "bg-primary text-primary-foreground border-primary shadow-button"
                      : "bg-card text-foreground border-border hover:border-primary/50 hover:bg-primary/5"
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-current opacity-60" />
                  Semua
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                    selectedWilayah === null 
                      ? "bg-primary-foreground/20 text-primary-foreground" 
                      : "bg-muted text-muted-foreground"
                  }`}>
                    {warungs.length}
                  </span>
                </button>
                
                {/* Wilayah buttons */}
                {wilayahs.map((wilayah) => {
                  const warungCount = warungCountByWilayah[wilayah.id] || 0;
                  const isSelected = selectedWilayah === wilayah.id;
                  return (
                    <button
                      key={wilayah.id}
                      onClick={() => setSelectedWilayah(wilayah.id)}
                      className={`flex-shrink-0 px-4 py-2.5 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-2 border ${
                        isSelected
                          ? "bg-primary text-primary-foreground border-primary shadow-button"
                          : "bg-card text-foreground border-border hover:border-primary/50 hover:bg-primary/5"
                      }`}
                    >
                      {wilayah.nama}
                      <span className={`text-xs px-1.5 py-0.5 rounded-full min-w-[20px] text-center ${
                        isSelected 
                          ? "bg-primary-foreground/20 text-primary-foreground" 
                          : "bg-muted text-muted-foreground"
                      }`}>
                        {warungCount}
                      </span>
                    </button>
                  );
                })}
              </div>
              
              {/* Gradient fade indicators */}
              <div className="absolute left-0 top-0 bottom-2 w-8 bg-gradient-to-r from-background to-transparent pointer-events-none" />
              <div className="absolute right-0 top-0 bottom-2 w-8 bg-gradient-to-l from-background to-transparent pointer-events-none" />
            </div>
          </div>

          {/* Popular Menu Slider */}
          <PopularMenuSlider selectedWilayah={selectedWilayah} />

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

            {isLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="aspect-[4/3] rounded-xl" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                ))}
              </div>
            ) : filteredWarungs.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-4">
                {filteredWarungs.map((warung, index) => (
                  <div
                    key={warung.id}
                    className="animate-fade-up"
                    style={{ animationDelay: `${index * 30}ms` }}
                  >
                    <WarungCard
                      warung={{
                        id: warung.id,
                        wilayahId: warung.wilayah_id,
                        nama: warung.nama,
                        alamat: warung.alamat,
                        foto: warung.foto_url || undefined,
                        deskripsi: warung.deskripsi || undefined,
                        rating: warung.rating || undefined,
                        noWa: '',
                        isActive: true,
                      }}
                      ongkir={warung.wilayah?.ongkir || 0}
                      onClick={() => navigate(`/warung/${warung.id}`)}
                    />
                  </div>
                ))}
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

      
      <BottomNavigation />
    </div>
  );
};

export default Home;

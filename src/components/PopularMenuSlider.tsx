import { useRef } from "react";
import { ChevronLeft, ChevronRight, Star, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/whatsapp";

interface PopularMenuItem {
  id: string;
  nama: string;
  harga: number;
  warungNama: string;
  foto: string;
  rating: number;
  terjual: number;
}

// Sample popular menu data
const popularMenus: PopularMenuItem[] = [
  {
    id: "1",
    nama: "Nasi Goreng Spesial",
    harga: 25000,
    warungNama: "Warung Bu Siti",
    foto: "🍛",
    rating: 4.8,
    terjual: 250,
  },
  {
    id: "2",
    nama: "Ayam Geprek Sambal",
    harga: 22000,
    warungNama: "Kedai Pak Joko",
    foto: "🍗",
    rating: 4.9,
    terjual: 189,
  },
  {
    id: "3",
    nama: "Bakso Sapi Jumbo",
    harga: 28000,
    warungNama: "Bakso Pak Kumis",
    foto: "🥣",
    rating: 4.7,
    terjual: 320,
  },
  {
    id: "4",
    nama: "Mie Ayam Spesial",
    harga: 20000,
    warungNama: "Mie Ayam Pak No",
    foto: "🍜",
    rating: 4.6,
    terjual: 156,
  },
  {
    id: "5",
    nama: "Sate Ayam Madura",
    harga: 30000,
    warungNama: "Warung Mas Budi",
    foto: "🍢",
    rating: 4.8,
    terjual: 210,
  },
  {
    id: "6",
    nama: "Pecel Lele Crispy",
    harga: 25000,
    warungNama: "Warung Mbak Yuni",
    foto: "🐟",
    rating: 4.5,
    terjual: 145,
  },
];

const PopularMenuSlider = () => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 300;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Flame className="w-5 h-5 text-orange-500" />
          <h2 className="text-lg sm:text-xl font-bold text-foreground">Menu Populer</h2>
        </div>
        <div className="flex gap-1">
          <Button
            variant="outline"
            size="icon"
            className="rounded-full h-8 w-8"
            onClick={() => scroll("left")}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="rounded-full h-8 w-8"
            onClick={() => scroll("right")}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-2 sm:gap-3 overflow-x-auto scrollbar-hide pb-2 -mx-4 px-4"
        style={{ scrollSnapType: "x mandatory" }}
      >
        {popularMenus.map((menu) => (
          <div
            key={menu.id}
            className="flex-shrink-0 w-28 sm:w-36 bg-card rounded-xl shadow-card overflow-hidden hover:shadow-lg transition-all cursor-pointer"
            style={{ scrollSnapAlign: "start" }}
          >
            {/* Image */}
            <div className="h-16 sm:h-20 bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
              <span className="text-2xl sm:text-3xl">{menu.foto}</span>
            </div>

            {/* Content */}
            <div className="p-2">
              <h3 className="font-semibold text-foreground line-clamp-1 text-xs sm:text-sm">
                {menu.nama}
              </h3>
              <p className="text-[10px] sm:text-xs text-muted-foreground line-clamp-1">{menu.warungNama}</p>
              
              <div className="flex items-center justify-between mt-1">
                <span className="text-primary font-bold text-xs sm:text-sm">
                  {formatPrice(menu.harga)}
                </span>
                <span className="flex items-center gap-0.5 text-yellow-500 text-[10px] sm:text-xs">
                  <Star className="w-3 h-3 fill-current" />
                  {menu.rating}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PopularMenuSlider;

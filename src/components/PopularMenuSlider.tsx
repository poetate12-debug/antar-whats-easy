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
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Flame className="w-6 h-6 text-orange-500" />
          <h2 className="text-2xl font-bold text-foreground">Menu Populer</h2>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            className="rounded-full"
            onClick={() => scroll("left")}
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="rounded-full"
            onClick={() => scroll("right")}
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide pb-4 -mx-4 px-4"
        style={{ scrollSnapType: "x mandatory" }}
      >
        {popularMenus.map((menu) => (
          <div
            key={menu.id}
            className="flex-shrink-0 w-64 bg-card rounded-2xl shadow-card overflow-hidden hover:shadow-xl transition-all hover:-translate-y-1 cursor-pointer"
            style={{ scrollSnapAlign: "start" }}
          >
            {/* Image */}
            <div className="h-32 bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
              <span className="text-5xl">{menu.foto}</span>
            </div>

            {/* Content */}
            <div className="p-4">
              <h3 className="font-bold text-foreground line-clamp-1 mb-1">
                {menu.nama}
              </h3>
              <p className="text-sm text-muted-foreground mb-2">{menu.warungNama}</p>
              
              <div className="flex items-center justify-between">
                <span className="text-primary font-bold">
                  {formatPrice(menu.harga)}
                </span>
                <div className="flex items-center gap-2 text-sm">
                  <span className="flex items-center gap-1 text-yellow-500">
                    <Star className="w-4 h-4 fill-current" />
                    {menu.rating}
                  </span>
                  <span className="text-muted-foreground">
                    {menu.terjual} terjual
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PopularMenuSlider;

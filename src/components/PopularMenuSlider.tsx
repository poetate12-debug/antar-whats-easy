import { useRef, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Star, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPrice } from "@/lib/whatsapp";
import { supabase } from "@/integrations/supabase/client";

interface PopularMenuItem {
  id: string;
  nama: string;
  harga: number;
  warungNama: string;
  foto_url: string | null;
}

interface PopularMenuSliderProps {
  selectedWilayah?: string | null;
}

const PopularMenuSlider = ({ selectedWilayah }: PopularMenuSliderProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [menus, setMenus] = useState<PopularMenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPopularMenus = async () => {
      setIsLoading(true);
      
      let query = supabase
        .from('menus')
        .select(`
          id,
          nama,
          harga,
          foto_url,
          warung:warungs!inner(
            id,
            nama,
            wilayah_id,
            is_active
          )
        `)
        .eq('is_available', true)
        .eq('warungs.is_active', true)
        .limit(12);

      if (selectedWilayah) {
        query = query.eq('warungs.wilayah_id', selectedWilayah);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching popular menus:', error);
        setMenus([]);
      } else if (data) {
        const formattedMenus: PopularMenuItem[] = data.map((item: any) => ({
          id: item.id,
          nama: item.nama,
          harga: item.harga,
          warungNama: item.warung?.nama || '',
          foto_url: item.foto_url,
        }));
        setMenus(formattedMenus);
      }
      
      setIsLoading(false);
    };

    fetchPopularMenus();
  }, [selectedWilayah]);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 300;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Flame className="w-5 h-5 text-orange-500" />
          <h2 className="text-lg sm:text-xl font-bold text-foreground">Menu Populer</h2>
        </div>
        <div className="flex gap-2 sm:gap-3 overflow-hidden">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex-shrink-0 w-28 sm:w-36">
              <Skeleton className="h-16 sm:h-20 rounded-t-xl" />
              <div className="p-2 space-y-1">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-2 w-2/3" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (menus.length === 0) {
    return null;
  }

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
        {menus.map((menu) => (
          <div
            key={menu.id}
            className="flex-shrink-0 w-28 sm:w-36 bg-card rounded-xl shadow-card overflow-hidden hover:shadow-lg transition-all cursor-pointer"
            style={{ scrollSnapAlign: "start" }}
          >
            {/* Image */}
            <div className="h-16 sm:h-20 bg-muted overflow-hidden">
              {menu.foto_url ? (
                <img
                  src={menu.foto_url}
                  alt={menu.nama}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200';
                  }}
                />
              ) : (
                <img
                  src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200"
                  alt={menu.nama}
                  className="w-full h-full object-cover"
                />
              )}
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
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PopularMenuSlider;

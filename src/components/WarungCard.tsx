import { Warung } from "@/types";
import { Button } from "@/components/ui/button";
import { Clock, MapPin, Star, ShoppingBag, Truck } from "lucide-react";
import { formatPrice } from "@/lib/whatsapp";

interface WarungCardProps {
  warung: Warung;
  menuCount?: number;
  wilayahNama?: string;
  ongkir?: number;
  onClick: () => void;
}

const WarungCard = ({ warung, menuCount, wilayahNama, ongkir, onClick }: WarungCardProps) => {
  return (
    <div 
      className="bg-card rounded-xl shadow-card overflow-hidden hover:shadow-lg transition-all cursor-pointer"
      onClick={onClick}
    >
      {/* Image */}
      <div className="aspect-[4/3] bg-gradient-to-br from-secondary to-muted relative overflow-hidden">
        {warung.foto ? (
          <img 
            src={warung.foto} 
            alt={warung.nama}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-3xl">🏪</span>
          </div>
        )}
        {/* Rating Badge */}
        {warung.rating && (
          <span className="absolute top-1.5 right-1.5 bg-yellow-500 text-white text-[10px] px-1.5 py-0.5 rounded-full flex items-center gap-0.5 font-semibold">
            <Star className="w-2.5 h-2.5 fill-current" />
            {warung.rating}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-2">
        <h3 className="text-xs sm:text-sm font-bold text-foreground line-clamp-1">
          {warung.nama}
        </h3>

        {/* Menu Preview */}
        {warung.menuPreview && warung.menuPreview.length > 0 && (
          <p className="text-[10px] text-muted-foreground line-clamp-1 mt-0.5">
            {warung.menuPreview.slice(0, 2).join(", ")}
          </p>
        )}

        <div className="flex items-center justify-between mt-1 text-[10px]">
          {warung.totalTerjual !== undefined && (
            <span className="text-muted-foreground flex items-center gap-0.5">
              <ShoppingBag className="w-2.5 h-2.5" />
              {warung.totalTerjual >= 1000 
                ? `${(warung.totalTerjual / 1000).toFixed(1)}k` 
                : warung.totalTerjual}
            </span>
          )}

          {ongkir !== undefined && (
            <span className="text-accent font-medium flex items-center gap-0.5">
              <Truck className="w-2.5 h-2.5" />
              {formatPrice(ongkir)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default WarungCard;

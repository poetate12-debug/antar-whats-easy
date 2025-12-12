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
    <div className="bg-card rounded-2xl shadow-card overflow-hidden hover:shadow-xl transition-all hover:-translate-y-1">
      {/* Image */}
      <div className="aspect-video bg-gradient-to-br from-secondary to-muted relative overflow-hidden">
        {warung.foto ? (
          <img 
            src={warung.foto} 
            alt={warung.nama}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-5xl">🏪</span>
          </div>
        )}
        {wilayahNama && (
          <span className="absolute top-3 left-3 bg-primary/90 text-primary-foreground text-xs px-2 py-1 rounded-full flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {wilayahNama}
          </span>
        )}
        {/* Rating Badge */}
        {warung.rating && (
          <span className="absolute top-3 right-3 bg-yellow-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1 font-semibold">
            <Star className="w-3 h-3 fill-current" />
            {warung.rating}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-lg font-bold text-foreground mb-1 line-clamp-1">
          {warung.nama}
        </h3>

        {warung.deskripsi && (
          <p className="text-muted-foreground text-sm mb-2 line-clamp-1">
            {warung.deskripsi}
          </p>
        )}

        {/* Menu Preview */}
        {warung.menuPreview && warung.menuPreview.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {warung.menuPreview.slice(0, 3).map((menu, idx) => (
              <span 
                key={idx}
                className="bg-secondary text-secondary-foreground text-xs px-2 py-0.5 rounded-full"
              >
                {menu}
              </span>
            ))}
          </div>
        )}

        <div className="space-y-1 mb-3">
          <p className="text-muted-foreground text-xs flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="line-clamp-1">{warung.alamat}</span>
          </p>

          {warung.jamBuka && (
            <p className="text-muted-foreground text-xs flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              {warung.jamBuka}
            </p>
          )}

          <div className="flex items-center justify-between text-xs">
            {warung.totalTerjual !== undefined && (
              <p className="text-muted-foreground flex items-center gap-1.5">
                <ShoppingBag className="w-3.5 h-3.5" />
                {warung.totalTerjual.toLocaleString()} terjual
              </p>
            )}

            {ongkir !== undefined && (
              <p className="text-accent font-medium flex items-center gap-1">
                <Truck className="w-3.5 h-3.5" />
                {formatPrice(ongkir)}
              </p>
            )}
          </div>
        </div>

        <Button onClick={onClick} className="w-full" size="sm">
          Lihat Menu
        </Button>
      </div>
    </div>
  );
};

export default WarungCard;

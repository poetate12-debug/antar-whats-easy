import { Warung } from "@/types";
import { Button } from "@/components/ui/button";
import { Clock, MapPin, UtensilsCrossed, Truck } from "lucide-react";
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
      <div className="aspect-video bg-gradient-to-br from-secondary to-muted flex items-center justify-center relative">
        <span className="text-5xl">🏪</span>
        {wilayahNama && (
          <span className="absolute top-3 left-3 bg-primary/90 text-primary-foreground text-xs px-2 py-1 rounded-full flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {wilayahNama}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="text-xl font-bold text-foreground mb-2">
          {warung.nama}
        </h3>

        {warung.deskripsi && (
          <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
            {warung.deskripsi}
          </p>
        )}

        <div className="space-y-1.5 mb-4">
          <p className="text-muted-foreground text-sm flex items-center gap-2">
            <MapPin className="w-4 h-4 flex-shrink-0" />
            <span className="line-clamp-1">{warung.alamat}</span>
          </p>

          {warung.jamBuka && (
            <p className="text-muted-foreground text-sm flex items-center gap-2">
              <Clock className="w-4 h-4" />
              {warung.jamBuka}
            </p>
          )}

          {menuCount !== undefined && (
            <p className="text-muted-foreground text-sm flex items-center gap-2">
              <UtensilsCrossed className="w-4 h-4" />
              {menuCount} menu
            </p>
          )}

          {ongkir !== undefined && (
            <p className="text-accent text-sm font-medium flex items-center gap-2">
              <Truck className="w-4 h-4" />
              Ongkir: {formatPrice(ongkir)}
            </p>
          )}
        </div>

        <Button onClick={onClick} className="w-full" size="lg">
          Lihat Menu
        </Button>
      </div>
    </div>
  );
};

export default WarungCard;

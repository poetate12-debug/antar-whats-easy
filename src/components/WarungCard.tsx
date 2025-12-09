import { Warung } from "@/types";
import { Button } from "@/components/ui/button";
import { Clock, MapPin, UtensilsCrossed } from "lucide-react";

interface WarungCardProps {
  warung: Warung;
  menuCount: number;
  onClick: () => void;
}

const WarungCard = ({ warung, menuCount, onClick }: WarungCardProps) => {
  return (
    <div className="bg-card rounded-2xl shadow-card overflow-hidden hover:shadow-xl transition-shadow">
      {/* Image */}
      <div className="aspect-video bg-gradient-to-br from-secondary to-muted flex items-center justify-center">
        <span className="text-5xl">🏪</span>
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

          <p className="text-muted-foreground text-sm flex items-center gap-2">
            <UtensilsCrossed className="w-4 h-4" />
            {menuCount} menu
          </p>
        </div>

        <Button onClick={onClick} className="w-full" size="lg">
          Lihat Menu
        </Button>
      </div>
    </div>
  );
};

export default WarungCard;

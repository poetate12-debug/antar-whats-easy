import { Wilayah } from "@/types";
import { formatPrice } from "@/lib/whatsapp";
import { MapPin, Store } from "lucide-react";

interface WilayahCardProps {
  wilayah: Wilayah;
  warungCount: number;
  onClick: () => void;
}

const WilayahCard = ({ wilayah, warungCount, onClick }: WilayahCardProps) => {
  return (
    <button
      onClick={onClick}
      className="group bg-card rounded-2xl shadow-card overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 text-left w-full"
    >
      {/* Icon Area */}
      <div className="aspect-video bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center relative overflow-hidden">
        <MapPin className="w-16 h-16 text-primary/60 group-hover:scale-110 transition-transform duration-300" />
        <div className="absolute inset-0 bg-gradient-to-t from-card/20 to-transparent" />
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">
          {wilayah.nama}
        </h3>
        <div className="flex items-center justify-between mt-2">
          <span className="text-sm text-muted-foreground flex items-center gap-1">
            <Store className="w-4 h-4" />
            {warungCount} warung
          </span>
          <span className="text-sm font-medium text-accent">
            Ongkir: {formatPrice(wilayah.ongkir)}
          </span>
        </div>
      </div>
    </button>
  );
};

export default WilayahCard;

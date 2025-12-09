import { Menu } from "@/types";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/whatsapp";
import { Plus, Minus } from "lucide-react";

interface MenuItemCardProps {
  menu: Menu;
  quantity: number;
  onAdd: () => void;
  onIncrease: () => void;
  onDecrease: () => void;
}

const MenuItemCard = ({
  menu,
  quantity,
  onAdd,
  onIncrease,
  onDecrease,
}: MenuItemCardProps) => {
  return (
    <div className="bg-card rounded-xl shadow-sm p-4 flex gap-4">
      {/* Menu Image */}
      <div className="w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-secondary flex items-center justify-center">
        <span className="text-3xl">🍽️</span>
      </div>

      {/* Menu Info */}
      <div className="flex-grow min-w-0">
        <h4 className="font-semibold text-foreground truncate">{menu.nama}</h4>
        {menu.deskripsi && (
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
            {menu.deskripsi}
          </p>
        )}
        <p className="text-primary font-bold mt-2">{formatPrice(menu.harga)}</p>
      </div>

      {/* Add Button / Quantity Controls */}
      <div className="flex-shrink-0 self-center">
        {quantity === 0 ? (
          <Button onClick={onAdd} size="sm" className="gap-1">
            <Plus className="w-4 h-4" />
            Tambah
          </Button>
        ) : (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="w-8 h-8"
              onClick={onDecrease}
            >
              <Minus className="w-4 h-4" />
            </Button>
            <span className="w-8 text-center font-medium">{quantity}</span>
            <Button
              variant="outline"
              size="icon"
              className="w-8 h-8"
              onClick={onIncrease}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MenuItemCard;

import { MenuItem } from "@/data/menu";
import { Button } from "@/components/ui/button";
import { MessageCircle, Plus, Minus } from "lucide-react";
import { useState } from "react";

interface MenuCardProps {
  item: MenuItem;
  onAddToCart: (item: MenuItem, quantity: number) => void;
}

const MenuCard = ({ item, onAddToCart }: MenuCardProps) => {
  const [quantity, setQuantity] = useState(1);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleOrder = () => {
    onAddToCart(item, quantity);
    setQuantity(1);
  };

  return (
    <div className="group relative overflow-hidden rounded-2xl bg-card gradient-card shadow-card transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
      <div className="flex h-32 items-center justify-center bg-secondary/50 text-6xl">
        {item.image}
      </div>
      <div className="p-5">
        <div className="mb-2 flex items-start justify-between">
          <h3 className="font-bold text-foreground">{item.name}</h3>
          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            {item.category}
          </span>
        </div>
        <p className="mb-3 text-sm text-muted-foreground line-clamp-2">
          {item.description}
        </p>
        <div className="mb-4 text-xl font-bold text-primary">
          {formatPrice(item.price)}
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center rounded-lg bg-secondary">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="p-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="w-8 text-center font-semibold">{quantity}</span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="p-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
          <Button
            variant="whatsapp"
            size="sm"
            className="flex-1"
            onClick={handleOrder}
          >
            <MessageCircle className="h-4 w-4" />
            Pesan
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MenuCard;

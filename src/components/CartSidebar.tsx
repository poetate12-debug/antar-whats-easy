import { Cart } from "@/types";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/whatsapp";
import { Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface CartSidebarProps {
  cart: Cart | null;
  onUpdateQuantity: (menuId: string, qty: number) => void;
  onClearCart: () => void;
}

const CartSidebar = ({
  cart,
  onUpdateQuantity,
  onClearCart,
}: CartSidebarProps) => {
  const navigate = useNavigate();

  if (!cart || cart.items.length === 0) {
    return (
      <div className="bg-card rounded-2xl shadow-card p-6 sticky top-24">
        <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
          <ShoppingCart className="w-5 h-5" />
          Keranjang
        </h3>
        <p className="text-muted-foreground text-center py-8">
          Keranjang masih kosong
        </p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-2xl shadow-card p-6 sticky top-24">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
          <ShoppingCart className="w-5 h-5" />
          Keranjang
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearCart}
          className="text-destructive hover:text-destructive"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>

      {/* Cart Items */}
      <div className="space-y-3 max-h-64 overflow-y-auto">
        {cart.items.map((item) => (
          <div
            key={item.menuId}
            className="flex justify-between items-center py-2 border-b border-border last:border-0"
          >
            <div className="min-w-0 flex-grow">
              <p className="font-medium text-sm truncate">{item.nama}</p>
              <p className="text-xs text-muted-foreground">
                {formatPrice(item.harga)} x {item.qty}
              </p>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <Button
                variant="ghost"
                size="icon"
                className="w-6 h-6"
                onClick={() => onUpdateQuantity(item.menuId, item.qty - 1)}
              >
                <Minus className="w-3 h-3" />
              </Button>
              <span className="w-6 text-center text-sm">{item.qty}</span>
              <Button
                variant="ghost"
                size="icon"
                className="w-6 h-6"
                onClick={() => onUpdateQuantity(item.menuId, item.qty + 1)}
              >
                <Plus className="w-3 h-3" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="border-t border-border pt-4 mt-4 space-y-2">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Subtotal</span>
          <span>{formatPrice(cart.subtotal)}</span>
        </div>
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Ongkir ({cart.wilayahNama})</span>
          <span>{formatPrice(cart.ongkir)}</span>
        </div>
        <div className="flex justify-between font-bold text-lg text-foreground pt-2 border-t border-border">
          <span>Total</span>
          <span className="text-primary">{formatPrice(cart.total)}</span>
        </div>
      </div>

      <Button
        onClick={() => navigate("/checkout")}
        className="w-full mt-4 bg-accent hover:bg-accent/90"
        size="lg"
      >
        Checkout via WhatsApp
      </Button>
    </div>
  );
};

export default CartSidebar;

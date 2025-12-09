import { Link } from "react-router-dom";
import { ShoppingCart, ChevronLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface NavHeaderProps {
  showBack?: boolean;
  backTo?: string;
  backLabel?: string;
  cartCount?: number;
  onCartClick?: () => void;
}

const NavHeader = ({
  showBack = false,
  backTo = "/",
  backLabel,
  cartCount = 0,
  onCartClick,
}: NavHeaderProps) => {
  return (
    <nav className="bg-card shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Left side */}
          <div className="flex items-center gap-4">
            {showBack && (
              <Link
                to={backTo}
                className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
                {backLabel && <span className="text-sm">{backLabel}</span>}
              </Link>
            )}
            <Link
              to="/"
              className="text-2xl font-bold text-primary flex items-center gap-2"
            >
              🍽️ AntarRasa
            </Link>
          </div>

          {/* Cart Icon */}
          {onCartClick ? (
            <button onClick={onCartClick} className="relative p-2">
              <ShoppingCart className="w-6 h-6 text-foreground" />
              {cartCount > 0 && (
                <Badge
                  variant="default"
                  className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center p-0 text-xs bg-primary"
                >
                  {cartCount}
                </Badge>
              )}
            </button>
          ) : (
            <Link to="/checkout" className="relative p-2">
              <ShoppingCart className="w-6 h-6 text-foreground" />
              {cartCount > 0 && (
                <Badge
                  variant="default"
                  className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center p-0 text-xs bg-primary"
                >
                  {cartCount}
                </Badge>
              )}
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default NavHeader;

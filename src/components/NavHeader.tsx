import { Link } from "react-router-dom";
import { ShoppingCart, ChevronLeft, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { ThemeToggle } from "@/components/ThemeToggle";

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
  const { user, role } = useAuth();

  const getDashboardLink = () => {
    if (!user) return "/auth";
    switch (role) {
      case "admin": return "/dashboard/admin";
      case "driver": return "/dashboard/driver";
      case "mitra": return "/dashboard/mitra";
      default: return "/dashboard/pelanggan";
    }
  };

  return (
    <nav className="bg-card/95 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-border/50">
      <div className="container mx-auto px-4 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          {/* Left side */}
          <div className="flex items-center gap-2 sm:gap-4">
            {showBack && (
              <Link
                to={backTo}
                className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors p-1 -ml-1 rounded-lg hover:bg-muted/50"
              >
                <ChevronLeft className="w-5 h-5" />
                {backLabel && <span className="text-sm hidden sm:inline">{backLabel}</span>}
              </Link>
            )}
            <Link
              to="/"
              className="text-xl sm:text-2xl font-bold text-primary flex items-center gap-1.5 sm:gap-2 hover:opacity-90 transition-opacity"
            >
              <span className="text-lg sm:text-xl">🚀</span>
              <span className="hidden xs:inline">GELIS DELIVERY</span>
              <span className="xs:hidden">GELIS</span>
            </Link>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Theme Toggle */}
            <ThemeToggle />

            {/* User/Login Button */}
            <Link 
              to={getDashboardLink()} 
              className="p-2 rounded-full hover:bg-muted/50 transition-colors"
              aria-label={user ? "Dashboard" : "Login"}
            >
              <User className="w-5 h-5 sm:w-6 sm:h-6 text-foreground" />
            </Link>

            {/* Cart Icon */}
            {onCartClick ? (
              <button 
                onClick={onCartClick} 
                className="relative p-2 rounded-full hover:bg-muted/50 transition-colors"
                aria-label="Cart"
              >
                <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6 text-foreground" />
                {cartCount > 0 && (
                  <Badge
                    variant="default"
                    className="absolute -top-0.5 -right-0.5 w-5 h-5 flex items-center justify-center p-0 text-xs bg-primary animate-scale-in"
                  >
                    {cartCount > 9 ? "9+" : cartCount}
                  </Badge>
                )}
              </button>
            ) : (
              <Link 
                to="/checkout" 
                className="relative p-2 rounded-full hover:bg-muted/50 transition-colors"
                aria-label="Cart"
              >
                <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6 text-foreground" />
                {cartCount > 0 && (
                  <Badge
                    variant="default"
                    className="absolute -top-0.5 -right-0.5 w-5 h-5 flex items-center justify-center p-0 text-xs bg-primary animate-scale-in"
                  >
                    {cartCount > 9 ? "9+" : cartCount}
                  </Badge>
                )}
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavHeader;

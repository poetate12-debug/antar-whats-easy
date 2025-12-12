import { useLocation, useNavigate } from 'react-router-dom';
import { Home, ClipboardList, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

interface NavItem {
  icon: React.ElementType;
  label: string;
  path: string;
  authRequired?: boolean;
}

const navItems: NavItem[] = [
  { icon: Home, label: 'Beranda', path: '/' },
  { icon: ClipboardList, label: 'Pesanan', path: '/orders', authRequired: true },
  { icon: User, label: 'Profil', path: '/profile', authRequired: true },
];

export default function BottomNavigation() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Don't show on dashboard pages (admin/mitra/driver have their own nav)
  const hiddenPaths = ['/dashboard/admin', '/dashboard/mitra', '/dashboard/driver', '/auth', '/admin', '/checkout'];
  if (hiddenPaths.some(path => location.pathname.startsWith(path))) {
    return null;
  }

  const handleNavClick = (item: NavItem) => {
    if (item.authRequired && !user) {
      navigate('/auth', { state: { from: item.path } });
    } else {
      navigate(item.path);
    }
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-t border-border safe-area-pb">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-around h-16">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || 
              (item.path === '/orders' && location.pathname.startsWith('/order'));
            const Icon = item.icon;

            return (
              <button
                key={item.path}
                onClick={() => handleNavClick(item)}
                className={cn(
                  'flex flex-col items-center justify-center gap-1 w-full h-full transition-colors',
                  isActive 
                    ? 'text-primary' 
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <Icon className={cn('w-5 h-5', isActive && 'scale-110')} />
                <span className={cn(
                  'text-xs font-medium',
                  isActive && 'font-semibold'
                )}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

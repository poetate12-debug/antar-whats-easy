import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LogOut, Store, Package, ChefHat, BarChart3, Bell, Settings } from 'lucide-react';
import NavHeader from '@/components/NavHeader';
import Footer from '@/components/Footer';

export default function MitraDashboard() {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <NavHeader />
      
      <main className="flex-1 container mx-auto px-4 py-6">
        {/* Welcome Card */}
        <div className="bg-gradient-to-r from-accent to-accent/80 rounded-2xl p-6 text-accent-foreground mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-3xl">
              🏪
            </div>
            <div>
              <h1 className="text-2xl font-bold">{profile?.nama || 'Mitra'}</h1>
              <p className="opacity-90">Dashboard Warung</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-card border border-border rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-primary">0</p>
            <p className="text-xs text-muted-foreground">Pesanan Baru</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-3 text-center">
            <p className="text-2xl font-bold">0</p>
            <p className="text-xs text-muted-foreground">Diproses</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-green-600">0</p>
            <p className="text-xs text-muted-foreground">Selesai</p>
          </div>
        </div>

        {/* Quick Actions */}
        <h2 className="font-semibold mb-3">Menu Cepat</h2>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <button className="bg-card border border-border rounded-xl p-4 text-left hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
              <Package className="w-5 h-5 text-primary" />
            </div>
            <h3 className="font-semibold">Pesanan Masuk</h3>
            <p className="text-sm text-muted-foreground">Kelola pesanan</p>
          </button>

          <button className="bg-card border border-border rounded-xl p-4 text-left hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center mb-3">
              <ChefHat className="w-5 h-5 text-accent" />
            </div>
            <h3 className="font-semibold">Kelola Menu</h3>
            <p className="text-sm text-muted-foreground">Tambah/edit produk</p>
          </button>

          <button className="bg-card border border-border rounded-xl p-4 text-left hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center mb-3">
              <BarChart3 className="w-5 h-5 text-green-600" />
            </div>
            <h3 className="font-semibold">Laporan</h3>
            <p className="text-sm text-muted-foreground">Lihat penjualan</p>
          </button>

          <button className="bg-card border border-border rounded-xl p-4 text-left hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center mb-3">
              <Settings className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="font-semibold">Pengaturan</h3>
            <p className="text-sm text-muted-foreground">Atur warung</p>
          </button>
        </div>

        {/* Recent Orders */}
        <div className="bg-card border border-border rounded-xl p-4 mb-6">
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Pesanan Terbaru
          </h2>
          <div className="text-center py-8 text-muted-foreground">
            <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Belum ada pesanan masuk</p>
          </div>
        </div>

        {/* Sign Out */}
        <Button
          variant="outline"
          className="w-full gap-2"
          onClick={handleSignOut}
        >
          <LogOut className="w-4 h-4" />
          Keluar
        </Button>
      </main>

      <Footer />
    </div>
  );
}
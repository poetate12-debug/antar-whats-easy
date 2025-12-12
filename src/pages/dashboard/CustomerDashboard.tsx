import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LogOut, ShoppingBag, MapPin, Clock, User } from 'lucide-react';
import NavHeader from '@/components/NavHeader';
import Footer from '@/components/Footer';

export default function CustomerDashboard() {
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
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-primary to-primary/80 rounded-2xl p-6 text-primary-foreground mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
              <User className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Halo, {profile?.nama || 'Pelanggan'}!</h1>
              <p className="opacity-90">Selamat datang di GELIS DELIVERY</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <button
            onClick={() => navigate('/')}
            className="bg-card border border-border rounded-xl p-4 text-left hover:shadow-md transition-shadow"
          >
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
              <ShoppingBag className="w-5 h-5 text-primary" />
            </div>
            <h3 className="font-semibold">Pesan Makanan</h3>
            <p className="text-sm text-muted-foreground">Cari warung favorit</p>
          </button>

          <button
            onClick={() => navigate('/orders')}
            className="bg-card border border-border rounded-xl p-4 text-left hover:shadow-md transition-shadow"
          >
            <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center mb-3">
              <Clock className="w-5 h-5 text-accent" />
            </div>
            <h3 className="font-semibold">Riwayat Pesanan</h3>
            <p className="text-sm text-muted-foreground">Lihat pesanan lalu</p>
          </button>
        </div>

        {/* Profile Info */}
        <div className="bg-card border border-border rounded-xl p-4 mb-6">
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            <User className="w-5 h-5" />
            Profil Saya
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Nama</span>
              <span className="font-medium">{profile?.nama || '-'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">WhatsApp</span>
              <span className="font-medium">{profile?.no_whatsapp || '-'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Alamat</span>
              <span className="font-medium">{profile?.alamat || '-'}</span>
            </div>
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
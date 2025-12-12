import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { LogOut, Power, Package, Wallet, Star, TrendingUp } from 'lucide-react';
import NavHeader from '@/components/NavHeader';
import Footer from '@/components/Footer';

export default function DriverDashboard() {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [isOnline, setIsOnline] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <NavHeader />
      
      <main className="flex-1 container mx-auto px-4 py-6">
        {/* Driver Status Card */}
        <div className={`rounded-2xl p-6 mb-6 transition-colors ${
          isOnline 
            ? 'bg-gradient-to-r from-green-500 to-green-600 text-white' 
            : 'bg-gradient-to-r from-gray-500 to-gray-600 text-white'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center text-3xl">
                🛵
              </div>
              <div>
                <h1 className="text-xl font-bold">{profile?.nama || 'Driver'}</h1>
                <p className="opacity-90">{isOnline ? 'Sedang Online' : 'Sedang Offline'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium">{isOnline ? 'ON' : 'OFF'}</span>
              <Switch
                checked={isOnline}
                onCheckedChange={setIsOnline}
                className="data-[state=checked]:bg-white/30"
              />
            </div>
          </div>
          
          {isOnline && (
            <div className="bg-white/10 rounded-xl p-3 flex items-center gap-3">
              <Power className="w-5 h-5" />
              <span className="text-sm">Anda siap menerima pesanan</span>
            </div>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Package className="w-5 h-5 text-primary" />
              </div>
            </div>
            <p className="text-2xl font-bold">0</p>
            <p className="text-sm text-muted-foreground">Pesanan Hari Ini</p>
          </div>

          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <Wallet className="w-5 h-5 text-green-600" />
              </div>
            </div>
            <p className="text-2xl font-bold">Rp 0</p>
            <p className="text-sm text-muted-foreground">Pendapatan Hari Ini</p>
          </div>

          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center">
                <Star className="w-5 h-5 text-yellow-600" />
              </div>
            </div>
            <p className="text-2xl font-bold">5.0</p>
            <p className="text-sm text-muted-foreground">Rating</p>
          </div>

          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <p className="text-2xl font-bold">100%</p>
            <p className="text-sm text-muted-foreground">Acceptance Rate</p>
          </div>
        </div>

        {/* Active Orders */}
        <div className="bg-card border border-border rounded-xl p-4 mb-6">
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            <Package className="w-5 h-5" />
            Pesanan Aktif
          </h2>
          <div className="text-center py-8 text-muted-foreground">
            <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Belum ada pesanan aktif</p>
            {!isOnline && (
              <p className="text-sm mt-1">Nyalakan mode online untuk menerima pesanan</p>
            )}
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
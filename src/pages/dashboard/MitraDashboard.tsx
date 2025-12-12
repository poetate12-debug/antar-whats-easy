import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useMitraWarung } from '@/hooks/useMitraWarung';
import { useMitraMenus } from '@/hooks/useMitraMenus';
import { useMitraOrders } from '@/hooks/useMitraOrders';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LogOut, Store, Package, ChefHat, Bell, Settings, MapPin, Clock } from 'lucide-react';
import NavHeader from '@/components/NavHeader';
import Footer from '@/components/Footer';
import MitraMenuManager from '@/components/mitra/MitraMenuManager';
import MitraOrderList from '@/components/mitra/MitraOrderList';

export default function MitraDashboard() {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const { warung, isLoading: warungLoading } = useMitraWarung();
  const { 
    menus, 
    isLoading: menusLoading, 
    addMenu, 
    updateMenu, 
    toggleAvailability, 
    deleteMenu 
  } = useMitraMenus(warung?.id);
  const { 
    pendingOrders, 
    activeOrders, 
    orders,
    stats, 
    isLoading: ordersLoading, 
    updateOrderStatus 
  } = useMitraOrders(warung?.id);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (warungLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-center">
          <Store className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <p>Memuat data warung...</p>
        </div>
      </div>
    );
  }

  if (!warung) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <NavHeader />
        <main className="flex-1 container mx-auto px-4 py-6 flex items-center justify-center">
          <div className="text-center max-w-md">
            <Store className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h1 className="text-xl font-bold mb-2">Warung Belum Terdaftar</h1>
            <p className="text-muted-foreground mb-6">
              Akun Anda belum terhubung dengan warung. Silakan hubungi admin untuk mendaftarkan warung Anda.
            </p>
            <Button variant="outline" onClick={handleSignOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Keluar
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <NavHeader />
      
      <main className="flex-1 container mx-auto px-4 py-4 pb-24">
        {/* Warung Header */}
        <div className="bg-gradient-to-r from-accent to-accent/80 rounded-2xl p-4 text-accent-foreground mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-2xl">
              🏪
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-bold truncate">{warung.nama}</h1>
              <div className="flex items-center gap-2 text-sm opacity-90">
                <MapPin className="w-3 h-3" />
                <span className="truncate">{warung.wilayah?.nama}</span>
              </div>
            </div>
            <div className={`w-3 h-3 rounded-full ${warung.is_active ? 'bg-green-400' : 'bg-red-400'}`} />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          <div className="bg-card border border-border rounded-xl p-2.5 text-center">
            <Bell className="w-4 h-4 mx-auto mb-1 text-yellow-500" />
            <p className="text-lg font-bold">{stats.pending}</p>
            <p className="text-[10px] text-muted-foreground">Baru</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-2.5 text-center">
            <ChefHat className="w-4 h-4 mx-auto mb-1 text-blue-500" />
            <p className="text-lg font-bold">{stats.diproses}</p>
            <p className="text-[10px] text-muted-foreground">Diproses</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-2.5 text-center">
            <Package className="w-4 h-4 mx-auto mb-1 text-green-500" />
            <p className="text-lg font-bold">{stats.selesai}</p>
            <p className="text-[10px] text-muted-foreground">Selesai</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-2.5 text-center">
            <Clock className="w-4 h-4 mx-auto mb-1 text-primary" />
            <p className="text-lg font-bold">{stats.today}</p>
            <p className="text-[10px] text-muted-foreground">Hari Ini</p>
          </div>
        </div>

        {/* Pending Orders Alert */}
        {pendingOrders.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 mb-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center animate-pulse">
              <Bell className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="font-semibold text-yellow-800">
                {pendingOrders.length} Pesanan Baru!
              </p>
              <p className="text-xs text-yellow-600">Segera proses pesanan masuk</p>
            </div>
          </div>
        )}

        {/* Tabs */}
        <Tabs defaultValue="orders" className="mb-4">
          <TabsList className="grid w-full grid-cols-2 h-10">
            <TabsTrigger value="orders" className="text-xs gap-1">
              <Package className="w-3.5 h-3.5" />
              Pesanan
              {pendingOrders.length > 0 && (
                <span className="ml-1 w-4 h-4 bg-yellow-500 text-white rounded-full text-[10px] flex items-center justify-center">
                  {pendingOrders.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="menu" className="text-xs gap-1">
              <ChefHat className="w-3.5 h-3.5" />
              Kelola Menu
            </TabsTrigger>
          </TabsList>

          <TabsContent value="orders" className="mt-4">
            <MitraOrderList
              orders={[...pendingOrders, ...activeOrders]}
              isLoading={ordersLoading}
              onUpdateStatus={updateOrderStatus}
            />
          </TabsContent>

          <TabsContent value="menu" className="mt-4">
            <MitraMenuManager
              menus={menus}
              isLoading={menusLoading}
              onAddMenu={addMenu}
              onUpdateMenu={updateMenu}
              onToggleAvailability={toggleAvailability}
              onDeleteMenu={deleteMenu}
            />
          </TabsContent>
        </Tabs>

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

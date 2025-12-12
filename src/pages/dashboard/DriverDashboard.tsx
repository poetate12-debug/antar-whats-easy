import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useDriverStatus } from '@/hooks/useDriverStatus';
import { useDriverStats } from '@/hooks/useDriverStats';
import { useDriverAssignments } from '@/hooks/useDriverAssignments';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LogOut, Power, Package, Wallet, Star, TrendingUp, Trophy, History } from 'lucide-react';
import NavHeader from '@/components/NavHeader';
import Footer from '@/components/Footer';
import DriverOrderCard from '@/components/driver/DriverOrderCard';
import DriverRankingList from '@/components/driver/DriverRankingList';
import DriverSetoranHistory from '@/components/driver/DriverSetoranHistory';

export default function DriverDashboard() {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const { isOnline, toggleOnline, isLoading: statusLoading } = useDriverStatus();
  const { stats, todayStats, isLoading: statsLoading } = useDriverStats();
  const {
    assignments,
    activeAssignment,
    acceptOrder,
    rejectOrder,
    pickupOrder,
    deliverOrder,
    isLoading: assignmentsLoading
  } = useDriverAssignments();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const pendingOrders = assignments.filter(a => a.status === 'pending');

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <NavHeader />
      
      <main className="flex-1 container mx-auto px-4 py-4 pb-24">
        {/* Driver Status Card */}
        <div className={`rounded-2xl p-4 mb-4 transition-colors ${
          isOnline 
            ? 'bg-gradient-to-r from-green-500 to-green-600 text-white' 
            : 'bg-gradient-to-r from-muted to-muted/80 text-foreground'
        }`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${
                isOnline ? 'bg-white/20' : 'bg-background'
              }`}>
                🛵
              </div>
              <div>
                <h1 className="text-lg font-bold">{profile?.nama || 'Driver'}</h1>
                <p className={`text-sm ${isOnline ? 'opacity-90' : 'text-muted-foreground'}`}>
                  {isOnline ? 'Sedang Online' : 'Sedang Offline'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">{isOnline ? 'ON' : 'OFF'}</span>
              <Switch
                checked={isOnline}
                onCheckedChange={toggleOnline}
                disabled={statusLoading}
              />
            </div>
          </div>
          
          {isOnline && (
            <div className={`rounded-xl p-2.5 flex items-center gap-2 ${
              isOnline ? 'bg-white/10' : 'bg-muted'
            }`}>
              <Power className="w-4 h-4" />
              <span className="text-sm">
                {pendingOrders.length > 0 
                  ? `${pendingOrders.length} pesanan menunggu` 
                  : 'Anda siap menerima pesanan'}
              </span>
            </div>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          <div className="bg-card border border-border rounded-xl p-2.5 text-center">
            <Package className="w-4 h-4 mx-auto mb-1 text-primary" />
            <p className="text-lg font-bold">{todayStats.ordersToday}</p>
            <p className="text-[10px] text-muted-foreground">Hari Ini</p>
          </div>

          <div className="bg-card border border-border rounded-xl p-2.5 text-center">
            <Wallet className="w-4 h-4 mx-auto mb-1 text-green-600" />
            <p className="text-lg font-bold">{formatCurrency(todayStats.earningsToday).replace('Rp', '')}</p>
            <p className="text-[10px] text-muted-foreground">Pendapatan</p>
          </div>

          <div className="bg-card border border-border rounded-xl p-2.5 text-center">
            <Star className="w-4 h-4 mx-auto mb-1 text-yellow-500" />
            <p className="text-lg font-bold">{stats?.average_rating?.toFixed(1) || '5.0'}</p>
            <p className="text-[10px] text-muted-foreground">Rating</p>
          </div>

          <div className="bg-card border border-border rounded-xl p-2.5 text-center">
            <TrendingUp className="w-4 h-4 mx-auto mb-1 text-blue-500" />
            <p className="text-lg font-bold">{stats?.acceptance_rate?.toFixed(0) || '100'}%</p>
            <p className="text-[10px] text-muted-foreground">Acc Rate</p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="orders" className="mb-4">
          <TabsList className="grid w-full grid-cols-3 h-10">
            <TabsTrigger value="orders" className="text-xs gap-1">
              <Package className="w-3.5 h-3.5" />
              Pesanan
            </TabsTrigger>
            <TabsTrigger value="ranking" className="text-xs gap-1">
              <Trophy className="w-3.5 h-3.5" />
              Ranking
            </TabsTrigger>
            <TabsTrigger value="setoran" className="text-xs gap-1">
              <History className="w-3.5 h-3.5" />
              Setoran
            </TabsTrigger>
          </TabsList>

          <TabsContent value="orders" className="mt-4">
            {/* Active Assignment */}
            {activeAssignment && (
              <div className="mb-4">
                <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  Pesanan Aktif
                </h3>
                <DriverOrderCard
                  assignment={activeAssignment}
                  onPickup={pickupOrder}
                  onDeliver={deliverOrder}
                />
              </div>
            )}

            {/* Pending Orders */}
            {pendingOrders.length > 0 && (
              <div className="mb-4">
                <h3 className="text-sm font-semibold mb-2">
                  Pesanan Masuk ({pendingOrders.length})
                </h3>
                <div className="space-y-3">
                  {pendingOrders.map(assignment => (
                    <DriverOrderCard
                      key={assignment.id}
                      assignment={assignment}
                      onAccept={acceptOrder}
                      onReject={rejectOrder}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Empty State */}
            {!activeAssignment && pendingOrders.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <Package className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <p className="font-medium">Belum ada pesanan</p>
                {!isOnline && (
                  <p className="text-sm mt-1">Nyalakan mode online untuk menerima pesanan</p>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="ranking" className="mt-4">
            <div className="mb-3">
              <h3 className="text-sm font-semibold">Peringkat Driver</h3>
              <p className="text-xs text-muted-foreground">Berdasarkan jumlah order selesai</p>
            </div>
            <DriverRankingList />
          </TabsContent>

          <TabsContent value="setoran" className="mt-4">
            <div className="mb-3">
              <h3 className="text-sm font-semibold">Riwayat Setoran</h3>
              <p className="text-xs text-muted-foreground">Komisi yang harus disetor ke admin</p>
            </div>
            <DriverSetoranHistory />
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

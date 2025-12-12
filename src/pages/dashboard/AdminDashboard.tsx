import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useAdminNotifications } from '@/hooks/useAdminNotifications';
import { 
  LogOut, Users, Store, MapPin, Package, 
  CheckCircle, XCircle, Shield, Wallet, Truck, BarChart3, Settings
} from 'lucide-react';
import NavHeader from '@/components/NavHeader';
import Footer from '@/components/Footer';
import AdminSetoranManager from '@/components/admin/AdminSetoranManager';
import AdminOrderManager from '@/components/admin/AdminOrderManager';
import AdminWilayahPanel from '@/components/admin/AdminWilayahPanel';
import AdminMitraPanel from '@/components/admin/AdminMitraPanel';
import AdminDriverPanel from '@/components/admin/AdminDriverPanel';
import AdminReportPanel from '@/components/admin/AdminReportPanel';
import AdminSettingsPanel from '@/components/admin/AdminSettingsPanel';
import AdminUserManager from '@/components/admin/AdminUserManager';

interface PendingRegistration {
  id: string;
  nama: string;
  no_whatsapp: string;
  requested_role: string;
  status: string;
  created_at: string;
}

interface Warung {
  id: string;
  nama: string;
  owner_id: string | null;
}

export default function AdminDashboard() {
  const { user, profile, role, isLoading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [pendingRegs, setPendingRegs] = useState<PendingRegistration[]>([]);
  const [warungs, setWarungs] = useState<Warung[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalWarungs: 0,
    totalWilayahs: 0,
    totalOrders: 0,
    totalDrivers: 0,
    pendingSetoran: 0,
  });
  
  // For mitra approval with warung assignment
  const [approvingMitra, setApprovingMitra] = useState<PendingRegistration | null>(null);
  const [selectedWarungId, setSelectedWarungId] = useState<string>('');

  // Auth protection - redirect if not logged in or not admin
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        toast({
          title: 'Akses Ditolak',
          description: 'Silakan login terlebih dahulu',
          variant: 'destructive',
        });
        navigate('/admin/login');
        return;
      }
      if (role !== 'admin') {
        toast({
          title: 'Akses Ditolak',
          description: 'Anda tidak memiliki akses ke halaman ini',
          variant: 'destructive',
        });
        navigate('/');
        return;
      }
    }
  }, [user, role, authLoading, navigate, toast]);

  // Real-time notifications for admin
  useAdminNotifications(
    () => fetchData(), // onNewOrder - refresh data
    () => fetchData()  // onNewRegistration - refresh data
  );

  useEffect(() => {
    if (user && role === 'admin') {
      fetchData();
    }
  }, [user, role]);

  const fetchData = async () => {
    setIsLoading(true);
    
    // Fetch pending registrations
    const { data: regs } = await supabase
      .from('pending_registrations')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false });
    
    setPendingRegs(regs || []);

    // Fetch warungs without owner
    const { data: warungData } = await supabase
      .from('warungs')
      .select('id, nama, owner_id')
      .is('owner_id', null);
    
    setWarungs(warungData || []);

    // Fetch stats
    const [
      { count: usersCount },
      { count: warungsCount },
      { count: wilayahsCount },
      { count: ordersCount },
      { count: driversCount },
      { count: setoranCount },
    ] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('warungs').select('*', { count: 'exact', head: true }),
      supabase.from('wilayahs').select('*', { count: 'exact', head: true }),
      supabase.from('orders').select('*', { count: 'exact', head: true }),
      supabase.from('user_roles').select('*', { count: 'exact', head: true }).eq('role', 'driver'),
      supabase.from('driver_setoran').select('*', { count: 'exact', head: true }).in('status', ['pending', 'paid']),
    ]);

    setStats({
      totalUsers: usersCount || 0,
      totalWarungs: warungsCount || 0,
      totalWilayahs: wilayahsCount || 0,
      totalOrders: ordersCount || 0,
      totalDrivers: driversCount || 0,
      pendingSetoran: setoranCount || 0,
    });

    setIsLoading(false);
  };

  const handleApproveClick = (reg: PendingRegistration) => {
    if (reg.requested_role === 'mitra') {
      setApprovingMitra(reg);
      setSelectedWarungId('');
    } else {
      handleApproveRegistration(reg);
    }
  };

  const handleApproveRegistration = async (reg: PendingRegistration, warungId?: string) => {
    try {
      // Create user in auth
      const email = `${reg.no_whatsapp}@gelis.app`;
      const tempPassword = `Gelis${reg.no_whatsapp.slice(-4)}!`;

      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email,
        password: tempPassword,
        email_confirm: true,
      });

      if (authError) throw authError;

      // Create profile
      await supabase.from('profiles').insert([{
        user_id: authData.user.id,
        nama: reg.nama,
        no_whatsapp: reg.no_whatsapp,
        is_verified: true,
        is_active: true,
      }]);

      // Create role
      await supabase.from('user_roles').insert([{
        user_id: authData.user.id,
        role: reg.requested_role as 'pelanggan' | 'mitra' | 'driver' | 'admin',
      }]);

      // Create driver stats if driver
      if (reg.requested_role === 'driver') {
        await supabase.from('driver_stats').insert([{
          driver_id: authData.user.id,
        }]);
      }

      // Assign warung to mitra if selected
      if (reg.requested_role === 'mitra' && warungId) {
        await supabase
          .from('warungs')
          .update({ owner_id: authData.user.id })
          .eq('id', warungId);
      }

      // Update registration status
      await supabase
        .from('pending_registrations')
        .update({ status: 'approved', processed_at: new Date().toISOString() })
        .eq('id', reg.id);

      toast({
        title: 'Berhasil',
        description: `Akun ${reg.nama} telah disetujui${warungId ? ' dan dihubungkan ke warung' : ''}`,
      });

      setApprovingMitra(null);
      fetchData();
    } catch (error) {
      console.error('Error approving registration:', error);
      toast({
        title: 'Error',
        description: 'Gagal menyetujui pendaftaran',
        variant: 'destructive',
      });
    }
  };

  const handleRejectRegistration = async (reg: PendingRegistration) => {
    try {
      await supabase
        .from('pending_registrations')
        .update({ status: 'rejected', processed_at: new Date().toISOString() })
        .eq('id', reg.id);

      toast({
        title: 'Ditolak',
        description: `Pendaftaran ${reg.nama} telah ditolak`,
      });

      fetchData();
    } catch (error) {
      console.error('Error rejecting registration:', error);
      toast({
        title: 'Error',
        description: 'Gagal menolak pendaftaran',
        variant: 'destructive',
      });
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const roleLabels: Record<string, string> = {
    pelanggan: 'Pelanggan',
    driver: 'Driver',
    mitra: 'Mitra',
    admin: 'Admin',
  };

  // Show loading while checking auth
  if (authLoading || !user || role !== 'admin') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Memeriksa akses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <NavHeader />
      
      <main className="flex-1 container mx-auto px-4 py-4 pb-24">
        {/* Welcome Card */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl p-4 text-white mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg font-bold">{profile?.nama || 'Admin'}</h1>
              <p className="text-sm opacity-90">Panel Administrator</p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="bg-card border border-border rounded-xl p-2.5 text-center">
            <Users className="w-4 h-4 mx-auto mb-1 text-blue-600" />
            <p className="text-lg font-bold">{stats.totalUsers}</p>
            <p className="text-[10px] text-muted-foreground">Users</p>
          </div>

          <div className="bg-card border border-border rounded-xl p-2.5 text-center">
            <Store className="w-4 h-4 mx-auto mb-1 text-green-600" />
            <p className="text-lg font-bold">{stats.totalWarungs}</p>
            <p className="text-[10px] text-muted-foreground">Warungs</p>
          </div>

          <div className="bg-card border border-border rounded-xl p-2.5 text-center">
            <Package className="w-4 h-4 mx-auto mb-1 text-orange-600" />
            <p className="text-lg font-bold">{stats.totalOrders}</p>
            <p className="text-[10px] text-muted-foreground">Orders</p>
          </div>

          <div className="bg-card border border-border rounded-xl p-2.5 text-center">
            <Truck className="w-4 h-4 mx-auto mb-1 text-purple-600" />
            <p className="text-lg font-bold">{stats.totalDrivers}</p>
            <p className="text-[10px] text-muted-foreground">Drivers</p>
          </div>

          <div className="bg-card border border-border rounded-xl p-2.5 text-center">
            <MapPin className="w-4 h-4 mx-auto mb-1 text-red-600" />
            <p className="text-lg font-bold">{stats.totalWilayahs}</p>
            <p className="text-[10px] text-muted-foreground">Wilayah</p>
          </div>

          <div className="bg-card border border-border rounded-xl p-2.5 text-center">
            <Wallet className="w-4 h-4 mx-auto mb-1 text-yellow-600" />
            <p className="text-lg font-bold">{stats.pendingSetoran}</p>
            <p className="text-[10px] text-muted-foreground">Setoran</p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="registrations" className="mb-4">
          <TabsList className="grid w-full grid-cols-5 lg:grid-cols-9 h-auto gap-1">
            <TabsTrigger value="registrations" className="text-xs gap-1 py-2">
              <Users className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Daftar</span>
              {pendingRegs.length > 0 && (
                <span className="ml-1 w-4 h-4 bg-primary text-primary-foreground rounded-full text-[10px] flex items-center justify-center">
                  {pendingRegs.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="users" className="text-xs gap-1 py-2">
              <Users className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Users</span>
            </TabsTrigger>
            <TabsTrigger value="orders" className="text-xs gap-1 py-2">
              <Package className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Pesanan</span>
            </TabsTrigger>
            <TabsTrigger value="wilayah" className="text-xs gap-1 py-2">
              <MapPin className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Wilayah</span>
            </TabsTrigger>
            <TabsTrigger value="mitra" className="text-xs gap-1 py-2">
              <Store className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Mitra</span>
            </TabsTrigger>
            <TabsTrigger value="driver" className="text-xs gap-1 py-2">
              <Truck className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Driver</span>
            </TabsTrigger>
            <TabsTrigger value="setoran" className="text-xs gap-1 py-2">
              <Wallet className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Setoran</span>
            </TabsTrigger>
            <TabsTrigger value="laporan" className="text-xs gap-1 py-2">
              <BarChart3 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Laporan</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="text-xs gap-1 py-2">
              <Settings className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Setting</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="registrations" className="mt-4">
            {pendingRegs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Tidak ada pendaftaran menunggu</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingRegs.map((reg) => (
                  <div key={reg.id} className="bg-card border border-border rounded-xl p-3">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-sm">{reg.nama}</h3>
                        <p className="text-xs text-muted-foreground">{reg.no_whatsapp}</p>
                        <span className="inline-block mt-1 px-2 py-0.5 text-xs rounded-full bg-primary/10 text-primary">
                          {roleLabels[reg.requested_role] || reg.requested_role}
                        </span>
                      </div>
                      <span className="text-[10px] text-muted-foreground">
                        {new Date(reg.created_at).toLocaleDateString('id-ID')}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => handleApproveClick(reg)} className="flex-1 gap-1 h-8">
                        <CheckCircle className="w-3.5 h-3.5" />
                        Setujui
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleRejectRegistration(reg)} className="flex-1 gap-1 h-8">
                        <XCircle className="w-3.5 h-3.5" />
                        Tolak
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="users" className="mt-4">
            <AdminUserManager />
          </TabsContent>

          <TabsContent value="orders" className="mt-4">
            <AdminOrderManager />
          </TabsContent>

          <TabsContent value="wilayah" className="mt-4">
            <AdminWilayahPanel />
          </TabsContent>

          <TabsContent value="mitra" className="mt-4">
            <AdminMitraPanel />
          </TabsContent>

          <TabsContent value="driver" className="mt-4">
            <AdminDriverPanel />
          </TabsContent>

          <TabsContent value="setoran" className="mt-4">
            <AdminSetoranManager />
          </TabsContent>

          <TabsContent value="laporan" className="mt-4">
            <AdminReportPanel />
          </TabsContent>

          <TabsContent value="settings" className="mt-4">
            <AdminSettingsPanel />
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

      {/* Mitra Approval Dialog */}
      <Dialog open={!!approvingMitra} onOpenChange={(open) => !open && setApprovingMitra(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Setujui Mitra: {approvingMitra?.nama}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <p className="text-sm text-muted-foreground mb-2">
                Pilih warung yang akan dihubungkan dengan mitra ini:
              </p>
              <Select value={selectedWarungId} onValueChange={setSelectedWarungId}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih warung..." />
                </SelectTrigger>
                <SelectContent>
                  {warungs.map(w => (
                    <SelectItem key={w.id} value={w.id}>
                      {w.nama}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {warungs.length === 0 && (
                <p className="text-xs text-orange-600 mt-2">
                  Tidak ada warung tersedia. Semua warung sudah memiliki owner.
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setApprovingMitra(null)}
              >
                Batal
              </Button>
              <Button
                className="flex-1"
                onClick={() => approvingMitra && handleApproveRegistration(approvingMitra, selectedWarungId)}
              >
                {selectedWarungId ? 'Setujui & Hubungkan' : 'Setujui Tanpa Warung'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}

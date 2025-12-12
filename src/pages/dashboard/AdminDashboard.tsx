import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { 
  LogOut, Users, Store, MapPin, Package, 
  CheckCircle, XCircle, Clock, Shield
} from 'lucide-react';
import NavHeader from '@/components/NavHeader';
import Footer from '@/components/Footer';

interface PendingRegistration {
  id: string;
  nama: string;
  no_whatsapp: string;
  requested_role: string;
  status: string;
  created_at: string;
}

export default function AdminDashboard() {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [pendingRegs, setPendingRegs] = useState<PendingRegistration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalWarungs: 0,
    totalWilayahs: 0,
    totalOrders: 0,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    
    // Fetch pending registrations
    const { data: regs } = await supabase
      .from('pending_registrations')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false });
    
    setPendingRegs(regs || []);

    // Fetch stats
    const [
      { count: usersCount },
      { count: warungsCount },
      { count: wilayahsCount },
      { count: ordersCount },
    ] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('warungs').select('*', { count: 'exact', head: true }),
      supabase.from('wilayahs').select('*', { count: 'exact', head: true }),
      supabase.from('orders').select('*', { count: 'exact', head: true }),
    ]);

    setStats({
      totalUsers: usersCount || 0,
      totalWarungs: warungsCount || 0,
      totalWilayahs: wilayahsCount || 0,
      totalOrders: ordersCount || 0,
    });

    setIsLoading(false);
  };

  const handleApproveRegistration = async (reg: PendingRegistration) => {
    try {
      // Create user in auth
      const email = `${reg.no_whatsapp}@antarrasa.app`;
      const tempPassword = `Antar${reg.no_whatsapp.slice(-4)}!`;

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

      // Update registration status
      await supabase
        .from('pending_registrations')
        .update({ status: 'approved', processed_at: new Date().toISOString() })
        .eq('id', reg.id);

      toast({
        title: 'Berhasil',
        description: `Akun ${reg.nama} telah disetujui`,
      });

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

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <NavHeader />
      
      <main className="flex-1 container mx-auto px-4 py-6">
        {/* Welcome Card */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl p-6 text-white mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
              <Shield className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{profile?.nama || 'Admin'}</h1>
              <p className="opacity-90">Panel Administrator</p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <p className="text-2xl font-bold">{stats.totalUsers}</p>
            <p className="text-sm text-muted-foreground">Total User</p>
          </div>

          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <Store className="w-5 h-5 text-green-600" />
              </div>
            </div>
            <p className="text-2xl font-bold">{stats.totalWarungs}</p>
            <p className="text-sm text-muted-foreground">Total Warung</p>
          </div>

          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <MapPin className="w-5 h-5 text-purple-600" />
              </div>
            </div>
            <p className="text-2xl font-bold">{stats.totalWilayahs}</p>
            <p className="text-sm text-muted-foreground">Total Wilayah</p>
          </div>

          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                <Package className="w-5 h-5 text-orange-600" />
              </div>
            </div>
            <p className="text-2xl font-bold">{stats.totalOrders}</p>
            <p className="text-sm text-muted-foreground">Total Pesanan</p>
          </div>
        </div>

        {/* Pending Registrations */}
        <div className="bg-card border border-border rounded-xl p-4 mb-6">
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Pendaftaran Menunggu Verifikasi ({pendingRegs.length})
          </h2>
          
          {pendingRegs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CheckCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Tidak ada pendaftaran yang menunggu</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingRegs.map((reg) => (
                <div key={reg.id} className="border border-border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold">{reg.nama}</h3>
                      <p className="text-sm text-muted-foreground">{reg.no_whatsapp}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 text-xs rounded-full bg-primary/10 text-primary">
                        {roleLabels[reg.requested_role] || reg.requested_role}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(reg.created_at).toLocaleDateString('id-ID')}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleApproveRegistration(reg)}
                      className="flex-1 gap-1"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Setujui
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRejectRegistration(reg)}
                      className="flex-1 gap-1"
                    >
                      <XCircle className="w-4 h-4" />
                      Tolak
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
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
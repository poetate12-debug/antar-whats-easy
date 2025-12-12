import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Plus, Loader2, UserPlus, Trash2, Edit, Search } from 'lucide-react';
import { Switch } from '@/components/ui/switch';

interface User {
  id: string;
  user_id: string;
  nama: string;
  no_whatsapp: string;
  is_verified: boolean;
  is_active: boolean;
  created_at: string;
  role?: string;
  wilayah_id?: string;
}

interface Wilayah {
  id: string;
  nama: string;
}

interface Warung {
  id: string;
  nama: string;
  owner_id: string | null;
}

export default function AdminUserManager() {
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [wilayahs, setWilayahs] = useState<Wilayah[]>([]);
  const [warungs, setWarungs] = useState<Warung[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');

  // Form state
  const [formData, setFormData] = useState({
    nama: '',
    noWhatsapp: '',
    password: '',
    role: 'mitra' as 'mitra' | 'driver',
    wilayahId: '',
    warungId: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);

    // Fetch users with roles (only mitra and driver)
    const { data: profiles } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    // Fetch roles for each user
    const { data: roles } = await supabase
      .from('user_roles')
      .select('user_id, role')
      .in('role', ['mitra', 'driver']);

    // Merge profiles with roles
    const usersWithRoles = (profiles || []).map(profile => {
      const userRole = roles?.find(r => r.user_id === profile.user_id);
      return {
        ...profile,
        role: userRole?.role,
      };
    }).filter(u => u.role === 'mitra' || u.role === 'driver');

    setUsers(usersWithRoles);

    // Fetch wilayahs
    const { data: wilayahData } = await supabase
      .from('wilayahs')
      .select('id, nama')
      .eq('is_active', true);
    setWilayahs(wilayahData || []);

    // Fetch warungs without owner
    const { data: warungData } = await supabase
      .from('warungs')
      .select('id, nama, owner_id')
      .is('owner_id', null);
    setWarungs(warungData || []);

    setIsLoading(false);
  };

  const handleCreateUser = async () => {
    if (!formData.nama.trim() || !formData.noWhatsapp.trim() || !formData.password.trim()) {
      toast({
        title: 'Error',
        description: 'Lengkapi semua field yang wajib diisi',
        variant: 'destructive',
      });
      return;
    }

    if (formData.password.length < 6) {
      toast({
        title: 'Error',
        description: 'Password minimal 6 karakter',
        variant: 'destructive',
      });
      return;
    }

    if (formData.role === 'driver' && !formData.wilayahId) {
      toast({
        title: 'Error',
        description: 'Pilih wilayah untuk driver',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);

    try {
      const cleanPhone = formData.noWhatsapp.replace(/\D/g, '');
      const email = `${cleanPhone}@gelis.app`;

      // Call edge function to create user (requires service role)
      const { data, error } = await supabase.functions.invoke('create-user', {
        body: {
          email,
          password: formData.password,
          nama: formData.nama.trim(),
          noWhatsapp: cleanPhone,
          role: formData.role,
          wilayahId: formData.role === 'driver' ? formData.wilayahId : null,
          warungId: formData.role === 'mitra' ? formData.warungId : null,
        },
      });

      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || 'Failed to create user');

      toast({
        title: 'Berhasil',
        description: `Akun ${formData.role} berhasil dibuat`,
      });

      // Reset form
      setFormData({
        nama: '',
        noWhatsapp: '',
        password: '',
        role: 'mitra',
        wilayahId: '',
        warungId: '',
      });
      setIsDialogOpen(false);
      fetchData();
    } catch (error: any) {
      console.error('Error creating user:', error);
      toast({
        title: 'Error',
        description: error.message || 'Gagal membuat akun',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleActive = async (user: User) => {
    try {
      await supabase
        .from('profiles')
        .update({ is_active: !user.is_active })
        .eq('id', user.id);

      toast({
        title: user.is_active ? 'Dinonaktifkan' : 'Diaktifkan',
        description: `Akun ${user.nama} telah ${user.is_active ? 'dinonaktifkan' : 'diaktifkan'}`,
      });

      fetchData();
    } catch (error) {
      console.error('Error toggling user:', error);
      toast({
        title: 'Error',
        description: 'Gagal mengubah status akun',
        variant: 'destructive',
      });
    }
  };

  const handleToggleVerified = async (user: User) => {
    try {
      await supabase
        .from('profiles')
        .update({ is_verified: !user.is_verified })
        .eq('id', user.id);

      toast({
        title: user.is_verified ? 'Verifikasi Dicabut' : 'Terverifikasi',
        description: `Akun ${user.nama} telah ${user.is_verified ? 'dicabut verifikasinya' : 'diverifikasi'}`,
      });

      fetchData();
    } catch (error) {
      console.error('Error toggling verification:', error);
      toast({
        title: 'Error',
        description: 'Gagal mengubah status verifikasi',
        variant: 'destructive',
      });
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.no_whatsapp.includes(searchQuery);
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-lg font-semibold">Kelola User</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1">
              <UserPlus className="w-4 h-4" />
              Tambah User
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Tambah User Baru</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Role</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value: 'mitra' | 'driver') => 
                    setFormData(prev => ({ ...prev, role: value, wilayahId: '', warungId: '' }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mitra">🏪 Mitra</SelectItem>
                    <SelectItem value="driver">🛵 Driver</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Nama Lengkap *</Label>
                <Input
                  placeholder="Nama lengkap"
                  value={formData.nama}
                  onChange={(e) => setFormData(prev => ({ ...prev, nama: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label>Nomor WhatsApp *</Label>
                <Input
                  placeholder="08123456789"
                  value={formData.noWhatsapp}
                  onChange={(e) => setFormData(prev => ({ ...prev, noWhatsapp: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label>Password *</Label>
                <Input
                  type="password"
                  placeholder="Minimal 6 karakter"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                />
              </div>

              {formData.role === 'driver' && (
                <div className="space-y-2">
                  <Label>Wilayah *</Label>
                  <Select
                    value={formData.wilayahId}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, wilayahId: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih wilayah..." />
                    </SelectTrigger>
                    <SelectContent>
                      {wilayahs.map(w => (
                        <SelectItem key={w.id} value={w.id}>{w.nama}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {formData.role === 'mitra' && (
                <div className="space-y-2">
                  <Label>Assign ke Warung (opsional)</Label>
                  <Select
                    value={formData.warungId}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, warungId: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih warung..." />
                    </SelectTrigger>
                    <SelectContent>
                      {warungs.map(w => (
                        <SelectItem key={w.id} value={w.id}>{w.nama}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {warungs.length === 0 && (
                    <p className="text-xs text-muted-foreground">
                      Semua warung sudah memiliki owner
                    </p>
                  )}
                </div>
              )}

              <Button onClick={handleCreateUser} className="w-full" disabled={isSaving}>
                {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Buat Akun
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Cari nama/nomor..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={filterRole} onValueChange={setFilterRole}>
          <SelectTrigger className="w-28">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua</SelectItem>
            <SelectItem value="mitra">Mitra</SelectItem>
            <SelectItem value="driver">Driver</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* User List */}
      {filteredUsers.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <p>Tidak ada user ditemukan</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredUsers.map((user) => (
            <div key={user.id} className="bg-card border border-border rounded-xl p-3">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">
                      {user.role === 'mitra' ? '🏪' : '🛵'}
                    </span>
                    <h3 className="font-semibold text-sm">{user.nama}</h3>
                  </div>
                  <p className="text-xs text-muted-foreground">{user.no_whatsapp}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className={`px-2 py-0.5 text-[10px] rounded-full ${
                    user.is_active 
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                      : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                  }`}>
                    {user.is_active ? 'Aktif' : 'Nonaktif'}
                  </span>
                  {user.is_verified && (
                    <span className="px-2 py-0.5 text-[10px] rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                      Verified
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3 pt-2 border-t border-border">
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-muted-foreground">Aktif:</span>
                  <Switch
                    checked={user.is_active}
                    onCheckedChange={() => handleToggleActive(user)}
                  />
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-muted-foreground">Verified:</span>
                  <Switch
                    checked={user.is_verified}
                    onCheckedChange={() => handleToggleVerified(user)}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

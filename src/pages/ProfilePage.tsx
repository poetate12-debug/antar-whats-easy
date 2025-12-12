import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import NavHeader from '@/components/NavHeader';
import BottomNavigation from '@/components/BottomNavigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { 
  User, 
  MapPin, 
  Phone, 
  LogOut, 
  Save, 
  Camera,
  Settings,
  Shield,
  Bell
} from 'lucide-react';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, profile, role, signOut, refreshProfile } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    nama: '',
    alamat: '',
  });

  useEffect(() => {
    if (!user) {
      navigate('/auth', { state: { from: '/profile' } });
      return;
    }

    if (profile) {
      setFormData({
        nama: profile.nama || '',
        alamat: profile.alamat || '',
      });
    }
  }, [user, profile, navigate]);

  const handleSave = async () => {
    if (!profile) return;

    setIsSaving(true);
    const { error } = await supabase
      .from('profiles')
      .update({
        nama: formData.nama,
        alamat: formData.alamat,
        updated_at: new Date().toISOString(),
      })
      .eq('id', profile.id);

    if (error) {
      toast({
        title: 'Gagal menyimpan',
        description: 'Terjadi kesalahan saat menyimpan profil',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Berhasil',
        description: 'Profil berhasil diperbarui',
      });
      await refreshProfile();
      setIsEditing(false);
    }
    setIsSaving(false);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const getRoleBadge = () => {
    switch (role) {
      case 'admin':
        return { label: 'Admin', color: 'bg-red-500/10 text-red-600' };
      case 'mitra':
        return { label: 'Mitra Warung', color: 'bg-blue-500/10 text-blue-600' };
      case 'driver':
        return { label: 'Driver', color: 'bg-green-500/10 text-green-600' };
      default:
        return { label: 'Pelanggan', color: 'bg-primary/10 text-primary' };
    }
  };

  const roleBadge = getRoleBadge();

  if (!user || !profile) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <NavHeader />

      <main className="container mx-auto px-4 py-6">
        {/* Profile Header */}
        <div className="bg-gradient-to-r from-primary to-primary/80 rounded-2xl p-6 text-primary-foreground mb-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Avatar className="w-20 h-20 border-4 border-white/20">
                <AvatarImage src={profile.foto_url || undefined} />
                <AvatarFallback className="bg-white/20 text-2xl">
                  {profile.nama?.charAt(0)?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <button className="absolute bottom-0 right-0 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg">
                <Camera className="w-4 h-4 text-primary" />
              </button>
            </div>
            <div className="flex-1">
              <h1 className="text-xl font-bold">{profile.nama}</h1>
              <p className="opacity-90 text-sm">{profile.no_whatsapp}</p>
              <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium ${roleBadge.color} bg-white/20`}>
                {roleBadge.label}
              </span>
            </div>
          </div>
        </div>

        {/* Profile Info Card */}
        <Card className="mb-4">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="w-5 h-5" />
              Informasi Pribadi
            </CardTitle>
            {!isEditing ? (
              <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
                Edit
              </Button>
            ) : null}
          </CardHeader>
          <CardContent className="space-y-4">
            {isEditing ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="nama">Nama Lengkap</Label>
                  <Input
                    id="nama"
                    value={formData.nama}
                    onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                    placeholder="Masukkan nama lengkap"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="alamat">Alamat Pengiriman Utama</Label>
                  <Textarea
                    id="alamat"
                    value={formData.alamat}
                    onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                    placeholder="Masukkan alamat lengkap"
                    rows={3}
                  />
                </div>
                <div className="flex gap-2">
                  <Button 
                    onClick={handleSave} 
                    disabled={isSaving}
                    className="flex-1"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {isSaving ? 'Menyimpan...' : 'Simpan'}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setIsEditing(false);
                      setFormData({
                        nama: profile.nama || '',
                        alamat: profile.alamat || '',
                      });
                    }}
                  >
                    Batal
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-start gap-3 py-2 border-b border-border">
                  <User className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Nama</p>
                    <p className="font-medium">{profile.nama}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 py-2 border-b border-border">
                  <Phone className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">WhatsApp</p>
                    <p className="font-medium">{profile.no_whatsapp}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 py-2">
                  <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Alamat Utama</p>
                    <p className="font-medium">{profile.alamat || 'Belum diatur'}</p>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Quick Links */}
        <Card className="mb-4">
          <CardContent className="p-2">
            <button className="w-full flex items-center gap-3 p-3 hover:bg-muted rounded-lg transition-colors">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Bell className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-medium">Notifikasi</p>
                <p className="text-sm text-muted-foreground">Kelola pengaturan notifikasi</p>
              </div>
            </button>
            <button className="w-full flex items-center gap-3 p-3 hover:bg-muted rounded-lg transition-colors">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-medium">Keamanan</p>
                <p className="text-sm text-muted-foreground">Ubah password</p>
              </div>
            </button>
            <button className="w-full flex items-center gap-3 p-3 hover:bg-muted rounded-lg transition-colors">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Settings className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-medium">Pengaturan</p>
                <p className="text-sm text-muted-foreground">Pengaturan aplikasi</p>
              </div>
            </button>
          </CardContent>
        </Card>

        {/* Dashboard Link for non-customer roles */}
        {role && role !== 'pelanggan' && (
          <Button 
            variant="outline" 
            className="w-full mb-4"
            onClick={() => navigate(`/dashboard/${role}`)}
          >
            Buka Dashboard {roleBadge.label}
          </Button>
        )}

        {/* Sign Out */}
        <Button
          variant="destructive"
          className="w-full gap-2"
          onClick={handleSignOut}
        >
          <LogOut className="w-4 h-4" />
          Keluar
        </Button>
      </main>

      <BottomNavigation />
    </div>
  );
}

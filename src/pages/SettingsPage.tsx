import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import NavHeader from '@/components/NavHeader';
import BottomNavigation from '@/components/BottomNavigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { 
  Bell, 
  MapPin, 
  Plus, 
  Trash2, 
  ArrowLeft,
  Moon,
  Volume2,
  MessageSquare,
  Package
} from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';

interface SavedAddress {
  id: string;
  label: string;
  address: string;
}

interface NotificationPreferences {
  orderUpdates: boolean;
  promotions: boolean;
  soundEnabled: boolean;
}

const STORAGE_KEY_ADDRESSES = 'gelis_saved_addresses';
const STORAGE_KEY_NOTIFICATIONS = 'gelis_notification_prefs';

export default function SettingsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [newAddress, setNewAddress] = useState({ label: '', address: '' });
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [notifications, setNotifications] = useState<NotificationPreferences>({
    orderUpdates: true,
    promotions: false,
    soundEnabled: true,
  });

  useEffect(() => {
    if (!user) {
      navigate('/auth', { state: { from: '/settings' } });
      return;
    }

    // Load saved addresses from localStorage
    const savedAddresses = localStorage.getItem(STORAGE_KEY_ADDRESSES);
    if (savedAddresses) {
      setAddresses(JSON.parse(savedAddresses));
    }

    // Load notification preferences
    const savedNotifications = localStorage.getItem(STORAGE_KEY_NOTIFICATIONS);
    if (savedNotifications) {
      setNotifications(JSON.parse(savedNotifications));
    }
  }, [user, navigate]);

  const saveAddresses = (newAddresses: SavedAddress[]) => {
    setAddresses(newAddresses);
    localStorage.setItem(STORAGE_KEY_ADDRESSES, JSON.stringify(newAddresses));
  };

  const saveNotifications = (prefs: NotificationPreferences) => {
    setNotifications(prefs);
    localStorage.setItem(STORAGE_KEY_NOTIFICATIONS, JSON.stringify(prefs));
  };

  const handleAddAddress = () => {
    if (!newAddress.label.trim() || !newAddress.address.trim()) {
      toast({
        title: 'Data tidak lengkap',
        description: 'Label dan alamat harus diisi',
        variant: 'destructive',
      });
      return;
    }

    const newSavedAddress: SavedAddress = {
      id: Date.now().toString(),
      label: newAddress.label.trim(),
      address: newAddress.address.trim(),
    };

    saveAddresses([...addresses, newSavedAddress]);
    setNewAddress({ label: '', address: '' });
    setIsAddingAddress(false);
    toast({ title: 'Alamat berhasil disimpan' });
  };

  const handleDeleteAddress = (id: string) => {
    saveAddresses(addresses.filter(a => a.id !== id));
    toast({ title: 'Alamat dihapus' });
  };

  const handleNotificationChange = (key: keyof NotificationPreferences, value: boolean) => {
    const updated = { ...notifications, [key]: value };
    saveNotifications(updated);
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background pb-20">
      <NavHeader />

      <main className="container mx-auto px-4 py-6">
        {/* Back Button */}
        <Button
          variant="ghost"
          size="sm"
          className="mb-4"
          onClick={() => navigate('/profile')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Kembali ke Profil
        </Button>

        <h1 className="text-2xl font-bold mb-6">Pengaturan</h1>

        {/* Appearance */}
        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Moon className="w-5 h-5" />
              Tampilan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Mode Gelap</p>
                <p className="text-sm text-muted-foreground">Aktifkan tema gelap</p>
              </div>
              <Switch
                checked={isDark}
                onCheckedChange={toggleTheme}
              />
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Notifikasi
            </CardTitle>
            <CardDescription>
              Kelola preferensi notifikasi Anda
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Package className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Update Pesanan</p>
                  <p className="text-sm text-muted-foreground">Notifikasi status pesanan</p>
                </div>
              </div>
              <Switch
                checked={notifications.orderUpdates}
                onCheckedChange={(v) => handleNotificationChange('orderUpdates', v)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <MessageSquare className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Promo & Penawaran</p>
                  <p className="text-sm text-muted-foreground">Info promo terbaru</p>
                </div>
              </div>
              <Switch
                checked={notifications.promotions}
                onCheckedChange={(v) => handleNotificationChange('promotions', v)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Volume2 className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Suara Notifikasi</p>
                  <p className="text-sm text-muted-foreground">Bunyi saat ada notifikasi</p>
                </div>
              </div>
              <Switch
                checked={notifications.soundEnabled}
                onCheckedChange={(v) => handleNotificationChange('soundEnabled', v)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Saved Addresses */}
        <Card className="mb-4">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Alamat Tersimpan
                </CardTitle>
                <CardDescription>
                  Simpan alamat favorit untuk checkout cepat
                </CardDescription>
              </div>
              {!isAddingAddress && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setIsAddingAddress(true)}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Tambah
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {isAddingAddress && (
              <div className="mb-4 p-4 border border-border rounded-lg bg-muted/50 space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="label">Label (contoh: Rumah, Kantor)</Label>
                  <Input
                    id="label"
                    value={newAddress.label}
                    onChange={(e) => setNewAddress({ ...newAddress, label: e.target.value })}
                    placeholder="Rumah"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Alamat Lengkap</Label>
                  <Input
                    id="address"
                    value={newAddress.address}
                    onChange={(e) => setNewAddress({ ...newAddress, address: e.target.value })}
                    placeholder="Jl. Contoh No. 123, RT/RW, Kelurahan, Kecamatan"
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleAddAddress} size="sm" className="flex-1">
                    Simpan
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setIsAddingAddress(false);
                      setNewAddress({ label: '', address: '' });
                    }}
                  >
                    Batal
                  </Button>
                </div>
              </div>
            )}

            {addresses.length === 0 && !isAddingAddress ? (
              <p className="text-muted-foreground text-center py-6">
                Belum ada alamat tersimpan
              </p>
            ) : (
              <div className="space-y-3">
                {addresses.map((addr) => (
                  <div 
                    key={addr.id} 
                    className="flex items-start justify-between p-3 border border-border rounded-lg"
                  >
                    <div className="flex-1">
                      <p className="font-medium">{addr.label}</p>
                      <p className="text-sm text-muted-foreground">{addr.address}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleDeleteAddress(addr.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      <BottomNavigation />
    </div>
  );
}

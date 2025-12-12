import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Phone, Lock, User, MapPin, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

type AuthMode = 'login' | 'register';
type RoleType = 'pelanggan' | 'driver' | 'mitra';

export default function Auth() {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const { toast } = useToast();
  
  const [mode, setMode] = useState<AuthMode>('login');
  const [isLoading, setIsLoading] = useState(false);
  
  // Form state
  const [nama, setNama] = useState('');
  const [noWhatsapp, setNoWhatsapp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<RoleType>('pelanggan');
  const [alamat, setAlamat] = useState('');

  const validateWhatsapp = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '');
    return cleaned.length >= 10 && cleaned.length <= 15;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateWhatsapp(noWhatsapp)) {
      toast({
        title: 'Error',
        description: 'Nomor WhatsApp tidak valid',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    const { error } = await signIn(noWhatsapp, password);
    setIsLoading(false);

    if (error) {
      toast({
        title: 'Login Gagal',
        description: 'Nomor WhatsApp atau password salah',
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: 'Login Berhasil',
      description: 'Selamat datang kembali!',
    });
    navigate('/');
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nama.trim()) {
      toast({
        title: 'Error',
        description: 'Nama lengkap harus diisi',
        variant: 'destructive',
      });
      return;
    }

    if (!validateWhatsapp(noWhatsapp)) {
      toast({
        title: 'Error',
        description: 'Nomor WhatsApp tidak valid',
        variant: 'destructive',
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: 'Error',
        description: 'Password minimal 6 karakter',
        variant: 'destructive',
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: 'Error',
        description: 'Password dan konfirmasi tidak sama',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      // Save to pending_registrations
      const { error: regError } = await supabase
        .from('pending_registrations')
        .insert({
          nama: nama.trim(),
          no_whatsapp: noWhatsapp.replace(/\D/g, ''),
          requested_role: selectedRole,
        });

      if (regError) {
        if (regError.code === '23505') {
          toast({
            title: 'Error',
            description: 'Nomor WhatsApp sudah terdaftar',
            variant: 'destructive',
          });
        } else {
          throw regError;
        }
        setIsLoading(false);
        return;
      }

      // Generate WhatsApp message
      const roleText = {
        pelanggan: 'Pelanggan',
        driver: 'Driver',
        mitra: 'Mitra/Pemilik Warung',
      };

      const message = `*Pendaftaran AntarRasa*%0A%0ANama: ${nama}%0ANo. WhatsApp: ${noWhatsapp}%0ARole: ${roleText[selectedRole]}%0AAlamat: ${alamat || '-'}%0A%0AMohon diverifikasi. Terima kasih.`;
      
      // Admin WhatsApp number - you can change this
      const adminWa = '6281234567890';
      const waLink = `https://wa.me/${adminWa}?text=${message}`;

      setIsLoading(false);

      toast({
        title: 'Pendaftaran Berhasil',
        description: 'Silakan kirim pesan ke admin untuk verifikasi akun',
      });

      // Redirect to WhatsApp
      window.open(waLink, '_blank');
      
      // Reset form and switch to login
      setNama('');
      setNoWhatsapp('');
      setPassword('');
      setConfirmPassword('');
      setAlamat('');
      setMode('login');

    } catch (error) {
      console.error('Registration error:', error);
      toast({
        title: 'Error',
        description: 'Terjadi kesalahan saat mendaftar',
        variant: 'destructive',
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center">
          <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-5 h-5" />
            <span>Kembali</span>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          {/* Logo */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-primary">🍽️ AntarRasa</h1>
            <p className="text-muted-foreground mt-2">
              {mode === 'login' ? 'Masuk ke akun Anda' : 'Daftar akun baru'}
            </p>
          </div>

          {/* Tab Switcher */}
          <div className="flex bg-muted rounded-xl p-1 mb-6">
            <button
              onClick={() => setMode('login')}
              className={`flex-1 py-3 rounded-lg font-medium transition-all ${
                mode === 'login'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground'
              }`}
            >
              Masuk
            </button>
            <button
              onClick={() => setMode('register')}
              className={`flex-1 py-3 rounded-lg font-medium transition-all ${
                mode === 'register'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground'
              }`}
            >
              Daftar
            </button>
          </div>

          {/* Login Form */}
          {mode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login-wa">Nomor WhatsApp</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="login-wa"
                    type="tel"
                    placeholder="08123456789"
                    value={noWhatsapp}
                    onChange={(e) => setNoWhatsapp(e.target.value)}
                    className="pl-11"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="login-password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="Masukkan password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-11"
                    required
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Masuk
              </Button>
            </form>
          )}

          {/* Register Form */}
          {mode === 'register' && (
            <form onSubmit={handleRegister} className="space-y-4">
              {/* Role Selection */}
              <div className="space-y-2">
                <Label>Daftar Sebagai</Label>
                <div className="grid grid-cols-3 gap-2">
                  {(['pelanggan', 'driver', 'mitra'] as RoleType[]).map((role) => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => setSelectedRole(role)}
                      className={`p-3 rounded-xl border-2 transition-all text-center ${
                        selectedRole === role
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <div className="text-2xl mb-1">
                        {role === 'pelanggan' && '👤'}
                        {role === 'driver' && '🛵'}
                        {role === 'mitra' && '🏪'}
                      </div>
                      <div className="text-xs font-medium capitalize">{role}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reg-nama">Nama Lengkap</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="reg-nama"
                    type="text"
                    placeholder="Nama lengkap Anda"
                    value={nama}
                    onChange={(e) => setNama(e.target.value)}
                    className="pl-11"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reg-wa">Nomor WhatsApp</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="reg-wa"
                    type="tel"
                    placeholder="08123456789"
                    value={noWhatsapp}
                    onChange={(e) => setNoWhatsapp(e.target.value)}
                    className="pl-11"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reg-alamat">Alamat (Opsional)</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="reg-alamat"
                    type="text"
                    placeholder="Alamat lengkap"
                    value={alamat}
                    onChange={(e) => setAlamat(e.target.value)}
                    className="pl-11"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reg-password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="reg-password"
                    type="password"
                    placeholder="Minimal 6 karakter"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-11"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reg-confirm">Konfirmasi Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="reg-confirm"
                    type="password"
                    placeholder="Ulangi password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-11"
                    required
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Daftar & Kirim ke Admin
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                Setelah daftar, Anda akan diarahkan ke WhatsApp untuk mengirim pesan verifikasi ke admin.
              </p>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
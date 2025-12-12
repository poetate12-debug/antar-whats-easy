import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Phone, Lock, User, MapPin, Loader2, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { wilayahData } from '@/data/wilayah';

type AuthMode = 'login' | 'register';
type RoleType = 'pelanggan' | 'driver' | 'mitra';

export default function Auth() {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const { toast } = useToast();
  
  const [mode, setMode] = useState<AuthMode>('login');
  const [isLoading, setIsLoading] = useState(false);
  const [loginRole, setLoginRole] = useState<RoleType>('pelanggan');
  
  // Form state
  const [nama, setNama] = useState('');
  const [noWhatsapp, setNoWhatsapp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<RoleType>('pelanggan');
  const [alamat, setAlamat] = useState('');
  const [selectedWilayah, setSelectedWilayah] = useState('');

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

    if (selectedRole === 'mitra' && !selectedWilayah) {
      toast({
        title: 'Error',
        description: 'Pilih wilayah untuk warung Anda',
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

      const wilayahNama = wilayahData.find(w => w.id === selectedWilayah)?.nama || '-';
      const message = `*Pendaftaran GELIS DELIVERY*%0A%0ANama: ${nama}%0ANo. WhatsApp: ${noWhatsapp}%0ARole: ${roleText[selectedRole]}${selectedRole === 'mitra' ? `%0AWilayah: ${wilayahNama}` : ''}%0AAlamat: ${alamat || '-'}%0A%0AMohon diverifikasi. Terima kasih.`;
      
      // Admin WhatsApp number
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
      setSelectedWilayah('');
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

  const handleContactAdmin = () => {
    const adminWa = '6281234567890';
    const message = `Halo Admin GELIS DELIVERY,%0A%0ASaya ingin mendaftar sebagai Driver.%0A%0ANama: ${nama || '[isi nama Anda]'}%0ANo. WhatsApp: ${noWhatsapp || '[isi nomor Anda]'}%0A%0AMohon informasi lebih lanjut. Terima kasih.`;
    window.open(`https://wa.me/${adminWa}?text=${message}`, '_blank');
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
            <h1 className="text-3xl font-bold text-primary">🚀 GELIS DELIVERY</h1>
            <p className="text-muted-foreground mt-2">
              {mode === 'login' ? 'Masuk ke akun Anda' : 'Daftar akun baru'}
            </p>
          </div>

          {/* Login Form */}
          {mode === 'login' && (
            <div className="space-y-6">
              {/* Role Selection for Login */}
              <div className="space-y-3">
                <Label className="text-center block text-lg font-semibold">Masuk Sebagai</Label>
                <div className="grid grid-cols-3 gap-3">
                  {(['pelanggan', 'driver', 'mitra'] as RoleType[]).map((role) => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => setLoginRole(role)}
                      className={`p-4 rounded-xl border-2 transition-all text-center ${
                        loginRole === role
                          ? 'border-primary bg-primary/10 text-primary shadow-lg scale-105'
                          : 'border-border hover:border-primary/50 bg-card'
                      }`}
                    >
                      <div className="text-3xl mb-2">
                        {role === 'pelanggan' && '👤'}
                        {role === 'driver' && '🛵'}
                        {role === 'mitra' && '🏪'}
                      </div>
                      <div className="text-sm font-semibold capitalize">{role}</div>
                    </button>
                  ))}
                </div>
              </div>

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

                <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                  {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Masuk
                </Button>
              </form>

              {/* Register Button */}
              <div className="pt-4 border-t border-border">
                <p className="text-center text-muted-foreground mb-3">Belum punya akun?</p>
                <Button 
                  variant="outline" 
                  className="w-full" 
                  size="lg"
                  onClick={() => setMode('register')}
                >
                  Daftar Sekarang
                </Button>
              </div>
            </div>
          )}

          {/* Register Form */}
          {mode === 'register' && (
            <div className="space-y-6">
              {/* Role Selection */}
              <div className="space-y-3">
                <Label className="text-center block text-lg font-semibold">Daftar Sebagai</Label>
                <div className="grid grid-cols-3 gap-3">
                  {(['pelanggan', 'driver', 'mitra'] as RoleType[]).map((role) => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => setSelectedRole(role)}
                      className={`p-4 rounded-xl border-2 transition-all text-center ${
                        selectedRole === role
                          ? 'border-primary bg-primary/10 text-primary shadow-lg scale-105'
                          : 'border-border hover:border-primary/50 bg-card'
                      }`}
                    >
                      <div className="text-3xl mb-2">
                        {role === 'pelanggan' && '👤'}
                        {role === 'driver' && '🛵'}
                        {role === 'mitra' && '🏪'}
                      </div>
                      <div className="text-sm font-semibold capitalize">{role}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Driver Contact Admin Button */}
              {selectedRole === 'driver' && (
                <div className="bg-accent/10 rounded-xl p-4 space-y-3">
                  <p className="text-sm text-center text-muted-foreground">
                    Untuk mendaftar sebagai Driver, silakan hubungi admin langsung via WhatsApp
                  </p>
                  <Button 
                    type="button" 
                    className="w-full bg-green-600 hover:bg-green-700" 
                    size="lg"
                    onClick={handleContactAdmin}
                  >
                    <MessageCircle className="w-5 h-5 mr-2" />
                    Hubungi Admin
                  </Button>
                </div>
              )}

              {/* Registration Form for Pelanggan and Mitra */}
              {selectedRole !== 'driver' && (
                <form onSubmit={handleRegister} className="space-y-4">
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

                  {/* Wilayah Selection for Mitra */}
                  {selectedRole === 'mitra' && (
                    <div className="space-y-2">
                      <Label htmlFor="reg-wilayah">Wilayah Warung</Label>
                      <Select value={selectedWilayah} onValueChange={setSelectedWilayah}>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih wilayah warung Anda" />
                        </SelectTrigger>
                        <SelectContent>
                          {wilayahData.filter(w => w.isActive).map((wilayah) => (
                            <SelectItem key={wilayah.id} value={wilayah.id}>
                              {wilayah.nama}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="reg-alamat">Alamat {selectedRole === 'mitra' ? 'Warung' : '(Opsional)'}</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        id="reg-alamat"
                        type="text"
                        placeholder="Alamat lengkap"
                        value={alamat}
                        onChange={(e) => setAlamat(e.target.value)}
                        className="pl-11"
                        required={selectedRole === 'mitra'}
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

                  <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                    {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Daftar & Kirim ke Admin
                  </Button>

                  <p className="text-xs text-center text-muted-foreground">
                    Setelah daftar, Anda akan diarahkan ke WhatsApp untuk mengirim pesan verifikasi ke admin.
                  </p>
                </form>
              )}

              {/* Back to Login */}
              <div className="pt-4 border-t border-border">
                <p className="text-center text-muted-foreground mb-3">Sudah punya akun?</p>
                <Button 
                  variant="outline" 
                  className="w-full" 
                  size="lg"
                  onClick={() => setMode('login')}
                >
                  Masuk
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

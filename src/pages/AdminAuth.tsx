import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Lock, Shield, Loader2, User } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AdminAuth() {
  const navigate = useNavigate();
  const { signIn, user, role, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // Redirect if already logged in as admin
  useEffect(() => {
    if (!authLoading && user && role === 'admin') {
      navigate('/dashboard/admin', { replace: true });
    }
  }, [user, role, authLoading, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim()) {
      toast({
        title: 'Error',
        description: 'Username harus diisi',
        variant: 'destructive',
      });
      return;
    }

    if (!password) {
      toast({
        title: 'Error',
        description: 'Password harus diisi',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    
    // Use username directly for admin login
    const { error } = await signIn(username, password);
    
    if (error) {
      setIsLoading(false);
      toast({
        title: 'Login Gagal',
        description: 'Username atau password salah',
        variant: 'destructive',
      });
      return;
    }

    // Wait a moment for role to be fetched
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-lg border-b border-slate-700">
        <div className="container mx-auto px-4 h-16 flex items-center">
          <Link to="/" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span>Kembali</span>
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          {/* Logo & Title */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-primary to-primary/60 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-2xl shadow-primary/30">
              <Shield className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
            <p className="text-slate-400 mt-2">GELIS DELIVERY</p>
          </div>

          {/* Login Card */}
          <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-6 border border-slate-700 shadow-xl">
            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="admin-username" className="text-slate-300">Username</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <Input
                    id="admin-username"
                    type="text"
                    placeholder="Masukkan username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="pl-11 bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-primary"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="admin-password" className="text-slate-300">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <Input
                    id="admin-password"
                    type="password"
                    placeholder="Masukkan password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-11 bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-primary"
                    required
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 text-base font-semibold bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70" 
                size="lg" 
                disabled={isLoading}
              >
                {isLoading && <Loader2 className="w-5 h-5 mr-2 animate-spin" />}
                Masuk ke Panel Admin
              </Button>
            </form>

            <div className="mt-6 pt-4 border-t border-slate-700">
              <p className="text-center text-slate-500 text-sm">
                Hanya untuk administrator
              </p>
            </div>
          </div>

          {/* User Login Link */}
          <div className="mt-6 text-center">
            <Link 
              to="/auth" 
              className="text-slate-400 hover:text-primary transition-colors text-sm"
            >
              Login sebagai Pelanggan, Driver, atau Mitra →
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-slate-600 text-sm">
        © 2024 GELIS DELIVERY
      </footer>
    </div>
  );
}

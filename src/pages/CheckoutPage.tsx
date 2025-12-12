import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/hooks/useCart";
import { formatPrice } from "@/lib/whatsapp";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import NavHeader from "@/components/NavHeader";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Minus, Plus, CheckCircle, Loader2, AlertTriangle, UserPlus } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const FIRST_ORDER_LIMIT = 50000; // Limit 50rb untuk pelanggan baru

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { user, profile, isLoading: authLoading } = useAuth();
  const { cart, updateQuantity, clearCart, totalItems } = useCart();
  
  const [customerInfo, setCustomerInfo] = useState({
    nama: "",
    no_hp: "",
    alamat: "",
    catatan: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<string | null>(null);
  const [orderCount, setOrderCount] = useState<number | null>(null);
  const [checkingOrders, setCheckingOrders] = useState(true);

  // Pre-fill customer info from profile
  useEffect(() => {
    if (profile) {
      setCustomerInfo(prev => ({
        ...prev,
        nama: profile.nama || prev.nama,
        no_hp: profile.no_whatsapp || prev.no_hp,
        alamat: profile.alamat || prev.alamat,
      }));
    }
  }, [profile]);

  // Check if user is logged in
  useEffect(() => {
    if (!authLoading && !user) {
      toast({
        title: "Silakan daftar/login terlebih dahulu",
        description: "Untuk melanjutkan checkout, Anda perlu memiliki akun",
      });
      navigate('/auth', { state: { from: '/checkout', returnToCheckout: true } });
    }
  }, [user, authLoading, navigate]);

  // Check user's order count for first order limit
  useEffect(() => {
    const checkOrderCount = async () => {
      if (!profile?.no_whatsapp) {
        setCheckingOrders(false);
        return;
      }

      const { count, error } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('customer_phone', profile.no_whatsapp)
        .in('status', ['selesai']);

      if (!error) {
        setOrderCount(count || 0);
      }
      setCheckingOrders(false);
    };

    if (profile) {
      checkOrderCount();
    }
  }, [profile]);

  // Determine if first order limit applies
  const isNewCustomer = profile && !profile.is_verified && orderCount === 0;
  const exceedsFirstOrderLimit = isNewCustomer && cart && cart.total > FIRST_ORDER_LIMIT;

  if (authLoading || checkingOrders) {
    return (
      <div className="min-h-screen flex flex-col">
        <NavHeader showBack backTo="/" cartCount={0} />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Memuat...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect in useEffect
  }

  if (orderSuccess) {
    return (
      <div className="min-h-screen flex flex-col">
        <NavHeader showBack backTo="/" cartCount={0} />
        <main className="flex-grow flex items-center justify-center p-4">
          <div className="text-center max-w-md">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Pesanan Berhasil!
            </h1>
            <p className="text-muted-foreground mb-6">
              Pesanan Anda sedang diproses. Anda dapat melacak status pesanan.
            </p>
            <div className="space-y-3">
              <Button 
                onClick={() => navigate(`/order/${orderSuccess}`)}
                className="w-full"
              >
                Lacak Pesanan
              </Button>
              <Button 
                variant="outline"
                onClick={() => navigate("/")}
                className="w-full"
              >
                Kembali ke Beranda
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <NavHeader showBack backTo="/" cartCount={0} />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Keranjang Kosong
            </h1>
            <p className="text-muted-foreground mb-4">
              Silakan pilih menu terlebih dahulu
            </p>
            <Button onClick={() => navigate("/")}>Kembali ke Beranda</Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check first order limit
    if (exceedsFirstOrderLimit) {
      toast({
        title: "Melebihi Limit Pesanan Pertama",
        description: `Pesanan pertama dibatasi maksimal ${formatPrice(FIRST_ORDER_LIMIT)}. Kurangi item atau hubungi admin untuk verifikasi akun.`,
        variant: "destructive",
      });
      return;
    }

    if (!customerInfo.nama.trim()) {
      toast({
        title: "Error",
        description: "Nama harus diisi",
        variant: "destructive",
      });
      return;
    }

    if (!customerInfo.no_hp.trim()) {
      toast({
        title: "Error",
        description: "Nomor HP harus diisi",
        variant: "destructive",
      });
      return;
    }

    if (!customerInfo.alamat.trim()) {
      toast({
        title: "Error",
        description: "Alamat harus diisi",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare order items
      const orderItems = cart.items.map(item => ({
        menu_id: item.menuId,
        nama: item.nama,
        harga: item.harga,
        quantity: item.qty,
        subtotal: item.subtotal,
      }));

      // Insert order to database
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          customer_name: customerInfo.nama.trim(),
          customer_phone: customerInfo.no_hp.trim(),
          customer_address: customerInfo.alamat.trim(),
          catatan: customerInfo.catatan.trim() || null,
          warung_id: cart.warungId,
          wilayah_id: cart.wilayahId,
          items: orderItems,
          subtotal: cart.subtotal,
          ongkir: cart.ongkir,
          total: cart.total,
          status: 'pending',
        })
        .select('id')
        .single();

      if (orderError) {
        throw orderError;
      }

      // Success
      clearCart();
      setOrderSuccess(orderData.id);
      
      toast({
        title: "Pesanan Berhasil!",
        description: "Pesanan Anda sedang diproses",
      });
    } catch (error) {
      console.error('Error creating order:', error);
      toast({
        title: "Error",
        description: "Gagal membuat pesanan. Silakan coba lagi.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <NavHeader showBack backTo="/" backLabel="Kembali" cartCount={totalItems} />

      <main className="flex-grow pb-24">
        <div className="container mx-auto px-4 py-6 max-w-2xl">
          <h1 className="text-2xl font-bold text-foreground mb-6">
            Checkout
          </h1>

          {/* First Order Limit Warning */}
          {isNewCustomer && (
            <Alert className="mb-4 border-yellow-500/50 bg-yellow-500/10">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <AlertTitle className="text-yellow-700">Pelanggan Baru</AlertTitle>
              <AlertDescription className="text-yellow-600">
                Pesanan pertama dibatasi maksimal <strong>{formatPrice(FIRST_ORDER_LIMIT)}</strong>. 
                Setelah pesanan pertama selesai atau akun diverifikasi admin, limit akan dihapus.
              </AlertDescription>
            </Alert>
          )}

          {/* Limit Exceeded Error */}
          {exceedsFirstOrderLimit && (
            <Alert variant="destructive" className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Melebihi Limit</AlertTitle>
              <AlertDescription>
                Total pesanan ({formatPrice(cart.total)}) melebihi limit pesanan pertama ({formatPrice(FIRST_ORDER_LIMIT)}). 
                Kurangi item atau hubungi admin untuk verifikasi akun Anda.
              </AlertDescription>
            </Alert>
          )}

          {/* Order Summary */}
          <div className="bg-card rounded-xl border border-border p-4 mb-4">
            <h2 className="font-semibold text-foreground mb-3">
              Ringkasan Pesanan
            </h2>

            <div className="text-xs text-muted-foreground mb-3 space-y-1">
              <p>📍 {cart.wilayahNama}</p>
              <p>🏪 {cart.warungNama}</p>
            </div>

            <div className="divide-y divide-border">
              {cart.items.map((item) => (
                <div
                  key={item.menuId}
                  className="py-2 flex items-center justify-between"
                >
                  <div className="min-w-0 flex-grow">
                    <p className="font-medium text-sm">{item.nama}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatPrice(item.harga)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-6 h-6"
                        onClick={() => updateQuantity(item.menuId, item.qty - 1)}
                      >
                        <Minus className="w-3 h-3" />
                      </Button>
                      <span className="w-5 text-center text-sm">{item.qty}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-6 h-6"
                        onClick={() => updateQuantity(item.menuId, item.qty + 1)}
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>
                    <p className="font-medium text-sm w-20 text-right">
                      {formatPrice(item.subtotal)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-border pt-3 mt-3 space-y-1">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Subtotal</span>
                <span>{formatPrice(cart.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Ongkir</span>
                <span>{formatPrice(cart.ongkir)}</span>
              </div>
              <div className={`flex justify-between font-bold pt-2 border-t border-border ${exceedsFirstOrderLimit ? 'text-destructive' : 'text-foreground'}`}>
                <span>Total</span>
                <span className={exceedsFirstOrderLimit ? 'text-destructive' : 'text-primary'}>
                  {formatPrice(cart.total)}
                </span>
              </div>
            </div>
          </div>

          {/* Customer Info Form */}
          <form onSubmit={handleSubmit} className="bg-card rounded-xl border border-border p-4">
            <h2 className="font-semibold text-foreground mb-4">
              Data Pemesan
            </h2>

            <div className="space-y-4">
              <div>
                <Label htmlFor="nama">Nama Lengkap *</Label>
                <Input
                  id="nama"
                  type="text"
                  value={customerInfo.nama}
                  onChange={(e) =>
                    setCustomerInfo({ ...customerInfo, nama: e.target.value })
                  }
                  placeholder="Masukkan nama Anda"
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="no_hp">Nomor HP / WhatsApp *</Label>
                <Input
                  id="no_hp"
                  type="tel"
                  value={customerInfo.no_hp}
                  onChange={(e) =>
                    setCustomerInfo({ ...customerInfo, no_hp: e.target.value })
                  }
                  placeholder="08xxxxxxxxxx"
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="alamat">Alamat Lengkap *</Label>
                <Textarea
                  id="alamat"
                  value={customerInfo.alamat}
                  onChange={(e) =>
                    setCustomerInfo({ ...customerInfo, alamat: e.target.value })
                  }
                  placeholder="Masukkan alamat lengkap untuk pengiriman"
                  required
                  rows={2}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="catatan">Catatan (Opsional)</Label>
                <Textarea
                  id="catatan"
                  value={customerInfo.catatan}
                  onChange={(e) =>
                    setCustomerInfo({ ...customerInfo, catatan: e.target.value })
                  }
                  placeholder="Contoh: Tidak pakai sambal"
                  rows={2}
                  className="mt-1"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting || exceedsFirstOrderLimit}
              className="w-full mt-6"
              size="lg"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Memproses...
                </>
              ) : exceedsFirstOrderLimit ? (
                'Melebihi Limit Pesanan'
              ) : (
                `Pesan Sekarang • ${formatPrice(cart.total)}`
              )}
            </Button>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CheckoutPage;

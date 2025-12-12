import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import NavHeader from '@/components/NavHeader';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import DriverRatingModal from '@/components/DriverRatingModal';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { 
  Package, Clock, ChefHat, Truck, CheckCircle, XCircle,
  MapPin, Phone, Store, ArrowRight, Star
} from 'lucide-react';

interface Order {
  id: string;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  items: any[];
  subtotal: number;
  ongkir: number;
  total: number;
  status: string;
  catatan: string | null;
  created_at: string;
  driver_id: string | null;
  warung?: {
    nama: string;
    alamat: string;
    no_wa: string;
  };
  wilayah?: {
    nama: string;
  };
}

const statusSteps = [
  { key: 'pending', label: 'Menunggu Konfirmasi', icon: Clock },
  { key: 'diproses', label: 'Diproses Warung', icon: ChefHat },
  { key: 'menunggu_driver', label: 'Menunggu Driver', icon: Truck },
  { key: 'dalam_perjalanan', label: 'Dalam Perjalanan', icon: Truck },
  { key: 'selesai', label: 'Selesai', icon: CheckCircle },
];

export default function OrderTrackingPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [hasRated, setHasRated] = useState(false);

  // Check if user already rated this order
  const checkExistingRating = async () => {
    if (!orderId) return;
    const { data } = await supabase
      .from('driver_ratings')
      .select('id')
      .eq('order_id', orderId)
      .maybeSingle();
    
    if (data) setHasRated(true);
  };

  const fetchOrder = async () => {
    if (!orderId) return;

    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        warung:warungs(nama, alamat, no_wa),
        wilayah:wilayahs(nama)
      `)
      .eq('id', orderId)
      .maybeSingle();

    if (!error && data) {
      setOrder(data as unknown as Order);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchOrder();
    checkExistingRating();

    // Subscribe to realtime updates
    const channel = supabase
      .channel(`order-${orderId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `id=eq.${orderId}`
        },
        (payload) => {
          setOrder(prev => prev ? { ...prev, ...payload.new } as Order : null);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [orderId]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getCurrentStepIndex = () => {
    if (!order) return 0;
    if (order.status === 'dibatalkan') return -1;
    return statusSteps.findIndex(s => s.key === order.status);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <NavHeader showBack backTo="/" />
        <main className="flex-grow flex items-center justify-center">
          <div className="animate-pulse text-center">
            <Package className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p>Memuat pesanan...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col">
        <NavHeader showBack backTo="/" />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <XCircle className="w-12 h-12 mx-auto mb-4 text-destructive" />
            <h1 className="text-xl font-bold mb-2">Pesanan Tidak Ditemukan</h1>
            <p className="text-muted-foreground mb-4">ID pesanan tidak valid</p>
            <Button onClick={() => navigate('/')}>Kembali ke Beranda</Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const currentStep = getCurrentStepIndex();
  const isCancelled = order.status === 'dibatalkan';
  const isCompleted = order.status === 'selesai';

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <NavHeader showBack backTo="/" backLabel="Beranda" />

      <main className="flex-grow container mx-auto px-4 py-6 max-w-lg">
        {/* Order ID & Date */}
        <div className="text-center mb-6">
          <p className="text-xs text-muted-foreground">ID Pesanan</p>
          <p className="font-mono text-sm font-bold">#{order.id.slice(0, 8).toUpperCase()}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {format(new Date(order.created_at), 'd MMMM yyyy, HH:mm', { locale: id })}
          </p>
        </div>

        {/* Status Card */}
        <div className={`rounded-2xl p-6 mb-6 text-center ${
          isCancelled 
            ? 'bg-red-50 border border-red-200' 
            : isCompleted 
              ? 'bg-green-50 border border-green-200'
              : 'bg-primary/5 border border-primary/20'
        }`}>
          {isCancelled ? (
            <>
              <XCircle className="w-16 h-16 mx-auto mb-3 text-red-500" />
              <h2 className="text-xl font-bold text-red-700">Pesanan Dibatalkan</h2>
            </>
          ) : isCompleted ? (
            <>
              <CheckCircle className="w-16 h-16 mx-auto mb-3 text-green-500" />
              <h2 className="text-xl font-bold text-green-700">Pesanan Selesai</h2>
              <p className="text-sm text-green-600 mt-1">Terima kasih telah memesan!</p>
              
              {/* Rating Button */}
              {order.driver_id && !hasRated && (
                <Button
                  onClick={() => setShowRatingModal(true)}
                  className="mt-4 gap-2"
                  variant="outline"
                >
                  <Star className="w-4 h-4" />
                  Beri Rating Driver
                </Button>
              )}
              {hasRated && (
                <p className="text-sm text-muted-foreground mt-3 flex items-center justify-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  Anda sudah memberi rating
                </p>
              )}
            </>
          ) : (
            <>
              {(() => {
                const CurrentIcon = statusSteps[currentStep]?.icon || Clock;
                return <CurrentIcon className="w-16 h-16 mx-auto mb-3 text-primary animate-pulse" />;
              })()}
              <h2 className="text-xl font-bold text-primary">
                {statusSteps[currentStep]?.label || 'Menunggu'}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Pesanan sedang diproses
              </p>
            </>
          )}
        </div>

        {/* Progress Steps */}
        {!isCancelled && (
          <div className="bg-card rounded-xl border border-border p-4 mb-4">
            <h3 className="font-semibold text-sm mb-4">Status Pesanan</h3>
            <div className="space-y-3">
              {statusSteps.map((step, index) => {
                const isActive = index === currentStep;
                const isCompleted = index < currentStep || order.status === 'selesai';
                const Icon = step.icon;
                
                return (
                  <div key={step.key} className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      isCompleted 
                        ? 'bg-green-500 text-white' 
                        : isActive 
                          ? 'bg-primary text-primary-foreground animate-pulse' 
                          : 'bg-muted text-muted-foreground'
                    }`}>
                      {isCompleted ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : (
                        <Icon className="w-4 h-4" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${
                        isActive ? 'text-primary' : isCompleted ? 'text-foreground' : 'text-muted-foreground'
                      }`}>
                        {step.label}
                      </p>
                    </div>
                    {index < statusSteps.length - 1 && (
                      <ArrowRight className={`w-4 h-4 ${
                        isCompleted ? 'text-green-500' : 'text-muted-foreground/30'
                      }`} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Warung Info */}
        <div className="bg-card rounded-xl border border-border p-4 mb-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
              <Store className="w-5 h-5 text-accent" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-sm">{order.warung?.nama}</p>
              <p className="text-xs text-muted-foreground">{order.warung?.alamat}</p>
              {order.warung?.no_wa && (
                <a 
                  href={`https://wa.me/${order.warung.no_wa.replace(/\D/g, '')}`}
                  className="text-xs text-primary flex items-center gap-1 mt-1"
                >
                  <Phone className="w-3 h-3" />
                  Hubungi Warung
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Delivery Address */}
        <div className="bg-card rounded-xl border border-border p-4 mb-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <MapPin className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-sm">{order.customer_name}</p>
              <p className="text-xs text-muted-foreground">{order.customer_address}</p>
              <p className="text-xs text-muted-foreground">{order.customer_phone}</p>
              <p className="text-xs text-primary mt-1">{order.wilayah?.nama}</p>
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="bg-card rounded-xl border border-border p-4 mb-4">
          <h3 className="font-semibold text-sm mb-3">Detail Pesanan</h3>
          <div className="space-y-2">
            {order.items.map((item: any, idx: number) => {
              const qty = item.quantity || item.jumlah || 1;
              const itemTotal = item.subtotal || (item.harga * qty);
              return (
                <div key={idx} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {qty}x {item.nama}
                  </span>
                  <span>{formatCurrency(itemTotal)}</span>
                </div>
              );
            })}
          </div>
          <div className="border-t border-border mt-3 pt-3 space-y-1">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Subtotal</span>
              <span>{formatCurrency(order.subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Ongkir</span>
              <span>{formatCurrency(order.ongkir)}</span>
            </div>
            <div className="flex justify-between font-bold pt-2 border-t border-border">
              <span>Total</span>
              <span className="text-primary">{formatCurrency(order.total)}</span>
            </div>
          </div>
          {order.catatan && (
            <div className="mt-3 pt-3 border-t border-border">
              <p className="text-xs text-muted-foreground">Catatan:</p>
              <p className="text-sm">{order.catatan}</p>
            </div>
          )}
        </div>

        {/* Back Button */}
        <Button
          variant="outline"
          className="w-full"
          onClick={() => navigate('/')}
        >
          Pesan Lagi
        </Button>
      </main>

      <Footer />

      {/* Driver Rating Modal */}
      {order.driver_id && (
        <DriverRatingModal
          open={showRatingModal}
          onOpenChange={setShowRatingModal}
          orderId={order.id}
          driverId={order.driver_id}
          customerName={order.customer_name}
          onSuccess={() => setHasRated(true)}
        />
      )}
    </div>
  );
}

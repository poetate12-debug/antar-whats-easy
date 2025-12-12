import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import NavHeader from '@/components/NavHeader';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Package, Clock, CheckCircle, XCircle, Truck, ChefHat } from 'lucide-react';

interface Order {
  id: string;
  status: string;
  total: number;
  subtotal: number;
  ongkir: number;
  items: any[];
  customer_name: string;
  customer_address: string;
  created_at: string;
  warung: {
    nama: string;
    foto_url: string | null;
  } | null;
}

const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  pending: { label: 'Menunggu', color: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20', icon: <Clock className="w-4 h-4" /> },
  diproses_warung: { label: 'Diproses Warung', color: 'bg-blue-500/10 text-blue-600 border-blue-500/20', icon: <ChefHat className="w-4 h-4" /> },
  menunggu_driver: { label: 'Menunggu Driver', color: 'bg-purple-500/10 text-purple-600 border-purple-500/20', icon: <Package className="w-4 h-4" /> },
  diambil_driver: { label: 'Diambil Driver', color: 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20', icon: <Truck className="w-4 h-4" /> },
  dalam_perjalanan: { label: 'Dalam Perjalanan', color: 'bg-cyan-500/10 text-cyan-600 border-cyan-500/20', icon: <Truck className="w-4 h-4" /> },
  selesai: { label: 'Selesai', color: 'bg-green-500/10 text-green-600 border-green-500/20', icon: <CheckCircle className="w-4 h-4" /> },
  dibatalkan: { label: 'Dibatalkan', color: 'bg-red-500/10 text-red-600 border-red-500/20', icon: <XCircle className="w-4 h-4" /> },
};

const filterOptions = [
  { value: 'all', label: 'Semua' },
  { value: 'active', label: 'Aktif' },
  { value: 'selesai', label: 'Selesai' },
  { value: 'dibatalkan', label: 'Dibatalkan' },
];

export default function OrderHistoryPage() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const fetchOrders = async () => {
    if (!profile?.no_whatsapp) return;

    setIsLoading(true);
    const { data, error } = await supabase
      .from('orders')
      .select(`
        id,
        status,
        total,
        subtotal,
        ongkir,
        items,
        customer_name,
        customer_address,
        created_at,
        warung:warungs(nama, foto_url)
      `)
      .eq('customer_phone', profile.no_whatsapp)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setOrders(data as Order[]);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, [profile?.no_whatsapp]);

  // Realtime subscription
  useEffect(() => {
    if (!profile?.no_whatsapp) return;

    const channel = supabase
      .channel('customer-orders')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `customer_phone=eq.${profile.no_whatsapp}`,
        },
        () => {
          fetchOrders();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile?.no_whatsapp]);

  const filteredOrders = orders.filter((order) => {
    if (filter === 'all') return true;
    if (filter === 'active') {
      return !['selesai', 'dibatalkan'].includes(order.status);
    }
    return order.status === filter;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <NavHeader />

      <main className="flex-1 container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard/customer')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold">Riwayat Pesanan</h1>
            <p className="text-sm text-muted-foreground">{orders.length} pesanan</p>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-4 scrollbar-hide">
          {filterOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setFilter(option.value)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                filter === option.value
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        {/* Orders List */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32 rounded-xl" />
            ))}
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="font-semibold text-lg mb-2">Belum ada pesanan</h3>
            <p className="text-muted-foreground mb-4">
              {filter === 'all' ? 'Anda belum memiliki riwayat pesanan' : `Tidak ada pesanan dengan status "${filterOptions.find(f => f.value === filter)?.label}"`}
            </p>
            <Button onClick={() => navigate('/')}>Pesan Sekarang</Button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => {
              const status = statusConfig[order.status] || statusConfig.pending;
              return (
                <div
                  key={order.id}
                  onClick={() => navigate(`/order/${order.id}`)}
                  className="bg-card border border-border rounded-xl p-4 cursor-pointer hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold">{order.warung?.nama || 'Warung'}</h3>
                      <p className="text-xs text-muted-foreground">{formatDate(order.created_at)}</p>
                    </div>
                    <Badge className={`${status.color} border gap-1`}>
                      {status.icon}
                      {status.label}
                    </Badge>
                  </div>

                  <div className="text-sm text-muted-foreground mb-3">
                    {order.items.length} item • {order.items.slice(0, 2).map((item: any) => item.nama).join(', ')}
                    {order.items.length > 2 && ` +${order.items.length - 2} lainnya`}
                  </div>

                  <div className="flex justify-between items-center pt-3 border-t border-border">
                    <span className="text-sm text-muted-foreground">Total</span>
                    <span className="font-bold text-primary">{formatCurrency(order.total)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

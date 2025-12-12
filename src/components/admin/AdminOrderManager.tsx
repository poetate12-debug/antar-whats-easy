import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { 
  Package, Clock, ChefHat, Truck, CheckCircle, XCircle,
  MapPin, Phone, User
} from 'lucide-react';

interface Order {
  id: string;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  items: any;
  subtotal: number;
  ongkir: number;
  total: number;
  status: string;
  created_at: string;
  warung?: {
    nama: string;
  };
  wilayah?: {
    nama: string;
  };
}

export default function AdminOrderManager() {
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  const fetchOrders = async () => {
    let query = supabase
      .from('orders')
      .select(`
        *,
        warung:warungs(nama),
        wilayah:wilayahs(nama)
      `)
      .order('created_at', { ascending: false })
      .limit(50);

    if (filter !== 'all') {
      query = query.eq('status', filter);
    }

    const { data, error } = await query;

    if (!error && data) {
      setOrders(data as unknown as Order[]);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchOrders();

    // Realtime subscription
    const channel = supabase
      .channel('admin-orders')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders'
        },
        () => fetchOrders()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [filter]);

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId);

    if (error) {
      toast({ title: 'Gagal update status', variant: 'destructive' });
    } else {
      toast({ title: `Status diubah ke ${newStatus}` });
      fetchOrders();
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { icon: any; color: string; label: string }> = {
      pending: { icon: Clock, color: 'bg-yellow-100 text-yellow-700', label: 'Pending' },
      diproses: { icon: ChefHat, color: 'bg-blue-100 text-blue-700', label: 'Diproses' },
      menunggu_driver: { icon: Truck, color: 'bg-purple-100 text-purple-700', label: 'Menunggu Driver' },
      dalam_perjalanan: { icon: Truck, color: 'bg-indigo-100 text-indigo-700', label: 'Dalam Perjalanan' },
      selesai: { icon: CheckCircle, color: 'bg-green-100 text-green-700', label: 'Selesai' },
      dibatalkan: { icon: XCircle, color: 'bg-red-100 text-red-700', label: 'Dibatalkan' },
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${config.color}`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </span>
    );
  };

  const statusFilters = [
    { value: 'all', label: 'Semua' },
    { value: 'pending', label: 'Pending' },
    { value: 'diproses', label: 'Diproses' },
    { value: 'menunggu_driver', label: 'Menunggu Driver' },
    { value: 'dalam_perjalanan', label: 'Dalam Perjalanan' },
    { value: 'selesai', label: 'Selesai' },
  ];

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-32 bg-muted animate-pulse rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div>
      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-3 mb-4">
        {statusFilters.map(sf => (
          <button
            key={sf.value}
            onClick={() => setFilter(sf.value)}
            className={`px-3 py-1.5 rounded-full text-xs whitespace-nowrap transition-colors ${
              filter === sf.value
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            {sf.label}
          </button>
        ))}
      </div>

      {/* Orders List */}
      {orders.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>Tidak ada pesanan</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-card border border-border rounded-xl overflow-hidden"
            >
              {/* Header */}
              <div className="bg-muted/50 p-3 flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(order.created_at), 'd MMM yyyy, HH:mm', { locale: id })}
                  </p>
                  <p className="text-xs font-mono text-muted-foreground">
                    #{order.id.slice(0, 8)}
                  </p>
                </div>
                {getStatusBadge(order.status)}
              </div>

              {/* Content */}
              <div className="p-3">
                {/* Customer */}
                <div className="flex items-start gap-2 mb-3">
                  <User className="w-4 h-4 text-muted-foreground mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium text-sm">{order.customer_name}</p>
                    <p className="text-xs text-muted-foreground">{order.customer_phone}</p>
                  </div>
                </div>

                {/* Address */}
                <div className="flex items-start gap-2 mb-3">
                  <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                  <div className="flex-1">
                    <p className="text-xs">{order.customer_address}</p>
                    <p className="text-xs text-primary">{order.wilayah?.nama}</p>
                  </div>
                </div>

                {/* Warung & Items */}
                <div className="bg-muted/30 rounded-lg p-2 mb-3">
                  <p className="text-xs font-medium mb-1">🏪 {order.warung?.nama}</p>
                  <div className="text-xs text-muted-foreground">
                    {Array.isArray(order.items) && order.items.map((item: any, idx: number) => (
                      <span key={idx}>
                        {item.quantity}x {item.nama}
                        {idx < order.items.length - 1 && ', '}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Total */}
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm text-muted-foreground">Total</span>
                  <span className="font-bold text-primary">{formatCurrency(order.total)}</span>
                </div>

                {/* Actions */}
                {order.status === 'pending' && (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={() => updateOrderStatus(order.id, 'dibatalkan')}
                    >
                      Batalkan
                    </Button>
                    <Button
                      size="sm"
                      className="flex-1"
                      onClick={() => updateOrderStatus(order.id, 'diproses')}
                    >
                      Proses
                    </Button>
                  </div>
                )}

                {order.status === 'diproses' && (
                  <Button
                    size="sm"
                    className="w-full"
                    onClick={() => updateOrderStatus(order.id, 'menunggu_driver')}
                  >
                    Siap Dikirim
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

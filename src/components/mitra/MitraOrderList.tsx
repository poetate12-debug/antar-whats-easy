import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { 
  Package, Clock, ChefHat, Truck, CheckCircle, 
  MapPin, Phone, User
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
  wilayah?: {
    nama: string;
  };
}

interface MitraOrderListProps {
  orders: Order[];
  isLoading: boolean;
  onUpdateStatus: (orderId: string, newStatus: string) => Promise<any>;
}

export default function MitraOrderList({
  orders,
  isLoading,
  onUpdateStatus,
}: MitraOrderListProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { icon: any; color: string; label: string }> = {
      pending: { icon: Clock, color: 'bg-yellow-100 text-yellow-700', label: 'Baru' },
      diproses: { icon: ChefHat, color: 'bg-blue-100 text-blue-700', label: 'Diproses' },
      menunggu_driver: { icon: Truck, color: 'bg-purple-100 text-purple-700', label: 'Siap Antar' },
      dalam_perjalanan: { icon: Truck, color: 'bg-indigo-100 text-indigo-700', label: 'Diantar' },
      selesai: { icon: CheckCircle, color: 'bg-green-100 text-green-700', label: 'Selesai' },
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

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-32 bg-muted animate-pulse rounded-xl" />
        ))}
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Package className="w-16 h-16 mx-auto mb-4 opacity-30" />
        <p className="font-medium">Belum ada pesanan</p>
        <p className="text-sm">Pesanan baru akan muncul di sini</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {orders.map((order) => (
        <div
          key={order.id}
          className={`bg-card border rounded-xl overflow-hidden ${
            order.status === 'pending' ? 'border-yellow-300 ring-1 ring-yellow-200' : 'border-border'
          }`}
        >
          {/* Header */}
          <div className={`p-3 flex items-center justify-between ${
            order.status === 'pending' ? 'bg-yellow-50' : 'bg-muted/50'
          }`}>
            <div>
              <p className="text-xs text-muted-foreground">
                {format(new Date(order.created_at), 'HH:mm', { locale: id })} • #{order.id.slice(0, 6)}
              </p>
            </div>
            {getStatusBadge(order.status)}
          </div>

          {/* Content */}
          <div className="p-3">
            {/* Customer */}
            <div className="flex items-start gap-2 mb-2">
              <User className="w-4 h-4 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-sm">{order.customer_name}</p>
                <a 
                  href={`tel:${order.customer_phone}`}
                  className="text-xs text-primary flex items-center gap-1"
                >
                  <Phone className="w-3 h-3" />
                  {order.customer_phone}
                </a>
              </div>
            </div>

            {/* Address */}
            <div className="flex items-start gap-2 mb-3">
              <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">{order.customer_address}</p>
                <p className="text-xs text-primary">{order.wilayah?.nama}</p>
              </div>
            </div>

            {/* Items */}
            <div className="bg-muted/30 rounded-lg p-2 mb-3">
              <div className="text-xs space-y-0.5">
                {order.items.map((item: any, idx: number) => (
                  <div key={idx} className="flex justify-between">
                    <span>{item.quantity}x {item.nama}</span>
                    <span className="text-muted-foreground">{formatCurrency(item.subtotal)}</span>
                  </div>
                ))}
              </div>
              {order.catatan && (
                <p className="text-xs text-orange-600 mt-2 pt-2 border-t border-border">
                  📝 {order.catatan}
                </p>
              )}
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
                  onClick={() => onUpdateStatus(order.id, 'dibatalkan')}
                >
                  Tolak
                </Button>
                <Button
                  size="sm"
                  className="flex-1"
                  onClick={() => onUpdateStatus(order.id, 'diproses')}
                >
                  Terima & Proses
                </Button>
              </div>
            )}

            {order.status === 'diproses' && (
              <Button
                size="sm"
                className="w-full"
                onClick={() => onUpdateStatus(order.id, 'menunggu_driver')}
              >
                Siap Diantar
              </Button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

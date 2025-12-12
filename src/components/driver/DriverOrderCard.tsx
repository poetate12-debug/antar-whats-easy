import { Button } from '@/components/ui/button';
import { Check, X, MapPin, Phone, Package } from 'lucide-react';

interface OrderCardProps {
  assignment: {
    id: string;
    status: string;
    order?: {
      id: string;
      customer_name: string;
      customer_phone: string;
      customer_address: string;
      items: any;
      subtotal: number;
      ongkir: number;
      total: number;
      warung?: {
        nama: string;
        alamat: string;
      };
    };
  };
  onAccept?: (id: string) => void;
  onReject?: (id: string, orderId: string) => void;
  onPickup?: (id: string) => void;
  onDeliver?: (id: string, orderId: string) => void;
}

export default function DriverOrderCard({
  assignment,
  onAccept,
  onReject,
  onPickup,
  onDeliver,
}: OrderCardProps) {
  const order = assignment.order;
  if (!order) return null;

  const items = Array.isArray(order.items) ? order.items : [];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      {/* Header */}
      <div className="bg-primary/10 p-3 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-primary" />
            <span className="font-medium text-sm">
              {assignment.status === 'pending' && 'Pesanan Baru'}
              {assignment.status === 'accepted' && 'Menuju Warung'}
              {assignment.status === 'picked_up' && 'Dalam Perjalanan'}
            </span>
          </div>
          <span className="text-xs text-muted-foreground">
            {formatCurrency(order.ongkir)} ongkir
          </span>
        </div>
      </div>

      {/* Warung Info */}
      <div className="p-3 border-b border-border">
        <div className="flex items-start gap-2">
          <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
            🏪
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm truncate">{order.warung?.nama || 'Warung'}</p>
            <p className="text-xs text-muted-foreground truncate">{order.warung?.alamat}</p>
          </div>
        </div>
      </div>

      {/* Items */}
      <div className="p-3 border-b border-border">
        <p className="text-xs text-muted-foreground mb-2">Item pesanan:</p>
        <div className="space-y-1">
          {items.slice(0, 3).map((item: any, idx: number) => (
            <p key={idx} className="text-sm">
              {item.quantity}x {item.nama}
            </p>
          ))}
          {items.length > 3 && (
            <p className="text-xs text-muted-foreground">+{items.length - 3} item lainnya</p>
          )}
        </div>
      </div>

      {/* Customer Info */}
      <div className="p-3 border-b border-border">
        <div className="flex items-start gap-2 mb-2">
          <MapPin className="w-4 h-4 text-primary mt-0.5" />
          <div className="flex-1">
            <p className="font-medium text-sm">{order.customer_name}</p>
            <p className="text-xs text-muted-foreground">{order.customer_address}</p>
          </div>
        </div>
        <a
          href={`tel:${order.customer_phone}`}
          className="flex items-center gap-2 text-xs text-primary"
        >
          <Phone className="w-3 h-3" />
          {order.customer_phone}
        </a>
      </div>

      {/* Total */}
      <div className="p-3 border-b border-border">
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Total Pesanan</span>
          <span className="font-bold text-primary">{formatCurrency(order.total)}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="p-3">
        {assignment.status === 'pending' && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 gap-1"
              onClick={() => onReject?.(assignment.id, order.id)}
            >
              <X className="w-4 h-4" />
              Tolak
            </Button>
            <Button
              size="sm"
              className="flex-1 gap-1"
              onClick={() => onAccept?.(assignment.id)}
            >
              <Check className="w-4 h-4" />
              Terima
            </Button>
          </div>
        )}

        {assignment.status === 'accepted' && (
          <Button
            className="w-full gap-2"
            onClick={() => onPickup?.(assignment.id)}
          >
            <Package className="w-4 h-4" />
            Sudah Diambil
          </Button>
        )}

        {assignment.status === 'picked_up' && (
          <Button
            className="w-full gap-2 bg-green-600 hover:bg-green-700"
            onClick={() => onDeliver?.(assignment.id, order.id)}
          >
            <Check className="w-4 h-4" />
            Selesai Antar
          </Button>
        )}
      </div>
    </div>
  );
}

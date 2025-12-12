import { useDriverSetoran } from '@/hooks/useDriverSetoran';
import { Wallet, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

export default function DriverSetoranHistory() {
  const { setoranList, totalPending, totalPaid, isLoading } = useDriverSetoran();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-20 bg-muted animate-pulse rounded-xl" />
        ))}
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <span className="flex items-center gap-1 text-xs text-yellow-600 bg-yellow-100 px-2 py-0.5 rounded-full">
            <Clock className="w-3 h-3" />
            Belum Bayar
          </span>
        );
      case 'paid':
        return (
          <span className="flex items-center gap-1 text-xs text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">
            <AlertCircle className="w-3 h-3" />
            Menunggu Konfirmasi
          </span>
        );
      case 'confirmed':
        return (
          <span className="flex items-center gap-1 text-xs text-green-600 bg-green-100 px-2 py-0.5 rounded-full">
            <CheckCircle className="w-3 h-3" />
            Lunas
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div>
      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-4 h-4 text-yellow-600" />
            <span className="text-xs text-yellow-700">Belum Bayar</span>
          </div>
          <p className="font-bold text-yellow-700">{formatCurrency(totalPending)}</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-xl p-3">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span className="text-xs text-green-700">Sudah Lunas</span>
          </div>
          <p className="font-bold text-green-700">{formatCurrency(totalPaid)}</p>
        </div>
      </div>

      {/* Setoran List */}
      {setoranList.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <Wallet className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>Belum ada riwayat setoran</p>
        </div>
      ) : (
        <div className="space-y-2">
          {setoranList.map((setoran) => (
            <div
              key={setoran.id}
              className="bg-card border border-border rounded-xl p-3"
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(setoran.period_start), 'd MMM', { locale: id })} - {format(new Date(setoran.period_end), 'd MMM yyyy', { locale: id })}
                  </p>
                  <p className="font-bold text-lg">{formatCurrency(setoran.amount)}</p>
                </div>
                {getStatusBadge(setoran.status)}
              </div>
              
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span>{setoran.total_orders} order</span>
                <span>•</span>
                <span>Komisi {setoran.commission_rate}%</span>
                <span>•</span>
                <span>Earning: {formatCurrency(setoran.total_earnings)}</span>
              </div>

              {setoran.notes && (
                <p className="text-xs text-muted-foreground mt-2 italic">
                  {setoran.notes}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

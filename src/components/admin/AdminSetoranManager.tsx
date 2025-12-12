import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { CheckCircle, Clock, Wallet, User } from 'lucide-react';

interface DriverSetoran {
  id: string;
  driver_id: string;
  amount: number;
  status: string;
  period_start: string;
  period_end: string;
  total_orders: number;
  total_earnings: number;
  commission_rate: number;
  profile?: {
    nama: string;
    no_whatsapp: string;
  };
}

export default function AdminSetoranManager() {
  const { toast } = useToast();
  const [setoranList, setSetoranList] = useState<DriverSetoran[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSetoran = async () => {
    const { data, error } = await supabase
      .from('driver_setoran')
      .select(`
        *,
        profile:profiles!driver_setoran_driver_id_fkey(nama, no_whatsapp)
      `)
      .in('status', ['pending', 'paid'])
      .order('created_at', { ascending: false });

    if (!error && data) {
      // Manually fetch profiles since the foreign key might not work directly
      const driverIds = data.map(s => s.driver_id);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, nama, no_whatsapp')
        .in('user_id', driverIds);

      const profileMap = new Map(profiles?.map(p => [p.user_id, { nama: p.nama, no_whatsapp: p.no_whatsapp }]) || []);
      
      const enriched = data.map(s => ({
        ...s,
        profile: profileMap.get(s.driver_id)
      }));
      
      setSetoranList(enriched);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchSetoran();
  }, []);

  const confirmSetoran = async (setoranId: string) => {
    const { error } = await supabase
      .from('driver_setoran')
      .update({
        status: 'confirmed',
        confirmed_at: new Date().toISOString(),
      })
      .eq('id', setoranId);

    if (error) {
      toast({ title: 'Gagal konfirmasi setoran', variant: 'destructive' });
    } else {
      toast({ title: 'Setoran dikonfirmasi!' });
      fetchSetoran();
    }
  };

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
          <div key={i} className="h-24 bg-muted animate-pulse rounded-xl" />
        ))}
      </div>
    );
  }

  const pendingSetoran = setoranList.filter(s => s.status === 'pending');
  const paidSetoran = setoranList.filter(s => s.status === 'paid');

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3">
          <Clock className="w-5 h-5 text-yellow-600 mb-1" />
          <p className="text-xs text-yellow-700">Belum Bayar</p>
          <p className="font-bold text-lg text-yellow-700">
            {formatCurrency(pendingSetoran.reduce((s, i) => s + i.amount, 0))}
          </p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
          <Wallet className="w-5 h-5 text-blue-600 mb-1" />
          <p className="text-xs text-blue-700">Menunggu Konfirmasi</p>
          <p className="font-bold text-lg text-blue-700">
            {formatCurrency(paidSetoran.reduce((s, i) => s + i.amount, 0))}
          </p>
        </div>
      </div>

      {/* List */}
      {setoranList.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <Wallet className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>Tidak ada setoran yang perlu dikonfirmasi</p>
        </div>
      ) : (
        <div className="space-y-3">
          {setoranList.map((setoran) => (
            <div
              key={setoran.id}
              className="bg-card border border-border rounded-xl p-4"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold">{setoran.profile?.nama || 'Driver'}</p>
                    <p className="text-xs text-muted-foreground">{setoran.profile?.no_whatsapp}</p>
                  </div>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  setoran.status === 'paid' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {setoran.status === 'paid' ? 'Menunggu Konfirmasi' : 'Belum Bayar'}
                </span>
              </div>

              <div className="bg-muted/50 rounded-lg p-3 mb-3">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-muted-foreground">Periode</span>
                  <span className="text-sm">
                    {format(new Date(setoran.period_start), 'd MMM', { locale: id })} - {format(new Date(setoran.period_end), 'd MMM yyyy', { locale: id })}
                  </span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-muted-foreground">Total Order</span>
                  <span className="text-sm font-medium">{setoran.total_orders}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-muted-foreground">Total Earnings</span>
                  <span className="text-sm font-medium">{formatCurrency(setoran.total_earnings)}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-muted-foreground">Komisi ({setoran.commission_rate}%)</span>
                  <span className="text-sm font-bold text-primary">{formatCurrency(setoran.amount)}</span>
                </div>
              </div>

              {setoran.status === 'paid' && (
                <Button
                  className="w-full gap-2"
                  onClick={() => confirmSetoran(setoran.id)}
                >
                  <CheckCircle className="w-4 h-4" />
                  Konfirmasi Pembayaran
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

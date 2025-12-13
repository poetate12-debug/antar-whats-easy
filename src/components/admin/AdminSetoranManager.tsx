import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { CheckCircle, Clock, Wallet, User, MapPin, ChevronDown, ChevronUp } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

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
    wilayah_id: string | null;
  };
}

interface Wilayah {
  id: string;
  nama: string;
}

interface WilayahGroup {
  wilayah: Wilayah;
  setoranList: DriverSetoran[];
  totalPending: number;
  totalPaid: number;
}

export default function AdminSetoranManager() {
  const { toast } = useToast();
  const [wilayahGroups, setWilayahGroups] = useState<WilayahGroup[]>([]);
  const [ungroupedSetoran, setUngroupedSetoran] = useState<DriverSetoran[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [openWilayahs, setOpenWilayahs] = useState<Set<string>>(new Set());

  const fetchSetoran = async () => {
    // Fetch all wilayahs
    const { data: wilayahs } = await supabase
      .from('wilayahs')
      .select('id, nama')
      .order('nama');

    // Fetch setoran with pending/paid status
    const { data, error } = await supabase
      .from('driver_setoran')
      .select('*')
      .in('status', ['pending', 'paid'])
      .order('created_at', { ascending: false });

    if (!error && data) {
      // Fetch profiles with wilayah_id
      const driverIds = data.map(s => s.driver_id);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, nama, no_whatsapp, wilayah_id')
        .in('user_id', driverIds);

      const profileMap = new Map(profiles?.map(p => [p.user_id, { 
        nama: p.nama, 
        no_whatsapp: p.no_whatsapp,
        wilayah_id: p.wilayah_id
      }]) || []);
      
      const enriched = data.map(s => ({
        ...s,
        profile: profileMap.get(s.driver_id)
      }));

      // Group by wilayah
      const groups: WilayahGroup[] = [];
      const ungrouped: DriverSetoran[] = [];

      wilayahs?.forEach(wilayah => {
        const wilayahSetoran = enriched.filter(s => s.profile?.wilayah_id === wilayah.id);
        if (wilayahSetoran.length > 0) {
          groups.push({
            wilayah,
            setoranList: wilayahSetoran,
            totalPending: wilayahSetoran.filter(s => s.status === 'pending').reduce((sum, s) => sum + s.amount, 0),
            totalPaid: wilayahSetoran.filter(s => s.status === 'paid').reduce((sum, s) => sum + s.amount, 0),
          });
        }
      });

      // Drivers without wilayah
      const noWilayahSetoran = enriched.filter(s => !s.profile?.wilayah_id);
      setUngroupedSetoran(noWilayahSetoran);

      // Auto-open wilayahs with pending/paid setoran
      const wilayahsWithSetoran = groups.map(g => g.wilayah.id);
      setOpenWilayahs(new Set(wilayahsWithSetoran));

      setWilayahGroups(groups);
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

  const toggleWilayah = (wilayahId: string) => {
    setOpenWilayahs(prev => {
      const next = new Set(prev);
      if (next.has(wilayahId)) {
        next.delete(wilayahId);
      } else {
        next.add(wilayahId);
      }
      return next;
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const renderSetoranCard = (setoran: DriverSetoran) => (
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
            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' 
            : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
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
        <div className="flex justify-between items-center">
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
  );

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-24 bg-muted animate-pulse rounded-xl" />
        ))}
      </div>
    );
  }

  const totalAllPending = wilayahGroups.reduce((sum, g) => sum + g.totalPending, 0) + 
    ungroupedSetoran.filter(s => s.status === 'pending').reduce((sum, s) => sum + s.amount, 0);
  const totalAllPaid = wilayahGroups.reduce((sum, g) => sum + g.totalPaid, 0) +
    ungroupedSetoran.filter(s => s.status === 'paid').reduce((sum, s) => sum + s.amount, 0);

  const hasNoSetoran = wilayahGroups.length === 0 && ungroupedSetoran.length === 0;

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-3">
          <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mb-1" />
          <p className="text-xs text-yellow-700 dark:text-yellow-400">Belum Bayar</p>
          <p className="font-bold text-lg text-yellow-700 dark:text-yellow-400">
            {formatCurrency(totalAllPending)}
          </p>
        </div>
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-3">
          <Wallet className="w-5 h-5 text-blue-600 dark:text-blue-400 mb-1" />
          <p className="text-xs text-blue-700 dark:text-blue-400">Menunggu Konfirmasi</p>
          <p className="font-bold text-lg text-blue-700 dark:text-blue-400">
            {formatCurrency(totalAllPaid)}
          </p>
        </div>
      </div>

      {/* Wilayah Groups */}
      {hasNoSetoran ? (
        <div className="text-center py-8 text-muted-foreground">
          <Wallet className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>Tidak ada setoran yang perlu dikonfirmasi</p>
        </div>
      ) : (
        <div className="space-y-3">
          {wilayahGroups.map((group) => (
            <Collapsible
              key={group.wilayah.id}
              open={openWilayahs.has(group.wilayah.id)}
              onOpenChange={() => toggleWilayah(group.wilayah.id)}
            >
              <CollapsibleTrigger className="w-full">
                <div className="flex items-center justify-between bg-muted/50 border border-border rounded-xl p-4 hover:bg-muted/70 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-primary" />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold">{group.wilayah.nama}</p>
                      <p className="text-xs text-muted-foreground">
                        {group.setoranList.length} setoran
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Total</p>
                      <p className="font-bold text-primary">
                        {formatCurrency(group.totalPending + group.totalPaid)}
                      </p>
                    </div>
                    {openWilayahs.has(group.wilayah.id) ? (
                      <ChevronUp className="w-5 h-5 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="mt-3 space-y-3 pl-4 border-l-2 border-primary/20">
                  {group.setoranList.map(renderSetoranCard)}
                </div>
              </CollapsibleContent>
            </Collapsible>
          ))}

          {/* Ungrouped drivers (no wilayah) */}
          {ungroupedSetoran.length > 0 && (
            <Collapsible defaultOpen>
              <CollapsibleTrigger className="w-full">
                <div className="flex items-center justify-between bg-muted/50 border border-border rounded-xl p-4 hover:bg-muted/70 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold">Tanpa Wilayah</p>
                      <p className="text-xs text-muted-foreground">
                        {ungroupedSetoran.length} setoran
                      </p>
                    </div>
                  </div>
                  <ChevronDown className="w-5 h-5 text-muted-foreground" />
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="mt-3 space-y-3 pl-4 border-l-2 border-muted">
                  {ungroupedSetoran.map(renderSetoranCard)}
                </div>
              </CollapsibleContent>
            </Collapsible>
          )}
        </div>
      )}
    </div>
  );
}
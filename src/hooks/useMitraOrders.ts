import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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

export function useMitraOrders(warungId: string | undefined) {
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    pending: 0,
    diproses: 0,
    selesai: 0,
    today: 0,
  });

  const fetchOrders = async () => {
    if (!warungId) return;

    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        wilayah:wilayahs(nama)
      `)
      .eq('warung_id', warungId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (!error && data) {
      setOrders(data as unknown as Order[]);
      
      // Calculate stats
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      setStats({
        pending: data.filter(o => ['pending', 'diproses_warung'].includes(o.status)).length,
        diproses: data.filter(o => ['diproses', 'menunggu_driver', 'diambil_driver'].includes(o.status)).length,
        selesai: data.filter(o => o.status === 'selesai').length,
        today: data.filter(o => new Date(o.created_at) >= today).length,
      });
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchOrders();

    if (!warungId) return;

    // Realtime subscription
    const channel = supabase
      .channel('mitra-orders')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `warung_id=eq.${warungId}`
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            toast({
              title: '🔔 Pesanan Baru!',
              description: `Pesanan dari ${(payload.new as Order).customer_name}`,
            });
          }
          fetchOrders();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [warungId]);

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    // If warung confirms and ready to deliver, call find-driver
    if (newStatus === 'siap_antar') {
      try {
        // First update to menunggu_driver
        await supabase
          .from('orders')
          .update({ status: 'menunggu_driver' })
          .eq('id', orderId);

        toast({ title: 'Mencari driver...' });

        // Call find-driver function
        const { data: driverResult, error: driverError } = await supabase.functions.invoke('find-driver', {
          body: { orderId }
        });

        if (driverError) {
          console.error('Error finding driver:', driverError);
          toast({ 
            title: 'Driver tidak ditemukan', 
            description: 'Menunggu driver tersedia',
          });
        } else if (driverResult?.driverId) {
          toast({ 
            title: 'Driver ditemukan!', 
            description: 'Pesanan akan segera diambil',
          });
        } else {
          toast({ 
            title: 'Menunggu driver tersedia',
            description: 'Sistem akan otomatis assign driver',
          });
        }

        fetchOrders();
        return { error: null };
      } catch (err) {
        console.error('Error updating status:', err);
        toast({ title: 'Gagal update status', variant: 'destructive' });
        return { error: err };
      }
    }

    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId);

    if (error) {
      toast({ title: 'Gagal update status', variant: 'destructive' });
    } else {
      const statusLabels: Record<string, string> = {
        dibatalkan: 'Pesanan ditolak',
        diproses: 'Pesanan diproses',
        menunggu_driver: 'Menunggu driver',
      };
      toast({ title: statusLabels[newStatus] || `Status: ${newStatus}` });
      fetchOrders();
    }
    return { error };
  };

  const pendingOrders = orders.filter(o => ['pending', 'diproses_warung'].includes(o.status));
  const activeOrders = orders.filter(o => ['diproses', 'menunggu_driver', 'diambil_driver'].includes(o.status));

  return { 
    orders, 
    pendingOrders,
    activeOrders,
    stats,
    isLoading, 
    updateOrderStatus,
    refresh: fetchOrders 
  };
}

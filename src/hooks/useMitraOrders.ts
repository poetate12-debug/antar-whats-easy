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
        pending: data.filter(o => o.status === 'pending').length,
        diproses: data.filter(o => o.status === 'diproses').length,
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
    return { error };
  };

  const pendingOrders = orders.filter(o => o.status === 'pending');
  const activeOrders = orders.filter(o => ['diproses', 'menunggu_driver'].includes(o.status));

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

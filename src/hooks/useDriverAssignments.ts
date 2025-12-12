import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface DriverAssignment {
  id: string;
  order_id: string;
  driver_id: string;
  status: string;
  assigned_at: string;
  accepted_at: string | null;
  picked_up_at: string | null;
  delivered_at: string | null;
  order?: {
    id: string;
    customer_name: string;
    customer_phone: string;
    customer_address: string;
    items: any;
    subtotal: number;
    ongkir: number;
    total: number;
    status: string;
    warung?: {
      nama: string;
      alamat: string;
    };
  };
}

export function useDriverAssignments() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [assignments, setAssignments] = useState<DriverAssignment[]>([]);
  const [activeAssignment, setActiveAssignment] = useState<DriverAssignment | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAssignments = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('driver_assignments')
      .select(`
        *,
        order:orders(
          id, customer_name, customer_phone, customer_address,
          items, subtotal, ongkir, total, status,
          warung:warungs(nama, alamat)
        )
      `)
      .eq('driver_id', user.id)
      .in('status', ['pending', 'accepted', 'picked_up'])
      .order('created_at', { ascending: false });

    if (!error && data) {
      setAssignments(data as unknown as DriverAssignment[]);
      const active = data.find(a => ['accepted', 'picked_up'].includes(a.status));
      setActiveAssignment(active as unknown as DriverAssignment || null);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (!user) return;

    fetchAssignments();

    // Subscribe to realtime changes
    const channel = supabase
      .channel('driver-assignments-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'driver_assignments',
          filter: `driver_id=eq.${user.id}`
        },
        () => {
          fetchAssignments();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const acceptOrder = async (assignmentId: string) => {
    const { error } = await supabase
      .from('driver_assignments')
      .update({
        status: 'accepted',
        accepted_at: new Date().toISOString(),
      })
      .eq('id', assignmentId);

    if (error) {
      toast({ title: 'Gagal menerima pesanan', variant: 'destructive' });
    } else {
      toast({ title: 'Pesanan diterima!' });
      fetchAssignments();
    }
  };

  const rejectOrder = async (assignmentId: string, reason?: string) => {
    const { error } = await supabase
      .from('driver_assignments')
      .update({
        status: 'rejected',
        rejection_reason: reason || 'Driver menolak pesanan',
      })
      .eq('id', assignmentId);

    if (error) {
      toast({ title: 'Gagal menolak pesanan', variant: 'destructive' });
    } else {
      toast({ title: 'Pesanan ditolak' });
      fetchAssignments();
    }
  };

  const pickupOrder = async (assignmentId: string) => {
    const { error } = await supabase
      .from('driver_assignments')
      .update({
        status: 'picked_up',
        picked_up_at: new Date().toISOString(),
      })
      .eq('id', assignmentId);

    if (error) {
      toast({ title: 'Gagal update status', variant: 'destructive' });
    } else {
      toast({ title: 'Pesanan telah diambil!' });
      fetchAssignments();
    }
  };

  const deliverOrder = async (assignmentId: string, orderId: string) => {
    // Update assignment
    await supabase
      .from('driver_assignments')
      .update({
        status: 'delivered',
        delivered_at: new Date().toISOString(),
      })
      .eq('id', assignmentId);

    // Update order status
    await supabase
      .from('orders')
      .update({ status: 'selesai' })
      .eq('id', orderId);

    toast({ title: 'Pesanan selesai diantar!' });
    fetchAssignments();
  };

  return {
    assignments,
    activeAssignment,
    isLoading,
    acceptOrder,
    rejectOrder,
    pickupOrder,
    deliverOrder,
    refresh: fetchAssignments,
  };
}

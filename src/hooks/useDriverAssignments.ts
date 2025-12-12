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

  const rejectOrder = async (assignmentId: string, orderId: string, reason?: string) => {
    try {
      // First update assignment status locally
      const { error: updateError } = await supabase
        .from('driver_assignments')
        .update({
          status: 'rejected',
          rejection_reason: reason || 'Driver menolak pesanan',
        })
        .eq('id', assignmentId);

      if (updateError) {
        toast({ title: 'Gagal menolak pesanan', variant: 'destructive' });
        return;
      }

      toast({ title: 'Pesanan ditolak, mencari driver lain...' });

      // Call reassign-driver function to find new driver
      const { data: reassignResult, error: reassignError } = await supabase.functions.invoke('reassign-driver', {
        body: { 
          orderId,
          reason: reason || 'Driver menolak pesanan',
          currentDriverId: user?.id
        }
      });

      if (reassignError) {
        console.error('Error reassigning driver:', reassignError);
        toast({ 
          title: 'Tidak ada driver tersedia',
          description: 'Pesanan menunggu driver baru',
        });
      } else if (reassignResult?.driverId) {
        toast({ 
          title: 'Driver baru ditemukan',
          description: 'Pesanan akan diantar driver lain',
        });
      } else {
        toast({ 
          title: 'Menunggu driver tersedia',
          description: 'Sistem akan assign driver otomatis',
        });
      }

      fetchAssignments();
    } catch (err) {
      console.error('Error rejecting order:', err);
      toast({ title: 'Gagal menolak pesanan', variant: 'destructive' });
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

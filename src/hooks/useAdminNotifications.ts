import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function useAdminNotifications(onNewOrder?: () => void, onNewRegistration?: () => void) {
  const { toast } = useToast();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Create notification sound
  useEffect(() => {
    // Simple beep sound using AudioContext
    audioRef.current = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1tZ3V1aGttdXyEioyMi4WAdnRwbW1wcnN0dHR0c3Jwb25ubm5vcHFyc3R1dnd4eXl5eXh3dnV0c3JxcG9ubm5ub3BxcnN0dXZ3eHl5eXl4d3Z1dHNycXBvbm5ubm9wcXJzdHV2d3h5eXl5eHd2dXRzcnFwb25ubm5vcHFyc3R1dnd4eXl5eXh3dnV0c3JxcG9ubm5ub3BxcnN0dXZ3eHl5eXl4d3Z1dHNycXBvbm5ubm9wcXJzdHV2d3h5');
  }, []);

  const playNotificationSound = () => {
    try {
      audioRef.current?.play().catch(() => {
        // Autoplay might be blocked, silently fail
      });
    } catch (e) {
      // Ignore errors
    }
  };

  useEffect(() => {
    // Subscribe to new orders
    const ordersChannel = supabase
      .channel('admin-orders-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'orders'
        },
        (payload) => {
          const order = payload.new as any;
          playNotificationSound();
          toast({
            title: '🔔 Pesanan Baru!',
            description: `Pesanan dari ${order.customer_name} - Rp ${order.total?.toLocaleString('id-ID')}`,
          });
          onNewOrder?.();
        }
      )
      .subscribe();

    // Subscribe to new registrations
    const registrationsChannel = supabase
      .channel('admin-registrations-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'pending_registrations'
        },
        (payload) => {
          const reg = payload.new as any;
          const roleLabels: Record<string, string> = {
            pelanggan: 'Pelanggan',
            driver: 'Driver',
            mitra: 'Mitra',
          };
          playNotificationSound();
          toast({
            title: '👤 Pendaftaran Baru!',
            description: `${reg.nama} mendaftar sebagai ${roleLabels[reg.requested_role] || reg.requested_role}`,
          });
          onNewRegistration?.();
        }
      )
      .subscribe();

    // Subscribe to order status changes
    const orderUpdatesChannel = supabase
      .channel('admin-order-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders'
        },
        (payload) => {
          const order = payload.new as any;
          const oldOrder = payload.old as any;
          
          // Only notify on significant status changes
          if (order.status !== oldOrder.status) {
            const statusLabels: Record<string, string> = {
              selesai: '✅ Pesanan Selesai',
              dibatalkan: '❌ Pesanan Dibatalkan',
            };
            
            if (statusLabels[order.status]) {
              toast({
                title: statusLabels[order.status],
                description: `Order #${order.id.slice(0, 6)} - ${order.customer_name}`,
              });
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(ordersChannel);
      supabase.removeChannel(registrationsChannel);
      supabase.removeChannel(orderUpdatesChannel);
    };
  }, [toast, onNewOrder, onNewRegistration]);
}

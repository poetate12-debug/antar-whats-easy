import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface DriverStatus {
  id: string;
  driver_id: string;
  is_online: boolean;
  current_location: string | null;
  wilayah_id: string | null;
  last_online_at: string | null;
}

export function useDriverStatus() {
  const { user } = useAuth();
  const [status, setStatus] = useState<DriverStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchStatus = async () => {
      const { data, error } = await supabase
        .from('driver_status')
        .select('*')
        .eq('driver_id', user.id)
        .maybeSingle();

      if (!error && data) {
        setStatus(data);
      }
      setIsLoading(false);
    };

    fetchStatus();

    // Subscribe to realtime changes
    const channel = supabase
      .channel('driver-status-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'driver_status',
          filter: `driver_id=eq.${user.id}`
        },
        (payload) => {
          if (payload.new) {
            setStatus(payload.new as DriverStatus);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const toggleOnline = async (isOnline: boolean) => {
    if (!user) return;

    const updateData = {
      is_online: isOnline,
      last_online_at: isOnline ? new Date().toISOString() : status?.last_online_at,
    };

    if (status) {
      await supabase
        .from('driver_status')
        .update(updateData)
        .eq('driver_id', user.id);
    } else {
      await supabase
        .from('driver_status')
        .insert({
          driver_id: user.id,
          ...updateData,
        });
    }

    setStatus(prev => prev ? { ...prev, ...updateData } : null);
  };

  return { status, isLoading, toggleOnline, isOnline: status?.is_online || false };
}

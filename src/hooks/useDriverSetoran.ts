import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

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
  paid_at: string | null;
  confirmed_at: string | null;
  notes: string | null;
}

export function useDriverSetoran() {
  const { user } = useAuth();
  const [setoranList, setSetoranList] = useState<DriverSetoran[]>([]);
  const [currentSetoran, setCurrentSetoran] = useState<DriverSetoran | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchSetoran = async () => {
      const { data, error } = await supabase
        .from('driver_setoran')
        .select('*')
        .eq('driver_id', user.id)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setSetoranList(data);
        const pending = data.find(s => s.status === 'pending');
        setCurrentSetoran(pending || null);
      }
      setIsLoading(false);
    };

    fetchSetoran();
  }, [user]);

  const totalPending = setoranList
    .filter(s => s.status === 'pending')
    .reduce((sum, s) => sum + s.amount, 0);

  const totalPaid = setoranList
    .filter(s => s.status === 'confirmed')
    .reduce((sum, s) => sum + s.amount, 0);

  return { setoranList, currentSetoran, totalPending, totalPaid, isLoading };
}

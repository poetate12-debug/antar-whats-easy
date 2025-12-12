import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface DriverStats {
  id: string;
  driver_id: string;
  total_orders: number;
  completed_orders: number;
  cancelled_orders: number;
  total_earnings: number;
  average_rating: number;
  total_ratings: number;
  acceptance_rate: number;
  rank_position: number | null;
}

interface TodayStats {
  ordersToday: number;
  earningsToday: number;
}

export function useDriverStats() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DriverStats | null>(null);
  const [todayStats, setTodayStats] = useState<TodayStats>({ ordersToday: 0, earningsToday: 0 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchStats = async () => {
      // Fetch overall stats
      const { data: statsData } = await supabase
        .from('driver_stats')
        .select('*')
        .eq('driver_id', user.id)
        .maybeSingle();

      if (statsData) {
        setStats(statsData);
      }

      // Fetch today's stats
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { data: todayAssignments } = await supabase
        .from('driver_assignments')
        .select('id, status')
        .eq('driver_id', user.id)
        .gte('created_at', today.toISOString());

      const { data: todayEarnings } = await supabase
        .from('driver_earnings')
        .select('amount')
        .eq('driver_id', user.id)
        .gte('created_at', today.toISOString());

      setTodayStats({
        ordersToday: todayAssignments?.filter(a => a.status === 'delivered').length || 0,
        earningsToday: todayEarnings?.reduce((sum, e) => sum + e.amount, 0) || 0,
      });

      setIsLoading(false);
    };

    fetchStats();
  }, [user]);

  return { stats, todayStats, isLoading };
}

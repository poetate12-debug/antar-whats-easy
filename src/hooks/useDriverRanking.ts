import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface DriverRanking {
  driver_id: string;
  driver_name: string;
  total_orders: number;
  completed_orders: number;
  average_rating: number;
  total_earnings: number;
  rank_position: number;
}

export function useDriverRanking() {
  const [rankings, setRankings] = useState<DriverRanking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRankings = async () => {
      const { data: statsData, error } = await supabase
        .from('driver_stats')
        .select(`
          driver_id,
          total_orders,
          completed_orders,
          average_rating,
          total_earnings,
          rank_position
        `)
        .order('completed_orders', { ascending: false })
        .limit(20);

      if (!error && statsData) {
        // Fetch driver profiles
        const driverIds = statsData.map(s => s.driver_id);
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, nama')
          .in('user_id', driverIds);

        const profileMap = new Map(profiles?.map(p => [p.user_id, p.nama]) || []);

        const ranked = statsData.map((stat, index) => ({
          ...stat,
          driver_name: profileMap.get(stat.driver_id) || 'Driver',
          rank_position: index + 1,
        }));

        setRankings(ranked);
      }
      setIsLoading(false);
    };

    fetchRankings();
  }, []);

  return { rankings, isLoading };
}

import { useDriverRanking } from '@/hooks/useDriverRanking';
import { Trophy, Medal, Star } from 'lucide-react';

export default function DriverRankingList() {
  const { rankings, isLoading } = useDriverRanking();

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-16 bg-muted animate-pulse rounded-xl" />
        ))}
      </div>
    );
  }

  if (rankings.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Trophy className="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p>Belum ada data ranking</p>
      </div>
    );
  }

  const getRankIcon = (position: number) => {
    switch (position) {
      case 1:
        return <Trophy className="w-5 h-5 text-yellow-500" />;
      case 2:
        return <Medal className="w-5 h-5 text-gray-400" />;
      case 3:
        return <Medal className="w-5 h-5 text-amber-600" />;
      default:
        return <span className="w-5 h-5 text-center text-sm font-bold">{position}</span>;
    }
  };

  const getRankBg = (position: number) => {
    switch (position) {
      case 1:
        return 'bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200';
      case 2:
        return 'bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200';
      case 3:
        return 'bg-gradient-to-r from-amber-50 to-amber-100 border-amber-200';
      default:
        return 'bg-card border-border';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-2">
      {rankings.map((driver) => (
        <div
          key={driver.driver_id}
          className={`flex items-center gap-3 p-3 rounded-xl border ${getRankBg(driver.rank_position)}`}
        >
          <div className="w-8 h-8 flex items-center justify-center">
            {getRankIcon(driver.rank_position)}
          </div>
          
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm truncate">{driver.driver_name}</p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>{driver.completed_orders} order</span>
              <span>•</span>
              <span className="flex items-center gap-0.5">
                <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                {Number(driver.average_rating).toFixed(1)}
              </span>
            </div>
          </div>
          
          <div className="text-right">
            <p className="text-sm font-bold text-primary">
              {formatCurrency(driver.total_earnings)}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

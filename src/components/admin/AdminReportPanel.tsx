import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';
import {
  Package,
  TrendingUp,
  Wallet,
  Users,
  Loader2,
  Store,
  Truck,
} from 'lucide-react';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import { id } from 'date-fns/locale';

interface ReportStats {
  totalOrders: number;
  totalRevenue: number;
  completedOrders: number;
  cancelledOrders: number;
  averageOrderValue: number;
  ordersByStatus: { name: string; value: number }[];
  ordersByWilayah: { nama: string; orders: number; revenue: number }[];
  dailyOrders: { date: string; orders: number; revenue: number }[];
  topWarungs: { nama: string; orders: number; revenue: number }[];
  topDrivers: { nama: string; orders: number; earnings: number }[];
}

const COLORS = ['#f97316', '#22c55e', '#3b82f6', '#a855f7', '#ec4899', '#eab308'];

export default function AdminReportPanel() {
  const [stats, setStats] = useState<ReportStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [period, setPeriod] = useState<string>('7');

  const fetchStats = async () => {
    setIsLoading(true);
    const days = parseInt(period);
    const startDate = startOfDay(subDays(new Date(), days - 1));
    const endDate = endOfDay(new Date());

    // Fetch orders in period
    const { data: orders } = await supabase
      .from('orders')
      .select(`
        id,
        total,
        status,
        created_at,
        wilayah_id,
        warung_id,
        driver_id,
        wilayah:wilayahs(nama),
        warung:warungs(nama)
      `)
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString());

    if (!orders) {
      setIsLoading(false);
      return;
    }

    // Calculate stats
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
    const completedOrders = orders.filter(o => o.status === 'selesai').length;
    const cancelledOrders = orders.filter(o => o.status === 'dibatalkan').length;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Orders by status
    const statusCounts: Record<string, number> = {};
    orders.forEach(o => {
      statusCounts[o.status] = (statusCounts[o.status] || 0) + 1;
    });
    const statusLabels: Record<string, string> = {
      pending: 'Pending',
      diproses_warung: 'Diproses',
      menunggu_driver: 'Cari Driver',
      diambil_driver: 'Diambil',
      dalam_perjalanan: 'Diantar',
      selesai: 'Selesai',
      dibatalkan: 'Batal',
    };
    const ordersByStatus = Object.entries(statusCounts).map(([key, value]) => ({
      name: statusLabels[key] || key,
      value,
    }));

    // Orders by wilayah
    const wilayahStats: Record<string, { orders: number; revenue: number }> = {};
    orders.forEach(o => {
      const wilayahNama = (o.wilayah as any)?.nama || 'Unknown';
      if (!wilayahStats[wilayahNama]) {
        wilayahStats[wilayahNama] = { orders: 0, revenue: 0 };
      }
      wilayahStats[wilayahNama].orders++;
      wilayahStats[wilayahNama].revenue += o.total;
    });
    const ordersByWilayah = Object.entries(wilayahStats)
      .map(([nama, data]) => ({ nama, ...data }))
      .sort((a, b) => b.orders - a.orders);

    // Daily orders
    const dailyStats: Record<string, { orders: number; revenue: number }> = {};
    for (let i = 0; i < days; i++) {
      const date = format(subDays(new Date(), days - 1 - i), 'yyyy-MM-dd');
      dailyStats[date] = { orders: 0, revenue: 0 };
    }
    orders.forEach(o => {
      const date = format(new Date(o.created_at), 'yyyy-MM-dd');
      if (dailyStats[date]) {
        dailyStats[date].orders++;
        dailyStats[date].revenue += o.total;
      }
    });
    const dailyOrders = Object.entries(dailyStats).map(([date, data]) => ({
      date: format(new Date(date), 'd MMM', { locale: id }),
      ...data,
    }));

    // Top warungs
    const warungStats: Record<string, { orders: number; revenue: number }> = {};
    orders.forEach(o => {
      const warungNama = (o.warung as any)?.nama || 'Unknown';
      if (!warungStats[warungNama]) {
        warungStats[warungNama] = { orders: 0, revenue: 0 };
      }
      warungStats[warungNama].orders++;
      warungStats[warungNama].revenue += o.total;
    });
    const topWarungs = Object.entries(warungStats)
      .map(([nama, data]) => ({ nama, ...data }))
      .sort((a, b) => b.orders - a.orders)
      .slice(0, 5);

    // Top drivers
    const driverIds = [...new Set(orders.filter(o => o.driver_id).map(o => o.driver_id))];
    let topDrivers: { nama: string; orders: number; earnings: number }[] = [];
    
    if (driverIds.length > 0) {
      const { data: driverProfiles } = await supabase
        .from('profiles')
        .select('user_id, nama')
        .in('user_id', driverIds);

      const driverStats: Record<string, { nama: string; orders: number; earnings: number }> = {};
      orders.filter(o => o.driver_id).forEach(o => {
        if (!driverStats[o.driver_id!]) {
          const profile = driverProfiles?.find(p => p.user_id === o.driver_id);
          driverStats[o.driver_id!] = {
            nama: profile?.nama || 'Unknown',
            orders: 0,
            earnings: 0,
          };
        }
        driverStats[o.driver_id!].orders++;
        if (o.status === 'selesai') {
          driverStats[o.driver_id!].earnings += 5000; // Assume 5k per delivery
        }
      });
      topDrivers = Object.values(driverStats)
        .sort((a, b) => b.orders - a.orders)
        .slice(0, 5);
    }

    setStats({
      totalOrders,
      totalRevenue,
      completedOrders,
      cancelledOrders,
      averageOrderValue,
      ordersByStatus,
      ordersByWilayah,
      dailyOrders,
      topWarungs,
      topDrivers,
    });
    setIsLoading(false);
  };

  useEffect(() => {
    fetchStats();
  }, [period]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>Gagal memuat laporan</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold">Laporan & Statistik</h2>
          <p className="text-sm text-muted-foreground">Ringkasan performa bisnis</p>
        </div>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">7 Hari Terakhir</SelectItem>
            <SelectItem value="14">14 Hari Terakhir</SelectItem>
            <SelectItem value="30">30 Hari Terakhir</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Package className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalOrders}</p>
                <p className="text-xs text-muted-foreground">Total Pesanan</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                <Wallet className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-xl font-bold">{formatCurrency(stats.totalRevenue)}</p>
                <p className="text-xs text-muted-foreground">Total Revenue</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xl font-bold">{formatCurrency(stats.averageOrderValue)}</p>
                <p className="text-xs text-muted-foreground">Rata-rata Order</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {stats.totalOrders > 0 
                    ? Math.round((stats.completedOrders / stats.totalOrders) * 100) 
                    : 0}%
                </p>
                <p className="text-xs text-muted-foreground">Completion Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Daily Orders Chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pesanan Harian</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats.dailyOrders}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="date" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip
                    formatter={(value: number, name: string) => [
                      name === 'orders' ? value : formatCurrency(value),
                      name === 'orders' ? 'Pesanan' : 'Revenue'
                    ]}
                  />
                  <Line
                    type="monotone"
                    dataKey="orders"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--primary))' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Orders by Status */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Status Pesanan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.ordersByStatus}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {stats.ordersByStatus.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap justify-center gap-2 mt-2">
              {stats.ordersByStatus.map((entry, index) => (
                <div key={entry.name} className="flex items-center gap-1 text-xs">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span>{entry.name}: {entry.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Orders by Wilayah */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Pesanan per Wilayah</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.ordersByWilayah}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="nama" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip
                  formatter={(value: number, name: string) => [
                    name === 'orders' ? value : formatCurrency(value),
                    name === 'orders' ? 'Pesanan' : 'Revenue'
                  ]}
                />
                <Bar dataKey="orders" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Top Performers */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Top Warungs */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Store className="w-4 h-4" />
              Top Warung
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {stats.topWarungs.map((warung, i) => (
                <div key={warung.nama} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-bold">
                      {i + 1}
                    </span>
                    <span className="text-sm font-medium">{warung.nama}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">{warung.orders} order</p>
                    <p className="text-xs text-muted-foreground">{formatCurrency(warung.revenue)}</p>
                  </div>
                </div>
              ))}
              {stats.topWarungs.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">Belum ada data</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Top Drivers */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Truck className="w-4 h-4" />
              Top Driver
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {stats.topDrivers.map((driver, i) => (
                <div key={driver.nama} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-green-500/10 text-green-600 text-xs flex items-center justify-center font-bold">
                      {i + 1}
                    </span>
                    <span className="text-sm font-medium">{driver.nama}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">{driver.orders} antar</p>
                    <p className="text-xs text-green-600">{formatCurrency(driver.earnings)}</p>
                  </div>
                </div>
              ))}
              {stats.topDrivers.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">Belum ada data</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Truck, Star, Package, Wallet, MapPin, Loader2, Phone, CheckCircle } from 'lucide-react';

interface Driver {
  id: string;
  user_id: string;
  nama: string;
  no_whatsapp: string;
  is_active: boolean;
  is_verified: boolean;
  wilayah_id: string | null;
  wilayah?: { nama: string } | null;
  stats?: {
    total_orders: number;
    completed_orders: number;
    average_rating: number;
    total_earnings: number;
  } | null;
  status?: {
    is_online: boolean;
  } | null;
}

interface Wilayah {
  id: string;
  nama: string;
}

export default function AdminDriverPanel() {
  const { toast } = useToast();
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [wilayahs, setWilayahs] = useState<Wilayah[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterWilayah, setFilterWilayah] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const fetchData = async () => {
    setIsLoading(true);

    // Fetch wilayahs
    const { data: wilayahData } = await supabase
      .from('wilayahs')
      .select('id, nama')
      .eq('is_active', true)
      .order('nama');

    setWilayahs(wilayahData || []);

    // Fetch drivers (users with driver role)
    const { data: driverRoles } = await supabase
      .from('user_roles')
      .select('user_id')
      .eq('role', 'driver');

    if (!driverRoles || driverRoles.length === 0) {
      setDrivers([]);
      setIsLoading(false);
      return;
    }

    const driverIds = driverRoles.map(r => r.user_id);

    // Fetch profiles
    const { data: profiles } = await supabase
      .from('profiles')
      .select(`
        id,
        user_id,
        nama,
        no_whatsapp,
        is_active,
        is_verified,
        wilayah_id,
        wilayah:wilayahs(nama)
      `)
      .in('user_id', driverIds);

    if (!profiles) {
      setDrivers([]);
      setIsLoading(false);
      return;
    }

    // Fetch stats
    const { data: statsData } = await supabase
      .from('driver_stats')
      .select('*')
      .in('driver_id', driverIds);

    // Fetch status
    const { data: statusData } = await supabase
      .from('driver_status')
      .select('driver_id, is_online')
      .in('driver_id', driverIds);

    const statsMap = new Map(statsData?.map(s => [s.driver_id, s]));
    const statusMap = new Map(statusData?.map(s => [s.driver_id, s]));

    const driversWithData: Driver[] = profiles.map(p => ({
      ...p,
      stats: statsMap.get(p.user_id) || null,
      status: statusMap.get(p.user_id) || null,
    }));

    setDrivers(driversWithData);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleToggleActive = async (driver: Driver) => {
    const { error } = await supabase
      .from('profiles')
      .update({ is_active: !driver.is_active })
      .eq('id', driver.id);

    if (!error) {
      toast({
        title: driver.is_active ? 'Dinonaktifkan' : 'Diaktifkan',
        description: `Driver ${driver.nama} berhasil ${driver.is_active ? 'dinonaktifkan' : 'diaktifkan'}`,
      });
      fetchData();
    }
  };

  const handleToggleVerified = async (driver: Driver) => {
    const { error } = await supabase
      .from('profiles')
      .update({ is_verified: !driver.is_verified })
      .eq('id', driver.id);

    if (!error) {
      toast({
        title: driver.is_verified ? 'Unverified' : 'Verified',
        description: `Driver ${driver.nama} ${driver.is_verified ? 'tidak terverifikasi' : 'terverifikasi'}`,
      });
      fetchData();
    }
  };

  const handleAssignWilayah = async (driver: Driver, wilayahId: string) => {
    const { error } = await supabase
      .from('profiles')
      .update({ wilayah_id: wilayahId === 'none' ? null : wilayahId })
      .eq('id', driver.id);

    // Also update driver_status
    await supabase
      .from('driver_status')
      .upsert({
        driver_id: driver.user_id,
        wilayah_id: wilayahId === 'none' ? null : wilayahId,
      }, { onConflict: 'driver_id' });

    if (!error) {
      toast({
        title: 'Berhasil',
        description: 'Wilayah driver berhasil diperbarui',
      });
      fetchData();
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const filteredDrivers = drivers.filter(d => {
    if (filterWilayah !== 'all' && d.wilayah_id !== filterWilayah) return false;
    if (filterStatus === 'online' && !d.status?.is_online) return false;
    if (filterStatus === 'offline' && d.status?.is_online) return false;
    if (filterStatus === 'verified' && !d.is_verified) return false;
    if (filterStatus === 'unverified' && d.is_verified) return false;
    return true;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h2 className="text-lg font-bold">Kelola Driver</h2>
          <p className="text-sm text-muted-foreground">
            {drivers.length} driver terdaftar • {drivers.filter(d => d.status?.is_online).length} online
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={filterWilayah} onValueChange={setFilterWilayah}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Wilayah" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Wilayah</SelectItem>
              {wilayahs.map(w => (
                <SelectItem key={w.id} value={w.id}>{w.nama}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua</SelectItem>
              <SelectItem value="online">Online</SelectItem>
              <SelectItem value="offline">Offline</SelectItem>
              <SelectItem value="verified">Verified</SelectItem>
              <SelectItem value="unverified">Unverified</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Drivers Table */}
      {filteredDrivers.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Truck className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>Tidak ada driver ditemukan</p>
        </div>
      ) : (
        <div className="border rounded-xl overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Driver</TableHead>
                <TableHead>Wilayah</TableHead>
                <TableHead className="text-center">Order</TableHead>
                <TableHead className="text-center">Rating</TableHead>
                <TableHead className="text-right">Earnings</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-center">Aktif</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDrivers.map((driver) => (
                <TableRow key={driver.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <Truck className="w-4 h-4 text-primary" />
                        </div>
                        {driver.status?.is_online && (
                          <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-1">
                          <span className="font-medium text-sm">{driver.nama}</span>
                          {driver.is_verified && (
                            <CheckCircle className="w-3.5 h-3.5 text-blue-500" />
                          )}
                        </div>
                        <a
                          href={`https://wa.me/${driver.no_whatsapp}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1"
                        >
                          <Phone className="w-3 h-3" />
                          {driver.no_whatsapp}
                        </a>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={driver.wilayah_id || 'none'}
                      onValueChange={(v) => handleAssignWilayah(driver, v)}
                    >
                      <SelectTrigger className="w-[120px] h-8 text-xs">
                        <SelectValue placeholder="Pilih" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Tidak ada</SelectItem>
                        {wilayahs.map(w => (
                          <SelectItem key={w.id} value={w.id}>{w.nama}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Package className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="text-sm">{driver.stats?.completed_orders || 0}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Star className="w-3.5 h-3.5 text-yellow-500" />
                      <span className="text-sm">{driver.stats?.average_rating?.toFixed(1) || '5.0'}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="text-sm font-medium text-green-600">
                      {formatCurrency(driver.stats?.total_earnings || 0)}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`h-7 text-xs ${driver.is_verified ? 'text-blue-600' : 'text-muted-foreground'}`}
                      onClick={() => handleToggleVerified(driver)}
                    >
                      {driver.is_verified ? 'Verified' : 'Unverified'}
                    </Button>
                  </TableCell>
                  <TableCell className="text-center">
                    <Switch
                      checked={driver.is_active}
                      onCheckedChange={() => handleToggleActive(driver)}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

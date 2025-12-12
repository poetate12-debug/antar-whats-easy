import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Store, Plus, Edit, MapPin, Loader2, UtensilsCrossed, User } from 'lucide-react';

interface Wilayah {
  id: string;
  nama: string;
}

interface Warung {
  id: string;
  nama: string;
  alamat: string;
  no_wa: string;
  deskripsi: string | null;
  foto_url: string | null;
  jam_buka: string | null;
  is_active: boolean;
  owner_id: string | null;
  wilayah_id: string;
  wilayah?: { nama: string };
  owner?: { nama: string; no_whatsapp: string } | null;
  menu_count?: number;
}

interface Menu {
  id: string;
  nama: string;
  harga: number;
  deskripsi: string | null;
  foto_url: string | null;
  kategori: string | null;
  is_available: boolean;
  warung_id: string;
}

export default function AdminMitraPanel() {
  const { toast } = useToast();
  const [wilayahs, setWilayahs] = useState<Wilayah[]>([]);
  const [warungs, setWarungs] = useState<Warung[]>([]);
  const [menus, setMenus] = useState<Record<string, Menu[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [selectedWilayah, setSelectedWilayah] = useState<string>('all');
  
  // Dialog states
  const [warungDialogOpen, setWarungDialogOpen] = useState(false);
  const [menuDialogOpen, setMenuDialogOpen] = useState(false);
  const [editingWarung, setEditingWarung] = useState<Warung | null>(null);
  const [editingMenu, setEditingMenu] = useState<Menu | null>(null);
  const [selectedWarungId, setSelectedWarungId] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);

  // Warung form
  const [warungForm, setWarungForm] = useState({
    nama: '',
    alamat: '',
    no_wa: '',
    deskripsi: '',
    jam_buka: '',
    wilayah_id: '',
    is_active: true,
  });

  // Menu form
  const [menuForm, setMenuForm] = useState({
    nama: '',
    harga: 0,
    deskripsi: '',
    kategori: 'makanan',
    is_available: true,
  });

  const fetchData = async () => {
    setIsLoading(true);

    // Fetch wilayahs
    const { data: wilayahData } = await supabase
      .from('wilayahs')
      .select('id, nama')
      .eq('is_active', true)
      .order('nama');

    setWilayahs(wilayahData || []);

    // Fetch warungs
    const { data: warungData } = await supabase
      .from('warungs')
      .select(`
        *,
        wilayah:wilayahs(nama)
      `)
      .order('nama');

    if (warungData) {
      // Get menu counts
      const { data: menuCounts } = await supabase
        .from('menus')
        .select('warung_id');

      const counts: Record<string, number> = {};
      menuCounts?.forEach(m => {
        counts[m.warung_id] = (counts[m.warung_id] || 0) + 1;
      });

      setWarungs(warungData.map(w => ({
        ...w,
        owner: null,
        menu_count: counts[w.id] || 0
      })) as unknown as Warung[]);
    }

    setIsLoading(false);
  };

  const fetchMenus = async (warungId: string) => {
    if (menus[warungId]) return;

    const { data } = await supabase
      .from('menus')
      .select('*')
      .eq('warung_id', warungId)
      .order('kategori', { ascending: true });

    if (data) {
      setMenus(prev => ({ ...prev, [warungId]: data }));
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredWarungs = selectedWilayah === 'all'
    ? warungs
    : warungs.filter(w => w.wilayah_id === selectedWilayah);

  const openWarungDialog = (warung?: Warung) => {
    if (warung) {
      setEditingWarung(warung);
      setWarungForm({
        nama: warung.nama,
        alamat: warung.alamat,
        no_wa: warung.no_wa,
        deskripsi: warung.deskripsi || '',
        jam_buka: warung.jam_buka || '',
        wilayah_id: warung.wilayah_id,
        is_active: warung.is_active,
      });
    } else {
      setEditingWarung(null);
      setWarungForm({
        nama: '',
        alamat: '',
        no_wa: '',
        deskripsi: '',
        jam_buka: '',
        wilayah_id: wilayahs[0]?.id || '',
        is_active: true,
      });
    }
    setWarungDialogOpen(true);
  };

  const openMenuDialog = (warungId: string, menu?: Menu) => {
    setSelectedWarungId(warungId);
    if (menu) {
      setEditingMenu(menu);
      setMenuForm({
        nama: menu.nama,
        harga: menu.harga,
        deskripsi: menu.deskripsi || '',
        kategori: menu.kategori || 'makanan',
        is_available: menu.is_available,
      });
    } else {
      setEditingMenu(null);
      setMenuForm({
        nama: '',
        harga: 0,
        deskripsi: '',
        kategori: 'makanan',
        is_available: true,
      });
    }
    setMenuDialogOpen(true);
  };

  const handleSaveWarung = async () => {
    if (!warungForm.nama.trim() || !warungForm.alamat.trim() || !warungForm.wilayah_id) {
      toast({
        title: 'Error',
        description: 'Nama, alamat, dan wilayah harus diisi',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        nama: warungForm.nama.trim(),
        alamat: warungForm.alamat.trim(),
        no_wa: warungForm.no_wa.trim(),
        deskripsi: warungForm.deskripsi.trim() || null,
        jam_buka: warungForm.jam_buka.trim() || null,
        wilayah_id: warungForm.wilayah_id,
        is_active: warungForm.is_active,
      };

      if (editingWarung) {
        await supabase.from('warungs').update(payload).eq('id', editingWarung.id);
        toast({ title: 'Berhasil', description: 'Warung berhasil diperbarui' });
      } else {
        await supabase.from('warungs').insert(payload);
        toast({ title: 'Berhasil', description: 'Warung baru berhasil ditambahkan' });
      }

      setWarungDialogOpen(false);
      fetchData();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Gagal menyimpan warung',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveMenu = async () => {
    if (!menuForm.nama.trim() || !menuForm.harga) {
      toast({
        title: 'Error',
        description: 'Nama dan harga harus diisi',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        nama: menuForm.nama.trim(),
        harga: menuForm.harga,
        deskripsi: menuForm.deskripsi.trim() || null,
        kategori: menuForm.kategori,
        is_available: menuForm.is_available,
        warung_id: selectedWarungId,
      };

      if (editingMenu) {
        await supabase.from('menus').update(payload).eq('id', editingMenu.id);
        toast({ title: 'Berhasil', description: 'Menu berhasil diperbarui' });
      } else {
        await supabase.from('menus').insert(payload);
        toast({ title: 'Berhasil', description: 'Menu baru berhasil ditambahkan' });
      }

      setMenuDialogOpen(false);
      // Refresh menus for this warung
      const { data } = await supabase
        .from('menus')
        .select('*')
        .eq('warung_id', selectedWarungId)
        .order('kategori');
      
      if (data) {
        setMenus(prev => ({ ...prev, [selectedWarungId]: data }));
      }
      fetchData();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Gagal menyimpan menu',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

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
          <h2 className="text-lg font-bold">Kelola Warung & Menu</h2>
          <p className="text-sm text-muted-foreground">{warungs.length} warung terdaftar</p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedWilayah} onValueChange={setSelectedWilayah}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Filter wilayah" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Wilayah</SelectItem>
              {wilayahs.map(w => (
                <SelectItem key={w.id} value={w.id}>{w.nama}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={() => openWarungDialog()} size="sm" className="gap-1">
            <Plus className="w-4 h-4" />
            Warung
          </Button>
        </div>
      </div>

      {/* Warungs List */}
      <Accordion type="single" collapsible className="space-y-2">
        {filteredWarungs.map((warung) => (
          <AccordionItem
            key={warung.id}
            value={warung.id}
            className="border rounded-xl overflow-hidden"
          >
            <AccordionTrigger
              className="px-4 hover:no-underline"
              onClick={() => fetchMenus(warung.id)}
            >
              <div className="flex items-center gap-3 text-left">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Store className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold truncate">{warung.nama}</span>
                    {!warung.is_active && (
                      <Badge variant="secondary" className="text-[10px]">Nonaktif</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <MapPin className="w-3 h-3" />
                    <span>{warung.wilayah?.nama}</span>
                    <span>•</span>
                    <span>{warung.menu_count} menu</span>
                    {warung.owner && (
                      <>
                        <span>•</span>
                        <User className="w-3 h-3" />
                        <span>{warung.owner.nama}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <div className="space-y-3">
                {/* Warung Info */}
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    <p>📍 {warung.alamat}</p>
                    {warung.no_wa && <p>📱 {warung.no_wa}</p>}
                    {warung.jam_buka && <p>🕐 {warung.jam_buka}</p>}
                  </div>
                  <Button variant="outline" size="sm" onClick={() => openWarungDialog(warung)}>
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                </div>

                {/* Menus */}
                <div className="border-t pt-3">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-semibold flex items-center gap-1">
                      <UtensilsCrossed className="w-4 h-4" />
                      Menu
                    </h4>
                    <Button variant="ghost" size="sm" onClick={() => openMenuDialog(warung.id)}>
                      <Plus className="w-4 h-4 mr-1" />
                      Tambah Menu
                    </Button>
                  </div>
                  
                  {menus[warung.id]?.length > 0 ? (
                    <div className="space-y-1">
                      {menus[warung.id].map(menu => (
                        <div
                          key={menu.id}
                          className="flex items-center justify-between py-2 px-3 bg-muted/50 rounded-lg"
                        >
                          <div>
                            <span className={`font-medium text-sm ${!menu.is_available ? 'line-through text-muted-foreground' : ''}`}>
                              {menu.nama}
                            </span>
                            <span className="text-xs text-muted-foreground ml-2">
                              ({menu.kategori})
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-primary">
                              {formatCurrency(menu.harga)}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => openMenuDialog(warung.id, menu)}
                            >
                              <Edit className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Belum ada menu
                    </p>
                  )}
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      {/* Warung Dialog */}
      <Dialog open={warungDialogOpen} onOpenChange={setWarungDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingWarung ? 'Edit Warung' : 'Tambah Warung Baru'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Nama Warung *</Label>
              <Input
                value={warungForm.nama}
                onChange={(e) => setWarungForm({ ...warungForm, nama: e.target.value })}
                placeholder="Nama warung"
              />
            </div>

            <div className="space-y-2">
              <Label>Wilayah *</Label>
              <Select
                value={warungForm.wilayah_id}
                onValueChange={(v) => setWarungForm({ ...warungForm, wilayah_id: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih wilayah" />
                </SelectTrigger>
                <SelectContent>
                  {wilayahs.map(w => (
                    <SelectItem key={w.id} value={w.id}>{w.nama}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Alamat *</Label>
              <Textarea
                value={warungForm.alamat}
                onChange={(e) => setWarungForm({ ...warungForm, alamat: e.target.value })}
                placeholder="Alamat lengkap warung"
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label>No. WhatsApp</Label>
              <Input
                value={warungForm.no_wa}
                onChange={(e) => setWarungForm({ ...warungForm, no_wa: e.target.value })}
                placeholder="08xxxxxxxxxx"
              />
            </div>

            <div className="space-y-2">
              <Label>Jam Buka</Label>
              <Input
                value={warungForm.jam_buka}
                onChange={(e) => setWarungForm({ ...warungForm, jam_buka: e.target.value })}
                placeholder="08:00 - 21:00"
              />
            </div>

            <div className="space-y-2">
              <Label>Deskripsi</Label>
              <Textarea
                value={warungForm.deskripsi}
                onChange={(e) => setWarungForm({ ...warungForm, deskripsi: e.target.value })}
                placeholder="Deskripsi singkat warung"
                rows={2}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label>Aktif</Label>
              <Switch
                checked={warungForm.is_active}
                onCheckedChange={(v) => setWarungForm({ ...warungForm, is_active: v })}
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button variant="outline" className="flex-1" onClick={() => setWarungDialogOpen(false)}>
                Batal
              </Button>
              <Button className="flex-1" onClick={handleSaveWarung} disabled={isSaving}>
                {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Simpan
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Menu Dialog */}
      <Dialog open={menuDialogOpen} onOpenChange={setMenuDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingMenu ? 'Edit Menu' : 'Tambah Menu Baru'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Nama Menu *</Label>
              <Input
                value={menuForm.nama}
                onChange={(e) => setMenuForm({ ...menuForm, nama: e.target.value })}
                placeholder="Nama menu"
              />
            </div>

            <div className="space-y-2">
              <Label>Harga *</Label>
              <Input
                type="number"
                value={menuForm.harga}
                onChange={(e) => setMenuForm({ ...menuForm, harga: parseInt(e.target.value) || 0 })}
                placeholder="15000"
              />
            </div>

            <div className="space-y-2">
              <Label>Kategori</Label>
              <Select
                value={menuForm.kategori}
                onValueChange={(v) => setMenuForm({ ...menuForm, kategori: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="makanan">Makanan</SelectItem>
                  <SelectItem value="minuman">Minuman</SelectItem>
                  <SelectItem value="snack">Snack</SelectItem>
                  <SelectItem value="lainnya">Lainnya</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Deskripsi</Label>
              <Textarea
                value={menuForm.deskripsi}
                onChange={(e) => setMenuForm({ ...menuForm, deskripsi: e.target.value })}
                placeholder="Deskripsi menu"
                rows={2}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label>Tersedia</Label>
              <Switch
                checked={menuForm.is_available}
                onCheckedChange={(v) => setMenuForm({ ...menuForm, is_available: v })}
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button variant="outline" className="flex-1" onClick={() => setMenuDialogOpen(false)}>
                Batal
              </Button>
              <Button className="flex-1" onClick={handleSaveMenu} disabled={isSaving}>
                {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Simpan
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

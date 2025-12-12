import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { MapPin, Plus, Edit, Trash2, Loader2 } from 'lucide-react';

interface Wilayah {
  id: string;
  nama: string;
  slug: string;
  ongkir: number;
  is_active: boolean;
  created_at: string;
  warung_count?: number;
}

export default function AdminWilayahPanel() {
  const { toast } = useToast();
  const [wilayahs, setWilayahs] = useState<Wilayah[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingWilayah, setEditingWilayah] = useState<Wilayah | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    nama: '',
    slug: '',
    ongkir: 5000,
    is_active: true,
  });

  const fetchWilayahs = async () => {
    setIsLoading(true);
    
    // Fetch wilayahs with warung count
    const { data, error } = await supabase
      .from('wilayahs')
      .select('*')
      .order('nama');

    if (!error && data) {
      // Get warung counts
      const { data: warungCounts } = await supabase
        .from('warungs')
        .select('wilayah_id');

      const counts: Record<string, number> = {};
      warungCounts?.forEach(w => {
        counts[w.wilayah_id] = (counts[w.wilayah_id] || 0) + 1;
      });

      setWilayahs(data.map(w => ({
        ...w,
        warung_count: counts[w.id] || 0
      })));
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchWilayahs();
  }, []);

  const generateSlug = (nama: string) => {
    return nama
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleOpenDialog = (wilayah?: Wilayah) => {
    if (wilayah) {
      setEditingWilayah(wilayah);
      setFormData({
        nama: wilayah.nama,
        slug: wilayah.slug,
        ongkir: wilayah.ongkir,
        is_active: wilayah.is_active,
      });
    } else {
      setEditingWilayah(null);
      setFormData({
        nama: '',
        slug: '',
        ongkir: 5000,
        is_active: true,
      });
    }
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.nama.trim()) {
      toast({
        title: 'Error',
        description: 'Nama wilayah harus diisi',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);
    const slug = formData.slug || generateSlug(formData.nama);

    try {
      if (editingWilayah) {
        const { error } = await supabase
          .from('wilayahs')
          .update({
            nama: formData.nama.trim(),
            slug,
            ongkir: formData.ongkir,
            is_active: formData.is_active,
          })
          .eq('id', editingWilayah.id);

        if (error) throw error;
        toast({ title: 'Berhasil', description: 'Wilayah berhasil diperbarui' });
      } else {
        const { error } = await supabase
          .from('wilayahs')
          .insert({
            nama: formData.nama.trim(),
            slug,
            ongkir: formData.ongkir,
            is_active: formData.is_active,
          });

        if (error) throw error;
        toast({ title: 'Berhasil', description: 'Wilayah baru berhasil ditambahkan' });
      }

      setIsDialogOpen(false);
      fetchWilayahs();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Gagal menyimpan wilayah',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleActive = async (wilayah: Wilayah) => {
    const { error } = await supabase
      .from('wilayahs')
      .update({ is_active: !wilayah.is_active })
      .eq('id', wilayah.id);

    if (!error) {
      fetchWilayahs();
      toast({
        title: wilayah.is_active ? 'Dinonaktifkan' : 'Diaktifkan',
        description: `Wilayah ${wilayah.nama} berhasil ${wilayah.is_active ? 'dinonaktifkan' : 'diaktifkan'}`,
      });
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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold">Kelola Wilayah</h2>
          <p className="text-sm text-muted-foreground">{wilayahs.length} wilayah terdaftar</p>
        </div>
        <Button onClick={() => handleOpenDialog()} size="sm" className="gap-1">
          <Plus className="w-4 h-4" />
          Tambah
        </Button>
      </div>

      {/* Wilayah Table */}
      <div className="border rounded-xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Wilayah</TableHead>
              <TableHead className="text-right">Ongkir</TableHead>
              <TableHead className="text-center">Warung</TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {wilayahs.map((wilayah) => (
              <TableRow key={wilayah.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">{wilayah.nama}</span>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  {formatCurrency(wilayah.ongkir)}
                </TableCell>
                <TableCell className="text-center">
                  <span className="px-2 py-0.5 bg-muted rounded-full text-xs">
                    {wilayah.warung_count}
                  </span>
                </TableCell>
                <TableCell className="text-center">
                  <Switch
                    checked={wilayah.is_active}
                    onCheckedChange={() => handleToggleActive(wilayah)}
                  />
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleOpenDialog(wilayah)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingWilayah ? 'Edit Wilayah' : 'Tambah Wilayah Baru'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="nama">Nama Wilayah</Label>
              <Input
                id="nama"
                value={formData.nama}
                onChange={(e) => {
                  setFormData({
                    ...formData,
                    nama: e.target.value,
                    slug: generateSlug(e.target.value),
                  });
                }}
                placeholder="Contoh: Cikedung"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">Slug (URL)</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="contoh: cikedung"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ongkir">Ongkir (Rp)</Label>
              <Input
                id="ongkir"
                type="number"
                value={formData.ongkir}
                onChange={(e) => setFormData({ ...formData, ongkir: parseInt(e.target.value) || 0 })}
                placeholder="5000"
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="is_active">Aktif</Label>
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setIsDialogOpen(false)}
              >
                Batal
              </Button>
              <Button
                className="flex-1"
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {editingWilayah ? 'Simpan' : 'Tambah'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

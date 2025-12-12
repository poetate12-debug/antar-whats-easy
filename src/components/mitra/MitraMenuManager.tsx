import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Pencil, Trash2, Package } from 'lucide-react';

interface Menu {
  id: string;
  nama: string;
  harga: number;
  deskripsi: string | null;
  kategori: string;
  is_available: boolean;
}

interface MitraMenuManagerProps {
  menus: Menu[];
  isLoading: boolean;
  onAddMenu: (menu: { nama: string; harga: number; deskripsi?: string; kategori: string }) => Promise<any>;
  onUpdateMenu: (menuId: string, updates: Partial<Menu>) => Promise<any>;
  onToggleAvailability: (menuId: string, isAvailable: boolean) => Promise<any>;
  onDeleteMenu: (menuId: string) => Promise<any>;
}

const kategoriOptions = [
  { value: 'makanan', label: 'Makanan' },
  { value: 'minuman', label: 'Minuman' },
  { value: 'snack', label: 'Snack' },
  { value: 'paket', label: 'Paket' },
];

export default function MitraMenuManager({
  menus,
  isLoading,
  onAddMenu,
  onUpdateMenu,
  onToggleAvailability,
  onDeleteMenu,
}: MitraMenuManagerProps) {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingMenu, setEditingMenu] = useState<Menu | null>(null);
  const [formData, setFormData] = useState({
    nama: '',
    harga: '',
    deskripsi: '',
    kategori: 'makanan',
  });

  const resetForm = () => {
    setFormData({ nama: '', harga: '', deskripsi: '', kategori: 'makanan' });
    setEditingMenu(null);
  };

  const handleSubmit = async () => {
    if (!formData.nama || !formData.harga) return;

    const menuData = {
      nama: formData.nama,
      harga: parseInt(formData.harga),
      deskripsi: formData.deskripsi || undefined,
      kategori: formData.kategori,
    };

    if (editingMenu) {
      await onUpdateMenu(editingMenu.id, menuData);
    } else {
      await onAddMenu(menuData);
    }

    resetForm();
    setIsAddOpen(false);
  };

  const openEditDialog = (menu: Menu) => {
    setEditingMenu(menu);
    setFormData({
      nama: menu.nama,
      harga: menu.harga.toString(),
      deskripsi: menu.deskripsi || '',
      kategori: menu.kategori,
    });
    setIsAddOpen(true);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Group menus by kategori
  const menusByKategori = menus.reduce((acc, menu) => {
    if (!acc[menu.kategori]) acc[menu.kategori] = [];
    acc[menu.kategori].push(menu);
    return acc;
  }, {} as Record<string, Menu[]>);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-16 bg-muted animate-pulse rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div>
      {/* Add Button */}
      <Dialog open={isAddOpen} onOpenChange={(open) => {
        setIsAddOpen(open);
        if (!open) resetForm();
      }}>
        <DialogTrigger asChild>
          <Button className="w-full mb-4 gap-2">
            <Plus className="w-4 h-4" />
            Tambah Menu
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingMenu ? 'Edit Menu' : 'Tambah Menu Baru'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label htmlFor="nama">Nama Menu *</Label>
              <Input
                id="nama"
                value={formData.nama}
                onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                placeholder="Contoh: Nasi Goreng Spesial"
              />
            </div>
            <div>
              <Label htmlFor="harga">Harga (Rp) *</Label>
              <Input
                id="harga"
                type="number"
                value={formData.harga}
                onChange={(e) => setFormData({ ...formData, harga: e.target.value })}
                placeholder="15000"
              />
            </div>
            <div>
              <Label htmlFor="kategori">Kategori</Label>
              <Select
                value={formData.kategori}
                onValueChange={(value) => setFormData({ ...formData, kategori: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {kategoriOptions.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="deskripsi">Deskripsi (Opsional)</Label>
              <Textarea
                id="deskripsi"
                value={formData.deskripsi}
                onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                placeholder="Deskripsi singkat menu"
                rows={2}
              />
            </div>
            <Button onClick={handleSubmit} className="w-full">
              {editingMenu ? 'Update Menu' : 'Tambah Menu'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Menu List */}
      {menus.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Package className="w-16 h-16 mx-auto mb-4 opacity-30" />
          <p className="font-medium">Belum ada menu</p>
          <p className="text-sm">Tambahkan menu pertama Anda</p>
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(menusByKategori).map(([kategori, items]) => (
            <div key={kategori}>
              <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-2">
                {kategori}
              </h4>
              <div className="space-y-2">
                {items.map((menu) => (
                  <div
                    key={menu.id}
                    className={`bg-card border rounded-xl p-3 ${
                      !menu.is_available ? 'opacity-60' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{menu.nama}</p>
                        <p className="text-primary font-semibold text-sm">
                          {formatCurrency(menu.harga)}
                        </p>
                        {menu.deskripsi && (
                          <p className="text-xs text-muted-foreground truncate mt-0.5">
                            {menu.deskripsi}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 ml-2">
                        <Switch
                          checked={menu.is_available}
                          onCheckedChange={(checked) => onToggleAvailability(menu.id, checked)}
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => openEditDialog(menu)}
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          onClick={() => {
                            if (confirm('Hapus menu ini?')) {
                              onDeleteMenu(menu.id);
                            }
                          }}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

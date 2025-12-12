import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface Menu {
  id: string;
  warung_id: string;
  nama: string;
  harga: number;
  deskripsi: string | null;
  foto_url: string | null;
  kategori: string;
  is_available: boolean;
  created_at: string;
}

interface NewMenu {
  nama: string;
  harga: number;
  deskripsi?: string;
  kategori: string;
}

export function useMitraMenus(warungId: string | undefined) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [menus, setMenus] = useState<Menu[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMenus = async () => {
    if (!warungId) return;

    const { data, error } = await supabase
      .from('menus')
      .select('*')
      .eq('warung_id', warungId)
      .order('kategori', { ascending: true })
      .order('nama', { ascending: true });

    if (!error && data) {
      setMenus(data);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchMenus();

    if (!warungId) return;

    // Realtime subscription
    const channel = supabase
      .channel('mitra-menus')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'menus',
          filter: `warung_id=eq.${warungId}`
        },
        () => fetchMenus()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [warungId]);

  const addMenu = async (newMenu: NewMenu) => {
    if (!warungId) return { error: 'No warung found' };

    const { error } = await supabase
      .from('menus')
      .insert({
        warung_id: warungId,
        nama: newMenu.nama,
        harga: newMenu.harga,
        deskripsi: newMenu.deskripsi || null,
        kategori: newMenu.kategori || 'makanan',
        is_available: true,
      });

    if (error) {
      toast({ title: 'Gagal menambah menu', variant: 'destructive' });
    } else {
      toast({ title: 'Menu berhasil ditambahkan!' });
      fetchMenus();
    }
    return { error };
  };

  const updateMenu = async (menuId: string, updates: Partial<Menu>) => {
    const { error } = await supabase
      .from('menus')
      .update(updates)
      .eq('id', menuId);

    if (error) {
      toast({ title: 'Gagal update menu', variant: 'destructive' });
    } else {
      toast({ title: 'Menu berhasil diupdate!' });
      fetchMenus();
    }
    return { error };
  };

  const toggleAvailability = async (menuId: string, isAvailable: boolean) => {
    return updateMenu(menuId, { is_available: isAvailable });
  };

  const deleteMenu = async (menuId: string) => {
    const { error } = await supabase
      .from('menus')
      .delete()
      .eq('id', menuId);

    if (error) {
      toast({ title: 'Gagal menghapus menu', variant: 'destructive' });
    } else {
      toast({ title: 'Menu berhasil dihapus!' });
      fetchMenus();
    }
    return { error };
  };

  return { 
    menus, 
    isLoading, 
    addMenu, 
    updateMenu, 
    toggleAvailability, 
    deleteMenu,
    refresh: fetchMenus 
  };
}

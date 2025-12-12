import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface Warung {
  id: string;
  nama: string;
  alamat: string;
  jam_buka: string | null;
  no_wa: string;
  deskripsi: string | null;
  foto_url: string | null;
  rating: number;
  total_reviews: number;
  is_active: boolean;
  wilayah_id: string;
  wilayah?: {
    nama: string;
  };
}

export function useMitraWarung() {
  const { user } = useAuth();
  const [warung, setWarung] = useState<Warung | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchWarung = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('warungs')
      .select(`
        *,
        wilayah:wilayahs(nama)
      `)
      .eq('owner_id', user.id)
      .maybeSingle();

    if (!error && data) {
      setWarung(data as unknown as Warung);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchWarung();
  }, [user]);

  const updateWarung = async (updates: Partial<Warung>) => {
    if (!warung) return { error: 'No warung found' };

    const { error } = await supabase
      .from('warungs')
      .update(updates)
      .eq('id', warung.id);

    if (!error) {
      setWarung(prev => prev ? { ...prev, ...updates } : null);
    }
    return { error };
  };

  return { warung, isLoading, updateWarung, refresh: fetchWarung };
}

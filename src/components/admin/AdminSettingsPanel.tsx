import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save, Phone, Type, Image } from 'lucide-react';

interface AppSetting {
  id: string;
  key: string;
  value: string;
  description: string | null;
}

export default function AdminSettingsPanel() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [settings, setSettings] = useState<{
    admin_whatsapp: string;
    app_name: string;
    app_logo_url: string;
  }>({
    admin_whatsapp: '',
    app_name: 'GELIS DELIVERY',
    app_logo_url: '',
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('app_settings')
      .select('*');

    if (data) {
      const settingsMap: Record<string, string> = {};
      data.forEach((s: AppSetting) => {
        settingsMap[s.key] = s.value;
      });
      setSettings({
        admin_whatsapp: settingsMap['admin_whatsapp'] || '',
        app_name: settingsMap['app_name'] || 'GELIS DELIVERY',
        app_logo_url: settingsMap['app_logo_url'] || '',
      });
    }
    setIsLoading(false);
  };

  const handleSave = async () => {
    setIsSaving(true);

    try {
      // Update each setting
      const updates = [
        { key: 'admin_whatsapp', value: settings.admin_whatsapp },
        { key: 'app_name', value: settings.app_name },
        { key: 'app_logo_url', value: settings.app_logo_url },
      ];

      for (const update of updates) {
        const { error } = await supabase
          .from('app_settings')
          .update({ value: update.value })
          .eq('key', update.key);

        if (error) throw error;
      }

      toast({
        title: 'Berhasil',
        description: 'Pengaturan telah disimpan',
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: 'Error',
        description: 'Gagal menyimpan pengaturan',
        variant: 'destructive',
      });
    }

    setIsSaving(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-card border border-border rounded-xl p-4">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Phone className="w-4 h-4 text-green-600" />
          Nomor WhatsApp Admin
        </h3>
        <div className="space-y-2">
          <Label htmlFor="admin_wa">Nomor WhatsApp untuk Registrasi</Label>
          <Input
            id="admin_wa"
            type="tel"
            placeholder="6281234567890"
            value={settings.admin_whatsapp}
            onChange={(e) => setSettings({ ...settings, admin_whatsapp: e.target.value })}
          />
          <p className="text-xs text-muted-foreground">
            Nomor ini akan digunakan untuk menerima pesan pendaftaran pengguna baru
          </p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-4">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Type className="w-4 h-4 text-blue-600" />
          Nama Aplikasi
        </h3>
        <div className="space-y-2">
          <Label htmlFor="app_name">Nama Aplikasi</Label>
          <Input
            id="app_name"
            type="text"
            placeholder="GELIS DELIVERY"
            value={settings.app_name}
            onChange={(e) => setSettings({ ...settings, app_name: e.target.value })}
          />
          <p className="text-xs text-muted-foreground">
            Nama ini akan ditampilkan di seluruh aplikasi
          </p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-4">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Image className="w-4 h-4 text-purple-600" />
          Logo Aplikasi
        </h3>
        <div className="space-y-2">
          <Label htmlFor="app_logo">URL Logo</Label>
          <Input
            id="app_logo"
            type="url"
            placeholder="https://example.com/logo.png"
            value={settings.app_logo_url}
            onChange={(e) => setSettings({ ...settings, app_logo_url: e.target.value })}
          />
          <p className="text-xs text-muted-foreground">
            Masukkan URL gambar logo aplikasi (kosongkan untuk menggunakan emoji default 🚀)
          </p>
          {settings.app_logo_url && (
            <div className="mt-2 p-2 bg-muted rounded-lg">
              <p className="text-xs text-muted-foreground mb-2">Preview:</p>
              <img 
                src={settings.app_logo_url} 
                alt="Logo preview" 
                className="h-12 w-auto object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
          )}
        </div>
      </div>

      <Button onClick={handleSave} className="w-full gap-2" disabled={isSaving}>
        {isSaving ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Save className="w-4 h-4" />
        )}
        Simpan Pengaturan
      </Button>
    </div>
  );
}

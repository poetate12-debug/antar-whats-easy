-- Create app_settings table for storing configurable settings
CREATE TABLE public.app_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key text NOT NULL UNIQUE,
  value text NOT NULL,
  description text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- Anyone can read settings
CREATE POLICY "Anyone can view app settings"
ON public.app_settings
FOR SELECT
USING (true);

-- Only admins can manage settings
CREATE POLICY "Admins can manage app settings"
ON public.app_settings
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Insert default settings
INSERT INTO public.app_settings (key, value, description) VALUES 
('admin_whatsapp', '6281234567890', 'Nomor WhatsApp admin untuk registrasi'),
('app_name', 'GELIS DELIVERY', 'Nama aplikasi'),
('app_logo_url', '', 'URL logo aplikasi');

-- Create trigger for updated_at
CREATE TRIGGER update_app_settings_updated_at
BEFORE UPDATE ON public.app_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
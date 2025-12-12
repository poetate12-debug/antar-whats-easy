-- Create wilayahs table
CREATE TABLE public.wilayahs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nama TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  ongkir INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create warungs table
CREATE TABLE public.warungs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  wilayah_id UUID NOT NULL REFERENCES public.wilayahs(id) ON DELETE CASCADE,
  nama TEXT NOT NULL,
  alamat TEXT NOT NULL,
  jam_buka TEXT,
  no_wa TEXT NOT NULL,
  deskripsi TEXT,
  foto_url TEXT,
  rating DECIMAL(2,1) DEFAULT 4.5,
  total_reviews INTEGER DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create menus table  
CREATE TABLE public.menus (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  warung_id UUID NOT NULL REFERENCES public.warungs(id) ON DELETE CASCADE,
  nama TEXT NOT NULL,
  harga INTEGER NOT NULL,
  deskripsi TEXT,
  foto_url TEXT,
  kategori TEXT DEFAULT 'makanan',
  is_available BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create orders table
CREATE TABLE public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  warung_id UUID NOT NULL REFERENCES public.warungs(id) ON DELETE CASCADE,
  wilayah_id UUID NOT NULL REFERENCES public.wilayahs(id) ON DELETE CASCADE,
  customer_name TEXT NOT NULL,
  customer_address TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  catatan TEXT,
  items JSONB NOT NULL,
  subtotal INTEGER NOT NULL,
  ongkir INTEGER NOT NULL,
  total INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.wilayahs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.warungs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menus ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Public read policies for wilayahs, warungs, menus (anyone can view)
CREATE POLICY "Anyone can view active wilayahs" ON public.wilayahs
  FOR SELECT USING (is_active = true);

CREATE POLICY "Anyone can view active warungs" ON public.warungs
  FOR SELECT USING (is_active = true);

CREATE POLICY "Anyone can view available menus" ON public.menus
  FOR SELECT USING (is_available = true);

-- Anyone can create orders (public checkout)
CREATE POLICY "Anyone can create orders" ON public.orders
  FOR INSERT WITH CHECK (true);

-- Orders can be viewed (for admin - we'll add proper admin auth later)
CREATE POLICY "Anyone can view orders" ON public.orders
  FOR SELECT USING (true);

-- Create indexes for performance
CREATE INDEX idx_warungs_wilayah ON public.warungs(wilayah_id);
CREATE INDEX idx_menus_warung ON public.menus(warung_id);
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_orders_warung ON public.orders(warung_id);

-- Insert seed data for wilayahs
INSERT INTO public.wilayahs (nama, slug, ongkir) VALUES
  ('Cikedung', 'cikedung', 5000),
  ('Terisi', 'terisi', 7000),
  ('Lelea', 'lelea', 6000),
  ('Losarang', 'losarang', 8000),
  ('Kroya', 'kroya', 10000),
  ('Gabuswetan', 'gabuswetan', 7500),
  ('Patrol', 'patrol', 9000),
  ('Bongas', 'bongas', 6500);

-- Enable realtime for orders
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
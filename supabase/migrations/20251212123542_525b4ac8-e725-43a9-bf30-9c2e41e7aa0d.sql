-- Add owner_id to warungs table to link with mitra
ALTER TABLE public.warungs ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES auth.users(id);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_warungs_owner_id ON public.warungs(owner_id);

-- Update RLS policies for warungs to allow mitra to manage their own warung
CREATE POLICY "Mitra can manage their own warung"
ON public.warungs
FOR ALL
USING (owner_id = auth.uid() OR has_role(auth.uid(), 'admin'));

-- Update RLS policies for menus to allow mitra to manage menus of their warung
CREATE POLICY "Mitra can manage menus of their warung"
ON public.menus
FOR ALL
USING (
  warung_id IN (
    SELECT id FROM public.warungs WHERE owner_id = auth.uid()
  ) OR has_role(auth.uid(), 'admin')
);

-- Allow mitra to view orders for their warung
CREATE POLICY "Mitra can view orders for their warung"
ON public.orders
FOR SELECT
USING (
  warung_id IN (
    SELECT id FROM public.warungs WHERE owner_id = auth.uid()
  ) OR has_role(auth.uid(), 'admin')
);

-- Allow mitra to update orders for their warung
CREATE POLICY "Mitra can update orders for their warung"
ON public.orders
FOR UPDATE
USING (
  warung_id IN (
    SELECT id FROM public.warungs WHERE owner_id = auth.uid()
  )
);

-- Enable realtime for menus
ALTER PUBLICATION supabase_realtime ADD TABLE public.menus;
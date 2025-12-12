-- Add RLS policies for admins to manage wilayahs
CREATE POLICY "Admins can manage all wilayahs"
ON public.wilayahs
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Add policy to view all wilayahs for admins (including inactive)
CREATE POLICY "Admins can view all wilayahs"
ON public.wilayahs
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));
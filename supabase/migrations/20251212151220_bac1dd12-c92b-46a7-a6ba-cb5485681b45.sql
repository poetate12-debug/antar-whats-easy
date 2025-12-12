-- Drop existing policy and recreate with proper WITH CHECK for warungs
DROP POLICY IF EXISTS "Mitra can manage their own warung" ON public.warungs;

-- Create separate policies for better control
CREATE POLICY "Admins can manage all warungs"
ON public.warungs
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Mitra can manage their own warung"
ON public.warungs
FOR ALL
USING (owner_id = auth.uid())
WITH CHECK (owner_id = auth.uid());
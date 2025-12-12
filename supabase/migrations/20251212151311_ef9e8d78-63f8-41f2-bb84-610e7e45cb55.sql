-- Drop existing policies on app_settings
DROP POLICY IF EXISTS "Admins can manage app settings" ON public.app_settings;
DROP POLICY IF EXISTS "Anyone can view app settings" ON public.app_settings;

-- Recreate as PERMISSIVE policies (default)
CREATE POLICY "Admins can manage app settings"
ON public.app_settings
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can view app settings"
ON public.app_settings
FOR SELECT
TO authenticated
USING (true);
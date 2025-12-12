-- Driver assignments table for order-driver relationship
CREATE TABLE public.driver_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  driver_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'picked_up', 'delivered', 'cancelled')),
  assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  accepted_at TIMESTAMP WITH TIME ZONE,
  picked_up_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Driver online status table
CREATE TABLE public.driver_status (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  driver_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  is_online BOOLEAN NOT NULL DEFAULT false,
  current_location TEXT,
  wilayah_id UUID REFERENCES public.wilayahs(id),
  last_online_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Driver earnings/setoran table
CREATE TABLE public.driver_earnings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  driver_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  amount INTEGER NOT NULL DEFAULT 0,
  type TEXT NOT NULL DEFAULT 'delivery' CHECK (type IN ('delivery', 'bonus', 'tip', 'deduction')),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Driver setoran/deposit table (commission to admin)
CREATE TABLE public.driver_setoran (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  driver_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'confirmed')),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  total_orders INTEGER NOT NULL DEFAULT 0,
  total_earnings INTEGER NOT NULL DEFAULT 0,
  commission_rate NUMERIC(5,2) NOT NULL DEFAULT 10.00,
  paid_at TIMESTAMP WITH TIME ZONE,
  confirmed_by UUID REFERENCES auth.users(id),
  confirmed_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Driver ratings table
CREATE TABLE public.driver_ratings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  driver_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  customer_name TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Driver ranking view (calculated stats)
CREATE TABLE public.driver_stats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  driver_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  total_orders INTEGER NOT NULL DEFAULT 0,
  completed_orders INTEGER NOT NULL DEFAULT 0,
  cancelled_orders INTEGER NOT NULL DEFAULT 0,
  total_earnings INTEGER NOT NULL DEFAULT 0,
  average_rating NUMERIC(3,2) NOT NULL DEFAULT 5.00,
  total_ratings INTEGER NOT NULL DEFAULT 0,
  acceptance_rate NUMERIC(5,2) NOT NULL DEFAULT 100.00,
  rank_position INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add driver_id to orders for tracking
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS driver_id UUID REFERENCES auth.users(id);

-- Enable RLS on all new tables
ALTER TABLE public.driver_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.driver_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.driver_earnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.driver_setoran ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.driver_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.driver_stats ENABLE ROW LEVEL SECURITY;

-- RLS Policies for driver_assignments
CREATE POLICY "Drivers can view their assignments" ON public.driver_assignments
  FOR SELECT USING (driver_id = auth.uid() OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Drivers can update their assignments" ON public.driver_assignments
  FOR UPDATE USING (driver_id = auth.uid());

CREATE POLICY "Admins can manage all assignments" ON public.driver_assignments
  FOR ALL USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for driver_status
CREATE POLICY "Drivers can manage their status" ON public.driver_status
  FOR ALL USING (driver_id = auth.uid());

CREATE POLICY "Anyone can view driver status" ON public.driver_status
  FOR SELECT USING (true);

-- RLS Policies for driver_earnings
CREATE POLICY "Drivers can view their earnings" ON public.driver_earnings
  FOR SELECT USING (driver_id = auth.uid() OR has_role(auth.uid(), 'admin'));

CREATE POLICY "System can insert earnings" ON public.driver_earnings
  FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'));

-- RLS Policies for driver_setoran
CREATE POLICY "Drivers can view their setoran" ON public.driver_setoran
  FOR SELECT USING (driver_id = auth.uid() OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage setoran" ON public.driver_setoran
  FOR ALL USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for driver_ratings
CREATE POLICY "Anyone can view ratings" ON public.driver_ratings
  FOR SELECT USING (true);

CREATE POLICY "Customers can add ratings" ON public.driver_ratings
  FOR INSERT WITH CHECK (true);

-- RLS Policies for driver_stats
CREATE POLICY "Anyone can view driver stats" ON public.driver_stats
  FOR SELECT USING (true);

CREATE POLICY "System can manage driver stats" ON public.driver_stats
  FOR ALL USING (has_role(auth.uid(), 'admin') OR driver_id = auth.uid());

-- Triggers for updated_at
CREATE TRIGGER update_driver_assignments_updated_at
  BEFORE UPDATE ON public.driver_assignments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_driver_status_updated_at
  BEFORE UPDATE ON public.driver_status
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_driver_setoran_updated_at
  BEFORE UPDATE ON public.driver_setoran
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_driver_stats_updated_at
  BEFORE UPDATE ON public.driver_stats
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for order assignments
ALTER PUBLICATION supabase_realtime ADD TABLE public.driver_assignments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.driver_status;
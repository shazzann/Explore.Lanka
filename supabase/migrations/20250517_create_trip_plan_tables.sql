
-- Create trip_plans table
CREATE TABLE IF NOT EXISTS public.trip_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  accommodation TEXT,
  transportation TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create trip_locations table
CREATE TABLE IF NOT EXISTS public.trip_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID REFERENCES public.trip_plans(id) ON DELETE CASCADE NOT NULL,
  location_id UUID REFERENCES public.locations(id) ON DELETE CASCADE NOT NULL,
  order_index INTEGER NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.trip_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trip_locations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for trip_plans
CREATE POLICY "Users can view their own trip plans" 
ON public.trip_plans FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own trip plans" 
ON public.trip_plans FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own trip plans" 
ON public.trip_plans FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own trip plans" 
ON public.trip_plans FOR DELETE 
TO authenticated
USING (auth.uid() = user_id);

-- Create RLS policies for trip_locations
CREATE POLICY "Users can view their trip locations" 
ON public.trip_locations FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.trip_plans tp
    WHERE tp.id = trip_id
    AND tp.user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert trip locations" 
ON public.trip_locations FOR INSERT 
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.trip_plans tp
    WHERE tp.id = trip_id
    AND tp.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update their trip locations" 
ON public.trip_locations FOR UPDATE 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.trip_plans tp
    WHERE tp.id = trip_id
    AND tp.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete their trip locations" 
ON public.trip_locations FOR DELETE 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.trip_plans tp
    WHERE tp.id = trip_id
    AND tp.user_id = auth.uid()
  )
);

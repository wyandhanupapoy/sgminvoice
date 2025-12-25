-- CONSOLIDATED SETUP SCRIPT FOR PT. SUMBER GANDA MEKAR INVOICE SYSTEM
-- Run this in the Supabase SQL Editor (https://supabase.com/dashboard/project/ssrzxbhjfwcysoipjnkb/sql)

-- 1. Enable required extensions
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Grant usage to postgres role
GRANT USAGE ON SCHEMA cron TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA cron TO postgres;

-- 2. Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- 3. Create profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  phone TEXT,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Trigger to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  validated_full_name text;
BEGIN
  -- Validate and sanitize full_name: max 255 characters, trim whitespace
  validated_full_name := NULLIF(TRIM(LEFT(COALESCE(new.raw_user_meta_data ->> 'full_name', ''), 255)), '');
  
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (new.id, new.email, validated_full_name);
  RETURN new;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. Create items table (master data barang)
CREATE TABLE public.items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  item_code TEXT NOT NULL,
  item_name TEXT NOT NULL,
  unit TEXT DEFAULT 'Pcs',
  unit_price NUMERIC DEFAULT 0,
  stock NUMERIC DEFAULT 0,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own items" ON public.items
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own items" ON public.items
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own items" ON public.items
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own items" ON public.items
  FOR DELETE USING (auth.uid() = user_id);

-- 5. Create customers table
CREATE TABLE public.customers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  address TEXT,
  phone TEXT,
  npwp TEXT,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own customers" ON public.customers
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own customers" ON public.customers
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own customers" ON public.customers
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own customers" ON public.customers
  FOR DELETE USING (auth.uid() = user_id);

-- 6. Create suppliers table
CREATE TABLE public.suppliers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  address TEXT,
  phone TEXT,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own suppliers" ON public.suppliers
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own suppliers" ON public.suppliers
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own suppliers" ON public.suppliers
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own suppliers" ON public.suppliers
  FOR DELETE USING (auth.uid() = user_id);

-- 7. Create sales transactions table
CREATE TABLE public.sales (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  transaction_number TEXT NOT NULL,
  customer_id UUID REFERENCES public.customers(id),
  customer_name TEXT NOT NULL,
  customer_address TEXT,
  customer_phone TEXT,
  customer_npwp TEXT,
  transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE,
  payment_method TEXT DEFAULT 'transfer',
  vehicle_number TEXT,
  reference TEXT,
  apply_vat BOOLEAN DEFAULT false,
  vat_exempt BOOLEAN DEFAULT false,
  subtotal NUMERIC DEFAULT 0,
  discount NUMERIC DEFAULT 0,
  shipping_cost NUMERIC DEFAULT 0,
  down_payment NUMERIC DEFAULT 0,
  vat_amount NUMERIC DEFAULT 0,
  grand_total NUMERIC DEFAULT 0,
  notes TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own sales" ON public.sales
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sales" ON public.sales
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sales" ON public.sales
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own sales" ON public.sales
  FOR DELETE USING (auth.uid() = user_id);

-- 8. Create sales items table
CREATE TABLE public.sales_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sales_id UUID REFERENCES public.sales(id) ON DELETE CASCADE NOT NULL,
  item_code TEXT NOT NULL,
  item_name TEXT NOT NULL,
  quantity NUMERIC NOT NULL,
  unit TEXT NOT NULL,
  unit_price NUMERIC NOT NULL,
  total NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.sales_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view sales items through sales" ON public.sales_items
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.sales WHERE sales.id = sales_items.sales_id AND sales.user_id = auth.uid())
  );

CREATE POLICY "Users can insert sales items through sales" ON public.sales_items
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.sales WHERE sales.id = sales_items.sales_id AND sales.user_id = auth.uid())
  );

CREATE POLICY "Users can update sales items through sales" ON public.sales_items
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.sales WHERE sales.id = sales_items.sales_id AND sales.user_id = auth.uid())
  );

CREATE POLICY "Users can delete sales items through sales" ON public.sales_items
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.sales WHERE sales.id = sales_items.sales_id AND sales.user_id = auth.uid())
  );

-- 9. Create purchases transactions table
CREATE TABLE public.purchases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  transaction_number TEXT NOT NULL,
  supplier_id UUID REFERENCES public.suppliers(id),
  supplier_name TEXT NOT NULL,
  supplier_address TEXT,
  supplier_phone TEXT,
  transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE,
  payment_method TEXT DEFAULT 'transfer',
  vehicle_number TEXT,
  reference TEXT,
  apply_vat BOOLEAN DEFAULT false,
  subtotal NUMERIC DEFAULT 0,
  discount NUMERIC DEFAULT 0,
  shipping_cost NUMERIC DEFAULT 0,
  down_payment NUMERIC DEFAULT 0,
  vat_amount NUMERIC DEFAULT 0,
  grand_total NUMERIC DEFAULT 0,
  notes TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own purchases" ON public.purchases
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own purchases" ON public.purchases
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own purchases" ON public.purchases
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own purchases" ON public.purchases
  FOR DELETE USING (auth.uid() = user_id);

-- 10. Create purchase items table
CREATE TABLE public.purchase_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  purchase_id UUID REFERENCES public.purchases(id) ON DELETE CASCADE NOT NULL,
  item_code TEXT NOT NULL,
  item_name TEXT NOT NULL,
  quantity NUMERIC NOT NULL,
  unit TEXT NOT NULL,
  unit_price NUMERIC NOT NULL,
  total NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.purchase_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view purchase items through purchases" ON public.purchase_items
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.purchases WHERE purchases.id = purchase_items.purchase_id AND purchases.user_id = auth.uid())
  );

CREATE POLICY "Users can insert purchase items through purchases" ON public.purchase_items
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.purchases WHERE purchases.id = purchase_items.purchase_id AND purchases.user_id = auth.uid())
  );

CREATE POLICY "Users can update purchase items through purchases" ON public.purchase_items
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.purchases WHERE purchases.id = purchase_items.purchase_id AND purchases.user_id = auth.uid())
  );

CREATE POLICY "Users can delete purchase items through purchases" ON public.purchase_items
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.purchases WHERE purchases.id = purchase_items.purchase_id AND purchases.user_id = auth.uid())
  );

-- 11. Create reminder_settings table
CREATE TABLE public.reminder_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT true,
  schedule_hour INTEGER NOT NULL DEFAULT 8,
  schedule_minute INTEGER NOT NULL DEFAULT 0,
  frequency TEXT NOT NULL DEFAULT 'daily',
  days_before_due INTEGER[] NOT NULL DEFAULT ARRAY[1, 3, 7],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT valid_hour CHECK (schedule_hour >= 0 AND schedule_hour <= 23),
  CONSTRAINT valid_minute CHECK (schedule_minute >= 0 AND schedule_minute <= 59),
  CONSTRAINT valid_frequency CHECK (frequency IN ('daily', 'weekdays', 'weekly'))
);

ALTER TABLE public.reminder_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own reminder settings" 
  ON public.reminder_settings FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own reminder settings" 
  ON public.reminder_settings FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reminder settings" 
  ON public.reminder_settings FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reminder settings"
  ON public.reminder_settings FOR DELETE USING (auth.uid() = user_id);

-- 12. Apply updated_at triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_items_updated_at BEFORE UPDATE ON public.items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON public.customers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_suppliers_updated_at BEFORE UPDATE ON public.suppliers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_sales_updated_at BEFORE UPDATE ON public.sales
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_purchases_updated_at BEFORE UPDATE ON public.purchases
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_reminder_settings_updated_at BEFORE UPDATE ON public.reminder_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

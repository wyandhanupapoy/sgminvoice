-- Add due_date column to sales table
ALTER TABLE public.sales ADD COLUMN due_date date NULL;

-- Add due_date column to purchases table
ALTER TABLE public.purchases ADD COLUMN due_date date NULL;
-- QWB Admin Dashboard Database Schema

-- Create admin users table for authentication
CREATE TABLE public.admin_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create products table
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create customers table  
CREATE TABLE public.customers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT,
  email TEXT,
  phone TEXT,
  is_guest BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create orders table
CREATE TABLE public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_number TEXT NOT NULL UNIQUE,
  customer_id UUID REFERENCES public.customers(id),
  product_id UUID NOT NULL REFERENCES public.products(id),
  product_name TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  bikram_share DECIMAL(10,2) NOT NULL DEFAULT 0,
  owner_share DECIMAL(10,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('completed', 'pending', 'refunded')),
  payment_method TEXT,
  transaction_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Create policies for admin access (no auth required for demo)
CREATE POLICY "Admin users can view all admin_users" ON public.admin_users FOR SELECT USING (true);
CREATE POLICY "Admin users can view all products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Admin users can view all customers" ON public.customers FOR SELECT USING (true);
CREATE POLICY "Admin users can view all orders" ON public.orders FOR SELECT USING (true);
CREATE POLICY "Admin users can insert orders" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin users can update orders" ON public.orders FOR UPDATE USING (true);

-- Insert default products
INSERT INTO public.products (name, price, description) VALUES
('Complete Question Pack', 299.00, 'Complete collection of questions with detailed solutions'),
('Important Pack', 50.00, 'Curated important questions for quick revision'),
('Guest Pack', 50.00, 'Limited access pack for guest users');

-- Insert Bikram admin user (password will be hashed in the app)
INSERT INTO public.admin_users (email, password_hash, full_name, role) VALUES
('bray22610@gmail.com', '$2a$10$placeholder', 'Bikram', 'admin');

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_admin_users_updated_at BEFORE UPDATE ON public.admin_users FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON public.customers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to calculate revenue shares
CREATE OR REPLACE FUNCTION public.calculate_order_shares()
RETURNS TRIGGER AS $$
BEGIN
  -- Bikram gets 30%, Owner gets 70%
  NEW.bikram_share = NEW.price * 0.30;
  NEW.owner_share = NEW.price * 0.70;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger to auto-calculate shares on insert/update
CREATE TRIGGER calculate_order_shares_trigger 
  BEFORE INSERT OR UPDATE ON public.orders 
  FOR EACH ROW 
  EXECUTE FUNCTION public.calculate_order_shares();

-- Insert some sample data for demonstration
INSERT INTO public.customers (name, email, is_guest) VALUES
('John Doe', 'john.doe@example.com', false),
('Jane Smith', 'jane.smith@example.com', false),
('Guest User', NULL, true),
('Rahul Kumar', 'rahul.kumar@example.com', false),
('Guest User 2', NULL, true);

-- Insert sample orders
INSERT INTO public.orders (order_number, customer_id, product_id, product_name, price, status) VALUES
('QWB001', (SELECT id FROM public.customers WHERE email = 'john.doe@example.com'), (SELECT id FROM public.products WHERE name = 'Complete Question Pack'), 'Complete Question Pack', 299.00, 'completed'),
('QWB002', (SELECT id FROM public.customers WHERE email = 'jane.smith@example.com'), (SELECT id FROM public.products WHERE name = 'Important Pack'), 'Important Pack', 50.00, 'completed'),
('QWB003', (SELECT id FROM public.customers WHERE is_guest = true LIMIT 1), (SELECT id FROM public.products WHERE name = 'Guest Pack'), 'Guest Pack', 50.00, 'completed'),
('QWB004', (SELECT id FROM public.customers WHERE email = 'rahul.kumar@example.com'), (SELECT id FROM public.products WHERE name = 'Complete Question Pack'), 'Complete Question Pack', 299.00, 'completed'),
('QWB005', (SELECT id FROM public.customers WHERE is_guest = true OFFSET 1 LIMIT 1), (SELECT id FROM public.products WHERE name = 'Important Pack'), 'Important Pack', 50.00, 'pending');

-- Enable Row Level Security on products table
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Enable Row Level Security on product_images table  
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;

-- Drop existing policies that might conflict
DROP POLICY IF EXISTS "Public can view all products" ON public.products;
DROP POLICY IF EXISTS "Public can view all product images" ON public.product_images;
DROP POLICY IF EXISTS "Admins can view all products" ON public.products;
DROP POLICY IF EXISTS "Admins can insert products" ON public.products;
DROP POLICY IF EXISTS "Admins can update products" ON public.products;
DROP POLICY IF EXISTS "Admins can delete products" ON public.products;
DROP POLICY IF EXISTS "Admins can view all product images" ON public.product_images;
DROP POLICY IF EXISTS "Admins can insert product images" ON public.product_images;
DROP POLICY IF EXISTS "Admins can update product images" ON public.product_images;
DROP POLICY IF EXISTS "Admins can delete product images" ON public.product_images;

-- Create public read access policies for products (anyone can view products on public website)
CREATE POLICY "Anyone can view products"
ON public.products FOR SELECT
USING (true);

-- Create admin-only write policies for products
CREATE POLICY "Only admins can insert products"
ON public.products FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can update products"
ON public.products FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can delete products"
ON public.products FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Create public read access policies for product images (anyone can view images on public website)
CREATE POLICY "Anyone can view product images"
ON public.product_images FOR SELECT
USING (true);

-- Create admin-only write policies for product images
CREATE POLICY "Only admins can insert product images"
ON public.product_images FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can update product images"
ON public.product_images FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can delete product images"
ON public.product_images FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Create product_translations table for storing translations of product fields
CREATE TABLE public.product_translations (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID NOT NULL,
    language VARCHAR(2) NOT NULL CHECK (language IN ('pl', 'en', 'cs', 'sk', 'de')),
    field_name TEXT NOT NULL CHECK (field_name IN (
        'short_description',
        'initial_lift',
        'condition', 
        'drive_type',
        'mast',
        'wheels',
        'foldable_platform',
        'additional_options',
        'detailed_description'
    )),
    translated_value TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add foreign key constraint to products table
ALTER TABLE public.product_translations 
ADD CONSTRAINT fk_product_translations_product_id 
FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;

-- Create unique constraint to prevent duplicate translations for same product/language/field
ALTER TABLE public.product_translations 
ADD CONSTRAINT unique_product_language_field 
UNIQUE (product_id, language, field_name);

-- Create indexes for better performance
CREATE INDEX idx_product_translations_product_id ON public.product_translations(product_id);
CREATE INDEX idx_product_translations_language ON public.product_translations(language);
CREATE INDEX idx_product_translations_field_name ON public.product_translations(field_name);

-- Enable Row Level Security
ALTER TABLE public.product_translations ENABLE ROW LEVEL SECURITY;

-- Create policies for RLS
CREATE POLICY "Anyone can view product translations" 
ON public.product_translations 
FOR SELECT 
USING (true);

CREATE POLICY "Only admins can insert product translations" 
ON public.product_translations 
FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admins can update product translations" 
ON public.product_translations 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admins can delete product translations" 
ON public.product_translations 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_product_translations_updated_at
BEFORE UPDATE ON public.product_translations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ProductSEOSettings {
  id: string;
  product_id: string;
  price?: number;
  price_currency: string;
  price_valid_until?: string;
  gtin?: string;
  mpn?: string;
  availability: 'InStock' | 'OutOfStock' | 'PreOrder' | 'Discontinued';
  item_condition: 'NewCondition' | 'UsedCondition' | 'RefurbishedCondition' | 'DamagedCondition';
  enable_schema: boolean;
  validation_status: 'pending' | 'valid' | 'invalid';
  validation_errors?: any;
  created_at: string;
  updated_at: string;
}

export const useProductSEO = (productId: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch SEO settings for a product
  const { data: seoSettings, isLoading, error } = useQuery({
    queryKey: ['product-seo', productId],
    queryFn: async () => {
      if (!productId) return null;

      const { data, error } = await supabase
        .from('product_seo_settings')
        .select('*')
        .eq('product_id', productId)
        .maybeSingle();

      if (error) throw error;
      return data as ProductSEOSettings | null;
    },
    enabled: !!productId,
  });

  // Update SEO settings
  const updateSEOSettings = useMutation({
    mutationFn: async (settings: Partial<ProductSEOSettings>) => {
      const { data, error } = await supabase
        .from('product_seo_settings')
        .upsert({
          product_id: productId,
          ...settings,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-seo', productId] });
      toast({
        title: 'Sukces',
        description: 'Ustawienia SEO zostały zaktualizowane',
      });
    },
    onError: (error) => {
      toast({
        title: 'Błąd',
        description: `Nie udało się zaktualizować ustawień SEO: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  return {
    seoSettings,
    isLoading,
    error,
    updateSEOSettings: updateSEOSettings.mutate,
    isUpdating: updateSEOSettings.isPending,
  };
};

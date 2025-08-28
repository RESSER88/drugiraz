import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ApiKey {
  id: string;
  name: string;
  api_key_masked: string;
  is_primary: boolean;
  is_active: boolean;
  status: string;
  quota_used: number;
  quota_remaining: number;
  quota_limit: number;
  last_test_at: string;
  last_sync_at: string;
}

interface TranslationLog {
  id: string;
  product_id: string;
  api_key_used: string;
  translation_mode: string;
  field_name: string;
  source_language: string;
  target_language: string;
  status: string;
  characters_used: number;
  error_details?: string;
  processing_time_ms: number;
  created_at: string;
}

export const useDualApiTranslation = () => {
  const { toast } = useToast();
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [translationLogs, setTranslationLogs] = useState<TranslationLog[]>([]);
  const [loading, setLoading] = useState(false);

  const loadTranslationData = async () => {
    setLoading(true);
    try {
      const response = await supabase.functions.invoke('auto-translate', {
        body: { action: 'get_translation_stats' }
      });

      if (response.data?.success) {
        setApiKeys(response.data.apiKeys || []);
        setTranslationLogs(response.data.recentLogs || []);
      } else {
        throw new Error(response.data?.error || 'Failed to load translation data');
      }
    } catch (error) {
      console.error('Error loading translation data:', error);
      toast({
        title: "Błąd",
        description: "Nie można załadować danych tłumaczeń",
        variant: "destructive"
      });
    }
    setLoading(false);
  };

  const testApiConnection = async (keyId: string) => {
    setLoading(true);
    try {
      const response = await supabase.functions.invoke('auto-translate', {
        body: { action: 'test_connection', keyId }
      });

      if (response.data?.success) {
        toast({
          title: "Sukces",
          description: "Połączenie z API działa poprawnie"
        });
        await loadTranslationData(); // Refresh data
        return true;
      } else {
        toast({
          title: "Błąd połączenia",
          description: response.data?.error || "Test połączenia nieudany",
          variant: "destructive"
        });
        return false;
      }
    } catch (error) {
      toast({
        title: "Błąd",
        description: "Nie można przetestować połączenia",
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const refreshUsage = async () => {
    setLoading(true);
    try {
      const response = await supabase.functions.invoke('auto-translate', {
        body: { action: 'refresh_usage' }
      });

      if (response.data?.results) {
        toast({
          title: "Sukces",
          description: "Dane użycia zostały odświeżone"
        });
        await loadTranslationData();
        return true;
      } else {
        throw new Error('No results returned');
      }
    } catch (error) {
      toast({
        title: "Błąd",
        description: "Nie można odświeżyć danych użycia",
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const addApiKey = async (name: string, apiKey: string, isPrimary: boolean = false) => {
    if (!name || !apiKey) {
      toast({
        title: "Błąd",
        description: "Podaj nazwę i klucz API",
        variant: "destructive"
      });
      return false;
    }

    try {
      // Simple base64 encoding for now (in production use proper encryption)
      const encryptedKey = btoa(apiKey);
      const maskedKey = `***${apiKey.slice(-4)}`;

      const { error } = await supabase
        .from('deepl_api_keys')
        .insert({
          name,
          api_key_encrypted: encryptedKey,
          api_key_masked: maskedKey,
          is_primary: isPrimary,
          is_active: true
        });

      if (error) throw error;

      toast({
        title: "Sukces",
        description: "Klucz API został dodany"
      });

      await loadTranslationData();
      return true;
    } catch (error) {
      console.error('Error adding API key:', error);
      toast({
        title: "Błąd",
        description: "Nie można dodać klucza API",
        variant: "destructive"
      });
      return false;
    }
  };

  const translateProductSpecifications = async (
    productId: string, 
    translationMode: string = 'fallback'
  ) => {
    if (!productId) {
      toast({
        title: "Błąd",
        description: "Brak ID produktu",
        variant: "destructive"
      });
      return false;
    }

    setLoading(true);
    try {
      // Get product data
      const { data: product, error: productError } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single();

      if (productError || !product) {
        throw new Error('Produkt nie został znaleziony');
      }

      const productContent = {
        shortDescription: product.short_description,
        specs: {
          additionalDescription: product.detailed_description
        }
      };

      const response = await supabase.functions.invoke('auto-translate', {
        body: {
          action: 'translate_product_specifications',
          productId,
          productContent,
          translationMode
        }
      });

      if (response.data?.success) {
        const successCount = response.data.results.filter((r: any) => r.success).length;
        const totalCount = response.data.results.length;

        toast({
          title: "Tłumaczenie zakończone",
          description: `Przetłumaczono ${successCount}/${totalCount} pól specyfikacji`
        });

        await loadTranslationData();
        return { success: true, results: response.data.results };
      } else {
        throw new Error(response.data?.error || 'Tłumaczenie nieudane');
      }
    } catch (error) {
      console.error('Translation error:', error);
      toast({
        title: "Błąd tłumaczenia",
        description: error.message || "Nie można przetłumaczyć specyfikacji",
        variant: "destructive"
      });
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const deleteApiKey = async (keyId: string) => {
    try {
      const { error } = await supabase
        .from('deepl_api_keys')
        .delete()
        .eq('id', keyId);

      if (error) throw error;

      toast({
        title: "Sukces",
        description: "Klucz API został usunięty"
      });

      await loadTranslationData();
      return true;
    } catch (error) {
      toast({
        title: "Błąd",
        description: "Nie można usunąć klucza API",
        variant: "destructive"
      });
      return false;
    }
  };

  // Load data on mount
  useEffect(() => {
    loadTranslationData();
  }, []);

  return {
    apiKeys,
    translationLogs,
    loading,
    loadTranslationData,
    testApiConnection,
    refreshUsage,
    addApiKey,
    deleteApiKey,
    translateProductSpecifications
  };
};
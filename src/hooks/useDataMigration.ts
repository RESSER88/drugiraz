
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseProducts } from '@/hooks/useSupabaseProducts';

export const useDataMigration = () => {
  const [isMigrating, setIsMigrating] = useState(false);
  const { toast } = useToast();
  const { products: supabaseProducts } = useSupabaseProducts();

  const migrateToSupabase = async () => {
    setIsMigrating(true);
    
    try {
      // Sprawdź czy dane już istnieją w Supabase
      if (supabaseProducts.length > 0) {
        console.log(`Found ${supabaseProducts.length} products already in Supabase`);
        toast({
          title: "Migracja zakończona",
          description: `Dane już istnieją w Supabase (${supabaseProducts.length} produktów)`,
        });
        return;
      }

      toast({
        title: "Informacja",
        description: "Brak lokalnych danych do migracji. Wszystkie produkty są już w Supabase.",
      });

    } catch (error) {
      console.error('Migration error:', error);
      toast({
        title: "Błąd migracji",
        description: "Wystąpił błąd podczas migracji danych",
        variant: "destructive"
      });
    } finally {
      setIsMigrating(false);
    }
  };

  return {
    isMigrating,
    migrateToSupabase
  };
};

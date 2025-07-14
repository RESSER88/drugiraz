
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface MigrationStats {
  totalImages: number;
  base64Images: number;
  storageImages: number;
  migrationProgress: number;
  isCompleted: boolean;
}

export const useMigrationMonitor = (products: any[]) => {
  const [stats, setStats] = useState<MigrationStats>({
    totalImages: 0,
    base64Images: 0,
    storageImages: 0,
    migrationProgress: 0,
    isCompleted: false
  });
  const [isMonitoring, setIsMonitoring] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!products || products.length === 0) return;

    let base64Count = 0;
    let storageCount = 0;
    let totalCount = 0;

    products.forEach(product => {
      if (product.images) {
        product.images.forEach((img: string) => {
          totalCount++;
          if (img.startsWith('data:')) {
            base64Count++;
          } else if (img.includes('supabase.co/storage')) {
            storageCount++;
          }
        });
      }
    });

    const progress = totalCount > 0 ? Math.round((storageCount / totalCount) * 100) : 100;
    const completed = base64Count === 0 && totalCount > 0;

    setStats({
      totalImages: totalCount,
      base64Images: base64Count,
      storageImages: storageCount,
      migrationProgress: progress,
      isCompleted: completed
    });

    console.log(`Migration monitor: ${progress}% complete (${base64Count} base64, ${storageCount} storage)`);
  }, [products]);

  const completeMigration = async () => {
    if (stats.isCompleted) {
      toast({
        title: "ℹ️ Migracja już ukończona",
        description: "Wszystkie obrazy są już w Supabase Storage.",
      });
      return;
    }

    setIsMonitoring(true);
    
    try {
      toast({
        title: "🚀 Dokańczam migrację",
        description: `Przetwarzanie ${stats.base64Images} pozostałych obrazów...`,
        duration: 5000
      });

      const { data, error } = await supabase.functions.invoke('migrate-images', {
        body: { 
          completeMigration: true,
          forceProcess: true 
        }
      });

      if (error) throw error;

      if (data?.success) {
        toast({
          title: "✅ Migracja ukończona!",
          description: `Przeniesiono ${data.stats?.success || stats.base64Images} obrazów do Supabase Storage.`,
          duration: 10000
        });
        
        // Auto-refresh to show updated data
        setTimeout(() => {
          window.location.reload();
        }, 3000);
      } else {
        throw new Error(data?.error || 'Migration failed');
      }
    } catch (error: any) {
      console.error('Migration error:', error);
      toast({
        title: "⚠️ Błąd migracji",
        description: `Błąd: ${error.message}. Spróbuj ponownie.`,
        variant: "destructive",
        duration: 8000
      });
    } finally {
      setIsMonitoring(false);
    }
  };

  return {
    stats,
    isMonitoring,
    completeMigration
  };
};

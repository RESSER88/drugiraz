import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface LanguageProgress {
  language: string;
  total_items: number;
  completed: number;
  pending: number;
  failed: number;
  completion_percentage: number;
  is_priority_processing: boolean;
}

export interface PriorityTaskStatus {
  language: string;
  is_active: boolean;
  started_at?: string;
  estimated_completion?: string;
  processed_count: number;
  total_count: number;
}

export const useZCTPriorityManager = () => {
  const [languageProgress, setLanguageProgress] = useState<LanguageProgress[]>([]);
  const [loading, setLoading] = useState(false);
  const [priorityStatuses, setPriorityStatuses] = useState<{ [key: string]: PriorityTaskStatus | null }>({});
  const { toast } = useToast();

  const loadLanguageProgress = async () => {
    try {
      console.log('🔍 ZCT 2.0: Loading language progress...');
      
      const { data, error } = await supabase.functions.invoke('zct-priority-manager', {
        body: { action: 'get_language_progress' }
      });

      if (error) throw error;
      
      if (data.success) {
        setLanguageProgress(data.data);
        console.log('✅ ZCT 2.0: Language progress loaded:', data.data);
      } else {
        throw new Error(data.error || 'Failed to load language progress');
      }
    } catch (error) {
      console.error('❌ Error loading language progress:', error);
      toast({
        title: 'Błąd ZCT 2.0',
        description: 'Nie udało się załadować postępu języków',
        variant: 'destructive'
      });
    }
  };

  const startPriorityTranslation = async (language: string) => {
    setLoading(true);
    try {
      console.log(`🚀 ZCT 2.0: Starting priority translation for ${language.toUpperCase()}`);
      
      const { data, error } = await supabase.functions.invoke('zct-priority-manager', {
        body: { 
          action: 'start_priority_translation',
          language: language
        }
      });

      if (error) throw error;
      
      if (data.success) {
        toast({
          title: 'Priorytet uruchomiony',
          description: `${data.data.message}. Czas: ~${data.data.estimated_duration_minutes || 'nieznany'} min.`,
          variant: 'default'
        });

        // Odśwież postęp
        await loadLanguageProgress();
        await checkPriorityStatus(language);
        
        console.log('✅ ZCT 2.0: Priority translation started successfully');
      } else {
        throw new Error(data.error || 'Failed to start priority translation');
      }
    } catch (error) {
      console.error('❌ Error starting priority translation:', error);
      toast({
        title: 'Błąd priorytetu',
        description: error.message || 'Nie udało się uruchomić tłumaczenia priorytetowego',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const checkPriorityStatus = async (language: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('zct-priority-manager', {
        body: { 
          action: 'get_priority_status',
          language: language
        }
      });

      if (error) throw error;
      
      if (data.success) {
        setPriorityStatuses(prev => ({
          ...prev,
          [language]: data.data
        }));
      }
    } catch (error) {
      console.error(`❌ Error checking priority status for ${language}:`, error);
    }
  };

  const refreshAllData = async () => {
    setLoading(true);
    try {
      await loadLanguageProgress();
      
      // Sprawdź status wszystkich języków
      const languages = ['en', 'cs', 'sk', 'de'];
      await Promise.all(languages.map(lang => checkPriorityStatus(lang)));
      
      toast({
        title: 'ZCT 2.0 Odświeżone',
        description: 'Wszystkie dane zostały zaktualizowane',
        variant: 'default'
      });
    } catch (error) {
      console.error('❌ Error refreshing ZCT 2.0 data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getLanguageDisplayName = (language: string): string => {
    const names = {
      'en': 'Angielski',
      'cs': 'Czeski', 
      'sk': 'Słowacki',
      'de': 'Niemiecki'
    };
    return names[language as keyof typeof names] || language.toUpperCase();
  };

  const hasActivePriority = (): boolean => {
    return Object.values(priorityStatuses).some(status => status?.is_active);
  };

  const getActivePriorityLanguage = (): string | null => {
    const activeEntry = Object.entries(priorityStatuses).find(([lang, status]) => status?.is_active);
    return activeEntry ? activeEntry[0] : null;
  };

  useEffect(() => {
    // Load initial data
    refreshAllData();

    // Set up polling for priority status updates
    const interval = setInterval(() => {
      if (hasActivePriority()) {
        console.log('🔄 ZCT 2.0: Refreshing due to active priority...');
        refreshAllData();
      }
    }, 10000); // Check every 10 seconds when priority is active

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Set up real-time listener for translation_jobs changes
    console.log('🔗 ZCT 2.0: Setting up real-time listener...');
    
    const channel = supabase
      .channel('zct-priority-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'translation_jobs'
        },
        (payload) => {
          console.log('📡 ZCT 2.0: Translation job updated:', payload);
          // Refresh data when translations change
          loadLanguageProgress();
        }
      )
      .subscribe();

    return () => {
      console.log('🔌 ZCT 2.0: Cleaning up real-time listener');
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    // Data
    languageProgress,
    priorityStatuses,
    loading,
    
    // Actions
    startPriorityTranslation,
    checkPriorityStatus,
    refreshAllData,
    
    // Utils
    getLanguageDisplayName,
    hasActivePriority,
    getActivePriorityLanguage,
    
    // Computed properties
    totalProgress: languageProgress.length > 0 
      ? Math.round(languageProgress.reduce((acc, lang) => acc + lang.completion_percentage, 0) / languageProgress.length)
      : 0
  };
};
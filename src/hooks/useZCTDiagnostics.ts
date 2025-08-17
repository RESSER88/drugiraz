import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ZCTStats {
  total_items: number;
  completed_translations: number;
  pending_translations: number;
  failed_translations: number;
  language_breakdown: {
    [key: string]: {
      completed: number;
      pending: number;
      failed: number;
    };
  };
  api_connection_status: 'online' | 'error';
  last_successful_translation?: string;
}

export interface TranslationOverview {
  id: string;
  content_type: string;
  content_id: string;
  name: string;
  source_language: string;
  target_language: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  characters_used: number;
  error_message?: string;
  created_at: string;
  updated_at: string;
}

export interface TranslationStatusCheck {
  exists: boolean;
  status: string;
  content?: string;
  error?: string;
  created_at?: string;
  updated_at?: string;
  characters_used?: number;
  message?: string;
}

export const useZCTDiagnostics = () => {
  const [stats, setStats] = useState<ZCTStats | null>(null);
  const [translations, setTranslations] = useState<TranslationOverview[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const loadOverview = async () => {
    try {
      console.log('🔍 ZCT: Loading overview...');
      
      const { data, error } = await supabase.functions.invoke('zct-diagnostics', {
        body: { action: 'get_overview' }
      });

      if (error) throw error;
      
      if (data.success) {
        setStats(data.data);
        console.log('✅ ZCT Overview loaded:', data.data);
      } else {
        throw new Error(data.error || 'Failed to load overview');
      }
    } catch (error) {
      console.error('❌ Error loading ZCT overview:', error);
      toast({
        title: 'Błąd ZCT',
        description: 'Nie udało się załadować przeglądu systemu tłumaczeń',
        variant: 'destructive'
      });
    }
  };

  const loadDetailedTranslations = async () => {
    try {
      console.log('🔍 ZCT: Loading detailed translations...');
      
      const { data, error } = await supabase.functions.invoke('zct-diagnostics', {
        body: { action: 'get_detailed_translations' }
      });

      if (error) throw error;
      
      if (data.success) {
        setTranslations(data.data);
        console.log(`✅ ZCT: Loaded ${data.data.length} detailed translations`);
      } else {
        throw new Error(data.error || 'Failed to load detailed translations');
      }
    } catch (error) {
      console.error('❌ Error loading detailed translations:', error);
      toast({
        title: 'Błąd ZCT',
        description: 'Nie udało się załadować szczegółów tłumaczeń',
        variant: 'destructive'
      });
    }
  };

  const loadRecentActivity = async () => {
    try {
      console.log('🔍 ZCT: Loading recent activity...');
      
      const { data, error } = await supabase.functions.invoke('zct-diagnostics', {
        body: { action: 'get_recent_activity' }
      });

      if (error) throw error;
      
      if (data.success) {
        setRecentActivity(data.data);
        console.log(`✅ ZCT: Loaded ${data.data.length} recent activities`);
      } else {
        throw new Error(data.error || 'Failed to load recent activity');
      }
    } catch (error) {
      console.error('❌ Error loading recent activity:', error);
      toast({
        title: 'Błąd ZCT',
        description: 'Nie udało się załadować ostatnich aktywności',
        variant: 'destructive'
      });
    }
  };

  const checkTranslationStatus = async (
    contentType: string, 
    contentId: string, 
    targetLanguage: string
  ): Promise<TranslationStatusCheck | null> => {
    try {
      console.log(`🔍 ZCT: Checking status for ${contentType}/${contentId} -> ${targetLanguage}`);
      
      const { data, error } = await supabase.functions.invoke('zct-diagnostics', {
        body: { 
          action: 'check_translation_status',
          content_type: contentType,
          content_id: contentId,
          target_language: targetLanguage
        }
      });

      if (error) throw error;
      
      if (data.success) {
        console.log(`✅ ZCT: Status check result:`, data.data);
        return data.data;
      } else {
        throw new Error(data.error || 'Failed to check translation status');
      }
    } catch (error) {
      console.error('❌ Error checking translation status:', error);
      toast({
        title: 'Błąd ZCT',
        description: 'Nie udało się sprawdzić statusu tłumaczenia',
        variant: 'destructive'
      });
      return null;
    }
  };

  const refreshAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadOverview(),
        loadDetailedTranslations(),
        loadRecentActivity()
      ]);
      
      toast({
        title: 'ZCT Odświeżone',
        description: 'Wszystkie dane zostały zaktualizowane',
        variant: 'default'
      });
    } catch (error) {
      console.error('❌ Error refreshing ZCT data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Load initial data
    refreshAllData();
  }, []);

  return {
    // Data
    stats,
    translations,
    recentActivity,
    loading,
    
    // Actions
    loadOverview,
    loadDetailedTranslations,
    loadRecentActivity,
    checkTranslationStatus,
    refreshAllData,
    
    // Utils
    isApiOnline: stats?.api_connection_status === 'online',
    hasTranslations: translations.length > 0,
    completionRate: stats ? (stats.completed_translations / Math.max(stats.total_items, 1)) * 100 : 0
  };
};
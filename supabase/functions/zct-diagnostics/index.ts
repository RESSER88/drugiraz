import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const deepLApiKey = Deno.env.get('DEEPL_API_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface TranslationOverview {
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

interface ZCTStats {
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

async function testDeepLConnection(): Promise<boolean> {
  try {
    const response = await fetch('https://api-free.deepl.com/v2/usage', {
      method: 'GET',
      headers: {
        'Authorization': `DeepL-Auth-Key ${deepLApiKey}`,
      },
    });
    
    return response.ok;
  } catch (error) {
    console.error('DeepL connection test failed:', error);
    return false;
  }
}

async function getZCTOverview(): Promise<ZCTStats> {
  console.log('🔍 ZCT Diagnostics: Getting overview...');

  // Test connection to DeepL API
  const apiConnected = await testDeepLConnection();
  console.log(`🌐 DeepL API Status: ${apiConnected ? 'ONLINE' : 'ERROR'}`);

  // Get all translation jobs
  const { data: allJobs, error } = await supabase
    .from('translation_jobs')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('❌ Error fetching translation jobs:', error);
    throw error;
  }

  console.log(`📊 Found ${allJobs?.length || 0} translation jobs in database`);

  const jobs = allJobs || [];
  
  // Calculate stats
  const stats: ZCTStats = {
    total_items: jobs.length,
    completed_translations: jobs.filter(j => j.status === 'completed').length,
    pending_translations: jobs.filter(j => j.status === 'pending').length,
    failed_translations: jobs.filter(j => j.status === 'failed').length,
    language_breakdown: {},
    api_connection_status: apiConnected ? 'online' : 'error',
  };

  // Find last successful translation
  const lastCompleted = jobs.find(j => j.status === 'completed');
  if (lastCompleted) {
    stats.last_successful_translation = lastCompleted.updated_at;
  }

  // Language breakdown
  const languages = ['en', 'cs', 'sk', 'de'];
  languages.forEach(lang => {
    stats.language_breakdown[lang] = {
      completed: jobs.filter(j => j.target_language === lang && j.status === 'completed').length,
      pending: jobs.filter(j => j.target_language === lang && j.status === 'pending').length,
      failed: jobs.filter(j => j.target_language === lang && j.status === 'failed').length,
    };
  });

  console.log('📈 ZCT Stats calculated:', {
    total: stats.total_items,
    completed: stats.completed_translations,
    pending: stats.pending_translations,
    failed: stats.failed_translations,
    api_status: stats.api_connection_status
  });

  return stats;
}

async function getDetailedTranslations(): Promise<TranslationOverview[]> {
  console.log('🔍 ZCT Diagnostics: Getting detailed translations...');

  const { data: jobs, error } = await supabase
    .from('translation_jobs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100);

  if (error) {
    console.error('❌ Error fetching detailed translations:', error);
    throw error;
  }

  console.log(`📋 Processing ${jobs?.length || 0} translation jobs for detailed view`);

  return (jobs || []).map(job => ({
    id: job.id,
    content_type: job.content_type,
    content_id: job.content_id,
    name: generateDisplayName(job),
    source_language: job.source_language,
    target_language: job.target_language,
    status: job.status,
    characters_used: job.characters_used || 0,
    error_message: job.error_message,
    created_at: job.created_at,
    updated_at: job.updated_at,
  }));
}

function generateDisplayName(job: any): string {
  // Create human-readable names based on content type and ID
  if (job.content_type === 'faq') {
    return `FAQ pytanie #${job.content_id}`;
  } else if (job.content_type === 'product') {
    return `Produkt ${job.content_id}`;
  } else if (job.content_type === 'homepage') {
    return `Strona główna (${job.content_id})`;
  }
  
  return `${job.content_type} ${job.content_id}`;
}

async function checkTranslationStatus(contentType: string, contentId: string, targetLang: string) {
  console.log(`🔍 Checking status for: ${contentType}/${contentId} -> ${targetLang}`);

  const { data: job, error } = await supabase
    .from('translation_jobs')
    .select('*')
    .eq('content_type', contentType)
    .eq('content_id', contentId)
    .eq('target_language', targetLang)
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
    console.error('❌ Error checking translation status:', error);
    throw error;
  }

  if (!job) {
    console.log(`❌ No translation found for ${contentType}/${contentId} -> ${targetLang}`);
    return {
      exists: false,
      status: 'not_found',
      message: 'Tłumaczenie nie zostało znalezione w bazie danych'
    };
  }

  console.log(`✅ Translation found: ${job.status}`);
  return {
    exists: true,
    status: job.status,
    content: job.translated_content,
    error: job.error_message,
    created_at: job.created_at,
    updated_at: job.updated_at,
    characters_used: job.characters_used
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, ...params } = await req.json();
    console.log(`🚀 ZCT Diagnostics called with action: ${action}`);
    
    switch (action) {
      case 'get_overview': {
        const overview = await getZCTOverview();
        
        return new Response(JSON.stringify({
          success: true,
          data: overview
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'get_detailed_translations': {
        const translations = await getDetailedTranslations();
        
        return new Response(JSON.stringify({
          success: true,
          data: translations
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'check_translation_status': {
        const { content_type, content_id, target_language } = params;
        
        if (!content_type || !content_id || !target_language) {
          throw new Error('Missing required parameters: content_type, content_id, target_language');
        }

        const status = await checkTranslationStatus(content_type, content_id, target_language);
        
        return new Response(JSON.stringify({
          success: true,
          data: status
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'get_recent_activity': {
        const { data: recentJobs } = await supabase
          .from('translation_jobs')
          .select('*')
          .order('updated_at', { ascending: false })
          .limit(10);

        return new Response(JSON.stringify({
          success: true,
          data: recentJobs || []
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      default:
        throw new Error(`Unknown action: ${action}`);
    }

  } catch (error) {
    console.error('❌ ZCT Diagnostics error:', error);
    
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
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

interface LanguageProgress {
  language: string;
  total_items: number;
  completed: number;
  pending: number;
  failed: number;
  completion_percentage: number;
  is_priority_processing: boolean;
}

interface PriorityTaskStatus {
  language: string;
  is_active: boolean;
  started_at?: string;
  estimated_completion?: string;
  processed_count: number;
  total_count: number;
}

// Sprawdź czy język jest obecnie w trybie priorytetu
async function checkPriorityStatus(language: string): Promise<PriorityTaskStatus | null> {
  try {
    // Sprawdź czy istnieją zadania priorytetu dla tego języka w statusie 'processing'
    const { data: priorityJobs } = await supabase
      .from('translation_jobs')
      .select('*')
      .eq('target_language', language)
      .eq('status', 'processing')
      .like('content_id', '%_priority_%');

    if (priorityJobs && priorityJobs.length > 0) {
      const { data: totalPriorityJobs } = await supabase
        .from('translation_jobs')
        .select('id', { count: 'exact' })
        .eq('target_language', language)
        .like('content_id', '%_priority_%');

      return {
        language,
        is_active: true,
        started_at: priorityJobs[0].updated_at,
        processed_count: priorityJobs.length,
        total_count: totalPriorityJobs?.length || 0
      };
    }

    return null;
  } catch (error) {
    console.error('❌ Error checking priority status:', error);
    return null;
  }
}

async function getLanguageProgress(): Promise<LanguageProgress[]> {
  console.log('🔍 ZCT 2.0: Getting language progress...');

  const languages = ['en', 'cs', 'sk', 'de'];
  const progress: LanguageProgress[] = [];

  for (const lang of languages) {
    try {
      // Pobierz statystyki dla języka
      const { data: jobs, error } = await supabase
        .from('translation_jobs')
        .select('status')
        .eq('target_language', lang);

      if (error) {
        console.error(`❌ Error fetching jobs for ${lang}:`, error);
        continue;
      }

      const total = jobs?.length || 0;
      const completed = jobs?.filter(j => j.status === 'completed').length || 0;
      const pending = jobs?.filter(j => j.status === 'pending').length || 0;
      const failed = jobs?.filter(j => j.status === 'failed').length || 0;
      const completion_percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

      // Sprawdź czy język jest w trybie priorytetu
      const priorityStatus = await checkPriorityStatus(lang);

      progress.push({
        language: lang,
        total_items: total,
        completed,
        pending,
        failed,
        completion_percentage,
        is_priority_processing: priorityStatus?.is_active || false
      });

      console.log(`📊 ${lang.toUpperCase()}: ${completion_percentage}% (${completed}/${total})`);
    } catch (error) {
      console.error(`❌ Error processing language ${lang}:`, error);
    }
  }

  return progress;
}

async function startPriorityTranslation(language: string): Promise<any> {
  console.log(`🚀 Starting priority translation for ${language.toUpperCase()}`);

  try {
    // 1. Sprawdź czy już nie jest aktywny inny priorytet
    const activeLanguages = ['en', 'cs', 'sk', 'de'];
    for (const lang of activeLanguages) {
      if (lang !== language) {
        const status = await checkPriorityStatus(lang);
        if (status?.is_active) {
          throw new Error(`Priorytet dla języka ${lang.toUpperCase()} jest już aktywny. Zakończ go przed rozpoczęciem nowego.`);
        }
      }
    }

    // 2. Pobierz wszystkie oczekujące zadania dla tego języka
    const { data: pendingJobs, error } = await supabase
      .from('translation_jobs')
      .select('*')
      .eq('target_language', language)
      .eq('status', 'pending')
      .order('created_at', { ascending: true });

    if (error) throw error;

    if (!pendingJobs || pendingJobs.length === 0) {
      return {
        success: true,
        message: `Brak oczekujących tłumaczeń dla języka ${language.toUpperCase()}`,
        priority_jobs_created: 0
      };
    }

    console.log(`📋 Found ${pendingJobs.length} pending jobs for ${language.toUpperCase()}`);

    // 3. Oznacz zadania jako priorytetowe
    const priorityJobIds = [];
    for (let i = 0; i < Math.min(pendingJobs.length, 50); i++) { // Maksymalnie 50 zadań na raz
      const job = pendingJobs[i];
      
      // Zmień status na 'processing' i dodaj oznaczenie priorytetu
      const { error: updateError } = await supabase
        .from('translation_jobs')
        .update({ 
          status: 'processing',
          content_id: `${job.content_id}_priority_${Date.now()}` // Oznacz jako priorytet
        })
        .eq('id', job.id);

      if (!updateError) {
        priorityJobIds.push(job.id);
      }
    }

    console.log(`✅ Marked ${priorityJobIds.length} jobs as priority for ${language.toUpperCase()}`);

    // 4. Uruchom zadanie w tle dla tłumaczenia priorytetowego
    EdgeRuntime.waitUntil(processPriorityJobs(language, priorityJobIds));

    return {
      success: true,
      message: `Rozpoczęto priorytetowe tłumaczenie dla języka ${language.toUpperCase()}`,
      priority_jobs_created: priorityJobIds.length,
      estimated_duration_minutes: Math.ceil(priorityJobIds.length / 10) // Szacunek: 10 tłumaczeń na minutę
    };

  } catch (error) {
    console.error('❌ Error starting priority translation:', error);
    throw error;
  }
}

async function processPriorityJobs(language: string, jobIds: string[]) {
  console.log(`🔄 Processing ${jobIds.length} priority jobs for ${language.toUpperCase()}`);

  for (const jobId of jobIds) {
    try {
      // Pobierz zadanie
      const { data: job } = await supabase
        .from('translation_jobs')
        .select('*')
        .eq('id', jobId)
        .single();

      if (!job) continue;

      // Sprawdź limit DeepL
      if (!await checkMonthlyLimit()) {
        console.log('⚠️ Monthly limit reached, stopping priority processing');
        break;
      }

      // Przetłumacz
      const translated = await translateText(
        job.source_content, 
        job.target_language, 
        job.source_language
      );

      // Zapisz wynik
      await supabase
        .from('translation_jobs')
        .update({
          status: 'completed',
          translated_content: translated,
          characters_used: job.source_content.length,
          content_id: job.content_id.replace('_priority_' + job.content_id.split('_priority_')[1], '') // Usuń oznaczenie priorytetu
        })
        .eq('id', jobId);

      await updateMonthlyStats(job.source_content.length);
      
      console.log(`✅ Completed priority job ${jobId} for ${language.toUpperCase()}`);

      // Małe opóźnienie między żądaniami
      await new Promise(resolve => setTimeout(resolve, 300));

    } catch (error) {
      console.error(`❌ Error processing priority job ${jobId}:`, error);
      
      // Oznacz jako błąd
      await supabase
        .from('translation_jobs')
        .update({
          status: 'failed',
          error_message: error.message
        })
        .eq('id', jobId);
    }
  }

  console.log(`🏁 Finished processing priority jobs for ${language.toUpperCase()}`);
}

// Funkcje pomocnicze z auto-translate
async function translateText(text: string, targetLang: string, sourceLang = 'pl'): Promise<string> {
  const response = await fetch('https://api-free.deepl.com/v2/translate', {
    method: 'POST',
    headers: {
      'Authorization': `DeepL-Auth-Key ${deepLApiKey}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      text: text,
      target_lang: targetLang.toUpperCase(),
      source_lang: sourceLang.toUpperCase(),
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`DeepL API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  return data.translations[0]?.text || text;
}

async function updateMonthlyStats(charactersUsed: number) {
  const currentMonth = new Date().toISOString().slice(0, 7);
  
  const { data: existing } = await supabase
    .from('translation_stats')
    .select('*')
    .eq('month_year', currentMonth)
    .single();

  if (existing) {
    await supabase
      .from('translation_stats')
      .update({
        characters_used: existing.characters_used + charactersUsed,
        api_calls: existing.api_calls + 1,
      })
      .eq('month_year', currentMonth);
  } else {
    await supabase
      .from('translation_stats')
      .insert({
        month_year: currentMonth,
        characters_used: charactersUsed,
        api_calls: 1,
      });
  }
}

async function checkMonthlyLimit(): Promise<boolean> {
  const currentMonth = new Date().toISOString().slice(0, 7);
  
  const { data } = await supabase
    .from('translation_stats')
    .select('characters_used, characters_limit')
    .eq('month_year', currentMonth)
    .single();

  if (!data) return true;
  return data.characters_used < data.characters_limit;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, ...params } = await req.json();
    console.log(`🚀 ZCT Priority Manager called with action: ${action}`);
    
    switch (action) {
      case 'get_language_progress': {
        const progress = await getLanguageProgress();
        
        return new Response(JSON.stringify({
          success: true,
          data: progress
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'start_priority_translation': {
        const { language } = params;
        
        if (!language || !['en', 'cs', 'sk', 'de'].includes(language)) {
          throw new Error('Invalid language. Must be one of: en, cs, sk, de');
        }

        const result = await startPriorityTranslation(language);
        
        return new Response(JSON.stringify({
          success: true,
          data: result
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'get_priority_status': {
        const { language } = params;
        const status = await checkPriorityStatus(language);
        
        return new Response(JSON.stringify({
          success: true,
          data: status
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      default:
        throw new Error(`Unknown action: ${action}`);
    }

  } catch (error) {
    console.error('❌ ZCT Priority Manager error:', error);
    
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
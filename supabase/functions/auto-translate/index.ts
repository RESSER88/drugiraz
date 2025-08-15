import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

interface TranslationRequest {
  text: string;
  target_lang: string;
  source_lang?: string;
}

interface DeepLResponse {
  translations: Array<{
    detected_source_language: string;
    text: string;
  }>;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const deepLApiKey = Deno.env.get('DEEPL_API_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function translateText(text: string, targetLang: string, sourceLang = 'pl'): Promise<string> {
  console.log(`Translating text to ${targetLang}: ${text.substring(0, 100)}...`);
  
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

  const data: DeepLResponse = await response.json();
  return data.translations[0]?.text || text;
}

async function updateMonthlyStats(charactersUsed: number) {
  const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
  
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

  if (!data) return true; // No usage yet
  
  return data.characters_used < data.characters_limit;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, ...params } = await req.json();
    
    switch (action) {
      case 'translate_text': {
        const { text, target_lang, source_lang = 'pl' }: TranslationRequest = params;
        
        if (!await checkMonthlyLimit()) {
          throw new Error('Monthly translation limit exceeded');
        }
        
        const translated = await translateText(text, target_lang, source_lang);
        await updateMonthlyStats(text.length);
        
        return new Response(JSON.stringify({ 
          translated_text: translated,
          characters_used: text.length 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'translate_faq': {
        console.log('Starting FAQ translation...');
        
        if (!await checkMonthlyLimit()) {
          throw new Error('Monthly translation limit exceeded');
        }

        const targetLanguages = ['en', 'cs', 'sk', 'de'];
        const faqItems = [
          { question: 'Czy model Toyota SWE 200d może bezpiecznie poruszać się po nawierzchni z kostki brukowej?', answer: 'Tak, model nadaje się do jazdy po kostce.' },
          { question: 'Czy model SWE 200d może być użytkowany na powierzchniach kamienistych?', answer: 'Nie, nie jest przystosowany do jazdy po kamieniach.' },
          { question: 'Czy wózek SWE 200d umożliwia rozładunek palet z naczepy TIR?', answer: 'Tak, umożliwia rozładunek z TIRa.' },
          // ... więcej elementów FAQ
        ];

        let totalCharacters = 0;
        const translations = {};

        for (const lang of targetLanguages) {
          console.log(`Translating FAQ to ${lang}...`);
          translations[lang] = [];
          
          for (const item of faqItems) {
            const questionTranslated = await translateText(item.question, lang);
            const answerTranslated = await translateText(item.answer, lang);
            
            totalCharacters += item.question.length + item.answer.length;
            
            translations[lang].push({
              question: questionTranslated,
              answer: answerTranslated
            });

            // Dodaj małe opóźnienie między żądaniami
            await new Promise(resolve => setTimeout(resolve, 100));
          }
        }

        await updateMonthlyStats(totalCharacters);
        
        return new Response(JSON.stringify({ 
          success: true,
          translations,
          characters_used: totalCharacters 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'process_pending_translations': {
        console.log('Processing pending translations...');
        
        if (!await checkMonthlyLimit()) {
          console.log('Monthly limit exceeded, skipping...');
          return new Response(JSON.stringify({ 
            success: false, 
            message: 'Monthly limit exceeded' 
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        // Pobierz oczekujące tłumaczenia
        const { data: pendingJobs } = await supabase
          .from('translation_jobs')
          .select('*')
          .eq('status', 'pending')
          .order('created_at')
          .limit(10); // Przetwarzaj maksymalnie 10 na raz

        if (!pendingJobs || pendingJobs.length === 0) {
          return new Response(JSON.stringify({ 
            success: true, 
            message: 'No pending translations' 
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        let processedCount = 0;
        let totalCharacters = 0;

        for (const job of pendingJobs) {
          try {
            // Oznacz jako przetwarzane
            await supabase
              .from('translation_jobs')
              .update({ status: 'processing' })
              .eq('id', job.id);

            const translated = await translateText(
              job.source_content, 
              job.target_language, 
              job.source_language
            );

            // Zapisz tłumaczenie
            await supabase
              .from('translation_jobs')
              .update({
                status: 'completed',
                translated_content: translated,
                characters_used: job.source_content.length
              })
              .eq('id', job.id);

            totalCharacters += job.source_content.length;
            processedCount++;

            console.log(`Processed translation job ${job.id}`);

            // Sprawdź limity po każdym tłumaczeniu
            if (!await checkMonthlyLimit()) {
              console.log('Monthly limit reached during processing');
              break;
            }

            // Małe opóźnienie między żądaniami
            await new Promise(resolve => setTimeout(resolve, 200));

          } catch (error) {
            console.error(`Error processing job ${job.id}:`, error);
            
            await supabase
              .from('translation_jobs')
              .update({
                status: 'failed',
                error_message: error.message
              })
              .eq('id', job.id);
          }
        }

        if (totalCharacters > 0) {
          await updateMonthlyStats(totalCharacters);
        }

        return new Response(JSON.stringify({ 
          success: true,
          processed_count: processedCount,
          characters_used: totalCharacters
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'get_stats': {
        const currentMonth = new Date().toISOString().slice(0, 7);
        
        const { data: stats } = await supabase
          .from('translation_stats')
          .select('*')
          .eq('month_year', currentMonth)
          .single();

        const { data: pendingCount } = await supabase
          .from('translation_jobs')
          .select('id', { count: 'exact' })
          .eq('status', 'pending');

        return new Response(JSON.stringify({
          current_month: currentMonth,
          characters_used: stats?.characters_used || 0,
          characters_limit: stats?.characters_limit || 500000,
          api_calls: stats?.api_calls || 0,
          pending_jobs: pendingCount?.length || 0,
          limit_reached: stats ? stats.characters_used >= stats.characters_limit : false
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      default:
        throw new Error('Invalid action');
    }

  } catch (error) {
    console.error('Error in auto-translate function:', error);
    
    return new Response(JSON.stringify({ 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
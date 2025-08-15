import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

// This function is designed to run on a cron schedule (e.g., every 30 minutes)
// It processes pending translations automatically within the monthly limit

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function processPendingTranslations() {
  console.log('Translation worker started...');
  
  try {
    // Call the main auto-translate function to process pending translations
    const response = await fetch(`${supabaseUrl}/functions/v1/auto-translate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'process_pending_translations'
      }),
    });

    const result = await response.json();
    
    if (result.success) {
      console.log(`Translation worker completed: ${result.processed_count} translations processed, ${result.characters_used} characters used`);
      
      return {
        success: true,
        processed_count: result.processed_count,
        characters_used: result.characters_used,
        timestamp: new Date().toISOString()
      };
    } else {
      console.log(`Translation worker: ${result.message}`);
      
      return {
        success: true,
        message: result.message,
        timestamp: new Date().toISOString()
      };
    }
    
  } catch (error) {
    console.error('Translation worker error:', error);
    
    return {
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Translation worker invoked');
    
    const result = await processPendingTranslations();
    
    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in translation-worker function:', error);
    
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
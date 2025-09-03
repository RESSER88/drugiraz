import { supabase } from '@/integrations/supabase/client';

export const testTranslationSystem = async () => {
  console.log('🔬 ROZPOCZYNANIE TESTU SYSTEMU TŁUMACZEŃ - AUDYT');
  
  const testProductId = 'b76fcbd2-8fb0-4087-9f96-3897c59ff07c';
  const startTime = Date.now();
  
  // KROK 1: Pobierz dane produktu
  const { data: product, error: productError } = await supabase
    .from('products')
    .select('*')
    .eq('id', testProductId)
    .single();
    
  if (productError) {
    console.error('❌ BŁĄD: Nie można pobrać produktu', productError);
    return { success: false, error: 'Product fetch failed' };
  }
  
  console.log('✅ KROK 1: Produkt pobrany', { id: product.id, name: product.name });
  
  // KROK 2: Sprawdź istniejące tłumaczenia
  const { data: existingTranslations } = await supabase
    .from('product_translations')
    .select('*')
    .eq('product_id', testProductId);
    
  console.log('📊 KROK 2: Istniejące tłumaczenia:', existingTranslations?.length || 0);
  
  // KROK 3: Wykonaj tłumaczenie
  console.log('🚀 KROK 3: Wykonywanie tłumaczenia...');
  
  // POPRAWKA: Wysyłanie danych z płaską strukturą (bez product_data wrapper)
  const { data, error } = await supabase.functions.invoke('auto-translate', {
    body: {
      action: 'translate_product_fields',
      product_id: testProductId,
      // Dane bezpośrednio w body (bez product_data wrapper)
      short_description: product.short_description,
      initial_lift: product.initial_lift,
      condition: product.condition,
      drive_type: product.drive_type,
      mast: product.mast,
      wheels: product.wheels,
      foldable_platform: product.foldable_platform,
      additional_options: product.additional_options,
      detailed_description: product.detailed_description
    }
  });
  
  const processingTime = Date.now() - startTime;
  
  if (error) {
    console.error('❌ BŁĄD TŁUMACZENIA:', error);
    return { success: false, error: error.message, processingTime };
  }
  
  console.log('✅ KROK 3: Odpowiedź z edge function:', data);
  
  // KROK 4: Sprawdź zapisane tłumaczenia
  const { data: newTranslations, error: checkError } = await supabase
    .from('product_translations')
    .select('*')
    .eq('product_id', testProductId);
    
  if (checkError) {
    console.error('❌ BŁĄD: Nie można sprawdzić zapisanych tłumaczeń', checkError);
    return { success: false, error: 'Translation check failed' };
  }
  
  console.log('📊 KROK 4: Nowe tłumaczenia w bazie:', newTranslations?.length || 0);
  
  // KROK 5: Analiza wyników
  const expectedLanguages = ['en', 'de', 'sk', 'cs'];
  const expectedFields = ['short_description', 'initial_lift', 'condition', 'drive_type', 'mast', 'wheels', 'foldable_platform', 'additional_options'];
  
  const coverage = {};
  for (const lang of expectedLanguages) {
    coverage[lang] = newTranslations?.filter(t => t.language === lang).length || 0;
  }
  
  const totalExpected = expectedLanguages.length * expectedFields.length;
  const totalActual = newTranslations?.length || 0;
  const coveragePercent = Math.round((totalActual / totalExpected) * 100);
  
  const result = {
    success: data?.success || false,
    processingTime,
    productId: testProductId,
    productName: product.name,
    translationsCreated: totalActual,
    expectedTranslations: totalExpected,
    coveragePercent,
    languageCoverage: coverage,
    edgeFunctionResponse: data,
    timestamp: new Date().toISOString()
  };
  
  console.log('🎯 WYNIK TESTU:', result);
  return result;
};
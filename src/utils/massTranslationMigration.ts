import { supabase } from '@/integrations/supabase/client';

export const executeMassTranslationMigration = async () => {
  console.log('🚀 ROZPOCZYNANIE MASOWEJ MIGRACJI TŁUMACZEŃ');
  
  const startTime = Date.now();
  const results = {
    totalProducts: 0,
    processedProducts: 0,
    successfulProducts: 0,
    failedProducts: 0,
    totalTranslations: 0,
    errors: [] as string[],
    processingTime: 0
  };

  try {
    // KROK 1: Pobierz wszystkie produkty
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('*')
      .order('created_at');

    if (productsError) {
      throw new Error(`Błąd pobierania produktów: ${productsError.message}`);
    }

    results.totalProducts = products?.length || 0;
    console.log(`📊 Znaleziono ${results.totalProducts} produktów do przetworzenia`);

    if (!products || products.length === 0) {
      return { ...results, processingTime: Date.now() - startTime };
    }

    // KROK 2: Sprawdź istniejące tłumaczenia
    const { data: existingTranslations } = await supabase
      .from('product_translations')
      .select('product_id, language, field_name');

    const existingMap = new Map();
    existingTranslations?.forEach(t => {
      const key = `${t.product_id}-${t.language}-${t.field_name}`;
      existingMap.set(key, true);
    });

    console.log(`📋 Znaleziono ${existingTranslations?.length || 0} istniejących tłumaczeń`);

    // KROK 3: Przetwarzaj każdy produkt
    for (const product of products) {
      console.log(`\n🔄 Przetwarzanie produktu: ${product.name} (${product.id})`);
      results.processedProducts++;

      try {
        // Sprawdź czy produkt potrzebuje tłumaczenia
        const languages = ['en', 'de', 'sk', 'cs'];
        const fields = ['short_description', 'initial_lift', 'condition', 'drive_type', 'mast', 'wheels', 'foldable_platform', 'additional_options'];
        
        let needsTranslation = false;
        for (const lang of languages) {
          for (const field of fields) {
            const key = `${product.id}-${lang}-${field}`;
            if (!existingMap.has(key) && product[field] && product[field].trim() !== '') {
              needsTranslation = true;
              break;
            }
          }
          if (needsTranslation) break;
        }

        if (!needsTranslation) {
          console.log(`⏭️ Produkt ${product.name} już ma wszystkie tłumaczenia`);
          results.successfulProducts++;
          continue;
        }

        // Przygotuj dane do tłumaczenia
        const productData = {
          short_description: product.short_description || '',
          initial_lift: product.initial_lift || '',
          condition: product.condition || '',
          drive_type: product.drive_type || '',
          mast: product.mast || '',
          wheels: product.wheels || '',
          foldable_platform: product.foldable_platform || '',
          additional_options: product.additional_options || '',
          detailed_description: product.detailed_description || ''
        };

        // Wykonaj tłumaczenie
        const { data, error } = await supabase.functions.invoke('auto-translate', {
          body: {
            action: 'translate_product_fields',
            product_id: product.id,
            product_data: productData
          }
        });

        if (error) {
          console.error(`❌ Błąd tłumaczenia dla ${product.name}:`, error);
          results.errors.push(`${product.name}: ${error.message}`);
          results.failedProducts++;
        } else if (data?.success) {
          console.log(`✅ Sukces tłumaczenia dla ${product.name}`);
          const successCount = data.results?.filter((r: any) => r.status === 'completed').length || 0;
          results.totalTranslations += successCount;
          results.successfulProducts++;
        } else {
          console.error(`❌ Nieoczekiwana odpowiedź dla ${product.name}:`, data);
          results.errors.push(`${product.name}: Nieoczekiwana odpowiedź z API`);
          results.failedProducts++;
        }

        // Opóźnienie między produktami aby nie przeciążyć API
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (error) {
        console.error(`❌ Błąd przetwarzania produktu ${product.name}:`, error);
        results.errors.push(`${product.name}: ${error.message}`);
        results.failedProducts++;
      }
    }

    results.processingTime = Date.now() - startTime;

    console.log('\n🎯 PODSUMOWANIE MIGRACJI:');
    console.log(`📊 Produkty: ${results.processedProducts}/${results.totalProducts} przetworzonych`);
    console.log(`✅ Sukces: ${results.successfulProducts} produktów`);
    console.log(`❌ Błędy: ${results.failedProducts} produktów`);
    console.log(`🌐 Tłumaczenia: ${results.totalTranslations} utworzonych`);
    console.log(`⏱️ Czas: ${Math.round(results.processingTime / 1000)}s`);

    if (results.errors.length > 0) {
      console.log('\n❌ BŁĘDY:');
      results.errors.forEach(error => console.log(`  - ${error}`));
    }

    return results;

  } catch (error) {
    console.error('💥 KRYTYCZNY BŁĄD MIGRACJI:', error);
    results.processingTime = Date.now() - startTime;
    results.errors.push(`Krytyczny błąd: ${error.message}`);
    return results;
  }
};
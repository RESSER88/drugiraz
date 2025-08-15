# Plan Integracji AI Translation System - Stakerpol

## 1. Analiza Obecnego Systemu Wielojęzycznego

### Obecna Struktura
- **Typ systemu**: Statyczne tłumaczenia oparte na plikach TypeScript
- **Lokalizacja**: `src/utils/translations/` (modularna struktura)
- **Obsługiwane języki**: PL, EN, CS, SK, DE
- **Komponenty tłumaczeń**:
  - Navigation, Homepage, Products, ProductSpecs
  - Contact, Common, Forms, Pricing, Admin
  - Errors, Testimonials

### Hook useTranslation
```typescript
export const useTranslation = (language: Language) => {
  return (key: TranslationKey): string => {
    return translations[key]?.[language] || translations[key]?.pl || key;
  };
};
```

## 2. Rekomendowane API Tłumaczeń

### Option A: OpenAI GPT-4 (RECOMMENDED)
**Zalety:**
- Wysokiej jakości tłumaczenia kontekstowe
- Możliwość zachowania tonu i stylu marki
- Obsługa specjalistycznego słownictwa (wózki widłowe)
- Możliwość custom promptów dla spójności

**Koszty:** ~$0.03-0.06 za 1000 tokenów
**Rate Limits:** 10,000 RPM (tier 2)

### Option B: DeepL API Pro
**Zalety:**
- Najwyższa jakość tłumaczeń dla języków europejskich
- Doskonałe wsparcie dla PL, EN, CS, SK, DE
- Specjalne obsługiwanie formatów HTML/XML

**Koszty:** €5.99/miesiąc za 500,000 znaków
**Rate Limits:** Brak ograniczeń dla Pro

### Option C: Google Cloud Translate v3
**Zalety:**
- Niezawodność enterprise
- Auto-detection języka źródłowego
- Batch processing

**Koszty:** $20 za 1M znaków
**Rate Limits:** 1000 req/100s

## 3. Proponowana Architektura Integracji

### Supabase Edge Function: `translate-content`

```typescript
// supabase/functions/translate-content/index.ts
import { serve } from 'std/server.ts'

interface TranslationRequest {
  content: Record<string, string>
  sourceLang: string
  targetLangs: string[]
  module: string // 'products', 'faq', etc.
}

serve(async (req) => {
  const { content, sourceLang, targetLangs, module } = await req.json()
  
  // OpenAI GPT-4 call with context
  const translations = await translateWithGPT4(content, sourceLang, targetLangs, module)
  
  // Save to Supabase table: translations
  await saveTranslations(translations, module)
  
  return new Response(JSON.stringify(translations))
})
```

### Database Schema (Supabase)

```sql
CREATE TABLE translations (
  id SERIAL PRIMARY KEY,
  module TEXT NOT NULL, -- 'products', 'faq', 'admin'
  key TEXT NOT NULL,
  language CHAR(2) NOT NULL,
  content TEXT NOT NULL,
  source_content TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  is_ai_generated BOOLEAN DEFAULT FALSE,
  quality_score FLOAT,
  UNIQUE(module, key, language)
);

CREATE INDEX idx_translations_module_lang ON translations(module, language);
```

### React Hook: `useAITranslation`

```typescript
export const useAITranslation = () => {
  const translateModule = async (
    module: string, 
    content: Record<string, string>,
    targetLangs: string[]
  ) => {
    const response = await supabase.functions.invoke('translate-content', {
      body: { content, sourceLang: 'pl', targetLangs, module }
    })
    
    // Update local translation cache
    return response.data
  }
  
  return { translateModule }
}
```

## 4. Workflow Implementacji

### Faza 1: Backend Setup (2-3 dni)
1. **Supabase Edge Function** - `translate-content`
2. **Database Schema** - tabela `translations`
3. **API Integration** - OpenAI GPT-4 lub DeepL
4. **Rate Limiting** - implementacja queue systemu

### Faza 2: Frontend Integration (2-3 dni)
1. **Admin Panel** - UI dla zarządzania tłumaczeniami
2. **Translation Hook** - `useAITranslation`
3. **Cache Management** - synchronizacja z statycznymi plikami
4. **Quality Review** - interface do akceptacji/edycji

### Faza 3: Content Migration (1-2 dni)
1. **Existing Content** - migracja obecnych tłumaczeń
2. **Missing Translations** - auto-generate using AI
3. **Quality Check** - review wszystkich AI translations

## 5. UI/UX dla AI Translation

### Admin Dashboard - Translation Manager
```typescript
// src/components/admin/TranslationManager.tsx
const TranslationManager = () => {
  const { translateModule } = useAITranslation()
  
  return (
    <div className="translation-manager">
      <Card>
        <CardHeader>
          <h2>AI Translation Manager</h2>
        </CardHeader>
        <CardContent>
          <Select placeholder="Select module">
            <SelectItem value="products">Products</SelectItem>
            <SelectItem value="faq">FAQ</SelectItem>
            <SelectItem value="homepage">Homepage</SelectItem>
          </Select>
          
          <Button onClick={handleBulkTranslate}>
            Generate Missing Translations
          </Button>
          
          <DataTable columns={translationColumns} data={translations} />
        </CardContent>
      </Card>
    </div>
  )
}
```

## 6. Quality Assurance

### AI Prompt Engineering
```
System: You are a professional translator for a Polish forklift company website. 
Maintain technical accuracy and brand consistency. Use formal business tone.

Context: Industrial equipment, BT Toyota forklifts, B2B sales
Target audience: Warehouse managers, logistics professionals

Translate the following content from Polish to {target_language}:
{content}

Ensure technical terms are correctly translated and maintain the professional tone.
```

### Review Workflow
1. **AI Translation** - automatyczne generowanie
2. **Quality Score** - algorytmiczna ocena (confidence score)
3. **Human Review** - manualny przegląd dla ważnych treści
4. **A/B Testing** - porównanie konwersji

## 7. Monitoring & Analytics

### Metryki
- **Translation Quality Score** (AI confidence)
- **User Engagement** per language
- **Conversion Rate** by language
- **Translation Errors** reporting

### Dashboard KPIs
- Liczba przetłumaczonych elementów
- Oszczędność czasu vs manual translation
- Quality score trend
- API usage costs

## 8. Bezpieczeństwo & Compliance

### GDPR Compliance
- Minimalizacja danych
- Prawo do usunięcia tłumaczeń
- Transparentność AI processing

### Security
- API key encryption w Supabase Secrets
- Rate limiting na edge functions
- Input sanitization

## 9. Budżet & Timeline

### Koszty Miesięczne (estimate)
- **OpenAI API**: ~$50-100/miesiąc
- **Supabase Edge Functions**: ~$25/miesiąc
- **Development Time**: 40-60 godzin

### Timeline
- **Week 1-2**: Backend infrastructure
- **Week 3**: Frontend integration
- **Week 4**: Testing & deployment

## 10. Rekomendacje

### Immediate Actions
1. ✅ **Start with DeepL API** - najlepsza jakość dla języków EU
2. ✅ **Pilot Program** - zacząć od modułu FAQ
3. ✅ **Quality Gates** - manual review dla kluczowych treści

### Future Enhancements
- **Real-time Translation** - live chat support
- **SEO Optimization** - multilingual meta tags
- **Content Personalization** - regional variants

---

**Status:** Ready for implementation
**Effort:** 5-7 days development
**ROI:** High - automated 80%+ translation work
**Risk:** Low - non-breaking additive changes
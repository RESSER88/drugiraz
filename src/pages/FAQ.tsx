import React, { useState, useMemo } from 'react';
import Layout from '@/components/layout/Layout';
import { Helmet } from 'react-helmet-async';
import FAQSection, { FAQItem } from '@/components/ui/FAQSection';
import FAQSchema from '@/components/seo/FAQSchema';
import SearchInput from '@/components/ui/SearchInput';
import { useDynamicTranslations } from '@/hooks/useDynamicTranslations';
import { useLanguage } from '@/contexts/LanguageContext';
import LoadingSkeleton from '@/components/ui/LoadingSkeleton';
import { AlertCircle } from 'lucide-react';

const FAQ: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { language } = useLanguage();
  const { 
    getAllFAQItems, 
    loading, 
    hasTranslations, 
    lastFetched 
  } = useDynamicTranslations();

  console.log(`🔍 FAQ Page: Current language: ${language}, Has translations: ${hasTranslations}`);

  // Get FAQ items from database or fallback to static
  const baseFAQItems: FAQItem[] = hasTranslations 
    ? getAllFAQItems(language)
    : [
        // Fallback static items (only if no database translations available)
        { question: 'Czy model Toyota SWE 200d może bezpiecznie poruszać się po nawierzchni z kostki brukowej?', answer: 'Tak, model nadaje się do jazdy po kostce.' },
        { question: 'Czy model SWE 200d może być użytkowany na powierzchniach kamienistych?', answer: 'Nie, nie jest przystosowany do jazdy po kamieniach.' },
        { question: 'Czy wózek SWE 200d umożliwia rozładunek palet z naczepy TIR?', answer: 'Tak, umożliwia rozładunek z TIRa.' },
        { question: 'Czy paleciak może wjechać do komory chłodniczej?', answer: 'Tak, może wjechać.' },
        { question: 'Czy wózek może pracować w chłodni przez dłuższy czas?', answer: 'Tak, jeśli zastosowano odpowiedni olej hydrauliczny.' },
        { question: 'Czy SWE 200d przejedzie przez bramę o wysokości 1,90 m?', answer: 'Tak, jego wysokość całkowita to 1,54 m.' },
        { question: 'Czy wymagane jest oddzielne pomieszczenie do ładowania pojedynczego wózka?', answer: 'Nie, nie jest wymagane.' },
        { question: 'Czy do obsługi tego wózka potrzebne są uprawnienia?', answer: 'Tak, wymagane są uprawnienia UDT.' },
        { question: 'Czy wózek z masztem musi przechodzić obowiązkowy przegląd UDT?', answer: 'Tak, wymagany jest ważny przegląd.' },
        { question: 'Na jak długo UDT wydaje decyzję eksploatacyjną dla wózka?', answer: 'Bez podestu – 24 miesiące, z podestem – 12 miesięcy.' },
        { question: 'Czy używane wózki są objęte gwarancją?', answer: 'Tak, gwarancja wynosi 3 miesiące.' },
        { question: 'W jaki sposób należy ładować akumulator wózka?', answer: 'Za pomocą dołączonego prostownika.' },
        { question: 'Czy możliwe jest przetestowanie wózka przed zakupem?', answer: 'Tak, można obejrzeć i przetestować wózek.' },
        { question: 'Jakie są dostępne formy dostawy wózka?', answer: 'Możliwy odbiór osobisty lub wysyłka kurierska.' },
        { question: 'Czy oferowane wózki używane przechodzą przegląd techniczny?', answer: 'Tak, każdy wózek jest sprawdzany technicznie.' },
        { question: 'Jak sprawdzany jest stan baterii w wózku elektrycznym?', answer: 'Poprzez diagnostykę, testy i pomiar parametrów elektrolitu.' },
        { question: 'Czy oferujecie serwis wózków po zakończeniu gwarancji?', answer: 'Tak, świadczymy serwis pogwarancyjny.' },
        { question: 'Czy posiadacie autoryzację do konserwacji wózków widłowych?', answer: 'Tak, posiadamy odpowiednie uprawnienia.' },
        { question: "Na czym polega funkcja 'creep to creep'?", answer: 'Funkcja umożliwia precyzyjne manewrowanie z niską prędkością.' },
        { question: 'Co oznacza kod błędu 2.001?', answer: 'Kod oznacza, że jest wciśnięty przycisk „grzybek" bezpieczeństwa.' },
      ];

  const filteredFAQItems = useMemo(() => {
    if (!searchTerm.trim()) return baseFAQItems;
    
    return baseFAQItems.filter(item => 
      item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, baseFAQItems]);

  if (loading) {
    return (
      <Layout>
        <Helmet>
          <title>FAQ wózki widłowe – najczęstsze pytania | Stakerpol</title>
          <meta name="description" content="Kompletne FAQ o wózkach widłowych Toyota BT: eksploatacja, serwis, UDT, bateria, dostawa. Odpowiedzi na najczęstszych pytań." />
        </Helmet>
        <main>
          <section className="section-padding bg-white">
            <div className="container-custom">
              <h1 className="section-title text-center">Najczęstsze pytania (FAQ)</h1>
              <LoadingSkeleton className="mt-8" />
            </div>
          </section>
        </main>
      </Layout>
    );
  }

  return (
    <Layout>
      <Helmet>
        <title>FAQ wózki widłowe – najczęstsze pytania | Stakerpol</title>
        <meta name="description" content="Kompletne FAQ o wózkach widłowych Toyota BT: eksploatacja, serwis, UDT, bateria, dostawa. Odpowiedzi na najczęstszych pytań." />
        <link rel="canonical" href="https://stakerpol.pl/faq" />
        <meta property="og:title" content="FAQ wózki widłowe – Stakerpol" />
        <meta property="og:description" content="Odpowiedzi na najczęstsze pytania o wózki widłowe Toyota BT: użytkowanie, serwis, UDT, bateria, dostawa." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://stakerpol.pl/faq" />
        <meta name="twitter:card" content="summary" />
      </Helmet>
      <main>
        <section className="section-padding bg-white" aria-labelledby="faq-page-heading">
          <div className="container-custom">
            <h1 id="faq-page-heading" className="section-title text-center">Najczęstsze pytania (FAQ)</h1>
            <p className="text-center text-muted-foreground max-w-2xl mx-auto mt-2">
              Zebraliśmy odpowiedzi na pytania, które najczęściej otrzymujemy od klientów.
            </p>
            
            {/* Debug info in development */}
            {!hasTranslations && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-4 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <span className="text-sm text-yellow-800">
                  Używane są statyczne tłumaczenia (brak tłumaczeń w bazie danych)
                </span>
              </div>
            )}
            
            {hasTranslations && lastFetched && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-4 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm text-green-800">
                  Tłumaczenia z bazy danych (język: {language.toUpperCase()}, ostatnia aktualizacja: {new Date(lastFetched).toLocaleString('pl')})
                </span>
              </div>
            )}
            
            <div className="mt-8 max-w-md mx-auto">
              <SearchInput
                value={searchTerm}
                onChange={setSearchTerm}
                placeholder="Szukaj w FAQ..."
                className="w-full"
              />
            </div>
            
            <div className="mt-8">
              {filteredFAQItems.length > 0 ? (
                <FAQSection title="" items={filteredFAQItems} />
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    Brak wyników dla frazy "{searchTerm}". Spróbuj użyć innych słów kluczowych.
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
      <FAQSchema items={baseFAQItems} />
    </Layout>
  );
};

export default FAQ;
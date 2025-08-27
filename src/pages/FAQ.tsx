import React, { useState, useMemo } from 'react';
import Layout from '@/components/layout/Layout';
import { Helmet } from 'react-helmet-async';
import FAQSection, { FAQItem } from '@/components/ui/FAQSection';
import FAQSchema from '@/components/seo/FAQSchema';
import SearchInput from '@/components/ui/SearchInput';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslation } from '@/utils/translations';

const FAQ: React.FC = () => {
  const { language } = useLanguage();
  const t = useTranslation(language);
  const [searchTerm, setSearchTerm] = useState('');
  
  const faqItems: FAQItem[] = useMemo(() => {
    return Array.from({ length: 35 }, (_, index) => ({
      question: t(`faq_${index + 1}_question` as any),
      answer: t(`faq_${index + 1}_answer` as any),
    }));
  }, [t]);
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
    { question: 'Co oznacza kod błędu 2.001?', answer: 'Kod oznacza, że jest wciśnięty przycisk „grzybek” bezpieczeństwa.' },
    { question: 'Co oznacza kod błędu E50?', answer: 'Kod oznacza, że jest wciśnięty przycisk „grzybek” bezpieczeństwa.' },
    { question: 'W jakim stanie są koła i rolki w oferowanych wózkach?', answer: 'Są nowe lub mają niewielki stopień zużycia.' },
    { question: 'Jakie materiały są stosowane w kołach wózków?', answer: 'Najczęściej poliuretan – cichy, trwały, nie zostawia śladów.' },
    { question: 'Dlaczego paleciak nie podnosi ładunku i co zrobić?', answer: 'Sprawdź poziom baterii, wagę ładunku i skontaktuj się z serwisem.' },
    { question: 'W jakich warunkach najlepiej sprawdzą się wózki BT SWE?', answer: 'Wewnątrz i na zewnątrz, na równych powierzchniach, do załadunku/rozładunku.' },
    { question: 'Jak dobrać długość wideł do europalet?', answer: 'Standardowa długość 1150 mm pasuje do europalet.' },
    { question: 'Jak długo ładuje się bateria wózka?', answer: 'Pełne ładowanie trwa 6–8 godzin w zależności od modelu.' },
    { question: 'Na czym polega kompleksowe sprawdzenie baterii?', answer: 'Obejmuje testy obciążeniowe i kontrolę stanu elektrolitu.' },
    { question: 'Jak przebiega proces regeneracji baterii?', answer: 'Diagnostyka, czyszczenie, wymiany, testy wydajnościowe.' },
    { question: 'Czy oferujecie możliwość leasingu wózków?', answer: 'Tak, umożliwiamy leasing na atrakcyjnych warunkach.' },
    { question: 'Czy zapewniacie transport zakupionych wózków?', answer: 'Tak, dostarczamy wózek bezpiecznie pod wskazany adres.' },
    { question: 'Jak można sprawdzić stan używanego wózka?', answer: 'Każdy paleciak ma przegląd, zapraszamy na jazdę próbną.' },
    { question: 'Jakie modele Toyota BT posiadacie w ofercie?', answer: 'SWE120L, SWE140L, SWE200D – wersje z podestem i bez.' },
    { question: 'Jak bezpiecznie ładować baterię wózka?', answer: 'Zaparkować, wyłączyć, wentylować, stosować środki ochrony.' },
    { question: 'Co się dzieje przy niskim poziomie baterii?', answer: 'Włącza się sygnał ostrzegawczy, podnoszenie zostaje zablokowane.' },
  ];

  const filteredFAQItems = useMemo(() => {
    if (!searchTerm.trim()) return faqItems;
    
    return faqItems.filter(item => 
      item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, faqItems]);

  const getMetaContent = () => {
    switch (language) {
      case 'de':
        return {
          title: 'FAQ Gabelstapler – häufige Fragen | Stakerpol',
          description: 'Komplette FAQ zu Toyota BT Gabelstaplern: Betrieb, Service, UDT, Batterie, Lieferung. Antworten auf 35 häufigste Fragen.',
          ogTitle: 'FAQ Gabelstapler – Stakerpol',
          ogDescription: 'Antworten auf die häufigsten Fragen zu Toyota BT Gabelstaplern: Nutzung, Service, UDT, Batterie, Lieferung.'
        };
      case 'en':
        return {
          title: 'FAQ forklifts – frequently asked questions | Stakerpol',
          description: 'Complete FAQ about Toyota BT forklifts: operation, service, UDT, battery, delivery. Answers to 35 most frequent questions.',
          ogTitle: 'FAQ forklifts – Stakerpol',
          ogDescription: 'Answers to the most frequent questions about Toyota BT forklifts: usage, service, UDT, battery, delivery.'
        };
      case 'cs':
        return {
          title: 'FAQ vysokozdvižné vozíky – často kladené otázky | Stakerpol',
          description: 'Kompletní FAQ o vysokozdvižných vozících Toyota BT: provoz, servis, UDT, baterie, dodávka. Odpovědi na 35 nejčastějších otázek.',
          ogTitle: 'FAQ vysokozdvižné vozíky – Stakerpol',
          ogDescription: 'Odpovědi na nejčastější otázky o vysokozdvižných vozících Toyota BT: používání, servis, UDT, baterie, dodávka.'
        };
      case 'sk':
        return {
          title: 'FAQ vysokozdvižné vozíky – často kladené otázky | Stakerpol',
          description: 'Kompletné FAQ o vysokozdvižných vozíkoch Toyota BT: prevádzka, servis, UDT, batéria, dodávka. Odpovede na 35 najčastejších otázok.',
          ogTitle: 'FAQ vysokozdvižné vozíky – Stakerpol',
          ogDescription: 'Odpovede na najčastejšie otázky o vysokozdvižných vozíkoch Toyota BT: používanie, servis, UDT, batéria, dodávka.'
        };
      default:
        return {
          title: 'FAQ wózki widłowe – najczęstsze pytania | Stakerpol',
          description: 'Kompletne FAQ o wózkach widłowych Toyota BT: eksploatacja, serwis, UDT, bateria, dostawa. Odpowiedzi na 35 najczęstszych pytań.',
          ogTitle: 'FAQ wózki widłowe – Stakerpol',
          ogDescription: 'Odpowiedzi na najczęstsze pytania o wózki widłowe Toyota BT: użytkowanie, serwis, UDT, bateria, dostawa.'
        };
    }
  };

  const metaContent = getMetaContent();

  return (
    <Layout>
      <Helmet>
        <title>{metaContent.title}</title>
        <meta name="description" content={metaContent.description} />
        <link rel="canonical" href={`https://stakerpol.pl/${language}/faq`} />
        <meta property="og:title" content={metaContent.ogTitle} />
        <meta property="og:description" content={metaContent.ogDescription} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`https://stakerpol.pl/${language}/faq`} />
        <meta name="twitter:card" content="summary" />
      </Helmet>
      <main>
        <section className="section-padding bg-white" aria-labelledby="faq-page-heading">
          <div className="container-custom">
            <h1 id="faq-page-heading" className="section-title text-center">{t('faq_section_title')}</h1>
            <p className="text-center text-muted-foreground max-w-2xl mx-auto mt-2">
              {t('faq_page_description')}
            </p>
            
            <div className="mt-8 max-w-md mx-auto">
              <SearchInput
                value={searchTerm}
                onChange={setSearchTerm}
                placeholder={t('faq_search_placeholder')}
                className="w-full"
              />
            </div>
            
            <div className="mt-8">
              {filteredFAQItems.length > 0 ? (
                <FAQSection title="" items={filteredFAQItems} />
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    {t('faq_no_results').replace('{searchTerm}', searchTerm)}
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
      <FAQSchema items={faqItems} />
    </Layout>
  );
};

export default FAQ;

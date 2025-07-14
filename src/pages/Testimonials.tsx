
import Layout from '@/components/layout/Layout';
import CallToAction from '@/components/ui/CallToAction';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslation } from '@/utils/translations';
import { useEffect } from 'react';

const Testimonials = () => {
  const { language } = useLanguage();
  const t = useTranslation(language);

  const getExperienceContent = () => {
    switch (language) {
      case 'en':
        return {
          title: 'Have experience with our company?',
          description: 'Share your opinion on our Google page or contact us directly.',
          buttonText: 'Add Google review'
        };
      case 'cs':
        return {
          title: 'Máte zkušenosti s naší společností?',
          description: 'Sdílejte svůj názor na naší stránce Google nebo nás kontaktujte přímo.',
          buttonText: 'Přidat hodnocení na Google'
        };
      case 'sk':
        return {
          title: 'Máte skúsenosti s našou spoločnosťou?',
          description: 'Zdieľajte svoj názor na našej stránke Google alebo nás kontaktujte priamo.',
          buttonText: 'Pridať hodnotenie na Google'
        };
      case 'de':
        return {
          title: 'Haben Sie Erfahrungen mit unserem Unternehmen?',
          description: 'Teilen Sie Ihre Meinung auf unserer Google-Seite oder kontaktieren Sie uns direkt.',
          buttonText: 'Google-Bewertung hinzufügen'
        };
      default:
        return {
          title: 'Masz doświadczenie z naszą firmą?',
          description: 'Podziel się swoją opinią na naszej stronie Google lub skontaktuj się z nami bezpośrednio.',
          buttonText: 'Dodaj opinię na Google'
        };
    }
  };

  const experienceContent = getExperienceContent();

  // Load Elfsight script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://static.elfsight.com/platform/platform.js';
    script.async = true;
    document.head.appendChild(script);

    return () => {
      // Cleanup script on component unmount
      const existingScript = document.querySelector('script[src="https://static.elfsight.com/platform/platform.js"]');
      if (existingScript) {
        document.head.removeChild(existingScript);
      }
    };
  }, []);

  return (
    <Layout>
      <section className="bg-gradient-to-b from-gray-100 to-white py-12 md:py-20">
        <div className="container-custom">
          <h1 className="text-4xl font-bold mb-6 text-center animate-fade-in">{t('customerOpinions')}</h1>
          <p className="text-xl text-center text-muted-foreground max-w-3xl mx-auto mb-12 animate-fade-in delay-100">
            {t('testimonialsPageDescription')}
          </p>
          
          {/* Google Reviews Widget */}
          <div className="mb-16 animate-fade-in delay-200">
            <div className="elfsight-app-79b664bd-146f-4c14-95e6-8e8fc072c9f3" data-elfsight-app-lazy></div>
          </div>
          
          <div className="mt-16 bg-white p-8 rounded-lg shadow text-center animate-fade-in">
            <h3 className="text-2xl font-bold mb-4">{experienceContent.title}</h3>
            <p className="text-lg mb-6">
              {experienceContent.description}
            </p>
            <a 
              href="https://g.co/kgs/tR5khFz" 
              target="_blank" 
              rel="noopener noreferrer"
              className="cta-button inline-block"
            >
              {experienceContent.buttonText}
            </a>
          </div>
        </div>
      </section>
      
      <CallToAction />
    </Layout>
  );
};

export default Testimonials;


import Layout from '@/components/layout/Layout';
import ProductCard from '@/components/ui/ProductCard';
import CallToAction from '@/components/ui/CallToAction';
import ProductsEmptyState from '@/components/ui/ProductsEmptyState';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslation } from '@/utils/translations';
import { usePublicSupabaseProducts } from '@/hooks/usePublicSupabaseProducts';
import { Link } from 'react-router-dom';
import { Shield, Loader2 } from 'lucide-react';
import FAQSection from '@/components/ui/FAQSection';
import FAQSchema from '@/components/seo/FAQSchema';

const Products = () => {
  const { language } = useLanguage();
  const t = useTranslation(language);
  const { products, isLoading } = usePublicSupabaseProducts();

  const getPageDescription = () => {
    switch (language) {
      case 'en':
        return 'We offer a wide selection of BT Toyota forklifts, perfectly adapted to various applications and needs.';
      case 'cs':
        return 'Nabízíme široký výběr vysokozdvižných vozíků BT Toyota, ideálně přizpůsobených různým aplikacím a potřebám.';
      case 'sk':
        return 'Ponúkame široký výber vysokozdvižných vozíkov BT Toyota, ideálne prispôsobených rôznym aplikáciám a potrebám.';
      case 'de':
        return 'Wir bieten eine große Auswahl an BT Toyota Gabelstaplern, perfekt angepasst an verschiedene Anwendungen und Bedürfnisse.';
      default:
        return 'Oferujemy szeroki wybór wózków widłowych BT Toyota, idealnie dopasowanych do różnych zastosowań i potrzeb.';
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-stakerpol-orange mx-auto mb-4" />
            <p className="text-muted-foreground">Ładowanie produktów...</p>
          </div>
        </div>
      );
    }

    if (products.length === 0) {
      return <ProductsEmptyState />;
    }

    return (
      <div className="product-grid-desktop">
        {products.map((product, index) => (
          <div key={product.id} className="animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    );
  };

  const categoryFaqItems = [
    {
      question: 'W jakich warunkach najlepiej sprawdzą się wózki BT SWE?',
      answer: 'Najlepiej wewnątrz i na równych powierzchniach; świetnie nadają się do prac magazynowych, załadunku i rozładunku.',
    },
    {
      question: 'Jak dobrać długość wideł do europalet?',
      answer: 'Standardowa długość 1150 mm pasuje do większości europalet. Dłuższe widły stosuje się do niestandardowych ładunków.',
    },
    {
      question: 'Czy zapewniacie transport zakupionych wózków?',
      answer: 'Tak, organizujemy bezpieczny transport na terenie kraju. Koszt zależy od odległości i parametrów wózka.',
    },
    {
      question: 'Jak bezpiecznie ładować baterię wózka?',
      answer: 'Zaparkować, wyłączyć wózek, zapewnić wentylację i używać dedykowanego prostownika oraz środków ochrony.',
    },
  ];
  return (
    <Layout>
      <section className="bg-gradient-to-b from-stakerpol-lightgray to-white py-12">
        <div className="container-custom">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-4xl font-bold text-center animate-fade-in text-stakerpol-navy">{t('electricTrolleys')}</h1>
            <Link 
              to="/admin" 
              className="flex items-center text-muted-foreground hover:text-stakerpol-orange transition-colors"
              title="Panel administracyjny"
            >
              <Shield size={20} />
            </Link>
          </div>
          
          <p className="text-xl text-center text-muted-foreground max-w-3xl mx-auto mb-12 animate-fade-in">
            {getPageDescription()}
          </p>
          
          {renderContent()}
        </div>
      </section>
      <FAQSection title="FAQ – wózki magazynowe" items={categoryFaqItems} />
      <FAQSchema items={categoryFaqItems} />
      
      <CallToAction />
    </Layout>
  );
};

export default Products;

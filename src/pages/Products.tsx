
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
import { Helmet } from 'react-helmet-async';
import ProductFilter from '@/components/products/ProductFilter';
import React, { useState, useMemo } from 'react';
import { useDynamicTranslations } from '@/hooks/useDynamicTranslations';
import { Product } from '@/types';
const Products = () => {
  const { language } = useLanguage();
  const t = useTranslation(language);
  const { products, isLoading } = usePublicSupabaseProducts();
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  
  // Update filtered products when products load
  React.useEffect(() => {
    setFilteredProducts(products);
  }, [products]);

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

    const displayProducts = filteredProducts.length > 0 ? filteredProducts : products;

    return (
      <div className="product-grid-desktop">
        {displayProducts.map((product, index) => (
          <div key={product.id} className="animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    );
  };

  // Use dynamic translations with fallback to static data
  const { getAllFAQItems, hasTranslations } = useDynamicTranslations();
  
  const categoryFaqItems = useMemo(() => {
    if (hasTranslations) {
      const dynamicItems = getAllFAQItems(language);
      // Filter for product-relevant FAQ items
      const productRelevantItems = dynamicItems.filter(item => 
        item.question.toLowerCase().includes('bt swe') ||
        item.question.toLowerCase().includes('widł') ||
        item.question.toLowerCase().includes('transport') ||
        item.question.toLowerCase().includes('bater')
      ).slice(0, 4);
      
      if (productRelevantItems.length > 0) {
        return productRelevantItems;
      }
    }
    
    // Fallback to static data
    return [
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
  }, [language, hasTranslations, getAllFAQItems]);
  return (
    <Layout>
      <Helmet>
        <title>Wózki widłowe BT Toyota – oferta | Stakerpol</title>
        <meta name="description" content={getPageDescription()} />
        <link rel="canonical" href={`https://stakerpol.pl/${language}/products`} />
        <meta property="og:title" content="Wózki widłowe BT Toyota – oferta | Stakerpol" />
        <meta property="og:description" content={getPageDescription()} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`https://stakerpol.pl/${language}/products`} />
        <meta name="twitter:card" content="summary" />
      </Helmet>
      <section className="bg-gradient-to-b from-stakerpol-lightgray to-white py-12">
        <div className="container-custom">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-4xl font-bold text-center animate-fade-in text-stakerpol-navy">{t('electricTrolleys')}</h1>
            <div className="flex items-center gap-4">
              <Link 
                to="/admin" 
                className="flex items-center text-muted-foreground hover:text-stakerpol-orange transition-colors"
                title="Panel administracyjny"
              >
                <Shield size={20} />
              </Link>
            </div>
          </div>
          
          <p className="text-xl text-center text-muted-foreground max-w-3xl mx-auto mb-8 animate-fade-in">
            {getPageDescription()}
          </p>
          
          <div className="flex justify-center mb-8">
            <ProductFilter 
              products={products} 
              onFilterChange={setFilteredProducts}
            />
          </div>
          
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

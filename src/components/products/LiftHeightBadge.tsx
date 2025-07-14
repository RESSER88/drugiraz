
import { Product } from '@/types';
import { Language } from '@/contexts/LanguageContext';
import { useTranslation } from '@/utils/translations';

interface LiftHeightBadgeProps {
  product: Product;
  language: Language;
}

const LiftHeightBadge = ({ product, language }: LiftHeightBadgeProps) => {
  const t = useTranslation(language);
  
  // Only render if liftHeight exists and is not empty
  if (!product.specs.liftHeight || product.specs.liftHeight.trim() === '') {
    return null;
  }

  // Format value with mm unit
  const formatValueWithUnit = (value: string): string => {
    return `${value.trim()} mm`;
  };

  return (
    <div className="absolute bottom-2 left-2 z-10 animate-fade-in">
      <div className="bg-stakerpol-navy text-white px-2 py-1 md:px-2 md:py-1 rounded-md shadow-md text-xs md:text-sm font-medium hover:bg-stakerpol-navy/90 transition-all duration-200">
        <div className="flex items-center gap-1.5">
          <span className="opacity-90">{t('liftHeight')}:</span>
          <span className="font-semibold">{formatValueWithUnit(product.specs.liftHeight)}</span>
        </div>
      </div>
    </div>
  );
};

export default LiftHeightBadge;

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Filter } from 'lucide-react';
import FilterModal from './FilterModal';
import { Product } from '@/types';
import { useTranslation } from '@/utils/translations';
import { Language } from '@/contexts/LanguageContext';

interface ProductFilterProps {
  products: Product[];
  onFilterChange: (filteredProducts: Product[]) => void;
  language: Language;
}

const ProductFilter = ({ products, onFilterChange, language }: ProductFilterProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const t = useTranslation(language);

  return (
    <>
      <Button
        onClick={() => setIsModalOpen(true)}
        variant="outline"
        className="flex items-center gap-2 hover:bg-primary hover:text-primary-foreground transition-colors"
      >
        <Filter className="h-4 w-4" />
        {t('filterProducts')}
      </Button>
      
      <FilterModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        products={products}
        onApplyFilters={onFilterChange}
        language={language}
      />
    </>
  );
};

export default ProductFilter;
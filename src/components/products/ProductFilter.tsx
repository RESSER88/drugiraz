import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Filter } from 'lucide-react';
import FilterModal from './FilterModal';
import { Product } from '@/types';

interface ProductFilterProps {
  products: Product[];
  onFilterChange: (filteredProducts: Product[]) => void;
}

const ProductFilter = ({ products, onFilterChange }: ProductFilterProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <Button
        onClick={() => setIsModalOpen(true)}
        variant="outline"
        className="flex items-center gap-2 hover:bg-primary hover:text-primary-foreground transition-colors"
      >
        <Filter className="h-4 w-4" />
        Filtruj produkty
      </Button>
      
      <FilterModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        products={products}
        onApplyFilters={onFilterChange}
      />
    </>
  );
};

export default ProductFilter;
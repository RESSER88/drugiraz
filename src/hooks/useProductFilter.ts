import { useState, useMemo } from 'react';
import { Product } from '@/types';

interface FilterRanges {
  year: { min: number; max: number };
  hours: { min: number; max: number };
  height: { min: number; max: number };
}

interface FilterValues {
  year: [number, number];
  hours: [number, number];
  height: [number, number];
}

export const useProductFilter = (products: Product[]) => {
  // Calculate ranges from products data
  const ranges = useMemo((): FilterRanges => {
    const years = products
      .map(p => Number(p.specs?.productionYear))
      .filter(year => year && year > 0)
      .sort((a, b) => a - b);
    
    const hours = products
      .map(p => Number(p.specs?.workingHours))
      .filter(hour => hour && hour > 0)
      .sort((a, b) => a - b);
    
    const heights = products
      .map(p => Number(p.specs?.liftHeight))
      .filter(height => height && height > 0)
      .sort((a, b) => a - b);

    return {
      year: { min: years[0] || 2012, max: years[years.length - 1] || 2019 },
      hours: { min: hours[0] || 992, max: hours[hours.length - 1] || 6668 },
      height: { min: heights[0] || 1700, max: heights[heights.length - 1] || 6000 }
    };
  }, [products]);

  const [filters, setFilters] = useState<FilterValues>({
    year: [ranges.year.min, ranges.year.max],
    hours: [ranges.hours.min, ranges.hours.max],
    height: [ranges.height.min, ranges.height.max]
  });

  const [filteredProducts, setFilteredProducts] = useState<Product[]>(products);

  const applyFilters = useMemo(() => {
    return (customFilters?: FilterValues) => {
      const activeFilters = customFilters || filters;
      
      const filtered = products.filter(product => {
        const productYear = Number(product.specs?.productionYear);
        const productHours = Number(product.specs?.workingHours);
        const productHeight = Number(product.specs?.liftHeight);

        const yearMatch = !productYear || 
          (productYear >= activeFilters.year[0] && productYear <= activeFilters.year[1]);
        
        const hoursMatch = !productHours || 
          (productHours >= activeFilters.hours[0] && productHours <= activeFilters.hours[1]);
        
        const heightMatch = !productHeight || 
          (productHeight >= activeFilters.height[0] && productHeight <= activeFilters.height[1]);

        return yearMatch && hoursMatch && heightMatch;
      });

      setFilteredProducts(filtered);
      return filtered;
    };
  }, [products, filters]);

  const resetFilters = () => {
    setFilters({
      year: [ranges.year.min, ranges.year.max],
      hours: [ranges.hours.min, ranges.hours.max],
      height: [ranges.height.min, ranges.height.max]
    });
    setFilteredProducts(products);
  };

  return {
    filters,
    setFilters,
    filteredProducts,
    ranges,
    applyFilters,
    resetFilters
  };
};
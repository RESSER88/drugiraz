import React, { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Product } from '@/types';

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onApplyFilters: (filteredProducts: Product[]) => void;
}

const FilterModal = ({ isOpen, onClose, products, onApplyFilters }: FilterModalProps) => {
  // Calculate ranges from products data
  const ranges = useMemo(() => {
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

  const [filters, setFilters] = useState({
    year: [ranges.year.min, ranges.year.max],
    hours: [ranges.hours.min, ranges.hours.max],
    height: [ranges.height.min, ranges.height.max]
  });

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const productYear = Number(product.specs?.productionYear);
      const productHours = Number(product.specs?.workingHours);
      const productHeight = Number(product.specs?.liftHeight);

      const yearMatch = !productYear || 
        (productYear >= filters.year[0] && productYear <= filters.year[1]);
      
      const hoursMatch = !productHours || 
        (productHours >= filters.hours[0] && productHours <= filters.hours[1]);
      
      const heightMatch = !productHeight || 
        (productHeight >= filters.height[0] && productHeight <= filters.height[1]);

      return yearMatch && hoursMatch && heightMatch;
    });
  }, [products, filters]);

  const handleApplyFilters = () => {
    onApplyFilters(filteredProducts);
    onClose();
  };

  const handleReset = () => {
    setFilters({
      year: [ranges.year.min, ranges.year.max],
      hours: [ranges.hours.min, ranges.hours.max],
      height: [ranges.height.min, ranges.height.max]
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Filtruj produkty</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Production Year Filter */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">
              Rok produkcji: {filters.year[0]} - {filters.year[1]}
            </Label>
            <Slider
              value={filters.year}
              onValueChange={(value) => setFilters(prev => ({ ...prev, year: value }))}
              min={ranges.year.min}
              max={ranges.year.max}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{ranges.year.min}</span>
              <span>{ranges.year.max}</span>
            </div>
          </div>

          {/* Working Hours Filter */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">
              Motogodziny: {filters.hours[0]} - {filters.hours[1]} mh
            </Label>
            <Slider
              value={filters.hours}
              onValueChange={(value) => setFilters(prev => ({ ...prev, hours: value }))}
              min={ranges.hours.min}
              max={ranges.hours.max}
              step={100}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{ranges.hours.min} mh</span>
              <span>{ranges.hours.max} mh</span>
            </div>
          </div>

          {/* Lift Height Filter */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">
              Wysokość podnoszenia: {filters.height[0]} - {filters.height[1]} mm
            </Label>
            <Slider
              value={filters.height}
              onValueChange={(value) => setFilters(prev => ({ ...prev, height: value }))}
              min={ranges.height.min}
              max={ranges.height.max}
              step={100}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{ranges.height.min} mm</span>
              <span>{ranges.height.max} mm</span>
            </div>
          </div>

          {/* Results Preview */}
          <div className="p-3 bg-muted rounded-md">
            <p className="text-sm font-medium">
              Znalezione produkty: <span className="text-primary">{filteredProducts.length}</span>
            </p>
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={handleReset}>
            Resetuj
          </Button>
          <Button onClick={handleApplyFilters}>
            Zastosuj filtry
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FilterModal;
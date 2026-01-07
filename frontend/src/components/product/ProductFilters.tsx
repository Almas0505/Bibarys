/**
 * Product Filters Component
 */

import { useState } from 'react';
import { ProductCategory } from '../../types';
import { PRODUCT_CATEGORIES } from '../../utils/constants';
import Checkbox from '../common/Checkbox';
import Button from '../common/Button';

export interface ProductFiltersState {
  categories: ProductCategory[];
  minPrice: string;
  maxPrice: string;
  minRating: number;
  inStock: boolean;
}

interface ProductFiltersProps {
  filters: ProductFiltersState;
  onFiltersChange: (filters: ProductFiltersState) => void;
}

export default function ProductFilters({ filters, onFiltersChange }: ProductFiltersProps) {
  const [localFilters, setLocalFilters] = useState<ProductFiltersState>(filters);

  const handleCategoryToggle = (category: ProductCategory) => {
    const categories = localFilters.categories.includes(category)
      ? localFilters.categories.filter(c => c !== category)
      : [...localFilters.categories, category];
    
    setLocalFilters({ ...localFilters, categories });
  };

  const handleApply = () => {
    onFiltersChange(localFilters);
  };

  const handleReset = () => {
    const resetFilters: ProductFiltersState = {
      categories: [],
      minPrice: '',
      maxPrice: '',
      minRating: 0,
      inStock: false,
    };
    setLocalFilters(resetFilters);
    onFiltersChange(resetFilters);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold mb-6">Фильтры</h2>

      {/* Categories */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Категории</h3>
        <div className="space-y-2">
          {PRODUCT_CATEGORIES.map((cat) => (
            <Checkbox
              key={cat.value}
              id={`category-${cat.value}`}
              label={cat.label}
              checked={localFilters.categories.includes(cat.value as ProductCategory)}
              onChange={() => handleCategoryToggle(cat.value as ProductCategory)}
            />
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Диапазон цен</h3>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            value={localFilters.minPrice}
            onChange={(e) => setLocalFilters({ ...localFilters, minPrice: e.target.value })}
            placeholder="От"
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
          />
          <input
            type="number"
            value={localFilters.maxPrice}
            onChange={(e) => setLocalFilters({ ...localFilters, maxPrice: e.target.value })}
            placeholder="До"
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      {/* Rating */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Рейтинг</h3>
        <div className="space-y-2">
          {[4, 3, 2, 1].map((rating) => (
            <button
              key={rating}
              onClick={() => setLocalFilters({ ...localFilters, minRating: rating })}
              className={`flex items-center w-full px-3 py-2 rounded-lg transition-colors ${
                localFilters.minRating === rating
                  ? 'bg-primary-50 text-primary-700'
                  : 'hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className={i < rating ? '' : 'opacity-30'}>★</span>
                ))}
              </div>
              <span className="ml-2 text-sm text-gray-600">и выше</span>
            </button>
          ))}
        </div>
      </div>

      {/* Availability */}
      <div className="mb-6">
        <Checkbox
          id="in-stock"
          label="Только в наличии"
          checked={localFilters.inStock}
          onChange={(e) => setLocalFilters({ ...localFilters, inStock: e.target.checked })}
        />
      </div>

      {/* Buttons */}
      <div className="space-y-2">
        <Button
          variant="primary"
          fullWidth
          onClick={handleApply}
        >
          Применить
        </Button>
        <Button
          variant="outline"
          fullWidth
          onClick={handleReset}
        >
          Сбросить
        </Button>
      </div>
    </div>
  );
}

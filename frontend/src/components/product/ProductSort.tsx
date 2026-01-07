/**
 * Product Sort Component
 */

import Select from '../common/Select';

export type SortOption = 
  | 'price_asc' 
  | 'price_desc' 
  | 'rating_desc' 
  | 'newest' 
  | 'popular';

interface ProductSortProps {
  value: SortOption;
  onChange: (value: SortOption) => void;
}

export default function ProductSort({ value, onChange }: ProductSortProps) {
  return (
    <Select
      value={value}
      onChange={(e) => onChange(e.target.value as SortOption)}
      className="min-w-[200px]"
      aria-label="Сортировка товаров"
    >
      <option value="newest">Сначала новые</option>
      <option value="popular">По популярности</option>
      <option value="price_asc">Цена: по возрастанию</option>
      <option value="price_desc">Цена: по убыванию</option>
      <option value="rating_desc">По рейтингу</option>
    </Select>
  );
}

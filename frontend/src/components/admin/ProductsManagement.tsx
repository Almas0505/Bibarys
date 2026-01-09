import { useState } from 'react';
import Input from '../common/Input';
import Select from '../common/Select';
import Badge from '../common/Badge';

export default function ProductsManagement() {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Mock data - in real app, fetch from API
  const products = [
    { id: 1, name: 'Laptop Pro 15', category: 'electronics', price: 89990, stock: 15, isActive: true },
    { id: 2, name: 'Gaming Mouse', category: 'electronics', price: 3990, stock: 45, isActive: true },
    { id: 3, name: 'Cotton T-Shirt', category: 'clothing', price: 1290, stock: 100, isActive: true },
    { id: 4, name: 'Programming Book', category: 'books', price: 2490, stock: 0, isActive: false },
  ];

  const categories = [
    { value: 'all', label: 'Все категории' },
    { value: 'electronics', label: 'Электроника' },
    { value: 'clothing', label: 'Одежда' },
    { value: 'books', label: 'Книги' },
  ];

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div>
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold">Управление товарами</h3>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Input
            type="text"
            placeholder="Поиск товаров..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Select
            options={categories}
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          />
        </div>

        {/* Products table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 px-4">ID</th>
                <th className="text-left py-2 px-4">Название</th>
                <th className="text-left py-2 px-4">Категория</th>
                <th className="text-left py-2 px-4">Цена</th>
                <th className="text-left py-2 px-4">Остаток</th>
                <th className="text-left py-2 px-4">Статус</th>
                <th className="text-left py-2 px-4">Действия</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => (
                <tr key={product.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4">{product.id}</td>
                  <td className="py-3 px-4 font-semibold">{product.name}</td>
                  <td className="py-3 px-4 text-gray-600">{product.category}</td>
                  <td className="py-3 px-4 font-bold">₽{product.price.toLocaleString()}</td>
                  <td className="py-3 px-4">
                    <Badge variant={product.stock > 0 ? 'success' : 'error'}>
                      {product.stock} шт.
                    </Badge>
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant={product.isActive ? 'success' : 'error'}>
                      {product.isActive ? 'Активен' : 'Неактивен'}
                    </Badge>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      <button className="text-blue-600 hover:underline text-sm">
                        Редактировать
                      </button>
                      <button className="text-red-600 hover:underline text-sm">
                        Удалить
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Товары не найдены
          </div>
        )}
      </div>
    </div>
  );
}

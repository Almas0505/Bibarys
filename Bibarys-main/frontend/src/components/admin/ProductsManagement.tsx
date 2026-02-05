import { useState, useEffect } from 'react';
import Input from '../common/Input';
import Select from '../common/Select';
import Badge from '../common/Badge';
import { adminService } from '../../services/admin.service';
import { formatPrice } from '../../utils/helpers';

interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  quantity: number;
  is_active: boolean;
}

export default function ProductsManagement() {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const categories = [
    { value: 'all', label: 'Все категории' },
    { value: 'dairy', label: 'Молочные продукты' },
    { value: 'bakery', label: 'Хлебобулочные изделия' },
    { value: 'beverages', label: 'Напитки' },
    { value: 'meat', label: 'Мясо и колбасы' },
    { value: 'fruits_vegetables', label: 'Овощи и фрукты' },
    { value: 'frozen', label: 'Замороженные продукты' },
    { value: 'grocery', label: 'Бакалея' },
    { value: 'sweets', label: 'Сладости и снеки' },
    { value: 'canned', label: 'Консервы' },
  ];

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminService.getAllProducts();
      setProducts(data);
    } catch (err: any) {
      console.error('Error loading products:', err);
      setError(err.response?.data?.detail || 'Ошибка загрузки товаров');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (productId: number, currentStatus: boolean) => {
    if (!confirm(`Вы уверены, что хотите ${currentStatus ? 'деактивировать' : 'активировать'} этот товар?`)) {
      return;
    }
    
    try {
      await adminService.toggleProductStatus(productId);
      await loadProducts();
      alert('Статус товара успешно изменён!');
    } catch (err: any) {
      console.error('Error toggling product status:', err);
      alert(err.response?.data?.detail || 'Ошибка при изменении статуса');
    }
  };

  const handleDeleteProduct = async (productId: number, productName: string) => {
    if (!confirm(`Вы уверены, что хотите удалить товар "${productName}"?\nЭто действие нельзя отменить!`)) {
      return;
    }
    
    try {
      await adminService.deleteProduct(productId);
      await loadProducts();
      alert('Товар успешно удалён!');
    } catch (err: any) {
      console.error('Error deleting product:', err);
      alert(err.response?.data?.detail || 'Ошибка при удалении товара');
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center py-8 text-gray-500">Загрузка...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
          {error}
        </div>
      </div>
    );
  }

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
                  <td className="py-3 px-4 font-bold">{formatPrice(product.price)}</td>
                  <td className="py-3 px-4">
                    <Badge variant={product.quantity > 0 ? 'success' : 'error'}>
                      {product.quantity} шт.
                    </Badge>
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant={product.is_active ? 'success' : 'error'}>
                      {product.is_active ? 'Активен' : 'Неактивен'}
                    </Badge>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleToggleStatus(product.id, product.is_active)}
                        className="text-orange-600 hover:text-orange-800 hover:underline text-sm"
                      >
                        {product.is_active ? 'Деактивировать' : 'Активировать'}
                      </button>
                      <button 
                        onClick={() => handleDeleteProduct(product.id, product.name)}
                        className="text-red-600 hover:text-red-800 hover:underline text-sm"
                      >
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

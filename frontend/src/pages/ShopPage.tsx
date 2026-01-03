/**
 * Shop Page - Product Listing with Filters
 */

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { fetchProducts, setFilters } from '../store/productSlice';
import { addToCart } from '../store/cartSlice';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { formatPrice } from '../utils/helpers';
import { PLACEHOLDER_IMAGE, PRODUCT_CATEGORIES } from '../utils/constants';
import { ProductCategory } from '../types';

export default function ShopPage() {
  const dispatch = useAppDispatch();
  const { products, pagination, filters, isLoading } = useAppSelector((state) => state.product);
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  const [localFilters, setLocalFilters] = useState({
    category: filters.category || '',
    search: filters.search || '',
    min_price: filters.min_price || '',
    max_price: filters.max_price || '',
    sort_by: filters.sort_by || 'created_at',
    sort_order: filters.sort_order || 'desc',
  });

  useEffect(() => {
    dispatch(
      fetchProducts({
        filters: {
          ...filters,
          category: localFilters.category ? (localFilters.category as ProductCategory) : undefined,
          min_price: localFilters.min_price ? Number(localFilters.min_price) : undefined,
          max_price: localFilters.max_price ? Number(localFilters.max_price) : undefined,
        },
        pagination: { page: pagination.page, page_size: 20 },
      })
    );
  }, [dispatch, filters, pagination.page]);

  const handleFilterChange = () => {
    dispatch(
      setFilters({
        category: localFilters.category || undefined,
        search: localFilters.search || undefined,
        min_price: localFilters.min_price ? Number(localFilters.min_price) : undefined,
        max_price: localFilters.max_price ? Number(localFilters.max_price) : undefined,
        sort_by: localFilters.sort_by,
        sort_order: localFilters.sort_order as 'asc' | 'desc',
      })
    );
  };

  const handleAddToCart = async (productId: number) => {
    if (!isAuthenticated) {
      alert('Пожалуйста, войдите в систему');
      return;
    }
    await dispatch(addToCart({ product_id: productId, quantity: 1 }));
  };

  const handlePageChange = (newPage: number) => {
    dispatch(
      fetchProducts({
        filters,
        pagination: { page: newPage, page_size: 20 },
      })
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Каталог товаров</h1>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filters Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
            <h2 className="text-xl font-bold mb-4">Фильтры</h2>

            {/* Search */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Поиск</label>
              <input
                type="text"
                value={localFilters.search}
                onChange={(e) => setLocalFilters({ ...localFilters, search: e.target.value })}
                placeholder="Название товара..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>

            {/* Category */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Категория</label>
              <select
                aria-label="Выберите категорию"
                value={localFilters.category}
                onChange={(e) => setLocalFilters({ ...localFilters, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="">Все категории</option>
                {PRODUCT_CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Price Range */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Цена</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  value={localFilters.min_price}
                  onChange={(e) => setLocalFilters({ ...localFilters, min_price: e.target.value })}
                  placeholder="От"
                  className="px-3 py-2 border border-gray-300 rounded-lg"
                />
                <input
                  type="number"
                  value={localFilters.max_price}
                  onChange={(e) => setLocalFilters({ ...localFilters, max_price: e.target.value })}
                  placeholder="До"
                  className="px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>

            {/* Sort */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Сортировка</label>
              <select
                aria-label="Выберите сортировку"
                value={`${localFilters.sort_by}_${localFilters.sort_order}`}
                onChange={(e) => {
                  const [sort_by, sort_order] = e.target.value.split('_');
                  setLocalFilters({ ...localFilters, sort_by, sort_order: sort_order as 'asc' | 'desc' });
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="created_at_desc">Сначала новые</option>
                <option value="price_asc">Дешевле</option>
                <option value="price_desc">Дороже</option>
                <option value="rating_desc">По рейтингу</option>
              </select>
            </div>

            <button
              onClick={handleFilterChange}
              className="w-full bg-primary-600 text-white py-2 rounded-lg hover:bg-primary-700"
            >
              Применить
            </button>
          </div>
        </div>

        {/* Products Grid */}
        <div className="lg:col-span-3">
          {isLoading ? (
            <LoadingSpinner text="Загрузка товаров..." />
          ) : products.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">Товары не найдены</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product: any) => (
                  <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                    <Link to={`/product/${product.id}`}>
                      <div className="aspect-square overflow-hidden">
                        <img
                          src={product.image_urls[0] || PLACEHOLDER_IMAGE}
                          alt={product.name}
                          className="w-full h-full object-cover hover:scale-110 transition-transform"
                        />
                      </div>
                    </Link>
                    <div className="p-4">
                      <Link to={`/product/${product.id}`}>
                        <h3 className="font-semibold text-lg mb-2 line-clamp-2 hover:text-primary-600">
                          {product.name}
                        </h3>
                      </Link>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-2xl font-bold text-primary-600">
                          {formatPrice(product.price)}
                        </span>
                        <div className="flex items-center text-sm text-gray-600">
                          <span className="text-yellow-400 mr-1">★</span>
                          {product.rating.toFixed(1)}
                        </div>
                      </div>
                      <button
                        onClick={() => handleAddToCart(product.id)}
                        className="w-full bg-primary-600 text-white py-2 rounded-lg hover:bg-primary-700"
                      >
                        В корзину
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {pagination.total_pages > 1 && (
                <div className="flex items-center justify-center space-x-2 mt-8">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50"
                  >
                    Назад
                  </button>
                  <span className="text-gray-600">
                    Страница {pagination.page} из {pagination.total_pages}
                  </span>
                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.total_pages}
                    className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50"
                  >
                    Вперёд
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

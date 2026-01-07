/**
 * Seller Page - Seller Dashboard and Product Management
 */

import { useEffect, useState } from 'react';
import { useAppSelector } from '../hooks/redux';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ProductForm from '../components/seller/ProductForm';
import { formatPrice } from '../utils/helpers';
import { PLACEHOLDER_IMAGE, PRODUCT_CATEGORIES } from '../utils/constants';
import api from '../services/api';

export default function SellerPage() {
  const { products, isLoading } = useAppSelector((state) => state.product);
  const { user } = useAppSelector((state) => state.auth);

  const [showAddModal, setShowAddModal] = useState(false);
  const [editProduct, setEditProduct] = useState<any>(null);

  // Fetch seller's products
  useEffect(() => {
    if (user?.id) {
      loadSellerProducts();
    }
  }, [user?.id]);

  const loadSellerProducts = async () => {
    try {
      // const response = await api.get('/api/v1/seller/my-products');
      // Dispatch to store if needed
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  const handleAddProduct = async (formData: FormData) => {
    try {
      const data = Object.fromEntries(formData.entries());
      await api.post('/api/v1/products', {
        ...data,
        price: Number(data.price),
        quantity: Number(data.quantity),
        image_urls: JSON.parse(data.image_urls as string),
      });
      setShowAddModal(false);
      loadSellerProducts();
      alert('Товар успешно добавлен!');
    } catch (error: any) {
      alert(error.response?.data?.detail || 'Ошибка при добавлении товара');
    }
  };

  const handleEditProduct = async (formData: FormData) => {
    if (!editProduct) return;
    
    try {
      const data = Object.fromEntries(formData.entries());
      await api.put(`/api/v1/products/${editProduct.id}`, {
        ...data,
        price: Number(data.price),
        quantity: Number(data.quantity),
        image_urls: JSON.parse(data.image_urls as string),
      });
      setEditProduct(null);
      loadSellerProducts();
      alert('Товар успешно обновлен!');
    } catch (error: any) {
      alert(error.response?.data?.detail || 'Ошибка при обновлении товара');
    }
  };

  const handleDeleteProduct = async (productId: number) => {
    if (!confirm('Вы уверены, что хотите удалить этот товар?')) {
      return;
    }

    try {
      await api.delete(`/api/v1/products/${productId}`);
      loadSellerProducts();
      alert('Товар успешно удален!');
    } catch (error: any) {
      alert(error.response?.data?.detail || 'Ошибка при удалении товара');
    }
  };

  const handleToggleActive = async (productId: number, isActive: boolean) => {
    try {
      await api.patch(`/api/v1/products/${productId}/toggle-active`, {
        is_active: !isActive,
      });
      loadSellerProducts();
    } catch (error) {
      alert('Ошибка при изменении статуса товара');
    }
  };

  if (isLoading) {
    return <LoadingSpinner text="Загрузка панели продавца..." />;
  }

  const sellerProducts = products.filter((p: any) => p.seller_id === user?.id);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Панель продавца</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-semibold flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Добавить товар
        </button>
      </div>

      {/* Dashboard Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Мои товары</p>
              <p className="text-3xl font-bold">{sellerProducts.length}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
          </div>
          <p className="text-gray-600 text-sm mt-2">
            {sellerProducts.filter((p: any) => p.is_active).length} активных
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">В наличии</p>
              <p className="text-3xl font-bold">
                {sellerProducts.reduce((sum: number, p: any) => sum + p.quantity, 0)}
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>
          <p className="text-gray-600 text-sm mt-2">Общее количество</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Просмотры</p>
              <p className="text-3xl font-bold">
                {sellerProducts.reduce((sum: number, p: any) => sum + p.view_count, 0)}
              </p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
          </div>
          <p className="text-gray-600 text-sm mt-2">Всего просмотров</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Отзывы</p>
              <p className="text-3xl font-bold">
                {sellerProducts.reduce((sum: number, p: any) => sum + p.review_count, 0)}
              </p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-full">
              <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </div>
          </div>
          <p className="text-gray-600 text-sm mt-2">
            ⭐ {sellerProducts.length > 0 
              ? (sellerProducts.reduce((sum: number, p: any) => sum + p.rating, 0) / sellerProducts.length).toFixed(1)
              : '0.0'}
          </p>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-bold">Мои товары</h2>
        </div>

        {sellerProducts.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">У вас пока нет товаров</h3>
            <p className="text-gray-600 mb-6">Добавьте ваш первый товар, чтобы начать продажи</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-semibold"
            >
              Добавить первый товар
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Товар</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Категория</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Цена</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Кол-во</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Рейтинг</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Статус</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Действия</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sellerProducts.map((product: any) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <img
                          src={product.image_urls[0] || PLACEHOLDER_IMAGE}
                          alt={product.name}
                          className="w-12 h-12 rounded object-cover"
                        />
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{product.name}</div>
                          <div className="text-sm text-gray-500">{product.view_count} просмотров</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-600">
                        {PRODUCT_CATEGORIES.find(c => c.value === product.category)?.label || product.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{formatPrice(product.price)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-sm ${product.quantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {product.quantity}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm">
                        <span className="text-yellow-400 mr-1">★</span>
                        <span>{product.rating.toFixed(1)}</span>
                        <span className="text-gray-500 ml-1">({product.review_count})</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleToggleActive(product.id, product.is_active)}
                        className={`px-3 py-1 text-xs rounded-full font-semibold ${
                          product.is_active
                            ? 'bg-green-100 text-green-800 hover:bg-green-200'
                            : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                        }`}
                      >
                        {product.is_active ? 'Активен' : 'Неактивен'}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex gap-2">
                        <button
                          onClick={() => setEditProduct(product)}
                          className="text-blue-600 hover:text-blue-800"
                          title="Редактировать"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product.id)}
                          className="text-red-600 hover:text-red-800"
                          title="Удалить"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-2xl font-bold">Добавить товар</h2>
            </div>
            <div className="p-6">
              <ProductForm
                onSubmit={handleAddProduct}
                onCancel={() => setShowAddModal(false)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {editProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-2xl font-bold">Редактировать товар</h2>
            </div>
            <div className="p-6">
              <ProductForm
                product={editProduct}
                onSubmit={handleEditProduct}
                onCancel={() => setEditProduct(null)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


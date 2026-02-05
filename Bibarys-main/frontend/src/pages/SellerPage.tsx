/**
 * Seller Page - Seller Dashboard and Product Management
 */

import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { fetchProducts } from '../store/productSlice';
import { updateBalance } from '../store/authSlice';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ProductForm from '../components/seller/ProductForm';
import { formatPrice, getImageUrl } from '../utils/helpers';
import { PLACEHOLDER_IMAGE, PRODUCT_CATEGORIES_MAP } from '../utils/constants';
import api from '../services/api';

interface TopCustomer {
  user_id: number;
  name: string;
  email: string;
  orders_count: number;
  total_spent: number;
}

export default function SellerPage() {
  const dispatch = useAppDispatch();
  const { products, isLoading } = useAppSelector((state) => state.product);
  const { user } = useAppSelector((state) => state.auth);

  const [showAddModal, setShowAddModal] = useState(false);
  const [editProduct, setEditProduct] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'products' | 'customers' | 'orders'>('products');
  const [topCustomers, setTopCustomers] = useState<TopCustomer[]>([]);
  const [loadingCustomers, setLoadingCustomers] = useState(false);  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [exportingPDF, setExportingPDF] = useState(false);  const [stats, setStats] = useState({
    totalProducts: 0,
    activeProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
  });

  // Fetch seller's products and balance
  useEffect(() => {
    if (user?.id) {
      dispatch(fetchProducts({})); // Load all products, filter on frontend
      loadSellerStats();
      loadSellerBalance(); // Load actual balance
      if (activeTab === 'customers') {
        loadTopCustomers();
      } else if (activeTab === 'orders') {
        loadSellerOrders();
      }
    }
  }, [user?.id, activeTab, dispatch]);

  const loadSellerBalance = async () => {
    try {
      // Only load balance for sellers
      if (user?.role !== 'seller') {
        return;
      }
      const response = await api.get('/wallet/balance');
      const balance = response.data.balance || 0;
      dispatch(updateBalance(balance));
    } catch (error) {
      console.error('Error loading balance:', error);
    }
  };

  const loadSellerStats = async () => {
    try {
      const response = await api.get('/seller/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const loadTopCustomers = async () => {
    try {
      setLoadingCustomers(true);
      const response = await api.get('/seller/top-customers', {
        params: { limit: 10 }
      });
      setTopCustomers(response.data);
    } catch (error) {
      console.error('Error loading top customers:', error);
    } finally {
      setLoadingCustomers(false);
    }
  };

  const loadSellerOrders = async () => {
    try {
      setLoadingOrders(true);
      const response = await api.get('/seller/orders', {
        params: { page: 1, page_size: 50 }
      });
      setOrders(response.data.items || []);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleUpdateOrderStatus = async (orderId: number, newStatus: string) => {
    try {
      await api.put(`/orders/${orderId}/status`, {
        status: newStatus
      });
      
      if (newStatus === 'delivered') {
        alert('Статус заказа обновлен! Деньги начислены на ваш кошелек.');
        loadSellerBalance(); // Обновляем баланс после доставки
      } else {
        alert('Статус заказа обновлен!');
      }
      
      loadSellerOrders();
      loadSellerStats(); // Обновляем статистику
    } catch (error: any) {
      console.error('Error updating order status:', error);
      alert(error.response?.data?.detail || 'Ошибка при обновлении статуса');
    }
  };

  const handleAddProduct = async (formData: FormData) => {
    try {
      await api.post('/products', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setShowAddModal(false);
      dispatch(fetchProducts({}));
      alert('Товар успешно добавлен!');
    } catch (error: any) {
      console.error('Error adding product:', error);
      alert(error.response?.data?.detail || 'Ошибка при добавлении товара');
    }
  };

  const handleEditProduct = async (formData: FormData) => {
    if (!editProduct) return;
    
    try {
      await api.put(`/products/${editProduct.id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setEditProduct(null);
      dispatch(fetchProducts({}));
      alert('Товар успешно обновлен!');
    } catch (error: any) {
      console.error('Error updating product:', error);
      alert(error.response?.data?.detail || 'Ошибка при обновлении товара');
    }
  };

  const handleDeleteProduct = async (productId: number) => {
    if (!confirm('Вы уверены, что хотите удалить этот товар?')) {
      return;
    }

    try {
      await api.delete(`/products/${productId}`);
      dispatch(fetchProducts({}));
      alert('Товар успешно удален!');
    } catch (error: any) {
      alert(error.response?.data?.detail || 'Ошибка при удалении товара');
    }
  };

  const handleToggleActive = async (productId: number, isActive: boolean) => {
    try {
      await api.patch(`/products/${productId}/toggle-active`, {
        is_active: !isActive,
      });
      dispatch(fetchProducts({}));
    } catch (error) {
      alert('Ошибка при изменении статуса товара');
    }
  };

  const handleExportPDF = async () => {
    try {
      setExportingPDF(true);
      
      const response = await api.get('/seller/export-pdf', {
        responseType: 'blob',
      });
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.download = `seller_report_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      alert('PDF успешно экспортирован!');
    } catch (error: any) {
      console.error('Error exporting PDF:', error);
      alert(error.response?.data?.detail || 'Ошибка при экспорте PDF');
    } finally {
      setExportingPDF(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner text="Загрузка панели продавца..." />;
  }

  const sellerProducts = products.filter(p => p.seller_id === user?.id);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Welcome Header with Balance */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-lg shadow-lg p-6 mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-2">👋 Привет, {user?.first_name}!</h1>
            <p className="text-primary-100">Панель управления продавца</p>
          </div>
          <div className="text-right flex items-center gap-4">
            <div>
              <p className="text-sm text-primary-100">Ваш баланс</p>
              <p className="text-4xl font-bold">{user?.balance ? `${user.balance.toLocaleString()}₸` : '0₸'}</p>
            </div>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => setShowAddModal(true)}
                className="px-6 py-2 bg-white text-primary-600 rounded-lg hover:bg-primary-50 font-semibold flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Добавить товар
              </button>
              <button
                onClick={handleExportPDF}
                disabled={exportingPDF}
                className="px-6 py-2 bg-white text-primary-600 rounded-lg hover:bg-primary-50 font-semibold flex items-center gap-2 disabled:opacity-50"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                {exportingPDF ? 'Экспорт...' : 'Экспорт в PDF'}
              </button>
            </div>
          </div>
        </div>
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
            {sellerProducts.filter(p => p.is_active).length} активных
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">В наличии</p>
              <p className="text-3xl font-bold">
                {sellerProducts.reduce((sum, p) => sum + p.quantity, 0)}
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
                {sellerProducts.reduce((sum, p) => sum + p.view_count, 0)}
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
                {sellerProducts.reduce((sum, p) => sum + p.review_count, 0)}
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
              ? (sellerProducts.reduce((sum, p) => sum + p.rating, 0) / sellerProducts.length).toFixed(1)
              : '0.0'}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b mb-8">
        <nav className="flex gap-8">
          <button
            onClick={() => setActiveTab('products')}
            className={`pb-4 px-2 font-semibold ${
              activeTab === 'products'
                ? 'border-b-2 border-primary-600 text-primary-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Мои товары
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`pb-4 px-2 font-semibold ${
              activeTab === 'orders'
                ? 'border-b-2 border-primary-600 text-primary-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Заказы
          </button>
          <button
            onClick={() => setActiveTab('customers')}
            className={`pb-4 px-2 font-semibold ${
              activeTab === 'customers'
                ? 'border-b-2 border-primary-600 text-primary-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Лучшие клиенты
          </button>
        </nav>
      </div>

      {/* Orders Tab */}
      {activeTab === 'orders' && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-bold">Заказы с моими товарами</h2>
            <p className="text-sm text-gray-600 mt-1">Управляйте статусами заказов</p>
          </div>

          {loadingOrders ? (
            <div className="p-12 text-center">
              <div className="text-gray-500">Загрузка заказов...</div>
            </div>
          ) : orders.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-gray-400 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">Пока нет заказов</h3>
              <p className="text-gray-600">Заказы с вашими товарами появятся здесь</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {orders.map((order: any) => {
                const sellerItems = order.items.filter((item: any) => item.seller_id === user?.id);
                const sellerTotal = sellerItems.reduce((sum: number, item: any) => 
                  sum + (item.price_at_purchase * item.quantity), 0
                );
                const allItemsDelivered = sellerItems.every((item: any) => item.is_delivered);
                const someItemsDelivered = sellerItems.some((item: any) => item.is_delivered);

                return (
                  <div key={order.id} className="p-6 hover:bg-gray-50">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-bold">Заказ #{order.id}</h3>
                          <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                            allItemsDelivered ? 'bg-green-100 text-green-800' :
                            someItemsDelivered ? 'bg-blue-100 text-blue-800' :
                            order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {allItemsDelivered ? 'Ваши товары доставлены' :
                             someItemsDelivered ? 'Частично доставлено' :
                             order.status === 'pending' ? 'Ожидает' :
                             order.status === 'processing' ? 'В обработке' :
                             order.status === 'cancelled' ? 'Отменен' :
                             'Ожидает'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">
                          {order.delivery_method === 'pickup' ? '🏪 Самовывоз' : '🚚 Доставка'} • 
                          {' '}{new Date(order.created_at).toLocaleDateString('ru-RU')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">{allItemsDelivered ? 'Получено' : 'Ваш доход'}</p>
                        <p className={`text-xl font-bold ${allItemsDelivered ? 'text-green-600' : 'text-blue-600'}`}>
                          {formatPrice(sellerTotal)}
                        </p>
                      </div>
                    </div>

                    {/* Seller's items in this order */}
                    <div className="mb-4 space-y-2">
                      {sellerItems.map((item: any) => (
                        <div key={item.id} className={`flex justify-between items-center text-sm p-3 rounded ${item.is_delivered ? 'bg-green-50 border border-green-200' : 'bg-gray-50'}`}>
                          <div className="flex items-center gap-2">
                            {item.is_delivered && <span className="text-green-600 font-bold">✓</span>}
                            <span className={item.is_delivered ? 'text-green-800' : ''}>
                              {item.product?.name || `Товар #${item.product_id}`}
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className={`text-gray-600 ${item.is_delivered ? 'text-green-700' : ''}`}>
                              {item.quantity} шт. × {formatPrice(item.price_at_purchase)}
                            </span>
                            {item.is_delivered && (
                              <span className="text-xs px-2 py-1 bg-green-600 text-white rounded-full">Оплачено</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Status update buttons */}
                    {!allItemsDelivered && order.status !== 'cancelled' && (
                      <div className="flex gap-2 flex-wrap">
                        <button
                          onClick={() => handleUpdateOrderStatus(order.id, 'delivered')}
                          className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-semibold shadow-md"
                        >
                          ✓ {order.delivery_method === 'pickup' ? 'Отметить как выданные' : 'Отметить как доставленные'}
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Top Customers Tab */}
      {activeTab === 'customers' && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-bold">Топ-10 клиентов</h2>
            <p className="text-sm text-gray-600 mt-1">Клиенты с наибольшими покупками</p>
          </div>

          {loadingCustomers ? (
            <div className="p-12 text-center">
              <div className="text-gray-500">Загрузка...</div>
            </div>
          ) : topCustomers.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-gray-400 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">Пока нет клиентов</h3>
              <p className="text-gray-600">Когда кто-то купит ваши товары, они появятся здесь</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Имя</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Заказов</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Сумма покупок</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {topCustomers.map((customer, index) => (
                    <tr key={customer.user_id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {index < 3 ? (
                            <span className="text-2xl">
                              {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                            </span>
                          ) : (
                            <span className="text-sm font-medium text-gray-900">{index + 1}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{customer.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600">{customer.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                          {customer.orders_count} {customer.orders_count === 1 ? 'заказ' : 'заказов'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-green-600">
                          {formatPrice(customer.total_spent)}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Products Table */}
      {activeTab === 'products' && (
        <>
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
                {sellerProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <img
                          src={getImageUrl(product.image_urls?.[0], PLACEHOLDER_IMAGE)}
                          alt={product.name}
                          className="w-16 h-16 rounded-lg object-cover border-2 border-gray-200 shadow-sm"
                          onError={(e) => {
                            e.currentTarget.src = PLACEHOLDER_IMAGE;
                          }}
                        />
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{product.name}</div>
                          <div className="text-sm text-gray-500">{product.view_count} просмотров</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-600">
                        {PRODUCT_CATEGORIES_MAP[product.category] || product.category}
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
        </>
      )}

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


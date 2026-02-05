/**
 * Orders Page - List of User Orders
 */

import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { fetchOrders } from '../store/orderSlice';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { formatPrice, formatDateTime } from '../utils/helpers';
import { ORDER_STATUSES } from '../utils/constants';

export default function OrdersPage() {
  const dispatch = useAppDispatch();
  const { orders, isLoading } = useAppSelector((state) => state.order);

  const loadOrders = () => {
    console.log('OrdersPage: Fetching orders...');
    dispatch(fetchOrders({ page: 1, page_size: 20 }));
  };

  useEffect(() => {
    loadOrders();
  }, [dispatch]);

  console.log('OrdersPage: orders =', orders, 'isLoading =', isLoading);

  if (isLoading) {
    return <LoadingSpinner text="Загрузка заказов..." />;
  }

  if (orders.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">У вас пока нет заказов</h2>
        <p className="text-gray-600 mb-8">Начните покупки в нашем магазине</p>
        <Link
          to="/shop"
          className="inline-block bg-primary-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-700"
        >
          Перейти в каталог
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Мои заказы</h1>
        <button
          onClick={loadOrders}
          disabled={isLoading}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Обновить
        </button>
      </div>

      <div className="space-y-4">
        {orders.map((order: any) => {
          const statusInfo = ORDER_STATUSES[order.status as keyof typeof ORDER_STATUSES];
          
          return (
            <Link
              key={order.id}
              to={`/orders/${order.id}`}
              className="block bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold mb-2">Заказ #{order.id}</h3>
                  <p className="text-gray-600 text-sm">
                    {formatDateTime(order.created_at)}
                  </p>
                </div>
                <span
                  className={`px-4 py-2 rounded-full text-sm font-semibold bg-${statusInfo.color}-100 text-${statusInfo.color}-800`}
                >
                  {statusInfo.label}
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Товаров:</span>
                  <span className="ml-2 font-semibold">{order.items.length} шт.</span>
                </div>
                <div>
                  <span className="text-gray-600">Сумма:</span>
                  <span className="ml-2 font-semibold">{formatPrice(order.total_price)}</span>
                </div>
                <div>
                  <span className="text-gray-600">Доставка:</span>
                  <span className="ml-2 font-semibold">{order.delivery_method}</span>
                </div>
                {order.tracking_number && (
                  <div>
                    <span className="text-gray-600">Трек-номер:</span>
                    <span className="ml-2 font-semibold">{order.tracking_number}</span>
                  </div>
                )}
              </div>

              <div className="mt-4 text-primary-600 font-semibold">
                Подробнее →
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

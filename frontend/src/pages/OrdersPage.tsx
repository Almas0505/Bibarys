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

  useEffect(() => {
    dispatch(fetchOrders({ page: 1, page_size: 20 }));
  }, [dispatch]);

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
      <h1 className="text-3xl font-bold mb-8">Мои заказы</h1>

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

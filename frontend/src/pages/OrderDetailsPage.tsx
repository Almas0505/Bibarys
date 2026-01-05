/**
 * Order Details Page
 */

import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { fetchOrder, cancelOrder } from '../store/orderSlice';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { formatPrice, formatDateTime } from '../utils/helpers';
import { ORDER_STATUSES } from '../utils/constants';
import { OrderStatus } from '../types';

export default function OrderDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const { currentOrder: order, isLoading } = useAppSelector((state) => state.order);

  useEffect(() => {
    if (id) {
      dispatch(fetchOrder(Number(id)));
    }
  }, [dispatch, id]);

  const handleCancelOrder = async () => {
    if (order && confirm('Вы уверены, что хотите отменить заказ?')) {
      await dispatch(cancelOrder(order.id));
    }
  };

  if (isLoading) {
    return <LoadingSpinner text="Загрузка заказа..." />;
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Заказ не найден</h2>
        <Link to="/orders" className="text-primary-600 hover:underline">
          Вернуться к заказам
        </Link>
      </div>
    );
  }

  const statusInfo = ORDER_STATUSES[order.status as keyof typeof ORDER_STATUSES];
  const canCancel = order.status === OrderStatus.PENDING || order.status === OrderStatus.PROCESSING;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Заказ #{order.id}</h1>
          <p className="text-gray-600">{formatDateTime(order.created_at)}</p>
        </div>
        <span
          className={`px-4 py-2 rounded-full text-sm font-semibold bg-${statusInfo.color}-100 text-${statusInfo.color}-800`}
        >
          {statusInfo.label}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Order Items */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4">Товары</h2>
            <div className="space-y-4">
              {order.items.map((item: any) => (
                <div key={item.id} className="flex items-center justify-between pb-4 border-b last:border-b-0">
                  <div>
                    <Link to={`/product/${item.product_id}`} className="font-semibold hover:text-primary-600">
                      Товар #{item.product_id}
                    </Link>
                    <p className="text-gray-600 text-sm">Количество: {item.quantity} шт.</p>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">{formatPrice(item.price_at_purchase * item.quantity)}</div>
                    <div className="text-gray-600 text-sm">{formatPrice(item.price_at_purchase)} за шт.</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Delivery Info */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4">Информация о доставке</h2>
            <div className="space-y-3 text-sm">
              <div>
                <span className="text-gray-600">Способ доставки:</span>
                <span className="ml-2 font-semibold">{order.delivery_method}</span>
              </div>
              <div>
                <span className="text-gray-600">Стоимость доставки:</span>
                <span className="ml-2 font-semibold">{formatPrice(order.delivery_cost)}</span>
              </div>
              <div>
                <span className="text-gray-600">Адрес:</span>
                <p className="mt-1 font-semibold">{order.delivery_address}</p>
              </div>
              <div>
                <span className="text-gray-600">Телефон:</span>
                <span className="ml-2 font-semibold">{order.phone}</span>
              </div>
              {order.tracking_number && (
                <div>
                  <span className="text-gray-600">Трек-номер:</span>
                  <span className="ml-2 font-semibold">{order.tracking_number}</span>
                </div>
              )}
              {order.estimated_delivery && (
                <div>
                  <span className="text-gray-600">Ожидаемая дата доставки:</span>
                  <span className="ml-2 font-semibold">{formatDateTime(order.estimated_delivery)}</span>
                </div>
              )}
              {order.notes && (
                <div>
                  <span className="text-gray-600">Комментарий:</span>
                  <p className="mt-1">{order.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
            <h2 className="text-xl font-bold mb-4">Итого</h2>
            
            <div className="space-y-3 mb-6">
              <div className="flex items-center justify-between text-gray-600">
                <span>Товары:</span>
                <span>{formatPrice(order.total_price - order.delivery_cost)}</span>
              </div>
              <div className="flex items-center justify-between text-gray-600">
                <span>Доставка:</span>
                <span>{formatPrice(order.delivery_cost)}</span>
              </div>
              <div className="border-t pt-3">
                <div className="flex items-center justify-between text-xl font-bold">
                  <span>Итого:</span>
                  <span className="text-primary-600">{formatPrice(order.total_price)}</span>
                </div>
              </div>
            </div>

            {canCancel && (
              <button
                onClick={handleCancelOrder}
                className="w-full bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700"
              >
                Отменить заказ
              </button>
            )}

            <Link
              to="/orders"
              className="block text-center text-primary-600 hover:underline mt-4"
            >
              Вернуться к заказам
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

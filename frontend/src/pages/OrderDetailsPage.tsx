/**
 * Order Details Page
 */

import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { fetchOrder, cancelOrder } from '../store/orderSlice';
import { addToCart } from '../store/cartSlice';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import { formatPrice, formatDateTime } from '../utils/helpers';
import { ORDER_STATUSES } from '../utils/constants';

export default function OrderDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { currentOrder: order, isLoading } = useAppSelector((state) => state.order);
  
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  useEffect(() => {
    if (id) {
      dispatch(fetchOrder(Number(id)));
      setLastUpdated(new Date());
      
      // Auto-refresh every 10 seconds for active orders
      const interval = setInterval(() => {
        dispatch(fetchOrder(Number(id)));
        setLastUpdated(new Date());
      }, 10000); // Changed from 30000 to 10000 (10 seconds)
      
      return () => clearInterval(interval);
    }
  }, [dispatch, id]);

  const handleRefresh = () => {
    if (id) {
      dispatch(fetchOrder(Number(id)));
      setLastUpdated(new Date());
    }
  };

  const handleCancelOrder = async () => {
    if (order) {
      try {
        await dispatch(cancelOrder(order.id)).unwrap();
        alert('Заказ успешно отменён');
        setShowCancelModal(false);
      } catch (error: any) {
        alert(error.message || 'Ошибка при отмене заказа');
      }
    }
  };

  const handleRepeatOrder = async () => {
    if (!order) return;
    
    try {
      // Add all items from the order back to cart
      for (const item of order.items) {
        await dispatch(addToCart({ 
          product_id: item.product_id, 
          quantity: item.quantity 
        })).unwrap();
      }
      
      alert('Товары добавлены в корзину');
      navigate('/cart');
    } catch (error: any) {
      alert(error.message || 'Ошибка при добавлении товаров в корзину');
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

  const statusInfo = ORDER_STATUSES[order.status] || ORDER_STATUSES.pending;
  const canCancel = order.status === 'processing'; // Можно отменить только в обработке
  
  // Упрощенная система: только 2 этапа
  const allStatuses = ['processing', 'delivered'];
  const currentStatusIndex = allStatuses.indexOf(order.status);
  const orderStatuses = allStatuses.slice(0, currentStatusIndex + 1);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Заказ #{order.id}</h1>
          <p className="text-gray-600">{formatDateTime(order.created_at)}</p>
          <p className="text-xs text-gray-500 mt-1">
            Обновлено: {lastUpdated.toLocaleTimeString('ru-RU')} • Автообновление каждые 10 сек
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 flex items-center gap-2"
            title="Обновить статус"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
          <span
            className={`px-4 py-2 rounded-full text-sm font-semibold bg-${statusInfo.color}-100 text-${statusInfo.color}-800`}
          >
            {statusInfo.label}
          </span>
        </div>
      </div>

      {/* Timeline */}
      {order.status !== 'cancelled' && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold mb-6">Статус заказа</h2>
          
          <div className="flex items-center justify-between">
            {allStatuses.map((status, idx) => {
              const isActive = orderStatuses.includes(status);
              const isCurrent = order.status === status;
              
              return (
                <div key={status} className="flex items-center flex-1">
                  <div className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      isActive ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'
                    } ${isCurrent ? 'ring-4 ring-green-200' : ''}`}>
                      {isActive ? '✓' : idx + 1}
                    </div>
                    <span className="text-xs mt-2 text-center">
                      {status === 'processing' && 'В обработке'}
                      {status === 'delivered' && 'Принят/Доставлен'}
                    </span>
                  </div>
                  
                  {idx < allStatuses.length - 1 && (
                    <div className={`flex-1 h-1 mx-2 ${
                      orderStatuses.includes(allStatuses[idx + 1]) 
                        ? 'bg-green-500' 
                        : 'bg-gray-300'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

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
              {order.estimated_delivery && order.estimated_delivery !== '' && (
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
          
          {/* Action buttons */}
          <div className="flex gap-4">
            {canCancel && (
              <Button variant="danger" onClick={() => setShowCancelModal(true)}>
                Отменить заказ
              </Button>
            )}
            
            {order.status === 'delivered' && (
              <Button onClick={() => navigate(`/product/${order.items[0]?.product_id}?review=true`)}>
                Оставить отзыв
              </Button>
            )}
            
            <Button variant="secondary" onClick={handleRepeatOrder}>
              Повторить заказ
            </Button>
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

            <Link
              to="/orders"
              className="block text-center text-primary-600 hover:underline"
            >
              Вернуться к заказам
            </Link>
          </div>
        </div>
      </div>
      
      {/* Cancel Order Modal */}
      <Modal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        title="Отменить заказ?"
      >
        <p className="mb-4">Вы уверены, что хотите отменить этот заказ?</p>
        <div className="flex gap-4 justify-end">
          <Button variant="secondary" onClick={() => setShowCancelModal(false)}>
            Нет
          </Button>
          <Button variant="danger" onClick={handleCancelOrder}>
            Да, отменить
          </Button>
        </div>
      </Modal>
    </div>
  );
}

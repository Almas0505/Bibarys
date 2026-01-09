/**
 * Orders Page - List of User Orders (Enhanced)
 */

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { fetchOrders } from '../store/orderSlice';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import Select from '../components/common/Select';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import { formatPrice, formatDateTime } from '../utils/helpers';
import { ORDER_STATUSES } from '../utils/constants';

type OrderStatus = 'all' | 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
type TimePeriod = 'all' | 'month' | 'year';

export default function OrdersPage() {
  const dispatch = useAppDispatch();
  const { orders, isLoading } = useAppSelector((state) => state.order);
  const [filterStatus, setFilterStatus] = useState<OrderStatus>('all');
  const [filterPeriod, setFilterPeriod] = useState<TimePeriod>('all');

  useEffect(() => {
    dispatch(fetchOrders({ page: 1, page_size: 20 }));
  }, [dispatch]);

  // Filter orders based on status and period
  const filteredOrders = orders.filter((order: any) => {
    // Status filter
    if (filterStatus !== 'all' && order.status !== filterStatus) {
      return false;
    }

    // Period filter
    if (filterPeriod !== 'all') {
      const orderDate = new Date(order.created_at);
      const now = new Date();
      
      if (filterPeriod === 'month') {
        const monthAgo = new Date(now);
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        if (orderDate < monthAgo) return false;
      } else if (filterPeriod === 'year') {
        const yearAgo = new Date(now);
        yearAgo.setFullYear(yearAgo.getFullYear() - 1);
        if (orderDate < yearAgo) return false;
      }
    }

    return true;
  });

  const getStatusVariant = (status: string): 'success' | 'warning' | 'error' | 'info' | 'default' => {
    const statusMap: Record<string, 'success' | 'warning' | 'error' | 'info' | 'default'> = {
      delivered: 'success',
      shipped: 'info',
      processing: 'warning',
      pending: 'default',
      cancelled: 'error',
    };
    return statusMap[status] || 'default';
  };

  if (isLoading) {
    return <LoadingSpinner text="Загрузка заказов..." />;
  }

  if (orders.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <EmptyState
          icon={
            <svg className="w-24 h-24 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
          }
          title="У вас пока нет заказов"
          description="Начните покупки в нашем магазине"
          action={
            <Link to="/shop">
              <Button variant="primary" size="lg">
                Перейти в каталог
              </Button>
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Мои заказы</h1>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <Select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as OrderStatus)}
          className="sm:w-64"
          aria-label="Фильтр по статусу"
        >
          <option value="all">Все заказы</option>
          <option value="pending">Ожидают оплаты</option>
          <option value="processing">В обработке</option>
          <option value="shipped">Отправлены</option>
          <option value="delivered">Доставлены</option>
          <option value="cancelled">Отменены</option>
        </Select>

        <Select
          value={filterPeriod}
          onChange={(e) => setFilterPeriod(e.target.value as TimePeriod)}
          className="sm:w-64"
          aria-label="Фильтр по периоду"
        >
          <option value="all">За все время</option>
          <option value="month">За месяц</option>
          <option value="year">За год</option>
        </Select>
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <EmptyState
          icon="🔍"
          title="Заказы не найдены"
          description="Попробуйте изменить параметры фильтрации"
          action={
            <Button
              variant="outline"
              onClick={() => {
                setFilterStatus('all');
                setFilterPeriod('all');
              }}
            >
              Сбросить фильтры
            </Button>
          }
        />
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order: any) => {
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
                    <p className="text-gray-600 text-sm">{formatDateTime(order.created_at)}</p>
                  </div>
                  <Badge variant={getStatusVariant(order.status)}>{statusInfo?.label || order.status}</Badge>
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

                <div className="mt-4 text-primary-600 font-semibold hover:underline">
                  Подробнее →
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

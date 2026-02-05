import { useState, useEffect } from 'react';
import Input from '../common/Input';
import Select from '../common/Select';
import Badge from '../common/Badge';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { adminService } from '../../services/admin.service';
import { formatPrice, formatDateTime } from '../../utils/helpers';
import api from '../../services/api';

// Version: 2.0 - Fixed view button
interface Order {
  id: number;
  user?: {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
  };
  total_price: number;
  status: string;
  created_at: string;
}

export default function OrdersManagement() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState('');

  const statusOptions = [
    { value: 'all', label: 'Все статусы' },
    { value: 'pending', label: 'Ожидает' },
    { value: 'processing', label: 'В обработке' },
    { value: 'shipped', label: 'Отправлен' },
    { value: 'delivered', label: 'Доставлен' },
    { value: 'cancelled', label: 'Отменён' },
  ];

  useEffect(() => {
    loadOrders();
  }, [statusFilter]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const status = statusFilter === 'all' ? undefined : statusFilter;
      const data = await adminService.getAllOrders(1, 100, status);
      setOrders(data.items || []);
    } catch (err: any) {
      console.error('Error loading orders:', err);
      setError(err.response?.data?.detail || 'Ошибка загрузки заказов');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenStatusModal = (order: Order) => {
    console.log('Opening modal for order:', order);
    setSelectedOrder(order);
    setNewStatus(order.status);
    setShowStatusModal(true);
  };

  const handleUpdateStatus = async () => {
    if (!selectedOrder || !newStatus) return;

    try {
      await api.put(`/orders/${selectedOrder.id}/status`, { status: newStatus });
      alert('Статус заказа обновлен!');
      setShowStatusModal(false);
      setSelectedOrder(null);
      loadOrders();
    } catch (err: any) {
      console.error('Error updating status:', err);
      alert(err.response?.data?.detail || 'Ошибка при обновлении статуса');
    }
  };

  const filteredOrders = orders.filter(order => {
    const userName = order.user ? `${order.user.first_name} ${order.user.last_name}` : '';
    const matchesSearch = 
      order.id.toString().includes(searchQuery) ||
      (order.user?.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      userName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'success' | 'warning' | 'error' | 'info'> = {
      delivered: 'success',
      shipped: 'info',
      processing: 'warning',
      pending: 'warning',
      cancelled: 'error',
    };
    return variants[status] || 'info';
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      delivered: 'Доставлен',
      shipped: 'Отправлен',
      processing: 'В обработке',
      pending: 'Ожидает',
      cancelled: 'Отменён',
    };
    return labels[status] || status;
  };

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
          <h3 className="text-xl font-bold">Управление заказами</h3>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Input
            type="text"
            placeholder="Поиск по номеру или email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Select
            options={statusOptions}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          />
        </div>

        {/* Orders table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 px-4">№ Заказа</th>
                <th className="text-left py-2 px-4">Клиент</th>
                <th className="text-left py-2 px-4">Сумма</th>
                <th className="text-left py-2 px-4">Статус</th>
                <th className="text-left py-2 px-4">Дата</th>
                <th className="text-left py-2 px-4">Действия</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4 font-semibold">#{order.id}</td>
                  <td className="py-3 px-4">
                    {order.user ? (
                      <div>
                        <div className="font-medium text-gray-900">
                          {order.user.first_name} {order.user.last_name}
                        </div>
                        <div className="text-sm text-gray-500">{order.user.email}</div>
                      </div>
                    ) : (
                      <span className="text-gray-400">N/A</span>
                    )}
                  </td>
                  <td className="py-3 px-4 font-bold">{formatPrice(order.total_price)}</td>
                  <td className="py-3 px-4">
                    <Badge variant={getStatusBadge(order.status)}>
                      {getStatusLabel(order.status)}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-gray-600">{formatDateTime(order.created_at)}</td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleOpenStatusModal(order)}
                        className="text-blue-600 hover:underline text-sm"
                      >
                        {order.status === 'pending' || order.status === 'processing' ? 'Изменить статус' : 'Посмотреть'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredOrders.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Заказы не найдены
          </div>
        )}
      </div>

      {/* Status update/view modal */}
      <Modal
        isOpen={showStatusModal}
        onClose={() => {
          setShowStatusModal(false);
          setSelectedOrder(null);
        }}
        title={`${selectedOrder?.status === 'delivered' || selectedOrder?.status === 'cancelled' ? 'Детали заказа' : 'Изменить статус заказа'} #${selectedOrder?.id}`}
      >
        <div className="space-y-4">
          {/* Order details */}
          {selectedOrder && (
            <div className="bg-gray-50 p-4 rounded-lg space-y-2 mb-4">
              <p className="text-sm"><span className="font-semibold">Клиент:</span> {selectedOrder.user?.email || 'N/A'}</p>
              <p className="text-sm"><span className="font-semibold">Сумма:</span> {formatPrice(selectedOrder.total_price)}</p>
              <p className="text-sm"><span className="font-semibold">Дата:</span> {formatDateTime(selectedOrder.created_at)}</p>
              <p className="text-sm">
                <span className="font-semibold">Статус:</span>{' '}
                <Badge variant={getStatusBadge(selectedOrder.status)}>
                  {getStatusLabel(selectedOrder.status)}
                </Badge>
              </p>
            </div>
          )}

          {/* Status selector - only for pending/processing orders */}
          {selectedOrder && (selectedOrder.status === 'pending' || selectedOrder.status === 'processing') && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Новый статус
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="pending">Ожидает</option>
                  <option value="processing">В обработке</option>
                  <option value="shipped">Отправлен</option>
                  <option value="delivered">Доставлен</option>
                  <option value="cancelled">Отменён</option>
                </select>
              </div>

              <div className="flex justify-end gap-3">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setShowStatusModal(false);
                    setSelectedOrder(null);
                  }}
                >
                  Отмена
                </Button>
                <Button
                  variant="primary"
                  onClick={handleUpdateStatus}
                >
                  Сохранить
                </Button>
              </div>
            </>
          )}

          {/* Close button for completed orders */}
          {selectedOrder && selectedOrder.status !== 'pending' && selectedOrder.status !== 'processing' && (
            <div className="flex justify-end">
              <Button
                variant="primary"
                onClick={() => {
                  setShowStatusModal(false);
                  setSelectedOrder(null);
                }}
              >
                Закрыть
              </Button>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}

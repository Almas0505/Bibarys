import { useState } from 'react';
import Input from '../common/Input';
import Select from '../common/Select';
import Badge from '../common/Badge';

export default function OrdersManagement() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Mock data - in real app, fetch from API
  const orders = [
    { id: 1001, customer: 'user1@example.com', total: 15430, status: 'delivered', date: '2024-03-15 14:30' },
    { id: 1002, customer: 'user2@example.com', total: 8920, status: 'shipped', date: '2024-03-16 09:15' },
    { id: 1003, customer: 'user3@example.com', total: 3210, status: 'processing', date: '2024-03-16 11:45' },
    { id: 1004, customer: 'user4@example.com', total: 12300, status: 'pending', date: '2024-03-16 16:20' },
    { id: 1005, customer: 'user5@example.com', total: 6780, status: 'cancelled', date: '2024-03-14 13:00' },
  ];

  const statusOptions = [
    { value: 'all', label: 'Все статусы' },
    { value: 'pending', label: 'Ожидает' },
    { value: 'processing', label: 'В обработке' },
    { value: 'shipped', label: 'Отправлен' },
    { value: 'delivered', label: 'Доставлен' },
    { value: 'cancelled', label: 'Отменён' },
  ];

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.id.toString().includes(searchQuery) ||
      order.customer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
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
                  <td className="py-3 px-4 text-gray-600">{order.customer}</td>
                  <td className="py-3 px-4 font-bold">₽{order.total.toLocaleString()}</td>
                  <td className="py-3 px-4">
                    <Badge variant={getStatusBadge(order.status)}>
                      {getStatusLabel(order.status)}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-gray-600">{order.date}</td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      <button className="text-blue-600 hover:underline text-sm">
                        Посмотреть
                      </button>
                      {order.status === 'pending' || order.status === 'processing' ? (
                        <button className="text-green-600 hover:underline text-sm">
                          Изменить статус
                        </button>
                      ) : null}
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
    </div>
  );
}

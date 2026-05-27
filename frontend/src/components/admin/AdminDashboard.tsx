import { useEffect, useState } from 'react';
import { adminService } from '../../services/admin.service';
import { formatPrice } from '../../utils/helpers';

interface DashboardStats {
  total_users: number;
  total_products: number;
  total_orders: number;
  total_revenue: number;
  pending_orders: number;
  active_sellers: number;
}

interface RecentOrder {
  id: number;
  user?: {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
  };
  total_price: number;
  status: string;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    total_users: 0,
    total_orders: 0,
    total_products: 0,
    total_revenue: 0,
    pending_orders: 0,
    active_sellers: 0,
  });
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch dashboard stats
      const dashboardData = await adminService.getDashboard();
      setStats(dashboardData);
      
      // Fetch recent orders
      const ordersData = await adminService.getAllOrders(1, 5);
      setRecentOrders(ordersData.items || []);
    } catch (err: any) {
      console.error('Error loading dashboard data:', err);
      setError(err.response?.data?.detail || 'Деректерді жүктеу кезінде қате орын алды');
    } finally {
      setLoading(false);
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: 'Күтілуде',
      processing: 'Өңделуде',
      shipped: 'Жіберілді',
      delivered: 'Жеткізілді',
      cancelled: 'Болдырмалынды',
    };
    return labels[status] || status;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-gray-600">Жүктелуде...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
        {error}
      </div>
    );
  }

  return (
    <div>
      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Пайдаланушылар</p>
              <p className="text-3xl font-bold">{stats.total_users.toLocaleString()}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <span className="text-2xl">👥</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Тапсырыстар</p>
              <p className="text-3xl font-bold">{stats.total_orders.toLocaleString()}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <span className="text-2xl">📦</span>
            </div>
          </div>
          {stats.pending_orders > 0 && (
            <p className="text-orange-600 text-sm mt-2">Күтілуде: {stats.pending_orders}</p>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Тауарлар</p>
              <p className="text-3xl font-bold">{stats.total_products.toLocaleString()}</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <span className="text-2xl">📱</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Түсім</p>
              <p className="text-3xl font-bold">{formatPrice(stats.total_revenue)}</p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-full">
              <span className="text-2xl">💰</span>
            </div>
          </div>
        </div>
      </div>

      {/* Latest orders table */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold mb-4">Соңғы тапсырыстар</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 px-4">№</th>
                <th className="text-left py-2 px-4">Пайдаланушы</th>
                <th className="text-left py-2 px-4">Сомасы</th>
                <th className="text-left py-2 px-4">Статус</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.length > 0 ? (
                recentOrders.map((order) => (
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
                      <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">
                        {getStatusLabel(order.status)}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-gray-500">
                    Тапсырыстар жоқ
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

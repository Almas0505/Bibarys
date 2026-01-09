export default function AdminDashboard() {
  // Mock data - in real app, fetch from API
  const stats = {
    totalUsers: 1234,
    totalOrders: 567,
    totalProducts: 2345,
    totalRevenue: 1234567,
    userGrowth: 12,
    orderGrowth: 8,
    productGrowth: 5,
    revenueGrowth: 18,
  };

  const recentOrders = [
    { id: 1001, user: 'user1@example.com', amount: 5430, status: 'Оплачен' },
    { id: 1002, user: 'user2@example.com', amount: 8920, status: 'Оплачен' },
    { id: 1003, user: 'user3@example.com', amount: 3210, status: 'В обработке' },
    { id: 1004, user: 'user4@example.com', amount: 12300, status: 'Оплачен' },
    { id: 1005, user: 'user5@example.com', amount: 6780, status: 'Доставлен' },
  ];

  return (
    <div>
      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Пользователи</p>
              <p className="text-3xl font-bold">{stats.totalUsers.toLocaleString()}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <span className="text-2xl">👥</span>
            </div>
          </div>
          <p className="text-green-600 text-sm mt-2">+{stats.userGrowth}% за месяц</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Заказы</p>
              <p className="text-3xl font-bold">{stats.totalOrders.toLocaleString()}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <span className="text-2xl">📦</span>
            </div>
          </div>
          <p className="text-green-600 text-sm mt-2">+{stats.orderGrowth}% за месяц</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Товары</p>
              <p className="text-3xl font-bold">{stats.totalProducts.toLocaleString()}</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <span className="text-2xl">📱</span>
            </div>
          </div>
          <p className="text-green-600 text-sm mt-2">+{stats.productGrowth}% за месяц</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Выручка</p>
              <p className="text-3xl font-bold">₽{(stats.totalRevenue / 1000000).toFixed(1)}M</p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-full">
              <span className="text-2xl">💰</span>
            </div>
          </div>
          <p className="text-green-600 text-sm mt-2">+{stats.revenueGrowth}% за месяц</p>
        </div>
      </div>

      {/* Latest orders table */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold mb-4">Последние заказы</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 px-4">№</th>
                <th className="text-left py-2 px-4">Пользователь</th>
                <th className="text-left py-2 px-4">Сумма</th>
                <th className="text-left py-2 px-4">Статус</th>
                <th className="text-left py-2 px-4">Действия</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order) => (
                <tr key={order.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4 font-semibold">#{order.id}</td>
                  <td className="py-3 px-4 text-gray-600">{order.user}</td>
                  <td className="py-3 px-4 font-bold">₽{order.amount.toLocaleString()}</td>
                  <td className="py-3 px-4">
                    <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">
                      {order.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <button className="text-primary-600 hover:underline text-sm">
                      Посмотреть
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

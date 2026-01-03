/**
 * Seller Page - Seller Dashboard and Product Management
 */

export default function SellerPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Панель продавца</h1>

      {/* Dashboard Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Мои товары</p>
              <p className="text-3xl font-bold">45</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
          </div>
          <p className="text-gray-600 text-sm mt-2">32 активных</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Мои заказы</p>
              <p className="text-3xl font-bold">128</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>
          <p className="text-yellow-600 text-sm mt-2">12 в обработке</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Доход</p>
              <p className="text-3xl font-bold">₽456K</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p className="text-green-600 text-sm mt-2">+15% за месяц</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-bold mb-4">Быстрые действия</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="px-6 py-4 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-semibold">
            + Добавить товар
          </button>
          <button className="px-6 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold">
            📦 Мои товары
          </button>
          <button className="px-6 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold">
            📋 Заказы
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Orders */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">Последние заказы</h2>
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center justify-between border-b pb-3">
                <div>
                  <p className="font-semibold">Заказ #{2000 + i}</p>
                  <p className="text-sm text-gray-600">Товар: Product {i}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold">₽{(Math.random() * 5000).toFixed(0)}</p>
                  <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded">
                    В обработке
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">Популярные товары</h2>
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center justify-between border-b pb-3">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gray-200 rounded mr-3"></div>
                  <div>
                    <p className="font-semibold">Product {i}</p>
                    <p className="text-sm text-gray-600">{Math.floor(Math.random() * 100)} продаж</p>
                  </div>
                </div>
                <div className="flex items-center text-yellow-400">
                  <span>★</span>
                  <span className="ml-1 text-gray-600">{(4 + Math.random()).toFixed(1)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-8 bg-blue-100 border border-blue-400 text-blue-800 px-6 py-4 rounded-lg">
        <p className="font-semibold">Примечание: Это демо-страница продавца</p>
        <p className="text-sm mt-1">
          Полный функционал панели продавца требует дополнительной реализации API endpoints
        </p>
      </div>
    </div>
  );
}

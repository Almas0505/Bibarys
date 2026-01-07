/**
 * Admin Page - Dashboard and Management
 */

import { useState } from 'react';
import AdminDashboard from '../components/admin/AdminDashboard';
import UsersManagement from '../components/admin/UsersManagement';
import ProductsManagement from '../components/admin/ProductsManagement';
import OrdersManagement from '../components/admin/OrdersManagement';

type TabType = 'dashboard' | 'users' | 'products' | 'orders';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Панель администратора</h1>

      {/* Tabs */}
      <div className="border-b mb-8">
        <nav className="flex gap-8">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`pb-4 px-2 font-semibold ${
              activeTab === 'dashboard'
                ? 'border-b-2 border-primary-600 text-primary-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`pb-4 px-2 font-semibold ${
              activeTab === 'users'
                ? 'border-b-2 border-primary-600 text-primary-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Пользователи
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`pb-4 px-2 font-semibold ${
              activeTab === 'products'
                ? 'border-b-2 border-primary-600 text-primary-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Товары
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`pb-4 px-2 font-semibold ${
              activeTab === 'orders'
                ? 'border-b-2 border-primary-600 text-primary-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Заказы
          </button>
        </nav>
      </div>

      {/* Content */}
      {activeTab === 'dashboard' && <AdminDashboard />}
      {activeTab === 'users' && <UsersManagement />}
      {activeTab === 'products' && <ProductsManagement />}
      {activeTab === 'orders' && <OrdersManagement />}
    </div>
  );
}

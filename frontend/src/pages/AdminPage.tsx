/**
 * Admin Page - Dashboard and Management
 */

import { useState } from 'react';
import { useAppSelector } from '../hooks/redux';
import AdminDashboard from '../components/admin/AdminDashboard';
import UsersManagement from '../components/admin/UsersManagement';
import ProductsManagement from '../components/admin/ProductsManagement';
import OrdersManagement from '../components/admin/OrdersManagement';
import { adminService } from '../services/admin.service';
import Button from '../components/common/Button';

type TabType = 'dashboard' | 'users' | 'products' | 'orders';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [exportingPDF, setExportingPDF] = useState(false);
  const { user } = useAppSelector((state) => state.auth);

  const handleExportPDF = async () => {
    try {
      setExportingPDF(true);
      
      // Call PDF export API
      const blob = await adminService.exportPDF();
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `saudaflow_analytics_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      alert('PDF сәтті экспортталды!');
    } catch (error: any) {
      console.error('Error exporting PDF:', error);
      alert(error.response?.data?.detail || 'PDF экспорттау кезінде қате орын алды');
    } finally {
      setExportingPDF(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Admin Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-700 text-white rounded-lg shadow-lg p-6 mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-2">👑 Қош келдіңіз, Әкімші!</h1>
            <p className="text-purple-100">SaudaFlow платформасын толық басқару</p>
          </div>
          {activeTab === 'dashboard' && (
            <Button
              onClick={handleExportPDF}
              disabled={exportingPDF}
              variant="outline"
              className="bg-white text-purple-600 hover:bg-purple-50"
            >
              {exportingPDF ? '📄 Экспортталуда...' : '📄 PDF қылып экспорттау'}
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-md mb-8">
        <nav className="flex gap-2 p-2">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex-1 py-3 px-4 font-semibold rounded-lg transition ${
              activeTab === 'dashboard'
                ? 'bg-purple-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            📊 Статистика
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`flex-1 py-3 px-4 font-semibold rounded-lg transition ${
              activeTab === 'users'
                ? 'bg-purple-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            👥 Пайдаланушылар
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`flex-1 py-3 px-4 font-semibold rounded-lg transition ${
              activeTab === 'products'
                ? 'bg-purple-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            📦 Тауарлар
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`flex-1 py-3 px-4 font-semibold rounded-lg transition ${
              activeTab === 'orders'
                ? 'bg-purple-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            🛒 Тапсырыстар
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

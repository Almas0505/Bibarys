import { useState, useEffect } from 'react';
import Input from '../common/Input';
import Badge from '../common/Badge';
import { adminService } from '../../services/admin.service';

interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  is_active: boolean;
  created_at: string;
}

export default function UsersManagement() {
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminService.getUsers();
      setUsers(data);
    } catch (err: any) {
      console.error('Error loading users:', err);
      setError(err.response?.data?.detail || 'Пайдаланушыларды жүктеу кезінде қате орын алды');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (userId: number, currentStatus: boolean) => {
    if (!confirm(`Сіз осы пайдаланушыны ${currentStatus ? 'белсенді емес қылуға' : 'белсендіруге'} сенімдісіз бе?`)) {
      return;
    }
    
    try {
      await adminService.toggleUserStatus(userId);
      await loadUsers();
      alert('Пайдаланушы статусы сәтті өзгертілді!');
    } catch (err: any) {
      console.error('Error toggling user status:', err);
      alert(err.response?.data?.detail || 'Статусты өзгерту кезінде қате орын алды');
    }
  };

  const handleDeleteUser = async (userId: number, userEmail: string) => {
    if (!confirm(`Сіз ${userEmail} пайдаланушысын өшіруге сенімдісіз бе?\nБұл әрекетті қайтару мүмкін емес!`)) {
      return;
    }
    
    try {
      await adminService.deleteUser(userId);
      await loadUsers();
      alert('Пайдаланушы сәтті өшірілді!');
    } catch (err: any) {
      console.error('Error deleting user:', err);
      alert(err.response?.data?.detail || 'Пайдаланушыны өшіру кезінде қате орын алды');
    }
  };

  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    `${user.first_name} ${user.last_name}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('kk-KZ');
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center py-8 text-gray-500">Жүктелуде...</div>
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
          <h3 className="text-xl font-bold">Пайдаланушыларды басқару</h3>
        </div>

        {/* Search */}
        <div className="mb-6">
          <Input
            type="text"
            placeholder="Email немесе аты бойынша іздеу..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Users table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 px-4">ID</th>
                <th className="text-left py-2 px-4">Email</th>
                <th className="text-left py-2 px-4">Аты</th>
                <th className="text-left py-2 px-4">Рөлі</th>
                <th className="text-left py-2 px-4">Статус</th>
                <th className="text-left py-2 px-4">Тіркелген күні</th>
                <th className="text-left py-2 px-4">Әрекеттер</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4">{user.id}</td>
                  <td className="py-3 px-4">{user.email}</td>
                  <td className="py-3 px-4">{user.first_name} {user.last_name}</td>
                  <td className="py-3 px-4">
                    <Badge variant={
                      user.role === 'admin' ? 'error' : 
                      user.role === 'seller' ? 'info' : 'success'
                    }>
                      {user.role}
                    </Badge>
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant={user.is_active ? 'success' : 'error'}>
                      {user.is_active ? 'Белсенді' : 'Белсенді емес'}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-gray-600">{formatDate(user.created_at)}</td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleToggleStatus(user.id, user.is_active)}
                        className={`${user.is_active ? 'text-orange-600 hover:text-orange-800' : 'text-green-600 hover:text-green-800'} hover:underline text-sm`}
                      >
                        {user.is_active ? 'Белсенді емес қылу' : 'Белсендіру'}
                      </button>
                      <button 
                        onClick={() => handleDeleteUser(user.id, user.email)}
                        className="text-red-600 hover:text-red-800 hover:underline text-sm"
                      >
                        Өшіру
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Пайдаланушылар табылмады
          </div>
        )}
      </div>
    </div>
  );
}

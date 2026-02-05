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
      setError(err.response?.data?.detail || 'Ошибка загрузки пользователей');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (userId: number, currentStatus: boolean) => {
    if (!confirm(`Вы уверены, что хотите ${currentStatus ? 'деактивировать' : 'активировать'} этого пользователя?`)) {
      return;
    }
    
    try {
      await adminService.toggleUserStatus(userId);
      await loadUsers();
      alert('Статус пользователя успешно изменён!');
    } catch (err: any) {
      console.error('Error toggling user status:', err);
      alert(err.response?.data?.detail || 'Ошибка при изменении статуса');
    }
  };

  const handleDeleteUser = async (userId: number, userEmail: string) => {
    if (!confirm(`Вы уверены, что хотите удалить пользователя ${userEmail}?\nЭто действие нельзя отменить!`)) {
      return;
    }
    
    try {
      await adminService.deleteUser(userId);
      await loadUsers();
      alert('Пользователь успешно удалён!');
    } catch (err: any) {
      console.error('Error deleting user:', err);
      alert(err.response?.data?.detail || 'Ошибка при удалении пользователя');
    }
  };

  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    `${user.first_name} ${user.last_name}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU');
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
          <h3 className="text-xl font-bold">Управление пользователями</h3>
        </div>

        {/* Search */}
        <div className="mb-6">
          <Input
            type="text"
            placeholder="Поиск по email или имени..."
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
                <th className="text-left py-2 px-4">Имя</th>
                <th className="text-left py-2 px-4">Роль</th>
                <th className="text-left py-2 px-4">Статус</th>
                <th className="text-left py-2 px-4">Дата регистрации</th>
                <th className="text-left py-2 px-4">Действия</th>
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
                      {user.is_active ? 'Активен' : 'Неактивен'}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-gray-600">{formatDate(user.created_at)}</td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleToggleStatus(user.id, user.is_active)}
                        className={`${user.is_active ? 'text-orange-600 hover:text-orange-800' : 'text-green-600 hover:text-green-800'} hover:underline text-sm`}
                      >
                        {user.is_active ? 'Деактивировать' : 'Активировать'}
                      </button>
                      <button 
                        onClick={() => handleDeleteUser(user.id, user.email)}
                        className="text-red-600 hover:text-red-800 hover:underline text-sm"
                      >
                        Удалить
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
            Пользователи не найдены
          </div>
        )}
      </div>
    </div>
  );
}

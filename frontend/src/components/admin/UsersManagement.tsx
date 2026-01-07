import { useState } from 'react';
import Input from '../common/Input';
import Select from '../common/Select';
import Badge from '../common/Badge';

export default function UsersManagement() {
  const [searchQuery, setSearchQuery] = useState('');

  // Mock data - in real app, fetch from API
  const users = [
    { id: 1, email: 'admin@example.com', name: 'Admin User', role: 'admin', isActive: true, createdAt: '2024-01-15' },
    { id: 2, email: 'seller@example.com', name: 'Seller One', role: 'seller', isActive: true, createdAt: '2024-02-20' },
    { id: 3, email: 'customer@example.com', name: 'Customer John', role: 'customer', isActive: true, createdAt: '2024-03-10' },
    { id: 4, email: 'inactive@example.com', name: 'Inactive User', role: 'customer', isActive: false, createdAt: '2024-01-05' },
  ];

  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
                  <td className="py-3 px-4">{user.name}</td>
                  <td className="py-3 px-4">
                    <Badge variant={
                      user.role === 'admin' ? 'error' : 
                      user.role === 'seller' ? 'info' : 'success'
                    }>
                      {user.role}
                    </Badge>
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant={user.isActive ? 'success' : 'error'}>
                      {user.isActive ? 'Активен' : 'Неактивен'}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-gray-600">{user.createdAt}</td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      <button className="text-blue-600 hover:underline text-sm">
                        Редактировать
                      </button>
                      <button className={`${user.isActive ? 'text-red-600' : 'text-green-600'} hover:underline text-sm`}>
                        {user.isActive ? 'Деактивировать' : 'Активировать'}
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

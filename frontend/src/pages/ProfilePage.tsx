/**
 * Profile Page
 */

import { useState, FormEvent } from 'react';
import { useAppSelector } from '../hooks/redux';
import { USER_ROLES } from '../utils/constants';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function ProfilePage() {
  const { user, isLoading } = useAppSelector((state) => state.auth);

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    phone: user?.phone || '',
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    // TODO: Implement profile update API call
    alert('Профиль обновлён');
    setIsEditing(false);
  };

  if (isLoading || !user) {
    return <LoadingSpinner text="Загрузка профиля..." />;
  }

  const roleInfo = USER_ROLES[user.role as keyof typeof USER_ROLES];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Мой профиль</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Info */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6">
            {!isEditing ? (
              <>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">Личные данные</h2>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="text-primary-600 hover:underline"
                  >
                    Редактировать
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <span className="text-gray-600">Имя:</span>
                    <span className="ml-2 font-semibold">{user.first_name}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Фамилия:</span>
                    <span className="ml-2 font-semibold">{user.last_name}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Email:</span>
                    <span className="ml-2 font-semibold">{user.email}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Телефон:</span>
                    <span className="ml-2 font-semibold">{user.phone || 'Не указан'}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Роль:</span>
                    <span className={`ml-2 font-semibold text-${roleInfo.color}-600`}>
                      {roleInfo.label}
                    </span>
                  </div>
                </div>
              </>
            ) : (
              <>
                <h2 className="text-2xl font-bold mb-6">Редактировать профиль</h2>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-2">
                      Имя
                    </label>
                    <input
                      id="first_name"
                      type="text"
                      value={formData.first_name}
                      onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-2">
                      Фамилия
                    </label>
                    <input
                      id="last_name"
                      type="text"
                      value={formData.last_name}
                      onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                      Телефон
                    </label>
                    <input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>

                  <div className="flex space-x-4">
                    <button
                      type="submit"
                      className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                    >
                      Сохранить
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                    >
                      Отмена
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4">Статистика</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Статус аккаунта:</span>
                <span className={`font-semibold ${user.is_active ? 'text-green-600' : 'text-red-600'}`}>
                  {user.is_active ? 'Активен' : 'Неактивен'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Подтверждён:</span>
                <span className={`font-semibold ${user.is_verified ? 'text-green-600' : 'text-yellow-600'}`}>
                  {user.is_verified ? 'Да' : 'Нет'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

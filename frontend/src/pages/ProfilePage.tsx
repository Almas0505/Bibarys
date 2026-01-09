/**
 * Profile Page
 */

import { useState, FormEvent } from 'react';
import { useAppSelector } from '../hooks/redux';
import { USER_ROLES } from '../utils/constants';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import { useToast } from '../components/common/ToastContainer';
import { isValidPassword, doPasswordsMatch } from '../utils/validators';
import { getInitials } from '../utils/helpers';

export default function ProfilePage() {
  const { user, isLoading } = useAppSelector((state) => state.auth);
  const { showToast } = useToast();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    phone: user?.phone || '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({});
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    // TODO: Implement profile update API call
    showToast('success', 'Профиль успешно обновлён');
    setIsEditing(false);
  };

  const handleChangePassword = async (e: FormEvent) => {
    e.preventDefault();
    
    const errors: Record<string, string> = {};
    
    if (!passwordData.currentPassword) {
      errors.currentPassword = 'Введите текущий пароль';
    }
    
    if (!isValidPassword(passwordData.newPassword)) {
      errors.newPassword = 'Пароль должен содержать минимум 8 символов';
    }
    
    if (!doPasswordsMatch(passwordData.newPassword, passwordData.confirmPassword)) {
      errors.confirmPassword = 'Пароли не совпадают';
    }
    
    setPasswordErrors(errors);
    
    if (Object.keys(errors).length > 0) {
      return;
    }
    
    setIsChangingPassword(true);
    
    try {
      // TODO: Implement password change API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      showToast('success', 'Пароль успешно изменён');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setPasswordErrors({});
    } catch (error: any) {
      showToast('error', error.message || 'Ошибка при смене пароля');
    } finally {
      setIsChangingPassword(false);
    }
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
          {/* Avatar and Basic Info */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex items-center mb-6">
              {/* Avatar with initials */}
              <div className="w-20 h-20 rounded-full bg-primary-600 text-white flex items-center justify-center text-2xl font-bold mr-4">
                {user.avatar_url ? (
                  <img src={user.avatar_url} alt="Avatar" className="w-full h-full rounded-full object-cover" />
                ) : (
                  getInitials(user.first_name, user.last_name)
                )}
              </div>
              <div>
                <h2 className="text-2xl font-bold">{user.first_name} {user.last_name}</h2>
                <p className="text-gray-600">{user.email}</p>
              </div>
            </div>
          </div>

          {/* Personal Data */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
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
                  <Input
                    label="Имя"
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    required
                  />

                  <Input
                    label="Фамилия"
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    required
                  />

                  <Input
                    label="Телефон"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />

                  <div className="flex space-x-4">
                    <Button type="submit">
                      Сохранить
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => setIsEditing(false)}
                    >
                      Отмена
                    </Button>
                  </div>
                </form>
              </>
            )}
          </div>

          {/* Change Password Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold mb-6">Изменить пароль</h2>
            
            <form onSubmit={handleChangePassword}>
              <Input
                type="password"
                label="Текущий пароль"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                error={passwordErrors.currentPassword}
                className="mb-4"
              />
              
              <Input
                type="password"
                label="Новый пароль"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                error={passwordErrors.newPassword}
                helperText="Минимум 8 символов"
                className="mb-4"
              />
              
              <Input
                type="password"
                label="Подтвердите пароль"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                error={passwordErrors.confirmPassword}
                className="mb-4"
              />
              
              <Button type="submit" disabled={isChangingPassword}>
                {isChangingPassword ? 'Сохранение...' : 'Изменить пароль'}
              </Button>
            </form>
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

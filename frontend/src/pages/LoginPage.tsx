/**
 * Login Page
 */

import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { login } from '../store/authSlice';
import { UserRole } from '../types';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function LoginPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    const result = await dispatch(login(formData));
    
    if (login.fulfilled.match(result)) {
      const role = result.payload.user?.role;
      if (role === UserRole.ADMIN) {
        navigate('/admin');
      } else if (role === UserRole.SELLER) {
        navigate('/seller');
      } else {
        navigate('/');
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-8">
        <h1 className="text-3xl font-bold text-center mb-8">Жүйеге кіру</h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {String(error)}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Құпиясөз
            </label>
            <input
              type="password"
              id="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 disabled:bg-gray-400"
          >
            {isLoading ? <LoadingSpinner size="sm" /> : 'Кіру'}
          </button>
        </form>

        <p className="text-center text-gray-600 mt-6">
          Аккаунтыңыз жоқ па?{' '}
          <Link to="/register" className="text-primary-600 hover:underline font-semibold">
            Тіркелу
          </Link>
        </p>
      </div>
    </div>
  );
}

/**
 * Register Page
 */

import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { register, login } from '../store/authSlice';
import { UserRole } from '../types';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function RegisterPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    first_name: '',
    last_name: '',
    phone: '',
  });

  const [validationError, setValidationError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setValidationError('');

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setValidationError('Құпиясөздер сәйкес келмейді');
      return;
    }

    // Validate password length
    if (formData.password.length < 8) {
      setValidationError('Құпиясөз кем дегенде 8 таңбадан тұруы керек');
      return;
    }

    try {
      const result = await dispatch(
        register({
          email: formData.email,
          password: formData.password,
          first_name: formData.first_name,
          last_name: formData.last_name,
          phone: formData.phone || undefined,
        })
      );

      if (register.fulfilled.match(result)) {
        // Registration successful, now login automatically
        const loginResult = await dispatch(
          login({
            email: formData.email,
            password: formData.password,
          })
        );

        if (login.fulfilled.match(loginResult)) {
          // Login successful — redirect by role
          const role = loginResult.payload.user?.role;
          if (role === UserRole.ADMIN) {
            navigate('/admin');
          } else if (role === UserRole.SELLER) {
            navigate('/seller');
          } else {
            navigate('/');
          }
        } else {
          // Login failed after registration, show login page
          navigate('/login', { 
            state: { message: 'Тіркелу сәтті өтті! Енді жүйеге кіріңіз.' } 
          });
        }
      }
    } catch (err) {
      console.error('Registration error:', err);
      setValidationError('Тіркелу кезінде қате шықты');
    }
  };

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-8">
        <h1 className="text-3xl font-bold text-center mb-8">Тіркелу</h1>

        {(error || validationError) && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {String(error || validationError)}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-2">
                Аты
              </label>
              <input
                type="text"
                id="first_name"
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-2">
                Тегі
              </label>
              <input
                type="text"
                id="last_name"
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                required
              />
            </div>
          </div>

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
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
              Телефон (міндетті емес)
            </label>
            <input
              type="tel"
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent"
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

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
              Құпиясөзді растаңыз
            </label>
            <input
              type="password"
              id="confirmPassword"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 disabled:bg-gray-400"
          >
            {isLoading ? <LoadingSpinner size="sm" /> : 'Тіркелу'}
          </button>
        </form>

        <p className="text-center text-gray-600 mt-6">
          Аккаунтыңыз бар ма?{' '}
          <Link to="/login" className="text-primary-600 hover:underline font-semibold">
            Кіру
          </Link>
        </p>
      </div>
    </div>
  );
}

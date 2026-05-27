/**
 * Header Component
 */

import { Link, useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../hooks/redux';
import { logout } from '../../store/authSlice';
import { UserRole } from '../../types';
import { APP_NAME } from '../../utils/constants';

export default function Header() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const { cart } = useAppSelector((state) => state.cart);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');  // После выхода — всегда на публичную главную (гость)
  };

  const homeLink = isAuthenticated && user?.role === UserRole.ADMIN
    ? '/admin'
    : isAuthenticated && user?.role === UserRole.SELLER
    ? '/seller'
    : '/';

  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to={homeLink} className="text-2xl font-bold text-primary-600">
            {APP_NAME}
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {/* Басты бет — только для гостей и покупателей */}
            {(!isAuthenticated || user?.role === UserRole.CUSTOMER) && (
              <Link to="/" className="text-gray-700 hover:text-primary-600">
                Басты бет
              </Link>
            )}

            {/* Дүкен — только для гостей и покупателей */}
            {(!isAuthenticated || user?.role === UserRole.CUSTOMER) && (
              <Link to="/shop" className="text-gray-700 hover:text-primary-600">
                Дүкен
              </Link>
            )}
            
            {isAuthenticated && (
              <>
                {/* Покупатель видит свои заказы и избранное */}
                {user?.role === UserRole.CUSTOMER && (
                  <>
                    <Link to="/orders" className="text-gray-700 hover:text-primary-600">
                      Менің тапсырыстарым
                    </Link>
                    <Link to="/wishlist" className="text-gray-700 hover:text-primary-600">
                      Таңдаулылар
                    </Link>
                  </>
                )}
                
                {/* Админ видит только админ-панель */}
                {user?.role === UserRole.ADMIN && (
                  <Link to="/admin" className="text-gray-700 hover:text-primary-600">
                    👑 Әкімші панелі
                  </Link>
                )}
                
                {/* Продавец видит только панель продавца */}
                {user?.role === UserRole.SELLER && (
                  <Link to="/seller" className="text-gray-700 hover:text-primary-600">
                    📊 Сатушы панелі
                  </Link>
                )}
              </>
            )}
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            {/* Wallet — для всех кроме admin */}
            {isAuthenticated && user?.role !== UserRole.ADMIN && (
              <Link to="/wallet" className="relative flex items-center space-x-2 text-gray-700 hover:text-primary-600 bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-lg transition">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                  />
                </svg>
                <span className="font-medium">Әмиян</span>
              </Link>
            )}
            
            {/* Cart - only for customers */}
            {(!isAuthenticated || user?.role === UserRole.CUSTOMER) && (
              <Link to="/cart" className="relative flex items-center space-x-2 text-gray-700 hover:text-primary-600 bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-lg transition">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                <span className="font-medium">Себет</span>
                {cart.total_items > 0 && (
                  <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 font-bold">
                    {cart.total_items}
                  </span>
                )}
              </Link>
            )}

            {/* Auth */}
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <Link to="/profile" className="text-gray-700 hover:text-primary-600">
                  {user?.first_name}
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Шығу
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-gray-700 hover:text-primary-600"
                >
                  Кіру
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700"
                >
                  Тіркелу
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

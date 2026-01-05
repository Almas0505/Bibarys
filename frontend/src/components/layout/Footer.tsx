/**
 * Footer Component
 */

import { Link } from 'react-router-dom';
import { APP_NAME } from '../../utils/constants';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-800 text-white mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <h3 className="text-lg font-bold mb-4">{APP_NAME}</h3>
            <p className="text-gray-400 text-sm">
              Ваш надёжный интернет-магазин с широким ассортиментом товаров и быстрой доставкой.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-lg font-bold mb-4">Покупателям</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/shop" className="text-gray-400 hover:text-white">
                  Каталог товаров
                </Link>
              </li>
              <li>
                <Link to="/orders" className="text-gray-400 hover:text-white">
                  Мои заказы
                </Link>
              </li>
              <li>
                <Link to="/wishlist" className="text-gray-400 hover:text-white">
                  Избранное
                </Link>
              </li>
            </ul>
          </div>

          {/* Info */}
          <div>
            <h3 className="text-lg font-bold mb-4">Информация</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="text-gray-400 hover:text-white">
                  О компании
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white">
                  Доставка и оплата
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white">
                  Возврат товара
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-bold mb-4">Контакты</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>Email: info@example.com</li>
              <li>Телефон: +7 (XXX) XXX-XX-XX</li>
              <li>Адрес: г. Москва, ул. Примерная, 1</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-700 text-center text-sm text-gray-400">
          <p>&copy; {currentYear} {APP_NAME}. Все права защищены.</p>
        </div>
      </div>
    </footer>
  );
}

/**
 * Not Found (404) Page
 */

import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-md mx-auto text-center">
        <h1 className="text-9xl font-bold text-primary-600">404</h1>
        <h2 className="text-3xl font-bold text-gray-800 mt-4 mb-2">Страница не найдена</h2>
        <p className="text-gray-600 mb-8">
          К сожалению, запрашиваемая страница не существует или была удалена.
        </p>
        <Link
          to="/"
          className="inline-block bg-primary-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-700"
        >
          Вернуться на главную
        </Link>
      </div>
    </div>
  );
}

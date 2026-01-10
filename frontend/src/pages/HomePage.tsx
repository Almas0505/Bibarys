/**
 * Home Page
 */

import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { fetchProducts } from '../store/productSlice';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { formatPrice, getImageUrl } from '../utils/helpers';
import { PLACEHOLDER_IMAGE } from '../utils/constants';

export default function HomePage() {
  const dispatch = useAppDispatch();
  const { products, isLoading, error } = useAppSelector((state) => state.product);

  useEffect(() => {
    // Fetch featured products
    dispatch(fetchProducts({ pagination: { page: 1, page_size: 8 } }));
  }, [dispatch]);

  if (isLoading) {
    return <LoadingSpinner text="Загрузка..." />;
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
        <Link to="/shop" className="inline-block mt-4 text-primary-600 hover:underline">
          Перейти в каталог
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white rounded-lg p-12 mb-12">
        <div className="max-w-2xl">
          <h1 className="text-4xl font-bold mb-4">Добро пожаловать в наш магазин!</h1>
          <p className="text-xl mb-6">
            Найдите всё, что вам нужно, по лучшим ценам с быстрой доставкой
          </p>
          <Link
            to="/shop"
            className="inline-block bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100"
          >
            Перейти в каталог
          </Link>
        </div>
      </section>

      {/* Featured Products */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold">Популярные товары</h2>
          <Link to="/shop" className="text-primary-600 hover:underline">
            Смотреть все →
          </Link>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Товары скоро появятся!</p>
            <Link
              to="/shop"
              className="inline-block mt-4 text-primary-600 hover:underline"
            >
              Перейти в каталог
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.slice(0, 8).map((product: any) => (
              <Link
                key={product.id}
                to={`/product/${product.id}`}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="aspect-square overflow-hidden bg-gray-100">
                  <img
                    src={getImageUrl(product.image_urls?.[0], PLACEHOLDER_IMAGE)}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.onerror = null;
                      target.src = PLACEHOLDER_IMAGE;
                    }}
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-2 line-clamp-2">{product.name}</h3>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-primary-600">
                      {formatPrice(product.price)}
                    </span>
                    <div className="flex items-center text-sm text-gray-600">
                      <span className="text-yellow-400 mr-1">★</span>
                      {product.rating.toFixed(1)}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Features */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
        <div className="text-center">
          <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold mb-2">Гарантия качества</h3>
          <p className="text-gray-600">Все товары сертифицированы и проверены</p>
        </div>

        <div className="text-center">
          <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold mb-2">Быстрая доставка</h3>
          <p className="text-gray-600">Доставим ваш заказ в кратчайшие сроки</p>
        </div>

        <div className="text-center">
          <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold mb-2">Удобная оплата</h3>
          <p className="text-gray-600">Различные способы оплаты на выбор</p>
        </div>
      </section>
    </div>
  );
}

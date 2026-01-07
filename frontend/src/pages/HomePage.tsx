/**
 * Home Page
 */

import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { fetchProducts } from '../store/productSlice';
import { addToCart } from '../store/cartSlice';
import { addToWishlist, removeFromWishlist } from '../store/wishlistSlice';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Button from '../components/common/Button';
import ProductGrid from '../components/product/ProductGrid';
import { useToast } from '../components/common/ToastContainer';

export default function HomePage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { products, isLoading, error } = useAppSelector((state) => state.product);
  const { items: wishlistItems } = useAppSelector((state) => state.wishlist);
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const { showToast } = useToast();

  useEffect(() => {
    // Fetch featured products (highest rated)
    dispatch(fetchProducts({ 
      pagination: { page: 1, page_size: 8 },
      filters: { sort_by: 'rating', sort_order: 'desc' }
    }));
  }, [dispatch]);

  const handleAddToCart = async (productId: number) => {
    if (!isAuthenticated) {
      showToast('warning', 'Пожалуйста, войдите в систему');
      return;
    }
    
    try {
      await dispatch(addToCart({ product_id: productId, quantity: 1 })).unwrap();
      showToast('success', 'Товар добавлен в корзину!');
    } catch (error) {
      showToast('error', 'Не удалось добавить товар в корзину');
    }
  };

  const handleToggleWishlist = async (productId: number) => {
    if (!isAuthenticated) {
      showToast('warning', 'Пожалуйста, войдите в систему');
      return;
    }
    
    const isInWishlist = wishlistItems.some(item => item.id === productId);
    
    try {
      if (isInWishlist) {
        await dispatch(removeFromWishlist(productId)).unwrap();
        showToast('info', 'Товар удален из избранного');
      } else {
        await dispatch(addToWishlist(productId)).unwrap();
        showToast('success', 'Товар добавлен в избранное!');
      }
    } catch (error) {
      showToast('error', 'Произошла ошибка');
    }
  };

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

  const wishlistProductIds = wishlistItems.map(item => item.id);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white rounded-lg p-12 mb-12">
        <div className="max-w-2xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Добро пожаловать в Bibarys!</h1>
          <p className="text-xl mb-6">
            Найдите всё, что вам нужно, по лучшим ценам с быстрой доставкой
          </p>
          <Button 
            variant="outline" 
            size="lg"
            onClick={() => navigate('/shop')}
            className="bg-white text-primary-600 hover:bg-gray-100 border-white"
          >
            Перейти в каталог
          </Button>
        </div>
      </section>

      {/* Featured Products */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold">Популярные товары</h2>
          <Link to="/shop" className="text-primary-600 hover:underline text-lg">
            Смотреть все →
          </Link>
        </div>

        <ProductGrid
          products={products.slice(0, 8)}
          loading={isLoading}
          columns={4}
          onAddToCart={handleAddToCart}
          onAddToWishlist={handleToggleWishlist}
          wishlistIds={wishlistProductIds}
          emptyMessage="Товары скоро появятся!"
          emptyAction={
            <Link to="/shop">
              <Button variant="primary">Перейти в каталог</Button>
            </Link>
          }
        />
      </section>

      {/* Categories Section */}
      <section className="mt-16">
        <h2 className="text-3xl font-bold mb-8 text-center">Категории товаров</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { name: 'Электроника', icon: '💻', category: 'electronics' },
            { name: 'Одежда', icon: '👕', category: 'clothing' },
            { name: 'Для дома', icon: '🏠', category: 'home' },
            { name: 'Спорт', icon: '⚽', category: 'sports' },
          ].map((cat) => (
            <Link
              key={cat.category}
              to={`/shop?category=${cat.category}`}
              className="bg-white rounded-lg shadow-md p-8 text-center hover:shadow-lg transition-shadow group"
            >
              <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">
                {cat.icon}
              </div>
              <h3 className="text-xl font-semibold text-gray-800 group-hover:text-primary-600 transition-colors">
                {cat.name}
              </h3>
            </Link>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-16">
        <div className="text-center bg-white rounded-lg shadow-md p-6">
          <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold mb-2">Быстрая доставка</h3>
          <p className="text-gray-600">Доставка в течение 1-3 дней</p>
        </div>

        <div className="text-center bg-white rounded-lg shadow-md p-6">
          <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold mb-2">Легкий возврат</h3>
          <p className="text-gray-600">Возврат в течение 30 дней</p>
        </div>

        <div className="text-center bg-white rounded-lg shadow-md p-6">
          <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold mb-2">Поддержка 24/7</h3>
          <p className="text-gray-600">Всегда готовы помочь</p>
        </div>

        <div className="text-center bg-white rounded-lg shadow-md p-6">
          <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold mb-2">Безопасность</h3>
          <p className="text-gray-600">Защищенные платежи</p>
        </div>
      </section>
    </div>
  );
}

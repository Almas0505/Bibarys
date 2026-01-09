/**
 * Wishlist Page
 */

import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { addToCart } from '../store/cartSlice';
import { fetchWishlist, removeFromWishlist as removeFromWishlistAction } from '../store/wishlistSlice';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { formatPrice } from '../utils/helpers';
import { PLACEHOLDER_IMAGE } from '../utils/constants';

export default function WishlistPage() {
  const dispatch = useAppDispatch();
  const { items: wishlist, isLoading } = useAppSelector((state) => state.wishlist);

  useEffect(() => {
    dispatch(fetchWishlist());
  }, [dispatch]);

  const handleRemove = async (productId: number) => {
    await dispatch(removeFromWishlistAction(productId));
  };

  const handleAddToCart = async (productId: number) => {
    await dispatch(addToCart({ product_id: productId, quantity: 1 }));
  };

  if (isLoading) {
    return <LoadingSpinner text="Загрузка избранного..." />;
  }

  if (wishlist.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">Список избранного пуст</h2>
        <p className="text-gray-600 mb-8">Добавляйте товары в избранное, чтобы не потерять их</p>
        <Link
          to="/shop"
          className="inline-block bg-primary-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-700"
        >
          Перейти в каталог
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Избранное</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {wishlist.map((item) => (
          <div key={item.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="relative">
              <Link to={`/product/${item.product_id}`}>
                <div className="aspect-square overflow-hidden">
                  <img
                    src={item.product_image || PLACEHOLDER_IMAGE}
                    alt={item.product_name}
                    className="w-full h-full object-cover hover:scale-110 transition-transform"
                  />
                </div>
              </Link>
              <button
                onClick={() => handleRemove(item.product_id)}
                className="absolute top-2 right-2 bg-white rounded-full p-2 shadow-md hover:bg-red-50"
                aria-label="Удалить из избранного"
              >
                <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                </svg>
              </button>
            </div>

            <div className="p-4">
              <Link to={`/product/${item.product_id}`}>
                <h3 className="font-semibold text-lg mb-2 line-clamp-2 hover:text-primary-600">
                  {item.product_name}
                </h3>
              </Link>
              <div className="flex items-center justify-between mb-3">
                <span className="text-2xl font-bold text-primary-600">
                  {formatPrice(item.product_price)}
                </span>
                <div className="flex items-center text-sm text-gray-600">
                  <span className="text-yellow-400 mr-1">★</span>
                  {item.product_rating.toFixed(1)}
                </div>
              </div>
              <button
                onClick={() => handleAddToCart(item.product_id)}
                className="w-full bg-primary-600 text-white py-2 rounded-lg hover:bg-primary-700"
              >
                В корзину
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

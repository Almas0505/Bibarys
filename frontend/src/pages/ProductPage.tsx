/**
 * Product Detail Page
 */

import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { fetchProduct } from '../store/productSlice';
import { addToCart } from '../store/cartSlice';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { formatPrice, getImageUrl } from '../utils/helpers';
import { PLACEHOLDER_IMAGE } from '../utils/constants';
import { reviewService } from '../services/review.service';
import { wishlistService } from '../services/wishlist.service';
import { Review } from '../types';

export default function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { currentProduct: product, isLoading } = useAppSelector((state) => state.product);
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewData, setReviewData] = useState({
    rating: 5,
    title: '',
    text: ''
  });
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  useEffect(() => {
    if (id) {
      dispatch(fetchProduct(Number(id)));
      loadReviews();
      checkWishlistStatus();
    }
  }, [dispatch, id]);

  const checkWishlistStatus = async () => {
    if (!isAuthenticated || !id) return;
    try {
      const wishlist = await wishlistService.getWishlist();
      setIsInWishlist(wishlist.some(item => item.product_id === Number(id)));
    } catch (error) {
      console.error('Error checking wishlist:', error);
    }
  };

  const loadReviews = async () => {
    if (!id) return;
    setReviewsLoading(true);
    try {
      const response = await reviewService.getProductReviews(Number(id));
      setReviews(response.items);
    } catch (error) {
      console.error('Error loading reviews:', error);
    } finally {
      setReviewsLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      alert('Пожалуйста, войдите в систему');
      return;
    }
    
    if (product) {
      try {
        await dispatch(addToCart({ product_id: product.id, quantity })).unwrap();
        if (window.confirm('Товар добавлен в корзину!\n\nПерейти в корзину?')) {
          navigate('/cart');
        }
      } catch (error: any) {
        alert(error || 'Ошибка при добавлении в корзину');
      }
    }
  };

  const handleToggleWishlist = async () => {
    if (!isAuthenticated) {
      alert('Пожалуйста, войдите в систему');
      return;
    }
    
    if (!product) return;
    
    setWishlistLoading(true);
    try {
      if (isInWishlist) {
        await wishlistService.removeFromWishlist(product.id);
        setIsInWishlist(false);
        alert('Товар удален из избранного');
      } else {
        await wishlistService.addToWishlist(product.id);
        setIsInWishlist(true);
        alert('Товар добавлен в избранное');
      }
    } catch (error: any) {
      alert(error.response?.data?.detail || 'Ошибка при работе с избранным');
    } finally {
      setWishlistLoading(false);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      alert('Пожалуйста, войдите в систему');
      return;
    }

    if (!product) return;

    try {
      await reviewService.createReview({
        product_id: product.id,
        rating: reviewData.rating,
        title: reviewData.title,
        text: reviewData.text
      });
      
      alert('Отзыв успешно добавлен!');
      setShowReviewForm(false);
      setReviewData({ rating: 5, title: '', text: '' });
      await loadReviews();
    } catch (error: any) {
      console.error('Error submitting review:', error);
      alert(error.response?.data?.detail || 'Ошибка при добавлении отзыва');
    }
  };

  if (isLoading) {
    return <LoadingSpinner text="Загрузка товара..." />;
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Товар не найден</h2>
        <Link to="/shop" className="text-primary-600 hover:underline">
          Вернуться в каталог
        </Link>
      </div>
    );
  }

  const images = product.image_urls?.length > 0 
    ? product.image_urls.map(url => getImageUrl(url, PLACEHOLDER_IMAGE))
    : [PLACEHOLDER_IMAGE];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumbs */}
      <nav className="text-sm text-gray-600 mb-6">
        <Link to="/" className="hover:text-primary-600">Главная</Link>
        {' / '}
        <Link to="/shop" className="hover:text-primary-600">Каталог</Link>
        {' / '}
        <span className="text-gray-800">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Images */}
        <div>
          <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-4">
            <img
              src={images[selectedImage]}
              alt={product.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.onerror = null;
                target.src = PLACEHOLDER_IMAGE;
              }}
            />
          </div>
          
          {images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {images.map((img: string, index: number) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 ${
                    selectedImage === index ? 'border-primary-600' : 'border-transparent'
                  }`}
                >
                  <img 
                    src={img} 
                    alt={`${product.name} ${index + 1}`} 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.onerror = null;
                      target.src = PLACEHOLDER_IMAGE;
                    }}
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div>
          <h1 className="text-3xl font-bold mb-4">{product.name}</h1>

          <div className="flex items-center mb-4">
            <div className="flex items-center text-yellow-400 mr-4">
              {[...Array(5)].map((_, i) => (
                <span key={i} className={i < Math.round(product.rating) ? '' : 'opacity-30'}>★</span>
              ))}
            </div>
            <span className="text-gray-600">
              {product.rating.toFixed(1)} ({product.review_count} отзывов)
            </span>
          </div>

          <div className="text-4xl font-bold text-primary-600 mb-6">
            {formatPrice(product.price)}
          </div>

          {product.description && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">Описание</h2>
              <p className="text-gray-700 whitespace-pre-line">{product.description}</p>
            </div>
          )}

          <div className="mb-6">
            <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
              product.quantity > 0
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}>
              {product.quantity > 0 ? `В наличии: ${product.quantity} шт.` : 'Нет в наличии'}
            </span>
          </div>

          {product.quantity > 0 && (
            <>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Количество
                </label>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 bg-gray-200 rounded-lg hover:bg-gray-300"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    aria-label="Количество товара"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, Math.min(product.quantity, Number(e.target.value))))}
                    className="w-20 text-center px-3 py-2 border border-gray-300 rounded-lg"
                    min="1"
                    max={product.quantity}
                  />
                  <button
                    onClick={() => setQuantity(Math.min(product.quantity, quantity + 1))}
                    className="w-10 h-10 bg-gray-200 rounded-lg hover:bg-gray-300"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleAddToCart}
                  className="flex-1 bg-primary-600 text-white py-4 rounded-lg text-lg font-semibold hover:bg-primary-700"
                >
                  Добавить в корзину
                </button>
                
                <button
                  onClick={handleToggleWishlist}
                  disabled={wishlistLoading}
                  className={`px-6 py-4 rounded-lg border-2 transition-colors ${
                    isInWishlist
                      ? 'bg-red-50 border-red-500 text-red-600 hover:bg-red-100'
                      : 'bg-white border-gray-300 text-gray-600 hover:border-primary-500 hover:text-primary-600'
                  }`}
                  title={isInWishlist ? 'Удалить из избранного' : 'Добавить в избранное'}
                >
                  <svg
                    className="w-6 h-6"
                    fill={isInWishlist ? 'currentColor' : 'none'}
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                </button>
              </div>
            </>
          )}

          {/* Additional Info */}
          <div className="mt-8 border-t pt-6">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Категория:</span>
                <span className="ml-2 font-semibold">{product.category}</span>
              </div>
              <div>
                <span className="text-gray-600">Просмотров:</span>
                <span className="ml-2 font-semibold">{product.view_count}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="mt-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Отзывы ({reviews.length})</h2>
          {isAuthenticated && (
            <button
              onClick={() => setShowReviewForm(!showReviewForm)}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              {showReviewForm ? 'Отменить' : 'Написать отзыв'}
            </button>
          )}
        </div>

        {/* Review Form */}
        {showReviewForm && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h3 className="text-xl font-semibold mb-4">Ваш отзыв</h3>
            <form onSubmit={handleSubmitReview}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Оценка
                </label>
                <div className="flex space-x-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewData({ ...reviewData, rating: star })}
                      className={`text-3xl ${
                        star <= reviewData.rating ? 'text-yellow-400' : 'text-gray-300'
                      }`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Заголовок
                </label>
                <input
                  type="text"
                  value={reviewData.title}
                  onChange={(e) => setReviewData({ ...reviewData, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  placeholder="Краткий заголовок отзыва"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ваш отзыв *
                </label>
                <textarea
                  value={reviewData.text}
                  onChange={(e) => setReviewData({ ...reviewData, text: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  rows={4}
                  required
                  placeholder="Расскажите о вашем опыте использования товара..."
                />
              </div>

              <button
                type="submit"
                className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                Отправить отзыв
              </button>
            </form>
          </div>
        )}

        {/* Reviews List */}
        {reviewsLoading ? (
          <div className="text-center py-8">Загрузка отзывов...</div>
        ) : reviews.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center text-gray-600">
            Пока нет отзывов. Станьте первым, кто оставит отзыв!
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-semibold">{review.user_first_name} {review.user_last_name}</span>
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <span
                            key={star}
                            className={`text-lg ${
                              star <= review.rating ? 'text-yellow-400' : 'text-gray-300'
                            }`}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                    </div>
                    {review.title && (
                      <h4 className="font-medium text-gray-800">{review.title}</h4>
                    )}
                  </div>
                  <span className="text-sm text-gray-500">
                    {new Date(review.created_at).toLocaleDateString('ru-RU')}
                  </span>
                </div>
                <p className="text-gray-700">{review.text}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

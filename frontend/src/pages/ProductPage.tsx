/**
 * Product Detail Page (Complete Rewrite)
 */

import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { fetchProduct, fetchProducts } from '../store/productSlice';
import { addToCart } from '../store/cartSlice';
import { addToWishlist, removeFromWishlist } from '../store/wishlistSlice';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import Rating from '../components/common/Rating';
import ReviewsList from '../components/product/ReviewsList';
import ProductGrid from '../components/product/ProductGrid';
import { useToast } from '../components/common/ToastContainer';
import { formatPrice } from '../utils/helpers';
import { truncateText } from '../utils/formatters';
import { PLACEHOLDER_IMAGE } from '../utils/constants';

export default function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { currentProduct: product, isLoading } = useAppSelector((state) => state.product);
  const { items: wishlistItems } = useAppSelector((state) => state.wishlist);
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const { showToast } = useToast();

  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<'description' | 'reviews'>('description');
  const [isExpanded, setIsExpanded] = useState(false);
  const [similarProducts, setSimilarProducts] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewsPage, setReviewsPage] = useState(1);

  useEffect(() => {
    if (id) {
      dispatch(fetchProduct(Number(id)));
    }
  }, [dispatch, id]);

  // Fetch similar products when product is loaded
  useEffect(() => {
    if (product?.category) {
      dispatch(
        fetchProducts({
          filters: { category: product.category },
          pagination: { page: 1, page_size: 4 },
        })
      ).then((result: any) => {
        if (result.payload) {
          // Filter out current product
          const filtered = result.payload.filter((p: any) => p.id !== product.id);
          setSimilarProducts(filtered.slice(0, 4));
        }
      });
    }
  }, [dispatch, product?.category, product?.id]);

  // Mock reviews data - in real app, fetch from API
  useEffect(() => {
    if (product) {
      // Mock reviews
      setReviews([
        {
          id: 1,
          rating: 5,
          title: 'Отличный товар!',
          text: 'Очень доволен покупкой. Качество на высоте.',
          created_at: new Date().toISOString(),
          verified_purchase: true,
          helpful_count: 5,
        },
        {
          id: 2,
          rating: 4,
          title: 'Хорошо',
          text: 'В целом неплохо, есть небольшие недочёты.',
          created_at: new Date(Date.now() - 86400000).toISOString(),
          verified_purchase: false,
          helpful_count: 2,
        },
      ]);
    }
  }, [product]);

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      showToast('warning', 'Пожалуйста, войдите в систему');
      return;
    }

    if (product) {
      try {
        await dispatch(addToCart({ product_id: product.id, quantity })).unwrap();
        showToast('success', `Добавлено в корзину: ${quantity} шт.`);
      } catch (error) {
        showToast('error', 'Не удалось добавить товар в корзину');
      }
    }
  };

  const handleBuyNow = async () => {
    if (!isAuthenticated) {
      showToast('warning', 'Пожалуйста, войдите в систему');
      return;
    }

    if (product) {
      try {
        await dispatch(addToCart({ product_id: product.id, quantity })).unwrap();
        navigate('/checkout');
      } catch (error) {
        showToast('error', 'Не удалось добавить товар в корзину');
      }
    }
  };

  const handleToggleWishlist = async () => {
    if (!isAuthenticated) {
      showToast('warning', 'Пожалуйста, войдите в систему');
      return;
    }

    if (!product) return;

    const isInWishlist = wishlistItems.some((item) => item.id === product.id);

    try {
      if (isInWishlist) {
        await dispatch(removeFromWishlist(product.id)).unwrap();
        showToast('info', 'Товар удален из избранного');
      } else {
        await dispatch(addToWishlist(product.id)).unwrap();
        showToast('success', 'Товар добавлен в избранное!');
      }
    } catch (error) {
      showToast('error', 'Произошла ошибка');
    }
  };

  const handleAddReview = () => {
    showToast('info', 'Функция добавления отзыва в разработке');
  };

  const handleAddToCartFromSimilar = async (productId: number) => {
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

  const handleToggleWishlistSimilar = async (productId: number) => {
    if (!isAuthenticated) {
      showToast('warning', 'Пожалуйста, войдите в систему');
      return;
    }

    const isInWishlist = wishlistItems.some((item) => item.id === productId);

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
    return <LoadingSpinner text="Загрузка товара..." />;
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Товар не найден</h2>
        <Link to="/shop">
          <Button variant="primary">Вернуться в каталог</Button>
        </Link>
      </div>
    );
  }

  const images = product.image_urls.length > 0 ? product.image_urls : [PLACEHOLDER_IMAGE];
  const isInWishlist = wishlistItems.some((item) => item.id === product.id);
  const wishlistProductIds = wishlistItems.map((item) => item.id);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumbs */}
      <nav className="text-sm text-gray-600 mb-6">
        <Link to="/" className="hover:text-primary-600">
          Главная
        </Link>
        {' > '}
        <Link to="/shop" className="hover:text-primary-600">
          Каталог
        </Link>
        {' > '}
        <Link to={`/shop?category=${product.category}`} className="hover:text-primary-600">
          {product.category}
        </Link>
        {' > '}
        <span className="text-gray-800">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
        {/* Left - Image gallery */}
        <div>
          {/* Main image */}
          <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-4">
            <img
              src={images[selectedImageIndex]}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {images.map((url: string, idx: number) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 transition-colors ${
                    selectedImageIndex === idx ? 'border-primary-600' : 'border-transparent hover:border-gray-300'
                  }`}
                >
                  <img src={url} alt={`${product.name} ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right - Product info */}
        <div>
          <h1 className="text-3xl font-bold mb-2">{product.name}</h1>

          {/* Rating */}
          <div className="flex items-center gap-2 mb-4">
            <Rating value={product.rating} readonly showValue />
            <span className="text-gray-600">({product.review_count} отзывов)</span>
          </div>

          {/* Price */}
          <div className="text-4xl font-bold text-primary-600 mb-6">{formatPrice(product.price)}</div>

          {/* Description */}
          {product.description && (
            <div className="mb-6">
              <p className="text-gray-700 whitespace-pre-line">
                {isExpanded ? product.description : truncateText(product.description, 200)}
              </p>
              {product.description.length > 200 && (
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="text-primary-600 hover:underline text-sm mt-2"
                >
                  {isExpanded ? 'Скрыть' : 'Показать все'}
                </button>
              )}
            </div>
          )}

          {/* Stock status */}
          <div className="mb-6">
            {product.quantity > 0 ? (
              <Badge variant="success">В наличии: {product.quantity} шт</Badge>
            ) : (
              <Badge variant="error">Нет в наличии</Badge>
            )}
          </div>

          {/* Quantity selector */}
          {product.quantity > 0 && (
            <div className="flex items-center gap-4 mb-6">
              <label className="text-sm font-medium text-gray-700">Количество:</label>
              <div className="flex items-center border rounded-lg">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-4 py-2 hover:bg-gray-100 transition-colors"
                >
                  -
                </button>
                <input
                  type="number"
                  value={quantity}
                  min="1"
                  max={product.quantity}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setQuantity(Math.max(1, Math.min(product.quantity, val)));
                  }}
                  className="w-20 text-center py-2 border-x focus:outline-none"
                  aria-label="Количество товара"
                />
                <button
                  onClick={() => setQuantity(Math.min(product.quantity, quantity + 1))}
                  className="px-4 py-2 hover:bg-gray-100 transition-colors"
                >
                  +
                </button>
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-4 mb-6">
            <Button
              variant="primary"
              size="lg"
              onClick={handleAddToCart}
              disabled={product.quantity === 0}
              className="flex-1"
            >
              Добавить в корзину
            </Button>

            <Button variant="secondary" onClick={handleToggleWishlist} className="px-4">
              {isInWishlist ? (
                <svg className="w-6 h-6 fill-current text-red-500" viewBox="0 0 24 24">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
              )}
            </Button>
          </div>

          <Button
            variant="secondary"
            onClick={handleBuyNow}
            disabled={product.quantity === 0}
            fullWidth
          >
            Купить сейчас
          </Button>

          {/* Category and seller */}
          <div className="mt-6 pt-6 border-t text-sm text-gray-600 space-y-2">
            <p>
              <span className="font-medium">Категория:</span>{' '}
              <Link to={`/shop?category=${product.category}`} className="text-primary-600 hover:underline">
                {product.category}
              </Link>
            </p>
            <p>
              <span className="font-medium">Продавец:</span> Seller #{product.seller_id}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs section */}
      <div className="mb-12">
        <div className="border-b mb-6">
          <nav className="flex gap-8">
            <button
              onClick={() => setActiveTab('description')}
              className={`pb-4 border-b-2 transition-colors ${
                activeTab === 'description'
                  ? 'border-primary-600 text-primary-600 font-semibold'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Описание
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`pb-4 border-b-2 transition-colors ${
                activeTab === 'reviews'
                  ? 'border-primary-600 text-primary-600 font-semibold'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Отзывы ({product.review_count})
            </button>
          </nav>
        </div>

        {activeTab === 'description' && (
          <div className="prose max-w-none">
            <p className="text-gray-700 whitespace-pre-line">{product.description}</p>
          </div>
        )}

        {activeTab === 'reviews' && (
          <ReviewsList
            reviews={reviews}
            totalReviews={reviews.length}
            currentPage={reviewsPage}
            pageSize={10}
            onPageChange={setReviewsPage}
            canReview={isAuthenticated}
            onAddReview={handleAddReview}
          />
        )}
      </div>

      {/* Similar products */}
      {similarProducts.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-6">Вам может понравиться</h2>
          <ProductGrid
            products={similarProducts}
            columns={4}
            onAddToCart={handleAddToCartFromSimilar}
            onAddToWishlist={handleToggleWishlistSimilar}
            wishlistIds={wishlistProductIds}
          />
        </div>
      )}
    </div>
  );
}

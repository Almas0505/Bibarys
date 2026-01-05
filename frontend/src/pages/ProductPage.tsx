/**
 * Product Detail Page
 */

import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { fetchProduct } from '../store/productSlice';
import { addToCart } from '../store/cartSlice';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { formatPrice } from '../utils/helpers';
import { PLACEHOLDER_IMAGE } from '../utils/constants';

export default function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const { currentProduct: product, isLoading } = useAppSelector((state) => state.product);
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    if (id) {
      dispatch(fetchProduct(Number(id)));
    }
  }, [dispatch, id]);

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      alert('Пожалуйста, войдите в систему');
      return;
    }
    
    if (product) {
      await dispatch(addToCart({ product_id: product.id, quantity }));
      alert('Товар добавлен в корзину');
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

  const images = product.image_urls.length > 0 ? product.image_urls : [PLACEHOLDER_IMAGE];

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
                  <img src={img} alt={`${product.name} ${index + 1}`} className="w-full h-full object-cover" />
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

              <button
                onClick={handleAddToCart}
                className="w-full bg-primary-600 text-white py-4 rounded-lg text-lg font-semibold hover:bg-primary-700"
              >
                Добавить в корзину
              </button>
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
    </div>
  );
}

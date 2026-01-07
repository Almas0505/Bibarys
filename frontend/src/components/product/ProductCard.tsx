/**
 * Product Card Component
 */

import { Link } from 'react-router-dom';
import { Product } from '../../types';
import { formatPrice } from '../../utils/helpers';
import { PLACEHOLDER_IMAGE } from '../../utils/constants';
import Badge from '../common/Badge';

interface ProductCardProps {
  product: Product;
  onAddToCart?: (productId: number) => void;
  onAddToWishlist?: (productId: number) => void;
  isInWishlist?: boolean;
}

export default function ProductCard({ 
  product, 
  onAddToCart, 
  onAddToWishlist,
  isInWishlist = false 
}: ProductCardProps) {
  const imageUrl = product.image_urls[0] || PLACEHOLDER_IMAGE;
  const isOutOfStock = product.quantity === 0;
  const isNew = new Date(product.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // 7 days

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden group relative hover:shadow-xl transition-shadow duration-300">
      {/* Badges */}
      <div className="absolute top-2 left-2 z-10 flex flex-col gap-2">
        {isNew && <Badge variant="info">Новинка</Badge>}
        {isOutOfStock && <Badge variant="error">Нет в наличии</Badge>}
      </div>

      {/* Wishlist Button */}
      {onAddToWishlist && (
        <button
          onClick={() => onAddToWishlist(product.id)}
          className="absolute top-2 right-2 z-10 p-2 bg-white rounded-full shadow-md hover:bg-red-50 transition-colors"
          aria-label={isInWishlist ? 'Удалить из избранного' : 'Добавить в избранное'}
        >
          <svg 
            className={`w-5 h-5 ${isInWishlist ? 'text-red-500 fill-current' : 'text-gray-400'}`}
            fill={isInWishlist ? 'currentColor' : 'none'}
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>
      )}

      {/* Image */}
      <Link to={`/product/${product.id}`} className="block">
        <div className="aspect-square overflow-hidden bg-gray-100">
          <img
            src={imageUrl}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          />
        </div>
      </Link>

      {/* Content */}
      <div className="p-4">
        <Link to={`/product/${product.id}`}>
          <h3 className="font-semibold text-lg mb-2 line-clamp-2 hover:text-primary-600 transition-colors">
            {product.name}
          </h3>
        </Link>

        {/* Rating */}
        <div className="flex items-center mb-3">
          <div className="flex items-center text-yellow-400">
            {[...Array(5)].map((_, i) => (
              <span key={i} className={i < Math.round(product.rating) ? '' : 'opacity-30'}>★</span>
            ))}
          </div>
          <span className="ml-2 text-sm text-gray-600">
            {product.rating.toFixed(1)} ({product.review_count})
          </span>
        </div>

        {/* Price */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-2xl font-bold text-primary-600">
            {formatPrice(product.price)}
          </span>
        </div>

        {/* Add to Cart Button */}
        {onAddToCart && (
          <button
            onClick={() => onAddToCart(product.id)}
            disabled={isOutOfStock}
            className="w-full bg-primary-600 text-white py-2 rounded-lg hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {isOutOfStock ? 'Нет в наличии' : 'В корзину'}
          </button>
        )}
      </div>
    </div>
  );
}

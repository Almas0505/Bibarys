/**
 * Wishlist Page (Enhanced)
 */

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { fetchWishlist, removeFromWishlist } from '../store/wishlistSlice';
import { addToCart } from '../store/cartSlice';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ProductGrid from '../components/product/ProductGrid';
import EmptyState from '../components/common/EmptyState';
import Button from '../components/common/Button';
import { useToast } from '../components/common/ToastContainer';

export default function WishlistPage() {
  const dispatch = useAppDispatch();
  const { items: wishlist, isLoading } = useAppSelector((state) => state.wishlist);
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const { showToast } = useToast();
  const [isAddingAll, setIsAddingAll] = useState(false);

  useEffect(() => {
    dispatch(fetchWishlist());
  }, [dispatch]);

  const handleRemoveFromWishlist = async (productId: number) => {
    try {
      await dispatch(removeFromWishlist(productId)).unwrap();
      showToast('info', 'Товар удален из избранного');
    } catch (error) {
      showToast('error', 'Не удалось удалить товар из избранного');
    }
  };

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

  const handleAddAllToCart = async () => {
    if (!isAuthenticated) {
      showToast('warning', 'Пожалуйста, войдите в систему');
      return;
    }

    setIsAddingAll(true);
    let successCount = 0;
    let errorCount = 0;

    for (const product of wishlist) {
      try {
        await dispatch(addToCart({ product_id: product.id, quantity: 1 })).unwrap();
        successCount++;
      } catch (error) {
        errorCount++;
      }
    }

    setIsAddingAll(false);

    if (successCount > 0) {
      showToast('success', `Добавлено в корзину: ${successCount} товаров`);
    }
    if (errorCount > 0) {
      showToast('error', `Не удалось добавить: ${errorCount} товаров`);
    }
  };

  if (isLoading) {
    return <LoadingSpinner text="Загрузка избранного..." />;
  }

  if (wishlist.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <EmptyState
          icon={
            <svg className="w-24 h-24 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          }
          title="Список избранного пуст"
          description="Добавляйте товары в избранное, чтобы не потерять их"
          action={
            <Link to="/shop">
              <Button variant="primary" size="lg">
                Перейти в каталог
              </Button>
            </Link>
          }
        />
      </div>
    );
  }

  const wishlistProductIds = wishlist.map((item) => item.id);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Избранное ({wishlist.length} товаров)</h1>
        <Button
          variant="primary"
          onClick={handleAddAllToCart}
          loading={isAddingAll}
          disabled={wishlist.length === 0}
        >
          Добавить все в корзину
        </Button>
      </div>

      <ProductGrid
        products={wishlist}
        columns={4}
        onAddToCart={handleAddToCart}
        onAddToWishlist={handleRemoveFromWishlist}
        wishlistIds={wishlistProductIds}
      />
    </div>
  );
}

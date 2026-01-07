/**
 * Cart Page (Enhanced with Promo Codes and Better UI)
 */

import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { fetchCart, updateCartItem, removeFromCart, clearCart } from '../store/cartSlice';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import EmptyState from '../components/common/EmptyState';
import Modal from '../components/common/Modal';
import { useToast } from '../components/common/ToastContainer';
import { formatPrice } from '../utils/helpers';
import { PLACEHOLDER_IMAGE } from '../utils/constants';

export default function CartPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { cart, isLoading } = useAppSelector((state) => state.cart);
  const { showToast } = useToast();

  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; discount: number } | null>(null);
  const [promoError, setPromoError] = useState('');
  const [isApplyingPromo, setIsApplyingPromo] = useState(false);
  const [showClearModal, setShowClearModal] = useState(false);

  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch]);

  const handleUpdateQuantity = async (itemId: number, quantity: number) => {
    if (quantity < 1) return;
    try {
      await dispatch(updateCartItem({ itemId, quantity })).unwrap();
    } catch (error) {
      showToast('error', 'Не удалось обновить количество');
    }
  };

  const handleRemove = async (itemId: number) => {
    try {
      await dispatch(removeFromCart(itemId)).unwrap();
      showToast('success', 'Товар удален из корзины');
    } catch (error) {
      showToast('error', 'Не удалось удалить товар');
    }
  };

  const handleClearCart = async () => {
    try {
      await dispatch(clearCart()).unwrap();
      setShowClearModal(false);
      showToast('success', 'Корзина очищена');
    } catch (error) {
      showToast('error', 'Не удалось очистить корзину');
    }
  };

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) {
      setPromoError('Введите промо-код');
      return;
    }

    setIsApplyingPromo(true);
    setPromoError('');

    // Simulate API call - in real app, call API endpoint
    setTimeout(() => {
      // Mock validation - replace with real API call
      const validPromoCodes: Record<string, number> = {
        'SAVE10': 10,
        'SAVE20': 20,
        'WELCOME': 15,
      };

      const discount = validPromoCodes[promoCode.toUpperCase()];

      if (discount) {
        setAppliedPromo({ code: promoCode.toUpperCase(), discount });
        showToast('success', `Промо-код применен! Скидка: ${discount}%`);
        setPromoCode('');
        setPromoError('');
      } else {
        setPromoError('Неверный промо-код');
        showToast('error', 'Неверный промо-код');
      }

      setIsApplyingPromo(false);
    }, 500);
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    showToast('info', 'Промо-код удален');
  };

  const handleCheckout = () => {
    navigate('/checkout');
  };

  if (isLoading) {
    return <LoadingSpinner text="Загрузка корзины..." />;
  }

  if (cart.items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <EmptyState
          icon={
            <svg className="w-24 h-24 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          }
          title="Корзина пуста"
          description="Добавьте товары в корзину, чтобы продолжить покупки"
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

  // Calculate totals
  const subtotal = cart.total_price;
  const shipping = subtotal >= 10000 ? 0 : 500; // Free shipping over 10000
  const discount = appliedPromo ? (subtotal * appliedPromo.discount) / 100 : 0;
  const total = subtotal + shipping - discount;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Корзина ({cart.total_items} товаров)</h1>
        <Button variant="outline" onClick={() => setShowClearModal(true)} className="text-red-600 border-red-600">
          Очистить корзину
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cart.items.map((item: any) => (
            <div key={item.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-6">
                {/* Image */}
                <Link to={`/product/${item.product_id}`} className="flex-shrink-0">
                  <img
                    src={item.product_image || PLACEHOLDER_IMAGE}
                    alt={item.product_name}
                    className="w-24 h-24 object-cover rounded-lg"
                  />
                </Link>

                {/* Info */}
                <div className="flex-grow">
                  <Link
                    to={`/product/${item.product_id}`}
                    className="text-lg font-semibold hover:text-primary-600 block mb-2"
                  >
                    {item.product_name}
                  </Link>
                  <div className="text-xl font-bold text-primary-600">{formatPrice(item.product_price)}</div>
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                    className="w-9 h-9 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                    disabled={item.quantity <= 1}
                  >
                    -
                  </button>
                  <input
                    type="number"
                    aria-label="Количество товара"
                    value={item.quantity}
                    onChange={(e) => handleUpdateQuantity(item.id, Number(e.target.value))}
                    className="w-16 text-center px-2 py-2 border border-gray-300 rounded-lg"
                    min="1"
                  />
                  <button
                    onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                    className="w-9 h-9 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    +
                  </button>
                </div>

                {/* Subtotal */}
                <div className="text-xl font-bold min-w-[120px] text-right">{formatPrice(item.subtotal)}</div>

                {/* Remove */}
                <button
                  onClick={() => handleRemove(item.id)}
                  className="text-red-600 hover:text-red-700 p-2"
                  aria-label="Удалить из корзины"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
            <h2 className="text-2xl font-bold mb-6">Итого</h2>

            {/* Promo Code */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Промо-код</label>
              {appliedPromo ? (
                <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div>
                    <span className="font-semibold text-green-800">{appliedPromo.code}</span>
                    <span className="text-sm text-green-600 ml-2">-{appliedPromo.discount}%</span>
                  </div>
                  <button onClick={handleRemovePromo} className="text-red-600 hover:text-red-700">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Input
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleApplyPromo()}
                    placeholder="Введите код"
                    error={promoError}
                    className="flex-1"
                  />
                  <Button variant="secondary" onClick={handleApplyPromo} loading={isApplyingPromo}>
                    Применить
                  </Button>
                </div>
              )}
            </div>

            <div className="space-y-3 mb-6 pb-6 border-b">
              <div className="flex items-center justify-between text-gray-600">
                <span>Товаров:</span>
                <span>{cart.total_items} шт.</span>
              </div>
              <div className="flex items-center justify-between text-gray-600">
                <span>Сумма:</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              {appliedPromo && (
                <div className="flex items-center justify-between text-green-600">
                  <span>Скидка ({appliedPromo.discount}%):</span>
                  <span>-{formatPrice(discount)}</span>
                </div>
              )}
              <div className="flex items-center justify-between text-gray-600">
                <span>Доставка:</span>
                <span>{shipping === 0 ? 'Бесплатно' : formatPrice(shipping)}</span>
              </div>
              {shipping > 0 && subtotal < 10000 && (
                <p className="text-xs text-gray-500">
                  Бесплатная доставка при заказе от {formatPrice(10000)}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between text-2xl font-bold mb-6">
              <span>К оплате:</span>
              <span className="text-primary-600">{formatPrice(total)}</span>
            </div>

            <Button variant="primary" size="lg" fullWidth onClick={handleCheckout}>
              Оформить заказ
            </Button>

            <Link to="/shop" className="block text-center text-primary-600 hover:underline mt-4">
              Продолжить покупки
            </Link>
          </div>
        </div>
      </div>

      {/* Clear Cart Confirmation Modal */}
      <Modal isOpen={showClearModal} onClose={() => setShowClearModal(false)} title="Очистить корзину?">
        <p className="text-gray-700 mb-6">Вы уверены, что хотите удалить все товары из корзины?</p>
        <div className="flex gap-4 justify-end">
          <Button variant="outline" onClick={() => setShowClearModal(false)}>
            Отмена
          </Button>
          <Button variant="danger" onClick={handleClearCart}>
            Очистить
          </Button>
        </div>
      </Modal>
    </div>
  );
}

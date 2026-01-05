/**
 * Cart Page
 */

import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { fetchCart, updateCartItem, removeFromCart, clearCart } from '../store/cartSlice';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { formatPrice } from '../utils/helpers';
import { PLACEHOLDER_IMAGE } from '../utils/constants';

export default function CartPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { cart, isLoading } = useAppSelector((state) => state.cart);

  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch]);

  const handleUpdateQuantity = async (itemId: number, quantity: number) => {
    if (quantity < 1) return;
    await dispatch(updateCartItem({ itemId, quantity }));
  };

  const handleRemove = async (itemId: number) => {
    if (confirm('Удалить товар из корзины?')) {
      await dispatch(removeFromCart(itemId));
    }
  };

  const handleClearCart = async () => {
    if (confirm('Очистить всю корзину?')) {
      await dispatch(clearCart());
    }
  };

  const handleCheckout = () => {
    navigate('/checkout');
  };

  if (isLoading) {
    return <LoadingSpinner text="Загрузка корзины..." />;
  }

  if (cart.items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">Корзина пуста</h2>
        <p className="text-gray-600 mb-8">Добавьте товары в корзину, чтобы продолжить покупки</p>
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
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Корзина</h1>
        <button
          onClick={handleClearCart}
          className="text-red-600 hover:underline"
        >
          Очистить корзину
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cart.items.map((item: any) => (
            <div key={item.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center space-x-6">
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
                  <div className="text-2xl font-bold text-primary-600">
                    {formatPrice(item.product_price)}
                  </div>
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                    className="w-8 h-8 bg-gray-200 rounded hover:bg-gray-300"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    aria-label="Количество товара"
                    value={item.quantity}
                    onChange={(e) => handleUpdateQuantity(item.id, Number(e.target.value))}
                    className="w-16 text-center px-2 py-1 border border-gray-300 rounded"
                    min="1"
                  />
                  <button
                    onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                    className="w-8 h-8 bg-gray-200 rounded hover:bg-gray-300"
                  >
                    +
                  </button>
                </div>

                {/* Subtotal */}
                <div className="text-xl font-bold">
                  {formatPrice(item.subtotal)}
                </div>

                {/* Remove */}
                <button
                  onClick={() => handleRemove(item.id)}
                  className="text-red-600 hover:text-red-700"
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

            <div className="space-y-4 mb-6">
              <div className="flex items-center justify-between text-gray-600">
                <span>Товаров:</span>
                <span>{cart.total_items} шт.</span>
              </div>
              <div className="flex items-center justify-between text-gray-600">
                <span>Сумма:</span>
                <span>{formatPrice(cart.total_price)}</span>
              </div>
              <div className="border-t pt-4">
                <div className="flex items-center justify-between text-2xl font-bold">
                  <span>К оплате:</span>
                  <span className="text-primary-600">{formatPrice(cart.total_price)}</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              className="w-full bg-primary-600 text-white py-3 rounded-lg text-lg font-semibold hover:bg-primary-700"
            >
              Оформить заказ
            </button>

            <Link
              to="/shop"
              className="block text-center text-primary-600 hover:underline mt-4"
            >
              Продолжить покупки
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Checkout Page
 */

import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { createOrder } from '../store/orderSlice';
import { clearCart } from '../store/cartSlice';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { formatPrice } from '../utils/helpers';
import { DELIVERY_METHODS, PAYMENT_METHODS } from '../utils/constants';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { cart } = useAppSelector((state) => state.cart);
  const { user } = useAppSelector((state) => state.auth);
  const { isLoading } = useAppSelector((state) => state.order);

  const [formData, setFormData] = useState({
    delivery_method: 'standard',
    delivery_address: '',
    phone: user?.phone || '',
    notes: '',
    payment_method: 'card',
  });

  const selectedDelivery = DELIVERY_METHODS.find((m) => m.value === formData.delivery_method);
  const deliveryCost = selectedDelivery?.cost || 0;
  const totalCost = cart.total_price + deliveryCost;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (cart.items.length === 0) {
      alert('Корзина пуста');
      return;
    }

    const result = await dispatch(createOrder(formData));

    if (createOrder.fulfilled.match(result)) {
      await dispatch(clearCart());
      alert('Заказ успешно оформлен!');
      navigate('/orders');
    }
  };

  if (cart.items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">Корзина пуста</h2>
        <p className="text-gray-600 mb-8">Добавьте товары для оформления заказа</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Оформление заказа</h1>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Delivery Method */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-4">Способ доставки</h2>
              <div className="space-y-3">
                {DELIVERY_METHODS.map((method) => (
                  <label
                    key={method.value}
                    className={`flex items-center justify-between p-4 border-2 rounded-lg cursor-pointer ${
                      formData.delivery_method === method.value
                        ? 'border-primary-600 bg-primary-50'
                        : 'border-gray-300'
                    }`}
                  >
                    <div className="flex items-center">
                      <input
                        type="radio"
                        name="delivery_method"
                        value={method.value}
                        checked={formData.delivery_method === method.value}
                        onChange={(e) => setFormData({ ...formData, delivery_method: e.target.value })}
                        className="mr-3"
                      />
                      <div>
                        <div className="font-semibold">{method.label}</div>
                        <div className="text-sm text-gray-600">{method.days}</div>
                      </div>
                    </div>
                    <div className="font-bold">{formatPrice(method.cost)}</div>
                  </label>
                ))}
              </div>
            </div>

            {/* Delivery Address */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-4">Адрес доставки</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Адрес *
                  </label>
                  <textarea
                    value={formData.delivery_address}
                    onChange={(e) => setFormData({ ...formData, delivery_address: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    required
                    placeholder="Улица, дом, квартира"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Телефон *
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    required
                    placeholder="+7 (XXX) XXX-XX-XX"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Комментарий к заказу
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={2}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    placeholder="Дополнительные пожелания"
                  />
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-4">Способ оплаты</h2>
              <div className="space-y-3">
                {PAYMENT_METHODS.map((method) => (
                  <label
                    key={method.value}
                    className={`flex items-center p-4 border-2 rounded-lg cursor-pointer ${
                      formData.payment_method === method.value
                        ? 'border-primary-600 bg-primary-50'
                        : 'border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment_method"
                      value={method.value}
                      checked={formData.payment_method === method.value}
                      onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                      className="mr-3"
                    />
                    <span className="text-2xl mr-3">{method.icon}</span>
                    <span className="font-semibold">{method.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
              <h2 className="text-2xl font-bold mb-6">Ваш заказ</h2>

              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between text-gray-600">
                  <span>Товары ({cart.total_items} шт.):</span>
                  <span>{formatPrice(cart.total_price)}</span>
                </div>
                <div className="flex items-center justify-between text-gray-600">
                  <span>Доставка:</span>
                  <span>{formatPrice(deliveryCost)}</span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex items-center justify-between text-2xl font-bold">
                    <span>Итого:</span>
                    <span className="text-primary-600">{formatPrice(totalCost)}</span>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary-600 text-white py-3 rounded-lg text-lg font-semibold hover:bg-primary-700 disabled:bg-gray-400"
              >
                {isLoading ? <LoadingSpinner size="sm" /> : 'Подтвердить заказ'}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

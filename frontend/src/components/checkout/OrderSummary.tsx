/**
 * Order Summary Component
 */

import { CartItem } from '../../types';
import { formatPrice } from '../../utils/helpers';
import { PLACEHOLDER_IMAGE } from '../../utils/constants';

interface OrderSummaryProps {
  items: CartItem[];
  subtotal: number;
  deliveryCost: number;
  discount?: number;
  total: number;
}

export default function OrderSummary({
  items,
  subtotal,
  deliveryCost,
  discount = 0,
  total,
}: OrderSummaryProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
      <h2 className="text-xl font-bold mb-6">Ваш заказ</h2>

      {/* Items */}
      <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
        {items.map((item) => (
          <div key={item.id} className="flex items-center gap-4">
            <img
              src={item.product_image || PLACEHOLDER_IMAGE}
              alt={item.product_name}
              className="w-16 h-16 object-cover rounded-lg"
            />
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium text-gray-900 truncate">
                {item.product_name}
              </h4>
              <p className="text-sm text-gray-500">
                {item.quantity} × {formatPrice(item.product_price)}
              </p>
            </div>
            <div className="text-sm font-semibold text-gray-900">
              {formatPrice(item.subtotal)}
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="border-t border-gray-200 pt-4 space-y-3">
        <div className="flex items-center justify-between text-gray-600">
          <span>Товары ({items.reduce((sum, item) => sum + item.quantity, 0)} шт.):</span>
          <span>{formatPrice(subtotal)}</span>
        </div>

        <div className="flex items-center justify-between text-gray-600">
          <span>Доставка:</span>
          <span>{deliveryCost === 0 ? 'Бесплатно' : formatPrice(deliveryCost)}</span>
        </div>

        {discount > 0 && (
          <div className="flex items-center justify-between text-green-600">
            <span>Скидка:</span>
            <span>-{formatPrice(discount)}</span>
          </div>
        )}

        <div className="border-t border-gray-200 pt-3">
          <div className="flex items-center justify-between text-xl font-bold">
            <span>Итого:</span>
            <span className="text-primary-600">{formatPrice(total)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

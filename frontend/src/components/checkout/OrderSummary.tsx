import { formatPrice } from '../../utils/helpers';

interface OrderSummaryProps {
  subtotal: number;
  delivery: number;
  total: number;
}

export default function OrderSummary({ subtotal, delivery, total }: OrderSummaryProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-6">Барлығы</h2>
      
      <div className="space-y-3 mb-6">
        <div className="flex items-center justify-between text-gray-600">
          <span>Тауарлар:</span>
          <span>{formatPrice(subtotal)}</span>
        </div>
        <div className="flex items-center justify-between text-gray-600">
          <span>Жеткізу:</span>
          <span>{delivery === 0 ? 'Тегін' : formatPrice(delivery)}</span>
        </div>
        <div className="border-t pt-3">
          <div className="flex items-center justify-between text-2xl font-bold">
            <span>Барлығы:</span>
            <span className="text-primary-600">{formatPrice(total)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

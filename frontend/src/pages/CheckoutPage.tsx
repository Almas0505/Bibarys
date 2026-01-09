import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../hooks/redux';
import CheckoutStepper from '../components/checkout/CheckoutStepper';
import OrderSummary from '../components/checkout/OrderSummary';
import Input from '../components/common/Input';
import Radio from '../components/common/Radio';
import Button from '../components/common/Button';
import { useToast } from '../components/common/ToastContainer';
import { createOrder } from '../store/orderSlice';
import { walletService } from '../services/wallet.service';
import { formatPrice } from '../utils/helpers';
import { 
  isValidEmail, 
  isValidPhone, 
  isValidCardNumber, 
  isValidCardExpiry, 
  isValidCardCVV,
  isValidPostalCode 
} from '../utils/validators';
import { formatCardNumber, formatCardExpiry } from '../utils/formatters';

interface CheckoutFormData {
  // Step 1 - Address
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  saveToProfile: boolean;
  
  // Step 2 - Delivery
  deliveryMethod: 'courier' | 'pickup' | 'mail';
  
  // Step 3 - Payment
  paymentMethod: 'card' | 'cash' | 'wallet';
  cardNumber: string;
  cardExpiry: string;
  cardCVV: string;
  cardHolder: string;
}

export default function CheckoutPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { showToast } = useToast();
  const { cart } = useAppSelector(state => state.cart);
  const { user } = useAppSelector(state => state.auth);
  
  const [currentStep, setCurrentStep] = useState(1);
  const [walletBalance, setWalletBalance] = useState(0);
  const [formData, setFormData] = useState<CheckoutFormData>({
    firstName: user?.first_name || '',
    lastName: user?.last_name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: '',
    city: '',
    postalCode: '',
    saveToProfile: false,
    deliveryMethod: 'courier',
    paymentMethod: 'card',
    cardNumber: '',
    cardExpiry: '',
    cardCVV: '',
    cardHolder: '',
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Load wallet balance when component mounts
  useEffect(() => {
    const loadWalletBalance = async () => {
      try {
        const data = await walletService.getBalance();
        setWalletBalance(data.balance);
      } catch (error) {
        console.error('Error loading wallet balance:', error);
      }
    };
    
    if (user) {
      loadWalletBalance();
    }
  }, [user]);
  
  // Delivery options with prices
  const deliveryOptions = [
    { value: 'courier', label: 'Курьерская доставка', price: 500, days: '1-2 дня' },
    { value: 'pickup', label: 'Самовывоз', price: 0, days: 'Сегодня' },
    { value: 'mail', label: 'Почта России', price: 200, days: '5-7 дней' },
  ];
  
  // Calculate delivery cost
  const deliveryCost = deliveryOptions.find(o => o.value === formData.deliveryMethod)?.price || 0;
  const totalCost = cart.total_price + deliveryCost;
  
  // Validation for Step 1
  const validateStep1 = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'Введите имя';
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Введите фамилию';
    }
    if (!isValidEmail(formData.email)) {
      newErrors.email = 'Неверный email';
    }
    if (!isValidPhone(formData.phone)) {
      newErrors.phone = 'Неверный телефон';
    }
    if (!formData.address.trim()) {
      newErrors.address = 'Введите адрес';
    }
    if (!formData.city.trim()) {
      newErrors.city = 'Введите город';
    }
    if (!isValidPostalCode(formData.postalCode)) {
      newErrors.postalCode = 'Неверный индекс';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Validation for Step 3 (Payment)
  const validateStep3 = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    // Check wallet balance if paying with wallet
    if (formData.paymentMethod === 'wallet') {
      if (walletBalance < totalCost) {
        newErrors.payment = `Недостаточно средств в кошельке`;
        showToast('error', 'Недостаточно средств в кошельке');
        setErrors(newErrors);
        return false;
      }
      return true;
    }
    
    if (formData.paymentMethod !== 'card') {
      return true;
    }
    
    if (!isValidCardNumber(formData.cardNumber)) {
      newErrors.cardNumber = 'Неверный номер карты';
    }
    if (!isValidCardExpiry(formData.cardExpiry)) {
      newErrors.cardExpiry = 'Неверный срок действия';
    }
    if (!isValidCardCVV(formData.cardCVV)) {
      newErrors.cardCVV = 'Неверный CVV';
    }
    if (!formData.cardHolder.trim()) {
      newErrors.cardHolder = 'Введите имя держателя';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle next step
  const handleNext = () => {
    if (currentStep === 1) {
      if (validateStep1()) {
        setCurrentStep(2);
      }
    } else if (currentStep === 2) {
      setCurrentStep(3);
    } else if (currentStep === 3) {
      if (validateStep3()) {
        setCurrentStep(4);
      }
    }
  };
  
  // Handle previous step
  const handlePrev = () => {
    setCurrentStep(prev => Math.max(1, prev - 1));
  };
  
  // Submit order
  const handleSubmitOrder = async () => {
    setIsSubmitting(true);
    
    try {
      const orderData = {
        delivery_method: formData.deliveryMethod,
        delivery_cost: deliveryCost,
        delivery_address: `${formData.address}, ${formData.city}, ${formData.postalCode}`,
        phone: formData.phone,
        notes: '',
        payment_method: formData.paymentMethod,
      };
      
      const result = await dispatch(createOrder(orderData)).unwrap();
      
      showToast('success', `Заказ №${result.id} успешно оформлен!`);
      navigate(`/orders/${result.id}`);
    } catch (error: any) {
      showToast('error', error.message || 'Ошибка при оформлении заказа');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Check if cart is empty
  if (cart.total_items === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold mb-4">Корзина пуста</h2>
        <p className="text-gray-600 mb-6">Добавьте товары в корзину для оформления заказа</p>
        <Button onClick={() => navigate('/shop')}>Перейти в магазин</Button>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Оформление заказа</h1>
      
      {/* Stepper */}
      <CheckoutStepper currentStep={currentStep} />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
        {/* Left - Form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6">
            
            {/* Step 1 - Address */}
            {currentStep === 1 && (
              <div>
                <h2 className="text-2xl font-bold mb-6">Адрес доставки</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Имя *"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    error={errors.firstName}
                  />
                  <Input
                    label="Фамилия *"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    error={errors.lastName}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <Input
                    label="Email *"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    error={errors.email}
                  />
                  <Input
                    label="Телефон *"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    error={errors.phone}
                    placeholder="+7 (XXX) XXX-XX-XX"
                  />
                </div>
                
                <Input
                  label="Адрес *"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  error={errors.address}
                  placeholder="Улица, дом, квартира"
                  className="mt-4"
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <Input
                    label="Город *"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    error={errors.city}
                  />
                  <Input
                    label="Индекс *"
                    value={formData.postalCode}
                    onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                    error={errors.postalCode}
                    placeholder="123456"
                  />
                </div>
                
                <div className="mt-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.saveToProfile}
                      onChange={(e) => setFormData({ ...formData, saveToProfile: e.target.checked })}
                      className="mr-2"
                    />
                    <span className="text-sm">Сохранить адрес в профиле</span>
                  </label>
                </div>
              </div>
            )}
            
            {/* Step 2 - Delivery */}
            {currentStep === 2 && (
              <div>
                <h2 className="text-2xl font-bold mb-6">Способ доставки</h2>
                
                <div className="space-y-4">
                  {deliveryOptions.map((option) => (
                    <div
                      key={option.value}
                      className={`border rounded-lg p-4 cursor-pointer transition ${
                        formData.deliveryMethod === option.value
                          ? 'border-primary-600 bg-primary-50'
                          : 'border-gray-300 hover:border-primary-400'
                      }`}
                      onClick={() => setFormData({ ...formData, deliveryMethod: option.value as any })}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <input
                            type="radio"
                            name="delivery"
                            checked={formData.deliveryMethod === option.value}
                            onChange={() => {}}
                            className="mr-3"
                          />
                          <div>
                            <div className="font-semibold">{option.label}</div>
                            <div className="text-sm text-gray-600">Доставка: {option.days}</div>
                          </div>
                        </div>
                        <div className="font-bold">
                          {option.price === 0 ? 'Бесплатно' : `${option.price} ₽`}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Step 3 - Payment */}
            {currentStep === 3 && (
              <div>
                <h2 className="text-2xl font-bold mb-6">Способ оплаты</h2>
                
                <div className="space-y-4 mb-6">
                  <Radio
                    name="payment"
                    checked={formData.paymentMethod === 'card'}
                    onChange={() => setFormData({ ...formData, paymentMethod: 'card' })}
                    label="Банковская карта"
                  />
                  <Radio
                    name="payment"
                    checked={formData.paymentMethod === 'cash'}
                    onChange={() => setFormData({ ...formData, paymentMethod: 'cash' })}
                    label="Наличные при получении"
                  />
                  <Radio
                    name="payment"
                    checked={formData.paymentMethod === 'wallet'}
                    onChange={() => setFormData({ ...formData, paymentMethod: 'wallet' })}
                    label="Виртуальный кошелек"
                  />
                </div>
                
                {formData.paymentMethod === 'wallet' && (
                  <div className="border-t pt-6">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-700 font-medium">Баланс кошелька:</span>
                        <span className="text-2xl font-bold text-primary-600">
                          {formatPrice(walletBalance)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-700 font-medium">К оплате:</span>
                        <span className="text-xl font-bold">
                          {formatPrice(totalCost)}
                        </span>
                      </div>
                      {walletBalance < totalCost && (
                        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded">
                          <p className="text-red-800 text-sm font-medium">
                            ⚠️ Недостаточно средств
                          </p>
                          <p className="text-red-600 text-xs mt-1">
                            Пополните кошелек на {formatPrice(totalCost - walletBalance)} или выберите другой способ оплаты
                          </p>
                        </div>
                      )}
                      {walletBalance >= totalCost && (
                        <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded">
                          <p className="text-green-800 text-sm font-medium">
                            ✓ Достаточно средств для оплаты
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {formData.paymentMethod === 'card' && (
                  <div className="border-t pt-6">
                    <h3 className="font-semibold mb-4">Данные карты</h3>
                    
                    <Input
                      label="Номер карты *"
                      value={formatCardNumber(formData.cardNumber)}
                      onChange={(e) => setFormData({ ...formData, cardNumber: e.target.value.replace(/\s/g, '') })}
                      error={errors.cardNumber}
                      placeholder="1234 5678 9012 3456"
                      maxLength={19}
                    />
                    
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <Input
                        label="Срок действия *"
                        value={formatCardExpiry(formData.cardExpiry)}
                        onChange={(e) => setFormData({ ...formData, cardExpiry: e.target.value })}
                        error={errors.cardExpiry}
                        placeholder="MM/YY"
                        maxLength={5}
                      />
                      <Input
                        label="CVV *"
                        type="password"
                        value={formData.cardCVV}
                        onChange={(e) => setFormData({ ...formData, cardCVV: e.target.value })}
                        error={errors.cardCVV}
                        placeholder="123"
                        maxLength={3}
                      />
                    </div>
                    
                    <Input
                      label="Имя держателя *"
                      value={formData.cardHolder}
                      onChange={(e) => setFormData({ ...formData, cardHolder: e.target.value.toUpperCase() })}
                      error={errors.cardHolder}
                      placeholder="IVAN IVANOV"
                      className="mt-4"
                    />
                  </div>
                )}
              </div>
            )}
            
            {/* Step 4 - Confirmation */}
            {currentStep === 4 && (
              <div>
                <h2 className="text-2xl font-bold mb-6">Подтверждение заказа</h2>
                
                {/* Order summary */}
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold mb-2">Адрес доставки</h3>
                    <p className="text-gray-600">
                      {formData.firstName} {formData.lastName}<br />
                      {formData.address}, {formData.city}, {formData.postalCode}<br />
                      {formData.phone}<br />
                      {formData.email}
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-2">Способ доставки</h3>
                    <p className="text-gray-600">
                      {deliveryOptions.find(o => o.value === formData.deliveryMethod)?.label}
                      {' - '}
                      {deliveryCost === 0 ? 'Бесплатно' : `${deliveryCost} ₽`}
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-2">Способ оплаты</h3>
                    <p className="text-gray-600">
                      {formData.paymentMethod === 'card' && 'Банковская карта'}
                      {formData.paymentMethod === 'cash' && 'Наличные при получении'}
                      {formData.paymentMethod === 'wallet' && 'Электронный кошелек'}
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-2">Товары ({cart.total_items})</h3>
                    <div className="space-y-2">
                      {cart.items.map((item: any) => (
                        <div key={item.id} className="flex justify-between text-sm">
                          <span>{item.product_name} × {item.quantity}</span>
                          <span>{item.subtotal} ₽</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Navigation buttons */}
            <div className="flex justify-between mt-8">
              {currentStep > 1 && (
                <Button variant="secondary" onClick={handlePrev}>
                  Назад
                </Button>
              )}
              
              {currentStep < 4 ? (
                <Button onClick={handleNext} className="ml-auto">
                  Далее
                </Button>
              ) : (
                <Button
                  onClick={handleSubmitOrder}
                  disabled={isSubmitting}
                  className="ml-auto"
                >
                  {isSubmitting ? 'Оформление...' : 'Оформить заказ'}
                </Button>
              )}
            </div>
          </div>
        </div>
        
        {/* Right - Order Summary (Sticky) */}
        <div className="lg:col-span-1">
          <div className="sticky top-4">
            <OrderSummary
              subtotal={cart.total_price}
              delivery={deliveryCost}
              total={totalCost}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

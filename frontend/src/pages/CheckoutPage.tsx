import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../hooks/redux';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import { createOrder } from '../store/orderSlice';
import { walletService } from '../services/wallet.service';
import { formatPrice } from '../utils/helpers';
import { isValidPhone } from '../utils/validators';

interface CheckoutFormData {
  firstName: string;
  lastName: string;
  phone: string;
  deliveryMethod: 'pickup' | 'delivery';
  address: string;
  city: string;
  paymentMethod: 'cash' | 'wallet';
}

export default function CheckoutPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { cart } = useAppSelector(state => state.cart);
  const { user } = useAppSelector(state => state.auth);
  
  const [currentStep, setCurrentStep] = useState(1);
  const [walletBalance, setWalletBalance] = useState(0);
  const [formData, setFormData] = useState<CheckoutFormData>({
    firstName: user?.first_name || '',
    lastName: user?.last_name || '',
    phone: user?.phone || '',
    deliveryMethod: 'pickup',
    address: '',
    city: '',
    paymentMethod: 'cash',
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Load wallet balance
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
  
  // Delivery cost
  const deliveryCost = formData.deliveryMethod === 'delivery' ? 500 : 0;
  const totalCost = cart.total_price + deliveryCost;
  
  // Validation for Step 1 (Delivery Method)
  const validateStep1 = (): boolean => {
    return true; // No validation needed for delivery selection
  };
  
  // Validation for Step 2 (Address if delivery)
  const validateStep2 = (): boolean => {
    if (formData.deliveryMethod === 'pickup') {
      return true; // Skip address validation for pickup
    }
    
    const newErrors: Record<string, string> = {};
    
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'Введите имя';
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Введите фамилию';
    }
    if (!formData.phone.trim() || !isValidPhone(formData.phone)) {
      newErrors.phone = 'Неверный телефон';
    }
    if (!formData.address.trim()) {
      newErrors.address = 'Введите адрес';
    }
    if (!formData.city.trim()) {
      newErrors.city = 'Введите город';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Validation for Step 3 (Payment)
  const validateStep3 = (): boolean => {
    if (formData.paymentMethod === 'wallet') {
      if (walletBalance < totalCost) {
        alert('Недостаточно средств в кошельке');
        return false;
      }
    }
    
    // For pickup, validate contact info
    if (formData.deliveryMethod === 'pickup') {
      const newErrors: Record<string, string> = {};
      
      if (!formData.firstName.trim()) {
        newErrors.firstName = 'Введите имя';
      }
      if (!formData.lastName.trim()) {
        newErrors.lastName = 'Введите фамилию';
      }
      if (!formData.phone.trim() || !isValidPhone(formData.phone)) {
        newErrors.phone = 'Неверный телефон';
      }
      
      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    }
    
    return true;
  };
  
  // Handle next step
  const handleNext = () => {
    if (currentStep === 1 && validateStep1()) {
      // If pickup selected, skip address and go to payment
      if (formData.deliveryMethod === 'pickup') {
        setCurrentStep(3);
      } else {
        setCurrentStep(2);
      }
    } else if (currentStep === 2 && validateStep2()) {
      setCurrentStep(3);
    } else if (currentStep === 3 && validateStep3()) {
      handleSubmitOrder();
    }
  };
  
  // Handle previous step
  const handlePrev = () => {
    if (currentStep === 3 && formData.deliveryMethod === 'pickup') {
      setCurrentStep(1); // Go back to delivery selection
    } else {
      setCurrentStep(prev => prev - 1);
    }
  };
  
  // Submit order
  const handleSubmitOrder = async () => {
    setIsSubmitting(true);
    
    try {
      const orderData = {
        delivery_method: formData.deliveryMethod,
        delivery_cost: deliveryCost,
        delivery_address: formData.deliveryMethod === 'delivery' 
          ? `${formData.address}, ${formData.city}`
          : 'Самовывоз из магазина',
        phone: formData.phone,
        notes: `${formData.firstName} ${formData.lastName}`,
        payment_method: formData.paymentMethod,
      };
      
      const result = await dispatch(createOrder(orderData)).unwrap();
      
      alert(`Заказ №${result.id} успешно оформлен!`);
      navigate(`/orders/${result.id}`);
    } catch (error: any) {
      alert(error.message || 'Ошибка при оформлении заказа');
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
      
      {/* Steps indicator */}
      <div className="flex items-center justify-center mb-8">
        <div className={`flex items-center ${currentStep >= 1 ? 'text-primary-600' : 'text-gray-400'}`}>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${currentStep >= 1 ? 'border-primary-600 bg-primary-600 text-white' : 'border-gray-300'}`}>
            1
          </div>
          <span className="ml-2 font-medium">Способ получения</span>
        </div>
        
        {formData.deliveryMethod === 'delivery' && (
          <>
            <div className={`mx-4 w-12 h-0.5 ${currentStep >= 2 ? 'bg-primary-600' : 'bg-gray-300'}`}></div>
            <div className={`flex items-center ${currentStep >= 2 ? 'text-primary-600' : 'text-gray-400'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${currentStep >= 2 ? 'border-primary-600 bg-primary-600 text-white' : 'border-gray-300'}`}>
                2
              </div>
              <span className="ml-2 font-medium">Адрес</span>
            </div>
          </>
        )}
        
        <div className={`mx-4 w-12 h-0.5 ${currentStep >= 3 ? 'bg-primary-600' : 'bg-gray-300'}`}></div>
        <div className={`flex items-center ${currentStep >= 3 ? 'text-primary-600' : 'text-gray-400'}`}>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${currentStep >= 3 ? 'border-primary-600 bg-primary-600 text-white' : 'border-gray-300'}`}>
            {formData.deliveryMethod === 'delivery' ? '3' : '2'}
          </div>
          <span className="ml-2 font-medium">Оплата</span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left - Form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6">
            
            {/* Step 1 - Delivery Method */}
            {currentStep === 1 && (
              <div>
                <h2 className="text-2xl font-bold mb-6">Выберите способ получения</h2>
                
                <div className="space-y-4">
                  <div
                    className={`border-2 rounded-lg p-6 cursor-pointer transition ${
                      formData.deliveryMethod === 'pickup'
                        ? 'border-primary-600 bg-primary-50'
                        : 'border-gray-300 hover:border-primary-400'
                    }`}
                    onClick={() => setFormData({ ...formData, deliveryMethod: 'pickup' })}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start">
                        <input
                          type="radio"
                          name="delivery"
                          checked={formData.deliveryMethod === 'pickup'}
                          onChange={() => {}}
                          className="mt-1 mr-4"
                        />
                        <div>
                          <div className="text-xl font-semibold mb-1">🏪 Самовывоз из магазина</div>
                          <div className="text-gray-600 mb-2">Бесплатно, получите в тот же день</div>
                          <div className="text-sm text-gray-500">Адрес магазина: г. Алматы, ул. Абая 150</div>
                        </div>
                      </div>
                      <div className="text-2xl font-bold text-green-600">БЕСПЛАТНО</div>
                    </div>
                  </div>
                  
                  <div
                    className={`border-2 rounded-lg p-6 cursor-pointer transition ${
                      formData.deliveryMethod === 'delivery'
                        ? 'border-primary-600 bg-primary-50'
                        : 'border-gray-300 hover:border-primary-400'
                    }`}
                    onClick={() => setFormData({ ...formData, deliveryMethod: 'delivery' })}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start">
                        <input
                          type="radio"
                          name="delivery"
                          checked={formData.deliveryMethod === 'delivery'}
                          onChange={() => {}}
                          className="mt-1 mr-4"
                        />
                        <div>
                          <div className="text-xl font-semibold mb-1">🚚 Доставка курьером</div>
                          <div className="text-gray-600">Доставим по указанному адресу в течение 1-2 дней</div>
                        </div>
                      </div>
                      <div className="text-2xl font-bold">500₸</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Step 2 - Address (only for delivery) */}
            {currentStep === 2 && formData.deliveryMethod === 'delivery' && (
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
                
                <Input
                  label="Телефон *"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  error={errors.phone}
                  placeholder="+7 (XXX) XXX-XX-XX"
                  className="mt-4"
                />
                
                <Input
                  label="Адрес *"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  error={errors.address}
                  placeholder="Улица, дом, квартира"
                  className="mt-4"
                />
                
                <Input
                  label="Город *"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  error={errors.city}
                  className="mt-4"
                />
              </div>
            )}
            
            {/* Step 3 - Payment */}
            {currentStep === 3 && (
              <div>
                <h2 className="text-2xl font-bold mb-6">Способ оплаты</h2>
                
                {/* Contact info for pickup */}
                {formData.deliveryMethod === 'pickup' && (
                  <div className="mb-6 pb-6 border-b">
                    <h3 className="font-semibold mb-4">Контактные данные</h3>
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
                    <Input
                      label="Телефон *"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      error={errors.phone}
                      placeholder="+7 (XXX) XXX-XX-XX"
                      className="mt-4"
                    />
                  </div>
                )}
                
                <div className="space-y-4">
                  <div
                    className={`border-2 rounded-lg p-4 cursor-pointer transition ${
                      formData.paymentMethod === 'cash'
                        ? 'border-primary-600 bg-primary-50'
                        : 'border-gray-300 hover:border-primary-400'
                    }`}
                    onClick={() => setFormData({ ...formData, paymentMethod: 'cash' })}
                  >
                    <div className="flex items-center">
                      <input
                        type="radio"
                        name="payment"
                        checked={formData.paymentMethod === 'cash'}
                        onChange={() => {}}
                        className="mr-4"
                      />
                      <div>
                        <div className="text-lg font-semibold">💰 Наличные</div>
                        <div className="text-sm text-gray-600">
                          {formData.deliveryMethod === 'pickup' 
                            ? 'Оплата в магазине при получении'
                            : 'Оплата курьеру при получении'
                          }
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div
                    className={`border-2 rounded-lg p-4 cursor-pointer transition ${
                      formData.paymentMethod === 'wallet'
                        ? 'border-primary-600 bg-primary-50'
                        : 'border-gray-300 hover:border-primary-400'
                    }`}
                    onClick={() => setFormData({ ...formData, paymentMethod: 'wallet' })}
                  >
                    <div className="flex items-start">
                      <input
                        type="radio"
                        name="payment"
                        checked={formData.paymentMethod === 'wallet'}
                        onChange={() => {}}
                        className="mt-1 mr-4"
                      />
                      <div className="flex-1">
                        <div className="text-lg font-semibold">💳 Виртуальный кошелек</div>
                        <div className="text-sm text-gray-600 mb-2">Оплата со счета на сайте</div>
                        <div className="bg-white rounded p-3 border">
                          <div className="flex justify-between mb-1">
                            <span className="text-gray-600">Баланс кошелька:</span>
                            <span className="font-bold">{formatPrice(walletBalance)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">К оплате:</span>
                            <span className="font-bold">{formatPrice(totalCost)}</span>
                          </div>
                          {formData.paymentMethod === 'wallet' && walletBalance < totalCost && (
                            <div className="mt-2 space-y-2">
                              <div className="p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                                ⚠️ Недостаточно средств. Нужно еще {formatPrice(totalCost - walletBalance)}
                              </div>
                              <Link
                                to="/wallet"
                                className="block w-full text-center px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 transition text-sm font-semibold"
                              >
                                Пополнить кошелек
                              </Link>
                            </div>
                          )}
                        </div>
                      </div>
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
              
              <Button
                onClick={handleNext}
                disabled={isSubmitting}
                className="ml-auto"
              >
                {currentStep === 3
                  ? (isSubmitting ? 'Оформление...' : 'Оформить заказ')
                  : 'Далее'
                }
              </Button>
            </div>
          </div>
        </div>
        
        {/* Right - Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
            <h3 className="text-xl font-bold mb-4">Ваш заказ</h3>
            
            <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
              {cart.items.map((item: any) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-gray-700">{item.product_name} × {item.quantity}</span>
                  <span className="font-semibold">{formatPrice(item.subtotal)}</span>
                </div>
              ))}
            </div>
            
            <div className="border-t pt-3 space-y-2">
              <div className="flex justify-between text-gray-700">
                <span>Товары:</span>
                <span>{formatPrice(cart.total_price)}</span>
              </div>
              <div className="flex justify-between text-gray-700">
                <span>Доставка:</span>
                <span className={deliveryCost === 0 ? 'text-green-600 font-semibold' : ''}>
                  {deliveryCost === 0 ? 'БЕСПЛАТНО' : formatPrice(deliveryCost)}
                </span>
              </div>
              <div className="border-t pt-3 flex justify-between text-xl font-bold">
                <span>Итого:</span>
                <span className="text-primary-600">{formatPrice(totalCost)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

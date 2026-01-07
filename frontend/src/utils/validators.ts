/**
 * Form Validators
 */

export const validators = {
  email: (value: string): string | null => {
    if (!value) return 'Email обязателен';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) return 'Неверный формат email';
    return null;
  },

  password: (value: string, minLength = 6): string | null => {
    if (!value) return 'Пароль обязателен';
    if (value.length < minLength) return `Минимум ${minLength} символов`;
    return null;
  },

  confirmPassword: (password: string, confirmPassword: string): string | null => {
    if (!confirmPassword) return 'Подтвердите пароль';
    if (password !== confirmPassword) return 'Пароли не совпадают';
    return null;
  },

  phone: (value: string): string | null => {
    if (!value) return null; // Phone is optional
    const phoneRegex = /^\+?[\d\s\-()]+$/;
    if (!phoneRegex.test(value)) return 'Неверный формат телефона';
    if (value.replace(/\D/g, '').length < 10) return 'Слишком короткий номер';
    return null;
  },

  required: (value: string | number | null | undefined): string | null => {
    if (value === null || value === undefined || value === '') {
      return 'Это поле обязательно';
    }
    return null;
  },

  minLength: (value: string, min: number): string | null => {
    if (!value) return null;
    if (value.length < min) return `Минимум ${min} символов`;
    return null;
  },

  maxLength: (value: string, max: number): string | null => {
    if (!value) return null;
    if (value.length > max) return `Максимум ${max} символов`;
    return null;
  },

  min: (value: number, min: number): string | null => {
    if (value < min) return `Минимальное значение ${min}`;
    return null;
  },

  max: (value: number, max: number): string | null => {
    if (value > max) return `Максимальное значение ${max}`;
    return null;
  },

  cardNumber: (value: string): string | null => {
    if (!value) return 'Номер карты обязателен';
    const cleaned = value.replace(/\s/g, '');
    if (!/^\d{16}$/.test(cleaned)) return 'Номер карты должен содержать 16 цифр';
    return null;
  },

  cvv: (value: string): string | null => {
    if (!value) return 'CVV обязателен';
    if (!/^\d{3}$/.test(value)) return 'CVV должен содержать 3 цифры';
    return null;
  },

  expiryDate: (value: string): string | null => {
    if (!value) return 'Срок действия обязателен';
    const regex = /^(0[1-9]|1[0-2])\/\d{2}$/;
    if (!regex.test(value)) return 'Формат: ММ/ГГ';
    
    const [month, year] = value.split('/');
    const expiry = new Date(2000 + parseInt(year), parseInt(month) - 1);
    const now = new Date();
    
    if (expiry < now) return 'Карта просрочена';
    return null;
  },

  postalCode: (value: string): string | null => {
    if (!value) return 'Индекс обязателен';
    if (!/^\d{6}$/.test(value)) return 'Индекс должен содержать 6 цифр';
    return null;
  },

  url: (value: string): string | null => {
    if (!value) return null;
    try {
      new URL(value);
      return null;
    } catch {
      return 'Неверный формат URL';
    }
  },
};

export default validators;

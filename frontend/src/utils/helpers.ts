/**
 * Utility helper functions
 */

/**
 * Format price to display with currency
 */
export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('ru-KZ', {
    style: 'currency',
    currency: 'KZT',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};

/**
 * Format date to readable string
 */
export const formatDate = (dateString: string): string => {
  if (!dateString) return 'Не указано';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'Не указано';
  return new Intl.DateTimeFormat('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
};

/**
 * Format date with time
 */
export const formatDateTime = (dateString: string): string => {
  if (!dateString) return 'Не указано';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'Не указано';
  return new Intl.DateTimeFormat('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

/**
 * Truncate text to specified length
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

/**
 * Get initials from name
 */
export const getInitials = (firstName: string, lastName: string): string => {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
};

/**
 * Calculate discount percentage
 */
export const calculateDiscount = (originalPrice: number, salePrice: number): number => {
  return Math.round(((originalPrice - salePrice) / originalPrice) * 100);
};

/**
 * Check if string is valid email
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Check if string is valid phone number
 */
export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^\+?[\d\s\-()]+$/;
  return phoneRegex.test(phone);
};

/**
 * Debounce function
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: ReturnType<typeof setTimeout>;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

/**
 * Generate random ID
 */
export const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9);
};

/**
 * Sleep function for async operations
 */
export const sleep = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Get image URL or placeholder
 * Converts relative paths to absolute URLs with backend server
 */
export const getImageUrl = (url: string | undefined, placeholder: string = ''): string => {
  if (!url || url.trim() === '') return placeholder;
  
  // If it's already a full URL (http/https), return as is
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  // If it's a relative path starting with /static, prepend backend URL
  if (url.startsWith('/static')) {
    const backendUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';
    // Remove /api/v1 from backend URL to get base URL
    const baseUrl = backendUrl.replace('/api/v1', '');
    return `${baseUrl}${url}`;
  }
  
  return url;
};

/**
 * Calculate cart total
 */
export const calculateCartTotal = (items: Array<{ price: number; quantity: number }>): number => {
  return items.reduce((total, item) => total + item.price * item.quantity, 0);
};

/**
 * Get rating stars array
 */
export const getRatingStars = (rating: number): { filled: number; half: boolean; empty: number } => {
  const filled = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  const empty = 5 - filled - (half ? 1 : 0);
  
  return { filled, half, empty };
};

/**
 * Copy text to clipboard
 */
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Failed to copy:', error);
    return false;
  }
};

/**
 * Download file
 */
export const downloadFile = (url: string, filename: string): void => {
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Formatters for various data types
 */

/**
 * Format date to readable string
 */
export const formatDate = (dateString: string | Date, options?: Intl.DateTimeFormatOptions): string => {
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options,
  };
  
  return date.toLocaleDateString('ru-RU', defaultOptions);
};

/**
 * Format date and time
 */
export const formatDateTime = (dateString: string | Date): string => {
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  
  return date.toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Format relative time (e.g., "2 часа назад")
 */
export const formatRelativeTime = (dateString: string | Date): string => {
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffMins < 1) return 'только что';
  if (diffMins < 60) return `${diffMins} мин. назад`;
  if (diffHours < 24) return `${diffHours} ч. назад`;
  if (diffDays < 7) return `${diffDays} дн. назад`;
  
  return formatDate(date);
};

/**
 * Format phone number
 */
export const formatPhone = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');
  
  if (cleaned.length === 11) {
    return `+${cleaned[0]} (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7, 9)}-${cleaned.slice(9)}`;
  }
  
  return phone;
};

/**
 * Format card number with spaces
 */
export const formatCardNumber = (cardNumber: string): string => {
  const cleaned = cardNumber.replace(/\s/g, '');
  const groups = cleaned.match(/.{1,4}/g);
  return groups ? groups.join(' ') : cleaned;
};

/**
 * Mask card number (show only last 4 digits)
 */
export const maskCardNumber = (cardNumber: string): string => {
  const cleaned = cardNumber.replace(/\s/g, '');
  if (cleaned.length < 4) return cardNumber;
  
  const lastFour = cleaned.slice(-4);
  const masked = '**** **** **** ' + lastFour;
  return masked;
};

/**
 * Format file size
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

/**
 * Truncate text with ellipsis
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

/**
 * Pluralize Russian words
 */
export const pluralize = (count: number, forms: [string, string, string]): string => {
  const cases = [2, 0, 1, 1, 1, 2];
  const index = (count % 100 > 4 && count % 100 < 20) 
    ? 2 
    : cases[Math.min(count % 10, 5)];
  
  return forms[index];
};

/**
 * Format count with word (e.g., "5 товаров")
 */
export const formatCount = (count: number, forms: [string, string, string]): string => {
  return `${count} ${pluralize(count, forms)}`;
};

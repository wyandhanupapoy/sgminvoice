// Utility functions for formatting values

/**
 * Format number to Indonesian Rupiah currency
 */
export const formatRupiah = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

/**
 * Format number with Indonesian thousand separators
 */
export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('id-ID').format(num);
};

/**
 * Parse Indonesian formatted number back to number
 */
export const parseFormattedNumber = (str: string): number => {
  if (!str) return 0;
  // Remove currency symbol, dots as thousand separators, replace comma with dot for decimals
  const cleaned = str.replace(/[Rp\s.]/g, '').replace(',', '.');
  return parseFloat(cleaned) || 0;
};

/**
 * Format date to Indonesian format
 */
export const formatDate = (date: Date | null): string => {
  if (!date) return '-';
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(date);
};

/**
 * Generate transaction number
 * Format: XXX.SGM.PJ.YYYYMMDD (sales) or XXX.SGM.PB.YYYYMMDD (purchase)
 */
export const generateTransactionNumber = (type: 'sales' | 'purchase'): string => {
  const typeCode = type === 'sales' ? 'PJ' : 'PB';
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const sequence = String(Math.floor(Math.random() * 999) + 1).padStart(3, '0');
  return `${sequence}.SGM.${typeCode}.${year}${month}${day}`;
};

/**
 * Validate NPWP format (Indonesian Tax ID)
 */
export const validateNPWP = (npwp: string): boolean => {
  // NPWP format: XX.XXX.XXX.X-XXX.XXX
  const cleanedNpwp = npwp.replace(/[.\-]/g, '');
  return /^\d{15}$/.test(cleanedNpwp);
};

/**
 * Format NPWP with proper separators
 */
export const formatNPWP = (npwp: string): string => {
  const digits = npwp.replace(/\D/g, '').slice(0, 15);
  if (digits.length <= 2) return digits;
  if (digits.length <= 5) return `${digits.slice(0, 2)}.${digits.slice(2)}`;
  if (digits.length <= 8) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5)}`;
  if (digits.length <= 9) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}.${digits.slice(8)}`;
  if (digits.length <= 12) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}.${digits.slice(8, 9)}-${digits.slice(9)}`;
  return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}.${digits.slice(8, 9)}-${digits.slice(9, 12)}.${digits.slice(12)}`;
};

/**
 * Validate phone number (Indonesian format)
 */
export const validatePhone = (phone: string): boolean => {
  const cleanedPhone = phone.replace(/\D/g, '');
  return /^(08|62)\d{8,12}$/.test(cleanedPhone);
};

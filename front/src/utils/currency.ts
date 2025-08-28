// Currency utilities for handling different locales

export interface CurrencyConfig {
  symbol: string;
  name: string;
  position: 'before' | 'after';
  separator: string;
}

export const currencyConfigs: Record<string, CurrencyConfig> = {
  fa: {
    symbol: 'تومان',
    name: 'تومان',
    position: 'after',
    separator: ' ',
  },
  en: {
    symbol: '$',
    name: 'USD',
    position: 'before',
    separator: '',
  },
};

/**
 * Convert Western digits to Persian digits
 */
export const toPersianDigits = (str: string): string => {
  return str.replace(/\d/g, (digit) => '۰۱۲۳۴۵۶۷۸۹'[parseInt(digit)]);
};

/**
 * Convert Persian digits to Western digits
 */
export const toWesternDigits = (str: string): string => {
  return str.replace(/[۰-۹]/g, (digit) => '۰۱۲۳۴۵۶۷۸۹'.indexOf(digit).toString());
};

/**
 * Add thousand separators to a number string
 */
export const addThousandSeparators = (str: string, locale: string = 'en'): string => {
  const separator = locale === 'fa' ? '،' : ',';
  return str.replace(/\B(?=(\d{3})+(?!\d))/g, separator);
};

/**
 * Format price with proper currency symbol and locale-specific formatting
 */
export const formatPrice = (
  price: string | number,
  locale: string = 'en',
  options: {
    showSymbol?: boolean;
    addSeparators?: boolean;
  } = {}
): string => {
  const { showSymbol = true, addSeparators = true } = options;

  const config = currencyConfigs[locale] || currencyConfigs.en;
  let priceStr = typeof price === 'number' ? price.toString() : price;

  // Remove any existing separators
  priceStr = priceStr.replace(/[,،]/g, '');

  // Add thousand separators if requested
  if (addSeparators) {
    priceStr = addThousandSeparators(priceStr, locale);
  }

  // Convert to Persian digits for Persian locale
  if (locale === 'fa') {
    priceStr = toPersianDigits(priceStr);
  }

  // Add currency symbol if requested
  if (showSymbol) {
    if (config.position === 'before') {
      return `${config.symbol}${config.separator}${priceStr}`;
    } else {
      return `${priceStr}${config.separator}${config.symbol}`;
    }
  }

  return priceStr;
};

/**
 * Format price range (e.g., for discounted items)
 */
export const formatPriceRange = (
  originalPrice: string | number,
  currentPrice: string | number,
  locale: string = 'en'
): {
  original: string;
  current: string;
  savings: string;
} => {
  const original = formatPrice(originalPrice, locale);
  const current = formatPrice(currentPrice, locale);

  const originalNum = typeof originalPrice === 'number' ? originalPrice : parseFloat(originalPrice);
  const currentNum = typeof currentPrice === 'number' ? currentPrice : parseFloat(currentPrice);
  const savings = formatPrice(originalNum - currentNum, locale);

  return {
    original,
    current,
    savings,
  };
};

/**
 * Get currency symbol for a locale
 */
export const getCurrencySymbol = (locale: string = 'en'): string => {
  return currencyConfigs[locale]?.symbol || currencyConfigs.en.symbol;
};

/**
 * Get currency name for a locale
 */
export const getCurrencyName = (locale: string = 'en'): string => {
  return currencyConfigs[locale]?.name || currencyConfigs.en.name;
};

/**
 * Format a number for display (without currency symbol)
 */
export const formatNumber = (
  num: string | number,
  locale: string = 'en',
  addSeparators: boolean = true
): string => {
  return formatPrice(num, locale, { showSymbol: false, addSeparators });
};

/**
 * Parse a formatted price string back to a number
 */
export const parsePrice = (priceStr: string, locale: string = 'en'): number => {
  let cleanStr = priceStr;

  // Remove currency symbols
  const config = currencyConfigs[locale] || currencyConfigs.en;
  cleanStr = cleanStr.replace(config.symbol, '');

  // Convert Persian digits to Western if needed
  if (locale === 'fa') {
    cleanStr = toWesternDigits(cleanStr);
  }

  // Remove separators and whitespace
  cleanStr = cleanStr.replace(/[,،\s]/g, '');

  return parseFloat(cleanStr) || 0;
};

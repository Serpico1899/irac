import { Product, Workshop } from '@/types';

// Persian characters regex patterns
const PERSIAN_REGEX = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/g;
const ARABIC_NUMBERS = /[\u06F0-\u06F9]/g;
const PERSIAN_NUMBERS = /[\u06F0-\u06F9]/g;

// Common Persian stop words that should be removed from slugs
const PERSIAN_STOP_WORDS = [
  'در', 'و', 'از', 'به', 'که', 'با', 'این', 'آن', 'را', 'تا', 'برای',
  'یک', 'دو', 'سه', 'چهار', 'پنج', 'شش', 'هفت', 'هشت', 'نه', 'ده'
];

// Common English stop words
const ENGLISH_STOP_WORDS = [
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from',
  'has', 'he', 'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the',
  'to', 'was', 'will', 'with', 'the', 'this', 'but', 'they', 'have',
  'had', 'what', 'said', 'each', 'which', 'she', 'do', 'how', 'their'
];

/**
 * Convert Persian/Arabic numbers to English numbers
 */
export const normalizeNumbers = (text: string): string => {
  const persianNumbers = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  const arabicNumbers = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  const englishNumbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

  let result = text;

  // Convert Persian numbers
  persianNumbers.forEach((persian, index) => {
    result = result.replace(new RegExp(persian, 'g'), englishNumbers[index]);
  });

  // Convert Arabic numbers
  arabicNumbers.forEach((arabic, index) => {
    result = result.replace(new RegExp(arabic, 'g'), englishNumbers[index]);
  });

  return result;
};

/**
 * Remove stop words from text
 */
export const removeStopWords = (text: string, locale: string = 'fa'): string => {
  const stopWords = locale === 'fa' ? PERSIAN_STOP_WORDS : ENGLISH_STOP_WORDS;
  const words = text.split(/\s+/);

  return words
    .filter(word => !stopWords.includes(word.toLowerCase()))
    .join(' ');
};

/**
 * Generate Persian-friendly slug
 */
export const generatePersianSlug = (
  title: string,
  options: {
    maxLength?: number;
    removeStopWords?: boolean;
    preserveNumbers?: boolean;
  } = {}
): string => {
  const {
    maxLength = 100,
    removeStopWords: shouldRemoveStopWords = true,
    preserveNumbers = true,
  } = options;

  if (!title || typeof title !== 'string') return '';

  let slug = title.trim();

  // Normalize numbers
  if (preserveNumbers) {
    slug = normalizeNumbers(slug);
  }

  // Remove stop words
  if (shouldRemoveStopWords) {
    slug = removeStopWords(slug, 'fa');
  }

  // Keep only Persian characters, numbers, and spaces
  slug = slug.replace(/[^\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF\s\d-]/g, '');

  // Replace multiple spaces with single space
  slug = slug.replace(/\s+/g, ' ').trim();

  // Replace spaces with hyphens
  slug = slug.replace(/\s/g, '-');

  // Remove multiple consecutive hyphens
  slug = slug.replace(/-+/g, '-');

  // Remove leading and trailing hyphens
  slug = slug.replace(/^-+|-+$/g, '');

  // Limit length
  if (slug.length > maxLength) {
    slug = slug.substring(0, maxLength).replace(/-[^-]*$/, '');
  }

  return slug.toLowerCase();
};

/**
 * Generate English-friendly slug
 */
export const generateEnglishSlug = (
  title: string,
  options: {
    maxLength?: number;
    removeStopWords?: boolean;
    preserveNumbers?: boolean;
  } = {}
): string => {
  const {
    maxLength = 100,
    removeStopWords: shouldRemoveStopWords = true,
    preserveNumbers = true,
  } = options;

  if (!title || typeof title !== 'string') return '';

  let slug = title.trim().toLowerCase();

  // Remove stop words
  if (shouldRemoveStopWords) {
    slug = removeStopWords(slug, 'en');
  }

  // Replace special characters
  slug = slug
    .replace(/[àáäâèéëêìíïîòóöôùúüûñç]/g, match => {
      const replacements: { [key: string]: string } = {
        'à': 'a', 'á': 'a', 'ä': 'a', 'â': 'a',
        'è': 'e', 'é': 'e', 'ë': 'e', 'ê': 'e',
        'ì': 'i', 'í': 'i', 'ï': 'i', 'î': 'i',
        'ò': 'o', 'ó': 'o', 'ö': 'o', 'ô': 'o',
        'ù': 'u', 'ú': 'u', 'ü': 'u', 'û': 'u',
        'ñ': 'n', 'ç': 'c'
      };
      return replacements[match] || match;
    });

  // Keep only alphanumeric characters, spaces, and hyphens
  if (preserveNumbers) {
    slug = slug.replace(/[^a-z0-9\s-]/g, '');
  } else {
    slug = slug.replace(/[^a-z\s-]/g, '');
  }

  // Replace multiple spaces with single space
  slug = slug.replace(/\s+/g, ' ').trim();

  // Replace spaces with hyphens
  slug = slug.replace(/\s/g, '-');

  // Remove multiple consecutive hyphens
  slug = slug.replace(/-+/g, '-');

  // Remove leading and trailing hyphens
  slug = slug.replace(/^-+|-+$/g, '');

  // Limit length
  if (slug.length > maxLength) {
    slug = slug.substring(0, maxLength).replace(/-[^-]*$/, '');
  }

  return slug;
};

/**
 * Generate slug based on locale
 */
export const generateSlug = (
  title: string,
  locale: string = 'fa',
  options?: {
    maxLength?: number;
    removeStopWords?: boolean;
    preserveNumbers?: boolean;
  }
): string => {
  if (locale === 'fa') {
    return generatePersianSlug(title, options);
  }
  return generateEnglishSlug(title, options);
};

/**
 * Generate unique slug by checking against existing slugs
 */
export const generateUniqueSlug = (
  title: string,
  existingSlugs: string[],
  locale: string = 'fa',
  options?: {
    maxLength?: number;
    removeStopWords?: boolean;
    preserveNumbers?: boolean;
  }
): string => {
  let baseSlug = generateSlug(title, locale, options);
  let uniqueSlug = baseSlug;
  let counter = 1;

  // Keep incrementing counter until we find a unique slug
  while (existingSlugs.includes(uniqueSlug)) {
    uniqueSlug = `${baseSlug}-${counter}`;
    counter++;
  }

  return uniqueSlug;
};

/**
 * Validate if a slug is SEO-friendly
 */
export const validateSlug = (slug: string, locale: string = 'fa'): {
  isValid: boolean;
  errors: string[];
  suggestions: string[];
} => {
  const errors: string[] = [];
  const suggestions: string[] = [];

  if (!slug) {
    errors.push(locale === 'fa' ? 'اسلاگ نمی‌تواند خالی باشد' : 'Slug cannot be empty');
    return { isValid: false, errors, suggestions };
  }

  // Check length
  if (slug.length < 3) {
    errors.push(locale === 'fa' ? 'اسلاگ خیلی کوتاه است' : 'Slug is too short');
    suggestions.push(locale === 'fa' ? 'حداقل 3 کاراکتر استفاده کنید' : 'Use at least 3 characters');
  }

  if (slug.length > 100) {
    errors.push(locale === 'fa' ? 'اسلاگ خیلی طولانی است' : 'Slug is too long');
    suggestions.push(locale === 'fa' ? 'حداکثر 100 کاراکتر استفاده کنید' : 'Use maximum 100 characters');
  }

  // Check for invalid characters
  if (locale === 'fa') {
    if (!/^[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF\d-]+$/.test(slug)) {
      errors.push('اسلاگ شامل کاراکترهای نامعتبر است');
      suggestions.push('فقط از حروف فارسی، اعداد و خط تیره استفاده کنید');
    }
  } else {
    if (!/^[a-z0-9-]+$/.test(slug)) {
      errors.push('Slug contains invalid characters');
      suggestions.push('Use only lowercase letters, numbers, and hyphens');
    }
  }

  // Check for leading/trailing hyphens
  if (slug.startsWith('-') || slug.endsWith('-')) {
    errors.push(locale === 'fa' ? 'اسلاگ نباید با خط تیره شروع یا تمام شود' : 'Slug should not start or end with hyphen');
  }

  // Check for consecutive hyphens
  if (slug.includes('--')) {
    errors.push(locale === 'fa' ? 'اسلاگ نباید خط تیره متوالی داشته باشد' : 'Slug should not contain consecutive hyphens');
  }

  return {
    isValid: errors.length === 0,
    errors,
    suggestions
  };
};

/**
 * Generate SEO-friendly URL structure
 */
export const generateSEOUrl = (
  type: 'course' | 'workshop' | 'article' | 'category' | 'tag',
  slug: string,
  locale: string = 'fa',
  parentSlug?: string
): string => {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://irac.ir';
  const localePrefix = locale === 'fa' ? '' : `/${locale}`;

  const urlPatterns = {
    course: `${baseUrl}${localePrefix}/courses/${slug}`,
    workshop: `${baseUrl}${localePrefix}/workshops/${slug}`,
    article: `${baseUrl}${localePrefix}/articles/${slug}`,
    category: `${baseUrl}${localePrefix}/courses/category/${slug}`,
    tag: `${baseUrl}${localePrefix}/tag/${slug}`,
  };

  if (parentSlug && (type === 'category' || type === 'tag')) {
    return `${urlPatterns[type]}/${parentSlug}`;
  }

  return urlPatterns[type];
};

/**
 * Generate breadcrumb structure from URL
 */
export const generateBreadcrumbs = (
  pathname: string,
  locale: string = 'fa'
): Array<{ name: string; url: string; isLast?: boolean }> => {
  const breadcrumbs: Array<{ name: string; url: string; isLast?: boolean }> = [];
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://irac.ir';
  const localePrefix = locale === 'fa' ? '' : `/${locale}`;

  // Remove locale prefix from pathname for processing
  const cleanPath = pathname.replace(/^\/(?:fa|en)/, '') || '/';
  const segments = cleanPath.split('/').filter(Boolean);

  // Home
  breadcrumbs.push({
    name: locale === 'fa' ? 'خانه' : 'Home',
    url: `${baseUrl}${localePrefix}`,
  });

  // Build breadcrumbs from segments
  let currentPath = localePrefix;
  segments.forEach((segment, index) => {
    currentPath += `/${segment}`;
    const isLast = index === segments.length - 1;

    let name = segment;

    // Translate common segments
    const translations: { [key: string]: { fa: string; en: string } } = {
      courses: { fa: 'دوره‌ها', en: 'Courses' },
      workshops: { fa: 'کارگاه‌ها', en: 'Workshops' },
      articles: { fa: 'مقالات', en: 'Articles' },
      category: { fa: 'دسته‌بندی', en: 'Category' },
      tag: { fa: 'برچسب', en: 'Tag' },
      about: { fa: 'درباره ما', en: 'About Us' },
      contact: { fa: 'تماس با ما', en: 'Contact Us' },
      gallery: { fa: 'گالری', en: 'Gallery' },
      services: { fa: 'خدمات', en: 'Services' },
      search: { fa: 'جستجو', en: 'Search' },
    };

    if (translations[segment]) {
      name = translations[segment][locale as 'fa' | 'en'];
    } else {
      // For slug segments, convert hyphens to spaces and capitalize
      name = segment.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }

    breadcrumbs.push({
      name,
      url: `${baseUrl}${currentPath}`,
      isLast,
    });
  });

  return breadcrumbs;
};

/**
 * Generate alternate URLs for different languages
 */
export const generateAlternateUrls = (
  pathname: string,
  availableLocales: string[] = ['fa', 'en']
): Record<string, string> => {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://irac.ir';
  const alternates: Record<string, string> = {};

  // Remove existing locale prefix
  const cleanPath = pathname.replace(/^\/(?:fa|en)/, '') || '';

  availableLocales.forEach(locale => {
    if (locale === 'fa') {
      alternates[locale] = `${baseUrl}${cleanPath}`;
    } else {
      alternates[locale] = `${baseUrl}/${locale}${cleanPath}`;
    }
  });

  // Add x-default for primary language (Persian)
  alternates['x-default'] = alternates['fa'];

  return alternates;
};

/**
 * Extract slug from full URL
 */
export const extractSlugFromUrl = (url: string): string => {
  try {
    const urlObj = new URL(url);
    const segments = urlObj.pathname.split('/').filter(Boolean);
    return segments[segments.length - 1] || '';
  } catch {
    return '';
  }
};

/**
 * Check if URL matches expected pattern
 */
export const validateUrlPattern = (
  url: string,
  expectedPattern: 'course' | 'workshop' | 'article' | 'category'
): boolean => {
  try {
    const urlObj = new URL(url);
    const path = urlObj.pathname;

    const patterns = {
      course: /^\/(?:fa\/|en\/)?courses\/[\w-]+$/,
      workshop: /^\/(?:fa\/|en\/)?workshops\/[\w-]+$/,
      article: /^\/(?:fa\/|en\/)?articles\/[\w-]+$/,
      category: /^\/(?:fa\/|en\/)?courses\/category\/[\w-]+$/,
    };

    return patterns[expectedPattern].test(path);
  } catch {
    return false;
  }
};

/**
 * Generate product slug from product data
 */
export const generateProductSlug = (
  product: Partial<Product>,
  locale: string = 'fa'
): string => {
  const title = locale === 'fa'
    ? product.title
    : (product.title_en || product.title);

  if (!title) return '';

  let slug = generateSlug(title, locale, {
    maxLength: 80,
    removeStopWords: true,
  });

  // Add category prefix for better SEO if available
  if (product.category) {
    const categorySlug = generateSlug(product.category, locale, { maxLength: 20 });
    slug = `${categorySlug}-${slug}`;
  }

  return slug;
};

/**
 * Generate workshop slug from workshop data
 */
export const generateWorkshopSlug = (
  workshop: Partial<Workshop>,
  locale: string = 'fa'
): string => {
  const title = locale === 'fa'
    ? workshop.title
    : (workshop.title_en || workshop.title);

  if (!title) return '';

  let slug = generateSlug(title, locale, {
    maxLength: 80,
    removeStopWords: true,
  });

  // Add level prefix for workshops
  if (workshop.level) {
    const levelMap: { [key: string]: { fa: string; en: string } } = {
      beginner: { fa: 'مقدماتی', en: 'beginner' },
      intermediate: { fa: 'متوسط', en: 'intermediate' },
      advanced: { fa: 'پیشرفته', en: 'advanced' }
    };

    const levelSlug = levelMap[workshop.level]
      ? generateSlug(levelMap[workshop.level][locale as 'fa' | 'en'], locale, { maxLength: 15 })
      : workshop.level;

    slug = `${levelSlug}-${slug}`;
  }

  return slug;
};

/**
 * Clean and optimize existing slug
 */
export const optimizeSlug = (
  slug: string,
  locale: string = 'fa'
): string => {
  if (!slug) return '';

  // Re-generate the slug to ensure it follows current best practices
  const words = slug.split('-').join(' ');
  return generateSlug(words, locale);
};

export default {
  generateSlug,
  generateUniqueSlug,
  generatePersianSlug,
  generateEnglishSlug,
  validateSlug,
  generateSEOUrl,
  generateBreadcrumbs,
  generateAlternateUrls,
  extractSlugFromUrl,
  validateUrlPattern,
  generateProductSlug,
  generateWorkshopSlug,
  optimizeSlug,
  normalizeNumbers,
  removeStopWords,
};

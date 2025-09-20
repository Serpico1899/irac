// SEO Library - Comprehensive SEO optimization utilities for IRAC
// This file exports all SEO utilities and provides a unified interface

// Schema markup exports
export {
  getOrganizationSchema,
  getCourseSchema,
  getWorkshopSchema,
  getArticleSchema,
  getReviewSchema,
  getProductSchema,
  getBookSchema,
  getBreadcrumbSchema,
  getWebsiteSchema,
  getFAQSchema,
  getLocalBusinessSchema,
  injectSchemaMarkup,
} from './schema';

// Metadata exports
export {
  truncateText,
  generatePersianSlug,
  generateEnglishSlug,
  generateSlug,
  generateKeywords,
  getDefaultMetadata,
  getCourseMetadata,
  getWorkshopMetadata,
  getArticleMetadata,
  getCategoryMetadata,
  getSearchMetadata,
  getStaticPageMetadata,
  optimizeMetaDescription,
  generateAlternateUrls,
  validateSEOUrl,
} from './metadata';

// Performance exports
export {
  IMAGE_QUALITY,
  IMAGE_SIZES,
  generateImageSizes,
  optimizeImageProps,
  generateBlurDataURL,
  createLazyLoadObserver,
  progressiveImageLoad,
  inlineCriticalCSS,
  preloadResource,
  prefetchResource,
  dnsPrefetch,
  measurePerformance,
  trackWebVitals,
  getOptimalImageFormat,
  registerServiceWorker,
  loadCriticalFonts,
  loadThirdPartyScript,
  dynamicImport,
  addResourceHints,
  compressImage,
  debounce,
  throttle,
  monitorMemoryUsage,
  initializePerformanceOptimizations,
} from './performance';

// Slug generation exports
export {
  generateUniqueSlug,
  validateSlug,
  generateSEOUrl,
  generateBreadcrumbs,
  extractSlugFromUrl,
  validateUrlPattern,
  generateProductSlug,
  generateWorkshopSlug,
  optimizeSlug,
  normalizeNumbers,
  removeStopWords,
} from './slugs';

import { Metadata } from 'next';
import { Product, Workshop } from '@/types';
import * as schema from './schema';
import * as metadata from './metadata';
import * as performance from './performance';
import * as slugs from './slugs';

// Main SEO Service Interface
export interface SEOConfig {
  baseUrl?: string;
  siteName?: {
    fa: string;
    en: string;
  };
  defaultLocale?: string;
  supportedLocales?: string[];
  organization?: {
    name: string;
    logo: string;
    socialMedia: string[];
  };
}

// SEO Service Class
export class SEOService {
  private config: Required<SEOConfig>;

  constructor(config: Partial<SEOConfig> = {}) {
    this.config = {
      baseUrl: config.baseUrl || process.env.NEXT_PUBLIC_BASE_URL || 'https://irac.ir',
      siteName: config.siteName || {
        fa: 'مرکز معماری ایراک',
        en: 'Iranian Architecture Center'
      },
      defaultLocale: config.defaultLocale || 'fa',
      supportedLocales: config.supportedLocales || ['fa', 'en'],
      organization: config.organization || {
        name: 'Iranian Architecture Center',
        logo: '/logo.png',
        socialMedia: [
          'https://instagram.com/irac_center',
          'https://linkedin.com/company/irac-center',
          'https://twitter.com/irac_center',
          'https://facebook.com/irac.center'
        ]
      }
    };
  }

  // Generate comprehensive metadata for a course/product
  generateCoursePageSEO(product: Product, locale: string = 'fa'): {
    metadata: Metadata;
    schemas: any[];
    breadcrumbs: Array<{ name: string; url: string }>;
  } {
    const courseMetadata = metadata.getCourseMetadata(product, locale);
    const courseSchema = schema.getCourseSchema(product, locale);
    const organizationSchema = schema.getOrganizationSchema(locale);
    const websiteSchema = schema.getWebsiteSchema(locale);

    // Generate breadcrumbs
    const breadcrumbs = [
      {
        name: locale === 'fa' ? 'خانه' : 'Home',
        url: locale === 'fa' ? this.config.baseUrl : `${this.config.baseUrl}/${locale}`
      },
      {
        name: locale === 'fa' ? 'دوره‌ها' : 'Courses',
        url: locale === 'fa' ? `${this.config.baseUrl}/courses` : `${this.config.baseUrl}/${locale}/courses`
      },
      {
        name: locale === 'fa' ? product.title : (product.title_en || product.title),
        url: locale === 'fa' ? `${this.config.baseUrl}/courses/${product.slug}` : `${this.config.baseUrl}/${locale}/courses/${product.slug}`
      }
    ];

    const breadcrumbSchema = schema.getBreadcrumbSchema(breadcrumbs);

    return {
      metadata: courseMetadata,
      schemas: [websiteSchema, organizationSchema, courseSchema, breadcrumbSchema],
      breadcrumbs
    };
  }

  // Generate comprehensive metadata for a workshop
  generateWorkshopPageSEO(workshop: Workshop, locale: string = 'fa'): {
    metadata: Metadata;
    schemas: any[];
    breadcrumbs: Array<{ name: string; url: string }>;
  } {
    const workshopMetadata = metadata.getWorkshopMetadata(workshop, locale);
    const workshopSchema = schema.getWorkshopSchema(workshop, locale);
    const organizationSchema = schema.getOrganizationSchema(locale);
    const websiteSchema = schema.getWebsiteSchema(locale);

    // Generate breadcrumbs
    const breadcrumbs = [
      {
        name: locale === 'fa' ? 'خانه' : 'Home',
        url: locale === 'fa' ? this.config.baseUrl : `${this.config.baseUrl}/${locale}`
      },
      {
        name: locale === 'fa' ? 'کارگاه‌ها' : 'Workshops',
        url: locale === 'fa' ? `${this.config.baseUrl}/workshops` : `${this.config.baseUrl}/${locale}/workshops`
      },
      {
        name: locale === 'fa' ? workshop.title : (workshop.title_en || workshop.title),
        url: locale === 'fa' ? `${this.config.baseUrl}/workshops/${workshop.slug}` : `${this.config.baseUrl}/${locale}/workshops/${workshop.slug}`
      }
    ];

    const breadcrumbSchema = schema.getBreadcrumbSchema(breadcrumbs);

    return {
      metadata: workshopMetadata,
      schemas: [websiteSchema, organizationSchema, workshopSchema, breadcrumbSchema],
      breadcrumbs
    };
  }

  // Generate comprehensive metadata for an article
  generateArticlePageSEO(article: any, locale: string = 'fa'): {
    metadata: Metadata;
    schemas: any[];
    breadcrumbs: Array<{ name: string; url: string }>;
  } {
    const articleMetadata = metadata.getArticleMetadata(article, locale);
    const articleSchema = schema.getArticleSchema(article, locale);
    const organizationSchema = schema.getOrganizationSchema(locale);
    const websiteSchema = schema.getWebsiteSchema(locale);

    // Generate breadcrumbs
    const breadcrumbs = [
      {
        name: locale === 'fa' ? 'خانه' : 'Home',
        url: locale === 'fa' ? this.config.baseUrl : `${this.config.baseUrl}/${locale}`
      },
      {
        name: locale === 'fa' ? 'مقالات' : 'Articles',
        url: locale === 'fa' ? `${this.config.baseUrl}/articles` : `${this.config.baseUrl}/${locale}/articles`
      },
      {
        name: locale === 'fa' ? article.title : (article.title_en || article.title),
        url: locale === 'fa' ? `${this.config.baseUrl}/articles/${article.slug}` : `${this.config.baseUrl}/${locale}/articles/${article.slug}`
      }
    ];

    const breadcrumbSchema = schema.getBreadcrumbSchema(breadcrumbs);

    return {
      metadata: articleMetadata,
      schemas: [websiteSchema, organizationSchema, articleSchema, breadcrumbSchema],
      breadcrumbs
    };
  }

  // Generate category page SEO
  generateCategoryPageSEO(
    category: string,
    categoryName: string,
    locale: string = 'fa'
  ): {
    metadata: Metadata;
    schemas: any[];
    breadcrumbs: Array<{ name: string; url: string }>;
  } {
    const categoryMetadata = metadata.getCategoryMetadata(category, categoryName, locale);
    const organizationSchema = schema.getOrganizationSchema(locale);
    const websiteSchema = schema.getWebsiteSchema(locale);

    // Generate breadcrumbs
    const breadcrumbs = [
      {
        name: locale === 'fa' ? 'خانه' : 'Home',
        url: locale === 'fa' ? this.config.baseUrl : `${this.config.baseUrl}/${locale}`
      },
      {
        name: locale === 'fa' ? 'دوره‌ها' : 'Courses',
        url: locale === 'fa' ? `${this.config.baseUrl}/courses` : `${this.config.baseUrl}/${locale}/courses`
      },
      {
        name: categoryName,
        url: locale === 'fa' ? `${this.config.baseUrl}/courses/category/${category}` : `${this.config.baseUrl}/${locale}/courses/category/${category}`
      }
    ];

    const breadcrumbSchema = schema.getBreadcrumbSchema(breadcrumbs);

    return {
      metadata: categoryMetadata,
      schemas: [websiteSchema, organizationSchema, breadcrumbSchema],
      breadcrumbs
    };
  }

  // Generate slug for any content type
  generateContentSlug(
    title: string,
    type: 'product' | 'workshop' | 'article' | 'category',
    locale: string = 'fa',
    additionalData?: any
  ): string {
    switch (type) {
      case 'product':
        return slugs.generateProductSlug({ title, ...additionalData }, locale);
      case 'workshop':
        return slugs.generateWorkshopSlug({ title, ...additionalData }, locale);
      default:
        return slugs.generateSlug(title, locale, {
          maxLength: 80,
          removeStopWords: true,
        });
    }
  }

  // Validate and optimize existing slug
  optimizeSlug(slug: string, locale: string = 'fa'): {
    optimizedSlug: string;
    validation: {
      isValid: boolean;
      errors: string[];
      suggestions: string[];
    };
  } {
    const validation = slugs.validateSlug(slug, locale);
    const optimizedSlug = validation.isValid ? slug : slugs.optimizeSlug(slug, locale);

    return {
      optimizedSlug,
      validation
    };
  }

  // Generate complete URL structure
  generateURLStructure(
    type: 'course' | 'workshop' | 'article' | 'category',
    slug: string,
    locale: string = 'fa'
  ): {
    url: string;
    alternateUrls: Record<string, string>;
    canonical: string;
  } {
    const url = slugs.generateSEOUrl(type, slug, locale);
    const path = new URL(url).pathname;
    const alternateUrls = slugs.generateAlternateUrls(path, this.config.supportedLocales);
    const canonical = alternateUrls[this.config.defaultLocale];

    return {
      url,
      alternateUrls,
      canonical
    };
  }

  // Initialize performance optimizations
  initializePerformance(): void {
    performance.initializePerformanceOptimizations();
  }

  // Preload critical resources for a page type
  preloadCriticalResources(pageType: 'home' | 'course' | 'workshop' | 'article'): void {
    // Common critical resources
    performance.loadCriticalFonts([
      '/fonts/woff2/Vazirmatn-Regular.woff2',
      '/fonts/woff2/Vazirmatn-Bold.woff2',
    ]);

    // Page-specific preloading
    switch (pageType) {
      case 'home':
        performance.preloadResource('/images/hero-bg.jpg', 'image');
        performance.preloadResource('/images/logo.svg', 'image');
        break;
      case 'course':
        performance.prefetchResource('/api/courses');
        break;
      case 'workshop':
        performance.prefetchResource('/api/workshops');
        break;
      case 'article':
        performance.prefetchResource('/api/articles');
        break;
    }
  }

  // Generate optimized image props
  optimizeImage(
    src: string,
    alt: string,
    size: keyof typeof performance.IMAGE_SIZES = 'medium',
    quality: keyof typeof performance.IMAGE_QUALITY = 'medium'
  ) {
    return performance.optimizeImageProps(src, alt, size, quality);
  }

  // Inject schema markup into page
  injectPageSchemas(schemas: any[]): void {
    schema.injectSchemaMarkup(schemas);
  }

  // Generate hreflang tags
  generateHreflangTags(currentPath: string): Record<string, string> {
    return slugs.generateAlternateUrls(currentPath, this.config.supportedLocales);
  }

  // Generate sitemap entries for content
  generateSitemapEntry(
    type: 'course' | 'workshop' | 'article',
    content: Product | Workshop | any,
    locale: string = 'fa'
  ): {
    url: string;
    lastModified: Date;
    changeFrequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
    priority: number;
  } {
    const baseUrl = this.config.baseUrl;
    const localePrefix = locale === 'fa' ? '' : `/${locale}`;

    const typeMap = {
      course: 'courses',
      workshop: 'workshops',
      article: 'articles'
    };

    const url = `${baseUrl}${localePrefix}/${typeMap[type]}/${content.slug}`;
    const lastModified = new Date(content.updated_at || content.created_at);

    const changeFrequency: Record<string, 'daily' | 'weekly' | 'monthly' | 'yearly'> = {
      course: 'weekly',
      workshop: 'weekly',
      article: 'monthly'
    };

    const priority: Record<string, number> = {
      course: content.is_featured ? 0.9 : 0.8,
      workshop: 0.8,
      article: 0.7
    };

    return {
      url,
      lastModified,
      changeFrequency: changeFrequency[type],
      priority: priority[type]
    };
  }
}

// Create default SEO service instance
export const seoService = new SEOService();

// Utility functions for quick access
export const generateSlugQuick = (title: string, locale: string = 'fa') =>
  slugs.generateSlug(title, locale);

export const validateSlugQuick = (slug: string, locale: string = 'fa') =>
  slugs.validateSlug(slug, locale);

export const optimizeImageQuick = (src: string, alt: string) =>
  performance.optimizeImageProps(src, alt);

export const generateBreadcrumbsQuick = (pathname: string, locale: string = 'fa') =>
  slugs.generateBreadcrumbs(pathname, locale);

// Export default service
export default seoService;

// Re-export types
export type { SEOConfig };

'use client';

import React, { useEffect } from 'react';
import Head from 'next/head';
import { useLocale } from 'next-intl';
import { Product, Workshop } from '@/types';
import {
  getCourseSchema,
  getWorkshopSchema,
  getArticleSchema,
  getProductSchema,
  getBookSchema,
  getBreadcrumbSchema,
  getWebsiteSchema,
  getFAQSchema,
  getLocalBusinessSchema,
  getOrganizationSchema,
  injectSchemaMarkup,
} from '@/lib/seo/schema';

export interface SEOHeadProps {
  // Basic SEO props
  title?: string;
  description?: string;
  keywords?: string[];
  canonical?: string;
  noindex?: boolean;
  nofollow?: boolean;

  // Open Graph props
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogImageAlt?: string;
  ogType?: 'website' | 'article' | 'product' | 'book';
  ogUrl?: string;

  // Twitter props
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  twitterCard?: 'summary' | 'summary_large_image' | 'app' | 'player';

  // Content-specific props
  product?: Product;
  workshop?: Workshop;
  article?: any;
  breadcrumbs?: Array<{ name: string; url: string }>;
  faqs?: Array<{ question: string; answer: string }>;

  // Schema type
  schemaType?: 'course' | 'product' | 'book' | 'workshop' | 'article' | 'website' | 'faq' | 'organization' | 'local-business';

  // Additional meta props
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  section?: string;
  tags?: string[];

  // Language and localization
  hreflang?: Record<string, string>;
  locale?: string;

  // Custom JSON-LD schema
  customSchema?: any[];
}

const SEOHead: React.FC<SEOHeadProps> = ({
  title,
  description,
  keywords = [],
  canonical,
  noindex = false,
  nofollow = false,
  ogTitle,
  ogDescription,
  ogImage,
  ogImageAlt,
  ogType = 'website',
  ogUrl,
  twitterTitle,
  twitterDescription,
  twitterImage,
  twitterCard = 'summary_large_image',
  product,
  workshop,
  article,
  breadcrumbs,
  faqs,
  schemaType,
  author,
  publishedTime,
  modifiedTime,
  section,
  tags = [],
  hreflang,
  locale: propLocale,
  customSchema = [],
}) => {
  const currentLocale = useLocale();
  const locale = propLocale || currentLocale;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://irac.ir';

  // Generate schema markup based on content type
  const generateSchemaMarkup = (): any[] => {
    const schemas: any[] = [];

    // Add base website schema
    schemas.push(getWebsiteSchema(locale));

    // Add organization schema
    schemas.push(getOrganizationSchema(locale));

    // Add content-specific schemas
    if (schemaType === 'course' && product) {
      schemas.push(getCourseSchema(product, locale));
    } else if (schemaType === 'product' && product) {
      schemas.push(getProductSchema(product, locale));
    } else if (schemaType === 'book' && product) {
      schemas.push(getBookSchema(product, locale));
    } else if (schemaType === 'workshop' && workshop) {
      schemas.push(getWorkshopSchema(workshop, locale));
    } else if (schemaType === 'article' && article) {
      schemas.push(getArticleSchema(article, locale));
    } else if (schemaType === 'faq' && faqs) {
      schemas.push(getFAQSchema(faqs));
    } else if (schemaType === 'local-business') {
      schemas.push(getLocalBusinessSchema(locale));
    }

    // Add breadcrumb schema
    if (breadcrumbs && breadcrumbs.length > 0) {
      schemas.push(getBreadcrumbSchema(breadcrumbs));
    }

    // Add custom schemas
    schemas.push(...customSchema);

    return schemas;
  };

  // Inject schema markup into document head
  useEffect(() => {
    const schemas = generateSchemaMarkup();
    if (schemas.length > 0) {
      injectSchemaMarkup(schemas);
    }

    // Cleanup function to remove schema markup on unmount
    return () => {
      schemas.forEach((_, index) => {
        const scriptId = `schema-markup-${index}`;
        const existingScript = document.getElementById(scriptId);
        if (existingScript) {
          existingScript.remove();
        }
      });
    };
  }, [schemaType, product, workshop, article, breadcrumbs, faqs, customSchema, locale]);

  // Generate meta title
  const metaTitle = title ||
    (locale === 'fa' ? 'مرکز معماری ایراک' : 'Iranian Architecture Center');

  // Generate meta description
  const metaDescription = description ||
    (locale === 'fa'
      ? 'مرکز معماری ایراک ارائه دهنده دوره‌های آموزشی معماری، کارگاه‌های تخصصی و خدمات معماری'
      : 'Iranian Architecture Center offers architecture education courses, specialized workshops, and professional architecture services');

  // Generate meta keywords
  const metaKeywords = keywords.length > 0
    ? keywords.join(', ')
    : locale === 'fa'
      ? 'معماری، آموزش، ایراک، دوره، کارگاه'
      : 'architecture, education, IRAC, course, workshop';

  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{metaTitle}</title>
      <meta name="description" content={metaDescription} />
      <meta name="keywords" content={metaKeywords} />

      {/* Robots */}
      <meta
        name="robots"
        content={`${noindex ? 'noindex' : 'index'},${nofollow ? 'nofollow' : 'follow'}`}
      />

      {/* Canonical URL */}
      {canonical && <link rel="canonical" href={canonical} />}

      {/* Author */}
      {author && <meta name="author" content={author} />}

      {/* Language and Locale */}
      <meta httpEquiv="content-language" content={locale} />
      <meta property="locale" content={locale === 'fa' ? 'fa_IR' : 'en_US'} />

      {/* Hreflang Tags */}
      {hreflang && Object.entries(hreflang).map(([lang, url]) => (
        <link key={lang} rel="alternate" hrefLang={lang} href={url} />
      ))}

      {/* Open Graph Tags */}
      <meta property="og:title" content={ogTitle || metaTitle} />
      <meta property="og:description" content={ogDescription || metaDescription} />
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={ogUrl || canonical} />
      <meta property="og:site_name" content={locale === 'fa' ? 'مرکز معماری ایراک' : 'Iranian Architecture Center'} />
      <meta property="og:locale" content={locale === 'fa' ? 'fa_IR' : 'en_US'} />

      {ogImage && (
        <>
          <meta property="og:image" content={ogImage} />
          <meta property="og:image:alt" content={ogImageAlt || metaTitle} />
          <meta property="og:image:width" content="1200" />
          <meta property="og:image:height" content="630" />
        </>
      )}

      {/* Article-specific Open Graph */}
      {ogType === 'article' && (
        <>
          {publishedTime && <meta property="article:published_time" content={publishedTime} />}
          {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}
          {author && <meta property="article:author" content={author} />}
          {section && <meta property="article:section" content={section} />}
          {tags.map((tag, index) => (
            <meta key={index} property="article:tag" content={tag} />
          ))}
        </>
      )}

      {/* Product-specific Open Graph */}
      {(ogType === 'product' || schemaType === 'product') && product && (
        <>
          <meta property="product:price:amount" content={(product.discounted_price || product.price).toString()} />
          <meta property="product:price:currency" content="IRR" />
          <meta property="product:availability" content={product.stock_quantity && product.stock_quantity > 0 ? 'in stock' : 'out of stock'} />
        </>
      )}

      {/* Twitter Card Tags */}
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:title" content={twitterTitle || metaTitle} />
      <meta name="twitter:description" content={twitterDescription || metaDescription} />
      {twitterImage && <meta name="twitter:image" content={twitterImage} />}
      <meta name="twitter:site" content="@irac_center" />
      <meta name="twitter:creator" content="@irac_center" />

      {/* Additional Meta Tags for SEO */}
      <meta name="format-detection" content="telephone=no" />
      <meta name="format-detection" content="address=no" />
      <meta name="format-detection" content="email=no" />

      {/* Favicon and App Icons */}
      <link rel="icon" href="/favicon.ico" />
      <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
      <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
      <link rel="manifest" href="/site.webmanifest" />

      {/* Theme Color */}
      <meta name="theme-color" content="#168c95" />
      <meta name="msapplication-TileColor" content="#168c95" />

      {/* Preconnect to External Domains */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link rel="preconnect" href="https://images.unsplash.com" />

      {/* DNS Prefetch */}
      <link rel="dns-prefetch" href="//fonts.googleapis.com" />
      <link rel="dns-prefetch" href="//fonts.gstatic.com" />
      <link rel="dns-prefetch" href="//images.unsplash.com" />

      {/* Viewport */}
      <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />

      {/* Security Headers */}
      <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
      <meta httpEquiv="X-Frame-Options" content="SAMEORIGIN" />
      <meta httpEquiv="X-XSS-Protection" content="1; mode=block" />

      {/* Geo Meta Tags for Local SEO */}
      <meta name="geo.region" content="IR-07" />
      <meta name="geo.placename" content="Tehran" />
      <meta name="geo.position" content="35.6892;51.3890" />
      <meta name="ICBM" content="35.6892, 51.3890" />
    </Head>
  );
};

export default SEOHead;

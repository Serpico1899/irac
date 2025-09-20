import { Metadata } from "next";
import { Product, Workshop } from "@/types";

// Helper function to get base URL
const getBaseUrl = (): string => {
  return process.env.NEXT_PUBLIC_BASE_URL || "https://irac.ir";
};

// Helper function to truncate text for SEO
export const truncateText = (text: string, maxLength: number = 160): string => {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3).trim() + "...";
};

// Persian slug generation
export const generatePersianSlug = (title: string): string => {
  if (!title) return "";

  return title
    .replace(
      /[^\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF\s\d]/g,
      "",
    ) // Keep Persian, Arabic, and numbers
    .trim()
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens with single
    .replace(/^-|-$/g, ""); // Remove leading/trailing hyphens
};

// English slug generation
export const generateEnglishSlug = (title: string): string => {
  if (!title) return "";

  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "") // Keep only alphanumeric, spaces, and hyphens
    .trim()
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens with single
    .replace(/^-|-$/g, ""); // Remove leading/trailing hyphens
};

// Generate slug based on locale
export const generateSlug = (title: string, locale: string = "fa"): string => {
  if (locale === "fa") {
    return generatePersianSlug(title);
  }
  return generateEnglishSlug(title);
};

// Generate keywords array from text
export const generateKeywords = (
  title: string,
  description: string,
  tags: string[] = [],
  locale: string = "fa",
): string[] => {
  const baseKeywords =
    locale === "fa"
      ? ["معماری", "آموزش", "ایراک", "دوره", "کارگاه"]
      : ["architecture", "education", "IRAC", "course", "workshop"];

  const titleWords = title.split(/\s+/).filter((word) => word.length > 2);
  const descWords = description
    .split(/\s+/)
    .filter((word) => word.length > 3)
    .slice(0, 5);

  return [...new Set([...baseKeywords, ...titleWords, ...descWords, ...tags])];
};

// Default metadata for the site
export const getDefaultMetadata = (locale: string = "fa"): Metadata => {
  const baseUrl = getBaseUrl();
  const localePrefix = locale === "fa" ? "" : `/${locale}`;

  const title =
    locale === "fa"
      ? "مرکز معماری ایراک - آموزش، پژوهش و خدمات معماری"
      : "Iranian Architecture Center - Education, Research & Architecture Services";

  const description =
    locale === "fa"
      ? "مرکز معماری ایراک ارائه دهنده دوره‌های آموزشی معماری، کارگاه‌های تخصصی، فضای کار اشتراکی و خدمات معماری است."
      : "Iranian Architecture Center offers architecture education courses, specialized workshops, coworking spaces, and professional architecture services.";

  return {
    title: {
      default: title,
      template:
        locale === "fa"
          ? "%s | مرکز معماری ایراک"
          : "%s | Iranian Architecture Center",
    },
    description,
    keywords: generateKeywords(title, description, [], locale),
    authors: [{ name: "IRAC Team" }],
    creator: "Iranian Architecture Center",
    publisher: "Iranian Architecture Center",
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    metadataBase: new URL(baseUrl),
    alternates: {
      canonical: `${baseUrl}${localePrefix}`,
      languages: {
        fa: `${baseUrl}`,
        en: `${baseUrl}/en`,
      },
    },
    openGraph: {
      type: "website",
      locale: locale === "fa" ? "fa_IR" : "en_US",
      url: `${baseUrl}${localePrefix}`,
      title,
      description,
      siteName:
        locale === "fa" ? "مرکز معماری ایراک" : "Iranian Architecture Center",
      images: [
        {
          url: `${baseUrl}/og-image.jpg`,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`${baseUrl}/og-image.jpg`],
      creator: "@irac_center",
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
};

// Course/Product metadata generation
export const getCourseMetadata = (
  product: Product,
  locale: string = "fa",
): Metadata => {
  const baseUrl = getBaseUrl();
  const localePrefix = locale === "fa" ? "" : `/${locale}`;

  const title =
    locale === "fa" ? product.title : product.title_en || product.title;
  const description = truncateText(
    locale === "fa"
      ? product.description
      : product.description_en || product.description,
  );

  const keywords = generateKeywords(title, description, product.tags, locale);

  return {
    title,
    description,
    keywords,
    authors: product.author
      ? [{ name: product.author }]
      : [{ name: "IRAC Team" }],
    openGraph: {
      title,
      description,
      url: `${baseUrl}${localePrefix}/courses/${product.slug}`,
      siteName:
        locale === "fa" ? "مرکز معماری ایراک" : "Iranian Architecture Center",
      images: product.featured_image
        ? [
            {
              url: product.featured_image.url,
              width: product.featured_image.width || 1200,
              height: product.featured_image.height || 630,
              alt: product.featured_image.alt || title,
            },
          ]
        : [
            {
              url: `${baseUrl}/default-course.jpg`,
              width: 1200,
              height: 630,
              alt: title,
            },
          ],
      locale: locale === "fa" ? "fa_IR" : "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [product.featured_image?.url || `${baseUrl}/default-course.jpg`],
    },
    alternates: {
      canonical: `${baseUrl}${localePrefix}/courses/${product.slug}`,
      languages: {
        fa: `${baseUrl}/courses/${product.slug}`,
        en: `${baseUrl}/en/courses/${product.slug}`,
      },
    },
    other: {
      "product:price:amount": (
        product.discounted_price || product.price
      ).toString(),
      "product:price:currency": "IRR",
      "product:availability":
        product.stock_quantity && product.stock_quantity > 0
          ? "in stock"
          : "out of stock",
    },
  };
};

// Workshop metadata generation
export const getWorkshopMetadata = (
  workshop: Workshop,
  locale: string = "fa",
): Metadata => {
  const baseUrl = getBaseUrl();
  const localePrefix = locale === "fa" ? "" : `/${locale}`;

  const title =
    locale === "fa" ? workshop.title : workshop.title_en || workshop.title;
  const description = truncateText(
    locale === "fa"
      ? workshop.description
      : workshop.description_en || workshop.description,
  );

  const keywords = generateKeywords(
    title,
    description,
    workshop.tags || [],
    locale,
  );

  return {
    title,
    description,
    keywords,
    authors: workshop.instructor
      ? [{ name: workshop.instructor.name }]
      : [{ name: "IRAC Team" }],
    openGraph: {
      title,
      description,
      url: `${baseUrl}${localePrefix}/workshops/${workshop.slug}`,
      siteName:
        locale === "fa" ? "مرکز معماری ایراک" : "Iranian Architecture Center",
      images: workshop.featured_image
        ? [
            {
              url: workshop.featured_image.url,
              width: workshop.featured_image.width || 1200,
              height: workshop.featured_image.height || 630,
              alt: workshop.featured_image.alt || title,
            },
          ]
        : [
            {
              url: `${baseUrl}/default-workshop.jpg`,
              width: 1200,
              height: 630,
              alt: title,
            },
          ],
      locale: locale === "fa" ? "fa_IR" : "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [
        workshop.featured_image?.url || `${baseUrl}/default-workshop.jpg`,
      ],
    },
    alternates: {
      canonical: `${baseUrl}${localePrefix}/workshops/${workshop.slug}`,
      languages: {
        fa: `${baseUrl}/workshops/${workshop.slug}`,
        en: `${baseUrl}/en/workshops/${workshop.slug}`,
      },
    },
    other: {
      "event:start_time": workshop.schedules?.[0]?.start_date,
      "event:end_time": workshop.schedules?.[0]?.end_date,
      "workshop:price": workshop.base_price?.toString(),
      "workshop:capacity":
        workshop.schedules?.[0]?.max_participants?.toString(),
    },
  };
};

// Article metadata generation
export const getArticleMetadata = (
  article: any,
  locale: string = "fa",
): Metadata => {
  const baseUrl = getBaseUrl();
  const localePrefix = locale === "fa" ? "" : `/${locale}`;

  const title =
    locale === "fa" ? article.title : article.title_en || article.title;
  const description = truncateText(
    locale === "fa" ? article.excerpt : article.excerpt_en || article.excerpt,
  );

  const keywords = generateKeywords(
    title,
    description,
    article.tags || [],
    locale,
  );

  return {
    title,
    description,
    keywords,
    authors: article.author
      ? [{ name: `${article.author.first_name} ${article.author.last_name}` }]
      : [{ name: "IRAC Team" }],
    openGraph: {
      title,
      description,
      url: `${baseUrl}${localePrefix}/articles/${article.slug}`,
      siteName:
        locale === "fa" ? "مرکز معماری ایراک" : "Iranian Architecture Center",
      images: article.featured_image
        ? [
            {
              url: article.featured_image.url,
              width: article.featured_image.width || 1200,
              height: article.featured_image.height || 630,
              alt: article.featured_image.alt || title,
            },
          ]
        : [
            {
              url: `${baseUrl}/default-article.jpg`,
              width: 1200,
              height: 630,
              alt: title,
            },
          ],
      locale: locale === "fa" ? "fa_IR" : "en_US",
      type: "article",
      publishedTime: article.published_at,
      modifiedTime: article.updated_at,
      section: article.category?.name || "Architecture",
      tags: article.tags,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [article.featured_image?.url || `${baseUrl}/default-article.jpg`],
    },
    alternates: {
      canonical: `${baseUrl}${localePrefix}/articles/${article.slug}`,
      languages: {
        fa: `${baseUrl}/articles/${article.slug}`,
        en: `${baseUrl}/en/articles/${article.slug}`,
      },
    },
  };
};

// Category page metadata generation
export const getCategoryMetadata = (
  category: string,
  categoryName: string,
  locale: string = "fa",
): Metadata => {
  const baseUrl = getBaseUrl();
  const localePrefix = locale === "fa" ? "" : `/${locale}`;

  const title =
    locale === "fa"
      ? `دوره‌های ${categoryName} | مرکز معماری ایراک`
      : `${categoryName} Courses | Iranian Architecture Center`;

  const description =
    locale === "fa"
      ? `مشاهده تمام دوره‌های ${categoryName} در مرکز معماری ایراک. آموزش تخصصی با اساتید باتجربه.`
      : `Explore all ${categoryName} courses at Iranian Architecture Center. Professional training with experienced instructors.`;

  return {
    title,
    description,
    keywords: generateKeywords(title, description, [categoryName], locale),
    openGraph: {
      title,
      description,
      url: `${baseUrl}${localePrefix}/courses/category/${category}`,
      siteName:
        locale === "fa" ? "مرکز معماری ایراک" : "Iranian Architecture Center",
      images: [
        {
          url: `${baseUrl}/category-${category}.jpg`,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale: locale === "fa" ? "fa_IR" : "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`${baseUrl}/category-${category}.jpg`],
    },
    alternates: {
      canonical: `${baseUrl}${localePrefix}/courses/category/${category}`,
      languages: {
        fa: `${baseUrl}/courses/category/${category}`,
        en: `${baseUrl}/en/courses/category/${category}`,
      },
    },
  };
};

// Search page metadata generation
export const getSearchMetadata = (
  query: string = "",
  locale: string = "fa",
): Metadata => {
  const baseUrl = getBaseUrl();
  const localePrefix = locale === "fa" ? "" : `/${locale}`;

  const title =
    locale === "fa"
      ? query
        ? `نتایج جستجو برای "${query}" | مرکز معماری ایراک`
        : "جستجو | مرکز معماری ایراک"
      : query
        ? `Search Results for "${query}" | Iranian Architecture Center`
        : "Search | Iranian Architecture Center";

  const description =
    locale === "fa"
      ? query
        ? `نتایج جستجو برای "${query}" در دوره‌ها، مقالات و کارگاه‌های مرکز معماری ایراک`
        : "جستجو در دوره‌ها، مقالات و کارگاه‌های مرکز معماری ایراک"
      : query
        ? `Search results for "${query}" in courses, articles and workshops at Iranian Architecture Center`
        : "Search courses, articles and workshops at Iranian Architecture Center";

  return {
    title,
    description,
    robots: {
      index: query ? true : false, // Don't index empty search pages
      follow: true,
    },
    alternates: {
      canonical: `${baseUrl}${localePrefix}/search${query ? `?q=${encodeURIComponent(query)}` : ""}`,
    },
  };
};

// Static page metadata generation
export const getStaticPageMetadata = (
  page: string,
  locale: string = "fa",
): Metadata => {
  const baseUrl = getBaseUrl();
  const localePrefix = locale === "fa" ? "" : `/${locale}`;

  const pageData = {
    about: {
      fa: {
        title: "درباره ما | مرکز معماری ایراک",
        description:
          "آشنایی با مرکز معماری ایراک، تاریخچه، اهداف و خدمات ما در زمینه آموزش و خدمات معماری",
      },
      en: {
        title: "About Us | Iranian Architecture Center",
        description:
          "Learn about Iranian Architecture Center, our history, goals and services in architecture education and professional services",
      },
    },
    contact: {
      fa: {
        title: "تماس با ما | مرکز معماری ایراک",
        description:
          "راه‌های تماس با مرکز معماری ایراک. آدرس، تلفن، ایمیل و فرم تماس آنلاین",
      },
      en: {
        title: "Contact Us | Iranian Architecture Center",
        description:
          "Contact information for Iranian Architecture Center. Address, phone, email and online contact form",
      },
    },
    services: {
      fa: {
        title: "خدمات | مرکز معماری ایراک",
        description:
          "خدمات مرکز معماری ایراک شامل آموزش، مشاوره، طراحی و نظارت معماری",
      },
      en: {
        title: "Services | Iranian Architecture Center",
        description:
          "Iranian Architecture Center services including education, consultation, design and architectural supervision",
      },
    },
    gallery: {
      fa: {
        title: "گالری تصاویر | مرکز معماری ایراک",
        description:
          "مشاهده تصاویر پروژه‌ها، فعالیت‌ها و رویدادهای مرکز معماری ایراک",
      },
      en: {
        title: "Gallery | Iranian Architecture Center",
        description:
          "View images of projects, activities and events at Iranian Architecture Center",
      },
    },
  };

  const data = pageData[page as keyof typeof pageData]?.[locale as "fa" | "en"];

  if (!data) {
    return getDefaultMetadata(locale);
  }

  return {
    title: data.title,
    description: data.description,
    alternates: {
      canonical: `${baseUrl}${localePrefix}/${page}`,
      languages: {
        fa: `${baseUrl}/${page}`,
        en: `${baseUrl}/en/${page}`,
      },
    },
    openGraph: {
      title: data.title,
      description: data.description,
      url: `${baseUrl}${localePrefix}/${page}`,
      siteName:
        locale === "fa" ? "مرکز معماری ایراک" : "Iranian Architecture Center",
      locale: locale === "fa" ? "fa_IR" : "en_US",
      type: "website",
    },
  };
};

// Helper to generate hreflang alternate URLs
export const generateAlternateUrls = (path: string): Record<string, string> => {
  const baseUrl = getBaseUrl();
  return {
    fa: `${baseUrl}${path}`,
    en: `${baseUrl}/en${path}`,
    "x-default": `${baseUrl}${path}`,
  };
};

// Helper to clean and optimize meta description
export const optimizeMetaDescription = (
  description: string,
  locale: string = "fa",
  maxLength: number = 160,
): string => {
  if (!description) {
    return locale === "fa"
      ? "مرکز معماری ایراک - آموزش، پژوهش و خدمات تخصصی معماری"
      : "Iranian Architecture Center - Architecture education, research and professional services";
  }

  // Remove HTML tags
  const cleanDesc = description.replace(/<[^>]*>/g, "").trim();

  // Truncate if needed
  return truncateText(cleanDesc, maxLength);
};

// SEO-friendly URL validation
export const validateSEOUrl = (url: string): boolean => {
  // Check for SEO-friendly URL patterns
  const seoPatterns = [
    /^[a-z0-9-]+$/, // English slugs
    /^[\u0600-\u06FF-]+$/, // Persian slugs
    /^[a-z0-9\u0600-\u06FF-]+$/, // Mixed
  ];

  return seoPatterns.some((pattern) => pattern.test(url));
};

export default {
  getDefaultMetadata,
  getCourseMetadata,
  getWorkshopMetadata,
  getArticleMetadata,
  getCategoryMetadata,
  getSearchMetadata,
  getStaticPageMetadata,
  generateSlug,
  generateKeywords,
  truncateText,
  optimizeMetaDescription,
  generateAlternateUrls,
  validateSEOUrl,
};

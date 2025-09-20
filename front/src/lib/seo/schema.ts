import { Product, Workshop, ProductReview } from "@/types";

// Base organization schema for IRAC
export const getOrganizationSchema = (locale: string = "fa") => {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://irac.ir";

  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: locale === "fa" ? "مرکز معماری ایراک" : "Iranian Architecture Center",
    alternateName: "IRAC",
    description:
      locale === "fa"
        ? "مرکز معماری ایراک - آموزش، پژوهش و خدمات معماری"
        : "Iranian Architecture Center - Education, Research and Architecture Services",
    url: baseUrl,
    logo: {
      "@type": "ImageObject",
      url: `${baseUrl}/logo.png`,
      width: 200,
      height: 100,
    },
    image: `${baseUrl}/og-image.jpg`,
    sameAs: [
      "https://instagram.com/irac_center",
      "https://linkedin.com/company/irac-center",
      "https://twitter.com/irac_center",
      "https://facebook.com/irac.center",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+98-21-12345678",
      contactType: "customer service",
      availableLanguage: ["Persian", "English"],
      areaServed: "IR",
    },
    address: {
      "@type": "PostalAddress",
      addressCountry: "IR",
      addressRegion: "Tehran",
      addressLocality: "Tehran",
    },
  };
};

// Course/Product schema markup
export const getCourseSchema = (product: Product, locale: string = "fa") => {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://irac.ir";
  const localePrefix = locale === "fa" ? "" : `/${locale}`;

  return {
    "@context": "https://schema.org",
    "@type": "Course",
    name: locale === "fa" ? product.title : product.title_en || product.title,
    description:
      locale === "fa"
        ? product.description
        : product.description_en || product.description,
    url: `${baseUrl}${localePrefix}/courses/${product.slug}`,
    image: product.featured_image?.url
      ? {
          "@type": "ImageObject",
          url: product.featured_image.url,
          width: product.featured_image.width || 1200,
          height: product.featured_image.height || 630,
          alt: product.featured_image.alt || product.title,
        }
      : undefined,
    provider: getOrganizationSchema(locale),
    instructor: product.author
      ? {
          "@type": "Person",
          name:
            locale === "fa"
              ? product.author
              : product.author_en || product.author,
        }
      : undefined,
    offers: {
      "@type": "Offer",
      price: product.discounted_price || product.price,
      priceCurrency: "IRR",
      availability:
        product.stock_quantity && product.stock_quantity > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      validFrom: product.created_at,
      priceValidUntil: new Date(
        Date.now() + 365 * 24 * 60 * 60 * 1000,
      ).toISOString(), // 1 year from now
    },
    courseMode: product.is_digital ? "online" : "onsite",
    educationalLevel: "Beginner to Advanced",
    timeRequired: "PT40H", // Default 40 hours
    inLanguage: locale === "fa" ? "fa" : "en",
    keywords: product.tags?.join(", "),
    aggregateRating:
      product.rating?.count > 0
        ? {
            "@type": "AggregateRating",
            ratingValue: product.rating.average,
            reviewCount: product.rating.count,
            bestRating: 5,
            worstRating: 1,
          }
        : undefined,
    review: product.reviews?.map((review) => getReviewSchema(review, locale)),
    hasCourseInstance: {
      "@type": "CourseInstance",
      courseMode: product.is_digital ? "online" : "onsite",
      instructor: product.author
        ? {
            "@type": "Person",
            name:
              locale === "fa"
                ? product.author
                : product.author_en || product.author,
          }
        : undefined,
    },
  };
};

// Workshop schema markup
export const getWorkshopSchema = (
  workshop: Workshop,
  locale: string = "fa",
) => {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://irac.ir";
  const localePrefix = locale === "fa" ? "" : `/${locale}`;

  return {
    "@context": "https://schema.org",
    "@type": "Event",
    name:
      locale === "fa" ? workshop.title : workshop.title_en || workshop.title,
    description:
      locale === "fa"
        ? workshop.description
        : workshop.description_en || workshop.description,
    url: `${baseUrl}${localePrefix}/workshops/${workshop.slug}`,
    image: workshop.featured_image?.url
      ? {
          "@type": "ImageObject",
          url: workshop.featured_image.url,
          width: workshop.featured_image.width || 1200,
          height: workshop.featured_image.height || 630,
        }
      : undefined,
    startDate: workshop.schedules?.[0]?.start_date,
    endDate: workshop.schedules?.[0]?.end_date,
    eventStatus:
      workshop.status === "active"
        ? "https://schema.org/EventScheduled"
        : "https://schema.org/EventCancelled",
    eventAttendanceMode:
      workshop.schedules?.[0]?.location?.type === "online"
        ? "https://schema.org/OnlineEventAttendanceMode"
        : "https://schema.org/OfflineEventAttendanceMode",
    location:
      workshop.schedules?.[0]?.location?.type === "online"
        ? {
            "@type": "VirtualLocation",
            url: `${baseUrl}${localePrefix}/workshops/${workshop.slug}`,
          }
        : {
            "@type": "Place",
            name: "مرکز معماری ایراک",
            address: {
              "@type": "PostalAddress",
              addressCountry: "IR",
              addressRegion: "Tehran",
              addressLocality: "Tehran",
            },
          },
    organizer: getOrganizationSchema(locale),
    performer: workshop.instructor
      ? {
          "@type": "Person",
          name: workshop.instructor.name,
          description: workshop.instructor.bio,
        }
      : undefined,
    offers: {
      "@type": "Offer",
      price: workshop.base_price,
      priceCurrency: "IRR",
      availability:
        workshop.schedules?.[0]?.max_participants &&
        workshop.schedules?.[0]?.current_reservations &&
        workshop.schedules?.[0]?.current_reservations <
          workshop.schedules?.[0]?.max_participants
          ? "https://schema.org/InStock"
          : "https://schema.org/SoldOut",
      validFrom: workshop.schedules?.[0]?.start_date,
      validThrough: workshop.schedules?.[0]?.end_date,
    },
    maximumAttendeeCapacity: workshop.schedules?.[0]?.max_participants,
    remainingAttendeeCapacity:
      workshop.schedules?.[0]?.max_participants &&
      workshop.schedules?.[0]?.current_reservations
        ? workshop.schedules?.[0]?.max_participants -
          workshop.schedules?.[0]?.current_reservations
        : workshop.schedules?.[0]?.max_participants,
  };
};

// Article schema markup
export const getArticleSchema = (article: any, locale: string = "fa") => {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://irac.ir";
  const localePrefix = locale === "fa" ? "" : `/${locale}`;

  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline:
      locale === "fa" ? article.title : article.title_en || article.title,
    description:
      locale === "fa" ? article.excerpt : article.excerpt_en || article.excerpt,
    url: `${baseUrl}${localePrefix}/articles/${article.slug}`,
    image: article.featured_image?.url
      ? {
          "@type": "ImageObject",
          url: article.featured_image.url,
          width: article.featured_image.width || 1200,
          height: article.featured_image.height || 630,
        }
      : undefined,
    datePublished: article.published_at,
    dateModified: article.updated_at,
    author: {
      "@type": "Person",
      name: article.author
        ? `${article.author.first_name} ${article.author.last_name}`
        : "IRAC Team",
    },
    publisher: getOrganizationSchema(locale),
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${baseUrl}${localePrefix}/articles/${article.slug}`,
    },
    articleSection: article.category?.name || "Architecture",
    keywords: article.tags?.join(", "),
    inLanguage: locale === "fa" ? "fa" : "en",
    wordCount: article.content?.length
      ? Math.ceil(article.content.length / 5)
      : undefined,
  };
};

// Review schema markup
export const getReviewSchema = (
  review: ProductReview,
  locale: string = "fa",
) => {
  return {
    "@context": "https://schema.org",
    "@type": "Review",
    reviewRating: {
      "@type": "Rating",
      ratingValue: review.rating,
      bestRating: 5,
      worstRating: 1,
    },
    name: review.title,
    reviewBody: review.comment,
    datePublished: review.created_at,
    author: {
      "@type": "Person",
      name: review.user_name || "Anonymous",
    },
    publisher: getOrganizationSchema(locale),
  };
};

// Product schema markup (for physical products/books)
export const getProductSchema = (product: Product, locale: string = "fa") => {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://irac.ir";
  const localePrefix = locale === "fa" ? "" : `/${locale}`;

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: locale === "fa" ? product.title : product.title_en || product.title,
    description:
      locale === "fa"
        ? product.description
        : product.description_en || product.description,
    url: `${baseUrl}${localePrefix}/courses/${product.slug}`,
    image: product.featured_image?.url
      ? {
          "@type": "ImageObject",
          url: product.featured_image.url,
          width: product.featured_image.width || 1200,
          height: product.featured_image.height || 630,
        }
      : undefined,
    brand: getOrganizationSchema(locale),
    manufacturer: getOrganizationSchema(locale),
    sku: product._id,
    category: product.category,
    offers: {
      "@type": "Offer",
      price: product.discounted_price || product.price,
      priceCurrency: "IRR",
      availability:
        product.stock_quantity && product.stock_quantity > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      seller: getOrganizationSchema(locale),
      priceValidUntil: new Date(
        Date.now() + 365 * 24 * 60 * 60 * 1000,
      ).toISOString(),
    },
    aggregateRating:
      product.rating?.count > 0
        ? {
            "@type": "AggregateRating",
            ratingValue: product.rating.average,
            reviewCount: product.rating.count,
            bestRating: 5,
            worstRating: 1,
          }
        : undefined,
    review: product.reviews?.map((review) => getReviewSchema(review, locale)),
  };
};

// Book-specific schema markup
export const getBookSchema = (product: Product, locale: string = "fa") => {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://irac.ir";
  const localePrefix = locale === "fa" ? "" : `/${locale}`;

  return {
    "@context": "https://schema.org",
    "@type": "Book",
    name: locale === "fa" ? product.title : product.title_en || product.title,
    description:
      locale === "fa"
        ? product.description
        : product.description_en || product.description,
    url: `${baseUrl}${localePrefix}/courses/${product.slug}`,
    image: product.featured_image?.url,
    author: product.author
      ? {
          "@type": "Person",
          name:
            locale === "fa"
              ? product.author
              : product.author_en || product.author,
        }
      : undefined,
    publisher: product.publisher
      ? {
          "@type": "Organization",
          name:
            locale === "fa"
              ? product.publisher
              : product.publisher_en || product.publisher,
        }
      : getOrganizationSchema(locale),
    datePublished: product.publication_date,
    isbn: product.isbn,
    numberOfPages: product.page_count,
    inLanguage: product.language || (locale === "fa" ? "fa" : "en"),
    bookFormat: product.is_digital ? "EBook" : "Paperback",
    genre: product.category,
    offers: {
      "@type": "Offer",
      price: product.discounted_price || product.price,
      priceCurrency: "IRR",
      availability:
        product.stock_quantity && product.stock_quantity > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
    },
    aggregateRating:
      product.rating?.count > 0
        ? {
            "@type": "AggregateRating",
            ratingValue: product.rating.average,
            reviewCount: product.rating.count,
          }
        : undefined,
  };
};

// Breadcrumb schema markup
export const getBreadcrumbSchema = (
  breadcrumbs: Array<{ name: string; url: string }>,
) => {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: breadcrumbs.map((breadcrumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: breadcrumb.name,
      item: breadcrumb.url,
    })),
  };
};

// Website schema markup
export const getWebsiteSchema = (locale: string = "fa") => {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://irac.ir";

  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: locale === "fa" ? "مرکز معماری ایراک" : "Iranian Architecture Center",
    alternateName: "IRAC",
    url: baseUrl,
    description:
      locale === "fa"
        ? "مرکز معماری ایراک - آموزش، پژوهش و خدمات معماری"
        : "Iranian Architecture Center - Education, Research and Architecture Services",
    publisher: getOrganizationSchema(locale),
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${baseUrl}${locale === "fa" ? "" : "/" + locale}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
    sameAs: [
      "https://instagram.com/irac_center",
      "https://linkedin.com/company/irac-center",
      "https://twitter.com/irac_center",
      "https://facebook.com/irac.center",
    ],
  };
};

// FAQ Page schema markup
export const getFAQSchema = (
  faqs: Array<{ question: string; answer: string }>,
) => {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
};

// Local Business schema markup
export const getLocalBusinessSchema = (locale: string = "fa") => {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: locale === "fa" ? "مرکز معماری ایراک" : "Iranian Architecture Center",
    description:
      locale === "fa"
        ? "مرکز آموزش معماری، فضای کار اشتراکی و خدمات معماری"
        : "Architecture education center, coworking space and architecture services",
    url: process.env.NEXT_PUBLIC_BASE_URL || "https://irac.ir",
    telephone: "+98-21-12345678",
    email: "info@irac.ir",
    address: {
      "@type": "PostalAddress",
      addressCountry: "IR",
      addressRegion: "Tehran",
      addressLocality: "Tehran",
      streetAddress: "Architecture District, Tehran",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 35.6892,
      longitude: 51.389,
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday"],
        opens: "08:00",
        closes: "18:00",
      },
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: "Friday",
        opens: "08:00",
        closes: "12:00",
      },
    ],
    priceRange: "$$",
    servedCuisine: "Architecture Education",
    sameAs: [
      "https://instagram.com/irac_center",
      "https://linkedin.com/company/irac-center",
    ],
  };
};

// Helper function to inject schema markup into HTML
export const injectSchemaMarkup = (schemas: any[]) => {
  if (typeof window === "undefined") {
    return null;
  }

  schemas.forEach((schema, index) => {
    const scriptId = `schema-markup-${index}`;

    // Remove existing schema if it exists
    const existingScript = document.getElementById(scriptId);
    if (existingScript) {
      existingScript.remove();
    }

    // Create new schema script
    const script = document.createElement("script");
    script.id = scriptId;
    script.type = "application/ld+json";
    script.textContent = JSON.stringify(schema);
    document.head.appendChild(script);
  });
};

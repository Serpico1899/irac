import { Metadata } from "next";

interface GenerateMetadataProps {
  params: {
    locale: string;
  };
}

export async function generateMetadata({
  params: { locale },
}: GenerateMetadataProps): Promise<Metadata> {
  const isRTL = locale === "fa";

  const title = isRTL ? "فروشگاه محصولات - مرکز معماری ایرانی اسلامی" : "Product Store - Iranian Islamic Architecture Center";
  const description = isRTL
    ? "مجموعه‌ای غنی از کتاب‌های معماری، آثار هنری، مقالات دیجیتال و محصولات فرهنگی اسلامی. خرید آنلاین با بهترین قیمت و کیفیت تضمینی."
    : "Discover our rich collection of architectural books, Islamic artworks, digital articles and cultural products. Shop online with guaranteed best prices and quality.";

  const keywords = isRTL
    ? [
        "فروشگاه محصولات",
        "کتاب معماری",
        "آثار هنری اسلامی",
        "مقالات دیجیتال",
        "محصولات فرهنگی",
        "معماری ایرانی",
        "معماری اسلامی",
        "خرید آنلاین",
        "کتاب‌های معماری",
        "آثار هنری"
      ]
    : [
        "product store",
        "architecture books",
        "islamic artworks",
        "digital articles",
        "cultural products",
        "iranian architecture",
        "islamic architecture",
        "online shopping",
        "architectural books",
        "art works"
      ];

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const currentUrl = `${baseUrl}/${locale}/products`;
  const alternateUrl = `${baseUrl}/${locale === "fa" ? "en" : "fa"}/products`;

  return {
    title,
    description,
    keywords: keywords.join(", "),
    authors: [{ name: "Iranian Islamic Architecture Center" }],
    creator: "Iranian Islamic Architecture Center",
    publisher: "IRAC",
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    metadataBase: new URL(baseUrl),
    alternates: {
      canonical: currentUrl,
      languages: {
        "fa-IR": `${baseUrl}/fa/products`,
        "en-US": `${baseUrl}/en/products`,
      },
    },
    openGraph: {
      title,
      description,
      url: currentUrl,
      siteName: isRTL
        ? "مرکز معماری ایرانی اسلامی"
        : "Iranian Islamic Architecture Center",
      locale: locale === "fa" ? "fa_IR" : "en_US",
      type: "website",
      images: [
        {
          url: `${baseUrl}/images/og/products-${locale}.jpg`,
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
      images: [`${baseUrl}/images/og/products-${locale}.jpg`],
      creator: "@irac_center",
      site: "@irac_center",
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
    viewport: {
      width: "device-width",
      initialScale: 1,
      maximumScale: 5,
    },
    verification: {
      google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION,
      yandex: process.env.NEXT_PUBLIC_YANDEX_VERIFICATION,
    },
    category: "e-commerce",
    classification: isRTL ? "فروشگاه آنلاین محصولات فرهنگی" : "Online Cultural Products Store",
    other: {
      "apple-mobile-web-app-capable": "yes",
      "apple-mobile-web-app-status-bar-style": "default",
      "apple-mobile-web-app-title": title,
      "mobile-web-app-capable": "yes",
      "msapplication-TileColor": "#168c95",
      "theme-color": "#168c95",
    },
  };
}

// Structured Data for SEO
export const jsonLd = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "name": "Product Store",
  "description": "Collection of architectural books, Islamic artworks, digital articles and cultural products",
  "url": "https://irac-center.com/products",
  "mainEntity": {
    "@type": "ItemList",
    "name": "Products Collection",
    "description": "Curated collection of cultural and educational products",
    "numberOfItems": 100,
    "itemListElement": [
      {
        "@type": "Product",
        "name": "Islamic Architecture Books",
        "category": "Books",
        "offers": {
          "@type": "AggregateOffer",
          "lowPrice": "10000",
          "highPrice": "500000",
          "priceCurrency": "IRR"
        }
      },
      {
        "@type": "Product",
        "name": "Traditional Artworks",
        "category": "Art",
        "offers": {
          "@type": "AggregateOffer",
          "lowPrice": "50000",
          "highPrice": "2000000",
          "priceCurrency": "IRR"
        }
      },
      {
        "@type": "Product",
        "name": "Digital Articles",
        "category": "Digital Content",
        "offers": {
          "@type": "AggregateOffer",
          "lowPrice": "5000",
          "highPrice": "100000",
          "priceCurrency": "IRR"
        }
      }
    ]
  },
  "breadcrumb": {
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://irac-center.com"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Products",
        "item": "https://irac-center.com/products"
      }
    ]
  },
  "provider": {
    "@type": "Organization",
    "name": "Iranian Islamic Architecture Center",
    "url": "https://irac-center.com",
    "logo": "https://irac-center.com/images/logo.png",
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+98-21-12345678",
      "contactType": "customer service",
      "availableLanguage": ["Persian", "English"]
    }
  }
};

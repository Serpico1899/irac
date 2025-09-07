"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import Head from "next/head";
import ProductStore from "@/components/organisms/Product/ProductStore";

export default function ProductsPage() {
  const t = useTranslations();
  const params = useParams();
  const locale = params.locale as string;
  const isRTL = locale === "fa";

  const pageTitle = isRTL ? "فروشگاه محصولات" : "Product Store";
  const pageDescription = isRTL
    ? "مجموعه‌ای غنی از کتاب‌ها، آثار هنری، مقالات دیجیتال و محصولات فرهنگی را کشف کنید. خرید آنلاین با بهترین قیمت و کیفیت."
    : "Discover our rich collection of books, artworks, digital articles and cultural products. Shop online with the best prices and quality.";

  // Structured data for SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: pageTitle,
    description: pageDescription,
    url: `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/${locale}/products`,
    inLanguage: locale === "fa" ? "fa-IR" : "en-US",
    isPartOf: {
      "@type": "WebSite",
      name: isRTL
        ? "مرکز معماری ایرانی اسلامی"
        : "Iranian Islamic Architecture Center",
      url: process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000",
    },
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: isRTL ? "خانه" : "Home",
          item: `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/${locale}`,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: pageTitle,
          item: `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/${locale}/products`,
        },
      ],
    },
  };

  return (
    <>
      {/* Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <div className="min-h-screen bg-gray-50" dir={isRTL ? "rtl" : "ltr"}>
        {/* Header Section with improved mobile-first design */}
        <header className="bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 xs:py-12 lg:py-16">
            <div className="text-center space-y-4">
              <h1
                className="text-2xl xs:text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight"
                itemProp="headline"
              >
                {pageTitle}
              </h1>
              <p
                className="text-sm xs:text-base lg:text-lg text-blue-100 max-w-3xl mx-auto leading-relaxed"
                itemProp="description"
              >
                {pageDescription}
              </p>

              {/* Quick Stats with improved mobile accessibility */}
              <div
                className="grid grid-cols-2 xs:grid-cols-4 gap-4 xs:gap-6 mt-8 max-w-2xl mx-auto"
                role="region"
                aria-label={
                  isRTL ? "آمار سریع محصولات" : "Quick product statistics"
                }
              >
                <div
                  className="text-center"
                  itemScope
                  itemType="https://schema.org/Quantity"
                >
                  <div
                    className="text-xl xs:text-2xl lg:text-3xl font-bold text-white"
                    itemProp="value"
                    aria-label={
                      isRTL ? "بیش از ۱۰۰ کتاب" : "More than 100 books"
                    }
                  >
                    {isRTL ? "۱۰۰+" : "100+"}
                  </div>
                  <div
                    className="text-xs xs:text-sm text-blue-200 mt-1"
                    itemProp="unitText"
                  >
                    {isRTL ? "کتاب" : "Books"}
                  </div>
                </div>
                <div
                  className="text-center"
                  itemScope
                  itemType="https://schema.org/Quantity"
                >
                  <div
                    className="text-xl xs:text-2xl lg:text-3xl font-bold text-white"
                    itemProp="value"
                    aria-label={
                      isRTL ? "بیش از ۵۰ اثر هنری" : "More than 50 artworks"
                    }
                  >
                    {isRTL ? "۵۰+" : "50+"}
                  </div>
                  <div
                    className="text-xs xs:text-sm text-blue-200 mt-1"
                    itemProp="unitText"
                  >
                    {isRTL ? "اثر هنری" : "Artworks"}
                  </div>
                </div>
                <div
                  className="text-center"
                  itemScope
                  itemType="https://schema.org/Quantity"
                >
                  <div
                    className="text-xl xs:text-2xl lg:text-3xl font-bold text-white"
                    itemProp="value"
                    aria-label={
                      isRTL ? "بیش از ۲۰۰ مقاله" : "More than 200 articles"
                    }
                  >
                    {isRTL ? "۲۰۰+" : "200+"}
                  </div>
                  <div
                    className="text-xs xs:text-sm text-blue-200 mt-1"
                    itemProp="unitText"
                  >
                    {isRTL ? "مقاله" : "Articles"}
                  </div>
                </div>
                <div
                  className="text-center"
                  itemScope
                  itemType="https://schema.org/Quantity"
                >
                  <div
                    className="text-xl xs:text-2xl lg:text-3xl font-bold text-white"
                    itemProp="value"
                    aria-label={
                      isRTL
                        ? "بیش از ۳۰ محصول فرهنگی"
                        : "More than 30 cultural products"
                    }
                  >
                    {isRTL ? "۳۰+" : "30+"}
                  </div>
                  <div
                    className="text-xs xs:text-sm text-blue-200 mt-1"
                    itemProp="unitText"
                  >
                    {isRTL ? "فرهنگی" : "Cultural"}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Decorative Wave - optimized for mobile performance */}
          <div className="relative" aria-hidden="true">
            <svg
              className="w-full h-6 xs:h-8 lg:h-12 text-gray-50"
              preserveAspectRatio="none"
              viewBox="0 0 1200 120"
              fill="currentColor"
              role="img"
              aria-label={isRTL ? "عنصر تزئینی موج" : "Decorative wave element"}
            >
              <path
                d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z"
                opacity=".25"
              />
              <path
                d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z"
                opacity=".5"
              />
              <path d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z" />
            </svg>
          </div>
        </header>

        {/* Main Content with enhanced mobile-first layout */}
        <main
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 xs:py-8"
          role="main"
          itemScope
          itemType="https://schema.org/ItemList"
          aria-label={isRTL ? "فهرست محصولات" : "Products list"}
        >
          <ProductStore
            locale={locale}
            showHeader={false}
            showStats={true}
            itemsPerPageOptions={[12, 24, 48]}
            className="w-full"
            title={pageTitle}
            description={pageDescription}
          />
        </main>

        {/* Mobile-first performance optimization script */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Lazy load non-critical resources for mobile performance
              if ('IntersectionObserver' in window) {
                const lazyImages = document.querySelectorAll('img[data-src]');
                const imageObserver = new IntersectionObserver((entries, observer) => {
                  entries.forEach(entry => {
                    if (entry.isIntersecting) {
                      const img = entry.target;
                      img.src = img.dataset.src;
                      img.classList.remove('lazy');
                      imageObserver.unobserve(img);
                    }
                  });
                });
                lazyImages.forEach(img => imageObserver.observe(img));
              }

              // Mobile-first touch optimization
              if ('ontouchstart' in window) {
                document.body.classList.add('touch-enabled');
              }
            `,
          }}
        />
      </div>
    </>
  );
}

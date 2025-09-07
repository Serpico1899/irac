import { Metadata } from "next";
import { ReactNode } from "react";
import { generateMetadata, jsonLd } from "./metadata";

interface ProductsLayoutProps {
  children: ReactNode;
  params: {
    locale: string;
  };
}

// Export metadata generation function
export { generateMetadata };

export default function ProductsLayout({
  children,
  params: { locale },
}: ProductsLayoutProps) {
  const isRTL = locale === "fa";

  return (
    <>
      {/* Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            ...jsonLd,
            url: jsonLd.url.replace("/products", `/${locale}/products`),
            breadcrumb: {
              ...jsonLd.breadcrumb,
              itemListElement: jsonLd.breadcrumb.itemListElement.map(
                (item, index) => ({
                  ...item,
                  item:
                    index === 0
                      ? `https://irac-center.com/${locale}`
                      : `https://irac-center.com/${locale}/products`,
                })
              ),
            },
          }),
        }}
      />

      {/* Mobile-first layout optimizations */}
      <div
        className={`min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 ${
          isRTL ? "dir-rtl font-vazir" : "font-sans"
        }`}
        dir={isRTL ? "rtl" : "ltr"}
        lang={locale}
      >
        {/* Mobile viewport meta (handled by metadata but good for layout context) */}
        <div className="w-full">
          {/* Performance optimization: Preload critical resources */}
          <div className="hidden">
            <link
              rel="preload"
              href="/fonts/ttf/Vazirmatn-Regular.ttf"
              as="font"
              type="font/ttf"
              crossOrigin="anonymous"
            />
            <link
              rel="preload"
              href="/fonts/ttf/Vazirmatn-Medium.ttf"
              as="font"
              type="font/ttf"
              crossOrigin="anonymous"
            />
          </div>

          {/* Main content with mobile-first layout */}
          <main
            className="w-full"
            role="main"
            aria-label={
              isRTL
                ? "صفحه اصلی فروشگاه محصولات"
                : "Main product store page"
            }
          >
            {children}
          </main>

          {/* Mobile-first performance hints */}
          <div className="hidden">
            {/* DNS prefetch for external resources */}
            <link rel="dns-prefetch" href="//fonts.googleapis.com" />
            <link rel="dns-prefetch" href="//cdnjs.cloudflare.com" />

            {/* Preconnect for critical third parties */}
            <link rel="preconnect" href="https://api.irac-center.com" />
          </div>
        </div>
      </div>

      {/* Performance monitoring script (non-blocking) */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            // Core Web Vitals tracking
            if ('web-vital' in window) {
              import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
                getCLS(console.log);
                getFID(console.log);
                getFCP(console.log);
                getLCP(console.log);
                getTTFB(console.log);
              });
            }

            // Mobile performance hints
            if ('connection' in navigator) {
              const connection = navigator.connection;
              if (connection && connection.effectiveType === 'slow-2g') {
                document.documentElement.classList.add('slow-connection');
              }
            }

            // Touch device detection for mobile-first optimizations
            if ('ontouchstart' in window) {
              document.documentElement.classList.add('touch-device');
            }
          `,
        }}
      />
    </>
  );
}

// Additional metadata for the layout
export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#168c95" },
    { media: "(prefers-color-scheme: dark)", color: "#0f7882" },
  ],
};

// Mobile-first performance configuration
export const runtime = "edge"; // Use Edge Runtime for better performance
export const revalidate = 3600; // Cache for 1 hour for better mobile performance

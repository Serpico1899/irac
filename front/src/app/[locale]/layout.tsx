import type { Metadata } from "next";
import { ClientProviders } from "@/components/providers/ClientProviders";
import { Navbar } from "@/components/organisms/Navbar";
import Footer from "@/components/organisms/footer";
import Cart from "@/components/organisms/Cart";
import Script from "next/script";
import { env } from "@/config/env.config";
import "../globals.css";

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;

  const siteTitle =
    locale === "fa"
      ? "ایراک | مرکز معماری ایرانی"
      : "IRAC | Iranian Architecture Center";
  const siteDescription =
    locale === "fa"
      ? "خانه آنلاین مرکز معماری ایرانی - آموزش پیشرفته معماری و فضای کاری مشترک"
      : "The online home of the Iranian Architecture Center - Advanced architectural education and coworking space";

  return {
    metadataBase: new URL(env.SEO.METADATA_BASE),
    title: {
      default: siteTitle,
      template: `%s | ${siteTitle}`,
    },
    description: siteDescription,
    keywords: env.SEO.SITE_KEYWORDS,
    authors: [{ name: "IRAC Team" }],
    creator: "IRAC",
    publisher: "IRAC",
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    icons: {
      icon: "/favicon.ico",
      shortcut: "/favicon.ico",
      apple: "/apple-touch-icon.png",
    },
    manifest: "/manifest.json",
    openGraph: {
      type: "website",
      siteName: siteTitle,
      title: siteTitle,
      description: siteDescription,
      url: env.APP.BASE_URL,
      images: [
        {
          url: "/og-image.jpg",
          width: 1200,
          height: 630,
          alt: siteTitle,
        },
      ],
      locale: locale === "fa" ? "fa_IR" : "en_US",
      alternateLocale: locale === "fa" ? "en_US" : "fa_IR",
    },
    twitter: {
      card: "summary_large_image",
      site: env.SOCIAL.TWITTER,
      creator: env.SOCIAL.TWITTER,
      title: siteTitle,
      description: siteDescription,
      images: ["/twitter-image.jpg"],
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
    alternates: {
      canonical: env.APP.BASE_URL,
      languages: {
        fa: `${env.APP.BASE_URL}/fa`,
        en: `${env.APP.BASE_URL}/en`,
      },
    },
  };
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;
  const isRTL = locale === "fa";

  // Load messages for the locale
  let messages;
  try {
    messages = (await import(`../../i18n/${locale}.json`)).default;
  } catch (error) {
    console.error(`Failed to load messages for locale: ${locale}`, error);
    messages = {};
  }

  return (
    <html lang={locale} dir={isRTL ? "rtl" : "ltr"}>
      <head>
        {/* Google Analytics */}
        {process.env.NEXT_PUBLIC_GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}', {
                  page_title: document.title,
                  page_location: window.location.href,
                  send_page_view: true
                });
              `}
            </Script>
          </>
        )}

        {/* Conversion Tracking */}
        <Script id="conversion-tracking" strategy="afterInteractive">
          {`
            window.trackConversion = function(eventName, eventParams = {}) {
              if (typeof gtag !== 'undefined') {
                gtag('event', eventName, {
                  event_category: 'conversion',
                  event_label: eventParams.label || '',
                  value: eventParams.value || 0,
                  currency: eventParams.currency || 'IRR',
                  ...eventParams
                });
              }
            };

            // Track landing page conversions
            window.trackLandingPageConversion = function(type, slug, action) {
              window.trackConversion('landing_page_conversion', {
                content_type: type, // 'workshop' or 'course'
                content_id: slug,
                action: action, // 'reserve', 'enroll', 'learn_more'
                label: \`\${type}_\${slug}_\${action}\`
              });
            };

            // Track CTA clicks
            window.trackCTAClick = function(ctaText, location) {
              window.trackConversion('cta_click', {
                cta_text: ctaText,
                cta_location: location,
                label: \`\${ctaText}_\${location}\`
              });
            };

            // Track form submissions
            window.trackFormSubmission = function(formType, success = true) {
              window.trackConversion('form_submission', {
                form_type: formType,
                success: success,
                label: \`\${formType}_\${success ? 'success' : 'error'}\`
              });
            };
          `}
        </Script>
      </head>
      <body
        className={`min-h-screen bg-background-primary ${isRTL ? "font-arabic" : ""}`}
      >
        <ClientProviders locale={locale} messages={messages}>
          <div className="relative flex flex-col min-h-screen">
            {/* Navbar */}
            <Navbar />

            {/* Main Content */}
            <main className="flex-grow pt-5">{children}</main>

            {/* Comprehensive Footer */}
            <Footer />
          </div>

          {/* Global Shopping Cart */}
          <Cart />
        </ClientProviders>
      </body>
    </html>
  );
}

export function generateStaticParams() {
  return [{ locale: "en" }, { locale: "fa" }];
}

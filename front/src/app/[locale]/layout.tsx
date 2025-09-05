import type { Metadata } from "next";
import { ClientProviders } from "@/components/providers/ClientProviders";
import { Navbar } from "@/components/organisms/Navbar";
import Footer from "@/components/organisms/footer";
import Cart from "@/components/organisms/Cart";
import Script from "next/script";
import "../globals.css";

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: _locale } = await params;

  return {
    title: "IRAC | Islamic Architecture Center",
    description: "The online home of the Islamic Architecture Center",
    icons: { icon: "/favicon.ico" },
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

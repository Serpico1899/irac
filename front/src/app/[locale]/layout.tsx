import type { Metadata } from "next";
import { ClientProviders } from "@/components/providers/ClientProviders";
import { Navbar } from "@/components/organisms/Navbar";
import Footer from "@/components/organisms/footer";
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

  return (
    <html lang={locale} dir={isRTL ? "rtl" : "ltr"}>
      <body
        className={`min-h-screen bg-background-light ${isRTL ? "font-arabic" : ""}`}
      >
        <div className="relative flex flex-col min-h-screen">
          {/* Navbar */}
          <Navbar />

          {/* Main Content */}
          <main className="flex-grow pt-5">
            <ClientProviders>{children}</ClientProviders>
          </main>

          {/* Comprehensive Footer */}
          <Footer />
        </div>
      </body>
    </html>
  );
}

export function generateStaticParams() {
  return [{ locale: "en" }, { locale: "fa" }];
}

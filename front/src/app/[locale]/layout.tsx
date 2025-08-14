import type { Metadata } from "next";
import Link from "next/link";
import { ClientProviders } from "@/components/providers/ClientProviders";
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
      <body className={`min-h-screen bg-gray-50 ${isRTL ? "font-arabic" : ""}`}>
        <div className="flex flex-col min-h-screen">
          {/* Simple Header */}
          <header className="bg-white shadow-sm border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16">
                <div className="flex items-center">
                  <h1 className="text-xl font-bold text-gray-900">IRAC</h1>
                </div>
                <div className="flex space-x-4">
                  <Link
                    href="/en"
                    className={`px-3 py-1 rounded text-sm ${
                      locale === "en"
                        ? "bg-blue-100 text-blue-800"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    EN
                  </Link>
                  <Link
                    href="/fa"
                    className={`px-3 py-1 rounded text-sm ${
                      locale === "fa"
                        ? "bg-blue-100 text-blue-800"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    فا
                  </Link>
                </div>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-grow">
            <ClientProviders>{children}</ClientProviders>
          </main>

          {/* Simple Footer */}
          <footer className="bg-gray-800 text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <div className="text-center">
                <p className="text-sm">
                  © 2024 Islamic Architecture Center | All rights reserved
                </p>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}

export function generateStaticParams() {
  return [{ locale: "en" }, { locale: "fa" }];
}

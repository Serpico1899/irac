import type { Metadata } from "next";
import { ClientProviders } from "@/components/providers/ClientProviders";
import { Navbar } from "@/components/organisms/Navbar";
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
        className={`min-h-screen bg-[#F5F7FA] ${isRTL ? "font-arabic" : ""}`}
      >
        <div className="relative flex flex-col min-h-screen">
          {/* Navbar */}
          <Navbar />

          {/* Main Content */}
          <main className="flex-grow pt-24">
            <ClientProviders>{children}</ClientProviders>
          </main>

          {/* Simple Footer */}
          <footer className="bg-[#4A4A4A] text-white mt-auto">
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

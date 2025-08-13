import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import "../globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { AuthInitializer } from "@/components/AuthInitializer";
import { Toaster } from "react-hot-toast";
import { Navbar } from "@/components/organisms/Navbar";
// import { getMe } from '@/app/actions/user/getMe'; // TEMPORARILY DISABLED
import { Footer } from "@/components/organisms/NewFooter";
import { locales } from "@/config/i18n.config";

type Props = {
  children: React.ReactNode;
  params: { locale: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  // FINAL FIX: Await the params object before using it
  const { locale } = await params;
  if (!locales.includes(locale)) notFound();

  const t = await getTranslations({ locale, namespace: "Site" });
  return {
    title: t("title"),
    description: t("description"),
    icons: { icon: "/favicon.ico" },
  };
}

export default async function LocaleLayout({ children, params }: Props) {
  // FINAL FIX: Await the params object before using it
  const { locale } = await params;
  if (!locales.includes(locale)) notFound();

  const messages = await getMessages();
  const navbarT = await getTranslations({ locale, namespace: "Navbar" });
  const footerT = await getTranslations({ locale, namespace: "Footer" });

  // --- TEMPORARY FIX ---
  const isAuthenticated = false;
  const userLevel = null;
  // --- END TEMPORARY FIX ---

  const isRTL = locale === "fa";

  const navbarProps = {
    navigation: navbarT.raw("navigation"),
    dropdownLinks: navbarT.raw("dropdownLinks"),
  };

  const footerTranslations = footerT.raw();

  return (
    <html lang={locale} dir={isRTL ? "rtl" : "ltr"}>
      <body className={isRTL ? "dir-rtl" : ""}>
        <NextIntlClientProvider messages={messages}>
          <AuthProvider>
            <AuthInitializer
              isAuthenticated={isAuthenticated}
              userLevel={userLevel}
            />
            <div className="flex flex-col min-h-screen">
              <Navbar
                navigation={navbarProps.navigation}
                dropdownLinks={navbarProps.dropdownLinks}
              />
              <main className="flex-grow">{children}</main>
              <Footer translations={footerTranslations} />
            </div>
            <Toaster
              position={isRTL ? "top-right" : "top-left"}
              reverseOrder={false}
            />
          </AuthProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

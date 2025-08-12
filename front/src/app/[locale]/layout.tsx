import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import "../globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { AuthInitializer } from "@/components/AuthInitializer";
import { Toaster } from "react-hot-toast";
import { Navbar } from "@/components/organisms/Navbar";
import { getMe } from "@/app/actions/user/getMe";
import { Footer } from "@/components/organisms/NewFooter"; // This should already be here

type Props = {
  children: React.ReactNode;
  params: { locale: string };
};

const locales = ["fa", "en"];

export async function generateMetadata({
  params: { locale },
}: Props): Promise<Metadata> {
  if (!locales.includes(locale)) notFound();
  const t = await getTranslations({ locale, namespace: "Site" });
  return {
    title: t("title"),
    description: t("description"),
    icons: { icon: "/favicon.ico" },
  };
}

export default async function LocaleLayout({
  children,
  params: { locale },
}: Props) {
  if (!locales.includes(locale)) notFound();

  const messages = await getMessages();
  const navbarT = await getTranslations({ locale, namespace: "Navbar" });
  const footerT = await getTranslations({ locale, namespace: "Footer" }); // Fetch Footer translations

  const me = await getMe();
  const isAuthenticated = me.success;
  const userLevel = me.success ? me.body.level : null;
  const isRTL = locale === "fa";

  const navbarProps = {
    navigation: navbarT.raw("navigation"),
    dropdownLinks: navbarT.raw("dropdownLinks"),
  };

  const footerTranslations = footerT.raw(); // Get all footer translations

  return (
    <html lang={locale} dir={isRTL ? "rtl" : "ltr"}>
      <body className={isRTL ? "dir-rtl" : ""}>
        <NextIntlClientProvider messages={messages}>
          <AuthProvider>
            <AuthInitializer
              isAuthenticated={isAuthenticated}
              userLevel={userLevel}
            />
            <div className="h-screen">
              <Navbar
                navigation={navbarProps.navigation}
                dropdownLinks={navbarProps.dropdownLinks}
              />
              <div className="flex-1 p-6 bg-gray-300 mt-16">{children}</div>
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

import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { locales, type Locale } from "@/config/i18n.config";

type Props = {
  params: { locale: string };
};

export default async function HomePage({ params }: Props) {
  const { locale } = await params;

  // Type guard to ensure locale is valid
  if (!locales.includes(locale as Locale)) notFound();

  const typedLocale = locale as Locale;
  const t = await getTranslations({
    locale: typedLocale,
    namespace: "HomePage",
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            {t("welcome")}
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-8 leading-relaxed">
            {t("description")}
          </p>

          {/* Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            <div className="bg-white p-6 rounded-lg shadow-md border">
              <div className="text-2xl mb-2">{t("i18nStatus")}</div>
              <h3 className="font-semibold text-gray-800">{t("status")}</h3>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md border">
              <div className="text-2xl mb-2">{t("tailwindStatus")}</div>
              <h3 className="font-semibold text-gray-800">Tailwind CSS</h3>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md border">
              <div className="text-2xl mb-2">{t("fontStatus")}</div>
              <h3 className="font-semibold text-gray-800">
                {typedLocale === "fa" ? "فونت فارسی" : "Persian Font"}
              </h3>
            </div>
          </div>

          {/* Developer Note */}
          <div className="mt-16 p-6 bg-blue-50 border border-blue-200 rounded-lg text-start">
            <h3 className="text-lg font-semibold text-blue-800 mb-3">
              {t("devNoteTitle")}
            </h3>
            <p className="text-blue-700">{t("devNoteText")}</p>
          </div>
        </div>
      </section>
    </div>
  );
}

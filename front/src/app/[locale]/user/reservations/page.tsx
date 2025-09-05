import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import MyReservations from "@/components/organisms/Workshop/MyReservations";

interface PageProps {
  params: {
    locale: string;
  };
}

export async function generateMetadata({
  params: { locale },
}: PageProps): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "workshop" });

  return {
    title: t("reservations.meta.title"),
    description: t("reservations.meta.description"),
    keywords: t("reservations.meta.keywords"),
    openGraph: {
      title: t("reservations.meta.title"),
      description: t("reservations.meta.description"),
      type: "website",
      locale: locale,
      siteName: "IRAC",
    },
    twitter: {
      card: "summary_large_image",
      title: t("reservations.meta.title"),
      description: t("reservations.meta.description"),
    },
    robots: {
      index: false, // Private user page
      follow: true,
    },
  };
}

export default async function ReservationsPage({ params: { locale } }: PageProps) {
  // Validate locale
  if (!["fa", "en"].includes(locale)) {
    notFound();
  }

  const t = await getTranslations("workshop");

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                {t("reservations.title")}
              </h1>
              <p className="mt-1 text-sm sm:text-base text-gray-600">
                {t("reservations.subtitle")}
              </p>
            </div>

            {/* Quick Stats */}
            <div className="flex flex-wrap gap-4">
              <div className="text-center">
                <div className="text-lg sm:text-xl font-semibold text-blue-600">0</div>
                <div className="text-xs sm:text-sm text-gray-500">{t("reservations.stats.upcoming")}</div>
              </div>
              <div className="text-center">
                <div className="text-lg sm:text-xl font-semibold text-green-600">0</div>
                <div className="text-xs sm:text-sm text-gray-500">{t("reservations.stats.completed")}</div>
              </div>
              <div className="text-center">
                <div className="text-lg sm:text-xl font-semibold text-gray-600">0</div>
                <div className="text-xs sm:text-sm text-gray-500">{t("reservations.stats.total")}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <MyReservations />
      </div>
    </div>
  );
}

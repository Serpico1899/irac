import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import WorkshopCalendar from "@/components/organisms/Workshop/WorkshopCalendar";
import ReservationForm from "@/components/organisms/Workshop/ReservationForm";

interface PageProps {
  params: {
    locale: string;
    slug: string;
  };
}

export async function generateMetadata({
  params: { locale, slug },
}: PageProps): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "workshop" });

  return {
    title: t("reserve.meta.title", { workshop: slug }),
    description: t("reserve.meta.description"),
    keywords: t("reserve.meta.keywords"),
    openGraph: {
      title: t("reserve.meta.title", { workshop: slug }),
      description: t("reserve.meta.description"),
      type: "website",
      locale: locale,
      siteName: "IRAC",
    },
    twitter: {
      card: "summary_large_image",
      title: t("reserve.meta.title", { workshop: slug }),
      description: t("reserve.meta.description"),
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function WorkshopReservePage({ params: { locale, slug } }: PageProps) {
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
          <div className="flex flex-col gap-4">
            {/* Breadcrumb */}
            <nav className="flex items-center space-x-2 rtl:space-x-reverse text-sm text-gray-600">
              <a href="/" className="hover:text-blue-600 transition-colors">
                {t("breadcrumb.home")}
              </a>
              <span className="mx-2">/</span>
              <a href="/workshops" className="hover:text-blue-600 transition-colors">
                {t("breadcrumb.workshops")}
              </a>
              <span className="mx-2">/</span>
              <span className="text-gray-900 capitalize">{slug.replace("-", " ")}</span>
              <span className="mx-2">/</span>
              <span className="text-blue-600">{t("reserve.title")}</span>
            </nav>

            {/* Page Title */}
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                {t("reserve.pageTitle")}
              </h1>
              <p className="mt-1 text-sm sm:text-base text-gray-600">
                {t("reserve.subtitle")}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Workshop Details & Calendar - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Workshop Info Card */}
            <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Workshop Image */}
                <div className="w-full sm:w-48 h-48 sm:h-32 bg-gray-200 rounded-lg flex-shrink-0">
                  <div className="w-full h-full rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <span className="text-white font-medium text-sm capitalize">
                      {slug.replace("-", " ")}
                    </span>
                  </div>
                </div>

                {/* Workshop Details */}
                <div className="flex-1 space-y-3">
                  <div>
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-900 capitalize">
                      {slug.replace("-", " ")} {t("reserve.workshop")}
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                      {t("reserve.workshopDescription")}
                    </p>
                  </div>

                  {/* Quick Info */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
                    <div>
                      <span className="text-gray-500">{t("reserve.info.duration")}:</span>
                      <div className="font-medium">4 {t("common.hours")}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">{t("reserve.info.level")}:</span>
                      <div className="font-medium">{t("levels.intermediate")}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">{t("reserve.info.price")}:</span>
                      <div className="font-medium text-blue-600">
                        2,500,000 {t("common.currency")}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-500">{t("reserve.info.instructor")}:</span>
                      <div className="font-medium">{t("reserve.info.instructorName")}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">{t("reserve.info.capacity")}:</span>
                      <div className="font-medium">15 {t("common.people")}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">{t("reserve.info.language")}:</span>
                      <div className="font-medium">
                        {locale === "fa" ? t("languages.persian") : t("languages.english")}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Available Schedules & Calendar */}
            <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6">
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {t("reserve.availableSchedules")}
                </h3>
                <p className="text-sm text-gray-600">
                  {t("reserve.selectSchedule")}
                </p>
              </div>

              <WorkshopCalendar workshopSlug={slug} />
            </div>

            {/* Workshop Features */}
            <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {t("reserve.features.title")}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  t("reserve.features.handson"),
                  t("reserve.features.materials"),
                  t("reserve.features.certificate"),
                  t("reserve.features.refreshments"),
                  t("reserve.features.support"),
                  t("reserve.features.networking"),
                ].map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                    <span className="text-sm text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Reservation Form - Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-6">
              <ReservationForm workshopSlug={slug} />
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* What You'll Learn */}
          <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {t("reserve.learn.title")}
            </h3>
            <ul className="space-y-3">
              {[
                t("reserve.learn.item1"),
                t("reserve.learn.item2"),
                t("reserve.learn.item3"),
                t("reserve.learn.item4"),
              ].map((item, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-sm text-gray-700">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Prerequisites */}
          <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {t("reserve.prerequisites.title")}
            </h3>
            <ul className="space-y-3">
              {[
                t("reserve.prerequisites.item1"),
                t("reserve.prerequisites.item2"),
                t("reserve.prerequisites.item3"),
              ].map((item, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-sm text-gray-700">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Policies */}
        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4 sm:p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {t("reserve.policies.title")}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
            <div>
              <h4 className="font-medium mb-2">{t("reserve.policies.cancellation.title")}</h4>
              <p>{t("reserve.policies.cancellation.description")}</p>
            </div>
            <div>
              <h4 className="font-medium mb-2">{t("reserve.policies.rescheduling.title")}</h4>
              <p>{t("reserve.policies.rescheduling.description")}</p>
            </div>
            <div>
              <h4 className="font-medium mb-2">{t("reserve.policies.payment.title")}</h4>
              <p>{t("reserve.policies.payment.description")}</p>
            </div>
            <div>
              <h4 className="font-medium mb-2">{t("reserve.policies.attendance.title")}</h4>
              <p>{t("reserve.policies.attendance.description")}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

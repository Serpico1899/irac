import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import ReferralDashboard from "@/components/organisms/Referral/ReferralDashboard";

interface PageProps {
  params: {
    locale: string;
  };
}

export async function generateMetadata({
  params: { locale },
}: PageProps): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "referral" });

  return {
    title: t("meta.title"),
    description: t("meta.description"),
    keywords: t("meta.keywords"),
    openGraph: {
      title: t("meta.title"),
      description: t("meta.description"),
      type: "website",
      locale: locale,
    },
    twitter: {
      card: "summary_large_image",
      title: t("meta.title"),
      description: t("meta.description"),
    },
  };
}

export default async function ReferralsPage({ params: { locale } }: PageProps) {
  // Validate locale
  if (!["fa", "en"].includes(locale)) {
    notFound();
  }

  const t = await getTranslations("referral");

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                {t("page.title")}
              </h1>
              <p className="text-gray-600 mt-1">{t("page.subtitle")}</p>
            </div>

            {/* Breadcrumb for larger screens */}
            <nav className="hidden sm:flex" aria-label="Breadcrumb">
              <ol className="flex items-center space-x-2 text-sm">
                <li>
                  <a
                    href={`/${locale}/user/dashboard`}
                    className="text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    {t("breadcrumb.dashboard")}
                  </a>
                </li>
                <li>
                  <span className="text-gray-400 mx-2">/</span>
                </li>
                <li className="text-gray-900 font-medium">
                  {t("breadcrumb.referrals")}
                </li>
              </ol>
            </nav>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="space-y-6 sm:space-y-8">
          {/* Mobile Back Button */}
          <div className="sm:hidden">
            <a
              href={`/${locale}/user/dashboard`}
              className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              {t("back.dashboard")}
            </a>
          </div>

          {/* Dashboard Component */}
          <ReferralDashboard locale={locale} />

          {/* Quick Actions Cards for Mobile */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <svg
                    className="w-6 h-6 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {t("quickActions.inviteFriends")}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {t("quickActions.inviteDescription")}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <svg
                    className="w-6 h-6 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {t("quickActions.createGroup")}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {t("quickActions.groupDescription")}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow sm:col-span-2 lg:col-span-1">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <svg
                    className="w-6 h-6 text-purple-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {t("quickActions.viewHistory")}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {t("quickActions.historyDescription")}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Help Section */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 sm:p-8 rounded-xl border border-blue-200">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg flex-shrink-0">
                <svg
                  className="w-6 h-6 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {t("help.title")}
                </h3>
                <p className="text-gray-600 text-sm sm:text-base">
                  {t("help.description")}
                </p>
              </div>
              <div className="flex-shrink-0 w-full sm:w-auto">
                <a
                  href={`/${locale}/help/referrals`}
                  className="inline-flex items-center justify-center w-full sm:w-auto px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {t("help.learnMore")}
                  <svg
                    className="w-4 h-4 ml-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

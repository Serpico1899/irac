import { getTranslations } from "next-intl/server";
import { Link } from "@/lib/navigation";

export default async function NotFound() {
  const t = await getTranslations("NotFound");

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-md mx-auto text-center px-4">
        {/* 404 Number */}
        <div className="text-6xl md:text-8xl font-bold text-gray-300 mb-4">
          404
        </div>

        {/* Title */}
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
          {t("title")}
        </h1>

        {/* Description */}
        <p className="text-gray-600 mb-8 leading-relaxed">{t("description")}</p>

        {/* Action Buttons */}
        <div className="space-y-4">
          <Link
            href="/"
            className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
          >
            {t("backHome")}
          </Link>

          <div className="text-sm text-gray-500">
            {t("or")}{" "}
            <button
              onClick={() => window.history.back()}
              className="text-blue-600 hover:text-blue-800 underline"
            >
              {t("goBack")}
            </button>
          </div>
        </div>

        {/* Decorative Element */}
        <div className="mt-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full">
            <svg
              className="w-8 h-8 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.467-.881-6.08-2.33"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

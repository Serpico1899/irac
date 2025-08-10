import { useTranslations } from "next-intl";

export default function HomePage() {
  const t = useTranslations("Site");
  const tNav = useTranslations("Navigation");

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="max-w-4xl mx-auto text-center p-8">
        {/* Main Title */}
        <div className="animate-fade-in">
          <h1 className="text-5xl md:text-7xl font-bold text-gray-800 mb-6">
            {t("title")}
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-8">
            {t("description")}
          </p>
        </div>

        {/* Welcome Message */}
        <div className="animate-slide-up-delay">
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <h2 className="text-3xl font-semibold text-gray-800 mb-4">
              {t("welcome")}
            </h2>
            <p className="text-gray-600 text-lg">
              این صفحه نشان‌دهنده عملکرد صحیح سیستم چندزبانه و ساختار جدید پروژه
              است.
            </p>
          </div>
        </div>

        {/* Navigation Preview */}
        <div className="animate-slide-up-delay-2">
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <h3 className="text-2xl font-semibold text-gray-800 mb-6">
              منوی اصلی
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors cursor-pointer">
                <span className="text-blue-700 font-medium">
                  {tNav("home")}
                </span>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors cursor-pointer">
                <span className="text-blue-700 font-medium">
                  {tNav("about")}
                </span>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors cursor-pointer">
                <span className="text-blue-700 font-medium">
                  {tNav("projects")}
                </span>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors cursor-pointer">
                <span className="text-blue-700 font-medium">
                  {tNav("research")}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Status Indicators */}
        <div className="animate-slide-up-delay-3">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h3 className="text-2xl font-semibold text-gray-800 mb-6">
              وضعیت سیستم
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-center justify-center p-4 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-3 space-x-reverse">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-green-700 font-medium">
                    ✅ چندزبانه (i18n)
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-center p-4 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-3 space-x-reverse">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-green-700 font-medium">
                    ✅ Tailwind CSS
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-center p-4 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-3 space-x-reverse">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-green-700 font-medium">
                    ✅ فونت فارسی
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Development Note */}
        <div className="animate-slide-up-delay-4">
          <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-xl">
            <p className="text-blue-800 text-sm">
              <strong>نکته برای توسعه‌دهندگان:</strong> این صفحه موقتی است و
              باید با محتوای اصلی جایگزین شود. ساختار i18n، Tailwind CSS و
              کامپوننت‌های موجود آماده استفاده هستند.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

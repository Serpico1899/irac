import ContentCard from "@/components/organisms/ContentCard";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Sample courses data - will be replaced with real data later
  const sampleCourses = [
    {
      href: `/${locale}/courses/islamic-geometry`,
      imageUrl:
        "https://images.unsplash.com/photo-1519452575417-564c1401ecc0?w=400&h=300&fit=crop",
      title:
        locale === "fa"
          ? "مقدمه‌ای بر هندسه اسلامی"
          : "Introduction to Islamic Geometry",
      description:
        locale === "fa"
          ? "اصول بنیادین هندسه اسلامی و کاربرد آن در معماری کلاسیک را فرا بگیرید."
          : "Learn the foundational principles of Islamic geometry and its application in classical architecture.",
      badgeText: locale === "fa" ? "جدید" : "New",
    },
    {
      href: `/${locale}/courses/kufic-calligraphy`,
      imageUrl:
        "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop",
      title:
        locale === "fa" ? "کارگاه خوشنویسی کوفی" : "Kufic Calligraphy Workshop",
      description:
        locale === "fa"
          ? "کارگاه عملی برای یادگیری هنر خوشنویسی کوفی و کاربرد آن در معماری."
          : "A hands-on workshop for mastering the art of Kufic calligraphy and its architectural applications.",
    },
    {
      href: `/${locale}/courses/dome-architecture`,
      imageUrl:
        "https://images.unsplash.com/photo-1539650116574-75c0c6d73c5e?w=400&h=300&fit=crop",
      title: locale === "fa" ? "معماری گنبدها" : "The Architecture of Domes",
      description:
        locale === "fa"
          ? "بررسی تاریخی و ساختاری گنبدهای اسلامی و تکنیک‌های ساخت آنها."
          : "A historical and structural survey of Islamic domes and their construction techniques.",
      badgeText: locale === "fa" ? "محبوب" : "Featured",
    },
    {
      href: `/${locale}/courses/muqarnas-design`,
      imageUrl:
        "https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=400&h=300&fit=crop",
      title: locale === "fa" ? "طراحی مقرنس" : "Muqarnas Design",
      description:
        locale === "fa"
          ? "فن پیچیده مقرنس و نحوه طراحی و اجرای این عنصر معماری منحصربه‌فرد."
          : "The intricate art of muqarnas design and how to create these unique architectural elements.",
    },
    {
      href: `/${locale}/courses/islamic-garden-design`,
      imageUrl:
        "https://images.unsplash.com/photo-1574263867128-a3d5c1b1deaa?w=400&h=300&fit=crop",
      title: locale === "fa" ? "طراحی باغ اسلامی" : "Islamic Garden Design",
      description:
        locale === "fa"
          ? "اصول طراحی باغ‌های اسلامی و نمادگرایی آنها در فرهنگ اسلامی."
          : "Learn the principles of Islamic garden design and their symbolism in Islamic culture.",
    },
    {
      href: `/${locale}/courses/restoration-techniques`,
      imageUrl:
        "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400&h=300&fit=crop",
      title: locale === "fa" ? "تکنیک‌های مرمت" : "Restoration Techniques",
      description:
        locale === "fa"
          ? "روش‌های مدرن مرمت و حفاظت از بناهای تاریخی اسلامی."
          : "Modern methods for restoring and preserving historic Islamic monuments.",
      badgeText: locale === "fa" ? "پیشرفته" : "Advanced",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-stone-50 to-gray-100">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 via-indigo-50/30 to-white py-16 sm:py-20 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-800 mb-8 tracking-tight">
              {locale === "fa"
                ? "مرکز معماری اسلامی"
                : "Islamic Architecture Center"}
            </h1>
            <div className="w-32 h-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 mx-auto mb-8 rounded-full shadow-lg"></div>
            <p className="text-xl sm:text-2xl lg:text-3xl text-gray-700 max-w-4xl mx-auto leading-relaxed font-medium">
              {locale === "fa"
                ? "به دنیای زیبای معماری اسلامی خوش آمدید. دوره‌ها و کارگاه‌های تخصصی ما را کشف کنید."
                : "Welcome to the beautiful world of Islamic architecture. Discover our specialized courses and workshops."}
            </p>
          </div>
        </div>
      </section>

      {/* Featured Courses Section */}
      <section className="py-16 sm:py-20 lg:py-28 bg-white/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-16 lg:mb-20">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-800 mb-6 tracking-tight">
              {locale === "fa"
                ? "دوره‌ها و کارگاه‌های ویژه"
                : "Featured Courses & Workshops"}
            </h2>
            <div className="w-32 h-1.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 mx-auto rounded-full shadow-lg mb-6"></div>
            <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed font-medium">
              {locale === "fa"
                ? "مجموعه‌ای از بهترین دوره‌ها و کارگاه‌های معماری اسلامی"
                : "Discover our curated collection of exceptional Islamic architecture courses"}
            </p>
          </div>

          {/* Courses Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 lg:gap-10">
            {sampleCourses.map((course, index) => (
              <div
                key={course.href}
                className="animate-fadeInUp"
                style={{
                  animationDelay: `${index * 100}ms`,
                  animationFillMode: "both",
                }}
              >
                <ContentCard
                  href={course.href}
                  imageUrl={course.imageUrl}
                  title={course.title}
                  description={course.description}
                  badgeText={course.badgeText}
                />
              </div>
            ))}
          </div>

          {/* View All Courses Button */}
          <div className="text-center mt-16 lg:mt-20">
            <a
              href={`/${locale}/courses`}
              className="inline-flex items-center px-10 py-5 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white font-semibold rounded-xl shadow-xl hover:shadow-2xl hover:shadow-blue-200/50 transform hover:scale-105 hover:-translate-y-1 transition-all duration-500 focus:outline-none focus:ring-4 focus:ring-blue-300 focus:ring-offset-2"
            >
              <span className="ltr:mr-2 rtl:ml-2">
                {locale === "fa" ? "مشاهده همه دوره‌ها" : "View All Courses"}
              </span>
              <svg
                className={`w-5 h-5 transition-transform duration-300 group-hover:translate-x-1 ${
                  locale === "fa" ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </a>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="bg-gradient-to-br from-gray-800 via-gray-900 to-black py-16 sm:py-20 lg:py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/20 via-indigo-900/20 to-purple-900/20"></div>
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-8 tracking-tight">
            {locale === "fa" ? "آماده شروع هستید؟" : "Ready to Get Started?"}
          </h2>
          <p className="text-xl sm:text-2xl text-gray-200 mb-12 leading-relaxed font-medium max-w-3xl mx-auto">
            {locale === "fa"
              ? "با ما در سفر کشف معماری اسلامی همراه شوید و دانش خود را گسترش دهید."
              : "Join us on a journey of discovering Islamic architecture and expand your knowledge."}
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <a
              href={`/${locale}/courses`}
              className="inline-flex items-center justify-center px-10 py-5 bg-white text-gray-900 font-semibold rounded-xl shadow-xl hover:bg-gray-50 hover:shadow-2xl transform hover:scale-105 hover:-translate-y-1 transition-all duration-500 focus:outline-none focus:ring-4 focus:ring-white focus:ring-offset-4 focus:ring-offset-gray-800"
            >
              {locale === "fa" ? "مرور دوره‌ها" : "Browse Courses"}
            </a>
            <a
              href={`/${locale}/about`}
              className="inline-flex items-center justify-center px-10 py-5 border-2 border-white/80 text-white font-semibold rounded-xl backdrop-blur-sm hover:bg-white/10 hover:border-white transform hover:scale-105 hover:-translate-y-1 transition-all duration-500 focus:outline-none focus:ring-4 focus:ring-white/50 focus:ring-offset-4 focus:ring-offset-gray-800"
            >
              {locale === "fa" ? "درباره ما" : "Learn More"}
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

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
      href: `/${locale}/courses/persian-garden-design`,
      imageUrl:
        "https://images.unsplash.com/photo-1574263867128-a3d5c1b1deaa?w=400&h=300&fit=crop",
      title: locale === "fa" ? "طراحی باغ پارسی" : "Persian Garden Design",
      description:
        locale === "fa"
          ? "اصول طراحی باغ‌های پارسی و نمادگرایی آنها در فرهنگ ایرانی."
          : "Learn the principles of Persian garden design and their symbolism in Iranian culture.",
      badgeText: locale === "fa" ? "کلاسیک" : "Classic",
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

  const heroTitle =
    locale === "fa"
      ? "زیبایی معماری اسلامی را کاوش کنید"
      : "Explore the Beauty of Islamic Architecture";

  const heroSubtitle =
    locale === "fa"
      ? "اصول جاودانه را از طریق دوره‌ها، کارگاه‌ها و منابع ما کشف کنید."
      : "Discover timeless principles through our courses, workshops, and resources.";

  return (
    <div
      className="min-h-screen relative"
      style={{
        backgroundImage: `
          url("data:image/svg+xml,%3Csvg width='120' height='120' viewBox='0 0 120 120' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23d4af37' fill-opacity='0.03'%3E%3Cpath d='M60 60L30 90L0 60L30 30zM90 90L60 120L30 90L60 60zM120 60L90 30L60 60L90 90z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E"),
          linear-gradient(135deg, #fdfcfb 0%, #f7f4f1 25%, #f9f7f4 50%, #faf8f5 75%, #fbf9f6 100%)
        `,
        backgroundSize: "120px 120px, 100% 100%",
      }}
    >
      {/* Hero Section */}
      <section
        className="relative min-h-screen flex items-center justify-center overflow-hidden"
        style={{
          backgroundImage: `
            linear-gradient(
              135deg,
              rgba(17, 94, 153, 0.85) 0%,
              rgba(91, 33, 82, 0.8) 20%,
              rgba(184, 59, 94, 0.75) 40%,
              rgba(212, 175, 55, 0.7) 60%,
              rgba(17, 94, 153, 0.8) 80%,
              rgba(42, 67, 101, 0.85) 100%
            ),
            url('https://images.unsplash.com/photo-1539650116574-75c0c6d73c5e?w=1920&h=1080&fit=crop&q=90')
          `,
          backgroundSize: "cover",
          backgroundPosition: "center center",
          backgroundRepeat: "no-repeat",
          backgroundAttachment: "fixed",
        }}
      >
        {/* Persian Geometric Pattern Overlay */}
        <div
          className="absolute inset-0 opacity-15"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='200' height='200' viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M100 0L150 50L100 100L50 50zM100 100L150 150L100 200L50 150zM200 100L150 50L100 100L150 150zM0 100L50 50L100 100L50 150z'/%3E%3Cpath d='M100 50L125 75L100 100L75 75zM100 150L125 125L100 100L75 125z' fill='%23d4af37'/%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: "200px 200px",
          }}
        />

        {/* Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="animate-fade-in">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-black text-white mb-8 tracking-tight leading-tight text-shadow-hero">
              {heroTitle}
            </h1>

            {/* Persian-Inspired Decorative Line */}
            <div className="animate-fade-in-delay flex justify-center mb-8">
              <div className="w-48 sm:w-56 lg:w-64 h-2 bg-gradient-to-r from-transparent via-amber-300 to-transparent rounded-full shadow-lg opacity-90 relative">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-200 to-transparent rounded-full blur-sm"></div>
              </div>
            </div>

            <p className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl text-white/95 max-w-5xl mx-auto leading-relaxed font-semibold mb-16 animate-fade-in-delay text-shadow-elegant">
              {heroSubtitle}
            </p>

            {/* Persian-Inspired CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-8 justify-center items-center animate-fade-in-delay-2">
              <a
                href={`/${locale}/courses`}
                className="group inline-flex items-center justify-center px-12 py-6 bg-gradient-to-r from-persian-blue to-royal-blue text-white font-bold text-xl rounded-2xl shadow-2xl hover:shadow-persian-blue/30 hover:bg-gradient-to-r hover:from-royal-blue hover:to-persian-blue transform hover:scale-105 hover:-translate-y-2 transition-all duration-500 focus:outline-none focus:ring-4 focus:ring-white/50 focus:ring-offset-4 focus:ring-offset-transparent min-w-[240px] border border-white/20"
                style={{
                  background:
                    "linear-gradient(135deg, #115e99 0%, #2a4365 100%)",
                }}
              >
                <span className="ltr:mr-3 rtl:ml-3">
                  {locale === "fa" ? "مشاهده دوره‌ها" : "View Courses"}
                </span>
                <svg
                  className={`w-6 h-6 transition-transform duration-300 group-hover:translate-x-1 ${
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
                    strokeWidth={2.5}
                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                  />
                </svg>
              </a>

              <a
                href={`/${locale}/workshops`}
                className="group inline-flex items-center justify-center px-12 py-6 border-2 border-amber-300/80 text-white font-bold text-xl rounded-2xl backdrop-blur-sm hover:bg-amber-300/15 hover:border-amber-200 transform hover:scale-105 hover:-translate-y-2 transition-all duration-500 focus:outline-none focus:ring-4 focus:ring-amber-300/50 focus:ring-offset-4 focus:ring-offset-transparent min-w-[240px]"
              >
                <span className="ltr:mr-3 rtl:ml-3">
                  {locale === "fa" ? "کارگاه‌ها" : "Workshops"}
                </span>
                <svg
                  className={`w-6 h-6 transition-transform duration-300 group-hover:translate-x-1 ${
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
                    strokeWidth={2.5}
                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                  />
                </svg>
              </a>
            </div>
          </div>

          {/* Persian-Inspired Scroll Indicator */}
          <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce">
            <div className="w-6 h-12 border-2 border-white/70 rounded-full flex justify-center bg-white/5 backdrop-blur-sm">
              <div className="w-1.5 h-4 bg-gradient-to-b from-amber-300 to-white/80 rounded-full mt-2 animate-pulse" />
            </div>
          </div>
        </div>
      </section>

      {/* Featured Courses Section */}
      <section
        className="py-24 sm:py-28 lg:py-36 relative"
        style={{
          backgroundImage: `
            url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23115e99' fill-opacity='0.02'%3E%3Cpath d='M50 50L25 75L0 50L25 25zM75 75L50 100L25 75L50 50zM100 50L75 25L50 50L75 75z'/%3E%3Cpath d='M50 25L62.5 37.5L50 50L37.5 37.5z' fill='%23d4af37' fill-opacity='0.03'/%3E%3C/g%3E%3C/svg%3E"),
            linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(253,252,251,0.9) 50%, rgba(255,255,255,0.95) 100%)
          `,
          backgroundSize: "100px 100px, 100% 100%",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-24 lg:mb-28 animate-slide-up">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black text-gray-900 mb-8 tracking-tight leading-tight">
              {locale === "fa"
                ? "دوره‌ها و کارگاه‌های ویژه"
                : "Featured Courses & Workshops"}
            </h2>

            {/* Persian Decorative Element */}
            <div className="flex justify-center mb-8">
              <div className="w-48 sm:w-56 lg:w-64 h-1.5 bg-gradient-to-r from-transparent via-persian-blue to-transparent rounded-full shadow-lg relative">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-400/50 to-transparent rounded-full blur-sm"></div>
              </div>
            </div>

            <p className="text-lg sm:text-xl lg:text-2xl text-gray-700 max-w-4xl mx-auto leading-relaxed font-medium">
              {locale === "fa"
                ? "مجموعه‌ای از بهترین دوره‌ها و کارگاه‌های معماری اسلامی که توسط استادان برجسته طراحی شده‌اند"
                : "Discover our carefully curated collection of exceptional Islamic architecture courses designed by distinguished masters"}
            </p>
          </div>

          {/* Courses Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10 lg:gap-12">
            {sampleCourses.map((course, index) => (
              <div
                key={course.href}
                className={`animate-slide-up-delay-${index + 1}`}
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
          <div className="text-center mt-24 lg:mt-28 animate-slide-up-delay-7">
            <a
              href={`/${locale}/courses`}
              className="group inline-flex items-center px-16 py-6 bg-gradient-to-r from-persian-blue via-royal-blue to-persian-blue text-white font-bold text-xl rounded-2xl shadow-2xl hover:shadow-persian-blue/30 transform hover:scale-105 hover:-translate-y-2 transition-all duration-500 focus:outline-none focus:ring-4 focus:ring-persian-blue/30 focus:ring-offset-2 border border-white/20"
              style={{
                background:
                  "linear-gradient(135deg, #115e99 0%, #2a4365 50%, #115e99 100%)",
              }}
            >
              <span className="ltr:mr-4 rtl:ml-4">
                {locale === "fa" ? "مشاهده همه دوره‌ها" : "View All Courses"}
              </span>
              <svg
                className={`w-6 h-6 transition-transform duration-300 group-hover:translate-x-1 ${
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
                  strokeWidth={2.5}
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </a>
          </div>
        </div>
      </section>

      {/* Call to Action Section - Persian Inspired */}
      <section className="relative py-24 sm:py-28 lg:py-36 overflow-hidden">
        {/* Persian Architecture Background */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(135deg, rgba(42, 67, 101, 0.92) 0%, rgba(91, 33, 82, 0.88) 25%, rgba(184, 59, 94, 0.85) 50%, rgba(212, 175, 55, 0.8) 75%, rgba(17, 94, 153, 0.9) 100%),
              url('https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=1920&h=1080&fit=crop&q=90')
            `,
            backgroundSize: "cover",
            backgroundPosition: "center center",
            backgroundAttachment: "fixed",
          }}
        />

        {/* Persian Geometric Pattern Overlay */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='160' height='160' viewBox='0 0 160 160' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M80 80L40 120L0 80L40 40zM120 120L80 160L40 120L80 80zM160 80L120 40L80 80L120 120z'/%3E%3Cpath d='M80 40L100 60L80 80L60 60zM80 120L100 100L80 80L60 100z' fill='%23d4af37' fill-opacity='0.8'/%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: "160px 160px",
          }}
        />

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black text-white mb-8 tracking-tight leading-tight text-shadow-hero animate-slide-up">
            {locale === "fa"
              ? "آماده شروع سفر معنوی هستید؟"
              : "Ready to Begin Your Spiritual Journey?"}
          </h2>

          {/* Persian Decorative Element */}
          <div className="animate-slide-up-delay flex justify-center mb-12">
            <div className="w-56 sm:w-64 lg:w-72 h-2 bg-gradient-to-r from-transparent via-amber-300 to-transparent rounded-full shadow-lg relative">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-200 to-transparent rounded-full blur-sm"></div>
            </div>
          </div>

          <p className="text-xl sm:text-2xl lg:text-3xl text-white/95 mb-16 leading-relaxed font-semibold max-w-5xl mx-auto text-shadow-elegant animate-slide-up-delay-2">
            {locale === "fa"
              ? "با ما در سفر کشف معماری اسلامی همراه شوید و دانش خود را با بهترین اساتید و متخصصان ایرانی گسترش دهید"
              : "Join us on a transformative journey of discovering Islamic architecture and expand your knowledge with the finest Iranian masters and experts"}
          </p>

          <div className="flex flex-col sm:flex-row gap-8 justify-center items-center animate-slide-up-delay-3">
            <a
              href={`/${locale}/courses`}
              className="group inline-flex items-center justify-center px-14 py-6 bg-gradient-to-r from-amber-500 to-amber-600 text-gray-900 font-bold text-xl rounded-2xl shadow-2xl hover:bg-gradient-to-r hover:from-amber-400 hover:to-amber-500 hover:shadow-amber-300/30 transform hover:scale-105 hover:-translate-y-2 transition-all duration-500 focus:outline-none focus:ring-4 focus:ring-amber-300 focus:ring-offset-4 focus:ring-offset-gray-800 min-w-[260px]"
            >
              <span className="ltr:mr-3 rtl:ml-3">
                {locale === "fa" ? "مرور دوره‌ها" : "Browse Courses"}
              </span>
              <svg
                className={`w-6 h-6 transition-transform duration-300 group-hover:translate-x-1 ${
                  locale === "fa" ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </a>

            <a
              href={`/${locale}/about`}
              className="group inline-flex items-center justify-center px-14 py-6 border-2 border-white/80 text-white font-bold text-xl rounded-2xl backdrop-blur-sm hover:bg-white/10 hover:border-white transform hover:scale-105 hover:-translate-y-2 transition-all duration-500 focus:outline-none focus:ring-4 focus:ring-white/50 focus:ring-offset-4 focus:ring-offset-gray-800 min-w-[260px]"
            >
              <span className="ltr:mr-3 rtl:ml-3">
                {locale === "fa" ? "درباره ما" : "Learn More"}
              </span>
              <svg
                className={`w-6 h-6 transition-transform duration-300 group-hover:translate-x-1 ${
                  locale === "fa" ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

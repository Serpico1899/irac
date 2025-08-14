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
          url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23e2e8f0' fill-opacity='0.05'%3E%3Cpath d='M30 30L15 45L0 30L15 15zM45 45L30 60L15 45L30 30zM60 30L45 15L30 30L45 45z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E"),
          linear-gradient(135deg, #fafafa 0%, #f5f5f4 25%, #f8fafc 50%, #f1f5f9 75%, #fafafa 100%)
        `,
        backgroundSize: "60px 60px, 100% 100%",
      }}
    >
      {/* Hero Section */}
      <section
        className="relative min-h-screen flex items-center justify-center overflow-hidden"
        style={{
          backgroundImage: `
            linear-gradient(
              135deg,
              rgba(30, 58, 138, 0.9) 0%,
              rgba(67, 56, 202, 0.85) 30%,
              rgba(99, 102, 241, 0.8) 60%,
              rgba(79, 70, 229, 0.9) 100%
            ),
            url('https://images.unsplash.com/photo-1564769625392-651b9e2b0c0d?w=1920&h=1080&fit=crop&q=80')
          `,
          backgroundSize: "cover",
          backgroundPosition: "center center",
          backgroundRepeat: "no-repeat",
          backgroundAttachment: "fixed",
        }}
      >
        {/* Islamic Pattern Overlay */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M50 50L25 75L0 50L25 25zM75 75L50 100L25 75L50 50zM100 50L75 25L50 50L75 75z'/%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: "100px 100px",
          }}
        />

        {/* Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="animate-fade-in">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-extrabold text-white mb-8 tracking-tight leading-tight text-shadow-elegant">
              {heroTitle}
            </h1>

            {/* Decorative Line */}
            <div className="animate-fade-in-delay w-32 sm:w-40 lg:w-48 h-1.5 bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-300 mx-auto mb-8 rounded-full shadow-lg opacity-90" />

            <p className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl text-white/95 max-w-5xl mx-auto leading-relaxed font-medium mb-12 animate-fade-in-delay text-shadow-elegant">
              {heroSubtitle}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center animate-fade-in-delay-2">
              <a
                href={`/${locale}/courses`}
                className="group inline-flex items-center justify-center px-10 py-5 bg-white text-gray-900 font-bold text-lg rounded-2xl shadow-2xl hover:shadow-white/20 hover:bg-gray-50 transform hover:scale-105 hover:-translate-y-2 transition-all duration-500 focus:outline-none focus:ring-4 focus:ring-white/50 focus:ring-offset-4 focus:ring-offset-transparent min-w-[200px]"
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
                className="group inline-flex items-center justify-center px-10 py-5 border-2 border-white/80 text-white font-bold text-lg rounded-2xl backdrop-blur-sm hover:bg-white/10 hover:border-white transform hover:scale-105 hover:-translate-y-2 transition-all duration-500 focus:outline-none focus:ring-4 focus:ring-white/50 focus:ring-offset-4 focus:ring-offset-transparent min-w-[200px]"
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

          {/* Scroll Indicator */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
            <div className="w-6 h-10 border-2 border-white/60 rounded-full flex justify-center">
              <div className="w-1 h-3 bg-white/80 rounded-full mt-2 animate-pulse" />
            </div>
          </div>
        </div>
      </section>

      {/* Featured Courses Section */}
      <section className="py-20 sm:py-24 lg:py-32 bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-20 lg:mb-24 animate-slide-up">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold text-gray-900 mb-8 tracking-tight leading-tight">
              {locale === "fa"
                ? "دوره‌ها و کارگاه‌های ویژه"
                : "Featured Courses & Workshops"}
            </h2>

            {/* Decorative Line */}
            <div className="w-32 sm:w-40 lg:w-48 h-1.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 mx-auto rounded-full shadow-lg mb-8" />

            <p className="text-lg sm:text-xl lg:text-2xl text-gray-700 max-w-4xl mx-auto leading-relaxed font-medium">
              {locale === "fa"
                ? "مجموعه‌ای از بهترین دوره‌ها و کارگاه‌های معماری اسلامی که توسط استادان مطرح طراحی شده‌اند"
                : "Discover our carefully curated collection of exceptional Islamic architecture courses designed by renowned masters"}
            </p>
          </div>

          {/* Courses Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 lg:gap-12">
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
          <div className="text-center mt-20 lg:mt-24 animate-slide-up-delay-7">
            <a
              href={`/${locale}/courses`}
              className="group inline-flex items-center px-12 py-6 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white font-bold text-xl rounded-2xl shadow-2xl hover:shadow-blue-200/50 hover:shadow-2xl transform hover:scale-105 hover:-translate-y-2 transition-all duration-500 focus:outline-none focus:ring-4 focus:ring-blue-300 focus:ring-offset-2"
            >
              <span className="ltr:mr-3 rtl:ml-3">
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

      {/* Call to Action Section */}
      <section className="relative py-20 sm:py-24 lg:py-32 overflow-hidden">
        {/* Background with pattern */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(135deg, rgba(17, 24, 39, 0.95) 0%, rgba(55, 65, 81, 0.9) 50%, rgba(17, 24, 39, 0.95) 100%),
              url('https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=1920&h=1080&fit=crop&q=80')
            `,
            backgroundSize: "cover",
            backgroundPosition: "center center",
            backgroundAttachment: "fixed",
          }}
        />

        {/* Pattern Overlay */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.8'%3E%3Cpath d='M40 40L20 60L0 40L20 20zM60 60L40 80L20 60L40 40zM80 40L60 20L40 40L60 60z'/%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: "80px 80px",
          }}
        />

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold text-white mb-8 tracking-tight leading-tight text-shadow-elegant animate-slide-up">
            {locale === "fa" ? "آماده شروع هستید؟" : "Ready to Get Started?"}
          </h2>

          <div className="w-32 sm:w-40 lg:w-48 h-1.5 bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-300 mx-auto mb-12 rounded-full shadow-lg animate-slide-up-delay" />

          <p className="text-xl sm:text-2xl lg:text-3xl text-white/95 mb-16 leading-relaxed font-medium max-w-4xl mx-auto text-shadow-elegant animate-slide-up-delay-2">
            {locale === "fa"
              ? "با ما در سفر کشف معماری اسلامی همراه شوید و دانش خود را با بهترین اساتید و متخصصان گسترش دهید"
              : "Join us on a transformative journey of discovering Islamic architecture and expand your knowledge with the finest masters and experts"}
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center animate-slide-up-delay-3">
            <a
              href={`/${locale}/courses`}
              className="group inline-flex items-center justify-center px-12 py-6 bg-white text-gray-900 font-bold text-xl rounded-2xl shadow-2xl hover:bg-gray-50 hover:shadow-white/20 transform hover:scale-105 hover:-translate-y-2 transition-all duration-500 focus:outline-none focus:ring-4 focus:ring-white focus:ring-offset-4 focus:ring-offset-gray-800 min-w-[220px]"
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
              className="group inline-flex items-center justify-center px-12 py-6 border-2 border-white/80 text-white font-bold text-xl rounded-2xl backdrop-blur-sm hover:bg-white/10 hover:border-white transform hover:scale-105 hover:-translate-y-2 transition-all duration-500 focus:outline-none focus:ring-4 focus:ring-white/50 focus:ring-offset-4 focus:ring-offset-gray-800 min-w-[220px]"
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

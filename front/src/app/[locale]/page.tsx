import Link from "next/link";
import ContentCard from "@/components/organisms/ContentCard";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // i18n text based on locale
  const heroTitle =
    locale === "fa"
      ? "مرکز معماری اسلامی ایراک"
      : "IRAC - Islamic Architecture Center";

  const heroSubtitle =
    locale === "fa"
      ? "آموزش، پژوهش و حفاظت از میراث معماری اسلامی"
      : "Education, Research & Preservation of Islamic Architectural Heritage";

  const featuredCoursesTitle =
    locale === "fa" ? "دوره‌های ویژه" : "Featured Courses";

  const latestArticlesTitle =
    locale === "fa" ? "آخرین مقالات" : "Latest Articles";

  const searchPlaceholder =
    locale === "fa"
      ? "جستجو در دوره‌ها و محتوا..."
      : "Search courses and content...";

  // Sample courses data for Featured Courses section (dark variant)
  const featuredCourses = [
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
      badgeText: locale === "fa" ? "محبوب" : "Popular",
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
      badgeText: locale === "fa" ? "جدید" : "New",
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
      badgeText: locale === "fa" ? "ویژه" : "Featured",
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
      badgeText: locale === "fa" ? "پیشرفته" : "Advanced",
    },
  ];

  // Sample articles data for Latest Articles section (light variant)
  const latestArticles = [
    {
      href: `/${locale}/articles/restoration-project-isfahan`,
      imageUrl:
        "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400&h=300&fit=crop",
      title:
        locale === "fa"
          ? "پروژه مرمت مسجد شاه اصفهان"
          : "Restoration Project: Shah Mosque Isfahan",
      description:
        locale === "fa"
          ? "گزارش کاملی از پروژه مرمت یکی از شاهکارهای معماری صفویه در اصفهان."
          : "A comprehensive report on the restoration project of one of the Safavid architectural masterpieces in Isfahan.",
      badgeText: locale === "fa" ? "مقاله" : "Article",
    },
    {
      href: `/${locale}/articles/interview-master-craftsman`,
      imageUrl:
        "https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=400&h=300&fit=crop",
      title:
        locale === "fa"
          ? "مصاحبه با استاد کاشیکار"
          : "Interview with Master Tile Craftsman",
      description:
        locale === "fa"
          ? "مصاحبه‌ای جذاب با یکی از آخرین استادان کاشیکاری سنتی ایران."
          : "An engaging interview with one of Iran's last traditional tile-making masters.",
      badgeText: locale === "fa" ? "ویدیو" : "Video",
    },
    {
      href: `/${locale}/articles/persian-garden-principles`,
      imageUrl:
        "https://images.unsplash.com/photo-1574263867128-a3d5c1b1deaa?w=400&h=300&fit=crop",
      title:
        locale === "fa"
          ? "اصول طراحی باغ پارسی"
          : "Persian Garden Design Principles",
      description:
        locale === "fa"
          ? "مطالعه عمیق اصول و فلسفه طراحی باغ‌های سنتی ایرانی."
          : "An in-depth study of the principles and philosophy behind traditional Iranian garden design.",
      badgeText: locale === "fa" ? "تحقیق" : "Research",
    },
    {
      href: `/${locale}/articles/contemporary-islamic-architecture`,
      imageUrl:
        "https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=400&h=300&fit=crop",
      title:
        locale === "fa"
          ? "معماری اسلامی معاصر"
          : "Contemporary Islamic Architecture",
      description:
        locale === "fa"
          ? "مجموعه‌ای از نمونه‌های برتر معماری اسلامی معاصر در سراسر جهان."
          : "A collection of outstanding examples of contemporary Islamic architecture worldwide.",
      badgeText: locale === "fa" ? "گالری" : "Gallery",
    },
  ];

  return (
    <div className="bg-[#F5F7FA]">
      {/* Hero Section - Exact match to screenshot */}
      <section className="bg-[#4ECDC4] relative overflow-hidden" dir="rtl">
        <div className="max-w-7xl mx-auto px-6 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left side - Architectural Illustration */}
            <div className="relative flex justify-center lg:justify-start order-2 lg:order-1">
              <div className="relative w-[500px] h-[350px]">
                {/* Main building structure - curved organic shape */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative">
                    {/* Main building - organic curved shape */}
                    <div className="w-80 h-64 bg-gradient-to-br from-orange-300 to-orange-400 relative">
                      {/* Custom curved building shape using clip-path */}
                      <div
                        className="w-full h-full bg-gradient-to-br from-orange-300 to-orange-400 shadow-2xl"
                        style={{
                          clipPath:
                            "polygon(15% 0%, 85% 0%, 100% 20%, 95% 40%, 100% 60%, 85% 100%, 15% 100%, 0% 80%, 5% 60%, 0% 40%, 5% 20%)",
                        }}
                      >
                        {/* Windows and architectural details */}
                        <div className="absolute top-8 left-12 w-8 h-8 bg-blue-500 rounded-sm"></div>
                        <div className="absolute top-8 right-12 w-8 h-8 bg-blue-500 rounded-sm"></div>
                        <div className="absolute top-20 left-16 w-10 h-6 bg-red-400 rounded-sm"></div>
                        <div className="absolute top-20 right-16 w-10 h-6 bg-red-400 rounded-sm"></div>
                        <div className="absolute top-32 left-1/2 transform -translate-x-1/2 w-12 h-8 bg-yellow-500 rounded-sm"></div>
                        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 w-16 h-12 bg-blue-700 rounded-t-lg"></div>

                        {/* Roof elements */}
                        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-6 h-4 bg-red-600 rounded-sm"></div>
                      </div>
                    </div>

                    {/* People figures around the building */}
                    <div
                      className="absolute -bottom-12 -left-16 w-12 h-20 bg-gradient-to-b from-blue-400 to-blue-500 transform -rotate-12"
                      style={{ clipPath: "ellipse(40% 60% at 50% 70%)" }}
                    ></div>
                    <div
                      className="absolute -bottom-8 -right-12 w-10 h-16 bg-gradient-to-b from-green-400 to-green-500 transform rotate-12"
                      style={{ clipPath: "ellipse(40% 60% at 50% 70%)" }}
                    ></div>
                    <div
                      className="absolute -top-8 -left-12 w-8 h-14 bg-gradient-to-b from-purple-400 to-purple-500 transform rotate-6"
                      style={{ clipPath: "ellipse(40% 60% at 50% 70%)" }}
                    ></div>
                    <div
                      className="absolute -top-4 right-4 w-6 h-12 bg-gradient-to-b from-yellow-400 to-yellow-500 transform -rotate-6"
                      style={{ clipPath: "ellipse(40% 60% at 50% 70%)" }}
                    ></div>
                    <div
                      className="absolute bottom-4 left-8 w-7 h-12 bg-gradient-to-b from-pink-400 to-pink-500 transform rotate-3"
                      style={{ clipPath: "ellipse(40% 60% at 50% 70%)" }}
                    ></div>

                    {/* Floating papers/documents */}
                    <div className="absolute -top-12 right-8 w-6 h-8 bg-white transform rotate-12 shadow-lg rounded-sm"></div>
                    <div className="absolute top-6 -right-8 w-5 h-7 bg-white transform -rotate-6 shadow-lg rounded-sm"></div>
                    <div className="absolute -bottom-6 right-12 w-4 h-6 bg-white transform rotate-45 shadow-lg rounded-sm"></div>

                    {/* Decorative circles and elements */}
                    <div className="absolute -top-16 -right-16 w-20 h-20 bg-white bg-opacity-15 rounded-full"></div>
                    <div className="absolute -bottom-16 left-8 w-14 h-14 bg-white bg-opacity-10 rounded-full"></div>
                    <div className="absolute top-16 -left-20 w-10 h-10 bg-white bg-opacity-20 rounded-full"></div>
                    <div className="absolute -top-8 left-16 w-6 h-6 bg-white bg-opacity-25 rounded-full"></div>

                    {/* Small architectural elements */}
                    <div className="absolute top-12 -left-8 w-3 h-8 bg-orange-600 transform rotate-12"></div>
                    <div className="absolute bottom-12 -right-6 w-2 h-6 bg-red-500 transform -rotate-6"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right side - Content */}
            <div className="text-white space-y-12 text-center lg:text-right order-1 lg:order-2">
              <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
                کلیه دوره‌های مرکز معماری
              </h1>

              {/* Circular course buttons - exact match to screenshot */}
              <div className="flex justify-center lg:justify-start gap-8">
                {/* دیوان معماری button */}
                <Link
                  href="/courses/divan-architecture"
                  className="group cursor-pointer"
                >
                  <div className="w-36 h-36 bg-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                    <div className="text-center">
                      <div className="w-12 h-12 bg-[#4ECDC4] rounded-full mx-auto mb-2 flex items-center justify-center shadow-md">
                        <svg
                          className="w-6 h-6 text-white"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 3L2 12h3v8h14v-8h3L12 3zm0 2.69L18.31 12H17v6H7v-6H5.69L12 5.69z" />
                        </svg>
                      </div>
                      <p className="text-sm font-bold text-[#4ECDC4] leading-tight">
                        دیوان
                        <br />
                        معماری
                      </p>
                    </div>
                  </div>
                </Link>

                {/* من اگر مورچه بودم button */}
                <Link
                  href="/courses/ant-perspective"
                  className="group cursor-pointer"
                >
                  <div className="w-36 h-36 bg-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                    <div className="text-center">
                      <div className="w-12 h-12 bg-orange-400 rounded-full mx-auto mb-2 flex items-center justify-center shadow-md">
                        <svg
                          className="w-6 h-6 text-white"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                        </svg>
                      </div>
                      <p className="text-sm font-bold text-orange-400 leading-tight">
                        من اگر
                        <br />
                        مورچه بودم
                      </p>
                    </div>
                  </div>
                </Link>
              </div>

              {/* Search bar */}
              <div className="relative max-w-md mx-auto lg:mx-0">
                <input
                  type="text"
                  placeholder="جستجوی دوره‌ها"
                  className="w-full px-6 py-4 pr-14 bg-white rounded-2xl text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 shadow-lg text-right"
                />
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                  <svg
                    className="w-6 h-6 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Courses Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
              {featuredCoursesTitle}
            </h2>
            <div className="w-24 h-1 bg-[#29A5A1] mx-auto rounded" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredCourses.map((course, index) => (
              <div key={course.href} className="h-full">
                <ContentCard
                  href={course.href}
                  imageUrl={course.imageUrl}
                  title={course.title}
                  description={course.description}
                  badgeText={course.badgeText}
                  variant="dark"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Latest Articles Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
              {latestArticlesTitle}
            </h2>
            <div className="w-24 h-1 bg-[#29A5A1] mx-auto rounded" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {latestArticles.map((article, index) => (
              <div key={article.href} className="h-full">
                <ContentCard
                  href={article.href}
                  imageUrl={article.imageUrl}
                  title={article.title}
                  description={article.description}
                  badgeText={article.badgeText}
                  variant="light"
                />
              </div>
            ))}
          </div>

          {/* View All Button */}
          <div className="text-center mt-12">
            <a
              href={`/${locale}/articles`}
              className="inline-block px-8 py-4 bg-[#29A5A1] text-white font-semibold rounded-lg hover:bg-[#238B87] transition-all duration-300 hover:transform hover:scale-105 shadow-lg"
            >
              {locale === "fa" ? "مشاهده همه مقالات" : "View All Articles"}
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

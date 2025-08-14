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
      {/* Hero Section */}
      <section className="bg-[#29A5A1] py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
              {heroTitle}
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-12 max-w-4xl mx-auto leading-relaxed">
              {heroSubtitle}
            </p>

            {/* Illustration Placeholder */}
            <div className="bg-white/10 rounded-2xl p-12 mb-12 max-w-3xl mx-auto backdrop-blur-sm">
              <div className="w-full h-64 bg-white/20 rounded-lg flex items-center justify-center">
                <div className="text-8xl text-white/60">🏛️</div>
              </div>
              <p className="text-white/80 mt-4 text-lg">
                {locale === "fa"
                  ? "کاوش در زیبایی معماری اسلامی"
                  : "Exploring the Beauty of Islamic Architecture"}
              </p>
            </div>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <input
                  type="text"
                  placeholder={searchPlaceholder}
                  className="w-full px-6 py-4 bg-white rounded-full text-gray-800 placeholder-gray-500 shadow-lg focus:outline-none focus:ring-4 focus:ring-white/30 transition-all duration-300"
                />
                <button className="absolute right-2 rtl:right-auto rtl:left-2 top-2 bg-[#3B5A9D] text-white p-2 rounded-full hover:bg-[#2D4A8C] transition-colors duration-300">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </button>
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

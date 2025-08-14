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

  const bestCoursesTitle = locale === "fa" ? "بهترین دوره‌ها" : "Best Courses";

  const allContentTitle = locale === "fa" ? "تمام محتوا" : "All Content";

  const searchPlaceholder =
    locale === "fa"
      ? "جستجو در دوره‌ها و محتوا..."
      : "Search courses and content...";

  // Quick link cards data
  const quickLinks = [
    {
      href: `/${locale}/courses`,
      title: locale === "fa" ? "دوره‌ها" : "Courses",
      description:
        locale === "fa"
          ? "دوره‌های آموزشی تخصصی"
          : "Specialized educational courses",
      icon: "📚",
    },
    {
      href: `/${locale}/workshops`,
      title: locale === "fa" ? "کارگاه‌ها" : "Workshops",
      description:
        locale === "fa"
          ? "کارگاه‌های عملی و تخصصی"
          : "Practical specialized workshops",
      icon: "🏗️",
    },
  ];

  // Best courses data (dark variant)
  const bestCourses = [
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

  // All content data (light variant)
  const allContent = [
    {
      href: `/${locale}/media/restoration-project-isfahan`,
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
      href: `/${locale}/media/interview-master-craftsman`,
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
      href: `/${locale}/research/persian-garden-principles`,
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
      href: `/${locale}/gallery/contemporary-islamic-architecture`,
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
    <div className="min-h-screen bg-[#F5F7FA]">
      {/* Hero Section */}
      <section className="bg-[#29A5A1] py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
              {heroTitle}
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-12 max-w-4xl mx-auto leading-relaxed">
              {heroSubtitle}
            </p>

            {/* Illustration Placeholder */}
            <div className="bg-white/10 rounded-2xl p-12 mb-12 max-w-2xl mx-auto backdrop-blur-sm">
              <div className="w-full h-48 bg-white/20 rounded-lg flex items-center justify-center">
                <div className="text-6xl text-white/60">🏛️</div>
              </div>
            </div>

            {/* Quick Link Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-12">
              {quickLinks.map((link, index) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group"
                >
                  <div className="flex items-center space-x-4 rtl:space-x-reverse">
                    <div className="text-4xl">{link.icon}</div>
                    <div className="text-left rtl:text-right">
                      <h3 className="text-xl font-bold text-[#4A4A4A] group-hover:text-[#29A5A1] transition-colors duration-300">
                        {link.title}
                      </h3>
                      <p className="text-[#777777] text-sm">
                        {link.description}
                      </p>
                    </div>
                  </div>
                </a>
              ))}
            </div>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <input
                  type="text"
                  placeholder={searchPlaceholder}
                  className="w-full px-6 py-4 bg-white rounded-full text-[#4A4A4A] placeholder-[#777777] shadow-lg focus:outline-none focus:ring-4 focus:ring-white/30 transition-all duration-300"
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

      {/* Best Courses Section */}
      <section className="bg-[#29A5A1] py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              {bestCoursesTitle}
            </h2>
            <div className="w-24 h-1 bg-white/30 mx-auto rounded" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {bestCourses.map((course, index) => (
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

      {/* All Content Section */}
      <section className="bg-[#F5F7FA] py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-[#4A4A4A] mb-4">
              {allContentTitle}
            </h2>
            <div className="w-24 h-1 bg-[#29A5A1] mx-auto rounded" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {allContent.map((content, index) => (
              <div key={content.href} className="h-full">
                <ContentCard
                  href={content.href}
                  imageUrl={content.imageUrl}
                  title={content.title}
                  description={content.description}
                  badgeText={content.badgeText}
                  variant="light"
                />
              </div>
            ))}
          </div>

          {/* View All Button */}
          <div className="text-center mt-12">
            <a
              href={`/${locale}/content`}
              className="inline-block px-8 py-4 bg-[#29A5A1] text-white font-semibold rounded-lg hover:bg-[#238B87] transition-all duration-300 hover:transform hover:scale-105 shadow-lg"
            >
              {locale === "fa" ? "مشاهده همه محتوا" : "View All Content"}
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

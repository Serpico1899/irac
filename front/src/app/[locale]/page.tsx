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
      ? "زیبایی معماری اسلامی را کاوش کنید"
      : "Explore the Beauty of Islamic Architecture";

  const heroSubtitle =
    locale === "fa"
      ? "اصول جاودانه را از طریق دوره‌ها، کارگاه‌ها و منابع ما کشف کنید."
      : "Discover timeless principles through our courses, workshops, and resources.";

  const featuredCoursesTitle =
    locale === "fa"
      ? "دوره‌ها و کارگاه‌های ویژه"
      : "Featured Courses & Workshops";

  const latestArticlesTitle =
    locale === "fa" ? "از رسانه ما" : "From Our Media Center";

  // Placeholder data for courses
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
      badgeText: locale === "fa" ? "محبوب" : "Popular",
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
  ];

  // Placeholder data for articles
  const sampleArticles = [
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
      badgeText: locale === "fa" ? "مقاله جدید" : "New Article",
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
      badgeText: locale === "fa" ? "مصاحبه ویژه" : "Exclusive Interview",
    },
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F8F8F8" }}>
      {/* Hero Section */}
      <section
        className="relative h-screen flex items-center justify-center"
        style={{
          backgroundImage: `
            linear-gradient(
              135deg,
              rgba(51, 51, 51, 0.7) 0%,
              rgba(51, 51, 51, 0.5) 50%,
              rgba(51, 51, 51, 0.7) 100%
            ),
            url('https://images.unsplash.com/photo-1539650116574-75c0c6d73c5e?w=1920&h=1080&fit=crop&q=90')
          `,
          backgroundSize: "cover",
          backgroundPosition: "center center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <h1
            className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight"
            style={{ color: "#FFFFFF" }}
          >
            {heroTitle}
          </h1>

          <p
            className="text-xl md:text-2xl mb-12 leading-relaxed max-w-3xl mx-auto"
            style={{ color: "#FFFFFF" }}
          >
            {heroSubtitle}
          </p>

          <a
            href={`/${locale}/courses`}
            className="inline-block px-8 py-4 text-lg font-semibold rounded-lg transition-all duration-300 hover:transform hover:scale-105 hover:shadow-lg"
            style={{
              backgroundColor: "#FDB913",
              color: "#333333",
            }}
          >
            {locale === "fa" ? "مشاهده دوره‌ها" : "View Courses"}
          </a>
        </div>
      </section>

      {/* Featured Courses Section */}
      <section className="py-20" style={{ backgroundColor: "#FFFFFF" }}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2
              className="text-4xl md:text-5xl font-bold mb-4"
              style={{ color: "#333333" }}
            >
              {featuredCoursesTitle}
            </h2>
            <div
              className="w-24 h-1 mx-auto rounded"
              style={{ backgroundColor: "#FDB913" }}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {sampleCourses.map((course, index) => (
              <div key={course.href} className="h-full">
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
        </div>
      </section>

      {/* Latest Articles Section */}
      <section className="py-20" style={{ backgroundColor: "#F8F8F8" }}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2
              className="text-4xl md:text-5xl font-bold mb-4"
              style={{ color: "#333333" }}
            >
              {latestArticlesTitle}
            </h2>
            <div
              className="w-24 h-1 mx-auto rounded"
              style={{ backgroundColor: "#FDB913" }}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-5xl mx-auto">
            {sampleArticles.map((article, index) => (
              <div key={article.href} className="h-full">
                <ContentCard
                  href={article.href}
                  imageUrl={article.imageUrl}
                  title={article.title}
                  description={article.description}
                  badgeText={article.badgeText}
                />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

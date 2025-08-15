import Link from "next/link";
import ContentCard from "@/components/organisms/ContentCard";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Sample courses data for Featured Courses carousel
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
          ? "اصول بنیادین هندسه اسلامی و کاربرد آن در معماری کلاسیک"
          : "Learn the foundational principles of Islamic geometry and its application in classical architecture",
      price: "2,500,000",
      badgeText: locale === "fa" ? "محبوب" : "Popular",
      badgeColor: "teal" as const,
      level: locale === "fa" ? "پیشرفته" : "Advanced",
      rating: 4.8,
    },
    {
      href: `/${locale}/courses/kufic-calligraphy`,
      imageUrl:
        "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop",
      title: locale === "fa" ? "خوشنویسی کوفی" : "Kufic Calligraphy",
      description:
        locale === "fa"
          ? "هنر باستانی خوشنویسی کوفی و تکنیک‌های مدرن"
          : "Ancient art of Kufic calligraphy and modern techniques",
      price: "1,800,000",
      badgeText: locale === "fa" ? "جدید" : "New",
      badgeColor: "blue" as const,
      level: locale === "fa" ? "متوسط" : "Intermediate",
      rating: 4.6,
    },
    {
      href: `/${locale}/courses/mosque-architecture`,
      imageUrl:
        "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=400&h=300&fit=crop",
      title: locale === "fa" ? "معماری مسجد" : "Mosque Architecture",
      description:
        locale === "fa"
          ? "اصول طراحی و ساخت مساجد در معماری اسلامی"
          : "Design principles and construction of mosques in Islamic architecture",
      price: "3,200,000",
      badgeText: locale === "fa" ? "تخصصی" : "Specialized",
      badgeColor: "green" as const,
      level: locale === "fa" ? "پیشرفته" : "Advanced",
      rating: 4.9,
    },
    {
      href: `/${locale}/courses/persian-garden`,
      imageUrl:
        "https://images.unsplash.com/photo-1548013146-72479768bada?w=400&h=300&fit=crop",
      title: locale === "fa" ? "باغ ایرانی" : "Persian Garden Design",
      description:
        locale === "fa"
          ? "هنر طراحی باغ‌های سنتی ایرانی و اصول آن"
          : "Art of traditional Persian garden design and its principles",
      price: "2,100,000",
      badgeText: locale === "fa" ? "محبوب" : "Popular",
      badgeColor: "orange" as const,
      level: locale === "fa" ? "مقدماتی" : "Beginner",
      rating: 4.7,
    },
    {
      href: `/${locale}/courses/islamic-art`,
      imageUrl:
        "https://images.unsplash.com/photo-1571115764595-644a1f56a55c?w=400&h=300&fit=crop",
      title: locale === "fa" ? "هنر اسلامی" : "Islamic Art & Decoration",
      description:
        locale === "fa"
          ? "بررسی انواع هنرهای اسلامی و تزیینات آن"
          : "Survey of Islamic arts and decorative techniques",
      price: "1,950,000",
      badgeText: locale === "fa" ? "جامع" : "Comprehensive",
      badgeColor: "red" as const,
      level: locale === "fa" ? "متوسط" : "Intermediate",
      rating: 4.5,
    },
  ];

  // Sample articles data for Latest Articles carousel
  const latestArticles = [
    {
      href: `/${locale}/articles/shadow-experience`,
      imageUrl:
        "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400&h=300&fit=crop",
      title:
        locale === "fa"
          ? "تجربه‌ی سایه در معماری ایرانی"
          : "Shadow Experience in Iranian Architecture",
      description:
        locale === "fa"
          ? "بررسی نقش سایه و روشن در خلق فضاهای معماری ایرانی"
          : "Examining the role of shadow and light in creating Iranian architectural spaces",
      author: locale === "fa" ? "دکتر علی محمدی" : "Dr. Ali Mohammadi",
      date: locale === "fa" ? "۱۱ مرداد ۱۴۰۴" : "Aug 2, 2024",
      badgeText: locale === "fa" ? "مقاله" : "Article",
      badgeColor: "teal" as const,
    },
    {
      href: `/${locale}/articles/spatial-hierarchy`,
      imageUrl:
        "https://images.unsplash.com/photo-1539650116574-75c0c6d73c5e?w=400&h=300&fit=crop",
      title:
        locale === "fa"
          ? "سلسله‌مراتب فضایی در مسجد"
          : "Spatial Hierarchy in Mosque Architecture",
      description:
        locale === "fa"
          ? "تحلیل ساختار فضایی مساجد و نقش هندسه مقدس"
          : "Analysis of spatial structure in mosques and the role of sacred geometry",
      author: locale === "fa" ? "استاد حسن رضایی" : "Master Hassan Rezaei",
      date: locale === "fa" ? "۲۲ تیر ۱۴۰۴" : "Jul 13, 2024",
      badgeText: locale === "fa" ? "تحقیق" : "Research",
      badgeColor: "blue" as const,
    },
    {
      href: `/${locale}/articles/sound-experience`,
      imageUrl:
        "https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=400&h=300&fit=crop",
      title:
        locale === "fa"
          ? "تجربه‌ی آوایی در معماری ایرانی"
          : "Acoustic Experience in Iranian Architecture",
      description:
        locale === "fa"
          ? "مطالعه اکوستیک فضاهای سنتی ایرانی و تأثیر آن"
          : "Study of acoustics in traditional Iranian spaces and its impact",
      author: locale === "fa" ? "دکتر مریم احمدی" : "Dr. Maryam Ahmadi",
      date: locale === "fa" ? "۱۲ تیر ۱۴۰۴" : "Jul 3, 2024",
      badgeText: locale === "fa" ? "پژوهش" : "Research",
      badgeColor: "green" as const,
    },
    {
      href: `/${locale}/articles/living-spaces`,
      imageUrl:
        "https://images.unsplash.com/photo-1574263867128-a3d5c1b1deaa?w=400&h=300&fit=crop",
      title:
        locale === "fa"
          ? "فضا برای زیستن، نه فقط دیدن"
          : "Space for Living, Not Just Viewing",
      description:
        locale === "fa"
          ? "نقد رویکردهای صرفاً بصری در معماری مدرن"
          : "Critique of purely visual approaches in modern architecture",
      author: locale === "fa" ? "مهندس سارا کریمی" : "Eng. Sara Karimi",
      date: locale === "fa" ? "۰۱ تیر ۱۴۰۴" : "Jun 22, 2024",
      badgeText: locale === "fa" ? "مقاله" : "Article",
      badgeColor: "orange" as const,
    },
    {
      href: `/${locale}/articles/khayyam-tomb`,
      imageUrl:
        "https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=400&h=300&fit=crop",
      title: locale === "fa" ? "آرامگاه خیام" : "Khayyam's Tomb Architecture",
      description:
        locale === "fa"
          ? "مطالعه معماری آرامگاه حکیم عمر خیام"
          : "Architectural study of Omar Khayyam's tomb",
      author: locale === "fa" ? "دکتر امیر حسینی" : "Dr. Amir Hosseini",
      date: locale === "fa" ? "۲۴ دی ۱۴۰۳" : "Jan 14, 2024",
      badgeText: locale === "fa" ? "تحلیل" : "Analysis",
      badgeColor: "red" as const,
    },
  ];

  // Sample products data for Latest Products carousel
  const latestProducts = [
    {
      href: `/${locale}/shop/architectural-books`,
      imageUrl:
        "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=300&fit=crop",
      title:
        locale === "fa"
          ? "مجموعه کتاب‌های معماری اسلامی"
          : "Islamic Architecture Book Collection",
      description:
        locale === "fa"
          ? "مجموعه کاملی از بهترین کتاب‌های معماری اسلامی"
          : "Complete collection of the finest Islamic architecture books",
      price: "850,000",
      originalPrice: "1,200,000",
      badgeText: locale === "fa" ? "پرفروش" : "Bestseller",
      badgeColor: "teal" as const,
      discount: "25",
    },
    {
      href: `/${locale}/shop/calligraphy-tools`,
      imageUrl:
        "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=400&h=300&fit=crop",
      title:
        locale === "fa"
          ? "ابزار خوشنویسی حرفه‌ای"
          : "Professional Calligraphy Tools",
      description:
        locale === "fa"
          ? "مجموعه کاملی از ابزارهای خوشنویسی دست‌ساز"
          : "Complete set of handcrafted calligraphy tools",
      price: "320,000",
      badgeText: locale === "fa" ? "دست‌ساز" : "Handmade",
      badgeColor: "blue" as const,
      rating: 4.9,
    },
    {
      href: `/${locale}/shop/geometric-patterns`,
      imageUrl:
        "https://images.unsplash.com/photo-1509909756405-be0199881695?w=400&h=300&fit=crop",
      title:
        locale === "fa" ? "الگوهای هندسی اسلامی" : "Islamic Geometric Patterns",
      description:
        locale === "fa"
          ? "مجموعه دیجیتالی از الگوهای هندسی سنتی"
          : "Digital collection of traditional geometric patterns",
      price: "150,000",
      badgeText: locale === "fa" ? "دیجیتال" : "Digital",
      badgeColor: "green" as const,
      rating: 4.7,
    },
    {
      href: `/${locale}/shop/miniature-models`,
      imageUrl:
        "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400&h=300&fit=crop",
      title:
        locale === "fa"
          ? "ماکت‌های معماری کلاسیک"
          : "Classical Architecture Models",
      description:
        locale === "fa"
          ? "ماکت‌های دست‌ساز از شاهکارهای معماری اسلامی"
          : "Handcrafted models of Islamic architectural masterpieces",
      price: "2,400,000",
      badgeText: locale === "fa" ? "محدود" : "Limited",
      badgeColor: "orange" as const,
      rating: 4.8,
    },
  ];

  return (
    <div
      className="bg-[#F5F7FA] min-h-screen"
      dir={locale === "fa" ? "rtl" : "ltr"}
    >
      {/* Hero Section - Reduced Height */}
      <section
        className="bg-[#4ECDC4] relative overflow-hidden h-[110px]"
        dir="rtl"
      >
        <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
          {/* IRAC Intro Text */}
          <div className="flex-1">
            <p className="text-white text-lg font-medium">
              {locale === "fa"
                ? "مرکز پیشرو برای مطالعه و حفاظت از میراث معماری اسلامی."
                : "The premier center for the study and preservation of Islamic architectural heritage."}
            </p>
          </div>

          {/* Larger Search Bar */}
          <div className="flex-1 max-w-2xl">
            <div className="relative">
              <input
                type="text"
                placeholder={
                  locale === "fa"
                    ? "جستجوی دوره‌ها، مقالات و محصولات"
                    : "Search courses, articles and products"
                }
                className="w-full px-8 py-4 pr-16 bg-white rounded-2xl text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 shadow-lg text-right text-lg"
              />
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                <svg
                  className="w-7 h-7 text-gray-400"
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
      </section>

      {/* Featured Courses Carousel Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800">
              {locale === "fa" ? "دوره‌های ویژه" : "Featured Courses"}
            </h2>
          </div>

          {/* Horizontal Scrolling Carousel */}
          <div className="flex overflow-x-auto space-x-4 p-4 snap-x snap-mandatory scrollbar-hide">
            {featuredCourses.map((course, index) => (
              <div key={index} className="snap-center flex-shrink-0 w-80">
                <ContentCard
                  href={course.href}
                  imageUrl={course.imageUrl}
                  title={course.title}
                  description={course.description}
                  price={course.price}
                  badgeText={course.badgeText}
                  badgeColor={course.badgeColor}
                  variant="light"
                  level={course.level}
                  rating={course.rating}
                />
              </div>
            ))}
          </div>

          {/* View All Courses Button */}
          <div className="text-center mt-8">
            <Link
              href={`/${locale}/courses`}
              className="inline-block bg-[#4ECDC4] text-white px-8 py-3 rounded-xl hover:bg-[#45B7B8] transition-colors font-medium shadow-lg"
            >
              {locale === "fa" ? "مشاهده تمام دوره‌ها" : "View All Courses"}
            </Link>
          </div>
        </div>
      </section>

      {/* Latest Articles Carousel Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800">
              {locale === "fa" ? "آخرین مقالات" : "Latest Articles"}
            </h2>
          </div>

          {/* Horizontal Scrolling Carousel */}
          <div className="flex overflow-x-auto space-x-4 p-4 snap-x snap-mandatory scrollbar-hide">
            {latestArticles.map((article, index) => (
              <div key={index} className="snap-center flex-shrink-0 w-80">
                <ContentCard
                  href={article.href}
                  imageUrl={article.imageUrl}
                  title={article.title}
                  description={article.description}
                  badgeText={article.badgeText}
                  badgeColor={article.badgeColor}
                  variant="light"
                  author={article.author}
                  date={article.date}
                />
              </div>
            ))}
          </div>

          {/* View All Articles Button */}
          <div className="text-center mt-8">
            <Link
              href={`/${locale}/articles`}
              className="inline-block bg-[#4ECDC4] text-white px-8 py-3 rounded-xl hover:bg-[#45B7B8] transition-colors font-medium shadow-lg"
            >
              {locale === "fa" ? "مشاهده تمام مقالات" : "View All Articles"}
            </Link>
          </div>
        </div>
      </section>

      {/* Latest Products Carousel Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800">
              {locale === "fa" ? "آخرین محصولات" : "Latest Products"}
            </h2>
          </div>

          {/* Horizontal Scrolling Carousel */}
          <div className="flex overflow-x-auto space-x-4 p-4 snap-x snap-mandatory scrollbar-hide">
            {latestProducts.map((product, index) => (
              <div key={index} className="snap-center flex-shrink-0 w-80">
                <ContentCard
                  href={product.href}
                  imageUrl={product.imageUrl}
                  title={product.title}
                  description={product.description}
                  price={product.price}
                  originalPrice={product.originalPrice}
                  badgeText={product.badgeText}
                  badgeColor={product.badgeColor}
                  variant="light"
                  rating={product.rating}
                  discount={product.discount}
                />
              </div>
            ))}
          </div>

          {/* View All Products Button */}
          <div className="text-center mt-8">
            <Link
              href={`/${locale}/shop`}
              className="inline-block bg-[#4ECDC4] text-white px-8 py-3 rounded-xl hover:bg-[#45B7B8] transition-colors font-medium shadow-lg"
            >
              {locale === "fa" ? "مشاهده تمام محصولات" : "View All Products"}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

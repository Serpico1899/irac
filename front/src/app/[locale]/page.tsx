import Link from "next/link";
import Image from "next/image";
import ContentCard from "@/components/organisms/ContentCard";
import { getTranslations } from "next-intl/server";

interface Course {
  _id: string;
  title: {
    en: string;
    fa: string;
  };
  description: {
    en: string;
    fa: string;
  };
  instructorName: string;
  price: number;
  duration: string;
  imageUrl?: string;
  isFeatured?: boolean;
  createdAt: string;
}

interface Article {
  _id: string;
  title: {
    en: string;
    fa: string;
  };
  description: {
    en: string;
    fa: string;
  };
  author: string;
  imageUrl?: string;
  slug: string;
  createdAt: string;
}

interface Product {
  _id: string;
  title: {
    en: string;
    fa: string;
  };
  description: {
    en: string;
    fa: string;
  };
  price: number;
  imageUrl?: string;
  category: string;
  createdAt: string;
}

interface HomePageData {
  featuredCourses: Course[];
  latestArticles: Article[];
  latestProducts: Product[];
  meta: {
    timestamp: string;
    totalCourses: number;
    totalArticles: number;
    totalProducts: number;
    error?: string;
  };
}

interface HomePageProps {
  params: {
    locale: string;
  };
}

// Data Fetching Function
async function getHomePageData(): Promise<HomePageData> {
  try {
    const response = await fetch("http://localhost:1404/lesan", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        service: "main",
        model: "main",
        act: "getHomePageData",
        details: {
          get: {
            courses: {
              title: 1,
              description: 1,
              instructorName: 1,
              price: 1,
              duration: 1,
              imageUrl: 1,
              isFeatured: 1,
              createdAt: 1,
            },
            articles: {
              title: 1,
              description: 1,
              author: 1,
              imageUrl: 1,
              slug: 1,
              createdAt: 1,
            },
            products: {
              title: 1,
              description: 1,
              price: 1,
              imageUrl: 1,
              category: 1,
              createdAt: 1,
            },
          },
        },
      }),
      // Revalidate every 30 minutes for fresh content
      next: { revalidate: 1800 },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    if (!result) {
      throw new Error("No data received from API");
    }

    return result;
  } catch (error) {
    console.error("Error fetching homepage data:", error);
    return {
      featuredCourses: [],
      latestArticles: [],
      latestProducts: [],
      meta: {
        timestamp: new Date().toISOString(),
        totalCourses: 0,
        totalArticles: 0,
        totalProducts: 0,
        error: "Failed to fetch homepage data",
      },
    };
  }
}

// Main Homepage Component
export default async function HomePage({ params: { locale } }: HomePageProps) {
  const t = await getTranslations({ locale });
  const { featuredCourses, latestArticles, latestProducts, meta } =
    await getHomePageData();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary to-primary-dark overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-7xl mx-auto px-6 py-24 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Hero Content */}
            <div
              className="text-center lg:text-right"
              dir={locale === "fa" ? "rtl" : "ltr"}
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-background mb-6 leading-tight">
                {t("HomePage.heroTitle")}
              </h1>
              <p className="text-xl md:text-2xl text-background-secondary mb-8 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                {t("HomePage.heroSubtitle")}
              </p>

              {/* Hero CTAs */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link
                  href={`/${locale}/courses`}
                  className="bg-accent-primary hover:bg-accent text-text-dark font-semibold py-4 px-8 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105"
                >
                  {t("HomePage.viewCoursesBtn")}
                </Link>
                <Link
                  href={`/${locale}/workshops`}
                  className="bg-transparent hover:bg-background/10 border-2 border-background text-background font-semibold py-4 px-8 rounded-xl transition-all duration-200"
                >
                  {t("HomePage.workshopsBtn")}
                </Link>
              </div>

              {/* Hero Search */}
              <div className="mt-12 max-w-md mx-auto lg:mx-0">
                <div className="relative">
                  <input
                    type="text"
                    placeholder={
                      locale === "fa"
                        ? "جستجو در دوره‌ها..."
                        : "Search courses..."
                    }
                    className="search-input w-full py-4 px-6 pr-14 rounded-2xl bg-background/95 backdrop-blur-sm text-text placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-accent-primary shadow-lg"
                    dir={locale === "fa" ? "rtl" : "ltr"}
                  />
                  <button className="absolute top-1/2 right-4 transform -translate-y-1/2 text-text-secondary hover:text-primary transition-colors">
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

            {/* Hero Image */}
            <div className="relative">
              <div className="aspect-square bg-background/10 backdrop-blur-sm rounded-3xl p-8 shadow-2xl">
                <Image
                  src="/images/Asset-1@20x-2-qotodtmpgaloexs25oampoe4trtwtus7grml1i9od0.png"
                  alt="IRAC - Islamic Architecture Center"
                  width={400}
                  height={400}
                  className="w-full h-60 object-contain"
                  priority
                />
                <div className="mt-6 text-center">
                  <p className="text-background/90 text-lg font-medium">
                    {t("HomePage.iracIntro")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Courses Section */}
      <section className="py-20 px-6 bg-background">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-text mb-4">
              {t("HomePage.featuredCoursesTitle")}
            </h2>
            <p className="text-xl text-text-secondary max-w-3xl mx-auto leading-relaxed">
              {t("HomePage.featuredCoursesDescription")}
            </p>
            <div className="w-24 h-1 bg-accent-primary mx-auto mt-6 rounded-full"></div>
          </div>

          {featuredCourses.length > 0 ? (
            <>
              {/* Quick Course Categories */}
              <div className="flex flex-wrap justify-center gap-4 mb-16">
                {featuredCourses.slice(0, 5).map((course, index) => (
                  <ContentCard
                    key={course._id || index}
                    href={`/${locale}/courses/${course._id || "demo"}`}
                    title={locale === "fa" ? course.title.fa : course.title.en}
                    variant="hero-course"
                  />
                ))}
              </div>

              {/* Featured Courses Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                {featuredCourses.slice(0, 3).map((course) => (
                  <ContentCard
                    key={course._id}
                    href={`/${locale}/courses/${course._id}`}
                    title={locale === "fa" ? course.title.fa : course.title.en}
                    description={
                      locale === "fa"
                        ? course.description.fa
                        : course.description.en
                    }
                    price={course.price.toString()}
                    imageUrl={course.imageUrl}
                    author={course.instructorName}
                    date={course.duration}
                    locale={locale}
                    variant="course-dark"
                  />
                ))}
              </div>
            </>
          ) : (
            /* Empty State for Courses */
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-background-primary rounded-full flex items-center justify-center mx-auto mb-6">
                <svg
                  className="w-10 h-10 text-text-secondary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-text mb-2">
                {locale === "fa" ? "دوره‌ای یافت نشد" : "No Featured Courses"}
              </h3>
              <p className="text-text-secondary">
                {locale === "fa"
                  ? "به زودی دوره‌های جدید اضافه خواهد شد"
                  : "New courses will be added soon"}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Latest Articles Section */}
      <section className="py-20 px-6 bg-background-primary">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-text">
              {t("HomePage.latestArticlesTitle")}
            </h2>
            <Link
              href={`/${locale}/media`}
              className="text-primary hover:text-primary-dark font-semibold transition-colors"
            >
              {locale === "fa" ? "مشاهده همه" : "View All"}
            </Link>
          </div>

          {latestArticles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {latestArticles.map((article) => (
                <ContentCard
                  key={article._id}
                  href={`/${locale}/articles/${article.slug}`}
                  title={locale === "fa" ? article.title.fa : article.title.en}
                  description={
                    locale === "fa"
                      ? article.description.fa
                      : article.description.en
                  }
                  imageUrl={article.imageUrl}
                  author={article.author}
                  date={new Date(article.createdAt).toLocaleDateString(locale)}
                  locale={locale}
                  variant="article-medium"
                />
              ))}
            </div>
          ) : (
            /* Empty State for Articles */
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-background rounded-full flex items-center justify-center mx-auto mb-6">
                <svg
                  className="w-10 h-10 text-text-secondary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-text mb-2">
                {locale === "fa"
                  ? "مقاله‌ای یافت نشد"
                  : "No Articles Available"}
              </h3>
              <p className="text-text-secondary">
                {locale === "fa"
                  ? "به زودی مقالات جدید منتشر خواهد شد"
                  : "New articles will be published soon"}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-20 px-6 bg-gradient-to-r from-primary to-primary-dark">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-background mb-6">
            {t("HomePage.ctaTitle")}
          </h2>
          <p className="text-xl text-background-secondary mb-8 leading-relaxed max-w-2xl mx-auto">
            {t("HomePage.ctaDescription")}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href={`/${locale}/courses`}
              className="bg-accent-primary hover:bg-accent text-text-dark font-semibold py-4 px-8 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              {t("HomePage.browseCoursesBtn")}
            </Link>
            <Link
              href={`/${locale}/about`}
              className="bg-transparent hover:bg-background/10 border-2 border-background text-background font-semibold py-4 px-8 rounded-xl transition-all duration-200"
            >
              {t("HomePage.learnMoreBtn")}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

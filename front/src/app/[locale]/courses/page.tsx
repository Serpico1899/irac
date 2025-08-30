import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import ContentCard from "@/components/organisms/ContentCard";

// Define a clear type for the Course data
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
}

// Define the type for the API response from our unified endpoint
interface HomePageDataResponse {
  success: boolean;
  data?: {
    featuredCourses: Course[];
    latestArticles: any[]; // Define later
    latestProducts: any[]; // Define later
  };
  message?: string;
}

// SEO Metadata Generation
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "HomePage" });
  const siteT = await getTranslations({ locale, namespace: "Site" });
  const navT = await getTranslations({ locale, namespace: "Navbar" });

  const pageTitle = navT("navigation.1.label"); // "Courses"

  return {
    title: `${pageTitle} | ${siteT("title")}`,
    description: t("featuredCoursesDescription"),
  };
}

// Data Fetching Function
async function getCourses(): Promise<Course[]> {
  try {
    const response = await fetch("http://backend:1404/lesan", {
      // Use Docker network hostname
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        service: "main",
        model: "page",
        act: "getHomePageData",
        details: {},
      }),
      next: { revalidate: 3600 }, // Revalidate every hour
    });

    if (!response.ok) {
      throw new Error(`API error! status: ${response.status}`);
    }

    const result: HomePageDataResponse = await response.json();

    if (!result.success || !result.data || !result.data.featuredCourses) {
      console.error(
        "Failed to fetch courses from homepage data:",
        result.message,
      );
      return [];
    }

    return result.data.featuredCourses;
  } catch (error) {
    console.error("Error fetching courses:", error);
    return [];
  }
}

// Main Courses Page Component
export default async function CoursesPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const t = await getTranslations({ locale, namespace: "HomePage" });
  const courses = await getCourses();

  return (
    <main className="min-h-screen bg-background">
      <section className="bg-primary py-20 px-6 text-center text-white">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          {t("featuredCoursesTitle")}
        </h1>
        <p className="text-xl text-gray-200 max-w-3xl mx-auto">
          {t("featuredCoursesDescription")}
        </p>
      </section>

      <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto">
          {courses.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {courses.map((course) => (
                <ContentCard
                  key={course._id}
                  href={`/courses/${course._id}`}
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
                  variant="light"
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-24 text-text-light">
              <h3 className="text-2xl font-bold text-text mb-4">
                {locale === "fa" ? "دوره‌ای یافت نشد" : "No Courses Found"}
              </h3>
              <p>
                {locale === "fa"
                  ? "در حال حاضر هیچ دوره‌ای در دسترس نیست."
                  : "There are currently no courses available."}
              </p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

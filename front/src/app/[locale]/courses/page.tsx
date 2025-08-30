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

// Define the type for the API response
interface ApiResponse {
  success: boolean;
  data?: {
    featuredCourses: Course[];
    latestArticles: any[]; // Define later
    latestProducts: any[]; // Define later
  };
  message?: string;
}

// SEO Metadata Generation - Handle params as Promise
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

// Data Fetching Function - CORRECTED TO USE THE UNIFIED ENDPOINT
async function getCourses(): Promise<Course[]> {
  try {
    const response = await fetch("http://backend:1404/lesan", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        service: "main",
        model: "page", // Corrected model
        act: "getHomePageData", // Corrected act
        details: {},
      }),
      next: { revalidate: 3600 }, // Revalidate every hour
    });

    if (!response.ok) {
      throw new Error(`API error! status: ${response.status}`);
    }

    const result: ApiResponse = await response.json();

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

// Main Courses Page Component - Handle params as Promise
export default async function CoursesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "HomePage" });
  const courses = await getCourses();

  return (
    <main className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-primary py-20 px-6 text-center text-white">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          {t("featuredCoursesTitle")}
        </h1>
        <p className="text-xl text-gray-200 max-w-3xl mx-auto">
          {t("featuredCoursesDescription")}
        </p>
      </section>

      {/* Courses Grid Section */}
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
            /* Empty State */
            <div className="text-center py-24 text-text-light">
              <h3 className="text-2xl font-bold text-text mb-4">
                {locale === "fa" ? "دوره‌ای یافت نشد" : "No Courses Found"}
              </h3>
              <p>
                {locale === "fa"
                  ? "در حال حاضر هیچ دوره‌ای در دسترس نیست. لطفاً بعداً دوباره بررسی کنید."
                  : "There are currently no courses available. Please check back later."}
              </p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

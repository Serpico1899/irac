import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import ContentCard from "@/components/organisms/ContentCard";
import LoadingSpinner from "@/components/atoms/LoadingSpinner";
import CompletionStatus from "@/components/organisms/Course/CompletionStatus";
import SEOHead from "@/components/SEO/SEOHead";
import OptimizedImage from "@/components/SEO/OptimizedImage";
import { getCourse } from "@/app/actions/course/getCourse";
import { formatPrice } from "@/utils/currency";
import { seoService } from "@/lib/seo";
import { Product } from "@/types";
import CourseDetailPageClient from "./CourseDetailPageClient"; // Client component for interactivity

export const dynamic = "force-dynamic";

// Generate metadata for SEO
export async function generateMetadata({
  params,
}: {
  params: { locale: string; slug: string };
}): Promise<Metadata> {
  const { locale, slug } = params;

  try {
    const response = await getCourse({ slug });

    if (!response.success || !response.data?.course) {
      return {
        title: locale === "fa" ? "دوره یافت نشد" : "Course Not Found",
        description:
          locale === "fa"
            ? "دوره مورد نظر یافت نشد"
            : "The requested course could not be found",
        robots: { index: false, follow: false },
      };
    }

    const course = response.data.course;

    const productData: Product = {
      _id: course._id,
      title: course.name,
      title_en: course.name_en,
      slug: course.slug || slug,
      description: course.description,
      description_en: course.description_en,
      type: "other",
      category: "educational",
      status: "active",
      price: course.price,
      discounted_price:
        course.original_price !== course.price ? course.price : undefined,
      is_digital: course.is_online,
      featured_image: course.featured_image?.details
        ? {
            url: course.featured_image.details.url,
            alt: course.featured_image.details.alt || course.name,
            width: 1200,
            height: 630,
          }
        : undefined,
      tags: course.tags?.details?.map((tag: any) => tag.name) || [],
      author: course.instructor_name,
      is_featured: course.average_rating >= 4.5,
      is_bestseller: course.total_students > 100,
      is_new: false,
      view_count: 0,
      purchase_count: course.total_students,
      rating: {
        average: course.average_rating,
        count: course.total_reviews,
      },
      meta_title: locale === "fa" ? course.name : course.name_en || course.name,
      meta_description:
        locale === "fa"
          ? course.short_description || course.description
          : course.short_description_en ||
            course.description_en ||
            course.description,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      language: locale,
    };

    const seoData = seoService.generateCoursePageSEO(productData, locale);
    return seoData.metadata;
  } catch (error) {
    console.error("Error generating course metadata:", error);
    return {
      title: locale === "fa" ? "خطا در بارگذاری دوره" : "Error Loading Course",
      description:
        locale === "fa"
          ? "خطا در بارگذاری اطلاعات دوره"
          : "Error loading course information",
    };
  }
}

export default async function CourseDetailPage({
  params,
}: {
  params: { locale: string; slug: string };
}) {
  const { locale, slug } = params;

  const response = await getCourse({
    slug,
    populate: [
      "category",
      "tags",
      "featured_image",
      "gallery",
      "instructor",
      "related_courses",
    ],
  });

  if (!response.success || !response.data) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="text-6xl mb-4">😕</div>
          <h1 className="text-2xl font-bold text-text mb-4">
            {locale === "fa" ? "دوره یافت نشد" : "Course Not Found"}
          </h1>
          <p className="text-text-secondary mb-6">
            {response.message ||
              (locale === "fa"
                ? "دوره مورد نظر یافت نشد یا ممکن است حذف شده باشد"
                : "The course you're looking for doesn't exist or may have been removed")}
          </p>
          <Link
            href={`/${locale}/courses`}
            className="inline-block px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
          >
            {locale === "fa" ? "بازگشت به دوره‌ها" : "Back to Courses"}
          </Link>
        </div>
      </div>
    );
  }

  return <CourseDetailPageClient locale={locale} initialData={response.data} />;
}

import { use, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import ContentCard from "@/components/organisms/ContentCard";
import Pagination from "@/components/molecules/Pagination";
import LoadingSpinner from "@/components/atoms/LoadingSpinner";
import { getCourses } from "@/app/actions/course/getCourses";
import CoursesPageClient from "./CoursesPageClient"; // Assuming the client logic is extracted

export const dynamic = "force-dynamic";

interface Course {
  _id: string;
  name: string;
  name_en?: string;
  description: string;
  description_en?: string;
  short_description?: string;
  short_description_en?: string;
  price: number;
  original_price?: number;
  level: "Beginner" | "Intermediate" | "Advanced";
  type: "Course" | "Workshop" | "Bootcamp" | "Seminar";
  average_rating: number;
  total_students: number;
  total_reviews: number;
  duration_hours?: number;
  featured_image?: {
    details?: {
      url: string;
      alt?: string;
    };
  };
  category?: {
    details?: {
      _id: string;
      name: string;
    };
  };
  tags?: {
    details?: Array<{
      _id: string;
      name: string;
    }>;
  };
  instructor?: {
    details?: {
      first_name: string;
      last_name: string;
    };
  };
  slug?: string;
  is_free: boolean;
  duration_weeks?: number;
  start_date?: string;
}

interface Category {
  _id: string;
  name: string;
}

interface CoursesResponse {
  courses: Course[];
  pagination: {
    current_page: number;
    total_pages: number;
    total_items: number;
    items_per_page: number;
    has_next: boolean;
    has_previous: boolean;
  };
  filters: {
    available_categories: Category[];
    price_range: {
      min: number;
      max: number;
    };
  };
}

async function CoursesContent({
  params,
  searchParams,
}: {
  params: { locale: string };
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const { locale } = params;

  const filters = {
    search: (searchParams.search as string) || "",
    category_id: (searchParams.category as string) || "",
    level: (searchParams.level as string) || "",
    type: (searchParams.type as string) || "",
    min_price: searchParams.min_price
      ? parseInt(searchParams.min_price as string)
      : undefined,
    max_price: searchParams.max_price
      ? parseInt(searchParams.max_price as string)
      : undefined,
    is_free:
      searchParams.free === "true"
        ? true
        : searchParams.free === "false"
          ? false
          : undefined,
    page: parseInt((searchParams.page as string) || "1"),
    sort_by: (searchParams.sort as string) || "created_at",
  };

  const response = await getCourses({
    ...filters,
    status: "Active",
    limit: 12,
    populate: ["category", "tags", "featured_image", "instructor"],
  });

  if (!response.success || !response.data) {
    return (
      <div className="text-center py-12 text-red-500">
        {response.message || "Error fetching courses."}
      </div>
    );
  }

  const data = response.data as CoursesResponse;

  return (
    <CoursesPageClient
      locale={locale}
      initialCourses={data.courses}
      initialPagination={data.pagination}
      initialCategories={data.filters.available_categories}
      initialPriceRange={data.filters.price_range}
    />
  );
}

export default function CoursesPage({
  params,
  searchParams,
}: {
  params: { locale: string };
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <LoadingSpinner />
        </div>
      }
    >
      <CoursesContent params={params} searchParams={searchParams} />
    </Suspense>
  );
}

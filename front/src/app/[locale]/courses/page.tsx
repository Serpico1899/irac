"use client";

import {
  use,
  useState,
  useEffect,
  useCallback,
  useMemo,
  Suspense,
} from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import ContentCard from "@/components/organisms/ContentCard";
import SearchBox from "@/components/molecules/SearchBox";
import Pagination from "@/components/molecules/Pagination";
import LoadingSpinner from "@/components/atoms/LoadingSpinner";
import { getCourses } from "@/app/actions/course/getCourses";

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

function CoursesContent({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params);
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // State management
  const [mounted, setMounted] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    current_page: 1,
    total_pages: 1,
    total_items: 0,
    has_next: false,
    has_previous: false,
  });
  const [categories, setCategories] = useState<Category[]>([]);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 0 });
  const [showFilters, setShowFilters] = useState(false);

  // Filter state from URL params
  const currentFilters = useMemo(
    () => ({
      search: searchParams.get("search") || "",
      category_id: searchParams.get("category") || "",
      level: searchParams.get("level") || "",
      type: searchParams.get("type") || "",
      min_price: searchParams.get("min_price")
        ? parseInt(searchParams.get("min_price")!)
        : undefined,
      max_price: searchParams.get("max_price")
        ? parseInt(searchParams.get("max_price")!)
        : undefined,
      is_free:
        searchParams.get("free") === "true"
          ? true
          : searchParams.get("free") === "false"
            ? false
            : undefined,
      page: parseInt(searchParams.get("page") || "1"),
      sort_by: searchParams.get("sort") || "created_at",
    }),
    [searchParams],
  );

  // Update URL with new filters
  const updateFilters = useCallback(
    (newFilters: Record<string, any>) => {
      const params = new URLSearchParams(searchParams.toString());

      Object.entries(newFilters).forEach(([key, value]) => {
        if (value === undefined || value === null || value === "") {
          params.delete(key);
        } else {
          params.set(key, value.toString());
        }
      });

      // Reset to page 1 when filters change (except for page changes)
      if (!newFilters.hasOwnProperty("page")) {
        params.set("page", "1");
      }

      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [searchParams, router, pathname],
  );

  // Fetch courses
  const fetchCourses = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Only call server action in client environment
      const response =
        typeof window !== "undefined"
          ? await getCourses({
              ...currentFilters,
              status: "Active",
              limit: 12,
              populate: ["category", "tags", "featured_image", "instructor"],
            })
          : {
              success: true,
              data: {
                courses: [],
                pagination: {
                  current_page: 1,
                  total_pages: 1,
                  total_items: 0,
                  items_per_page: 12,
                  has_next: false,
                  has_previous: false,
                },
                filters: {
                  available_categories: [],
                  available_instructors: [],
                  price_range: { min: 0, max: 0 },
                },
              },
            };

      if (response.success && response.data) {
        const data = response.data as CoursesResponse;
        setCourses(data.courses);
        setPagination(data.pagination);
        setCategories(data.filters.available_categories);
        setPriceRange(data.filters.price_range);
      } else {
        setError(response.message || "خطا در دریافت دوره‌ها");
      }
    } catch (err) {
      console.error("Error fetching courses:", err);
      setError("خطا در برقراری ارتباط با سرور");
    } finally {
      setLoading(false);
    }
  }, [currentFilters]);

  // Fetch courses when filters change
  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  // Clear all filters
  const clearAllFilters = () => {
    router.push(pathname, { scroll: false });
  };

  // Get localized course title and description
  const getLocalizedContent = (course: Course) => {
    const title = locale === "fa" ? course.name : course.name_en || course.name;
    const description =
      locale === "fa"
        ? course.short_description || course.description
        : course.short_description_en ||
          course.description_en ||
          course.short_description ||
          course.description;

    return { title, description };
  };

  // Get level display text
  const getLevelText = (level: string) => {
    if (locale === "fa") {
      switch (level) {
        case "Beginner":
          return "مقدماتی";
        case "Intermediate":
          return "متوسط";
        case "Advanced":
          return "پیشرفته";
        default:
          return level;
      }
    }
    return level;
  };

  // Get type display text
  const getTypeText = (type: string) => {
    if (locale === "fa") {
      switch (type) {
        case "Course":
          return "دوره";
        case "Workshop":
          return "کارگاه";
        case "Bootcamp":
          return "بوتکمپ";
        case "Seminar":
          return "سمینار";
        default:
          return type;
      }
    }
    return type;
  };

  // Active filters count
  const activeFiltersCount = Object.values(currentFilters).filter(
    (value) => value !== "" && value !== undefined && value !== 1,
  ).length;

  const pageTitle =
    locale === "fa" ? "کلیه دوره‌های مرکز معماری" : "All Architecture Courses";
  const searchPlaceholder =
    locale === "fa" ? "جستجو در دوره‌ها..." : "Search courses...";

  return (
    <div
      className="min-h-screen bg-background"
      dir={locale === "fa" ? "rtl" : "ltr"}
    >
      {/* Header */}
      <div className="bg-background-primary border-b border-background-darkest">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-text mb-4">
              {pageTitle}
            </h1>
            <p className="text-text-secondary max-w-2xl mx-auto">
              {locale === "fa"
                ? "مجموعه‌ای کامل از دوره‌های معماری ایرانی-اسلامی، از مقدماتی تا پیشرفته"
                : "Complete collection of Iranian-Islamic architecture courses, from beginner to advanced"}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="lg:grid lg:grid-cols-4 lg:gap-8">
          {/* Filters Sidebar */}
          <div
            className={`lg:col-span-1 ${showFilters ? "block" : "hidden lg:block"}`}
          >
            <div className="bg-white rounded-[25px] shadow-sm border border-background-darkest p-6 sticky top-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-text">
                  {locale === "fa" ? "فیلترها" : "Filters"}
                </h3>
                {activeFiltersCount > 0 && (
                  <button
                    onClick={clearAllFilters}
                    className="text-sm text-primary hover:text-primary-dark transition-colors"
                  >
                    {locale === "fa" ? "پاک کردن همه" : "Clear All"}
                  </button>
                )}
              </div>

              {/* Search Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-text mb-2">
                  {locale === "fa" ? "جستجو" : "Search"}
                </label>
                <input
                  type="text"
                  placeholder={searchPlaceholder}
                  value={currentFilters.search}
                  onChange={(e) => updateFilters({ search: e.target.value })}
                  className="w-full px-4 py-2 border border-background-darkest rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              {/* Category Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-text mb-2">
                  {locale === "fa" ? "دسته‌بندی" : "Category"}
                </label>
                <select
                  value={currentFilters.category_id}
                  onChange={(e) => updateFilters({ category: e.target.value })}
                  className="w-full px-4 py-2 border border-background-darkest rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="">
                    {locale === "fa" ? "همه دسته‌ها" : "All Categories"}
                  </option>
                  {categories.map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Level Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-text mb-2">
                  {locale === "fa" ? "سطح دوره" : "Course Level"}
                </label>
                <select
                  value={currentFilters.level}
                  onChange={(e) => updateFilters({ level: e.target.value })}
                  className="w-full px-4 py-2 border border-background-darkest rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="">
                    {locale === "fa" ? "همه سطوح" : "All Levels"}
                  </option>
                  <option value="Beginner">{getLevelText("Beginner")}</option>
                  <option value="Intermediate">
                    {getLevelText("Intermediate")}
                  </option>
                  <option value="Advanced">{getLevelText("Advanced")}</option>
                </select>
              </div>

              {/* Type Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-text mb-2">
                  {locale === "fa" ? "نوع" : "Type"}
                </label>
                <select
                  value={currentFilters.type}
                  onChange={(e) => updateFilters({ type: e.target.value })}
                  className="w-full px-4 py-2 border border-background-darkest rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="">
                    {locale === "fa" ? "همه انواع" : "All Types"}
                  </option>
                  <option value="Course">{getTypeText("Course")}</option>
                  <option value="Workshop">{getTypeText("Workshop")}</option>
                  <option value="Bootcamp">{getTypeText("Bootcamp")}</option>
                  <option value="Seminar">{getTypeText("Seminar")}</option>
                </select>
              </div>

              {/* Price Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-text mb-2">
                  {locale === "fa" ? "قیمت" : "Price"}
                </label>
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="price_filter"
                      checked={currentFilters.is_free === true}
                      onChange={() =>
                        updateFilters({
                          free: "true",
                          min_price: undefined,
                          max_price: undefined,
                        })
                      }
                      className="w-4 h-4 text-primary"
                    />
                    <span className="mr-2">
                      {locale === "fa" ? "رایگان" : "Free"}
                    </span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="price_filter"
                      checked={currentFilters.is_free === false}
                      onChange={() => updateFilters({ free: "false" })}
                      className="w-4 h-4 text-primary"
                    />
                    <span className="mr-2">
                      {locale === "fa" ? "پولی" : "Paid"}
                    </span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="price_filter"
                      checked={currentFilters.is_free === undefined}
                      onChange={() =>
                        updateFilters({
                          free: undefined,
                          min_price: undefined,
                          max_price: undefined,
                        })
                      }
                      className="w-4 h-4 text-primary"
                    />
                    <span className="mr-2">
                      {locale === "fa" ? "همه" : "All"}
                    </span>
                  </label>
                </div>
              </div>

              {/* Sort Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-text mb-2">
                  {locale === "fa" ? "مرتب‌سازی" : "Sort By"}
                </label>
                <select
                  value={currentFilters.sort_by}
                  onChange={(e) => updateFilters({ sort: e.target.value })}
                  className="w-full px-4 py-2 border border-background-darkest rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="created_at">
                    {locale === "fa" ? "جدیدترین" : "Newest"}
                  </option>
                  <option value="price">
                    {locale === "fa" ? "قیمت" : "Price"}
                  </option>
                  <option value="name">
                    {locale === "fa" ? "نام" : "Name"}
                  </option>
                  <option value="average_rating">
                    {locale === "fa" ? "امتیاز" : "Rating"}
                  </option>
                  <option value="start_date">
                    {locale === "fa" ? "تاریخ شروع" : "Start Date"}
                  </option>
                </select>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Mobile Filter Toggle & Results Info */}
            <div className="flex items-center justify-between mb-6 lg:hidden">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2 px-4 py-2 bg-white border border-background-darkest rounded-lg"
              >
                <span>{locale === "fa" ? "فیلترها" : "Filters"}</span>
                {activeFiltersCount > 0 && (
                  <span className="bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {activeFiltersCount}
                  </span>
                )}
              </button>

              {!loading && (
                <span className="text-sm text-text-secondary">
                  {locale === "fa"
                    ? `${pagination.total_items} دوره یافت شد`
                    : `${pagination.total_items} courses found`}
                </span>
              )}
            </div>

            {/* Results Info - Desktop */}
            {!loading && (
              <div className="hidden lg:flex items-center justify-between mb-6">
                <span className="text-text-secondary">
                  {locale === "fa"
                    ? `${pagination.total_items} دوره یافت شد`
                    : `${pagination.total_items} courses found`}
                </span>
              </div>
            )}

            {/* Loading State */}
            {loading && (
              <div className="flex items-center justify-center py-12">
                <LoadingSpinner />
                <span className="mr-3 text-text-secondary">
                  {locale === "fa" ? "در حال بارگذاری..." : "Loading..."}
                </span>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                <p className="text-red-600 mb-4">{error}</p>
                <button
                  onClick={fetchCourses}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                >
                  {locale === "fa" ? "تلاش مجدد" : "Try Again"}
                </button>
              </div>
            )}

            {/* Courses Grid */}
            {!loading && !error && (
              <>
                {courses.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {courses.map((course) => {
                      const { title, description } =
                        getLocalizedContent(course);
                      const instructorName = course.instructor?.details
                        ? `${course.instructor.details.first_name} ${course.instructor.details.last_name}`
                        : undefined;

                      // Transform course data for AddToCartButton
                      const courseData = {
                        _id: course._id,
                        name: course.name,
                        name_en: course.name_en,
                        slug: course.slug || course._id,
                        price: course.price,
                        original_price: course.original_price,
                        discounted_price:
                          course.original_price &&
                          course.original_price > course.price
                            ? course.price
                            : undefined,
                        is_free: course.is_free,
                        featured_image: course.featured_image?.details
                          ? {
                              url: course.featured_image.details.url,
                              alt: course.featured_image.details.alt,
                            }
                          : undefined,
                        instructor: course.instructor,
                        duration_hours: course.duration_hours,
                        level: course.level,
                        type: course.type || "Course",
                      };

                      return (
                        <ContentCard
                          key={course._id}
                          href={`/${locale}/courses/${course.slug || course._id}`}
                          title={title}
                          description={description}
                          imageUrl={course.featured_image?.details?.url}
                          price={course.price.toString()}
                          originalPrice={course.original_price?.toString()}
                          level={getLevelText(course.level)}
                          rating={course.average_rating}
                          reviews={course.total_reviews}
                          locale={locale}
                          variant="light"
                          author={instructorName}
                          courseData={courseData}
                          showAddToCart={true}
                        />
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="text-text-light text-6xl mb-4">📚</div>
                    <h3 className="text-lg font-semibold text-text mb-2">
                      {locale === "fa"
                        ? "دوره‌ای یافت نشد"
                        : "No courses found"}
                    </h3>
                    <p className="text-text-secondary mb-4">
                      {locale === "fa"
                        ? "لطفاً فیلترهای خود را تغییر دهید یا جستجوی جدیدی انجام دهید"
                        : "Please adjust your filters or try a different search"}
                    </p>
                    {activeFiltersCount > 0 && (
                      <button
                        onClick={clearAllFilters}
                        className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                      >
                        {locale === "fa" ? "پاک کردن فیلترها" : "Clear Filters"}
                      </button>
                    )}
                  </div>
                )}

                {/* Pagination */}
                {courses.length > 0 && pagination.total_pages > 1 && (
                  <div className="mt-12">
                    <Pagination
                      initialPage={pagination.current_page}
                      countPage={pagination.total_items}
                      limit={12}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CoursesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <CoursesContent params={params} />
    </Suspense>
  );
}

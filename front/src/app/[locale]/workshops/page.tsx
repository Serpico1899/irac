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
import Pagination from "@/components/molecules/Pagination";
import LoadingSpinner from "@/components/atoms/LoadingSpinner";
import { getCourses } from "@/app/actions/course/getCourses";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

interface Workshop {
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
  average_rating: number;
  total_students: number;
  total_reviews: number;
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
  instructor?: {
    details?: {
      first_name: string;
      last_name: string;
    };
  };
  slug?: string;
  is_free: boolean;
  duration_weeks?: number;
  duration_hours?: number;
  max_students?: number;
  start_date?: string;
  end_date?: string;
  registration_deadline?: string;
  workshop_location?: string;
  is_online: boolean;
  featured: boolean;
}

interface Category {
  _id: string;
  name: string;
}

interface WorkshopsResponse {
  courses: Workshop[];
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

function WorkshopsContent({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params);
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // State management
  const [mounted, setMounted] = useState(false);
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
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
      is_online:
        searchParams.get("online") === "true"
          ? true
          : searchParams.get("online") === "false"
            ? false
            : undefined,
      page: parseInt(searchParams.get("page") || "1"),
      sort_by: searchParams.get("sort") || "start_date",
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

  // Fetch workshops
  const fetchWorkshops = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Only call server action in client environment
      const response =
        typeof window !== "undefined"
          ? await getCourses({
              ...currentFilters,
              status: "Active",
              is_workshop: true, // Only get workshops
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
        const data = response.data as WorkshopsResponse;
        setWorkshops(data.courses);
        setPagination(data.pagination);
        setCategories(data.filters.available_categories);
        setPriceRange(data.filters.price_range);
      } else {
        setError(response.message || "خطا در دریافت کارگاه‌ها");
      }
    } catch (err) {
      console.error("Error fetching workshops:", err);
      setError("خطا در برقراری ارتباط با سرور");
    } finally {
      setLoading(false);
    }
  }, [currentFilters]);

  // Fetch workshops when filters change
  useEffect(() => {
    fetchWorkshops();
  }, [fetchWorkshops]);

  // Clear all filters
  const clearAllFilters = () => {
    router.push(pathname, { scroll: false });
  };

  // Get localized workshop title and description
  const getLocalizedContent = (workshop: Workshop) => {
    const title =
      locale === "fa" ? workshop.name : workshop.name_en || workshop.name;
    const description =
      locale === "fa"
        ? workshop.short_description || workshop.description
        : workshop.short_description_en ||
          workshop.description_en ||
          workshop.short_description ||
          workshop.description;

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

  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return undefined;
    const date = new Date(dateString);
    return locale === "fa"
      ? date.toLocaleDateString("fa-IR")
      : date.toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        });
  };

  // Check if workshop is upcoming
  const isUpcoming = (workshop: Workshop) => {
    if (!workshop.start_date) return false;
    return new Date(workshop.start_date) > new Date();
  };

  // Check if registration is still open
  const isRegistrationOpen = (workshop: Workshop) => {
    if (!workshop.registration_deadline) return true;
    return new Date(workshop.registration_deadline) > new Date();
  };

  // Active filters count
  const activeFiltersCount = Object.values(currentFilters).filter(
    (value) => value !== "" && value !== undefined && value !== 1,
  ).length;

  const pageTitle =
    locale === "fa" ? "کارگاه‌های معماری" : "Architecture Workshops";
  const searchPlaceholder =
    locale === "fa" ? "جستجو در کارگاه‌ها..." : "Search workshops...";

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
                ? "کارگاه‌های عملی معماری ایرانی-اسلامی با مدرسان مجرب"
                : "Practical Iranian-Islamic architecture workshops with experienced instructors"}
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
                  {locale === "fa" ? "موضوع" : "Topic"}
                </label>
                <select
                  value={currentFilters.category_id}
                  onChange={(e) => updateFilters({ category: e.target.value })}
                  className="w-full px-4 py-2 border border-background-darkest rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="">
                    {locale === "fa" ? "همه موضوعات" : "All Topics"}
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
                  {locale === "fa" ? "سطح" : "Level"}
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

              {/* Format Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-text mb-2">
                  {locale === "fa" ? "شیوه برگزاری" : "Format"}
                </label>
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="format_filter"
                      checked={currentFilters.is_online === true}
                      onChange={() => updateFilters({ online: "true" })}
                      className="w-4 h-4 text-primary"
                    />
                    <span className="mr-2">
                      {locale === "fa" ? "آنلاین" : "Online"}
                    </span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="format_filter"
                      checked={currentFilters.is_online === false}
                      onChange={() => updateFilters({ online: "false" })}
                      className="w-4 h-4 text-primary"
                    />
                    <span className="mr-2">
                      {locale === "fa" ? "حضوری" : "In-Person"}
                    </span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="format_filter"
                      checked={currentFilters.is_online === undefined}
                      onChange={() => updateFilters({ online: undefined })}
                      className="w-4 h-4 text-primary"
                    />
                    <span className="mr-2">
                      {locale === "fa" ? "همه" : "All"}
                    </span>
                  </label>
                </div>
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
                  <option value="start_date">
                    {locale === "fa" ? "تاریخ شروع" : "Start Date"}
                  </option>
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
                    ? `${pagination.total_items} کارگاه یافت شد`
                    : `${pagination.total_items} workshops found`}
                </span>
              )}
            </div>

            {/* Results Info - Desktop */}
            {!loading && (
              <div className="hidden lg:flex items-center justify-between mb-6">
                <span className="text-text-secondary">
                  {locale === "fa"
                    ? `${pagination.total_items} کارگاه یافت شد`
                    : `${pagination.total_items} workshops found`}
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
                  onClick={fetchWorkshops}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                >
                  {locale === "fa" ? "تلاش مجدد" : "Try Again"}
                </button>
              </div>
            )}

            {/* Workshops Grid */}
            {!loading && !error && (
              <>
                {workshops.length > 0 ? (
                  <div className="space-y-8">
                    {/* Featured/Upcoming Workshops */}
                    {workshops.filter(
                      (workshop) => workshop.featured || isUpcoming(workshop),
                    ).length > 0 && (
                      <div className="mb-12">
                        <h2 className="text-2xl font-bold text-text mb-6">
                          {locale === "fa"
                            ? "کارگاه‌های پیش رو"
                            : "Upcoming Workshops"}
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                          {workshops
                            .filter(
                              (workshop) =>
                                workshop.featured || isUpcoming(workshop),
                            )
                            .slice(0, 6)
                            .map((workshop) => {
                              const { title, description } =
                                getLocalizedContent(workshop);
                              const instructorName = workshop.instructor
                                ?.details
                                ? `${workshop.instructor.details.first_name} ${workshop.instructor.details.last_name}`
                                : undefined;

                              return (
                                <div key={workshop._id} className="relative">
                                  <ContentCard
                                    href={`/${locale}/workshops/${workshop.slug || workshop._id}`}
                                    title={title}
                                    description={description}
                                    imageUrl={
                                      workshop.featured_image?.details?.url
                                    }
                                    price={workshop.price.toString()}
                                    originalPrice={workshop.original_price?.toString()}
                                    level={getLevelText(workshop.level)}
                                    rating={workshop.average_rating}
                                    reviews={workshop.total_reviews}
                                    locale={locale}
                                    variant="light"
                                    author={instructorName}
                                    date={
                                      workshop.start_date
                                        ? formatDate(workshop.start_date)
                                        : undefined
                                    }
                                  />

                                  {/* Workshop Status Badges */}
                                  <div className="absolute top-4 right-4 flex flex-col gap-2">
                                    {isUpcoming(workshop) && (
                                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                                        {locale === "fa" ? "آینده" : "Upcoming"}
                                      </span>
                                    )}
                                    {!workshop.is_online && (
                                      <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                                        {locale === "fa"
                                          ? "حضوری"
                                          : "In-Person"}
                                      </span>
                                    )}
                                    {!isRegistrationOpen(workshop) && (
                                      <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                                        {locale === "fa"
                                          ? "بسته شده"
                                          : "Closed"}
                                      </span>
                                    )}
                                  </div>

                                  {/* Additional Workshop Info */}
                                  <div className="mt-4 text-sm text-text-secondary">
                                    {workshop.max_students && (
                                      <p className="mb-1">
                                        {locale === "fa"
                                          ? "ظرفیت: "
                                          : "Capacity: "}
                                        {workshop.max_students}
                                        {locale === "fa" ? " نفر" : " people"}
                                      </p>
                                    )}
                                    {workshop.workshop_location &&
                                      !workshop.is_online && (
                                        <p className="mb-1">
                                          📍 {workshop.workshop_location}
                                        </p>
                                      )}
                                    {workshop.duration_hours && (
                                      <p className="mb-1">
                                        ⏱️ {workshop.duration_hours}
                                        {locale === "fa" ? " ساعت" : " hours"}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                        </div>
                      </div>
                    )}

                    {/* All Workshops */}
                    <div>
                      <h2 className="text-2xl font-bold text-text mb-6">
                        {locale === "fa" ? "همه کارگاه‌ها" : "All Workshops"}
                      </h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {workshops.map((workshop) => {
                          const { title, description } =
                            getLocalizedContent(workshop);
                          const instructorName = workshop.instructor?.details
                            ? `${workshop.instructor.details.first_name} ${workshop.instructor.details.last_name}`
                            : undefined;

                          // Transform workshop data for AddToCartButton
                          const workshopData = {
                            _id: workshop._id,
                            name: workshop.name,
                            name_en: workshop.name_en,
                            slug: workshop.slug || workshop._id,
                            price: workshop.price,
                            original_price: workshop.original_price,
                            discounted_price:
                              workshop.original_price &&
                              workshop.original_price > workshop.price
                                ? workshop.price
                                : undefined,
                            is_free: workshop.is_free,
                            featured_image: workshop.featured_image?.details
                              ? {
                                  url: workshop.featured_image.details.url,
                                  alt: workshop.featured_image.details.alt,
                                }
                              : undefined,
                            instructor: workshop.instructor,
                            duration_hours: workshop.duration_hours,
                            level: workshop.level,
                            type: "Workshop" as const,
                          };

                          return (
                            <div key={workshop._id} className="relative">
                              <ContentCard
                                href={`/${locale}/workshops/${workshop.slug || workshop._id}`}
                                title={title}
                                description={description}
                                imageUrl={workshop.featured_image?.details?.url}
                                price={workshop.price.toString()}
                                originalPrice={workshop.original_price?.toString()}
                                level={getLevelText(workshop.level)}
                                rating={workshop.average_rating}
                                reviews={workshop.total_reviews}
                                locale={locale}
                                variant="light"
                                author={instructorName}
                                date={
                                  workshop.start_date
                                    ? formatDate(workshop.start_date)
                                    : undefined
                                }
                                courseData={workshopData}
                                showAddToCart={true}
                              />

                              {/* Workshop Status Badges */}
                              <div className="absolute top-4 right-4 flex flex-col gap-2">
                                {!workshop.is_online && (
                                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                                    {locale === "fa" ? "حضوری" : "In-Person"}
                                  </span>
                                )}
                                {workshop.is_online && (
                                  <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">
                                    {locale === "fa" ? "آنلاین" : "Online"}
                                  </span>
                                )}
                                {!isRegistrationOpen(workshop) && (
                                  <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                                    {locale === "fa" ? "بسته شده" : "Closed"}
                                  </span>
                                )}
                              </div>

                              {/* Additional Workshop Info */}
                              <div className="mt-4 text-sm text-text-secondary">
                                {workshop.registration_deadline &&
                                  isRegistrationOpen(workshop) && (
                                    <p className="mb-1 text-orange-600 font-medium">
                                      {locale === "fa"
                                        ? "مهلت ثبت‌نام: "
                                        : "Registration deadline: "}
                                      {formatDate(
                                        workshop.registration_deadline,
                                      )}
                                    </p>
                                  )}
                                {workshop.max_students && (
                                  <p className="mb-1">
                                    {locale === "fa" ? "ظرفیت: " : "Capacity: "}
                                    {workshop.max_students}
                                    {locale === "fa" ? " نفر" : " people"}
                                  </p>
                                )}
                                {workshop.workshop_location &&
                                  !workshop.is_online && (
                                    <p className="mb-1">
                                      📍 {workshop.workshop_location}
                                    </p>
                                  )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="text-text-light text-6xl mb-4">🔨</div>
                    <h3 className="text-lg font-semibold text-text mb-2">
                      {locale === "fa"
                        ? "کارگاهی یافت نشد"
                        : "No workshops found"}
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
                {workshops.length > 0 && pagination.total_pages > 1 && (
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

export default function WorkshopsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <WorkshopsContent params={params} />
    </Suspense>
  );
}

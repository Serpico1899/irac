"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import ContentCard from "@/components/organisms/ContentCard";
import Pagination from "@/components/molecules/Pagination";
import LoadingSpinner from "@/components/atoms/LoadingSpinner";
import { getCourses } from "@/app/actions/course/getCourses";
import { formatPrice } from "@/utils/currency";

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

interface PaginationData {
  current_page: number;
  total_pages: number;
  total_items: number;
  items_per_page: number;
  has_next: boolean;
  has_previous: boolean;
}

interface PriceRange {
  min: number;
  max: number;
}

interface CoursesPageClientProps {
  locale: string;
  initialCourses: Course[];
  initialPagination: PaginationData;
  initialCategories: Category[];
  initialPriceRange: PriceRange;
}

export default function CoursesPageClient({
  locale,
  initialCourses,
  initialPagination,
  initialCategories,
  initialPriceRange,
}: CoursesPageClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // State management
  const [courses, setCourses] = useState<Course[]>(initialCourses);
  const [pagination, setPagination] = useState<PaginationData>(initialPagination);
  const [categories] = useState<Category[]>(initialCategories);
  const [priceRange] = useState<PriceRange>(initialPriceRange);
  const [loading, setLoading] = useState(false);

  // Filter states
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [selectedLevel, setSelectedLevel] = useState(searchParams.get('level') || '');
  const [selectedType, setSelectedType] = useState(searchParams.get('type') || '');
  const [minPrice, setMinPrice] = useState(searchParams.get('min_price') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('max_price') || '');
  const [isFree, setIsFree] = useState(searchParams.get('free') === 'true');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'created_at');
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page') || '1'));

  // Update URL with current filters
  const updateURL = useCallback((filters: Record<string, any>) => {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== '' && value !== false) {
        params.set(key, value.toString());
      }
    });

    const newURL = `/${locale}/courses${params.toString() ? `?${params.toString()}` : ''}`;
    router.push(newURL, { scroll: false });
  }, [locale, router]);

  // Fetch courses with current filters
  const fetchCourses = useCallback(async () => {
    setLoading(true);

    try {
      const filters = {
        search: searchQuery,
        category_id: selectedCategory,
        level: selectedLevel,
        type: selectedType,
        min_price: minPrice ? parseInt(minPrice) : undefined,
        max_price: maxPrice ? parseInt(maxPrice) : undefined,
        is_free: isFree || undefined,
        page: currentPage,
        sort_by: sortBy,
        status: "Active",
        limit: 12,
        populate: ["category", "tags", "featured_image", "instructor"],
      };

      const response = await getCourses(filters);

      if (response.success && response.data) {
        setCourses(response.data.courses);
        setPagination(response.data.pagination);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedCategory, selectedLevel, selectedType, minPrice, maxPrice, isFree, currentPage, sortBy]);

  // Handle filter changes
  const handleFilterChange = useCallback((newFilters: Record<string, any>) => {
    setCurrentPage(1); // Reset to first page when filters change
    updateURL({ ...newFilters, page: 1 });
  }, [updateURL]);

  // Handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    handleFilterChange({
      search: query,
      category: selectedCategory,
      level: selectedLevel,
      type: selectedType,
      min_price: minPrice,
      max_price: maxPrice,
      free: isFree,
      sort: sortBy,
    });
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    updateURL({
      search: searchQuery,
      category: selectedCategory,
      level: selectedLevel,
      type: selectedType,
      min_price: minPrice,
      max_price: maxPrice,
      free: isFree,
      sort: sortBy,
      page,
    });
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setSelectedLevel('');
    setSelectedType('');
    setMinPrice('');
    setMaxPrice('');
    setIsFree(false);
    setSortBy('created_at');
    setCurrentPage(1);
    updateURL({});
  };

  // Fetch courses when filters change
  useEffect(() => {
    if (searchParams.toString() !== '') {
      fetchCourses();
    }
  }, [searchParams, fetchCourses]);

  const isRTL = locale === 'fa';

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary to-primary-dark text-white py-16">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              {isRTL ? 'دوره‌های آموزشی' : 'Educational Courses'}
            </h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              {isRTL
                ? 'به بهترین دوره‌های معماری اسلامی و هنرهای سنتی دسترسی پیدا کنید'
                : 'Access the best courses in Islamic architecture and traditional arts'
              }
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Filters Section */}
        <div className="mb-8 bg-white rounded-lg shadow-sm p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            {/* Search */}
            <div>
              <input
                type="text"
                placeholder={isRTL ? 'جستجو در دوره‌ها...' : 'Search courses...'}
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>

            {/* Category Filter */}
            <div>
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  handleFilterChange({
                    search: searchQuery,
                    category: e.target.value,
                    level: selectedLevel,
                    type: selectedType,
                    min_price: minPrice,
                    max_price: maxPrice,
                    free: isFree,
                    sort: sortBy,
                  });
                }}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              >
                <option value="">{isRTL ? 'همه دسته‌ها' : 'All Categories'}</option>
                {categories.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Level Filter */}
            <div>
              <select
                value={selectedLevel}
                onChange={(e) => {
                  setSelectedLevel(e.target.value);
                  handleFilterChange({
                    search: searchQuery,
                    category: selectedCategory,
                    level: e.target.value,
                    type: selectedType,
                    min_price: minPrice,
                    max_price: maxPrice,
                    free: isFree,
                    sort: sortBy,
                  });
                }}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              >
                <option value="">{isRTL ? 'همه سطوح' : 'All Levels'}</option>
                <option value="Beginner">{isRTL ? 'مبتدی' : 'Beginner'}</option>
                <option value="Intermediate">{isRTL ? 'متوسط' : 'Intermediate'}</option>
                <option value="Advanced">{isRTL ? 'پیشرفته' : 'Advanced'}</option>
              </select>
            </div>

            {/* Sort */}
            <div>
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value);
                  handleFilterChange({
                    search: searchQuery,
                    category: selectedCategory,
                    level: selectedLevel,
                    type: selectedType,
                    min_price: minPrice,
                    max_price: maxPrice,
                    free: isFree,
                    sort: e.target.value,
                  });
                }}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              >
                <option value="created_at">{isRTL ? 'جدیدترین' : 'Newest'}</option>
                <option value="price">{isRTL ? 'قیمت (کم به زیاد)' : 'Price (Low to High)'}</option>
                <option value="-price">{isRTL ? 'قیمت (زیاد به کم)' : 'Price (High to Low)'}</option>
                <option value="-average_rating">{isRTL ? 'بالاترین امتیاز' : 'Highest Rated'}</option>
                <option value="-total_students">{isRTL ? 'محبوب‌ترین' : 'Most Popular'}</option>
              </select>
            </div>
          </div>

          {/* Additional Filters */}
          <div className="flex flex-wrap gap-4 items-center">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={isFree}
                onChange={(e) => {
                  setIsFree(e.target.checked);
                  handleFilterChange({
                    search: searchQuery,
                    category: selectedCategory,
                    level: selectedLevel,
                    type: selectedType,
                    min_price: minPrice,
                    max_price: maxPrice,
                    free: e.target.checked,
                    sort: sortBy,
                  });
                }}
                className="rounded text-primary focus:ring-primary"
              />
              <span>{isRTL ? 'فقط دوره‌های رایگان' : 'Free courses only'}</span>
            </label>

            <button
              onClick={clearFilters}
              className="px-4 py-2 text-primary border border-primary rounded-lg hover:bg-primary hover:text-white transition-colors"
            >
              {isRTL ? 'پاک کردن فیلترها' : 'Clear Filters'}
            </button>
          </div>
        </div>

        {/* Results Summary */}
        <div className="mb-6 flex justify-between items-center">
          <p className="text-gray-600">
            {isRTL
              ? `${pagination.total_items} دوره یافت شد`
              : `Found ${pagination.total_items} courses`
            }
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center py-12">
            <LoadingSpinner />
          </div>
        )}

        {/* Courses Grid */}
        {!loading && (
          <>
            {courses.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold mb-2">
                  {isRTL ? 'دوره‌ای یافت نشد' : 'No courses found'}
                </h3>
                <p className="text-gray-600">
                  {isRTL
                    ? 'لطفاً فیلترهای خود را تغییر دهید یا جستجوی دیگری انجام دهید'
                    : 'Try changing your filters or search terms'
                  }
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                {courses.map((course) => (
                  <Link
                    key={course._id}
                    href={`/${locale}/courses/${course.slug || course._id}`}
                  >
                    <ContentCard
                      id={course._id}
                      title={isRTL ? course.name : course.name_en || course.name}
                      description={isRTL
                        ? course.short_description || course.description
                        : course.short_description_en || course.description_en || course.description
                      }
                      imageUrl={course.featured_image?.details?.url}
                      imageAlt={course.featured_image?.details?.alt}
                      price={course.price}
                      originalPrice={course.original_price}
                      rating={course.average_rating}
                      reviewCount={course.total_reviews}
                      studentCount={course.total_students}
                      level={course.level}
                      type={course.type}
                      instructor={
                        course.instructor?.details
                          ? `${course.instructor.details.first_name} ${course.instructor.details.last_name}`
                          : undefined
                      }
                      category={course.category?.details?.name}
                      isFree={course.is_free}
                      locale={locale}
                    />
                  </Link>
                ))}
              </div>
            )}

            {/* Pagination */}
            {pagination.total_pages > 1 && (
              <div className="flex justify-center">
                <Pagination
                  currentPage={pagination.current_page}
                  totalPages={pagination.total_pages}
                  onPageChange={handlePageChange}
                  hasNext={pagination.has_next}
                  hasPrevious={pagination.has_previous}
                  locale={locale}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

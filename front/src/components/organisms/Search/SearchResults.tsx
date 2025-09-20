"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import ContentCard from "@/components/organisms/ContentCard";
import Pagination from "@/components/molecules/Pagination";
import LoadingSpinner from "@/components/atoms/LoadingSpinner";

interface SearchResult {
  _id: string;
  content_type: "Course" | "Article" | "Workshop" | "Product";
  title?: string;
  name?: string;
  title_en?: string;
  name_en?: string;
  description?: string;
  excerpt?: string;
  description_en?: string;
  excerpt_en?: string;
  slug?: string;
  price?: number;
  discounted_price?: number;
  is_free?: boolean;
  level?: string;
  duration_hours?: number;
  view_count?: number;
  like_count?: number;
  enrollment_count?: number;
  average_rating?: number;
  rating_count?: number;
  published_at?: string;
  created_at?: string;
  featured_image?: {
    url: string;
    alt_text?: string;
  };
  category?: {
    _id: string;
    name: string;
    name_en?: string;
    slug: string;
  };
  instructor?: {
    _id: string;
    first_name: string;
    last_name: string;
    first_name_en?: string;
    last_name_en?: string;
  };
  author?: {
    _id: string;
    first_name: string;
    last_name: string;
    first_name_en?: string;
    last_name_en?: string;
  };
  tags?: Array<{
    _id: string;
    name: string;
    name_en?: string;
  }>;
  recommendation_reason?: string;
  relevance_score?: number;
}

interface SearchResultsProps {
  results: SearchResult[];
  loading?: boolean;
  query?: string;
  totalResults?: number;
  currentPage?: number;
  totalPages?: number;
  itemsPerPage?: number;
  onPageChange?: (page: number) => void;
  onViewModeChange?: (mode: "grid" | "list") => void;
  onSortChange?: (sortBy: string) => void;
  activeFilters?: Record<string, any>;
  onFilterRemove?: (filterKey: string, value?: any) => void;
  searchTime?: number;
  className?: string;
  locale?: string;
  showFilters?: boolean;
  emptyStateMessage?: string;
  emptyStateMessageEn?: string;
}

const SearchResults: React.FC<SearchResultsProps> = ({
  results = [],
  loading = false,
  query = "",
  totalResults = 0,
  currentPage = 1,
  totalPages = 0,
  itemsPerPage = 12,
  onPageChange,
  onViewModeChange,
  onSortChange,
  activeFilters = {},
  onFilterRemove,
  searchTime,
  className = "",
  locale = "fa",
  showFilters = true,
  emptyStateMessage = "نتیجه‌ای یافت نشد",
  emptyStateMessageEn = "No results found",
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState("relevance");

  // Initialize state from URL params
  useEffect(() => {
    const view = (searchParams.get("view") as "grid" | "list") || "grid";
    const sort = searchParams.get("sort") || "relevance";
    setViewMode(view);
    setSortBy(sort);
  }, [searchParams]);

  // Handle view mode change
  const handleViewModeChange = (mode: "grid" | "list") => {
    setViewMode(mode);

    const params = new URLSearchParams(searchParams.toString());
    params.set("view", mode);
    router.push(`${pathname}?${params.toString()}`, { scroll: false });

    if (onViewModeChange) {
      onViewModeChange(mode);
    }
  };

  // Handle sort change
  const handleSortChange = (newSortBy: string) => {
    setSortBy(newSortBy);

    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", newSortBy);
    params.set("page", "1"); // Reset to first page
    router.push(`${pathname}?${params.toString()}`, { scroll: false });

    if (onSortChange) {
      onSortChange(newSortBy);
    }
  };

  // Handle filter removal
  const handleFilterRemove = (filterKey: string, value?: any) => {
    if (onFilterRemove) {
      onFilterRemove(filterKey, value);
    }
  };

  // Get display name for content
  const getDisplayName = (item: SearchResult) => {
    const title = item.title || item.name;
    const titleEn = item.title_en || item.name_en;

    return locale === "en" && titleEn ? titleEn : title;
  };

  // Get display description
  const getDisplayDescription = (item: SearchResult) => {
    const desc = item.description || item.excerpt;
    const descEn = item.description_en || item.excerpt_en;

    return locale === "en" && descEn ? descEn : desc;
  };

  // Get content URL
  const getContentUrl = (item: SearchResult) => {
    const baseUrl = item.content_type.toLowerCase();
    const slug = item.slug || item._id;

    if (item.content_type === "Workshop") {
      return `/workshops/${slug}`;
    }

    return `/${baseUrl}s/${slug}`;
  };

  // Sort options
  const sortOptions = [
    { value: "relevance", label: "مرتبط‌ترین", label_en: "Most Relevant" },
    { value: "created_at", label: "جدیدترین", label_en: "Newest" },
    { value: "price_asc", label: "ارزان‌ترین", label_en: "Price: Low to High" },
    { value: "price_desc", label: "گران‌ترین", label_en: "Price: High to Low" },
    { value: "rating", label: "بهترین امتیاز", label_en: "Highest Rated" },
    { value: "popularity", label: "محبوب‌ترین", label_en: "Most Popular" },
    { value: "alphabetical", label: "الفبایی", label_en: "Alphabetical" },
  ];

  // Active filter tags
  const filterTags = Object.entries(activeFilters).flatMap(([key, value]) => {
    if (!value || (Array.isArray(value) && value.length === 0)) return [];

    if (Array.isArray(value)) {
      return value.map((val: any, index: number) => ({
        key: `${key}_${index}`,
        filterKey: key,
        value: val,
        label: typeof val === "string" ? val : JSON.stringify(val),
      }));
    }

    return [
      {
        key,
        filterKey: key,
        value,
        label: typeof value === "string" ? value : JSON.stringify(value),
      },
    ];
  });

  // Loading skeleton
  const LoadingSkeleton = () => (
    <div
      className={`
      flex ${viewMode === "grid" ? "flex-wrap gap-6" : "flex-col gap-4"}
      ${viewMode === "grid" ? "justify-start" : ""}
    `}
    >
      {Array.from({ length: itemsPerPage }).map((_, index) => (
        <div
          key={index}
          className={`
            ${
              viewMode === "grid"
                ? "w-full md:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)]"
                : "w-full"
            }
            bg-background border border-background-secondary rounded-lg overflow-hidden
            animate-pulse
          `}
        >
          <div
            className={`
            ${viewMode === "grid" ? "h-48" : "flex items-center gap-4 p-4"}
          `}
          >
            {viewMode === "grid" ? (
              <>
                <div className="w-full h-32 bg-background-darkest"></div>
                <div className="p-4">
                  <div className="h-4 bg-background-darkest rounded mb-2"></div>
                  <div className="h-3 bg-background-darkest rounded mb-2 w-3/4"></div>
                  <div className="h-3 bg-background-darkest rounded w-1/2"></div>
                </div>
              </>
            ) : (
              <>
                <div className="w-24 h-24 bg-background-darkest rounded-lg flex-shrink-0"></div>
                <div className="flex-1">
                  <div className="h-4 bg-background-darkest rounded mb-2"></div>
                  <div className="h-3 bg-background-darkest rounded mb-2 w-3/4"></div>
                  <div className="h-3 bg-background-darkest rounded w-1/2"></div>
                </div>
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );

  // Empty state
  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-24 h-24 mb-6 bg-background-primary rounded-full flex items-center justify-center">
        <Image
          src="/icons/search.svg"
          alt=""
          width={32}
          height={32}
          className="w-8 h-8 text-text-lighter"
        />
      </div>

      <h3 className="text-xl font-bold text-text-primary mb-2">
        {locale === "fa" ? emptyStateMessage : emptyStateMessageEn}
      </h3>

      {query && (
        <p className="text-text-secondary mb-6 max-w-md">
          {locale === "fa"
            ? `نتیجه‌ای برای جستجوی "${query}" یافت نشد. لطفاً کلمات کلیدی دیگری امتحان کنید.`
            : `No results found for "${query}". Try different keywords or filters.`}
        </p>
      )}

      <div className="flex flex-col sm:flex-row gap-4">
        <Link
          href="/courses"
          className="px-6 py-3 bg-primary text-background font-medium rounded-lg hover:bg-primary-dark transition-colors"
        >
          {locale === "fa" ? "مشاهده همه دوره‌ها" : "Browse All Courses"}
        </Link>

        <Link
          href="/articles"
          className="px-6 py-3 border border-background-darkest text-text-primary font-medium rounded-lg hover:bg-background-primary transition-colors"
        >
          {locale === "fa" ? "مشاهده مقالات" : "Browse Articles"}
        </Link>
      </div>
    </div>
  );

  return (
    <div
      className={`flex flex-col ${className}`}
      dir={locale === "fa" ? "rtl" : "ltr"}
    >
      {/* Search Info Header */}
      {(query || totalResults > 0) && (
        <div className="flex flex-col gap-4 mb-6">
          {/* Search Summary */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex flex-col">
              {query && (
                <h2 className="text-lg font-bold text-text-primary">
                  {locale === "fa"
                    ? `نتایج جستجو برای "${query}"`
                    : `Search results for "${query}"`}
                </h2>
              )}

              <div className="flex items-center gap-4 text-sm text-text-secondary mt-1">
                <span>
                  {locale === "fa"
                    ? `${totalResults.toLocaleString()} نتیجه`
                    : `${totalResults.toLocaleString()} results`}
                </span>

                {searchTime && (
                  <span>
                    {locale === "fa"
                      ? `در ${(searchTime / 1000).toFixed(2)} ثانیه`
                      : `in ${(searchTime / 1000).toFixed(2)} seconds`}
                  </span>
                )}
              </div>
            </div>

            {/* View & Sort Controls */}
            <div className="flex items-center gap-4">
              {/* Sort Dropdown */}
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-text-secondary">
                  {locale === "fa" ? "مرتب‌سازی:" : "Sort:"}
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="px-3 py-2 bg-background border border-background-darkest rounded-lg text-sm text-text-primary focus:outline-none focus:border-primary"
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {locale === "fa" ? option.label : option.label_en}
                    </option>
                  ))}
                </select>
              </div>

              {/* View Mode Toggle */}
              <div className="flex items-center bg-background-primary rounded-lg p-1">
                <button
                  onClick={() => handleViewModeChange("grid")}
                  className={`
                    flex items-center justify-center w-8 h-8 rounded transition-colors
                    ${
                      viewMode === "grid"
                        ? "bg-background shadow-sm text-text"
                        : "text-text-lighter hover:text-text-secondary"
                    }
                  `}
                  aria-label={locale === "fa" ? "نمایش شبکه‌ای" : "Grid view"}
                >
                  <Image
                    src="/icons/grid.svg"
                    alt=""
                    width={16}
                    height={16}
                    className="w-4 h-4"
                  />
                </button>

                <button
                  onClick={() => handleViewModeChange("list")}
                  className={`
                    flex items-center justify-center w-8 h-8 rounded transition-colors
                    ${
                      viewMode === "list"
                        ? "bg-background shadow-sm text-text"
                        : "text-text-lighter hover:text-text-secondary"
                    }
                  `}
                  aria-label={locale === "fa" ? "نمایش لیستی" : "List view"}
                >
                  <Image
                    src="/icons/list.svg"
                    alt=""
                    width={16}
                    height={16}
                    className="w-4 h-4"
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Active Filters */}
          {showFilters && filterTags.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium text-text-secondary">
                {locale === "fa" ? "فیلترهای فعال:" : "Active filters:"}
              </span>

              {filterTags.map((tag) => (
                <div
                  key={tag.key}
                  className="flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                >
                  <span>{tag.label}</span>
                  <button
                    onClick={() => handleFilterRemove(tag.filterKey, tag.value)}
                    className="flex items-center justify-center w-4 h-4 rounded-full hover:bg-primary/20 transition-colors"
                  >
                    <Image
                      src="/icons/x.svg"
                      alt={locale === "fa" ? "حذف" : "Remove"}
                      width={12}
                      height={12}
                      className="w-3 h-3"
                    />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Loading State */}
      {loading && <LoadingSkeleton />}

      {/* Results */}
      {!loading && results.length > 0 && (
        <>
          <div
            className={`
            flex ${viewMode === "grid" ? "flex-wrap gap-6" : "flex-col gap-4"}
            ${viewMode === "grid" ? "justify-start" : ""}
          `}
          >
            {results.map((item) => {
              const displayName = getDisplayName(item);
              const displayDescription = getDisplayDescription(item);
              const contentUrl = getContentUrl(item);

              if (viewMode === "list") {
                return (
                  <div
                    key={item._id}
                    className="flex items-center gap-4 p-4 bg-background border border-background-secondary rounded-lg hover:shadow-md transition-shadow"
                  >
                    {/* Thumbnail */}
                    <Link
                      href={contentUrl}
                      className="flex-shrink-0 w-24 h-24 bg-background-darkest rounded-lg overflow-hidden"
                    >
                      {item.featured_image?.url ? (
                        <Image
                          src={item.featured_image.url}
                          alt={
                            item.featured_image.alt_text || displayName || ""
                          }
                          width={96}
                          height={96}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-text-lighter">
                          <Image
                            src="/icons/image.svg"
                            alt=""
                            width={24}
                            height={24}
                            className="w-6 h-6"
                          />
                        </div>
                      )}
                    </Link>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <Link
                          href={contentUrl}
                          className="font-bold text-text-primary hover:text-primary transition-colors line-clamp-1"
                        >
                          {displayName}
                        </Link>

                        {/* Content Type Badge */}
                        <span
                          className={`
                          px-2 py-1 text-xs font-medium rounded flex-shrink-0
                          ${
                            item.content_type === "Course"
                              ? "bg-primary/10 text-primary"
                              : item.content_type === "Article"
                                ? "bg-accent/10 text-accent"
                                : item.content_type === "Workshop"
                                  ? "bg-accent-primary/10 text-accent-primary"
                                  : "bg-background-secondary text-text-secondary"
                          }
                        `}
                        >
                          {locale === "fa"
                            ? item.content_type === "Course"
                              ? "دوره"
                              : item.content_type === "Article"
                                ? "مقاله"
                                : item.content_type === "Workshop"
                                  ? "کارگاه"
                                  : "محصول"
                            : item.content_type}
                        </span>
                      </div>

                      {displayDescription && (
                        <p className="text-sm text-text-secondary line-clamp-2 mb-2">
                          {displayDescription}
                        </p>
                      )}

                      {/* Meta Information */}
                      <div className="flex items-center gap-4 text-xs text-text-lighter">
                        {item.category && (
                          <span>
                            {locale === "fa"
                              ? item.category.name
                              : item.category.name_en || item.category.name}
                          </span>
                        )}

                        {item.price !== undefined && (
                          <span>
                            {item.is_free || item.price === 0
                              ? locale === "fa"
                                ? "رایگان"
                                : "Free"
                              : `${(item.discounted_price || item.price).toLocaleString()} ${locale === "fa" ? "تومان" : "IRT"}`}
                          </span>
                        )}

                        {item.average_rating && (
                          <div className="flex items-center gap-1">
                            <Image
                              src="/icons/star.svg"
                              alt=""
                              width={12}
                              height={12}
                              className="w-3 h-3 text-accent-primary"
                            />
                            <span>{item.average_rating.toFixed(1)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              }

              // Grid view
              return (
                <div
                  key={item._id}
                  className="w-full md:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)]"
                >
                  <ContentCard
                    href={contentUrl}
                    title={displayName || ""}
                    imageUrl={item.featured_image?.url}
                    description={displayDescription}
                    price={
                      item.price !== undefined
                        ? item.is_free || item.price === 0
                          ? locale === "fa"
                            ? "رایگان"
                            : "Free"
                          : `${(item.discounted_price || item.price).toLocaleString()} ${locale === "fa" ? "تومان" : "IRT"}`
                        : undefined
                    }
                    originalPrice={
                      item.discounted_price &&
                      item.price &&
                      item.price > item.discounted_price
                        ? `${item.price.toLocaleString()} ${locale === "fa" ? "تومان" : "IRT"}`
                        : undefined
                    }
                    locale={locale}
                    variant="light"
                    author={
                      item.instructor
                        ? `${item.instructor.first_name} ${item.instructor.last_name}`
                        : item.author
                          ? `${item.author.first_name} ${item.author.last_name}`
                          : undefined
                    }
                    level={item.level}
                    rating={item.average_rating}
                    reviews={item.rating_count}
                  />
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-8">
              <Pagination
                countPage={currentPage}
                totalPages={totalPages}
                onPageChange={onPageChange || (() => {})}
                locale={locale}
              />
            </div>
          )}
        </>
      )}

      {/* Empty State */}
      {!loading && results.length === 0 && <EmptyState />}
    </div>
  );
};

export default SearchResults;

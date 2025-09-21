"use client";

import { use, useState, useEffect, useCallback, useMemo, Suspense } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import SearchBar from "@/components/organisms/Search/SearchBar";
import SearchFilters from "@/components/organisms/Search/SearchFilters";
import SearchResults from "@/components/organisms/Search/SearchResults";
import FilterTags from "@/components/organisms/Search/FilterTags";
import LoadingSpinner from "@/components/atoms/LoadingSpinner";

export const dynamic = "force-dynamic";

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

interface SearchResponse {
  success: boolean;
  data?: {
    results: SearchResult[];
    pagination: {
      current_page: number;
      total_pages: number;
      total_items: number;
      items_per_page: number;
      has_next: boolean;
      has_previous: boolean;
    };
    facets?: Record<string, any>;
    query_info: {
      query: string;
      total_results: number;
      search_time: number;
      filters_applied: Record<string, boolean>;
    };
  };
  message?: string;
  message_en?: string;
}

function SearchContent({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params);
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // State management
  const [mounted, setMounted] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    current_page: 1,
    total_pages: 1,
    total_items: 0,
    items_per_page: 12,
    has_next: false,
    has_previous: false,
  });
  const [facets, setFacets] = useState<Record<string, any>>({});
  const [searchInfo, setSearchInfo] = useState({
    query: "",
    total_results: 0,
    search_time: 0,
    filters_applied: {}
  });
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Get current filters from URL
  const currentFilters = useMemo(() => {
    const filters: Record<string, any> = {};

    searchParams.forEach((value, key) => {
      if (key.startsWith('filter_')) {
        const filterKey = key.replace('filter_', '');
        try {
          filters[filterKey] = JSON.parse(value);
        } catch {
          filters[filterKey] = value;
        }
      }
    });

    return filters;
  }, [searchParams]);

  // Get search parameters
  const searchQuery = searchParams.get("q") || searchParams.get("search") || "";
  const currentPage = parseInt(searchParams.get("page") || "1");
  const sortBy = searchParams.get("sort") || "relevance";
  const viewMode = searchParams.get("view") || "grid";

  // Set mounted flag
  useEffect(() => {
    setMounted(true);
  }, []);

  // Search function
  const performSearch = useCallback(async (searchOptions: {
    query?: string;
    filters?: Record<string, any>;
    page?: number;
    sort?: string;
    limit?: number;
  } = {}) => {
    const {
      query = searchQuery,
      filters = currentFilters,
      page = currentPage,
      sort = sortBy,
      limit = 12
    } = searchOptions;

    setLoading(true);
    setError(null);

    try {
      // Build search parameters
      const searchParams = {
        query: query.trim(),
        ...filters,
        page,
        limit,
        sort_by: sort,
        include_facets: true,
        language: locale === "en" ? "en" : "both"
      };

      // Call search API
      const response = await fetch("/api/search/content", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(searchParams),
      });

      if (!response.ok) {
        throw new Error(`Search failed: ${response.status}`);
      }

      const data: SearchResponse = await response.json();

      if (data.success && data.data) {
        setResults(data.data.results);
        setPagination(data.data.pagination);
        setFacets(data.data.facets || {});
        setSearchInfo(data.data.query_info);
      } else {
        throw new Error(data.message || data.message_en || "Search failed");
      }
    } catch (err) {
      console.error("Search error:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
      setResults([]);
      setPagination({
        current_page: 1,
        total_pages: 1,
        total_items: 0,
        items_per_page: 12,
        has_next: false,
        has_previous: false,
      });
    } finally {
      setLoading(false);
    }
  }, [searchQuery, currentFilters, currentPage, sortBy, locale]);

  // Perform search when parameters change
  useEffect(() => {
    if (mounted) {
      performSearch();
    }
  }, [mounted, performSearch]);

  // Update URL with new parameters
  const updateURL = useCallback((updates: Record<string, any>) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(updates).forEach(([key, value]) => {
      if (value === undefined || value === null || value === "" ||
          (Array.isArray(value) && value.length === 0)) {
        params.delete(key);
      } else {
        params.set(key, typeof value === "string" ? value : JSON.stringify(value));
      }
    });

    const newUrl = `${pathname}?${params.toString()}`;
    router.push(newUrl, { scroll: false });
  }, [searchParams, router, pathname]);

  // Handle search
  const handleSearch = (query: string) => {
    updateURL({
      q: query,
      page: 1 // Reset to first page on new search
    });
  };

  // Handle filters change
  const handleFiltersChange = (filters: Record<string, any>) => {
    const filterUpdates: Record<string, any> = { page: 1 };

    // Convert filters to URL format
    Object.entries(filters).forEach(([key, value]) => {
      filterUpdates[`filter_${key}`] = value;
    });

    // Remove filters that are not in the new filters object
    searchParams.forEach((_, key) => {
      if (key.startsWith('filter_')) {
        const filterKey = key.replace('filter_', '');
        if (!(filterKey in filters)) {
          filterUpdates[key] = undefined; // Will be deleted in updateURL
        }
      }
    });

    updateURL(filterUpdates);
  };

  // Handle filter removal
  const handleFilterRemove = (filterKey: string, value?: any) => {
    const currentFilter = currentFilters[filterKey];

    if (Array.isArray(currentFilter) && value !== undefined) {
      // Remove specific value from array
      const updatedArray = currentFilter.filter(item =>
        JSON.stringify(item) !== JSON.stringify(value)
      );

      updateURL({
        [`filter_${filterKey}`]: updatedArray.length > 0 ? updatedArray : undefined,
        page: 1
      });
    } else {
      // Remove entire filter
      updateURL({
        [`filter_${filterKey}`]: undefined,
        page: 1
      });
    }
  };

  // Handle clear all filters
  const handleClearAllFilters = () => {
    const updates: Record<string, any> = { page: 1 };

    // Mark all filter params for removal
    searchParams.forEach((_, key) => {
      if (key.startsWith('filter_')) {
        updates[key] = undefined;
      }
    });

    updateURL(updates);
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    updateURL({ page });
  };

  // Handle sort change
  const handleSortChange = (sort: string) => {
    updateURL({ sort, page: 1 });
  };

  // Handle view mode change
  const handleViewModeChange = (mode: "grid" | "list") => {
    updateURL({ view: mode });
  };

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" dir={locale === "fa" ? "rtl" : "ltr"}>
      {/* Header */}
      <div className="bg-background border-b border-background-secondary">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col gap-4">
            {/* Page Title */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-text-primary">
                  {locale === "fa" ? "جستجو" : "Search"}
                </h1>
                <p className="text-text-secondary mt-1">
                  {locale === "fa"
                    ? "جستجو در دوره‌ها، مقالات، کارگاه‌ها و محصولات"
                    : "Search courses, articles, workshops, and products"
                  }
                </p>
              </div>

              {/* Mobile Filter Toggle */}
              <button
                onClick={() => setShowMobileFilters(true)}
                className="lg:hidden flex items-center gap-2 px-4 py-2 bg-primary text-background rounded-lg font-medium"
              >
                <Image
                  src="/icons/filter.svg"
                  alt=""
                  width={16}
                  height={16}
                  className="w-4 h-4"
                />
                <span>
                  {locale === "fa" ? "فیلترها" : "Filters"}
                </span>
                {Object.keys(currentFilters).length > 0 && (
                  <span className="bg-background/20 text-background px-2 py-0.5 rounded-full text-xs">
                    {Object.keys(currentFilters).length}
                  </span>
                )}
              </button>
            </div>

            {/* Search Bar */}
            <div className="max-w-4xl">
              <SearchBar
                placeholder={locale === "fa" ? "جستجو در همه محتوا..." : "Search all content..."}
                placeholderEn="Search all content..."
                onSearch={handleSearch}
                showSuggestions={true}
                showRecentSearches={true}
                size="large"
                variant="default"
                locale={locale}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Desktop Filters Sidebar */}
          <aside className="hidden lg:flex flex-col w-80 flex-shrink-0">
            <SearchFilters
              onFiltersChange={handleFiltersChange}
              showCounts={true}
              locale={locale}
              isMobile={false}
            />
          </aside>

          {/* Results Area */}
          <main className="flex flex-col flex-1 min-w-0">
            {/* Active Filters */}
            <div className="mb-6">
              <FilterTags
                activeFilters={currentFilters}
                onFilterRemove={handleFilterRemove}
                onClearAll={handleClearAllFilters}
                showClearAll={true}
                locale={locale}
              />
            </div>

            {/* Search Results */}
            <SearchResults
              results={results}
              loading={loading}
              query={searchQuery}
              totalResults={searchInfo.total_results}
              currentPage={pagination.current_page}
              totalPages={pagination.total_pages}
              itemsPerPage={pagination.items_per_page}
              onPageChange={handlePageChange}
              onViewModeChange={handleViewModeChange}
              onSortChange={handleSortChange}
              activeFilters={currentFilters}
              onFilterRemove={handleFilterRemove}
              searchTime={searchInfo.search_time}
              locale={locale}
              showFilters={true}
              emptyStateMessage="نتیجه‌ای یافت نشد"
              emptyStateMessageEn="No results found"
            />

            {/* Error State */}
            {error && !loading && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 mb-4 bg-red-100 rounded-full flex items-center justify-center">
                  <Image
                    src="/icons/alert-circle.svg"
                    alt=""
                    width={24}
                    height={24}
                    className="w-6 h-6 text-red-600"
                  />
                </div>

                <h3 className="text-xl font-bold text-text-primary mb-2">
                  {locale === "fa" ? "خطا در جستجو" : "Search Error"}
                </h3>

                <p className="text-text-secondary mb-6 max-w-md">
                  {error}
                </p>

                <button
                  onClick={() => performSearch()}
                  className="px-6 py-3 bg-primary text-background font-medium rounded-lg hover:bg-primary-dark transition-colors"
                >
                  {locale === "fa" ? "تلاش مجدد" : "Try Again"}
                </button>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Mobile Filters Modal */}
      <SearchFilters
        onFiltersChange={handleFiltersChange}
        showCounts={true}
        locale={locale}
        isMobile={true}
        isOpen={showMobileFilters}
        onClose={() => setShowMobileFilters(false)}
      />

      {/* Recommendations Section */}
      {!loading && results.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-16">
          <div className="bg-background-primary rounded-2xl p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-text-primary">
                {locale === "fa" ? "پیشنهادات برای شما" : "Recommendations for You"}
              </h2>

              <Link
                href="/recommendations"
                className="text-primary hover:text-primary-dark font-medium text-sm"
              >
                {locale === "fa" ? "مشاهده همه" : "View All"}
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Recommendation cards would go here */}
              <div className="bg-background rounded-lg p-6 border border-background-secondary">
                <div className="text-center text-text-secondary">
                  <Image
                    src="/icons/star.svg"
                    alt=""
                    width={32}
                    height={32}
                    className="w-8 h-8 mx-auto mb-3 text-accent-primary"
                  />
                  <p className="text-sm">
                    {locale === "fa"
                      ? "پیشنهادات شخصی‌سازی شده براساس جستجوهای شما"
                      : "Personalized recommendations based on your searches"
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Popular Searches */}
      {!searchQuery && results.length === 0 && !loading && (
        <section className="max-w-7xl mx-auto px-4 py-16">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-text-primary mb-8">
              {locale === "fa" ? "جستجوهای محبوب" : "Popular Searches"}
            </h2>

            <div className="flex flex-wrap justify-center gap-3 mb-12">
              {[
                "معماری",
                "خوشنویسی",
                "نقاشی",
                "طراحی",
                "هنر اسلامی",
                "مرمت",
                "شهرسازی",
                "دکوراسیون"
              ].map((term) => (
                <button
                  key={term}
                  onClick={() => handleSearch(term)}
                  className="px-4 py-2 bg-background border border-background-darkest rounded-full text-sm font-medium text-text-secondary hover:text-text hover:border-primary transition-colors"
                >
                  {term}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Link
                href="/courses"
                className="flex flex-col items-center p-6 bg-background rounded-lg border border-background-secondary hover:shadow-md transition-shadow"
              >
                <div className="w-16 h-16 mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                  <Image
                    src="/icons/book-open.svg"
                    alt=""
                    width={24}
                    height={24}
                    className="w-6 h-6 text-primary"
                  />
                </div>
                <h3 className="font-bold text-text-primary mb-2">
                  {locale === "fa" ? "مرور دوره‌ها" : "Browse Courses"}
                </h3>
                <p className="text-sm text-text-secondary text-center">
                  {locale === "fa"
                    ? "دوره‌های آموزشی معماری، هنر و طراحی"
                    : "Architecture, art, and design courses"
                  }
                </p>
              </Link>

              <Link
                href="/articles"
                className="flex flex-col items-center p-6 bg-background rounded-lg border border-background-secondary hover:shadow-md transition-shadow"
              >
                <div className="w-16 h-16 mb-4 bg-accent/10 rounded-full flex items-center justify-center">
                  <Image
                    src="/icons/article.svg"
                    alt=""
                    width={24}
                    height={24}
                    className="w-6 h-6 text-accent"
                  />
                </div>
                <h3 className="font-bold text-text-primary mb-2">
                  {locale === "fa" ? "مطالعه مقالات" : "Read Articles"}
                </h3>
                <p className="text-sm text-text-secondary text-center">
                  {locale === "fa"
                    ? "مقالات تخصصی و آموزشی"
                    : "Specialized and educational articles"
                  }
                </p>
              </Link>

              <Link
                href="/workshops"
                className="flex flex-col items-center p-6 bg-background rounded-lg border border-background-secondary hover:shadow-md transition-shadow"
              >
                <div className="w-16 h-16 mb-4 bg-accent-primary/10 rounded-full flex items-center justify-center">
                  <Image
                    src="/icons/users.svg"
                    alt=""
                    width={24}
                    height={24}
                    className="w-6 h-6 text-accent-primary"
                  />
                </div>
                <h3 className="font-bold text-text-primary mb-2">
                  {locale === "fa" ? "شرکت در کارگاه‌ها" : "Join Workshops"}
                </h3>
                <p className="text-sm text-text-secondary text-center">
                  {locale === "fa"
                    ? "کارگاه‌های عملی و تعاملی"
                    : "Practical and interactive workshops"
                  }
                </p>
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

function SearchPage({ params }: { params: Promise<{ locale: string }> }) {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="large" />
      </div>
    }>
      <SearchContent params={params} />
    </Suspense>
  );
}

export default SearchPage;

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
import { getArticles } from "@/app/actions/article/getArticles";

export const dynamic = "force-dynamic";

interface Article {
  _id: string;
  title: string;
  title_en?: string;
  content: string;
  content_en?: string;
  excerpt?: string;
  excerpt_en?: string;
  type: "Article" | "News" | "Research" | "Tutorial" | "Interview";
  published_at: string;
  view_count: number;
  like_count: number;
  comment_count: number;
  estimated_reading_time?: number;
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
  author?: {
    details?: {
      _id: string;
      first_name: string;
      last_name: string;
      summary?: string;
    };
  };
  slug?: string;
  featured: boolean;
  pinned: boolean;
}

interface Author {
  _id: string;
  first_name: string;
  last_name: string;
  article_count: number;
}

interface Category {
  _id: string;
  name: string;
}

interface ArticlesResponse {
  articles: Article[];
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
    available_authors: Author[];
    available_types: string[];
  };
}

function ArticlesContent({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params);
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // State management
  const [articles, setArticles] = useState<Article[]>([]);
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
  const [authors, setAuthors] = useState<Author[]>([]);
  const [availableTypes, setAvailableTypes] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  // Filter state from URL params
  const currentFilters = useMemo(
    () => ({
      search: searchParams.get("search") || "",
      category_id: searchParams.get("category") || "",
      author_id: searchParams.get("author") || "",
      type: searchParams.get("type") || "",
      featured:
        searchParams.get("featured") === "true"
          ? true
          : searchParams.get("featured") === "false"
            ? false
            : undefined,
      published_after: searchParams.get("from") || "",
      published_before: searchParams.get("to") || "",
      page: parseInt(searchParams.get("page") || "1"),
      sort_by: searchParams.get("sort") || "published_at",
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

  // Fetch articles
  const fetchArticles = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Only call server action in client environment
      const response =
        typeof window !== "undefined"
          ? await getArticles({
              ...currentFilters,
              status: "Published",
              limit: 12,
              populate: ["category", "tags", "featured_image", "author"],
            })
          : {
              success: true,
              data: {
                articles: [],
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
                  available_authors: [],
                  available_types: [],
                },
              },
            };

      if (response.success && response.data) {
        const data = response.data as ArticlesResponse;
        setArticles(data.articles);
        setPagination(data.pagination);
        setCategories(data.filters.available_categories);
        setAuthors(data.filters.available_authors);
        setAvailableTypes(data.filters.available_types);
      } else {
        setError(response.message || "خطا در دریافت مقالات");
      }
    } catch (err) {
      console.error("Error fetching articles:", err);
      setError("خطا در برقراری ارتباط با سرور");
    } finally {
      setLoading(false);
    }
  }, [currentFilters]);

  // Fetch articles when filters change
  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  // Clear all filters
  const clearAllFilters = () => {
    router.push(pathname, { scroll: false });
  };

  // Get localized article content
  const getLocalizedContent = (article: Article) => {
    const title =
      locale === "fa" ? article.title : article.title_en || article.title;
    const excerpt =
      locale === "fa"
        ? article.excerpt || article.content.substring(0, 200) + "..."
        : article.excerpt_en ||
          article.content_en?.substring(0, 200) + "..." ||
          article.excerpt ||
          article.content.substring(0, 200) + "...";

    return { title, excerpt };
  };

  // Get type display text
  const getTypeText = (type: string) => {
    if (locale === "fa") {
      switch (type) {
        case "Article":
          return "مقاله";
        case "News":
          return "خبر";
        case "Research":
          return "پژوهش";
        case "Tutorial":
          return "آموزش";
        case "Interview":
          return "مصاحبه";
        default:
          return type;
      }
    }
    return type;
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return locale === "fa"
      ? date.toLocaleDateString("fa-IR")
      : date.toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        });
  };

  // Active filters count
  const activeFiltersCount = Object.values(currentFilters).filter(
    (value) => value !== "" && value !== undefined && value !== 1,
  ).length;

  const pageTitle = locale === "fa" ? "مقالات و اخبار" : "Articles & News";
  const searchPlaceholder =
    locale === "fa" ? "جستجو در مقالات..." : "Search articles...";

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
                ? "جدیدترین مقالات، اخبار و پژوهش‌های مرکز معماری اسلامی"
                : "Latest articles, news and research from the Islamic Architecture Center"}
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

              {/* Author Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-text mb-2">
                  {locale === "fa" ? "نویسنده" : "Author"}
                </label>
                <select
                  value={currentFilters.author_id}
                  onChange={(e) => updateFilters({ author: e.target.value })}
                  className="w-full px-4 py-2 border border-background-darkest rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="">
                    {locale === "fa" ? "همه نویسندگان" : "All Authors"}
                  </option>
                  {authors.map((author) => (
                    <option key={author._id} value={author._id}>
                      {author.first_name} {author.last_name} (
                      {author.article_count})
                    </option>
                  ))}
                </select>
              </div>

              {/* Type Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-text mb-2">
                  {locale === "fa" ? "نوع مطلب" : "Content Type"}
                </label>
                <select
                  value={currentFilters.type}
                  onChange={(e) => updateFilters({ type: e.target.value })}
                  className="w-full px-4 py-2 border border-background-darkest rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="">
                    {locale === "fa" ? "همه انواع" : "All Types"}
                  </option>
                  {availableTypes.map((type) => (
                    <option key={type} value={type}>
                      {getTypeText(type)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Featured Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-text mb-2">
                  {locale === "fa" ? "مطالب ویژه" : "Featured Content"}
                </label>
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="featured_filter"
                      checked={currentFilters.featured === true}
                      onChange={() => updateFilters({ featured: "true" })}
                      className="w-4 h-4 text-primary"
                    />
                    <span className="mr-2">
                      {locale === "fa" ? "فقط مطالب ویژه" : "Featured only"}
                    </span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="featured_filter"
                      checked={currentFilters.featured === undefined}
                      onChange={() => updateFilters({ featured: undefined })}
                      className="w-4 h-4 text-primary"
                    />
                    <span className="mr-2">
                      {locale === "fa" ? "همه مطالب" : "All content"}
                    </span>
                  </label>
                </div>
              </div>

              {/* Date Range Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-text mb-2">
                  {locale === "fa" ? "بازه زمانی" : "Date Range"}
                </label>
                <div className="space-y-2">
                  <input
                    type="date"
                    placeholder={locale === "fa" ? "از تاریخ" : "From date"}
                    value={currentFilters.published_after}
                    onChange={(e) => updateFilters({ from: e.target.value })}
                    className="w-full px-4 py-2 border border-background-darkest rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                  <input
                    type="date"
                    placeholder={locale === "fa" ? "تا تاریخ" : "To date"}
                    value={currentFilters.published_before}
                    onChange={(e) => updateFilters({ to: e.target.value })}
                    className="w-full px-4 py-2 border border-background-darkest rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
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
                  <option value="published_at">
                    {locale === "fa" ? "تاریخ انتشار" : "Publish Date"}
                  </option>
                  <option value="view_count">
                    {locale === "fa" ? "تعداد بازدید" : "View Count"}
                  </option>
                  <option value="like_count">
                    {locale === "fa" ? "تعداد پسندیده" : "Like Count"}
                  </option>
                  <option value="title">
                    {locale === "fa" ? "عنوان" : "Title"}
                  </option>
                  <option value="created_at">
                    {locale === "fa" ? "تاریخ ایجاد" : "Created Date"}
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
                    ? `${pagination.total_items} مقاله یافت شد`
                    : `${pagination.total_items} articles found`}
                </span>
              )}
            </div>

            {/* Results Info - Desktop */}
            {!loading && (
              <div className="hidden lg:flex items-center justify-between mb-6">
                <span className="text-text-secondary">
                  {locale === "fa"
                    ? `${pagination.total_items} مقاله یافت شد`
                    : `${pagination.total_items} articles found`}
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
                  onClick={fetchArticles}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                >
                  {locale === "fa" ? "تلاش مجدد" : "Try Again"}
                </button>
              </div>
            )}

            {/* Articles Grid */}
            {!loading && !error && (
              <>
                {articles.length > 0 ? (
                  <div className="space-y-6">
                    {/* Featured Articles */}
                    {articles.filter(
                      (article) => article.featured || article.pinned,
                    ).length > 0 && (
                      <div className="mb-12">
                        <h2 className="text-2xl font-bold text-text mb-6">
                          {locale === "fa" ? "مطالب ویژه" : "Featured Articles"}
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {articles
                            .filter(
                              (article) => article.featured || article.pinned,
                            )
                            .slice(0, 2)
                            .map((article) => {
                              const { title, excerpt } =
                                getLocalizedContent(article);
                              const authorName = article.author?.details
                                ? `${article.author.details.first_name} ${article.author.details.last_name}`
                                : undefined;

                              return (
                                <ContentCard
                                  key={article._id}
                                  href={`/${locale}/articles/${article.slug || article._id}`}
                                  title={title}
                                  description={excerpt}
                                  imageUrl={
                                    article.featured_image?.details?.url
                                  }
                                  locale={locale}
                                  variant="article-large"
                                  author={authorName}
                                  date={formatDate(article.published_at)}
                                  commentCount={article.comment_count}
                                />
                              );
                            })}
                        </div>
                      </div>
                    )}

                    {/* All Articles */}
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                      {articles.map((article) => {
                        const { title, excerpt } = getLocalizedContent(article);
                        const authorName = article.author?.details
                          ? `${article.author.details.first_name} ${article.author.details.last_name}`
                          : undefined;

                        return (
                          <ContentCard
                            key={article._id}
                            href={`/${locale}/articles/${article.slug || article._id}`}
                            title={title}
                            description={excerpt}
                            imageUrl={article.featured_image?.details?.url}
                            locale={locale}
                            variant={
                              article.featured ? "article-medium" : "light"
                            }
                            author={authorName}
                            date={formatDate(article.published_at)}
                            commentCount={article.comment_count}
                          />
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="text-text-light text-6xl mb-4">📰</div>
                    <h3 className="text-lg font-semibold text-text mb-2">
                      {locale === "fa"
                        ? "مقاله‌ای یافت نشد"
                        : "No articles found"}
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
                {articles.length > 0 && pagination.total_pages > 1 && (
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

export default function ArticlesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <ArticlesContent params={params} />
    </Suspense>
  );
}

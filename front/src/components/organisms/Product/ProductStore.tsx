"use client";

import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  Suspense,
} from "react";
import { useTranslations } from "next-intl";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Product, ProductQuery } from "@/types";
import { useProduct } from "@/context/ProductContext";
import ProductCard from "./ProductCard";
import ProductSearchFilters from "./Search/ProductSearchFilters";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Grid,
  List,
  RefreshCw,
  Package,
  ChevronLeft,
  ChevronRight,
  ArrowUp,
  TrendingUp,
  Star,
  Filter,
  SortAsc,
  SortDesc,
  Eye,
  ShoppingCart,
  Heart,
  AlertCircle,
  Loader2,
} from "lucide-react";

interface ProductStoreProps {
  initialQuery?: ProductQuery;
  showHeader?: boolean;
  showStats?: boolean;
  itemsPerPageOptions?: number[];
  className?: string;
  locale?: string;
  title?: string;
  description?: string;
}

interface SortOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

function ProductStoreContent({
  initialQuery = {},
  showHeader = true,
  showStats = true,
  itemsPerPageOptions = [12, 24, 48],
  className = "",
  locale = "fa",
  title,
  description,
}: ProductStoreProps) {
  const t = useTranslations();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const { state, fetchProducts, applyFilters, setViewMode, clearError } =
    useProduct();
  const isRTL = locale === "fa";

  // Local state
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [currentQuery, setCurrentQuery] = useState<ProductQuery>({
    page: 1,
    limit: itemsPerPageOptions[0],
    ...initialQuery,
  });

  // Sort options
  const sortOptions: SortOption[] = [
    {
      value: "created_at",
      label: isRTL ? "جدیدترین" : "Newest",
      icon: <Star className="h-4 w-4" />,
    },
    {
      value: "price",
      label: isRTL ? "قیمت (کم به زیاد)" : "Price (Low to High)",
      icon: <SortAsc className="h-4 w-4" />,
    },
    {
      value: "price_desc",
      label: isRTL ? "قیمت (زیاد به کم)" : "Price (High to Low)",
      icon: <SortDesc className="h-4 w-4" />,
    },
    {
      value: "rating",
      label: isRTL ? "بالاترین امتیاز" : "Highest Rated",
      icon: <Star className="h-4 w-4" />,
    },
    {
      value: "popularity",
      label: isRTL ? "محبوب‌ترین" : "Most Popular",
      icon: <TrendingUp className="h-4 w-4" />,
    },
    {
      value: "title",
      label: isRTL ? "نام (الفبایی)" : "Name (A-Z)",
      icon: <SortAsc className="h-4 w-4" />,
    },
  ];

  // Initialize from URL params
  useEffect(() => {
    const urlQuery: ProductQuery = {
      page: parseInt(searchParams.get("page") || "1"),
      limit: parseInt(
        searchParams.get("limit") || itemsPerPageOptions[0].toString(),
      ),
      search: searchParams.get("search") || undefined,
      category: searchParams.get("category")?.split(",") || undefined,
      type: searchParams.get("type")?.split(",") || undefined,
      min_price: searchParams.get("min_price")
        ? parseInt(searchParams.get("min_price")!)
        : undefined,
      max_price: searchParams.get("max_price")
        ? parseInt(searchParams.get("max_price")!)
        : undefined,
      is_featured: searchParams.get("featured") === "true" || undefined,
      is_bestseller: searchParams.get("bestseller") === "true" || undefined,
      is_new: searchParams.get("new") === "true" || undefined,
      is_digital: searchParams.get("digital") === "true" || undefined,
      sort_by: searchParams.get("sort") || "created_at",
      sort_order: (searchParams.get("order") as "asc" | "desc") || "desc",
      ...initialQuery,
    };

    setCurrentQuery(urlQuery);

    if (state.products.length === 0) {
      fetchProducts(urlQuery);
    }
  }, [
    searchParams,
    initialQuery,
    fetchProducts,
    state.products.length,
    itemsPerPageOptions,
  ]);

  // Handle scroll to top button
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Update URL when query changes
  const updateURL = useCallback(
    (query: ProductQuery) => {
      const params = new URLSearchParams();

      if (query.page && query.page > 1)
        params.set("page", query.page.toString());
      if (query.limit && query.limit !== itemsPerPageOptions[0])
        params.set("limit", query.limit.toString());
      if (query.search) params.set("search", query.search);
      if (query.category?.length)
        params.set("category", query.category.join(","));
      if (query.type?.length) params.set("type", query.type.join(","));
      if (query.min_price) params.set("min_price", query.min_price.toString());
      if (query.max_price) params.set("max_price", query.max_price.toString());
      if (query.is_featured) params.set("featured", "true");
      if (query.is_bestseller) params.set("bestseller", "true");
      if (query.is_new) params.set("new", "true");
      if (query.is_digital) params.set("digital", "true");
      if (query.sort_by && query.sort_by !== "created_at")
        params.set("sort", query.sort_by);
      if (query.sort_order && query.sort_order !== "desc")
        params.set("order", query.sort_order);

      const url = params.toString()
        ? `${pathname}?${params.toString()}`
        : pathname;
      router.replace(url, { scroll: false });
    },
    [pathname, router, itemsPerPageOptions],
  );

  // Handle filters change
  const handleFiltersChange = useCallback(
    (filters: ProductQuery) => {
      const newQuery = { ...filters, page: 1, limit: currentQuery.limit };
      setCurrentQuery(newQuery);
      updateURL(newQuery);
      applyFilters(newQuery);
    },
    [currentQuery.limit, updateURL, applyFilters],
  );

  // Handle sort change
  const handleSortChange = (value: string) => {
    const [sortBy, sortOrder] = value.includes("_desc")
      ? [value.replace("_desc", ""), "desc"]
      : [value, "asc"];

    const newQuery = {
      ...currentQuery,
      sort_by: sortBy,
      sort_order: sortOrder as "asc" | "desc",
      page: 1,
    };

    setCurrentQuery(newQuery);
    updateURL(newQuery);
    applyFilters(newQuery);
  };

  // Handle view mode change
  const handleViewModeChange = (mode: "grid" | "list") => {
    setViewMode(mode);
  };

  // Handle page change
  const handlePageChange = (newPage: number) => {
    const newQuery = { ...currentQuery, page: newPage };
    setCurrentQuery(newQuery);
    updateURL(newQuery);
    applyFilters(newQuery);

    // Scroll to top of store
    const storeElement = document.getElementById("product-store");
    if (storeElement) {
      storeElement.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Handle items per page change
  const handleLimitChange = (value: string) => {
    const newLimit = parseInt(value);
    const newQuery = { ...currentQuery, limit: newLimit, page: 1 };
    setCurrentQuery(newQuery);
    updateURL(newQuery);
    applyFilters(newQuery);
  };

  // Handle refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    clearError();
    await fetchProducts(currentQuery);
    setIsRefreshing(false);
  };

  // Scroll to top
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Get grid columns class
  const getGridColumns = () => {
    if (state.viewMode === "list") return "grid-cols-1";
    return "grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5";
  };

  // Get current sort value for select
  const getCurrentSortValue = () => {
    if (
      currentQuery.sort_order === "desc" &&
      currentQuery.sort_by !== "created_at"
    ) {
      return `${currentQuery.sort_by}_desc`;
    }
    return currentQuery.sort_by || "created_at";
  };

  // Render pagination
  const renderPagination = () => {
    if (
      !state.productList?.pagination ||
      state.productList.pagination.pages <= 1
    ) {
      return null;
    }

    const { page, pages, total } = state.productList.pagination;
    const startItem = (page - 1) * currentQuery.limit! + 1;
    const endItem = Math.min(page * currentQuery.limit!, total);

    return (
      <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-4 mt-8 p-4 bg-gray-50 rounded-lg">
        <div className="text-sm text-gray-600 text-center xs:text-right order-2 xs:order-1">
          {isRTL ? (
            <>
              نمایش {startItem.toLocaleString("fa-IR")} تا{" "}
              {endItem.toLocaleString("fa-IR")} از{" "}
              {total.toLocaleString("fa-IR")} محصول
            </>
          ) : (
            <>
              Showing {startItem.toLocaleString("en-US")} to{" "}
              {endItem.toLocaleString("en-US")} of{" "}
              {total.toLocaleString("en-US")} products
            </>
          )}
        </div>

        <div className="flex items-center justify-center xs:justify-end gap-2 order-1 xs:order-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 1 || state.isLoading}
            className="flex items-center gap-1"
          >
            {isRTL ? (
              <>
                بعدی
                <ChevronLeft className="h-4 w-4" />
              </>
            ) : (
              <>
                <ChevronLeft className="h-4 w-4" />
                Previous
              </>
            )}
          </Button>

          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(5, pages) }, (_, i) => {
              let pageNum;
              if (pages <= 5) {
                pageNum = i + 1;
              } else if (page <= 3) {
                pageNum = i + 1;
              } else if (page > pages - 3) {
                pageNum = pages - 4 + i;
              } else {
                pageNum = page - 2 + i;
              }

              return (
                <Button
                  key={pageNum}
                  variant={pageNum === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => handlePageChange(pageNum)}
                  disabled={state.isLoading}
                  className="w-10 h-10 p-0 text-sm"
                >
                  {pageNum.toLocaleString(isRTL ? "fa-IR" : "en-US")}
                </Button>
              );
            })}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(page + 1)}
            disabled={page === pages || state.isLoading}
            className="flex items-center gap-1"
          >
            {isRTL ? (
              <>
                <ChevronRight className="h-4 w-4" />
                قبلی
              </>
            ) : (
              <>
                Next
                <ChevronRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    );
  };

  // Calculate stats
  const stats = useMemo(() => {
    if (!state.productList) return null;

    const { total } = state.productList.pagination;
    const featuredCount = state.products.filter((p) => p.is_featured).length;
    const newCount = state.products.filter((p) => p.is_new).length;
    const digitalCount = state.products.filter((p) => p.is_digital).length;

    return { total, featuredCount, newCount, digitalCount };
  }, [state.productList, state.products]);

  return (
    <div id="product-store" className={`w-full space-y-6 ${className}`}>
      {/* Header */}
      {showHeader && (
        <div className="space-y-4">
          {title && (
            <div className="text-center lg:text-right">
              <h1 className="text-2xl xs:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                {title}
              </h1>
              {description && (
                <p className="text-base xs:text-lg text-gray-600 max-w-3xl mx-auto lg:mx-0">
                  {description}
                </p>
              )}
            </div>
          )}

          {/* Stats */}
          {showStats && stats && (
            <div className="grid grid-cols-2 xs:grid-cols-4 gap-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-100">
              <div className="text-center">
                <div className="text-xl xs:text-2xl font-bold text-blue-600">
                  {stats.total.toLocaleString(isRTL ? "fa-IR" : "en-US")}
                </div>
                <div className="text-xs xs:text-sm text-gray-600">
                  {isRTL ? "کل محصولات" : "Total Products"}
                </div>
              </div>
              <div className="text-center">
                <div className="text-xl xs:text-2xl font-bold text-purple-600">
                  {stats.featuredCount.toLocaleString(
                    isRTL ? "fa-IR" : "en-US",
                  )}
                </div>
                <div className="text-xs xs:text-sm text-gray-600">
                  {isRTL ? "ویژه" : "Featured"}
                </div>
              </div>
              <div className="text-center">
                <div className="text-xl xs:text-2xl font-bold text-green-600">
                  {stats.newCount.toLocaleString(isRTL ? "fa-IR" : "en-US")}
                </div>
                <div className="text-xs xs:text-sm text-gray-600">
                  {isRTL ? "جدید" : "New"}
                </div>
              </div>
              <div className="text-center">
                <div className="text-xl xs:text-2xl font-bold text-orange-600">
                  {stats.digitalCount.toLocaleString(isRTL ? "fa-IR" : "en-US")}
                </div>
                <div className="text-xs xs:text-sm text-gray-600">
                  {isRTL ? "دیجیتال" : "Digital"}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Search and Filters */}
      <ProductSearchFilters
        locale={locale}
        onFiltersChange={handleFiltersChange}
        initialFilters={currentQuery}
        showMobileDrawer={true}
      />

      {/* Controls Bar */}
      <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-4 p-4 bg-white rounded-lg border border-gray-200">
        <div className="flex flex-col xs:flex-row xs:items-center gap-3 order-2 xs:order-1">
          {/* View Toggle */}
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => handleViewModeChange("grid")}
              className={`p-2 rounded transition-colors ${
                state.viewMode === "grid"
                  ? "bg-white shadow-sm"
                  : "hover:bg-gray-200"
              }`}
              aria-label={isRTL ? "نمایش شبکه‌ای" : "Grid view"}
            >
              <Grid className="h-4 w-4" />
            </button>
            <button
              onClick={() => handleViewModeChange("list")}
              className={`p-2 rounded transition-colors ${
                state.viewMode === "list"
                  ? "bg-white shadow-sm"
                  : "hover:bg-gray-200"
              }`}
              aria-label={isRTL ? "نمایش فهرستی" : "List view"}
            >
              <List className="h-4 w-4" />
            </button>
          </div>

          {/* Items per page */}
          <Select
            value={
              currentQuery.limit?.toString() ||
              itemsPerPageOptions[0].toString()
            }
            onValueChange={handleLimitChange}
          >
            <SelectTrigger className="w-full xs:w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {itemsPerPageOptions.map((option) => (
                <SelectItem key={option} value={option.toString()}>
                  {option.toLocaleString(isRTL ? "fa-IR" : "en-US")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-3 order-1 xs:order-2">
          {/* Sort */}
          <Select
            value={getCurrentSortValue()}
            onValueChange={handleSortChange}
          >
            <SelectTrigger className="w-full xs:w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  <div className="flex items-center space-x-2 rtl:space-x-reverse">
                    {option.icon}
                    <span>{option.label}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Refresh Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-2"
            aria-label={isRTL ? "تازه‌سازی" : "Refresh"}
          >
            <RefreshCw
              className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
            />
          </Button>
        </div>
      </div>

      {/* Error State */}
      {state.error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4 xs:p-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-medium text-red-800 mb-1">
                  {isRTL ? "خطا در بارگذاری محصولات" : "Error loading products"}
                </h3>
                <p className="text-sm text-red-700 leading-relaxed mb-3">
                  {state.error}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefresh}
                  className="text-red-700 border-red-300 hover:bg-red-100"
                >
                  {isRTL ? "تلاش مجدد" : "Try again"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content */}
      {state.isLoading && state.products.length === 0 ? (
        /* Loading Skeleton */
        <div className="space-y-4">
          <div className={`grid gap-4 xs:gap-6 ${getGridColumns()}`}>
            {Array.from({ length: currentQuery.limit || 12 }).map(
              (_, index) => (
                <Card key={index} className="animate-pulse">
                  <CardContent className="p-0">
                    <div className="w-full h-48 xs:h-56 bg-gray-200 rounded-t-lg" />
                    <div className="p-4 space-y-3">
                      <div className="h-4 bg-gray-200 rounded w-3/4" />
                      <div className="h-4 bg-gray-200 rounded w-1/2" />
                      <div className="h-4 bg-gray-200 rounded w-2/3" />
                      <div className="h-10 bg-gray-200 rounded" />
                    </div>
                  </CardContent>
                </Card>
              ),
            )}
          </div>
        </div>
      ) : state.products.length > 0 ? (
        <>
          {/* Products Grid */}
          <div className={`grid gap-4 xs:gap-6 ${getGridColumns()}`}>
            {state.products.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                viewMode={state.viewMode}
                locale={locale}
                className="h-full"
              />
            ))}
          </div>

          {/* Loading overlay for pagination */}
          {state.isLoading && (
            <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 flex items-center gap-3 shadow-lg">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                <span>{isRTL ? "در حال بارگذاری..." : "Loading..."}</span>
              </div>
            </div>
          )}

          {/* Pagination */}
          {renderPagination()}
        </>
      ) : (
        /* Empty State */
        <Card className="border-gray-200">
          <CardContent className="p-8 xs:p-12">
            <div className="text-center space-y-4">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                <Package className="h-10 w-10 text-gray-400" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {isRTL ? "محصولی یافت نشد" : "No products found"}
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed max-w-md mx-auto">
                  {isRTL
                    ? "متأسفانه محصولی با این مشخصات یافت نشد. لطفاً فیلترها را تغییر دهید یا عبارت جستجو را تغییر دهید."
                    : "Sorry, no products match your criteria. Try adjusting your filters or search terms."}
                </p>
              </div>
              <Button onClick={() => handleFiltersChange({})} className="mt-4">
                {isRTL ? "مشاهده همه محصولات" : "Show all products"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Scroll to top button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-20 right-4 rtl:right-auto rtl:left-4 p-3 bg-primary text-white rounded-full shadow-lg hover:bg-primary/90 transition-all z-40 touch-manipulation"
          aria-label={isRTL ? "بازگشت به بالا" : "Scroll to top"}
        >
          <ArrowUp className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}

export function ProductStore(props: ProductStoreProps) {
  return (
    <Suspense
      fallback={
        <div className="w-full space-y-6">
          {/* Loading skeleton */}
          <div className="animate-pulse space-y-6">
            <div className="h-12 bg-gray-200 rounded-lg w-full"></div>
            <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 xs:gap-6">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="space-y-4">
                  <div className="h-48 xs:h-56 bg-gray-200 rounded-lg"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-8 bg-gray-200 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      }
    >
      <ProductStoreContent {...props} />
    </Suspense>
  );
}

export default ProductStore;

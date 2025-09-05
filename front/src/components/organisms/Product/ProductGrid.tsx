"use client";

import React, { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Product, ProductQuery } from "@/types";
import { useProduct } from "@/context/ProductContext";
import ProductCard from "./ProductCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Grid,
  List,
  Search,
  Filter,
  SlidersHorizontal,
  RefreshCw,
  Package,
  ChevronLeft,
  ChevronRight,
  X,
  ArrowUp,
} from "lucide-react";

interface ProductGridProps {
  initialQuery?: ProductQuery;
  showSearch?: boolean;
  showFilters?: boolean;
  showSorting?: boolean;
  showViewToggle?: boolean;
  showPagination?: boolean;
  itemsPerPageOptions?: number[];
  className?: string;
  locale?: string;
}

export function ProductGrid({
  initialQuery = {},
  showSearch = true,
  showFilters = true,
  showSorting = true,
  showViewToggle = true,
  showPagination = true,
  itemsPerPageOptions = [12, 24, 48],
  className = "",
  locale = "fa",
}: ProductGridProps) {
  const t = useTranslations();
  const {
    state,
    fetchProducts,
    searchProducts,
    applyFilters,
    clearFilters,
    setViewMode,
    setSortBy,
    setQuery,
    clearError,
  } = useProduct();

  const [showFiltersPanel, setShowFiltersPanel] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [tempSearchTerm, setTempSearchTerm] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Initialize with query
  useEffect(() => {
    if (Object.keys(initialQuery).length > 0) {
      setQuery({ ...initialQuery, page: 1, limit: itemsPerPageOptions[0] });
    } else if (state.products.length === 0) {
      fetchProducts({ page: 1, limit: itemsPerPageOptions[0] });
    }
  }, []);

  // Handle scroll to top button
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (tempSearchTerm.trim()) {
      setSearchTerm(tempSearchTerm.trim());
      await searchProducts(tempSearchTerm.trim(), { ...state.currentQuery, page: 1 });
    }
  };

  const handleClearSearch = () => {
    setTempSearchTerm("");
    setSearchTerm("");
    clearFilters();
  };

  const handleSortChange = (value: string) => {
    setSortBy(value);
  };

  const handleViewModeChange = (mode: "grid" | "list") => {
    setViewMode(mode);
  };

  const handlePageChange = (newPage: number) => {
    const newQuery = { ...state.currentQuery, page: newPage };
    setQuery(newQuery);

    // Scroll to top of grid
    const gridElement = document.getElementById("product-grid");
    if (gridElement) {
      gridElement.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleLimitChange = (value: string) => {
    const newLimit = parseInt(value);
    const newQuery = { ...state.currentQuery, limit: newLimit, page: 1 };
    setQuery(newQuery);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    clearError();
    await fetchProducts(state.currentQuery);
    setIsRefreshing(false);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const getGridColumns = () => {
    if (state.viewMode === "list") return "grid-cols-1";
    return "grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4";
  };

  const renderActiveFilters = () => {
    const activeFilters = [];

    if (searchTerm) {
      activeFilters.push({ type: "search", value: searchTerm, label: `جستجو: ${searchTerm}` });
    }

    if (state.currentQuery.category?.length) {
      state.currentQuery.category.forEach(cat => {
        activeFilters.push({
          type: "category",
          value: cat,
          label: `دسته: ${cat}`
        });
      });
    }

    if (state.currentQuery.type?.length) {
      state.currentQuery.type.forEach(type => {
        activeFilters.push({
          type: "type",
          value: type,
          label: `نوع: ${type}`
        });
      });
    }

    if (state.currentQuery.price_min || state.currentQuery.price_max) {
      const min = state.currentQuery.price_min || 0;
      const max = state.currentQuery.price_max || "∞";
      activeFilters.push({
        type: "price",
        value: "price",
        label: `قیمت: ${min.toLocaleString("fa-IR")} - ${max}`
      });
    }

    if (activeFilters.length === 0) return null;

    return (
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <span className="text-sm text-gray-600 font-medium">فیلترهای فعال:</span>
        {activeFilters.map((filter, index) => (
          <Badge
            key={index}
            variant="secondary"
            className="flex items-center gap-1.5 py-1 px-2.5"
          >
            <span className="text-xs">{filter.label}</span>
            <button
              onClick={() => {
                if (filter.type === "search") {
                  handleClearSearch();
                } else {
                  // Handle specific filter removal
                  clearFilters();
                }
              }}
              className="hover:text-red-600 transition-colors"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
        <Button
          variant="ghost"
          size="sm"
          onClick={clearFilters}
          className="text-xs py-1 px-2 h-auto"
        >
          پاک کردن همه
        </Button>
      </div>
    );
  };

  const renderPagination = () => {
    if (!state.productList?.pagination || state.productList.pagination.pages <= 1) {
      return null;
    }

    const { page, pages, total } = state.productList.pagination;
    const startItem = (page - 1) * state.currentQuery.limit! + 1;
    const endItem = Math.min(page * state.currentQuery.limit!, total);

    return (
      <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-4 mt-8 p-4 bg-gray-50 rounded-lg">
        <div className="text-sm text-gray-600 text-center xs:text-right">
          نمایش {startItem.toLocaleString("fa-IR")} تا {endItem.toLocaleString("fa-IR")} از {total.toLocaleString("fa-IR")} محصول
        </div>

        <div className="flex items-center justify-center xs:justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 1 || state.isLoading}
            className="flex items-center gap-1"
          >
            <ChevronRight className="h-4 w-4" />
            قبلی
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
                  className="w-10 h-10 p-0"
                >
                  {pageNum.toLocaleString("fa-IR")}
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
            بعدی
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className={`w-full space-y-6 ${className}`}>
      {/* Header Controls */}
      <div className="space-y-4">
        {/* Search Bar */}
        {showSearch && (
          <form onSubmit={handleSearch} className="relative">
            <div className="relative">
              <Input
                type="text"
                placeholder="جستجو در محصولات..."
                value={tempSearchTerm}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTempSearchTerm(e.target.value)}
                className="pl-12 pr-4 rtl:pr-12 rtl:pl-4 h-12"
              />
              <div className="absolute left-3 rtl:left-auto rtl:right-3 top-1/2 -translate-y-1/2">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              {tempSearchTerm && (
                <button
                  type="button"
                  onClick={() => setTempSearchTerm("")}
                  className="absolute right-3 rtl:right-auto rtl:left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>
          </form>
        )}

        {/* Controls Row */}
        <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-4">
          <div className="flex flex-col xs:flex-row xs:items-center gap-3">
            {/* Filters Button */}
            {showFilters && (
              <Button
                variant="outline"
                onClick={() => setShowFiltersPanel(!showFiltersPanel)}
                className={`flex items-center gap-2 ${showFiltersPanel ? "bg-gray-100" : ""}`}
              >
                <Filter className="h-4 w-4" />
                <span className="hidden xs:inline">فیلترها</span>
                <SlidersHorizontal className="h-4 w-4 xs:hidden" />
              </Button>
            )}

            {/* Sorting */}
            {showSorting && (
              <Select value={state.sortBy} onValueChange={handleSortChange}>
                <SelectTrigger className="w-full xs:w-48">
                  <SelectValue placeholder="مرتب‌سازی" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="created_at">جدیدترین</SelectItem>
                  <SelectItem value="price">قیمت (کم به زیاد)</SelectItem>
                  <SelectItem value="price_desc">قیمت (زیاد به کم)</SelectItem>
                  <SelectItem value="rating">امتیاز</SelectItem>
                  <SelectItem value="popularity">محبوبیت</SelectItem>
                  <SelectItem value="title">نام (الفبایی)</SelectItem>
                </SelectContent>
              </Select>
            )}

            {/* Items per page */}
            <Select
              value={state.currentQuery.limit?.toString() || itemsPerPageOptions[0].toString()}
              onValueChange={handleLimitChange}
            >
              <SelectTrigger className="w-full xs:w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {itemsPerPageOptions.map(option => (
                  <SelectItem key={option} value={option.toString()}>
                    {option.toLocaleString("fa-IR")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            {/* View Toggle */}
            {showViewToggle && (
              <div className="flex items-center bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => handleViewModeChange("grid")}
                  className={`p-2 rounded transition-colors ${
                    state.viewMode === "grid" ? "bg-white shadow-sm" : "hover:bg-gray-200"
                  }`}
                >
                  <Grid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleViewModeChange("list")}
                  className={`p-2 rounded transition-colors ${
                    state.viewMode === "list" ? "bg-white shadow-sm" : "hover:bg-gray-200"
                  }`}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            )}

            {/* Refresh Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="p-2"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </div>

        {/* Active Filters */}
        {renderActiveFilters()}

        {/* Results Summary */}
        {state.productList && (
          <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-2 text-sm text-gray-600">
            <span>
              {state.productList.pagination.total.toLocaleString("fa-IR")} محصول یافت شد
            </span>
            <span>
              صفحه {state.productList.pagination.page.toLocaleString("fa-IR")} از {state.productList.pagination.pages.toLocaleString("fa-IR")}
            </span>
          </div>
        )}
      </div>

      {/* Error State */}
      {state.error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="text-red-600">
                <Package className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-red-800 mb-1">خطا در بارگذاری محصولات</h3>
                <p className="text-sm text-red-700 leading-relaxed">{state.error}</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefresh}
                  className="mt-3 text-red-700 border-red-300 hover:bg-red-100"
                >
                  تلاش مجدد
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {state.isLoading && state.products.length === 0 ? (
        <div className="space-y-4">
          <div className={`grid gap-6 ${getGridColumns()}`}>
            {Array.from({ length: state.currentQuery.limit || 12 }).map((_, index) => (
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
            ))}
          </div>
        </div>
      ) : state.products.length > 0 ? (
        <>
          {/* Products Grid */}
          <div id="product-grid" className={`grid gap-4 xs:gap-6 ${getGridColumns()}`}>
            {state.products.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                viewMode={state.viewMode}
                locale={locale}
              />
            ))}
          </div>

          {/* Loading overlay for pagination */}
          {state.isLoading && (
            <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 flex items-center gap-3 shadow-lg">
                <RefreshCw className="h-5 w-5 animate-spin text-primary" />
                <span>در حال بارگذاری...</span>
              </div>
            </div>
          )}

          {/* Pagination */}
          {showPagination && renderPagination()}
        </>
      ) : (
        /* Empty State */
        <Card>
          <CardContent className="p-12">
            <div className="text-center space-y-4">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                <Package className="h-10 w-10 text-gray-400" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">محصولی یافت نشد</h3>
                <p className="text-sm text-gray-600 leading-relaxed max-w-md mx-auto">
                  {searchTerm || Object.keys(state.currentQuery).length > 2
                    ? "متأسفانه محصولی با این مشخصات یافت نشد. لطفاً فیلترها را تغییر دهید."
                    : "هنوز محصولی اضافه نشده است."}
                </p>
              </div>
              {(searchTerm || Object.keys(state.currentQuery).length > 2) && (
                <Button onClick={clearFilters} className="mt-4">
                  پاک کردن فیلترها
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Scroll to top button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-20 right-4 rtl:right-auto rtl:left-4 p-3 bg-primary text-white rounded-full shadow-lg hover:bg-primary/90 transition-all z-40"
        >
          <ArrowUp className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}

export default ProductGrid;

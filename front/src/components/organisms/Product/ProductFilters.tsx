"use client";

import React, { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { ProductType, ProductCategory } from "@/types";
import { productApi, ProductApiService } from "@/services/product/productApi";
import { useProduct } from "@/context/ProductContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BookOpen,
  Palette,
  FileText,
  Package,
  Star,
  Filter,
  X,
  ChevronDown,
  ChevronUp,
  Search,
  DollarSign,
  Calendar,
  Grid,
  List,
  SlidersHorizontal,
  RotateCcw,
  Check,
  Zap,
  Award,
  TrendingUp,
  Sparkles,
} from "lucide-react";

interface ProductFiltersProps {
  onFiltersChange: (filters: any) => void;
  initialFilters?: any;
  className?: string;
  locale?: string;
  showMobileToggle?: boolean;
  isVisible?: boolean;
  onToggleVisibility?: (visible: boolean) => void;
}

export function ProductFilters({
  onFiltersChange,
  initialFilters = {},
  className = "",
  locale = "fa",
  showMobileToggle = false,
  isVisible = true,
  onToggleVisibility,
}: ProductFiltersProps) {
  const t = useTranslations();
  const { state } = useProduct();
  const isRTL = locale === "fa";

  const [filters, setFilters] = useState({
    type: initialFilters.type || [],
    category: initialFilters.category || [],
    priceRange: initialFilters.priceRange || { min: "", max: "" },
    rating: initialFilters.rating || 0,
    availability: initialFilters.availability || "all",
    sortBy: initialFilters.sortBy || "newest",
    isDigital: initialFilters.isDigital || "all",
    isFeatured: initialFilters.isFeatured || false,
    isNew: initialFilters.isNew || false,
    isBestseller: initialFilters.isBestseller || false,
    search: initialFilters.search || "",
    ...initialFilters,
  });

  const [expandedSections, setExpandedSections] = useState({
    type: true,
    category: true,
    price: false,
    rating: false,
    features: false,
    availability: false,
  });

  const [activeFiltersCount, setActiveFiltersCount] = useState(0);

  const productTypes: Array<{
    value: ProductType | "all";
    label: string;
    icon: React.ReactNode;
    color: string;
  }> = [
    {
      value: "book",
      label: "کتاب‌ها",
      icon: <BookOpen className="h-4 w-4" />,
      color: "bg-blue-50 text-blue-700 border-blue-200",
    },
    {
      value: "artwork",
      label: "آثار هنری",
      icon: <Palette className="h-4 w-4" />,
      color: "bg-purple-50 text-purple-700 border-purple-200",
    },
    {
      value: "article",
      label: "مقالات",
      icon: <FileText className="h-4 w-4" />,
      color: "bg-green-50 text-green-700 border-green-200",
    },
    {
      value: "cultural",
      label: "فرهنگی",
      icon: <Star className="h-4 w-4" />,
      color: "bg-yellow-50 text-yellow-700 border-yellow-200",
    },
  ];

  const sortOptions = [
    { value: "newest", label: "جدیدترین" },
    { value: "oldest", label: "قدیمی‌ترین" },
    { value: "price-low", label: "قیمت (کم به زیاد)" },
    { value: "price-high", label: "قیمت (زیاد به کم)" },
    { value: "rating", label: "بالاترین امتیاز" },
    { value: "popular", label: "محبوب‌ترین" },
    { value: "bestseller", label: "پرفروش‌ترین" },
    { value: "name-asc", label: "نام (الف تا ی)" },
    { value: "name-desc", label: "نام (ی تا الف)" },
  ];

  const availabilityOptions = [
    { value: "all", label: "همه" },
    { value: "available", label: "موجود" },
    { value: "unavailable", label: "ناموجود" },
    { value: "limited", label: "محدود (کمتر از ۵ عدد)" },
  ];

  const digitalOptions = [
    { value: "all", label: "همه" },
    { value: "digital", label: "دیجیتال" },
    { value: "physical", label: "فیزیکی" },
  ];

  useEffect(() => {
    // Count active filters
    let count = 0;
    if (filters.type.length > 0) count++;
    if (filters.category.length > 0) count++;
    if (filters.priceRange.min || filters.priceRange.max) count++;
    if (filters.rating > 0) count++;
    if (filters.availability !== "all") count++;
    if (filters.isDigital !== "all") count++;
    if (filters.isFeatured) count++;
    if (filters.isNew) count++;
    if (filters.isBestseller) count++;
    if (filters.search.trim()) count++;

    setActiveFiltersCount(count);
  }, [filters]);

  useEffect(() => {
    onFiltersChange(filters);
  }, [filters, onFiltersChange]);

  const handleTypeToggle = (type: ProductType) => {
    setFilters((prev: any) => ({
      ...prev,
      type: prev.type.includes(type)
        ? prev.type.filter((t: ProductType) => t !== type)
        : [...prev.type, type],
    }));
  };

  const handleCategoryToggle = (category: string) => {
    setFilters((prev: any) => ({
      ...prev,
      category: prev.category.includes(category)
        ? prev.category.filter((c: string) => c !== category)
        : [...prev.category, category],
    }));
  };

  const handlePriceChange = (field: "min" | "max", value: string) => {
    setFilters((prev: any) => ({
      ...prev,
      priceRange: {
        ...prev.priceRange,
        [field]: value,
      },
    }));
  };

  const handleRatingChange = (rating: number) => {
    setFilters((prev: any) => ({
      ...prev,
      rating: prev.rating === rating ? 0 : rating,
    }));
  };

  const handleFeatureToggle = (feature: string) => {
    setFilters((prev: any) => ({
      ...prev,
      [feature]: !prev[feature],
    }));
  };

  const clearFilters = () => {
    const clearedFilters = {
      type: [],
      category: [],
      priceRange: { min: "", max: "" },
      rating: 0,
      availability: "all",
      sortBy: "newest",
      isDigital: "all",
      isFeatured: false,
      isNew: false,
      isBestseller: false,
      search: "",
    };
    setFilters(clearedFilters);
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const renderStars = (rating: number, interactive = false) => {
    const stars = Array.from({ length: 5 }, (_, i) => i + 1);

    return (
      <div className="flex items-center gap-0.5">
        {stars.map((star) => (
          <button
            key={star}
            onClick={interactive ? () => handleRatingChange(star) : undefined}
            disabled={!interactive}
            className={
              interactive
                ? "cursor-pointer hover:scale-110 transition-transform"
                : ""
            }
          >
            <Star
              className={`h-4 w-4 ${
                star <= rating
                  ? "fill-yellow-400 text-yellow-400"
                  : "fill-gray-200 text-gray-200"
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  if (!isVisible && showMobileToggle) {
    return (
      <div className="lg:hidden">
        <Button
          onClick={() => onToggleVisibility?.(true)}
          variant="outline"
          className="w-full flex items-center justify-center gap-2"
        >
          <SlidersHorizontal className="h-4 w-4" />
          فیلترها
          {activeFiltersCount > 0 && (
            <Badge
              variant="default"
              className="min-w-[1.25rem] h-5 rounded-full text-xs"
            >
              {activeFiltersCount}
            </Badge>
          )}
        </Button>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Mobile Header */}
      {showMobileToggle && (
        <div className="lg:hidden flex items-center justify-between p-4 bg-white border-b">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-primary" />
            <h2 className="font-semibold text-gray-900">فیلترها</h2>
            {activeFiltersCount > 0 && (
              <Badge
                variant="default"
                className="min-w-[1.25rem] h-5 rounded-full text-xs"
              >
                {activeFiltersCount}
              </Badge>
            )}
          </div>
          <Button
            onClick={() => onToggleVisibility?.(false)}
            variant="ghost"
            size="sm"
            className="p-2"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute right-3 rtl:right-auto rtl:left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="جستجو در محصولات..."
              value={filters.search}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, search: e.target.value }))
              }
              className="pr-10 rtl:pr-4 rtl:pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Sort */}
      <Card>
        <CardContent className="p-4">
          <div className="space-y-3">
            <Label className="text-sm font-medium text-gray-900">
              مرتب‌سازی
            </Label>
            <Select
              value={filters.sortBy}
              onValueChange={(value) =>
                setFilters((prev: any) => ({ ...prev, sortBy: value }))
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Product Types */}
      <Card>
        <CardHeader
          className="pb-3 cursor-pointer"
          onClick={() => toggleSection("type")}
        >
          <CardTitle className="flex items-center justify-between text-base">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-primary" />
              نوع محصول
            </div>
            {expandedSections.type ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </CardTitle>
        </CardHeader>
        {expandedSections.type && (
          <CardContent className="pt-0">
            <div className="space-y-3">
              {productTypes.map((type) => (
                <button
                  key={type.value}
                  onClick={() => handleTypeToggle(type.value as ProductType)}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all text-right ${
                    filters.type.includes(type.value)
                      ? `${type.color} border-current`
                      : "bg-gray-50 hover:bg-gray-100 border-gray-200 text-gray-700"
                  }`}
                >
                  <div className="flex items-center gap-2 flex-1">
                    {type.icon}
                    <span className="text-sm font-medium">{type.label}</span>
                  </div>
                  {filters.type.includes(type.value) && (
                    <Check className="h-4 w-4" />
                  )}
                </button>
              ))}
            </div>
          </CardContent>
        )}
      </Card>

      {/* Categories */}
      {state.categories.length > 0 && (
        <Card>
          <CardHeader
            className="pb-3 cursor-pointer"
            onClick={() => toggleSection("category")}
          >
            <CardTitle className="flex items-center justify-between text-base">
              <div className="flex items-center gap-2">
                <Grid className="h-4 w-4 text-primary" />
                دسته‌بندی
              </div>
              {expandedSections.category ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </CardTitle>
          </CardHeader>
          {expandedSections.category && (
            <CardContent className="pt-0">
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {state.categories.map((category) => (
                  <button
                    key={category.category}
                    onClick={() => handleCategoryToggle(category.category)}
                    className={`w-full flex items-center justify-between p-2 rounded-lg text-sm transition-colors ${
                      filters.category.includes(category.category)
                        ? "bg-primary/10 text-primary"
                        : "hover:bg-gray-100 text-gray-700"
                    }`}
                  >
                    <span>
                      {ProductApiService.getProductCategoryLabel(
                        category.category,
                        locale,
                      )}
                    </span>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {category.count}
                      </Badge>
                      {filters.category.includes(category.category) && (
                        <Check className="h-4 w-4" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          )}
        </Card>
      )}

      {/* Price Range */}
      <Card>
        <CardHeader
          className="pb-3 cursor-pointer"
          onClick={() => toggleSection("price")}
        >
          <CardTitle className="flex items-center justify-between text-base">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-primary" />
              محدوده قیمت
            </div>
            {expandedSections.price ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </CardTitle>
        </CardHeader>
        {expandedSections.price && (
          <CardContent className="pt-0">
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs text-gray-600">حداقل قیمت</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={filters.priceRange.min}
                    onChange={(e) => handlePriceChange("min", e.target.value)}
                    className="text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs text-gray-600">حداکثر قیمت</Label>
                  <Input
                    type="number"
                    placeholder="∞"
                    value={filters.priceRange.max}
                    onChange={(e) => handlePriceChange("max", e.target.value)}
                    className="text-sm"
                  />
                </div>
              </div>

              {/* Quick Price Ranges */}
              <div className="space-y-2">
                <Label className="text-xs text-gray-600">محدوده‌های سریع</Label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: "زیر ۱۰۰ هزار", min: "0", max: "100000" },
                    { label: "۱۰۰-۵۰۰ هزار", min: "100000", max: "500000" },
                    {
                      label: "۵۰۰ هزار-۱ میلیون",
                      min: "500000",
                      max: "1000000",
                    },
                    { label: "بالای ۱ میلیون", min: "1000000", max: "" },
                  ].map((range) => (
                    <button
                      key={range.label}
                      onClick={() =>
                        setFilters((prev: any) => ({
                          ...prev,
                          priceRange: { min: range.min, max: range.max },
                        }))
                      }
                      className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                      {range.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Rating */}
      <Card>
        <CardHeader
          className="pb-3 cursor-pointer"
          onClick={() => toggleSection("rating")}
        >
          <CardTitle className="flex items-center justify-between text-base">
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-primary" />
              حداقل امتیاز
            </div>
            {expandedSections.rating ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </CardTitle>
        </CardHeader>
        {expandedSections.rating && (
          <CardContent className="pt-0">
            <div className="space-y-3">
              {[5, 4, 3, 2, 1].map((rating) => (
                <button
                  key={rating}
                  onClick={() => handleRatingChange(rating)}
                  className={`w-full flex items-center gap-2 p-2 rounded-lg transition-colors ${
                    filters.rating === rating
                      ? "bg-primary/10 text-primary"
                      : "hover:bg-gray-100 text-gray-700"
                  }`}
                >
                  {renderStars(rating)}
                  <span className="text-sm">و بالاتر</span>
                  {filters.rating === rating && (
                    <Check className="h-4 w-4 mr-auto" />
                  )}
                </button>
              ))}
            </div>
          </CardContent>
        )}
      </Card>

      {/* Features */}
      <Card>
        <CardHeader
          className="pb-3 cursor-pointer"
          onClick={() => toggleSection("features")}
        >
          <CardTitle className="flex items-center justify-between text-base">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" />
              ویژگی‌ها
            </div>
            {expandedSections.features ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </CardTitle>
        </CardHeader>
        {expandedSections.features && (
          <CardContent className="pt-0">
            <div className="space-y-3">
              <div className="space-y-2">
                <Label className="text-xs text-gray-600">نوع محصول</Label>
                <Select
                  value={filters.isDigital}
                  onValueChange={(value) =>
                    setFilters((prev: any) => ({ ...prev, isDigital: value }))
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {digitalOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-gray-600">برچسب‌ها</Label>
                <div className="space-y-2">
                  {[
                    {
                      key: "isFeatured",
                      label: "ویژه",
                      icon: <Sparkles className="h-4 w-4" />,
                      color: "text-blue-600",
                    },
                    {
                      key: "isNew",
                      label: "جدید",
                      icon: <Zap className="h-4 w-4" />,
                      color: "text-green-600",
                    },
                    {
                      key: "isBestseller",
                      label: "پرفروش",
                      icon: <TrendingUp className="h-4 w-4" />,
                      color: "text-orange-600",
                    },
                  ].map((feature) => (
                    <button
                      key={feature.key}
                      onClick={() => handleFeatureToggle(feature.key)}
                      className={`w-full flex items-center justify-between p-2 rounded-lg text-sm transition-colors ${
                        filters[feature.key]
                          ? "bg-primary/10 text-primary"
                          : "hover:bg-gray-100 text-gray-700"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className={feature.color}>{feature.icon}</span>
                        {feature.label}
                      </div>
                      {filters[feature.key] && <Check className="h-4 w-4" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Availability */}
      <Card>
        <CardHeader
          className="pb-3 cursor-pointer"
          onClick={() => toggleSection("availability")}
        >
          <CardTitle className="flex items-center justify-between text-base">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-primary" />
              وضعیت موجودی
            </div>
            {expandedSections.availability ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </CardTitle>
        </CardHeader>
        {expandedSections.availability && (
          <CardContent className="pt-0">
            <div className="space-y-2">
              {availabilityOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() =>
                    setFilters((prev: any) => ({
                      ...prev,
                      availability: option.value,
                    }))
                  }
                  className={`w-full flex items-center justify-between p-2 rounded-lg text-sm transition-colors ${
                    filters.availability === option.value
                      ? "bg-primary/10 text-primary"
                      : "hover:bg-gray-100 text-gray-700"
                  }`}
                >
                  <span>{option.label}</span>
                  {filters.availability === option.value && (
                    <Check className="h-4 w-4" />
                  )}
                </button>
              ))}
            </div>
          </CardContent>
        )}
      </Card>

      {/* Clear Filters */}
      {activeFiltersCount > 0 && (
        <Card>
          <CardContent className="p-4">
            <Button
              onClick={clearFilters}
              variant="outline"
              className="w-full flex items-center justify-center gap-2 text-red-600 border-red-200 hover:bg-red-50"
            >
              <RotateCcw className="h-4 w-4" />
              پاک کردن همه فیلترها
              <Badge
                variant="destructive"
                className="min-w-[1.25rem] h-5 rounded-full text-xs"
              >
                {activeFiltersCount}
              </Badge>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Applied Filters Summary */}
      {activeFiltersCount > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-700">
              فیلترهای اعمال شده
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex flex-wrap gap-2">
              {filters.type.map((type: ProductType) => (
                <Badge
                  key={type}
                  variant="secondary"
                  className="flex items-center gap-1 text-xs py-1 px-2"
                >
                  {productTypes.find((t) => t.value === type)?.label}
                  <button
                    onClick={() => handleTypeToggle(type)}
                    className="ml-1 hover:text-red-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}

              {filters.category.map((category: string) => (
                <Badge
                  key={category}
                  variant="secondary"
                  className="flex items-center gap-1 text-xs py-1 px-2"
                >
                  {ProductApiService.getProductCategoryLabel(category, locale)}
                  <button
                    onClick={() => handleCategoryToggle(category)}
                    className="ml-1 hover:text-red-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}

              {(filters.priceRange.min || filters.priceRange.max) && (
                <Badge
                  variant="secondary"
                  className="flex items-center gap-1 text-xs py-1 px-2"
                >
                  قیمت: {filters.priceRange.min || "0"} -{" "}
                  {filters.priceRange.max || "∞"}
                  <button
                    onClick={() => handlePriceChange("min", "")}
                    className="ml-1 hover:text-red-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}

              {filters.rating > 0 && (
                <Badge
                  variant="secondary"
                  className="flex items-center gap-1 text-xs py-1 px-2"
                >
                  {filters.rating}+ ستاره
                  <button
                    onClick={() => handleRatingChange(0)}
                    className="ml-1 hover:text-red-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default ProductFilters;

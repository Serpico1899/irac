"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useTranslations } from "next-intl";
import { useProduct } from "@/context/ProductContext";
import { ProductType, ProductCategory, ProductQuery } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from "@/components/ui/sheet";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Search,
  Filter,
  X,
  SlidersHorizontal,
  ChevronDown,
  BookOpen,
  Palette,
  FileText,
  Package,
  Star,
  TrendingUp,
  Sparkles,
  RefreshCw,
  Check,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";

interface ProductSearchFiltersProps {
  className?: string;
  locale?: string;
  onFiltersChange?: (filters: ProductQuery) => void;
  showMobileDrawer?: boolean;
  initialFilters?: ProductQuery;
}

interface FilterState {
  search: string;
  categories: ProductCategory[];
  types: ProductType[];
  priceRange: [number, number];
  priceMin?: number;
  priceMax?: number;
  tags: string[];
  isFeatured?: boolean;
  isBestseller?: boolean;
  isNew?: boolean;
  isDigital?: boolean;
  language?: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

export function ProductSearchFilters({
  className = "",
  locale = "fa",
  onFiltersChange,
  showMobileDrawer = true,
  initialFilters = {},
}: ProductSearchFiltersProps) {
  const t = useTranslations();
  const { state, fetchProductFilters, searchProducts, applyFilters, clearFilters } = useProduct();
  const isRTL = locale === "fa";

  // Filter state management
  const [filters, setFilters] = useState<FilterState>({
    search: initialFilters.search || "",
    categories: initialFilters.category || [],
    types: initialFilters.type || [],
    priceRange: [initialFilters.min_price || 0, initialFilters.max_price || 1000000],
    priceMin: initialFilters.min_price,
    priceMax: initialFilters.max_price,
    tags: initialFilters.tags || [],
    isFeatured: initialFilters.is_featured,
    isBestseller: initialFilters.is_bestseller,
    isNew: initialFilters.is_new,
    isDigital: initialFilters.is_digital,
    language: initialFilters.language,
    sortBy: initialFilters.sort_by || "created_at",
    sortOrder: initialFilters.sort_order || "desc",
  });

  // UI state
  const [searchInput, setSearchInput] = useState(filters.search);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [priceInputs, setPriceInputs] = useState({
    min: filters.priceMin?.toString() || "",
    max: filters.priceMax?.toString() || "",
  });

  // Available options
  const productTypes: Array<{
    value: ProductType;
    label: string;
    icon: React.ReactNode;
    description: string;
  }> = [
    {
      value: "book",
      label: isRTL ? "کتاب" : "Books",
      icon: <BookOpen className="h-4 w-4" />,
      description: isRTL ? "کتاب‌های فیزیکی و دیجیتال" : "Physical and digital books",
    },
    {
      value: "artwork",
      label: isRTL ? "اثر هنری" : "Artwork",
      icon: <Palette className="h-4 w-4" />,
      description: isRTL ? "نقاشی، مجسمه و هنر دیجیتال" : "Paintings, sculptures and digital art",
    },
    {
      value: "article",
      label: isRTL ? "مقاله" : "Articles",
      icon: <FileText className="h-4 w-4" />,
      description: isRTL ? "مقالات پژوهشی و آموزشی" : "Research and educational articles",
    },
    {
      value: "cultural",
      label: isRTL ? "فرهنگی" : "Cultural",
      icon: <Star className="h-4 w-4" />,
      description: isRTL ? "صنایع دستی و اقلام فرهنگی" : "Handicrafts and cultural items",
    },
  ];

  const sortOptions = [
    { value: "created_at", label: isRTL ? "جدیدترین" : "Newest" },
    { value: "price", label: isRTL ? "قیمت (کم به زیاد)" : "Price (Low to High)" },
    { value: "price_desc", label: isRTL ? "قیمت (زیاد به کم)" : "Price (High to Low)" },
    { value: "rating", label: isRTL ? "بالاترین امتیاز" : "Highest Rated" },
    { value: "popularity", label: isRTL ? "محبوب‌ترین" : "Most Popular" },
    { value: "title", label: isRTL ? "نام (الفبایی)" : "Name (A-Z)" },
  ];

  const specialFilters = [
    {
      key: "isFeatured" as keyof FilterState,
      label: isRTL ? "محصولات ویژه" : "Featured Products",
      icon: <Sparkles className="h-4 w-4" />,
    },
    {
      key: "isBestseller" as keyof FilterState,
      label: isRTL ? "پرفروش‌ها" : "Bestsellers",
      icon: <TrendingUp className="h-4 w-4" />,
    },
    {
      key: "isNew" as keyof FilterState,
      label: isRTL ? "جدیدها" : "New Arrivals",
      icon: <Star className="h-4 w-4" />,
    },
    {
      key: "isDigital" as keyof FilterState,
      label: isRTL ? "فقط دیجیتال" : "Digital Only",
      icon: <Package className="h-4 w-4" />,
    },
  ];

  // Fetch available filters on mount
  useEffect(() => {
    if (!state.availableFilters) {
      fetchProductFilters();
    }
  }, [fetchProductFilters, state.availableFilters]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== filters.search) {
        handleFiltersChange({ ...filters, search: searchInput });
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchInput]);

  // Handle filter changes
  const handleFiltersChange = useCallback((newFilters: FilterState) => {
    setFilters(newFilters);

    const query: ProductQuery = {
      search: newFilters.search || undefined,
      category: newFilters.categories.length > 0 ? newFilters.categories : undefined,
      type: newFilters.types.length > 0 ? newFilters.types : undefined,
      min_price: newFilters.priceMin || undefined,
      max_price: newFilters.priceMax || undefined,
      tags: newFilters.tags.length > 0 ? newFilters.tags : undefined,
      is_featured: newFilters.isFeatured || undefined,
      is_bestseller: newFilters.isBestseller || undefined,
      is_new: newFilters.isNew || undefined,
      is_digital: newFilters.isDigital || undefined,
      language: newFilters.language || undefined,
      sort_by: newFilters.sortBy,
      sort_order: newFilters.sortOrder,
    };

    onFiltersChange?.(query);
    applyFilters(query);
  }, [onFiltersChange, applyFilters]);

  // Handle category toggle
  const handleCategoryToggle = (category: ProductCategory) => {
    const newCategories = filters.categories.includes(category)
      ? filters.categories.filter(c => c !== category)
      : [...filters.categories, category];

    handleFiltersChange({ ...filters, categories: newCategories });
  };

  // Handle type toggle
  const handleTypeToggle = (type: ProductType) => {
    const newTypes = filters.types.includes(type)
      ? filters.types.filter(t => t !== type)
      : [...filters.types, type];

    handleFiltersChange({ ...filters, types: newTypes });
  };

  // Handle special filter toggle
  const handleSpecialFilterToggle = (key: keyof FilterState) => {
    const currentValue = filters[key] as boolean;
    handleFiltersChange({ ...filters, [key]: !currentValue });
  };

  // Handle price range change
  const handlePriceRangeChange = (values: number[]) => {
    const [min, max] = values;
    const newFilters = {
      ...filters,
      priceRange: [min, max] as [number, number],
      priceMin: min,
      priceMax: max
    };
    setPriceInputs({ min: min.toString(), max: max.toString() });
    handleFiltersChange(newFilters);
  };

  // Handle price input change
  const handlePriceInputChange = (type: 'min' | 'max', value: string) => {
    setPriceInputs(prev => ({ ...prev, [type]: value }));

    const numValue = parseInt(value) || 0;
    if (type === 'min') {
      handleFiltersChange({
        ...filters,
        priceMin: numValue,
        priceRange: [numValue, filters.priceRange[1]],
      });
    } else {
      handleFiltersChange({
        ...filters,
        priceMax: numValue,
        priceRange: [filters.priceRange[0], numValue],
      });
    }
  };

  // Handle clear all filters
  const handleClearAll = () => {
    const clearedFilters: FilterState = {
      search: "",
      categories: [],
      types: [],
      priceRange: [0, 1000000],
      priceMin: undefined,
      priceMax: undefined,
      tags: [],
      isFeatured: undefined,
      isBestseller: undefined,
      isNew: undefined,
      isDigital: undefined,
      language: undefined,
      sortBy: "created_at",
      sortOrder: "desc",
    };

    setFilters(clearedFilters);
    setSearchInput("");
    setPriceInputs({ min: "", max: "" });
    clearFilters();
    onFiltersChange?.({});
  };

  // Count active filters
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.search) count++;
    count += filters.categories.length;
    count += filters.types.length;
    if (filters.priceMin || filters.priceMax) count++;
    count += filters.tags.length;
    if (filters.isFeatured) count++;
    if (filters.isBestseller) count++;
    if (filters.isNew) count++;
    if (filters.isDigital) count++;
    return count;
  }, [filters]);

  // Get active filters display
  const getActiveFilters = useMemo(() => {
    const active = [];

    if (filters.search) {
      active.push({
        type: "search",
        label: `${isRTL ? "جستجو: " : "Search: "}${filters.search}`,
        onRemove: () => {
          setSearchInput("");
          handleFiltersChange({ ...filters, search: "" });
        },
      });
    }

    filters.categories.forEach(category => {
      const categoryData = state.availableFilters?.categories.find(c => c.category === category);
      active.push({
        type: "category",
        label: `${isRTL ? "دسته: " : "Category: "}${categoryData?.name || category}`,
        onRemove: () => handleCategoryToggle(category),
      });
    });

    filters.types.forEach(type => {
      const typeData = productTypes.find(t => t.value === type);
      active.push({
        type: "type",
        label: `${isRTL ? "نوع: " : "Type: "}${typeData?.label || type}`,
        onRemove: () => handleTypeToggle(type),
      });
    });

    if (filters.priceMin || filters.priceMax) {
      const min = filters.priceMin || 0;
      const max = filters.priceMax || "∞";
      active.push({
        type: "price",
        label: `${isRTL ? "قیمت: " : "Price: "}${min.toLocaleString(isRTL ? "fa-IR" : "en-US")} - ${max}`,
        onRemove: () => {
          setPriceInputs({ min: "", max: "" });
          handleFiltersChange({
            ...filters,
            priceMin: undefined,
            priceMax: undefined,
            priceRange: [0, 1000000],
          });
        },
      });
    }

    specialFilters.forEach(filter => {
      if (filters[filter.key]) {
        active.push({
          type: filter.key,
          label: filter.label,
          onRemove: () => handleSpecialFilterToggle(filter.key),
        });
      }
    });

    return active;
  }, [filters, state.availableFilters, isRTL]);

  // Main filter content
  const FilterContent = () => (
    <div className="space-y-6">
      {/* Search */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {isRTL ? "جستجو در محصولات" : "Search Products"}
        </label>
        <div className="relative">
          <Input
            type="text"
            placeholder={isRTL ? "نام، نویسنده، یا کلید واژه..." : "Name, author, or keyword..."}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className={`pl-10 ${isRTL ? "pr-10 pl-4" : "pr-4"}`}
          />
          <Search className={`absolute top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 ${isRTL ? "right-3" : "left-3"}`} />
        </div>
      </div>

      {/* Product Types */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-3">
          {isRTL ? "نوع محصول" : "Product Type"}
        </h3>
        <div className="space-y-2">
          {productTypes.map(type => (
            <div key={type.value} className="flex items-start space-x-3 rtl:space-x-reverse">
              <Checkbox
                id={`type-${type.value}`}
                checked={filters.types.includes(type.value)}
                onCheckedChange={() => handleTypeToggle(type.value)}
              />
              <div className="flex-1 min-w-0">
                <label
                  htmlFor={`type-${type.value}`}
                  className="flex items-center space-x-2 rtl:space-x-reverse text-sm cursor-pointer"
                >
                  {type.icon}
                  <span className="font-medium">{type.label}</span>
                </label>
                <p className="text-xs text-gray-500 mt-1">{type.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Categories */}
      {state.availableFilters?.categories && state.availableFilters.categories.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3">
            {isRTL ? "دسته‌بندی" : "Categories"}
          </h3>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {state.availableFilters.categories.map(category => (
              <div key={category.category} className="flex items-center justify-between">
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                  <Checkbox
                    id={`category-${category.category}`}
                    checked={filters.categories.includes(category.category)}
                    onCheckedChange={() => handleCategoryToggle(category.category)}
                  />
                  <label
                    htmlFor={`category-${category.category}`}
                    className="text-sm cursor-pointer"
                  >
                    {category.name}
                  </label>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {category.count.toLocaleString(isRTL ? "fa-IR" : "en-US")}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Price Range */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-3">
          {isRTL ? "محدوده قیمت" : "Price Range"}
        </h3>
        <div className="space-y-4">
          <Slider
            value={filters.priceRange}
            onValueChange={handlePriceRangeChange}
            max={state.availableFilters?.price_range?.max || 1000000}
            min={state.availableFilters?.price_range?.min || 0}
            step={10000}
            className="w-full"
          />
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <div className="flex-1">
              <label className="block text-xs text-gray-500 mb-1">
                {isRTL ? "حداقل" : "Min"}
              </label>
              <Input
                type="number"
                placeholder="0"
                value={priceInputs.min}
                onChange={(e) => handlePriceInputChange('min', e.target.value)}
                className="text-sm"
              />
            </div>
            <div className="px-2 text-gray-400">-</div>
            <div className="flex-1">
              <label className="block text-xs text-gray-500 mb-1">
                {isRTL ? "حداکثر" : "Max"}
              </label>
              <Input
                type="number"
                placeholder="∞"
                value={priceInputs.max}
                onChange={(e) => handlePriceInputChange('max', e.target.value)}
                className="text-sm"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Special Filters */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-3">
          {isRTL ? "فیلترهای ویژه" : "Special Filters"}
        </h3>
        <div className="space-y-2">
          {specialFilters.map(filter => (
            <div key={filter.key} className="flex items-center space-x-2 rtl:space-x-reverse">
              <Checkbox
                id={`special-${filter.key}`}
                checked={!!filters[filter.key]}
                onCheckedChange={() => handleSpecialFilterToggle(filter.key)}
              />
              <label
                htmlFor={`special-${filter.key}`}
                className="flex items-center space-x-2 rtl:space-x-reverse text-sm cursor-pointer"
              >
                {filter.icon}
                <span>{filter.label}</span>
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Popular Tags */}
      {state.availableFilters?.tags && state.availableFilters.tags.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3">
            {isRTL ? "برچسب‌های محبوب" : "Popular Tags"}
          </h3>
          <div className="flex flex-wrap gap-2">
            {state.availableFilters.tags.slice(0, 12).map(tag => (
              <Badge
                key={tag.tag}
                variant={filters.tags.includes(tag.tag) ? "default" : "outline"}
                className="cursor-pointer text-xs hover:bg-gray-100"
                onClick={() => {
                  const newTags = filters.tags.includes(tag.tag)
                    ? filters.tags.filter(t => t !== tag.tag)
                    : [...filters.tags, tag.tag];
                  handleFiltersChange({ ...filters, tags: newTags });
                }}
              >
                {tag.tag} ({tag.count})
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Clear Filters */}
      {activeFiltersCount > 0 && (
        <Button
          variant="outline"
          onClick={handleClearAll}
          className="w-full flex items-center justify-center space-x-2 rtl:space-x-reverse"
        >
          <RefreshCw className="h-4 w-4" />
          <span>{isRTL ? "پاک کردن همه فیلترها" : "Clear All Filters"}</span>
        </Button>
      )}
    </div>
  );

  return (
    <div className={`w-full ${className}`}>
      {/* Mobile Search Bar */}
      <div className="mb-4">
        <div className="relative">
          <Input
            type="text"
            placeholder={isRTL ? "جستجو در محصولات..." : "Search products..."}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className={`pl-12 pr-4 h-12 text-base ${isRTL ? "pr-12 pl-16" : "pl-12 pr-16"}`}
          />
          <Search className={`absolute top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 ${isRTL ? "right-4" : "left-4"}`} />

          {/* Mobile Filter Button */}
          {showMobileDrawer && (
            <Sheet open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className={`absolute top-1/2 -translate-y-1/2 ${isRTL ? "left-2" : "right-2"} h-8 px-3`}
                >
                  <Filter className="h-4 w-4" />
                  {activeFiltersCount > 0 && (
                    <Badge className="ml-1 rtl:ml-0 rtl:mr-1 h-5 min-w-[20px] p-0 text-xs">
                      {activeFiltersCount}
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side={isRTL ? "right" : "left"} className="w-full sm:max-w-md overflow-y-auto">
                <SheetHeader className="mb-6">
                  <SheetTitle className="text-xl font-bold">
                    {isRTL ? "فیلتر محصولات" : "Filter Products"}
                  </SheetTitle>
                  <SheetDescription>
                    {isRTL
                      ? "محصولات مورد نظر خود را با استفاده از فیلترهای زیر پیدا کنید"
                      : "Find your desired products using the filters below"
                    }
                  </SheetDescription>
                </SheetHeader>
                <FilterContent />
              </SheetContent>
            </Sheet>
          )}
        </div>
      </div>

      {/* Active Filters */}
      {getActiveFilters.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center space-x-2 rtl:space-x-reverse mb-2">
            <span className="text-sm font-medium text-gray-700">
              {isRTL ? "فیلترهای فعال:" : "Active Filters:"}
            </span>
            <Badge variant="secondary" className="text-xs">
              {activeFiltersCount}
            </Badge>
          </div>
          <div className="flex flex-wrap gap-2">
            {getActiveFilters.map((filter, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="flex items-center space-x-1 rtl:space-x-reverse py-1 px-2 text-xs"
              >
                <span>{filter.label}</span>
                <button
                  onClick={filter.onRemove}
                  className="hover:text-red-600 transition-colors ml-1 rtl:ml-0 rtl:mr-1"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearAll}
              className="h-auto py-1 px-2 text-xs"
            >
              {isRTL ? "پاک کردن همه" : "Clear All"}
            </Button>
          </div>
        </div>
      )}

      {/* Desktop Filters */}
      {!showMobileDrawer && (
        <Card className="hidden lg:block">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 rtl:space-x-reverse">
              <SlidersHorizontal className="h-5 w-5" />
              <span>{isRTL ? "فیلتر محصولات" : "Filter Products"}</span>
              {activeFiltersCount > 0 && (
                <Badge className="h-5 min-w-[20px] p-0 text-xs">
                  {activeFiltersCount}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <FilterContent />
          </CardContent>
        </Card>
      )}

      {/* Results Summary */}
      {state.productList && (
        <div className="mt-4 text-sm text-gray-600">
          <span>
            {state.productList.pagination.total.toLocaleString(isRTL ? "fa-IR" : "en-US")} {isRTL ? "محصول یافت شد" : "products found"}
          </span>
          {filters.search && (
            <span className="ml-2 rtl:ml-0 rtl:mr-2">
              {isRTL ? "برای" : "for"} "{filters.search}"
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export default ProductSearchFilters;

"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import Image from "next/image";

interface FilterOption {
  id: string;
  label: string;
  label_en?: string;
  count?: number;
  value: any;
}

interface FilterSection {
  id: string;
  title: string;
  title_en: string;
  type: "checkbox" | "radio" | "range" | "date";
  options: FilterOption[];
  isCollapsed?: boolean;
}

interface SearchFiltersProps {
  onFiltersChange?: (filters: Record<string, any>) => void;
  showCounts?: boolean;
  className?: string;
  locale?: string;
  isMobile?: boolean;
  isOpen?: boolean;
  onClose?: () => void;
}

const SearchFilters: React.FC<SearchFiltersProps> = ({
  onFiltersChange,
  showCounts = true,
  className = "",
  locale = "fa",
  isMobile = false,
  isOpen = true,
  onClose,
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [activeFilters, setActiveFilters] = useState<Record<string, any>>({});
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(
    new Set(),
  );
  const [priceRange, setPriceRange] = useState({ min: 0, max: 10000000 });
  const [dateRange, setDateRange] = useState({ from: "", to: "" });
  const [loading, setLoading] = useState(false);

  // Initialize filters from URL params
  useEffect(() => {
    const filters: Record<string, any> = {};

    searchParams.forEach((value, key) => {
      if (key.startsWith("filter_")) {
        const filterKey = key.replace("filter_", "");
        try {
          filters[filterKey] = JSON.parse(value);
        } catch {
          filters[filterKey] = value;
        }
      }
    });

    setActiveFilters(filters);
  }, [searchParams]);

  // Filter sections configuration
  const filterSections: FilterSection[] = [
    {
      id: "content_types",
      title: "نوع محتوا",
      title_en: "Content Type",
      type: "checkbox",
      options: [
        {
          id: "course",
          label: "دوره‌ها",
          label_en: "Courses",
          value: "Course",
          count: 0,
        },
        {
          id: "workshop",
          label: "کارگاه‌ها",
          label_en: "Workshops",
          value: "Workshop",
          count: 0,
        },
        {
          id: "article",
          label: "مقالات",
          label_en: "Articles",
          value: "Article",
          count: 0,
        },
        {
          id: "product",
          label: "محصولات",
          label_en: "Products",
          value: "Product",
          count: 0,
        },
      ],
    },
    {
      id: "level",
      title: "سطح مهارت",
      title_en: "Skill Level",
      type: "radio",
      options: [
        {
          id: "beginner",
          label: "مبتدی",
          label_en: "Beginner",
          value: "Beginner",
          count: 0,
        },
        {
          id: "intermediate",
          label: "متوسط",
          label_en: "Intermediate",
          value: "Intermediate",
          count: 0,
        },
        {
          id: "advanced",
          label: "پیشرفته",
          label_en: "Advanced",
          value: "Advanced",
          count: 0,
        },
      ],
    },
    {
      id: "language",
      title: "زبان محتوا",
      title_en: "Content Language",
      type: "radio",
      options: [
        {
          id: "fa",
          label: "فارسی",
          label_en: "Persian",
          value: "fa",
          count: 0,
        },
        {
          id: "en",
          label: "انگلیسی",
          label_en: "English",
          value: "en",
          count: 0,
        },
        {
          id: "both",
          label: "دوزبانه",
          label_en: "Bilingual",
          value: "both",
          count: 0,
        },
      ],
    },
    {
      id: "price_range",
      title: "بازه قیمت",
      title_en: "Price Range",
      type: "checkbox",
      options: [
        {
          id: "free",
          label: "رایگان",
          label_en: "Free",
          value: { min: 0, max: 0 },
          count: 0,
        },
        {
          id: "under_1m",
          label: "زیر ۱ میلیون",
          label_en: "Under 1M",
          value: { min: 1, max: 999999 },
          count: 0,
        },
        {
          id: "1m_3m",
          label: "۱ تا ۳ میلیون",
          label_en: "1M-3M",
          value: { min: 1000000, max: 2999999 },
          count: 0,
        },
        {
          id: "3m_5m",
          label: "۳ تا ۵ میلیون",
          label_en: "3M-5M",
          value: { min: 3000000, max: 4999999 },
          count: 0,
        },
        {
          id: "5m_plus",
          label: "بالای ۵ میلیون",
          label_en: "5M+",
          value: { min: 5000000, max: null },
          count: 0,
        },
      ],
    },
    {
      id: "duration",
      title: "مدت زمان",
      title_en: "Duration",
      type: "checkbox",
      options: [
        {
          id: "short",
          label: "کوتاه (تا ۴ هفته)",
          label_en: "Short (up to 4 weeks)",
          value: { max: 4 },
          count: 0,
        },
        {
          id: "medium",
          label: "متوسط (۱-۳ ماه)",
          label_en: "Medium (1-3 months)",
          value: { min: 5, max: 12 },
          count: 0,
        },
        {
          id: "long",
          label: "طولانی (بیش از ۳ ماه)",
          label_en: "Long (3+ months)",
          value: { min: 13 },
          count: 0,
        },
      ],
    },
    {
      id: "rating",
      title: "امتیاز",
      title_en: "Rating",
      type: "radio",
      options: [
        {
          id: "4_plus",
          label: "۴ ستاره و بالاتر",
          label_en: "4+ Stars",
          value: 4.0,
          count: 0,
        },
        {
          id: "4_5_plus",
          label: "۴.۵ ستاره و بالاتر",
          label_en: "4.5+ Stars",
          value: 4.5,
          count: 0,
        },
        {
          id: "5_star",
          label: "۵ ستاره",
          label_en: "5 Stars",
          value: 5.0,
          count: 0,
        },
      ],
    },
  ];

  // Handle filter change
  const handleFilterChange = (
    sectionId: string,
    optionId: string,
    value: any,
    type: "checkbox" | "radio",
  ) => {
    const newFilters = { ...activeFilters };

    if (type === "checkbox") {
      if (!newFilters[sectionId]) {
        newFilters[sectionId] = [];
      }

      const currentValues = Array.isArray(newFilters[sectionId])
        ? newFilters[sectionId]
        : [];
      const existingIndex = currentValues.findIndex((item: any) =>
        typeof item === "object"
          ? JSON.stringify(item) === JSON.stringify(value)
          : item === value,
      );

      if (existingIndex >= 0) {
        currentValues.splice(existingIndex, 1);
        if (currentValues.length === 0) {
          delete newFilters[sectionId];
        }
      } else {
        currentValues.push(value);
      }

      newFilters[sectionId] = currentValues;
    } else {
      // Radio button - single selection
      if (newFilters[sectionId] === value) {
        delete newFilters[sectionId]; // Deselect if already selected
      } else {
        newFilters[sectionId] = value;
      }
    }

    setActiveFilters(newFilters);
    updateURL(newFilters);

    if (onFiltersChange) {
      onFiltersChange(newFilters);
    }
  };

  // Update URL with filters
  const updateURL = useCallback(
    (filters: Record<string, any>) => {
      const params = new URLSearchParams(searchParams.toString());

      // Remove existing filter params
      Array.from(params.keys()).forEach((key) => {
        if (key.startsWith("filter_")) {
          params.delete(key);
        }
      });

      // Add new filter params
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          params.set(`filter_${key}`, JSON.stringify(value));
        }
      });

      // Reset to page 1 when filters change
      params.set("page", "1");

      const newUrl = `${pathname}?${params.toString()}`;
      router.push(newUrl, { scroll: false });
    },
    [searchParams, router, pathname],
  );

  // Clear all filters
  const clearAllFilters = () => {
    setActiveFilters({});
    setPriceRange({ min: 0, max: 10000000 });
    setDateRange({ from: "", to: "" });

    const params = new URLSearchParams(searchParams.toString());
    Array.from(params.keys()).forEach((key) => {
      if (key.startsWith("filter_")) {
        params.delete(key);
      }
    });

    const newUrl = `${pathname}?${params.toString()}`;
    router.push(newUrl, { scroll: false });

    if (onFiltersChange) {
      onFiltersChange({});
    }
  };

  // Toggle section collapse
  const toggleSection = (sectionId: string) => {
    const newCollapsed = new Set(collapsedSections);
    if (newCollapsed.has(sectionId)) {
      newCollapsed.delete(sectionId);
    } else {
      newCollapsed.add(sectionId);
    }
    setCollapsedSections(newCollapsed);
  };

  // Check if filter is active
  const isFilterActive = (sectionId: string, value: any): boolean => {
    const sectionFilters = activeFilters[sectionId];
    if (!sectionFilters) return false;

    if (Array.isArray(sectionFilters)) {
      return sectionFilters.some((item: any) =>
        typeof item === "object"
          ? JSON.stringify(item) === JSON.stringify(value)
          : item === value,
      );
    }

    return typeof sectionFilters === "object"
      ? JSON.stringify(sectionFilters) === JSON.stringify(value)
      : sectionFilters === value;
  };

  // Count active filters
  const activeFilterCount = Object.keys(activeFilters).length;

  const containerClasses = isMobile
    ? `fixed inset-0 z-50 bg-background ${isOpen ? "flex" : "hidden"} flex-col`
    : `flex flex-col ${className}`;

  return (
    <div className={containerClasses} dir={locale === "fa" ? "rtl" : "ltr"}>
      {/* Mobile Header */}
      {isMobile && (
        <div className="flex items-center justify-between p-4 bg-background border-b border-background-secondary">
          <h3 className="text-lg font-bold text-text-primary">
            {locale === "fa" ? "فیلترها" : "Filters"}
          </h3>
          <button
            onClick={onClose}
            className="flex items-center justify-center w-10 h-10 rounded-lg hover:bg-background-primary transition-colors"
          >
            <Image
              src="/icons/x.svg"
              alt={locale === "fa" ? "بستن" : "Close"}
              width={24}
              height={24}
              className="w-6 h-6"
            />
          </button>
        </div>
      )}

      {/* Filters Header */}
      {!isMobile && (
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-text-primary">
            {locale === "fa" ? "فیلترها" : "Filters"}
            {activeFilterCount > 0 && (
              <span className="ml-2 px-2 py-1 text-xs bg-primary text-background rounded-full">
                {activeFilterCount}
              </span>
            )}
          </h3>

          {activeFilterCount > 0 && (
            <button
              onClick={clearAllFilters}
              className="text-sm text-primary hover:text-primary-dark transition-colors"
            >
              {locale === "fa" ? "پاک کردن همه" : "Clear All"}
            </button>
          )}
        </div>
      )}

      {/* Filter Sections */}
      <div
        className={`flex flex-col ${isMobile ? "flex-1 overflow-y-auto p-4" : ""}`}
      >
        {filterSections.map((section) => {
          const isCollapsed = collapsedSections.has(section.id);

          return (
            <div
              key={section.id}
              className="mb-6 bg-background border border-background-secondary rounded-lg overflow-hidden"
            >
              {/* Section Header */}
              <button
                onClick={() => toggleSection(section.id)}
                className="flex items-center justify-between w-full p-4 hover:bg-background-primary transition-colors"
              >
                <h4 className="font-semibold text-text-primary">
                  {locale === "fa" ? section.title : section.title_en}
                </h4>
                <Image
                  src="/icons/chevron-down.svg"
                  alt=""
                  width={20}
                  height={20}
                  className={`w-5 h-5 text-text-secondary transition-transform duration-200 ${isCollapsed ? "rotate-180" : ""}`}
                />
              </button>

              {/* Section Content */}
              {!isCollapsed && (
                <div className="p-4 pt-0">
                  <div className="flex flex-col space-y-3">
                    {section.options.map((option) => {
                      const isActive = isFilterActive(section.id, option.value);

                      return (
                        <label
                          key={option.id}
                          className="flex items-center cursor-pointer group"
                        >
                          <input
                            type={
                              section.type === "checkbox" ? "checkbox" : "radio"
                            }
                            name={
                              section.type === "radio" ? section.id : undefined
                            }
                            checked={isActive}
                            onChange={() =>
                              handleFilterChange(
                                section.id,
                                option.id,
                                option.value,
                                section.type === "checkbox" ||
                                  section.type === "radio"
                                  ? section.type
                                  : "checkbox",
                              )
                            }
                            className="sr-only"
                          />

                          {/* Custom Checkbox/Radio */}
                          <div
                            className={`
                            flex items-center justify-center w-5 h-5 mr-3 rounded
                            border-2 transition-colors duration-200
                            ${locale === "fa" ? "ml-3 mr-0" : ""}
                            ${
                              isActive
                                ? "bg-primary border-primary"
                                : "bg-background border-background-darkest group-hover:border-primary/50"
                            }
                            ${section.type === "radio" ? "rounded-full" : "rounded"}
                          `}
                          >
                            {isActive && (
                              <Image
                                src="/icons/check.svg"
                                alt=""
                                width={12}
                                height={12}
                                className="w-3 h-3 text-background"
                              />
                            )}
                          </div>

                          {/* Option Label */}
                          <div className="flex flex-1 items-center justify-between">
                            <span className="text-sm text-text-primary group-hover:text-text transition-colors">
                              {locale === "fa"
                                ? option.label
                                : option.label_en || option.label}
                            </span>

                            {/* Count Badge */}
                            {showCounts && option.count !== undefined && (
                              <span
                                className={`
                                px-2 py-1 text-xs bg-background-secondary text-text-secondary rounded
                                ${locale === "fa" ? "mr-2" : "ml-2"}
                              `}
                              >
                                {option.count.toLocaleString()}
                              </span>
                            )}
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Mobile Footer */}
      {isMobile && (
        <div className="flex items-center gap-4 p-4 bg-background border-t border-background-secondary">
          <button
            onClick={clearAllFilters}
            disabled={activeFilterCount === 0}
            className="flex-1 py-3 text-center font-medium text-text-secondary border border-background-darkest rounded-lg hover:bg-background-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {locale === "fa" ? "پاک کردن" : "Clear"}
          </button>

          <button
            onClick={onClose}
            className="flex-1 py-3 text-center font-medium bg-primary text-background rounded-lg hover:bg-primary-dark transition-colors"
          >
            {locale === "fa"
              ? `نمایش نتایج${activeFilterCount > 0 ? ` (${activeFilterCount} فیلتر)` : ""}`
              : `Show Results${activeFilterCount > 0 ? ` (${activeFilterCount} filters)` : ""}`}
          </button>
        </div>
      )}
    </div>
  );
};

export default SearchFilters;

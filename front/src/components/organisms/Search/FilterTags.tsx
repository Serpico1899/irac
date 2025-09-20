"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import Image from "next/image";

interface FilterTag {
  id: string;
  key: string;
  value: any;
  label: string;
  label_en?: string;
  type: "single" | "array" | "range" | "date";
  displayValue?: string;
  removable?: boolean;
}

interface FilterTagsProps {
  activeFilters: Record<string, any>;
  onFilterRemove?: (filterKey: string, value?: any) => void;
  onClearAll?: () => void;
  showClearAll?: boolean;
  maxTags?: number;
  className?: string;
  locale?: string;
}

const FilterTags: React.FC<FilterTagsProps> = ({
  activeFilters = {},
  onFilterRemove,
  onClearAll,
  showClearAll = true,
  maxTags = 10,
  className = "",
  locale = "fa"
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Filter labels mapping
  const filterLabels: Record<string, { fa: string; en: string }> = {
    content_types: { fa: "نوع محتوا", en: "Content Type" },
    level: { fa: "سطح", en: "Level" },
    language: { fa: "زبان", en: "Language" },
    price_range: { fa: "قیمت", en: "Price" },
    duration: { fa: "مدت زمان", en: "Duration" },
    rating: { fa: "امتیاز", en: "Rating" },
    category: { fa: "دسته‌بندی", en: "Category" },
    tags: { fa: "برچسب", en: "Tag" },
    instructor: { fa: "مدرس", en: "Instructor" },
    author: { fa: "نویسنده", en: "Author" },
    date_range: { fa: "تاریخ", en: "Date" },
    featured: { fa: "ویژه", en: "Featured" },
    free: { fa: "رایگان", en: "Free" }
  };

  // Value labels mapping
  const valueLabels: Record<string, { fa: string; en: string }> = {
    // Content types
    Course: { fa: "دوره", en: "Course" },
    Article: { fa: "مقاله", en: "Article" },
    Workshop: { fa: "کارگاه", en: "Workshop" },
    Product: { fa: "محصول", en: "Product" },

    // Levels
    Beginner: { fa: "مبتدی", en: "Beginner" },
    Intermediate: { fa: "متوسط", en: "Intermediate" },
    Advanced: { fa: "پیشرفته", en: "Advanced" },

    // Languages
    fa: { fa: "فارسی", en: "Persian" },
    en: { fa: "انگلیسی", en: "English" },
    both: { fa: "دوزبانه", en: "Bilingual" },

    // Boolean values
    true: { fa: "بله", en: "Yes" },
    false: { fa: "خیر", en: "No" }
  };

  // Format filter value for display
  const formatFilterValue = (key: string, value: any): string => {
    // Handle price ranges
    if (key === "price_range" && typeof value === "object") {
      if (value.min === 0 && value.max === 0) {
        return locale === "fa" ? "رایگان" : "Free";
      }
      if (value.min === 1 && value.max === 999999) {
        return locale === "fa" ? "زیر ۱ میلیون" : "Under 1M";
      }
      if (value.min === 1000000 && value.max === 2999999) {
        return locale === "fa" ? "۱-۳ میلیون" : "1M-3M";
      }
      if (value.min === 3000000 && value.max === 4999999) {
        return locale === "fa" ? "۳-۵ میلیون" : "3M-5M";
      }
      if (value.min === 5000000 && !value.max) {
        return locale === "fa" ? "بالای ۵ میلیون" : "5M+";
      }
      return `${value.min || 0} - ${value.max || "∞"}`;
    }

    // Handle duration ranges
    if (key === "duration" && typeof value === "object") {
      if (value.max === 4) {
        return locale === "fa" ? "کوتاه" : "Short";
      }
      if (value.min === 5 && value.max === 12) {
        return locale === "fa" ? "متوسط" : "Medium";
      }
      if (value.min === 13) {
        return locale === "fa" ? "طولانی" : "Long";
      }
    }

    // Handle rating values
    if (key === "rating" && typeof value === "number") {
      return `${value}+ ${locale === "fa" ? "ستاره" : "Stars"}`;
    }

    // Handle date ranges
    if (key.includes("date") && typeof value === "string") {
      try {
        const date = new Date(value);
        return date.toLocaleDateString(locale === "fa" ? "fa-IR" : "en-US");
      } catch {
        return value;
      }
    }

    // Handle arrays
    if (Array.isArray(value)) {
      return value.map(v => formatFilterValue(key, v)).join(", ");
    }

    // Handle mapped values
    if (valueLabels[value]) {
      return locale === "fa" ? valueLabels[value].fa : valueLabels[value].en;
    }

    // Handle boolean values
    if (typeof value === "boolean") {
      const boolStr = value.toString();
      return locale === "fa" ? valueLabels[boolStr].fa : valueLabels[boolStr].en;
    }

    // Return value as string
    return String(value);
  };

  // Generate filter tags from active filters
  const generateFilterTags = (): FilterTag[] => {
    const tags: FilterTag[] = [];

    Object.entries(activeFilters).forEach(([key, value]) => {
      if (value === null || value === undefined || value === "" ||
          (Array.isArray(value) && value.length === 0)) {
        return;
      }

      const filterLabel = filterLabels[key] || { fa: key, en: key };

      if (Array.isArray(value)) {
        // Handle array values - create separate tags for each value
        value.forEach((val, index) => {
          tags.push({
            id: `${key}_${index}`,
            key,
            value: val,
            label: filterLabel.fa,
            label_en: filterLabel.en,
            type: "array",
            displayValue: formatFilterValue(key, val),
            removable: true
          });
        });
      } else {
        // Handle single values
        tags.push({
          id: key,
          key,
          value,
          label: filterLabel.fa,
          label_en: filterLabel.en,
          type: "single",
          displayValue: formatFilterValue(key, value),
          removable: true
        });
      }
    });

    return tags.slice(0, maxTags);
  };

  // Handle individual filter removal
  const handleFilterRemove = (filterKey: string, value?: any) => {
    if (onFilterRemove) {
      onFilterRemove(filterKey, value);
      return;
    }

    // Default URL-based filter removal
    const params = new URLSearchParams(searchParams.toString());
    const currentFilter = activeFilters[filterKey];

    if (Array.isArray(currentFilter) && value !== undefined) {
      // Remove specific value from array
      const updatedArray = currentFilter.filter(item =>
        JSON.stringify(item) !== JSON.stringify(value)
      );

      if (updatedArray.length === 0) {
        params.delete(`filter_${filterKey}`);
      } else {
        params.set(`filter_${filterKey}`, JSON.stringify(updatedArray));
      }
    } else {
      // Remove entire filter
      params.delete(`filter_${filterKey}`);
    }

    // Reset to first page
    params.set("page", "1");

    const newUrl = `${pathname}?${params.toString()}`;
    router.push(newUrl, { scroll: false });
  };

  // Handle clear all filters
  const handleClearAll = () => {
    if (onClearAll) {
      onClearAll();
      return;
    }

    // Default URL-based clear all
    const params = new URLSearchParams(searchParams.toString());

    // Remove all filter params
    Array.from(params.keys()).forEach(key => {
      if (key.startsWith('filter_')) {
        params.delete(key);
      }
    });

    // Reset to first page
    params.set("page", "1");

    const newUrl = `${pathname}?${params.toString()}`;
    router.push(newUrl, { scroll: false });
  };

  const filterTags = generateFilterTags();

  if (filterTags.length === 0) {
    return null;
  }

  return (
    <div
      className={`flex flex-wrap items-center gap-2 ${className}`}
      dir={locale === "fa" ? "rtl" : "ltr"}
    >
      {/* Filter Tags */}
      {filterTags.map((tag) => (
        <div
          key={tag.id}
          className="flex items-center gap-2 px-3 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium border border-primary/20"
        >
          {/* Filter Label */}
          <span className="text-xs opacity-75">
            {locale === "fa" ? tag.label : (tag.label_en || tag.label)}:
          </span>

          {/* Filter Value */}
          <span className="font-semibold">
            {tag.displayValue}
          </span>

          {/* Remove Button */}
          {tag.removable && (
            <button
              onClick={() => handleFilterRemove(tag.key, tag.value)}
              className="flex items-center justify-center w-4 h-4 rounded-full hover:bg-primary/20 transition-colors ml-1"
              aria-label={
                locale === "fa"
                  ? `حذف فیلتر ${tag.displayValue}`
                  : `Remove ${tag.displayValue} filter`
              }
            >
              <Image
                src="/icons/x.svg"
                alt=""
                width={12}
                height={12}
                className="w-3 h-3"
              />
            </button>
          )}
        </div>
      ))}

      {/* Clear All Button */}
      {showClearAll && filterTags.length > 1 && (
        <button
          onClick={handleClearAll}
          className="flex items-center gap-2 px-3 py-2 text-text-secondary hover:text-text border border-background-darkest hover:border-text-lighter rounded-full text-sm font-medium transition-colors"
        >
          <Image
            src="/icons/x-circle.svg"
            alt=""
            width={16}
            height={16}
            className="w-4 h-4"
          />
          <span>
            {locale === "fa" ? "پاک کردن همه" : "Clear All"}
          </span>
        </button>
      )}

      {/* Show More Indicator */}
      {Object.keys(activeFilters).length > maxTags && (
        <span className="px-3 py-2 bg-background-secondary text-text-secondary rounded-full text-sm">
          {locale === "fa"
            ? `+${Object.keys(activeFilters).length - maxTags} فیلتر دیگر`
            : `+${Object.keys(activeFilters).length - maxTags} more filters`
          }
        </span>
      )}
    </div>
  );
};

export default FilterTags;

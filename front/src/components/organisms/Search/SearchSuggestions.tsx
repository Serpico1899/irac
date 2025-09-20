"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

interface SuggestionItem {
  id: string;
  text: string;
  type: "course" | "article" | "workshop" | "product" | "category" | "instructor" | "recent";
  url?: string;
  category?: string;
  description?: string;
  image_url?: string;
  count?: number;
  meta?: {
    price?: number;
    rating?: number;
    level?: string;
  };
}

interface SearchSuggestionsProps {
  query: string;
  isVisible: boolean;
  onSelect: (suggestion: SuggestionItem) => void;
  onClose: () => void;
  recentSearches?: string[];
  onRecentClear?: () => void;
  maxSuggestions?: number;
  showRecentWhenEmpty?: boolean;
  locale?: string;
  className?: string;
}

const SearchSuggestions: React.FC<SearchSuggestionsProps> = ({
  query,
  isVisible,
  onSelect,
  onClose,
  recentSearches = [],
  onRecentClear,
  maxSuggestions = 8,
  showRecentWhenEmpty = true,
  locale = "fa",
  className = ""
}) => {
  const router = useRouter();
  const [suggestions, setSuggestions] = useState<SuggestionItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);

  // Fetch suggestions from API
  const fetchSuggestions = useCallback(async (searchQuery: string) => {
    if (searchQuery.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    try {
      setLoading(true);

      // Mock API call - replace with actual search suggestions API
      const response = await fetch(`/api/search/suggestions?q=${encodeURIComponent(searchQuery)}&limit=${maxSuggestions}&locale=${locale}`);

      if (response.ok) {
        const data = await response.json();
        setSuggestions(data.suggestions || []);
      } else {
        // Fallback to mock suggestions
        const mockSuggestions: SuggestionItem[] = [
          {
            id: "1",
            text: `${searchQuery} - دوره معماری`,
            type: "course",
            url: "/courses/architecture-basics",
            category: "معماری",
            description: "دوره مقدماتی معماری",
            meta: { price: 1500000, rating: 4.5, level: "Beginner" }
          },
          {
            id: "2",
            text: `${searchQuery} - مقاله`,
            type: "article",
            url: "/articles/architecture-principles",
            category: "مقالات",
            description: "اصول پایه معماری"
          },
          {
            id: "3",
            text: `${searchQuery} - کارگاه`,
            type: "workshop",
            url: "/workshops/calligraphy-workshop",
            category: "خوشنویسی",
            meta: { price: 500000, rating: 4.8 }
          }
        ].slice(0, maxSuggestions);
        setSuggestions(mockSuggestions);
      }
    } catch (error) {
      console.error("Error fetching suggestions:", error);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  }, [maxSuggestions, locale]);

  // Debounced suggestion fetching
  useEffect(() => {
    const debounce = setTimeout(() => {
      if (query.trim()) {
        fetchSuggestions(query);
      } else {
        setSuggestions([]);
      }
    }, 300);

    return () => clearTimeout(debounce);
  }, [query, fetchSuggestions]);

  // Reset highlight when suggestions change
  useEffect(() => {
    setHighlightedIndex(-1);
  }, [suggestions]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isVisible) return;

      const items = getDisplayItems();

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setHighlightedIndex(prev =>
            prev < items.length - 1 ? prev + 1 : 0
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          setHighlightedIndex(prev =>
            prev > 0 ? prev - 1 : items.length - 1
          );
          break;
        case "Enter":
          e.preventDefault();
          if (highlightedIndex >= 0 && items[highlightedIndex]) {
            handleSelect(items[highlightedIndex]);
          }
          break;
        case "Escape":
          e.preventDefault();
          onClose();
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isVisible, highlightedIndex, suggestions, recentSearches, query, onClose]);

  // Get items to display (suggestions + recent searches)
  const getDisplayItems = (): SuggestionItem[] => {
    if (query.trim()) {
      return suggestions;
    }

    if (showRecentWhenEmpty && recentSearches.length > 0) {
      return recentSearches.slice(0, maxSuggestions).map(search => ({
        id: `recent_${search}`,
        text: search,
        type: "recent" as const,
        url: `/search?q=${encodeURIComponent(search)}`
      }));
    }

    return [];
  };

  // Handle suggestion selection
  const handleSelect = (item: SuggestionItem) => {
    onSelect(item);

    if (item.url) {
      router.push(item.url);
    }
  };

  // Get icon for suggestion type
  const getTypeIcon = (type: string) => {
    const iconMap: Record<string, string> = {
      course: "/icons/book-open.svg",
      article: "/icons/article.svg",
      workshop: "/icons/users.svg",
      product: "/icons/shopping-bag.svg",
      category: "/icons/folder.svg",
      instructor: "/icons/user.svg",
      recent: "/icons/clock.svg"
    };

    return iconMap[type] || "/icons/search.svg";
  };

  // Get type label
  const getTypeLabel = (type: string) => {
    const labelMap: Record<string, { fa: string; en: string }> = {
      course: { fa: "دوره", en: "Course" },
      article: { fa: "مقاله", en: "Article" },
      workshop: { fa: "کارگاه", en: "Workshop" },
      product: { fa: "محصول", en: "Product" },
      category: { fa: "دسته", en: "Category" },
      instructor: { fa: "مدرس", en: "Instructor" },
      recent: { fa: "اخیر", en: "Recent" }
    };

    return locale === "fa" ? labelMap[type]?.fa : labelMap[type]?.en;
  };

  // Get type color
  const getTypeColor = (type: string) => {
    const colorMap: Record<string, string> = {
      course: "bg-primary/10 text-primary",
      article: "bg-accent/10 text-accent",
      workshop: "bg-accent-primary/10 text-accent-primary",
      product: "bg-text-secondary/10 text-text-secondary",
      category: "bg-background-darkest text-text-secondary",
      instructor: "bg-background-darkest text-text-secondary",
      recent: "bg-background-secondary text-text-lighter"
    };

    return colorMap[type] || "bg-background-secondary text-text-secondary";
  };

  const displayItems = getDisplayItems();

  if (!isVisible || displayItems.length === 0) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      className={`
        flex flex-col absolute top-full left-0 right-0 z-50 mt-2
        bg-background rounded-lg shadow-xl border border-background-secondary
        max-h-96 overflow-y-auto
        ${className}
      `}
      dir={locale === "fa" ? "rtl" : "ltr"}
    >
      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-4">
          <div className="loader w-5 h-5"></div>
        </div>
      )}

      {/* Recent Searches Header */}
      {!query.trim() && showRecentWhenEmpty && recentSearches.length > 0 && (
        <div className="flex items-center justify-between px-4 py-3 border-b border-background-secondary bg-background-primary">
          <div className="flex items-center gap-2">
            <Image
              src="/icons/clock.svg"
              alt=""
              width={16}
              height={16}
              className="w-4 h-4 text-text-lighter"
            />
            <span className="text-sm font-medium text-text-secondary">
              {locale === "fa" ? "جستجوهای اخیر" : "Recent Searches"}
            </span>
          </div>

          {onRecentClear && (
            <button
              onClick={onRecentClear}
              className="text-xs text-text-lighter hover:text-text-secondary transition-colors"
            >
              {locale === "fa" ? "پاک کردن" : "Clear"}
            </button>
          )}
        </div>
      )}

      {/* Suggestions List */}
      <div className="flex flex-col">
        {displayItems.map((item, index) => (
          <button
            key={item.id}
            onClick={() => handleSelect(item)}
            className={`
              flex items-center gap-3 px-4 py-3
              hover:bg-background-primary transition-colors duration-150
              border-b border-background-secondary last:border-b-0
              ${highlightedIndex === index ? "bg-background-primary" : ""}
              ${locale === "fa" ? "text-right" : "text-left"}
            `}
          >
            {/* Icon */}
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-background-secondary flex-shrink-0">
              <Image
                src={getTypeIcon(item.type)}
                alt=""
                width={16}
                height={16}
                className="w-4 h-4 text-text-lighter"
              />
            </div>

            {/* Content */}
            <div className="flex flex-col flex-1 min-w-0 gap-1">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium text-text-primary line-clamp-1">
                  {item.text}
                </span>

                {/* Type Badge */}
                <span className={`
                  px-2 py-1 text-xs font-medium rounded flex-shrink-0
                  ${getTypeColor(item.type)}
                `}>
                  {getTypeLabel(item.type)}
                </span>
              </div>

              {/* Description and Meta */}
              <div className="flex items-center justify-between gap-2">
                {item.description && (
                  <span className="text-xs text-text-lighter line-clamp-1">
                    {item.description}
                  </span>
                )}

                {/* Meta Information */}
                {item.meta && (
                  <div className="flex items-center gap-3 text-xs text-text-lighter flex-shrink-0">
                    {item.meta.price !== undefined && (
                      <span>
                        {item.meta.price === 0
                          ? (locale === "fa" ? "رایگان" : "Free")
                          : `${item.meta.price.toLocaleString()} ${locale === "fa" ? "تومان" : "IRT"}`
                        }
                      </span>
                    )}

                    {item.meta.rating && (
                      <div className="flex items-center gap-1">
                        <Image
                          src="/icons/star.svg"
                          alt=""
                          width={12}
                          height={12}
                          className="w-3 h-3 text-accent-primary"
                        />
                        <span>{item.meta.rating.toFixed(1)}</span>
                      </div>
                    )}

                    {item.meta.level && (
                      <span className="px-2 py-0.5 bg-background-darkest text-text-secondary rounded text-xs">
                        {locale === "fa"
                          ? (item.meta.level === "Beginner" ? "مبتدی" :
                             item.meta.level === "Intermediate" ? "متوسط" : "پیشرفته")
                          : item.meta.level
                        }
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Category */}
              {item.category && item.type !== "recent" && (
                <div className="flex items-center gap-1 text-xs text-text-lighter">
                  <Image
                    src="/icons/folder.svg"
                    alt=""
                    width={12}
                    height={12}
                    className="w-3 h-3"
                  />
                  <span>{item.category}</span>
                </div>
              )}
            </div>

            {/* Arrow Icon */}
            <div className={`flex items-center justify-center text-text-lighter ${locale === "fa" ? "rotate-180" : ""}`}>
              <Image
                src="/icons/arrow-right.svg"
                alt=""
                width={16}
                height={16}
                className="w-4 h-4"
              />
            </div>
          </button>
        ))}
      </div>

      {/* View All Results */}
      {query.trim() && suggestions.length > 0 && (
        <div className="border-t border-background-secondary">
          <Link
            href={`/search?q=${encodeURIComponent(query)}`}
            className="flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-primary hover:bg-background-primary transition-colors"
            onClick={onClose}
          >
            <Image
              src="/icons/search.svg"
              alt=""
              width={16}
              height={16}
              className="w-4 h-4"
            />
            <span>
              {locale === "fa"
                ? `مشاهده همه نتایج "${query}"`
                : `View all results for "${query}"`
              }
            </span>
          </Link>
        </div>
      )}

      {/* No Results */}
      {!loading && query.trim() && suggestions.length === 0 && (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="w-12 h-12 mb-3 bg-background-primary rounded-full flex items-center justify-center">
            <Image
              src="/icons/search.svg"
              alt=""
              width={20}
              height={20}
              className="w-5 h-5 text-text-lighter"
            />
          </div>

          <p className="text-sm text-text-secondary mb-2">
            {locale === "fa"
              ? "پیشنهادی یافت نشد"
              : "No suggestions found"
            }
          </p>

          <Link
            href={`/search?q=${encodeURIComponent(query)}`}
            className="text-sm text-primary hover:text-primary-dark transition-colors"
            onClick={onClose}
          >
            {locale === "fa"
              ? "جستجو در همه محتوا"
              : "Search all content"
            }
          </Link>
        </div>
      )}
    </div>
  );
};

export default SearchSuggestions;

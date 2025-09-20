"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useLocalStorage } from "@/hooks/useLocalStorage";

interface SearchSuggestion {
  id: string;
  text: string;
  type: "course" | "article" | "workshop" | "product";
  category?: string;
  url?: string;
}

interface SearchBarProps {
  placeholder?: string;
  placeholderEn?: string;
  onSearch?: (query: string) => void;
  showSuggestions?: boolean;
  showRecentSearches?: boolean;
  autoFocus?: boolean;
  size?: "small" | "medium" | "large";
  variant?: "default" | "hero" | "navbar";
  className?: string;
  locale?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = "جستجو در دوره‌ها، مقالات و کارگاه‌ها...",
  placeholderEn = "Search courses, articles, workshops...",
  onSearch,
  showSuggestions = true,
  showRecentSearches = true,
  autoFocus = false,
  size = "medium",
  variant = "default",
  className = "",
  locale = "fa",
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [recentSearches, setRecentSearches] = useLocalStorage<string[]>(
    "recent_searches",
    [],
  );
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize search query from URL params
  useEffect(() => {
    const searchQuery =
      searchParams.get("search") || searchParams.get("q") || "";
    if (searchQuery) {
      setQuery(searchQuery);
    }
  }, [searchParams]);

  // Auto focus
  useEffect(() => {
    if (autoFocus && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [autoFocus]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !searchInputRef.current?.contains(event.target as Node)
      ) {
        setShowDropdown(false);
        setHighlightedIndex(-1);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch suggestions
  const fetchSuggestions = useCallback(
    async (searchQuery: string) => {
      if (searchQuery.trim().length < 2) {
        setSuggestions([]);
        return;
      }

      try {
        setIsLoading(true);

        // Mock API call - replace with actual API
        const response = await fetch(
          `/api/search/suggestions?q=${encodeURIComponent(searchQuery)}&locale=${locale}`,
        );

        if (response.ok) {
          const data = await response.json();
          setSuggestions(data.suggestions || []);
        }
      } catch (error) {
        console.error("Error fetching suggestions:", error);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    },
    [locale],
  );

  // Debounced suggestion fetching
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (query.trim() && showSuggestions) {
      debounceRef.current = setTimeout(() => {
        fetchSuggestions(query);
      }, 300);
    } else {
      setSuggestions([]);
    }

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query, fetchSuggestions, showSuggestions]);

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setShowDropdown(true);
    setHighlightedIndex(-1);
  };

  // Handle input focus
  const handleInputFocus = () => {
    setShowDropdown(true);
    if (!query.trim() && showRecentSearches && recentSearches.length > 0) {
      // Show recent searches when focused with empty query
      setHighlightedIndex(-1);
    }
  };

  // Handle search submission
  const handleSearch = (searchQuery?: string) => {
    const finalQuery = searchQuery || query.trim();

    if (!finalQuery) return;

    // Add to recent searches
    if (showRecentSearches) {
      const updatedRecentSearches = [
        finalQuery,
        ...recentSearches.filter((item) => item !== finalQuery),
      ].slice(0, 10); // Keep only 10 recent searches

      setRecentSearches(updatedRecentSearches);
    }

    // Close dropdown
    setShowDropdown(false);
    setHighlightedIndex(-1);

    // Call onSearch callback if provided
    if (onSearch) {
      onSearch(finalQuery);
      return;
    }

    // Navigate to search page
    const searchUrl = `/search?q=${encodeURIComponent(finalQuery)}`;
    router.push(searchUrl);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showDropdown) return;

    const dropdownItems = [
      ...suggestions,
      ...(showRecentSearches && !query.trim()
        ? recentSearches.map((search) => ({
            id: search,
            text: search,
            type: "recent" as const,
            url: `/search?q=${encodeURIComponent(search)}`,
            category: undefined,
          }))
        : []),
    ];

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < dropdownItems.length - 1 ? prev + 1 : 0,
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev > 0 ? prev - 1 : dropdownItems.length - 1,
        );
        break;
      case "Enter":
        e.preventDefault();
        if (highlightedIndex >= 0 && dropdownItems[highlightedIndex]) {
          const selectedItem = dropdownItems[highlightedIndex];
          if ("url" in selectedItem && selectedItem.url) {
            router.push(selectedItem.url);
          } else {
            handleSearch(selectedItem.text);
          }
        } else {
          handleSearch();
        }
        break;
      case "Escape":
        e.preventDefault();
        setShowDropdown(false);
        setHighlightedIndex(-1);
        searchInputRef.current?.blur();
        break;
    }
  };

  // Size and variant classes
  const getSizeClasses = () => {
    switch (size) {
      case "small":
        return "h-10 text-sm";
      case "large":
        return "h-14 text-lg";
      default:
        return "h-12 text-base";
    }
  };

  const getVariantClasses = () => {
    switch (variant) {
      case "hero":
        return "bg-background rounded-[25px] shadow-xl border-2 border-transparent focus-within:border-accent";
      case "navbar":
        return "bg-background-primary rounded-lg shadow-sm border border-background-darkest";
      default:
        return "bg-background rounded-lg shadow-md border border-background-secondary focus-within:border-primary";
    }
  };

  const dropdownItems = [
    ...suggestions,
    ...(showRecentSearches && !query.trim()
      ? recentSearches.map((search) => ({
          id: search,
          text: search,
          type: "recent" as const,
        }))
      : []),
  ];

  return (
    <div
      className={`flex flex-col w-full relative ${className}`}
      dir={locale === "fa" ? "rtl" : "ltr"}
    >
      {/* Search Input Container */}
      <div
        className={`flex items-center ${getSizeClasses()} ${getVariantClasses()} transition-all duration-200`}
      >
        {/* Search Icon - Left side for LTR, Right side for RTL */}
        <div
          className={`flex items-center justify-center px-4 ${locale === "fa" ? "order-last" : ""}`}
        >
          <Image
            src="/icons/search.svg"
            alt={locale === "fa" ? "جستجو" : "Search"}
            width={20}
            height={20}
            className="w-5 h-5 text-text-secondary"
          />
        </div>

        {/* Search Input */}
        <input
          ref={searchInputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onKeyDown={handleKeyDown}
          placeholder={locale === "fa" ? placeholder : placeholderEn}
          className={`
            flex-1 px-2 py-3 bg-transparent
            text-text-primary placeholder-text-lighter
            border-none outline-none
            search-input
            ${locale === "fa" ? "text-right" : "text-left"}
          `}
          autoComplete="off"
          spellCheck="false"
        />

        {/* Loading Spinner */}
        {isLoading && (
          <div
            className={`flex items-center justify-center px-4 ${locale === "fa" ? "order-first" : ""}`}
          >
            <div className="loader w-4 h-4"></div>
          </div>
        )}

        {/* Search Button */}
        <button
          onClick={() => handleSearch()}
          disabled={!query.trim() || isLoading}
          className={`
            flex items-center justify-center px-4 py-2 mx-2
            bg-primary hover:bg-primary-dark
            text-background font-medium rounded-lg
            transition-colors duration-200
            disabled:opacity-50 disabled:cursor-not-allowed
            ${locale === "fa" ? "order-first ml-2" : "mr-2"}
          `}
          aria-label={locale === "fa" ? "جستجو" : "Search"}
        >
          <span className="text-sm">
            {locale === "fa" ? "جستجو" : "Search"}
          </span>
        </button>

        {/* Clear Button */}
        {query && (
          <button
            onClick={() => {
              setQuery("");
              setShowDropdown(false);
              searchInputRef.current?.focus();
            }}
            className={`
              flex items-center justify-center w-8 h-8
              text-text-lighter hover:text-text-secondary
              rounded-full hover:bg-background-primary
              transition-colors duration-200
              ${locale === "fa" ? "order-2 mr-2" : "ml-2"}
            `}
            aria-label={locale === "fa" ? "پاک کردن" : "Clear"}
          >
            <Image
              src="/icons/x.svg"
              alt={locale === "fa" ? "پاک کردن" : "Clear"}
              width={16}
              height={16}
              className="w-4 h-4"
            />
          </button>
        )}
      </div>

      {/* Dropdown */}
      {showDropdown && dropdownItems.length > 0 && (
        <div
          ref={dropdownRef}
          className="flex flex-col absolute top-full left-0 right-0 z-50 mt-2 bg-background rounded-lg shadow-xl border border-background-secondary max-h-96 overflow-y-auto"
        >
          {/* Recent Searches Header */}
          {showRecentSearches && !query.trim() && recentSearches.length > 0 && (
            <div className="flex items-center justify-between px-4 py-3 border-b border-background-secondary bg-background-primary">
              <span className="text-sm font-medium text-text-secondary">
                {locale === "fa" ? "جستجوهای اخیر" : "Recent Searches"}
              </span>
              <button
                onClick={() => setRecentSearches([])}
                className="text-xs text-text-lighter hover:text-text-secondary transition-colors"
              >
                {locale === "fa" ? "پاک کردن همه" : "Clear All"}
              </button>
            </div>
          )}

          {/* Dropdown Items */}
          {dropdownItems.map((item, index) => (
            <button
              key={item.id}
              onClick={() => {
                if ("url" in item && item.url) {
                  router.push(item.url);
                } else {
                  handleSearch(item.text);
                }
              }}
              className={`
                flex items-center px-4 py-3
                hover:bg-background-primary
                transition-colors duration-150
                text-left border-b border-background-secondary last:border-b-0
                ${highlightedIndex === index ? "bg-background-primary" : ""}
                ${locale === "fa" ? "text-right" : "text-left"}
              `}
            >
              {/* Icon */}
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-lg mr-3 ${locale === "fa" ? "ml-3 mr-0" : ""}`}
              >
                {item.type === "recent" ? (
                  <Image
                    src="/icons/clock.svg"
                    alt=""
                    width={16}
                    height={16}
                    className="w-4 h-4 text-text-lighter"
                  />
                ) : item.type === "course" ? (
                  <Image
                    src="/icons/book-open.svg"
                    alt=""
                    width={16}
                    height={16}
                    className="w-4 h-4 text-primary"
                  />
                ) : item.type === "article" ? (
                  <Image
                    src="/icons/article.svg"
                    alt=""
                    width={16}
                    height={16}
                    className="w-4 h-4 text-accent"
                  />
                ) : (
                  <Image
                    src="/icons/search.svg"
                    alt=""
                    width={16}
                    height={16}
                    className="w-4 h-4 text-text-lighter"
                  />
                )}
              </div>

              {/* Text */}
              <div className="flex flex-col flex-1">
                <span className="text-sm font-medium text-text-primary line-clamp-1">
                  {item.text}
                </span>
                {"category" in item && item.category && (
                  <span className="text-xs text-text-lighter mt-1">
                    {item.category}
                  </span>
                )}
              </div>

              {/* Type Badge */}
              {item.type !== "recent" && (
                <span
                  className={`
                  px-2 py-1 text-xs font-medium rounded
                  ${locale === "fa" ? "ml-3 mr-0" : "ml-3"}
                  ${
                    item.type === "course"
                      ? "bg-primary/10 text-primary"
                      : item.type === "article"
                        ? "bg-accent/10 text-accent"
                        : item.type === "workshop"
                          ? "bg-accent-primary/10 text-accent-primary"
                          : "bg-background-secondary text-text-secondary"
                  }
                `}
                >
                  {locale === "fa"
                    ? item.type === "course"
                      ? "دوره"
                      : item.type === "article"
                        ? "مقاله"
                        : item.type === "workshop"
                          ? "کارگاه"
                          : "محصول"
                    : item.type === "course"
                      ? "Course"
                      : item.type === "article"
                        ? "Article"
                        : item.type === "workshop"
                          ? "Workshop"
                          : "Product"}
                </span>
              )}
            </button>
          ))}

          {/* Show All Results Link */}
          {query.trim() && (
            <Link
              href={`/search?q=${encodeURIComponent(query)}`}
              className="flex items-center justify-center px-4 py-3 text-sm font-medium text-primary hover:bg-background-primary transition-colors border-t border-background-secondary"
            >
              {locale === "fa"
                ? `مشاهده همه نتایج برای "${query}"`
                : `View all results for "${query}"`}
            </Link>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;

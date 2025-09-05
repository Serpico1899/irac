"use client";

import { useTranslations } from "next-intl";
import { useState, useMemo, useCallback, memo, useEffect } from "react";

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category?: string;
  priority?: number;
  keywords?: string[];
}

interface LandingFAQProps {
  faqs: FAQItem[];
  title?: string;
  subtitle?: string;
  locale: string;
  variant?: "accordion" | "cards" | "minimal";
  showSearch?: boolean;
  showCategories?: boolean;
  maxVisible?: number;
  backgroundColor?: "white" | "gray" | "blue" | "transparent";
  structuredData?: boolean;
}

function LandingFAQ({
  faqs,
  title,
  subtitle,
  locale,
  variant = "accordion",
  showSearch = true,
  showCategories = true,
  maxVisible,
  backgroundColor = "gray",
  structuredData = true,
}: LandingFAQProps) {
  const t = useTranslations("faq");
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const isRtl = locale === "fa";

  // Debounce search query for performance
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const backgroundClasses = {
    white: "bg-white",
    gray: "bg-gray-50",
    blue: "bg-blue-50",
    transparent: "bg-transparent",
  };

  // Extract unique categories
  const categories = useMemo(() => {
    const uniqueCategories = Array.from(
      new Set(faqs.filter((faq) => faq.category).map((faq) => faq.category)),
    );
    return uniqueCategories.sort();
  }, [faqs]);

  // Filter FAQs based on search and category
  const filteredFaqs = useMemo(() => {
    let filtered = faqs;

    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter((faq) => faq.category === selectedCategory);
    }

    // Filter by search query (use debounced query)
    if (debouncedQuery.trim()) {
      const query = debouncedQuery.toLowerCase().trim();
      filtered = filtered.filter(
        (faq) =>
          faq.question.toLowerCase().includes(query) ||
          faq.answer.toLowerCase().includes(query) ||
          (faq.keywords &&
            faq.keywords.some((keyword) =>
              keyword.toLowerCase().includes(query),
            )),
      );
    }

    // Sort by priority
    filtered.sort((a, b) => (b.priority || 0) - (a.priority || 0));

    // Limit visible items
    if (maxVisible) {
      filtered = filtered.slice(0, maxVisible);
    }

    return filtered;
  }, [faqs, selectedCategory, searchQuery, maxVisible]);

  const toggleExpanded = (itemId: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

  const clearSearch = useCallback(() => {
    setSearchQuery("");
    setSelectedCategory(null);
  }, []);

  const handleCategorySelect = useCallback((category: string | null) => {
    setSelectedCategory(category);
  }, []);

  const handleExpandAll = useCallback(() => {
    if (expandedItems.size === filteredFaqs.length) {
      setExpandedItems(new Set());
    } else {
      setExpandedItems(new Set(filteredFaqs.map((faq) => faq.id)));
    }
  }, [expandedItems.size, filteredFaqs]);

  // Generate structured data for SEO
  const generateStructuredData = () => {
    if (!structuredData || !filteredFaqs.length) return null;

    const faqStructuredData = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: filteredFaqs.map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: faq.answer,
        },
      })),
    };

    return (
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqStructuredData),
        }}
      />
    );
  };

  const renderFAQItem = (faq: FAQItem, index: number) => {
    const isExpanded = expandedItems.has(faq.id);

    if (variant === "cards") {
      return (
        <div
          key={faq.id}
          className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden"
        >
          <button
            onClick={() => toggleExpanded(faq.id)}
            className="w-full p-6 text-left hover:bg-gray-50 transition-colors duration-200 touch-manipulation"
            aria-expanded={isExpanded}
            aria-controls={`faq-answer-${faq.id}`}
          >
            <div className="flex items-start justify-between gap-4">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 leading-relaxed flex-1">
                {faq.question}
              </h3>
              <svg
                className={`w-5 h-5 text-blue-600 transform transition-transform duration-300 flex-shrink-0 mt-1 ${
                  isExpanded ? "rotate-180" : ""
                }`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </button>

          {isExpanded && (
            <div
              id={`faq-answer-${faq.id}`}
              className="px-6 pb-6 border-t border-gray-100"
            >
              <div className="pt-4 text-gray-700 leading-relaxed">
                {faq.answer}
              </div>
            </div>
          )}
        </div>
      );
    }

    if (variant === "minimal") {
      return (
        <div key={faq.id} className="border-b border-gray-200 last:border-b-0">
          <button
            onClick={() => toggleExpanded(faq.id)}
            className="w-full py-4 sm:py-6 text-left hover:bg-gray-50/50 transition-colors duration-200 touch-manipulation"
            aria-expanded={isExpanded}
            aria-controls={`faq-answer-${faq.id}`}
          >
            <div className="flex items-start justify-between gap-4">
              <h3 className="text-base sm:text-lg font-medium text-gray-900 leading-relaxed flex-1">
                {faq.question}
              </h3>
              <div className="flex-shrink-0">
                <div
                  className={`w-6 h-6 flex items-center justify-center text-gray-500 transition-transform duration-300 ${
                    isExpanded ? "rotate-45" : ""
                  }`}
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </button>

          {isExpanded && (
            <div id={`faq-answer-${faq.id}`} className="pb-4 sm:pb-6">
              <div className="text-gray-700 leading-relaxed">{faq.answer}</div>
            </div>
          )}
        </div>
      );
    }

    // Default accordion variant
    return (
      <div
        key={faq.id}
        className="bg-white rounded-lg border border-gray-200 overflow-hidden"
      >
        <button
          onClick={() => toggleExpanded(faq.id)}
          className="w-full px-4 sm:px-6 py-4 sm:py-5 text-left hover:bg-gray-50 transition-colors duration-200 touch-manipulation"
          aria-expanded={isExpanded}
          aria-controls={`faq-answer-${faq.id}`}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3 flex-1">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 text-sm font-bold rounded-full flex items-center justify-center mt-0.5">
                {index + 1}
              </span>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 leading-relaxed">
                {faq.question}
              </h3>
            </div>
            <svg
              className={`w-5 h-5 text-gray-500 transform transition-transform duration-300 flex-shrink-0 mt-1 ${
                isExpanded ? "rotate-180" : ""
              }`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </button>

        {isExpanded && (
          <div
            id={`faq-answer-${faq.id}`}
            className="px-4 sm:px-6 pb-4 sm:pb-5 border-t border-gray-100"
          >
            <div className="pt-4 pl-9 text-gray-700 leading-relaxed">
              {faq.answer}
            </div>
          </div>
        )}
      </div>
    );
  };

  if (!faqs.length) {
    return null;
  }

  return (
    <>
      {generateStructuredData()}
      <section
        className={`py-12 sm:py-16 lg:py-20 ${backgroundClasses[backgroundColor]}`}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div
            className={`text-center mb-8 sm:mb-12 ${isRtl ? "text-right" : "text-left"} sm:text-center`}
          >
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              {title || t("defaultTitle")}
            </h2>
            {subtitle && (
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                {subtitle}
              </p>
            )}
          </div>

          {/* Search and Filters */}
          {(showSearch || showCategories) && (
            <div className="mb-8 space-y-4">
              {/* Search Bar */}
              {showSearch && (
                <div className="relative">
                  <div
                    className={`absolute inset-y-0 ${isRtl ? "right-0 pr-3" : "left-0 pl-3"} flex items-center pointer-events-none`}
                  >
                    <svg
                      className="w-5 h-5 text-gray-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t("searchPlaceholder")}
                    className={`w-full ${isRtl ? "pr-10 pl-4" : "pl-10 pr-4"} py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500 touch-manipulation`}
                  />
                  {searchQuery && (
                    <button
                      onClick={clearSearch}
                      className={`absolute inset-y-0 ${isRtl ? "left-0 pl-3" : "right-0 pr-3"} flex items-center text-gray-400 hover:text-gray-600`}
                    >
                      <svg
                        className="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  )}
                </div>
              )}

              {/* Category Filter */}
              {showCategories && categories.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleCategorySelect(null)}
                    className={`px-4 py-2 text-sm font-medium rounded-full transition-colors duration-200 touch-manipulation ${
                      !selectedCategory
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    {t("allCategories")}
                  </button>
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => handleCategorySelect(category)}
                      className={`px-4 py-2 text-sm font-medium rounded-full transition-colors duration-200 touch-manipulation ${
                        selectedCategory === category
                          ? "bg-blue-600 text-white"
                          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* FAQ Items */}
          <div className={`space-y-${variant === "minimal" ? "0" : "4"}`}>
            {filteredFaqs.length > 0 ? (
              filteredFaqs.map((faq, index) => renderFAQItem(faq, index))
            ) : (
              <div className="text-center py-8 sm:py-12">
                <svg
                  className="w-12 h-12 text-gray-400 mx-auto mb-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z"
                    clipRule="evenodd"
                  />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {t("noResults")}
                </h3>
                <p className="text-gray-600 mb-4">
                  {searchQuery || selectedCategory
                    ? t("noResultsWithFilters")
                    : t("noFaqsAvailable")}
                </p>
                {(searchQuery || selectedCategory) && (
                  <button
                    onClick={clearSearch}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors duration-200 touch-manipulation"
                  >
                    {t("clearFilters")}
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Expand/Collapse All (for accordion variant) */}
          {variant === "accordion" && filteredFaqs.length > 2 && (
            <div className="text-center mt-8">
              <button
                onClick={handleExpandAll}
                className="inline-flex items-center px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors duration-200 touch-manipulation"
              >
                {expandedItems.size === filteredFaqs.length ? (
                  <>
                    <svg
                      className={`w-4 h-4 ${isRtl ? "ml-2" : "mr-2"}`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {t("collapseAll")}
                  </>
                ) : (
                  <>
                    <svg
                      className={`w-4 h-4 ${isRtl ? "ml-2" : "mr-2"}`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {t("expandAll")}
                  </>
                )}
              </button>
            </div>
          )}

          {/* Contact Support */}
          <div className="mt-12 text-center bg-blue-50 rounded-xl p-6 sm:p-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {t("stillHaveQuestions")}
            </h3>
            <p className="text-gray-600 mb-4">{t("contactSupportText")}</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href="/contact"
                className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200 touch-manipulation"
              >
                <svg
                  className={`w-4 h-4 ${isRtl ? "ml-2" : "mr-2"}`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
                {t("contactUs")}
              </a>
              <a
                href="tel:+982112345678"
                className="inline-flex items-center justify-center px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors duration-200 touch-manipulation"
              >
                <svg
                  className={`w-4 h-4 ${isRtl ? "ml-2" : "mr-2"}`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                </svg>
                {t("callUs")}
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default memo(LandingFAQ);

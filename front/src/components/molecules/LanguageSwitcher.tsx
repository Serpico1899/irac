"use client";

import { useState, useRef, useEffect } from "react";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/lib/navigation";
import { getLanguageName, getOppositeLocale, type Locale } from "@/lib/i18n";
import { switchLocale } from "@/lib/navigation";

interface LanguageSwitcherProps {
  className?: string;
  showLabel?: boolean;
  variant?: "dropdown" | "toggle" | "buttons";
}

export function LanguageSwitcher({
  className = "",
  showLabel = true,
  variant = "dropdown",
}: LanguageSwitcherProps) {
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations("Common");

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLanguageName = getLanguageName(locale);
  const oppositeLocale = getOppositeLocale(locale);
  const oppositeLanguageName = getLanguageName(oppositeLocale);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  const handleLocaleSwitch = (newLocale: Locale) => {
    const newPath = switchLocale(pathname, newLocale);
    router.push(newPath);
    setIsOpen(false);
  };

  const baseClasses = `
    inline-flex items-center justify-center
    text-sm font-medium
    transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
    ${className}
  `;

  if (variant === "toggle") {
    return (
      <button
        onClick={() => handleLocaleSwitch(oppositeLocale)}
        className={`
          ${baseClasses}
          px-3 py-2
          bg-background hover:bg-gray-50
          border border-gray-300 hover:border-gray-400
          rounded-md
          text-gray-700 hover:text-gray-900
          shadow-sm hover:shadow
        `}
        title={`${t("switchTo")} ${oppositeLanguageName}`}
      >
        <span className="flex items-center space-x-2 space-x-reverse">
          {showLabel && (
            <span className="hidden sm:inline">{oppositeLanguageName}</span>
          )}
          <span className="text-xs font-bold uppercase">{oppositeLocale}</span>
        </span>
      </button>
    );
  }

  if (variant === "buttons") {
    return (
      <div className={`flex rounded-lg border border-gray-300 ${className}`}>
        <button
          onClick={() => handleLocaleSwitch("fa")}
          className={`
            px-3 py-2 text-sm font-medium
            transition-all duration-200
            rounded-r-lg border-l border-gray-300
            ${
              locale === "fa"
                ? "bg-blue-600 text-background"
                : "bg-background text-gray-700 hover:bg-gray-50"
            }
          `}
        >
          {t("persian")}
        </button>
        <button
          onClick={() => handleLocaleSwitch("en")}
          className={`
            px-3 py-2 text-sm font-medium
            transition-all duration-200
            rounded-l-lg
            ${
              locale === "en"
                ? "bg-blue-600 text-background"
                : "bg-background text-gray-700 hover:bg-gray-50"
            }
          `}
        >
          EN
        </button>
      </div>
    );
  }

  // Default dropdown variant
  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          ${baseClasses}
          px-3 py-2
          bg-background hover:bg-gray-50
          border border-gray-300 hover:border-gray-400
          rounded-md
          text-gray-700 hover:text-gray-900
          shadow-sm hover:shadow
        `}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <span className="flex items-center space-x-2 space-x-reverse">
          {/* Language Icon */}
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
              d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
            />
          </svg>

          {showLabel && (
            <span className="hidden sm:inline">{currentLanguageName}</span>
          )}

          <span className="text-xs font-bold uppercase">{locale}</span>

          {/* Dropdown Arrow */}
          <svg
            className={`w-4 h-4 transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </span>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full mt-1 w-48 bg-background border border-gray-300 rounded-md shadow-lg z-50">
          <div className="py-1">
            <button
              onClick={() => handleLocaleSwitch("fa")}
              className={`
                w-full px-4 py-2 text-sm text-right
                transition-colors duration-200
                hover:bg-gray-50
                flex items-center justify-between
                ${locale === "fa" ? "bg-blue-50 text-blue-700" : "text-gray-700"}
              `}
            >
              <span>{t("persian")}</span>
              <span className="text-xs font-bold">FA</span>
              {locale === "fa" && (
                <svg
                  className="w-4 h-4 text-blue-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </button>

            <button
              onClick={() => handleLocaleSwitch("en")}
              className={`
                w-full px-4 py-2 text-sm text-right
                transition-colors duration-200
                hover:bg-gray-50
                flex items-center justify-between
                ${locale === "en" ? "bg-blue-50 text-blue-700" : "text-gray-700"}
              `}
            >
              <span>English</span>
              <span className="text-xs font-bold">EN</span>
              {locale === "en" && (
                <svg
                  className="w-4 h-4 text-blue-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

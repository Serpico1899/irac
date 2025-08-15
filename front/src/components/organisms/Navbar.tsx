"use client";

import { Fragment, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation"; // Corrected import
import { getAlternateLocaleUrl, getLocaleFromPathname } from "@/lib/navigation";

export const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const pathname = usePathname();

  // Get current locale and alternate locale info
  const currentLocale = getLocaleFromPathname(pathname);
  const alternateLocaleUrl = getAlternateLocaleUrl(pathname);
  const alternateLocaleLabel = currentLocale === "fa" ? "EN" : "فا";

  // Navigation items matching the screenshot
  const navItems = [
    { label: "صفحه اصلی", href: "/" },
    { label: "فضای کار اشتراکی", href: "/coworking" },
    { label: "مدرسه معماری ایرانی", href: "/school" },
    { label: "کارگاه معماری", href: "/workshop" },
    { label: "رسانه", href: "/media" },
    { label: "ارتباط با ما", href: "/contact" },
  ];

  return (
    <Fragment>
      {/* Main Navigation Header */}
      <header
        className={`
          z-50 w-full shadow-xl
          md:absolute md:top-4 md:left-4 md:right-4 md:bg-[#4ECDC4] md:rounded-2xl
          fixed top-0 inset-x-0 bg-white
        `}
        dir="rtl"
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-20">
            {/* Logo - Right side for RTL */}
            <div className="flex-shrink-0">
              <Link href="/" className="flex items-center">
                <div className="w-12 h-12 bg-white md:bg-white rounded-lg flex items-center justify-center shadow-sm">
                  {/* IRAC Logo - Geometric pattern */}
                  <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                    <rect
                      x="4"
                      y="4"
                      width="24"
                      height="24"
                      rx="2"
                      stroke="#4ECDC4"
                      strokeWidth="2"
                    />
                    <rect x="8" y="8" width="6" height="6" fill="#4ECDC4" />
                    <rect x="18" y="8" width="6" height="6" fill="#4ECDC4" />
                    <rect x="8" y="18" width="6" height="6" fill="#4ECDC4" />
                    <rect x="18" y="18" width="6" height="6" fill="#4ECDC4" />
                    <rect x="13" y="13" width="6" height="6" fill="#4ECDC4" />
                  </svg>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation - Center */}
            <nav className="hidden lg:flex items-center space-x-reverse space-x-10">
              {navItems.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-white hover:text-gray-100 transition-colors duration-200 text-sm font-medium px-3 py-2 rounded-lg hover:bg-white hover:bg-opacity-10 ${
                    pathname === link.href ? "bg-white bg-opacity-20" : ""
                  }`}
                >
                  {link.label}
                </Link>
              ))}

              {/* Language Switcher - Desktop only */}
              <Link
                href={alternateLocaleUrl}
                className="text-white hover:text-gray-100 transition-colors duration-200 text-sm font-medium px-3 py-2 rounded-lg hover:bg-white hover:bg-opacity-10 border border-white border-opacity-30"
              >
                {alternateLocaleLabel}
              </Link>
            </nav>

            {/* Right side actions - Left side for RTL */}
            <div className="flex items-center gap-4">
              {/* Shopping Cart */}
              <div className="relative">
                <button
                  onClick={() => setIsCartOpen(!isCartOpen)}
                  className={`
                    relative p-3 transition-colors rounded-lg
                    md:text-white md:hover:text-gray-100 md:hover:bg-white md:hover:bg-opacity-10
                    text-gray-600 hover:text-gray-800 hover:bg-gray-100
                  `}
                  aria-label="سبد خرید"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 9M17 13v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01"
                    />
                  </svg>
                  {/* Cart badge */}
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#4ECDC4] text-white text-xs rounded-full flex items-center justify-center font-bold">
                    0
                  </span>
                </button>

                {/* Cart Dropdown */}
                {isCartOpen && (
                  <div className="absolute left-0 top-full mt-3 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden">
                    <div className="p-8 text-center">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg
                          className="w-8 h-8 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 9M17 13v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01"
                          />
                        </svg>
                      </div>
                      <h3 className="text-lg font-bold text-gray-800 mb-2">
                        سبد خرید شما خالی است
                      </h3>
                      <p className="text-gray-600 text-sm mb-6">
                        هنوز محصولی به سبد خرید خود اضافه نکرده‌اید
                      </p>
                      <Link
                        href="/courses"
                        className="inline-block bg-[#4ECDC4] text-white px-6 py-3 rounded-xl hover:bg-[#45B7B8] transition-colors font-medium"
                        onClick={() => setIsCartOpen(false)}
                      >
                        مشاهده دوره‌ها
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* Login/Register Pill Button - Desktop only */}
              <Link
                href="/login"
                className={`
                  items-center gap-3 px-6 py-3 rounded-full transition-all duration-200 font-medium shadow-sm group
                  md:flex md:bg-white md:text-[#4ECDC4] md:hover:bg-gray-50
                  hidden
                `}
              >
                <svg
                  className="w-5 h-5 text-[#4ECDC4] group-hover:text-[#45B7B8] transition-colors"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                </svg>
                <span className="text-sm font-medium">ورود و عضویت</span>
              </Link>

              {/* Mobile login button */}
              <Link
                href="/login"
                className="md:hidden text-gray-600 hover:text-gray-800 p-2"
              >
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                </svg>
              </Link>

              {/* Mobile menu button */}
              <button
                className={`
                  lg:hidden p-3 rounded-lg transition-colors
                  md:text-white md:hover:text-gray-100 md:hover:bg-white md:hover:bg-opacity-10
                  text-gray-600 hover:text-gray-800 hover:bg-gray-100
                `}
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label="منوی موبایل"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  {isMobileMenuOpen ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  )}
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile Menu Panel */}
          {isMobileMenuOpen && (
            <div
              className={`
              lg:hidden py-6 border-t
              md:border-white md:border-opacity-20 md:bg-[#4ECDC4]
              border-gray-200 bg-white
            `}
            >
              <div className="space-y-2">
                {navItems.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`
                      block px-4 py-3 font-medium transition-colors rounded-lg mx-4
                      ${
                        pathname === link.href
                          ? "md:bg-white md:bg-opacity-20 md:text-white bg-gray-100 text-gray-900"
                          : "md:hover:bg-white md:hover:bg-opacity-10 md:text-white hover:bg-gray-50 text-gray-700"
                      }
                    `}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}

                {/* Mobile Language Switcher */}
                <Link
                  href={alternateLocaleUrl}
                  className={`
                    block px-4 py-3 font-medium transition-colors rounded-lg mx-4
                    md:text-white md:hover:bg-white md:hover:bg-opacity-10 md:border-white md:border-opacity-30
                    text-gray-700 hover:bg-gray-50 border border-gray-200
                  `}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {alternateLocaleLabel} - تغییر زبان
                </Link>

                {/* Mobile Login Button */}
                <div className="pt-4 px-4">
                  <Link
                    href="/login"
                    className={`
                      flex items-center justify-center gap-3 px-6 py-4 rounded-2xl transition-colors font-medium w-full
                      md:bg-white md:text-[#4ECDC4] md:hover:bg-gray-50
                      bg-[#4ECDC4] text-white hover:bg-[#45B7B8]
                    `}
                  >
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                    </svg>
                    <span>ورود و عضویت</span>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Cart backdrop */}
      {isCartOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-25 z-40"
          onClick={() => setIsCartOpen(false)}
        />
      )}
    </Fragment>
  );
};

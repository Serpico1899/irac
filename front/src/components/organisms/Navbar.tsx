"use client";

import { Fragment, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation"; // Corrected import
import { getAlternateLocaleUrl, getLocaleFromPathname } from "@/lib/navigation";

interface NavItem {
  label: string;
  href: string;
}

export const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const pathname = usePathname();
  // Get current locale and alternate locale info
  const currentLocale = getLocaleFromPathname(pathname);
  const alternateLocaleUrl = getAlternateLocaleUrl(pathname);
  const alternateLocaleLabel = currentLocale === "fa" ? "EN" : "فا";

  // Navigation items based on locale
  const navItems =
    currentLocale === "fa"
      ? [
          { label: "صفحه اصلی", href: "/" },
          { label: "دوره‌ها", href: "/courses" },
          { label: "کارگاه‌ها", href: "/workshops" },
          { label: "رسانه", href: "/media" },
        ]
      : [
          { label: "Home", href: "/" },
          { label: "Courses", href: "/courses" },
          { label: "Workshops", href: "/workshops" },
          { label: "Media", href: "/media" },
        ];

  return (
    <Fragment>
      {/* Header Wrapper for Centering */}
      <div className="sticky top-0 z-50 w-full px-8 xl:px-0 flex justify-center">
        {/* Main Navigation Header */}
        <header
          className="max-w-7xl w-full rounded-[25px] bg-white text-black shadow-xl"
          dir="rtl"
        >
          <div className="w-full px-6">
            <div className="flex items-center justify-between h-20">
              {/* Logo - Right side for RTL */}
              <div className="flex-shrink-0">
                <Link href="/" className="flex items-center">
                  <div className="w-12 h-12 bg-white md:bg-white rounded-lg flex items-center justify-center shadow-sm">
                    {/* IRAC Logo */}
                    <img
                      src="/images/Asset-1@20x-2-qotodtmpgaloexs25oampoe4trtwtus7grml1i9od0.png"
                      alt="IRAC Logo"
                      width="32"
                      height="32"
                      className="object-contain"
                    />
                  </div>
                </Link>
              </div>

              {/* Desktop Navigation - Center */}
              <nav className="hidden lg:flex items-center space-x-reverse space-x-10">
                {navItems.map((link: NavItem) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`text-black hover:text-gray-700 transition-colors duration-200 text-sm font-medium px-3 py-2 rounded-lg hover:bg-gray-100 ${
                      pathname === link.href ? "bg-gray-200" : ""
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>

              {/* Right side actions - Left side for RTL */}
              <div className="flex items-center gap-4">
                {/* Language Switcher */}
                <Link
                  href={alternateLocaleUrl}
                  className="p-3 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                  aria-label="تغییر زبان"
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
                      d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3s-4.5 4.03-4.5 9 2.015 9 4.5 9z M8.716 6.747A9.004 9.004 0 0112 3c1.39 0 2.685.31 3.716.747M8.716 6.747C9.747 6.31 11.04 6 12.5 6s2.753.31 3.784.747M8.716 6.747A9.004 9.004 0 003.284 14.253M15.284 6.747A9.004 9.004 0 0120.716 14.253M3.284 14.253A9.004 9.004 0 008.716 17.253M20.716 14.253A9.004 9.004 0 0115.284 17.253M8.716 17.253C9.747 17.69 11.04 18 12.5 18s2.753-.31 3.784-.747M15.284 17.253A9.004 9.004 0 0112 21"
                    />
                  </svg>
                </Link>

                {/* Shopping Cart */}
                <div className="relative">
                  <button
                    onClick={() => setIsCartOpen(!isCartOpen)}
                    className={`
                    relative p-3 transition-colors rounded-lg
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
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#168c95] text-white text-xs rounded-full flex items-center justify-center font-bold">
                      0
                    </span>
                  </button>

                  {/* Cart Dropdown */}
                  {isCartOpen && (
                    <div className="absolute left-0 top-full mt-3 w-96 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden">
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
                          className="inline-block bg-[#168c95] text-white px-6 py-3 rounded-xl hover:bg-[#0f7882] transition-colors font-medium"
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
                  md:flex md:bg-gray-100 md:text-[#168c95] md:hover:bg-gray-200
                  hidden
                `}
                >
                  <svg
                    className="w-5 h-5 text-[#168c95] group-hover:text-[#0f7882] transition-colors"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                  </svg>
                  <span className="text-sm font-medium">
                    {currentLocale === "fa" ? "ورود / ثبت نام" : "Login"}
                  </span>
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
              border-gray-200 bg-white
            `}
              >
                <div className="space-y-2">
                  {navItems.map((link: NavItem) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`
                      block px-4 py-3 font-medium transition-colors rounded-lg mx-4 border border-gray-200
                      ${
                        pathname === link.href
                          ? "bg-gray-200 text-gray-900"
                          : "hover:bg-gray-50 text-gray-700"
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
                    flex items-center gap-3 px-4 py-3 font-medium transition-colors rounded-lg mx-4 border border-gray-200
                    text-gray-700 hover:bg-gray-50
                  `}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3s-4.5 4.03-4.5 9 2.015 9 4.5 9z"
                      />
                    </svg>
                    {alternateLocaleLabel} - تغییر زبان
                  </Link>

                  {/* Mobile Login Button */}
                  <div className="pt-4 px-4">
                    <Link
                      href="/login"
                      className={`
                      flex items-center justify-center gap-3 px-6 py-4 rounded-2xl transition-colors font-medium w-full border border-gray-200
                      bg-[#168c95] text-white hover:bg-[#0f7882]
                    `}
                    >
                      <svg
                        className="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                      </svg>
                      <span>
                        {currentLocale === "fa" ? "ورود / ثبت نام" : "Login"}
                      </span>
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        </header>
      </div>
    </Fragment>
  );
};

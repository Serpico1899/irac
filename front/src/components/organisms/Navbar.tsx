"use client";

import { Fragment, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const pathname = usePathname();

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
      <div className="p-4">
        <header className="w-full bg-white shadow-lg rounded-[30px]" dir="rtl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-20">
              {/* Logo - Right side for RTL */}
              <div className="flex-shrink-0">
                <Link href="/" className="flex items-center">
                  <div className="w-12 h-12 flex items-center justify-center">
                    {/* IRAC Logo */}
                    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                      <rect
                        x="4"
                        y="4"
                        width="24"
                        height="24"
                        rx="6"
                        stroke="#29A5A1" // Primary Teal
                        strokeWidth="2"
                      />
                      <rect
                        x="8"
                        y="8"
                        width="6"
                        height="6"
                        rx="2"
                        fill="#29A5A1"
                      />
                      <rect
                        x="18"
                        y="8"
                        width="6"
                        height="6"
                        rx="2"
                        fill="#29A5A1"
                      />
                      <rect
                        x="8"
                        y="18"
                        width="6"
                        height="6"
                        rx="2"
                        fill="#29A5A1"
                      />
                      <rect
                        x="18"
                        y="18"
                        width="6"
                        height="6"
                        rx="2"
                        fill="#29A5A1"
                      />
                      <rect
                        x="13"
                        y="13"
                        width="6"
                        height="6"
                        rx="2"
                        fill="#29A5A1"
                      />
                    </svg>
                  </div>
                  <span className="font-bold text-xl ml-2 text-[#4A4A4A]">
                    IRAC
                  </span>
                </Link>
              </div>

              {/* Desktop Navigation - Center */}
              <nav className="hidden lg:flex items-center space-x-reverse space-x-8">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`text-base font-medium transition-colors duration-200 pb-2 ${
                      pathname === item.href
                        ? "text-[#3B5A9D] border-b-2 border-[#3B5A9D]" // Accent Indigo
                        : "text-[#4A4A4A] hover:text-[#3B5A9D]" // Dark Charcoal to Accent Indigo
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>

              {/* Right side actions - Left side for RTL */}
              <div className="flex items-center gap-4">
                {/* Shopping Cart */}
                <div className="relative">
                  <button
                    onClick={() => setIsCartOpen(!isCartOpen)}
                    className="relative p-2 text-[#4A4A4A] hover:text-[#3B5A9D] transition-colors"
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
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#29A5A1] text-white text-xs rounded-full flex items-center justify-center font-bold">
                      3
                    </span>
                  </button>
                </div>

                {/* Login/Register Button */}
                <Link
                  href="/login"
                  className="hidden sm:flex items-center gap-2 bg-[#3B5A9D] text-white px-5 py-2.5 rounded-full hover:bg-opacity-90 transition-all duration-200 font-medium text-sm"
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

                {/* Mobile menu button */}
                <button
                  className="lg:hidden p-2 text-[#4A4A4A] hover:text-[#3B5A9D]"
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
          </div>

          {/* Mobile Menu Panel */}
          {isMobileMenuOpen && (
            <div className="lg:hidden border-t border-gray-200 bg-white rounded-b-[30px]">
              <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                      pathname === item.href
                        ? "bg-[#3B5A9D] text-white"
                        : "text-[#4A4A4A] hover:bg-gray-100 hover:text-[#3B5A9D]"
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}
                <div className="pt-4 px-2 sm:hidden">
                  <Link
                    href="/login"
                    className="flex items-center justify-center gap-2 bg-[#3B5A9D] text-white px-5 py-3 rounded-full hover:bg-opacity-90 transition-all duration-200 font-medium w-full"
                    onClick={() => setIsMobileMenuOpen(false)}
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
        </header>
      </div>

      {/* Cart Dropdown - A simple placeholder */}
      {isCartOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-25 z-40"
          onClick={() => setIsCartOpen(false)}
        >
          <div
            className="absolute top-24 right-4 sm:right-auto sm:left-1/2 sm:-translate-x-1/2 w-80 bg-white rounded-lg shadow-xl p-6 text-center"
            onClick={(e) => e.stopPropagation()}
            dir="rtl"
          >
            <h3 className="text-lg font-bold text-[#4A4A4A] mb-2">سبد خرید</h3>
            <p className="text-gray-600 text-sm">سبد خرید شما خالی است.</p>
          </div>
        </div>
      )}
    </Fragment>
  );
};

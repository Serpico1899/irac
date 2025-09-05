"use client";

import { Fragment, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation"; // Corrected import
import { getAlternateLocaleUrl, getLocaleFromPathname } from "@/lib/navigation";
import CartButton from "@/components/molecules/CartButton";

interface NavItem {
  label: string;
  href: string;
}

export const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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
          { label: "درباره ما", href: "/about" },
          { label: "تماس با ما", href: "/contact" },
        ]
      : [
          { label: "Home", href: "/" },
          { label: "Courses", href: "/courses" },
          { label: "Workshops", href: "/workshops" },
          { label: "Media", href: "/media" },
          { label: "About Us", href: "/about" },
          { label: "Contact", href: "/contact" },
        ];

  return (
    <Fragment>
      {/* Header Wrapper for Centering */}
      <div className="sticky top-0 z-50 w-full px-8 xl:px-0 flex justify-center">
        {/* Main Navigation Header */}
        <header
          className="max-w-7xl w-full rounded-[25px] mt-5 bg-background text-black shadow-xl"
          dir="rtl"
        >
          <div className="w-full px-6">
            <div className="flex items-center justify-between h-20">
              {/* Logo - Right side for RTL */}
              <div className="flex-shrink-0">
                <Link href="/" className="flex items-center">
                  <div className="w-12 h-12 bg-background md:bg-background rounded-lg flex items-center justify-center shadow-sm">
                    {/* IRAC Logo */}
                    <Image
                      src="/images/Asset-1@20x-2-qotodtmpgaloexs25oampoe4trtwtus7grml1i9od0.png"
                      alt="IRAC Logo"
                      width={32}
                      height={32}
                      className="object-contain"
                    />
                  </div>
                </Link>
              </div>

              {/* Desktop Navigation - Center */}
              <nav className="hidden lg:flex items-center space-x-10">
                {navItems.map((link: NavItem) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`text-text hover:text-primary-dark transition-colors duration-200 text-base font-medium px-3 py-2 rounded-lg hover:bg-background-primary ${
                      pathname === link.href ? "bg-background-primary" : ""
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>

              {/* Right side actions - Left side for RTL */}
              <div className="flex items-center gap-4 max-[345px]:gap-1">
                {/* Language Switcher */}
                <Link
                  href={alternateLocaleUrl}
                  className="p-3 text-text-primary hover:text-text hover:bg-background-primary rounded-lg transition-colors max-lg:hidden"
                  aria-label="تغییر زبان"
                >
                  <Image
                    src="/icons/language.svg"
                    alt="Language"
                    width={24}
                    height={24}
                    className="w-6 h-6"
                  />
                </Link>

                {/* Shopping Cart */}
                <CartButton
                  variant="ghost"
                  size="md"
                  className="text-text-primary hover:text-text hover:bg-background-primary"
                />

                {/* Login/Register Pill Button - Desktop only */}
                <Link
                  href="/login"
                  className={`
                  items-center gap-3 px-6 py-3 rounded-full transition-all duration-200 font-medium shadow-sm group
                  md:flex md:bg-background-secondary md:text-primary md:hover:bg-background-darkest
                  hidden
                `}
                >
                  <svg
                    className="w-5 h-5 text-primary group-hover:text-primary-dark transition-colors"
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
                  className="md:hidden text-text-primary hover:text-text hover:bg-background-primary rounded-lg p-2"
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
                  text-text-primary hover:text-text hover:bg-background-primary
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
              border-background-primary bg-background
            `}
              >
                <div className="space-y-2">
                  {navItems.map((link: NavItem) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`
                      block px-4 py-3 font-medium transition-colors rounded-lg mx-4 border border-background-darkest
                      ${
                        pathname === link.href
                          ? "bg-background-primary text-primary-dark border-text-lightest"
                          : "hover:bg-background-primary hover:text-primary-dark text-text-primary hover:border-text-lightest"
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
                    flex items-center gap-3 px-4 py-3 font-medium transition-colors rounded-lg mx-4 border border-background-darkest
                    text-text-primary hover:bg-background-primary hover:text-primary-dark hover:border-text-lightest
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
                      flex items-center justify-center gap-3 px-6 py-4 rounded-2xl transition-colors font-medium w-full border border-background-primary
                      bg-primary text-background hover:bg-primary-dark
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

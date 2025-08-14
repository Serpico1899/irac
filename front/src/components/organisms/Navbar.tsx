"use client";

import { Fragment, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { IconLogo } from "../atoms/Icons";
import { useAuth } from "@/context/AuthContext";

// Define the shape of our navigation links
type NavLink = {
  label: string;
  href: string;
};

// Define the props our Navbar will receive
type NavbarProps = {
  navigation: NavLink[];
  dropdownLinks: NavLink[];
};

export const Navbar = ({ navigation, dropdownLinks }: NavbarProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isAuthenticated, userLevel, logout } = useAuth();
  const t = useTranslations("Navbar");
  const pathname = usePathname();

  return (
    <Fragment>
      <header className="sticky top-4 z-50 max-w-5xl mx-auto rounded-full bg-white/80 backdrop-blur-sm shadow-lg">
        <div className="mx-auto flex max-w-7xl items-center justify-between p-4">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center gap-2">
              <IconLogo />
              <span className="hidden font-bold sm:inline">IRAC</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-x-6 md:flex">
            {navigation.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="relative py-2 text-sm font-medium transition-colors hover:text-gray-300"
              >
                {link.label}
                <span
                  className={`absolute bottom-0 start-0 w-full h-0.5 bg-accent transform transition-transform duration-300 ${
                    pathname === link.href
                      ? "scale-x-100"
                      : "scale-x-0 group-hover:scale-x-100"
                  }`}
                ></span>
              </Link>
            ))}

            {/* Dropdown Menu */}
            <div className="relative group">
              <button className="flex items-center gap-1 py-2 text-sm font-medium transition-colors hover:text-gray-300">
                <span>{t("dropdownTitle")}</span>
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              <div className="absolute start-0 mt-2 w-48 rounded-md bg-white text-gray-800 shadow-lg opacity-0 invisible group-hover:visible group-hover:opacity-100 transition-all duration-300 z-10">
                {dropdownLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="block px-4 py-2 text-sm hover:bg-gray-100 text-start"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          </nav>

          {/* Auth and Mobile Toggle */}
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2">
              {isAuthenticated ? (
                <>
                  {(userLevel === "Ghost" ||
                    userLevel === "Manager" ||
                    userLevel === "Editor") && (
                    <Link
                      href="/admin"
                      className="px-3 py-2 text-sm font-medium rounded-md hover:bg-primary-dark"
                    >
                      {t("adminPanel")}
                    </Link>
                  )}
                  {userLevel === "Normal" && (
                    <Link
                      href="/user"
                      className="px-3 py-2 text-sm font-medium rounded-md hover:bg-primary-dark"
                    >
                      {t("userPanel")}
                    </Link>
                  )}
                  <button
                    onClick={logout}
                    className="px-3 py-2 text-sm font-medium rounded-md hover:bg-red-700"
                  >
                    {t("logout")}
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  className="px-3 py-2 text-sm font-medium rounded-md bg-accent hover:bg-accent-dark" // Assuming accent-dark is defined in your theme
                >
                  {t("login")}
                </Link>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label={t("openMenu")}
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu Panel */}
        <div className={`md:hidden ${isMobileMenuOpen ? "block" : "hidden"}`}>
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-primary-dark">
            {navigation.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-primary"
              >
                {link.label}
              </Link>
            ))}
            {/* You can add dropdown links and auth links here as well for mobile */}
          </div>
        </div>
      </header>
    </Fragment>
  );
};

"use client";

import { useState, useEffect } from "react";
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

// We define the icons separately to keep them out of the JSON files.
// The key should match the `href` from your JSON file.
const iconMap: Record<string, React.ReactNode> = {
  "/": (
    <svg
      className="w-4 h-4"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M3 12L5 10M5 10L12 3L19 10M5 10V20C5 20.5523 5.44772 21 6 21H9M19 10L21 12M19 10V20C19 20.5523 18.5523 21 18 21H15M9 21C9.55228 21 10 20.5523 10 20V16C10 15.4477 10.4477 15 11 15H13C13.5523 15 14 15.4477 14 16V20C14 20.5523 14.4477 21 15 21M9 21H15"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  "/charts/overall": (
    <svg
      className="w-4 h-4"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M9 20l-5.447-17.916m0 0A1 1 0 013.465 1H4.5a1 1 0 011 .97V2m13.5 8A8.5 8.5 0 015.5 10M16 19l5-5m0 0l-5-5m5 5H9"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  "/chatbot": (
    <svg
      className="w-4 h-4"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M8 10.5h8m-8 3.5h5.5m-9-10h14a2 2 0 012 2v10a2 2 0 01-2 2h-4l-4 4v-4H4a2 2 0 01-2-2V6a2 2 0 012-2z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
};

export const Navbar = ({ navigation, dropdownLinks }: NavbarProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { isAuthenticated, userLevel, logout } = useAuth();
  const t = useTranslations("Navbar"); // Hook to get translations
  const pathname = usePathname(); // Hook to find the active page

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white bg-opacity-90 backdrop-blur-sm shadow-lg py-2"
          : "bg-gradient-to-b from-white to-transparent py-4"
      } border-b border-gray-100`}
    >
      <div className="mx-auto max-w-7xl flex items-center justify-between px-6 relative">
        {/* Logo */}
        <div className="text-xl font-bold transform transition-all duration-500 hover:scale-105">
          <Link href="/" className="flex items-center gap-2">
            <IconLogo />
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-x-8">
          {navigation.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="group flex items-center gap-2 text-gray-700 hover:text-indigo-600 transition-all duration-300"
            >
              <span className="transform transition-all duration-300 group-hover:scale-110 text-indigo-500">
                {iconMap[link.href]}
              </span>
              <span className="relative py-2">
                {link.label}
                <span
                  className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-600 to-indigo-400 transform transition-transform duration-300 ${
                    pathname === link.href
                      ? "scale-x-100"
                      : "scale-x-0 group-hover:scale-x-100"
                  }`}
                ></span>
              </span>
            </Link>
          ))}

          {/* Dropdown Menu */}
          <div className="relative group">
            <button className="flex items-center gap-2 text-gray-700 hover:text-indigo-600 transition-all duration-300">
              {/* "More" icon ... */}
              <span className="relative py-2">{t("dropdownTitle")}</span>
            </button>
            <div className="absolute start-0 mt-2 w-52 bg-white rounded-xl overflow-hidden shadow-xl opacity-0 invisible group-hover:visible group-hover:opacity-100 transform group-hover:translate-y-0 translate-y-2 transition-all duration-300 z-10 border border-gray-100">
              {dropdownLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block px-5 py-3 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors duration-200"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </nav>

        {/* User Auth Links */}
        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-4">
            {isAuthenticated ? (
              <>
                {(userLevel === "Ghost" ||
                  userLevel === "Manager" ||
                  userLevel === "Editor") && (
                  <Link
                    href="/admin"
                    className="flex items-center gap-1.5 px-4 py-2 text-gray-700 hover:text-indigo-600 rounded-lg transition-all duration-300 hover:bg-indigo-50"
                  >
                    {t("adminPanel")}
                  </Link>
                )}
                {userLevel === "Normal" && (
                  <Link
                    href="/user"
                    className="flex items-center gap-1.5 px-4 py-2 text-gray-700 hover:text-indigo-600 rounded-lg transition-all duration-300 hover:bg-indigo-50"
                  >
                    {t("userPanel")}
                  </Link>
                )}
                <button
                  onClick={logout}
                  className="flex items-center gap-1.5 px-4 py-2 text-gray-700 hover:text-rose-600 rounded-lg transition-all duration-300 hover:bg-rose-50"
                >
                  {t("logout")}
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-1.5 px-4 py-2 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-all duration-300"
              >
                {t("login")}
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-gray-800 hover:text-indigo-600 focus:outline-none"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label={isMobileMenuOpen ? t("closeMenu") : t("openMenu")}
          >
            {/* Hamburger Icon SVG */}
          </button>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      <div className={`md:hidden ${isMobileMenuOpen ? "block" : "hidden"}`}>
        {/* The mobile menu would be built here, mapping over the same props */}
      </div>
    </header>
  );
};

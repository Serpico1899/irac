"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { getLocaleFromPathname } from "@/lib/navigation";

// Define translation structure
interface FooterTranslations {
  Footer: {
    aboutTitle: string;
    aboutText: string;
    quickLinksTitle: string;
    quickLinks: Array<{
      label: string;
      href: string;
    }>;
    contactTitle: string;
    contactAddress: string;
    contactEmail: string;
    contactPhone: string;
    copyright: string;
  };
}

// Import translations
const enTranslations: FooterTranslations = require("@/i18n/en.json");
const faTranslations: FooterTranslations = require("@/i18n/fa.json");

const Footer = () => {
  const pathname = usePathname();
  const locale = getLocaleFromPathname(pathname);
  const translations = locale === "fa" ? faTranslations : enTranslations;
  const currentYear = new Date().getFullYear();

  const { Footer: t } = translations;

  return (
    <footer
      className="bg-[#168c95] text-white"
      dir={locale === "fa" ? "rtl" : "ltr"}
    >
      <div className="max-w-7xl mx-auto px-6 py-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* About Section */}
          <div className="lg:col-span-1">
            <div className="mb-8">
              <Link href="/" className="flex items-center mb-6">
                <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center shadow-lg">
                  <img
                    src="/images/Asset-1@20x-2-qotodtmpgaloexs25oampoe4trtwtus7grml1i9od0.png"
                    alt="IRAC Logo"
                    width="40"
                    height="40"
                    className="object-contain"
                  />
                </div>
                <span className="ml-3 mr-3 text-2xl font-bold text-white">
                  {locale === "fa" ? "ایراک" : "IRAC"}
                </span>
              </Link>
            </div>

            <h3 className="text-xl font-bold mb-4 text-[#cea87a]">
              {t.aboutTitle}
            </h3>
            <p className="text-gray-300 leading-relaxed text-base">
              {t.aboutText}
            </p>
          </div>

          {/* Quick Links Section */}
          <div className="lg:col-span-1">
            <h3 className="text-xl font-bold mb-6 text-[#cea87a]">
              {t.quickLinksTitle}
            </h3>
            <ul className="space-y-4 md:space-y-4 max-md:flex max-md:gap-5">
              {t.quickLinks.map((link, index) => (
                <li key={index}>
                  <Link
                    href={link.href}
                    className="text-gray-300 hover:text-[#cea87a] transition-colors duration-200 flex items-center group"
                  >
                    <svg
                      className="w-4 h-4 text-[#cea87a] opacity-0 group-hover:opacity-100 transition-opacity duration-200 mr-2 ml-2 hidden min-[360px]:block max-md:hidden"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d={locale === "fa" ? "M15 19l-7-7 7-7" : "M9 5l7 7-7 7"}
                      />
                    </svg>
                    <span className="text-base">{link.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Section */}
          <div className="lg:col-span-1">
            <h3 className="text-xl font-bold mb-6 text-[#cea87a]">
              {t.contactTitle}
            </h3>
            <div className="space-y-4">
              {/* Address */}
              <div className="flex items-start space-x-3 space-x-reverse min-[610px]:flex min-[610px]:gap-[15px]">
                <div className="flex-shrink-0">
                  <svg
                    className="w-6 h-6 text-[#cea87a]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </div>
                <p className="text-gray-300 text-base">{t.contactAddress}</p>
              </div>

              {/* Email */}
              <div className="flex items-center space-x-3 ">
                <div className="flex-shrink-0">
                  <svg
                    className="w-6 h-6 text-[#cea87a]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <a
                  href={`mailto:${t.contactEmail.replace("Email: ", "").replace("ایمیل: ", "")}`}
                  className="text-gray-300 hover:text-[#cea87a] transition-colors duration-200 text-base"
                >
                  {t.contactEmail}
                </a>
              </div>

              {/* Phone */}
              <div className="flex items-center space-x-3 ">
                <div className="flex-shrink-0">
                  <svg
                    className="w-6 h-6 text-[#cea87a]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                </div>
                <a
                  href={`tel:${t.contactPhone.replace("Phone: ", "").replace("تلفن: ", "").replace(/\s/g, "")}`}
                  className="text-gray-300 hover:text-[#cea87a] transition-colors duration-200 text-base"
                >
                  {t.contactPhone}
                </a>
              </div>
            </div>

            {/* Social Media Links */}
            <div className="mt-8">
              <h4 className="text-lg font-semibold mb-4 text-white">
                {locale === "fa" ? "شبکه‌های اجتماعی" : "Follow Us"}
              </h4>
              <div className="flex space-x-4">
                <a
                  href="#"
                  className="text-gray-400 hover:text-[#cea87a] transition-colors duration-200"
                  aria-label="Instagram"
                >
                  <svg
                    className="w-6 h-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987c6.62 0 11.987-5.367 11.987-11.987C24.014 5.367 18.637.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.611-3.197-1.559-.748-.948-1.297-2.27-1.297-3.688 0-1.418.549-2.74 1.297-3.688.749-.948 1.9-1.559 3.197-1.559s2.448.611 3.197 1.559c.748.948 1.297 2.27 1.297 3.688 0 1.418-.549 2.74-1.297 3.688-.749.948-1.9 1.559-3.197 1.559zm7.138 0c-1.297 0-2.448-.611-3.197-1.559-.748-.948-1.297-2.27-1.297-3.688 0-1.418.549-2.74 1.297-3.688.749-.948 1.9-1.559 3.197-1.559s2.448.611 3.197 1.559c.748.948 1.297 2.27 1.297 3.688 0 1.418-.549 2.74-1.297 3.688-.749.948-1.9 1.559-3.197 1.559z" />
                  </svg>
                </a>
                <a
                  href="#"
                  className="text-gray-400 hover:text-[#cea87a] transition-colors duration-200"
                  aria-label="Twitter"
                >
                  <svg
                    className="w-6 h-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                  </svg>
                </a>
                <a
                  href="#"
                  className="text-gray-400 hover:text-[#cea87a] transition-colors duration-200"
                  aria-label="LinkedIn"
                >
                  <svg
                    className="w-6 h-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                </a>
                <a
                  href="#"
                  className="text-gray-400 hover:text-[#cea87a] transition-colors duration-200"
                  aria-label="Telegram"
                >
                  <svg
                    className="w-6 h-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Border */}
        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            {/* Copyright */}
            <div className="text-gray-400 text-sm mb-4 md:mb-0">
              {t.copyright.replace("{currentYear}", currentYear.toString())}
            </div>

            {/* Additional Links */}
            <div className="flex space-x-6 text-sm">
              <Link
                href="/privacy"
                className="text-gray-400 hover:text-[#cea87a] transition-colors duration-200"
              >
                {locale === "fa" ? "حریم خصوصی" : "Privacy Policy"}
              </Link>
              <Link
                href="/terms"
                className="text-gray-400 hover:text-[#cea87a] transition-colors duration-200"
              >
                {locale === "fa" ? "شرایط استفاده" : "Terms of Service"}
              </Link>
              <Link
                href="/contact"
                className="text-gray-400 hover:text-[#cea87a] transition-colors duration-200"
              >
                {locale === "fa" ? "تماس با ما" : "Contact"}
              </Link>
            </div>
          </div>

          {/* Back to Top Button */}
          <div className="flex justify-center mt-8">
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="bg-[#168c95] hover:bg-[#cea87a] text-white p-3 rounded-full transition-colors duration-200 shadow-lg"
              aria-label={locale === "fa" ? "بازگشت به بالا" : "Back to top"}
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
                  strokeWidth={2}
                  d="M5 10l7-7m0 0l7 7m-7-7v18"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

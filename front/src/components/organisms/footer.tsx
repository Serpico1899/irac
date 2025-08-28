"use client";

import Link from "next/link";
import Image from "next/image";
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
import enTranslations from "@/i18n/en.json";
import faTranslations from "@/i18n/fa.json";

const Footer = () => {
  const pathname = usePathname();
  const locale = getLocaleFromPathname(pathname);
  const translations = locale === "fa" ? faTranslations : enTranslations;
  const currentYear = new Date().getFullYear();

  const { Footer: t } = translations;

  return (
    <footer
      className="bg-primary-dark text-white"
      dir={locale === "fa" ? "rtl" : "ltr"}
    >
      <div className="max-w-7xl mx-auto px-6 py-16">
        {/* Main Footer Content */}
        <div className="flex flex-wrap gap-8 mb-12">
          {/* About Section */}
          <div className="grow lg:basis-3/10 ">
            <div className="mb-8">
              <Link href="/" className="inline-flex items-center ">
                <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center shadow-lg">
                  <Image
                    src="/images/Asset-1@20x-2-qotodtmpgaloexs25oampoe4trtwtus7grml1i9od0.png"
                    alt="IRAC Logo"
                    width={40}
                    height={40}
                    className="object-contain"
                  />
                </div>
                <span className="ml-3 mr-3 text-2xl font-bold text-white">
                  {locale === "fa" ? "ایراک" : "IRAC"}
                </span>
              </Link>
            </div>

            <h3 className="text-xl font-bold mb-4 text-accent">
              {t.aboutTitle}
            </h3>
            <p className="text-gray-300 leading-relaxed text-base">
              {t.aboutText}
            </p>
          </div>

          {/* Quick Links Section */}
          <div className="grow">
            <h3 className="text-xl font-bold mb-6 text-accent">
              {t.quickLinksTitle}
            </h3>
            <ul className="space-y-4 md:space-y-4 max-[428px]:flex max-[428px]:gap-5">
              {t.quickLinks.map((link, index) => (
                <li key={index}>
                  <Link
                    href={link.href}
                    className="text-gray-300 hover:text-accent transition-colors duration-200 flex items-center group"
                  >
                    <svg
                      className="w-4 h-4 text-accent opacity-0 group-hover:opacity-100 transition-opacity duration-200 mr-2 ml-2 hidden min-md:block max-md:hidden"
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
          <div className="grow">
            <h3 className="text-xl font-bold mb-6 text-accent">
              {t.contactTitle}
            </h3>
            <div className="space-y-4">
              {/* Address */}
              <div className="flex gap-0 items-start space-x-2 ">
                <div className="flex-shrink-0">
                  <svg
                    className="w-6 h-6 text-accent"
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
              <div className="flex items-center space-x-2 ">
                <div className="flex-shrink-0">
                  <svg
                    className="w-6 h-6 text-accent"
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
                  className="text-gray-300 hover:text-accent transition-colors duration-200 text-base"
                >
                  {t.contactEmail}
                </a>
              </div>

              {/* Phone */}
              <div className="flex items-center space-x-2 mb-4 ">
                <div className="flex-shrink-0">
                  <svg
                    className="w-6 h-6 text-accent"
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
                  className="text-gray-300 hover:text-accent transition-colors duration-200 text-base"
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
                  className="text-gray-400 hover:text-accent transition-colors duration-200"
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
                <a
                  href="#"
                  className="text-gray-400 hover:text-accent transition-colors duration-200"
                  aria-label="Instagram"
                >
                  <svg
                    className="w-6 h-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M12 18C15.3137 18 18 15.3137 18 12C18 8.68629 15.3137 6 12 6C8.68629 6 6 8.68629 6 12C6 15.3137 8.68629 18 12 18ZM12 16C14.2091 16 16 14.2091 16 12C16 9.79086 14.2091 8 12 8C9.79086 8 8 9.79086 8 12C8 14.2091 9.79086 16 12 16Z"
                    />
                    <path d="M18 5C17.4477 5 17 5.44772 17 6C17 6.55228 17.4477 7 18 7C18.5523 7 19 6.55228 19 6C19 5.44772 18.5523 5 18 5Z" />
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M1.65396 4.27606C1 5.55953 1 7.23969 1 10.6V13.4C1 16.7603 1 18.4405 1.65396 19.7239C2.2292 20.8529 3.14708 21.7708 4.27606 22.346C5.55953 23 7.23969 23 10.6 23H13.4C16.7603 23 18.4405 23 19.7239 22.346C20.8529 21.7708 21.7708 20.8529 22.346 19.7239C23 18.4405 23 16.7603 23 13.4V10.6C23 7.23969 23 5.55953 22.346 4.27606C21.7708 3.14708 20.8529 2.2292 19.7239 1.65396C18.4405 1 16.7603 1 13.4 1H10.6C7.23969 1 5.55953 1 4.27606 1.65396C3.14708 2.2292 2.2292 3.14708 1.65396 4.27606ZM13.4 3H10.6C8.88684 3 7.72225 3.00156 6.82208 3.0751C5.94524 3.14674 5.49684 3.27659 5.18404 3.43597C4.43139 3.81947 3.81947 4.43139 3.43597 5.18404C3.27659 5.49684 3.14674 5.94524 3.0751 6.82208C3.00156 7.72225 3 8.88684 3 10.6V13.4C3 15.1132 3.00156 16.2777 3.0751 17.1779C3.14674 18.0548 3.27659 18.5032 3.43597 18.816C3.81947 19.5686 4.43139 20.1805 5.18404 20.564C5.49684 20.7234 5.94524 20.8533 6.82208 20.9249C7.72225 20.9984 8.88684 21 10.6 21H13.4C15.1132 21 16.2777 20.9984 17.1779 20.9249C18.0548 20.8533 18.5032 20.7234 18.816 20.564C19.5686 20.1805 20.1805 19.5686 20.564 18.816C20.7234 18.5032 20.8533 18.0548 20.9249 17.1779C20.9984 16.2777 21 15.1132 21 13.4V10.6C21 8.88684 20.9984 7.72225 20.9249 6.82208C20.8533 5.94524 20.7234 5.49684 20.564 5.18404C20.1805 4.43139 19.5686 3.81947 18.816 3.43597C18.5032 3.27659 18.0548 3.14674 17.1779 3.0751C16.2777 3.00156 15.1132 3 13.4 3Z"
                    />
                  </svg>
                </a>
                <a
                  href="#"
                  className="text-gray-400 hover:text-accent transition-colors duration-200"
                  aria-label="Instagram"
                >
                  <svg
                    className="w-6 h-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M12 18C15.3137 18 18 15.3137 18 12C18 8.68629 15.3137 6 12 6C8.68629 6 6 8.68629 6 12C6 15.3137 8.68629 18 12 18ZM12 16C14.2091 16 16 14.2091 16 12C16 9.79086 14.2091 8 12 8C9.79086 8 8 9.79086 8 12C8 14.2091 9.79086 16 12 16Z"
                    />
                    <path d="M18 5C17.4477 5 17 5.44772 17 6C17 6.55228 17.4477 7 18 7C18.5523 7 19 6.55228 19 6C19 5.44772 18.5523 5 18 5Z" />
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M1.65396 4.27606C1 5.55953 1 7.23969 1 10.6V13.4C1 16.7603 1 18.4405 1.65396 19.7239C2.2292 20.8529 3.14708 21.7708 4.27606 22.346C5.55953 23 7.23969 23 10.6 23H13.4C16.7603 23 18.4405 23 19.7239 22.346C20.8529 21.7708 21.7708 20.8529 22.346 19.7239C23 18.4405 23 16.7603 23 13.4V10.6C23 7.23969 23 5.55953 22.346 4.27606C21.7708 3.14708 20.8529 2.2292 19.7239 1.65396C18.4405 1 16.7603 1 13.4 1H10.6C7.23969 1 5.55953 1 4.27606 1.65396C3.14708 2.2292 2.2292 3.14708 1.65396 4.27606ZM13.4 3H10.6C8.88684 3 7.72225 3.00156 6.82208 3.0751C5.94524 3.14674 5.49684 3.27659 5.18404 3.43597C4.43139 3.81947 3.81947 4.43139 3.43597 5.18404C3.27659 5.49684 3.14674 5.94524 3.0751 6.82208C3.00156 7.72225 3 8.88684 3 10.6V13.4C3 15.1132 3.00156 16.2777 3.0751 17.1779C3.14674 18.0548 3.27659 18.5032 3.43597 18.816C3.81947 19.5686 4.43139 20.1805 5.18404 20.564C5.49684 20.7234 5.94524 20.8533 6.82208 20.9249C7.72225 20.9984 8.88684 21 10.6 21H13.4C15.1132 21 16.2777 20.9984 17.1779 20.9249C18.0548 20.8533 18.5032 20.7234 18.816 20.564C19.5686 20.1805 20.1805 19.5686 20.564 18.816C20.7234 18.5032 20.8533 18.0548 20.9249 17.1779C20.9984 16.2777 21 15.1132 21 13.4V10.6C21 8.88684 20.9984 7.72225 20.9249 6.82208C20.8533 5.94524 20.7234 5.49684 20.564 5.18404C20.1805 4.43139 19.5686 3.81947 18.816 3.43597C18.5032 3.27659 18.0548 3.14674 17.1779 3.0751C16.2777 3.00156 15.1132 3 13.4 3Z"
                    />
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* Our Licenses Section */}
          <div className="flex flex-col items-center">
            <h3 className="text-xl font-bold mb-6 text-accent">
              {locale === "fa" ? "مجوزهای ما" : "Our Licenses"}
            </h3>
            <div className="flex flex-col gap-2.5 space-y-4 max-[534px]:flex-row max-[534px]:gap-5 max-[534px]:flex-wrap ">
              {/* IRAC Logo License */}
              <Link href="/">
                <Image
                  src="/images/logo.png"
                  alt={locale === "fa" ? "مجوز ایراک" : "IRAC License"}
                  width={48}
                  height={48}
                  className="w-12 h-12 object-contain"
                />
              </Link>

              {/* Samandehi License */}
              <Link href="/">
                <Image
                  src="/images/samandehi-logo.webp"
                  alt={
                    locale === "fa"
                      ? "نماد اعتماد الکترونیکی"
                      : "Electronic Trust Symbol"
                  }
                  width={48}
                  height={48}
                  className="w-12 h-12 object-contain"
                />
              </Link>
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
                className="text-gray-400 hover:text-accent transition-colors duration-200"
              >
                {locale === "fa" ? "حریم خصوصی" : "Privacy Policy"}
              </Link>
              <Link
                href="/terms"
                className="text-gray-400 hover:text-accent transition-colors duration-200"
              >
                {locale === "fa" ? "شرایط استفاده" : "Terms of Service"}
              </Link>
              <Link
                href="/contact"
                className="text-gray-400 hover:text-accent transition-colors duration-200"
              >
                {locale === "fa" ? "تماس با ما" : "Contact"}
              </Link>
            </div>
          </div>

          {/* Back to Top Button */}
          <div className="flex justify-center mt-8">
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="bg-primary hover:bg-accent max-md:bg-accent max-md:hover:bg-primary text-white p-3 rounded-full transition-colors duration-200 shadow-lg"
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

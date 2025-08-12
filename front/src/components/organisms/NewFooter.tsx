import React from "react";
import Link from "next/link";
import type { FooterTranslations } from "@/types"; // We might need to create this type later

type FooterProps = {
  translations: any; // Using 'any' for now for simplicity
};

export const Footer = ({ translations }: FooterProps) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white pt-12 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-right">
          {/* About Us Column */}
          <div>
            <h3 className="text-xl font-bold mb-4 border-b border-gray-700 pb-2">
              {translations.aboutTitle}
            </h3>
            <p className="text-gray-300 mb-4 text-sm leading-relaxed">
              {translations.aboutText}
            </p>
            <div className="flex justify-end space-x-4 space-x-reverse mt-4">
              {/* Social media icons can be added here if needed */}
            </div>
          </div>

          {/* Features Column */}
          <div>
            <h3 className="text-xl font-bold mb-4 border-b border-gray-700 pb-2">
              {translations.featuresTitle}
            </h3>
            <ul className="space-y-3 text-sm">
              {translations.featuresLinks.map((link: any) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-gray-300 hover:text-white transition flex items-center justify-end"
                  >
                    <span>{link.label}</span>
                    {/* Icons can be mapped here if needed */}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources Column */}
          <div>
            <h3 className="text-xl font-bold mb-4 border-b border-gray-700 pb-2">
              {translations.resourcesTitle}
            </h3>
            <ul className="space-y-3 text-sm">
              {translations.resourcesLinks.map((link: any) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-300 hover:text-white transition"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Us Column */}
          <div>
            <h3 className="text-xl font-bold mb-4 border-b border-gray-700 pb-2">
              {translations.contactTitle}
            </h3>
            <ul className="text-sm text-gray-300 space-y-2">
              <li>{translations.contactEmail}</li>
              <li>{translations.contactPhone}</li>
              <li>{translations.contactHours}</li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 text-center text-gray-500 text-sm">
          {translations.copyright.replace("{currentYear}", currentYear)}
        </div>
      </div>
    </footer>
  );
};

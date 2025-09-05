"use client";

import { useTranslations } from "next-intl";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

interface LandingHeroProps {
  type: "workshop" | "course";
  title: string;
  description: string;
  slug: string;
  instructor?: {
    name: string;
    image?: string;
    credentials?: string;
  };
  features?: string[];
  price?: {
    current: number;
    original?: number;
    currency: string;
  };
  rating?: {
    score: number;
    count: number;
  };
  students?: number;
  backgroundImage?: string;
  ctaText?: string;
  ctaSecondaryText?: string;
  locale: string;
}

export default function LandingHero({
  type,
  title,
  description,
  slug,
  instructor,
  features = [],
  price,
  rating,
  students,
  backgroundImage,
  ctaText,
  ctaSecondaryText,
  locale,
}: LandingHeroProps) {
  const t = useTranslations("landingHero");
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const defaultCtaText = ctaText || (type === "workshop" ? t("cta.reserveNow") : t("cta.enrollNow"));
  const defaultCtaSecondary = ctaSecondaryText || t("cta.learnMore");

  const primaryCtaLink = type === "workshop" ? `/workshops/${slug}/reserve` : `/courses/${slug}/enroll`;
  const secondaryCtaLink = type === "workshop" ? `/workshops/${slug}` : `/courses/${slug}`;

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-blue-900 via-blue-800 to-purple-900 min-h-[100vh] flex items-center">
      {/* Background Image */}
      {backgroundImage && (
        <div className="absolute inset-0 z-0">
          <Image
            src={backgroundImage}
            alt={title}
            fill
            className={`object-cover transition-opacity duration-1000 ${
              imageLoaded ? 'opacity-30' : 'opacity-0'
            }`}
            onLoad={() => setImageLoaded(true)}
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/80 via-blue-800/60 to-purple-900/80" />
        </div>
      )}

      {/* Animated Background Pattern */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-10 left-10 w-20 h-20 bg-white/5 rounded-full animate-pulse" />
        <div className="absolute top-32 right-16 w-32 h-32 bg-white/3 rounded-full animate-pulse animation-delay-1000" />
        <div className="absolute bottom-20 left-1/4 w-16 h-16 bg-white/4 rounded-full animate-pulse animation-delay-2000" />
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
          {/* Main Content */}
          <div className={`flex-1 text-center lg:text-${locale === 'fa' ? 'right' : 'left'} transition-all duration-1000 ${
            isVisible ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-8'
          }`}>
            {/* Type Badge */}
            <div className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white text-sm font-medium mb-4 sm:mb-6">
              <div className="w-2 h-2 bg-yellow-400 rounded-full mr-2 rtl:mr-0 rtl:ml-2" />
              {type === "workshop" ? t("types.workshop") : t("types.course")}
            </div>

            {/* Main Title */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 sm:mb-6 leading-tight">
              {title}
            </h1>

            {/* Description */}
            <p className="text-lg sm:text-xl text-gray-200 mb-6 sm:mb-8 max-w-3xl mx-auto lg:mx-0 leading-relaxed">
              {description}
            </p>

            {/* Key Features */}
            {features.length > 0 && (
              <div className="flex flex-wrap justify-center lg:justify-start gap-3 mb-6 sm:mb-8">
                {features.slice(0, 4).map((feature, index) => (
                  <div
                    key={index}
                    className="flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm rounded-lg text-white text-sm"
                  >
                    <svg
                      className="w-4 h-4 text-green-400 mr-2 rtl:mr-0 rtl:ml-2 flex-shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Stats */}
            <div className="flex flex-wrap justify-center lg:justify-start items-center gap-6 sm:gap-8 mb-8 sm:mb-10">
              {rating && (
                <div className="flex items-center text-white">
                  <div className="flex items-center mr-2 rtl:mr-0 rtl:ml-2">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className={`w-5 h-5 ${
                          i < Math.floor(rating.score) ? 'text-yellow-400' : 'text-gray-400'
                        }`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <span className="text-sm">
                    <span className="font-semibold">{rating.score}</span>
                    <span className="text-gray-300 mx-1">({rating.count} {t("stats.reviews")})</span>
                  </span>
                </div>
              )}

              {students && (
                <div className="flex items-center text-white">
                  <svg className="w-5 h-5 text-blue-300 mr-2 rtl:mr-0 rtl:ml-2" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                  </svg>
                  <span className="text-sm">
                    <span className="font-semibold">{students.toLocaleString()}</span>
                    <span className="text-gray-300 mx-1">{t("stats.students")}</span>
                  </span>
                </div>
              )}

              {price && (
                <div className="flex items-center text-white">
                  <div className="flex flex-col items-center sm:items-start">
                    <div className="flex items-center gap-2">
                      {price.original && price.original > price.current && (
                        <span className="text-sm text-gray-300 line-through">
                          {price.original.toLocaleString()} {price.currency}
                        </span>
                      )}
                      <span className="text-xl font-bold text-yellow-400">
                        {price.current.toLocaleString()} {price.currency}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link
                href={primaryCtaLink}
                className="group inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 text-center min-h-[56px] touch-manipulation"
              >
                <span className="mr-2 rtl:mr-0 rtl:ml-2">{defaultCtaText}</span>
                <svg
                  className={`w-5 h-5 transform group-hover:translate-x-1 rtl:group-hover:translate-x-0 rtl:group-hover:-translate-x-1 transition-transform duration-300 ${locale === 'fa' ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>

              <Link
                href={secondaryCtaLink}
                className="inline-flex items-center justify-center px-8 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white font-semibold rounded-xl border border-white/20 hover:border-white/30 transition-all duration-300 text-center min-h-[56px] touch-manipulation"
              >
                {defaultCtaSecondary}
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center lg:justify-start items-center gap-4 mt-8 text-sm text-gray-300">
              <div className="flex items-center">
                <svg className="w-4 h-4 text-green-400 mr-1 rtl:mr-0 rtl:ml-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>{t("trust.certificateIncluded")}</span>
              </div>
              <div className="flex items-center">
                <svg className="w-4 h-4 text-green-400 mr-1 rtl:mr-0 rtl:ml-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>{t("trust.moneyBackGuarantee")}</span>
              </div>
              <div className="flex items-center">
                <svg className="w-4 h-4 text-green-400 mr-1 rtl:mr-0 rtl:ml-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>{t("trust.lifetimeSupport")}</span>
              </div>
            </div>
          </div>

          {/* Instructor Card (if provided) */}
          {instructor && (
            <div className={`w-full lg:w-80 flex-shrink-0 transition-all duration-1000 delay-300 ${
              isVisible ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-8'
            }`}>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <div className="text-center">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full overflow-hidden bg-gray-300">
                    {instructor.image ? (
                      <Image
                        src={instructor.image}
                        alt={instructor.name}
                        width={80}
                        height={80}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                        <span className="text-white text-xl font-bold">
                          {instructor.name.charAt(0)}
                        </span>
                      </div>
                    )}
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-1">
                    {instructor.name}
                  </h3>
                  {instructor.credentials && (
                    <p className="text-sm text-gray-300 mb-4">
                      {instructor.credentials}
                    </p>
                  )}
                  <div className="text-xs text-gray-400">
                    {t("instructor.yourInstructor")}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white/50 rounded-full mt-2 animate-pulse" />
        </div>
      </div>
    </section>
  );
}

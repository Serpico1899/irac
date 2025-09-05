"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { useState, useEffect } from "react";
import {
  trackCTAClick,
  trackLandingPageConversion,
} from "@/lib/analytics/tracking";
import Image from "next/image";

interface CTAButton {
  text: string;
  href: string;
  variant: "primary" | "secondary" | "outline";
  icon?: "arrow" | "play" | "download" | "phone" | "mail" | "cart";
  external?: boolean;
}

interface TrustIndicator {
  icon: "guarantee" | "secure" | "support" | "certificate" | "rating";
  text: string;
}

interface CountdownProps {
  endDate: Date;
  labels: {
    days: string;
    hours: string;
    minutes: string;
    seconds: string;
  };
}

interface LandingCTAProps {
  title: string;
  subtitle?: string;
  description?: string;
  buttons: CTAButton[];
  locale: string;
  variant?: "hero" | "section" | "sticky" | "popup" | "banner";
  urgency?: {
    text: string;
    countdown?: CountdownProps;
  };
  trustIndicators?: TrustIndicator[];
  socialProof?: {
    text: string;
    count?: number;
    avatars?: string[];
  };
  backgroundColor?:
    | "gradient"
    | "blue"
    | "green"
    | "purple"
    | "white"
    | "gray"
    | "transparent";
  backgroundImage?: string;
  showPattern?: boolean;
  centered?: boolean;
  sticky?: boolean;
  animation?: boolean;
}

export default function LandingCTA({
  title,
  subtitle,
  description,
  buttons,
  locale,
  variant = "section",
  urgency,
  trustIndicators,
  socialProof,
  backgroundColor = "gradient",
  backgroundImage,
  showPattern = true,
  centered = true,
  sticky = false,
  animation = true,
}: LandingCTAProps) {
  const t = useTranslations("cta");
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  } | null>(null);
  const [isVisible, setIsVisible] = useState(!animation);

  const isRtl = locale === "fa";

  // Countdown timer logic
  useEffect(() => {
    if (urgency?.countdown) {
      const calculateTimeLeft = () => {
        const difference =
          urgency.countdown!.endDate.getTime() - new Date().getTime();

        if (difference > 0) {
          return {
            days: Math.floor(difference / (1000 * 60 * 60 * 24)),
            hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
            minutes: Math.floor((difference / 1000 / 60) % 60),
            seconds: Math.floor((difference / 1000) % 60),
          };
        }
        return null;
      };

      setTimeLeft(calculateTimeLeft());

      const timer = setInterval(() => {
        setTimeLeft(calculateTimeLeft());
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [urgency]);

  // Animation trigger
  useEffect(() => {
    if (animation) {
      const timer = setTimeout(() => setIsVisible(true), 100);
      return () => clearTimeout(timer);
    }
  }, [animation]);

  const backgroundClasses = {
    gradient: "bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800",
    blue: "bg-blue-600",
    green: "bg-green-600",
    purple: "bg-purple-600",
    white: "bg-white",
    gray: "bg-gray-100",
    transparent: "bg-transparent",
  };

  const getButtonIcon = (icon?: string) => {
    switch (icon) {
      case "arrow":
        return (
          <svg
            className={`w-4 h-4 transform transition-transform duration-300 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 ${isRtl ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 8l4 4m0 0l-4 4m4-4H3"
            />
          </svg>
        );
      case "play":
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
              clipRule="evenodd"
            />
          </svg>
        );
      case "download":
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        );
      case "phone":
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
          </svg>
        );
      case "mail":
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
            <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
          </svg>
        );
      case "cart":
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
          </svg>
        );
      default:
        return null;
    }
  };

  const getTrustIcon = (icon: string) => {
    switch (icon) {
      case "guarantee":
        return (
          <svg
            className="w-5 h-5 text-green-500"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
        );
      case "secure":
        return (
          <svg
            className="w-5 h-5 text-blue-500"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
        );
      case "support":
        return (
          <svg
            className="w-5 h-5 text-purple-500"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-2 0c0 .993-.241 1.929-.668 2.754l-1.524-1.525a3.997 3.997 0 00.078-2.183l1.562-1.562C17.759 8.071 18 9.007 18 10zM9.5 14.25A3.5 3.5 0 0113 10.75a1 1 0 112 0 5.5 5.5 0 01-11 0 1 1 0 012 0 3.5 3.5 0 003.5 3.5z" />
          </svg>
        );
      case "certificate":
        return (
          <svg
            className="w-5 h-5 text-yellow-500"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        );
      case "rating":
        return (
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <svg
                key={i}
                className="w-4 h-4 text-yellow-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
        );
      default:
        return null;
    }
  };

  const containerClasses = `
    ${sticky ? "fixed bottom-0 left-0 right-0 z-50 shadow-2xl" : "relative"}
    ${backgroundClasses[backgroundColor]}
    ${variant === "hero" ? "min-h-[60vh] flex items-center" : ""}
    ${variant === "banner" ? "py-4" : "py-8 sm:py-12 lg:py-16"}
    ${animation ? `transition-all duration-1000 ${isVisible ? "opacity-100 transform translate-y-0" : "opacity-0 transform translate-y-8"}` : ""}
  `.trim();

  const contentClasses = `
    max-w-7xl mx-auto px-4 sm:px-6 lg:px-8
    ${centered ? "text-center" : `text-${isRtl ? "right" : "left"}`}
    ${variant === "hero" ? "flex flex-col justify-center min-h-full" : ""}
  `.trim();

  const textColor =
    backgroundColor === "white" ||
    backgroundColor === "gray" ||
    backgroundColor === "transparent"
      ? "text-gray-900"
      : "text-white";

  const subtextColor =
    backgroundColor === "white" ||
    backgroundColor === "gray" ||
    backgroundColor === "transparent"
      ? "text-gray-600"
      : "text-gray-200";

  return (
    <section className={containerClasses}>
      {/* Background Image */}
      {backgroundImage && (
        <div className="absolute inset-0 z-0">
          <Image
            src={backgroundImage}
            alt="Background"
            fill
            className="object-cover opacity-20"
            priority={variant === "hero"}
          />
        </div>
      )}

      {/* Background Pattern */}
      {showPattern && (
        <div className="absolute inset-0 z-0 opacity-10">
          <div className="absolute top-10 left-10 w-20 h-20 bg-white rounded-full animate-pulse" />
          <div className="absolute top-32 right-16 w-32 h-32 bg-white rounded-full animate-pulse animation-delay-1000" />
          <div className="absolute bottom-20 left-1/4 w-16 h-16 bg-white rounded-full animate-pulse animation-delay-2000" />
        </div>
      )}

      <div className={contentClasses}>
        <div className="relative z-10">
          {/* Urgency Message */}
          {urgency && (
            <div className="mb-4 sm:mb-6">
              <div className="inline-flex items-center px-4 py-2 bg-red-500 text-white text-sm font-medium rounded-full animate-pulse">
                <svg
                  className={`w-4 h-4 ${isRtl ? "ml-2" : "mr-2"}`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                {urgency.text}
              </div>
            </div>
          )}

          {/* Countdown Timer */}
          {urgency?.countdown && timeLeft && (
            <div className="mb-6 sm:mb-8">
              <div className="flex justify-center gap-4">
                {Object.entries(timeLeft).map(([unit, value]) => (
                  <div key={unit} className="text-center">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                      <span
                        className={`text-xl sm:text-2xl font-bold ${textColor}`}
                      >
                        {value.toString().padStart(2, "0")}
                      </span>
                    </div>
                    <div className={`text-xs sm:text-sm mt-1 ${subtextColor}`}>
                      {
                        urgency.countdown!.labels[
                          unit as keyof typeof urgency.countdown.labels
                        ]
                      }
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Subtitle */}
          {subtitle && (
            <div className="mb-3 sm:mb-4">
              <span
                className={`inline-flex items-center px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium ${textColor}`}
              >
                <div className="w-2 h-2 bg-yellow-400 rounded-full mr-2 rtl:mr-0 rtl:ml-2" />
                {subtitle}
              </span>
            </div>
          )}

          {/* Main Title */}
          <h2
            className={`text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold ${textColor} mb-4 sm:mb-6 leading-tight`}
          >
            {title}
          </h2>

          {/* Description */}
          {description && (
            <p
              className={`text-lg sm:text-xl ${subtextColor} mb-6 sm:mb-8 max-w-3xl ${centered ? "mx-auto" : ""} leading-relaxed`}
            >
              {description}
            </p>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6 sm:mb-8">
            {buttons.map((button, index) => {
              const ButtonComponent = button.external ? "a" : Link;
              const buttonProps = button.external
                ? {
                    href: button.href,
                    target: "_blank",
                    rel: "noopener noreferrer",
                  }
                : { href: button.href };

              const buttonClasses = {
                primary:
                  "bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105",
                secondary:
                  "bg-white hover:bg-gray-100 text-gray-900 shadow-lg hover:shadow-xl",
                outline:
                  "border-2 border-white/30 hover:border-white/50 hover:bg-white/10 backdrop-blur-sm text-white",
              };

              return (
                <ButtonComponent
                  key={index}
                  {...buttonProps}
                  onClick={() => {
                    // Track CTA click
                    trackCTAClick({
                      cta_text: button.text,
                      cta_location: "final_cta",
                      cta_type:
                        button.variant === "outline"
                          ? "secondary"
                          : button.variant,
                      destination_url: button.href,
                    });

                    // Track landing page conversion if it's a primary action
                    if (button.variant === "primary") {
                      const actionType =
                        button.text.toLowerCase().includes("رزرو") ||
                        button.text.toLowerCase().includes("reserve")
                          ? "reserve"
                          : button.text.toLowerCase().includes("ثبت") ||
                              button.text.toLowerCase().includes("enroll")
                            ? "enroll"
                            : "primary_cta";

                      // Extract content type from context (would need to be passed as prop)
                      trackLandingPageConversion(
                        "workshop",
                        "cta-action",
                        actionType,
                      );
                    }
                  }}
                  className={`group inline-flex items-center justify-center px-8 py-4 font-semibold rounded-xl transition-all duration-300 text-center min-h-[56px] touch-manipulation ${buttonClasses[button.variant]}`}
                >
                  <span
                    className={button.icon ? (isRtl ? "ml-2" : "mr-2") : ""}
                  >
                    {button.text}
                  </span>
                  {button.icon && getButtonIcon(button.icon)}
                </ButtonComponent>
              );
            })}
          </div>

          {/* Trust Indicators */}
          {trustIndicators && trustIndicators.length > 0 && (
            <div className="flex flex-wrap justify-center items-center gap-6 mb-6">
              {trustIndicators.map((indicator, index) => (
                <div key={index} className="flex items-center gap-2">
                  {getTrustIcon(indicator.icon)}
                  <span className={`text-sm ${subtextColor}`}>
                    {indicator.text}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Social Proof */}
          {socialProof && (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              {socialProof.avatars && socialProof.avatars.length > 0 && (
                <div className="flex -space-x-2">
                  {socialProof.avatars.slice(0, 5).map((avatar, index) => (
                    <div
                      key={index}
                      className="w-8 h-8 rounded-full overflow-hidden border-2 border-white"
                    >
                      <Image
                        src={avatar}
                        alt=""
                        width={32}
                        height={32}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                  {socialProof.avatars.length > 5 && (
                    <div className="w-8 h-8 rounded-full bg-white/20 border-2 border-white flex items-center justify-center">
                      <span className={`text-xs font-bold ${textColor}`}>
                        +{socialProof.avatars.length - 5}
                      </span>
                    </div>
                  )}
                </div>
              )}
              <div className="flex items-center gap-1">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className="w-4 h-4 text-yellow-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <span
                  className={`text-sm ${subtextColor} ${isRtl ? "mr-2" : "ml-2"}`}
                >
                  {socialProof.text}
                  {socialProof.count && (
                    <span className="font-semibold">
                      {" "}
                      ({socialProof.count.toLocaleString()})
                    </span>
                  )}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

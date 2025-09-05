"use client";

import { useTranslations } from "next-intl";
import { useState, useEffect, useRef, useMemo, useCallback, memo } from "react";
import Image from "next/image";

interface Testimonial {
  id: string;
  name: string;
  title?: string;
  company?: string;
  content: string;
  rating: number;
  avatar?: string;
  date?: string;
  verified?: boolean;
  course_name?: string;
  workshop_name?: string;
}

interface LandingTestimonialsProps {
  testimonials: Testimonial[];
  title?: string;
  subtitle?: string;
  locale: string;
  variant?: "slider" | "grid" | "masonry";
  autoPlay?: boolean;
  showRatings?: boolean;
  showVerifiedBadge?: boolean;
  maxVisible?: number;
  backgroundColor?: "white" | "gray" | "blue" | "transparent";
}

function LandingTestimonials({
  testimonials,
  title,
  subtitle,
  locale,
  variant = "slider",
  autoPlay = true,
  showRatings = true,
  showVerifiedBadge = true,
  maxVisible = 6,
  backgroundColor = "gray",
}: LandingTestimonialsProps) {
  const t = useTranslations("testimonials");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // Memoize filtered testimonials
  const displayTestimonials = useMemo(
    () => testimonials.slice(0, maxVisible),
    [testimonials, maxVisible],
  );
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const isRtl = locale === "fa";
  const displayedTestimonials = testimonials.slice(0, maxVisible);

  // Auto-play functionality
  useEffect(() => {
    if (isPlaying && variant === "slider" && displayedTestimonials.length > 1) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prevIndex) =>
          prevIndex === displayedTestimonials.length - 1 ? 0 : prevIndex + 1,
        );
      }, 5000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, displayedTestimonials.length, variant]);

  // Touch handlers for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (variant === "slider") {
      if (isLeftSwipe && !isRtl) {
        nextTestimonial();
      } else if (isRightSwipe && !isRtl) {
        previousTestimonial();
      } else if (isLeftSwipe && isRtl) {
        previousTestimonial();
      } else if (isRightSwipe && isRtl) {
        nextTestimonial();
      }
    }
  };

  const nextTestimonial = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === displayedTestimonials.length - 1 ? 0 : prevIndex + 1,
    );
  };

  const previousTestimonial = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? displayedTestimonials.length - 1 : prevIndex - 1,
    );
  };

  const backgroundClasses = {
    white: "bg-white",
    gray: "bg-gray-50",
    blue: "bg-blue-50",
    transparent: "bg-transparent",
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <svg
            key={i}
            className={`w-4 h-4 ${
              i < Math.floor(rating) ? "text-yellow-400" : "text-gray-300"
            }`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    );
  };

  const renderTestimonialCard = (testimonial: Testimonial, index: number) => (
    <div
      key={testimonial.id}
      className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 h-full flex flex-col"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-4">
        {/* Avatar */}
        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
          {testimonial.avatar ? (
            <Image
              src={testimonial.avatar}
              alt={testimonial.name}
              width={40}
              height={40}
              className="w-10 h-10 rounded-full object-cover"
              loading={index < 3 ? "eager" : "lazy"}
              placeholder="blur"
              blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
              loading={index < 3 ? "eager" : "lazy"}
              placeholder="blur"
              blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
              loading={index === currentIndex ? "eager" : "lazy"}
              placeholder="blur"
              blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <span className="text-white text-lg font-bold">
                {testimonial.name.charAt(0)}
              </span>
            </div>
          )}
        </div>

        {/* User Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-semibold text-gray-900 text-sm sm:text-base truncate">
              {testimonial.name}
            </h4>
            {showVerifiedBadge && testimonial.verified && (
              <svg
                className="w-4 h-4 text-blue-500 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </div>

          <div className="text-xs sm:text-sm text-gray-600 space-y-1">
            {testimonial.title && <div>{testimonial.title}</div>}
            {testimonial.company && (
              <div className="text-blue-600">{testimonial.company}</div>
            )}
            {(testimonial.course_name || testimonial.workshop_name) && (
              <div className="text-green-600">
                {testimonial.course_name || testimonial.workshop_name}
              </div>
            )}
          </div>
        </div>

        {/* Rating */}
        {showRatings && (
          <div className="flex-shrink-0">{renderStars(testimonial.rating)}</div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col">
        <blockquote className="text-gray-700 text-sm sm:text-base leading-relaxed mb-4 flex-1">
          <span className="text-2xl text-gray-400 leading-none float-left mr-1 rtl:float-right rtl:mr-0 rtl:ml-1">
            {isRtl ? "‫" : ""}"
          </span>
          {testimonial.content}
          <span className="text-2xl text-gray-400 leading-none">
            {isRtl ? "‬" : ""}"
          </span>
        </blockquote>

        {/* Date */}
        {testimonial.date && (
          <div className="text-xs text-gray-500 mt-auto">
            {new Date(testimonial.date).toLocaleDateString(locale)}
          </div>
        )}
      </div>
    </div>
  );

  if (!displayedTestimonials.length) {
    return null;
  }

  return (
    <section
      className={`py-12 sm:py-16 lg:py-20 ${backgroundClasses[backgroundColor]}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div
          className={`text-center mb-8 sm:mb-12 lg:mb-16 ${isRtl ? "text-right" : "text-left"} sm:text-center`}
        >
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            {title || t("defaultTitle")}
          </h2>
          {subtitle && (
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              {subtitle}
            </p>
          )}
        </div>

        {/* Testimonials */}
        {variant === "slider" ? (
          <div className="relative">
            {/* Slider Container */}
            <div
              className="overflow-hidden rounded-xl"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <div
                className="flex transition-transform duration-500 ease-in-out"
                style={{
                  transform: `translateX(${isRtl ? "" : "-"}${currentIndex * 100}%)`,
                }}
              >
                {displayTestimonials.map((testimonial, index) => (
                  <div
                    key={testimonial.id}
                    className="w-full flex-shrink-0 px-2"
                  >
                    <div className="max-w-4xl mx-auto">
                      {renderTestimonialCard(testimonial, index)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Navigation */}
            {displayedTestimonials.length > 1 && (
              <>
                {/* Dots */}
                <div className="flex justify-center items-center gap-2 mt-6">
                  {displayedTestimonials.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentIndex(index)}
                      className={`w-3 h-3 rounded-full transition-all duration-300 touch-manipulation ${
                        index === currentIndex
                          ? "bg-blue-600 scale-125"
                          : "bg-gray-300 hover:bg-gray-400"
                      }`}
                      aria-label={`${t("goToSlide")} ${index + 1}`}
                    />
                  ))}
                </div>

                {/* Arrow Navigation */}
                <button
                  onClick={previousTestimonial}
                  className={`absolute top-1/2 ${isRtl ? "right-2" : "left-2"} sm:${isRtl ? "right-4" : "left-4"} transform -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 bg-white shadow-lg rounded-full flex items-center justify-center text-gray-600 hover:text-blue-600 hover:shadow-xl transition-all duration-300 touch-manipulation z-10`}
                  aria-label={t("previousTestimonial")}
                >
                  <svg
                    className={`w-5 h-5 sm:w-6 sm:h-6 ${isRtl ? "rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>

                <button
                  onClick={nextTestimonial}
                  className={`absolute top-1/2 ${isRtl ? "left-2" : "right-2"} sm:${isRtl ? "left-4" : "right-4"} transform -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 bg-white shadow-lg rounded-full flex items-center justify-center text-gray-600 hover:text-blue-600 hover:shadow-xl transition-all duration-300 touch-manipulation z-10`}
                  aria-label={t("nextTestimonial")}
                >
                  <svg
                    className={`w-5 h-5 sm:w-6 sm:h-6 ${isRtl ? "rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>

                {/* Play/Pause Button */}
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="absolute bottom-4 right-4 w-8 h-8 bg-black/20 hover:bg-black/30 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-all duration-300 touch-manipulation"
                  aria-label={isPlaying ? t("pause") : t("play")}
                >
                  {isPlaying ? (
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 002 0V8a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </button>
              </>
            )}
          </div>
        ) : (
          <div
            className={`grid gap-6 ${
              variant === "grid"
                ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
                : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
            }`}
          >
            {displayedTestimonials.map((testimonial, index) => (
              <div
                key={testimonial.id}
                className={variant === "masonry" ? "" : ""}
                style={
                  variant === "masonry"
                    ? {
                        animationDelay: `${index * 0.1}s`,
                      }
                    : {}
                }
              >
                {renderTestimonialCard(testimonial, index)}
              </div>
            ))}
          </div>
        )}

        {/* View All Link */}
        {testimonials.length > maxVisible && (
          <div className="text-center mt-8 sm:mt-12">
            <button className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-300 touch-manipulation">
              <span className={isRtl ? "ml-2" : "mr-2"}>
                {t("viewAllReviews")}
              </span>
              <svg
                className={`w-4 h-4 ${isRtl ? "rotate-180" : ""}`}
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
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

export default memo(LandingTestimonials);

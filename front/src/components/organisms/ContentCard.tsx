"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { formatPrice, formatNumber } from "@/utils/currency";
import AddToCartButton from "@/components/molecules/AddToCartButton";

interface CourseData {
  _id: string;
  name: string;
  name_en?: string;
  slug: string;
  price: number;
  original_price?: number;
  discounted_price?: number;
  is_free?: boolean;
  featured_image?: {
    url: string;
    alt?: string;
  };
  instructor?: {
    details?: {
      name?: string;
      name_en?: string;
      first_name?: string;
      last_name?: string;
    };
    name?: string;
    name_en?: string;
  };
  duration_hours?: number;
  level?: "Beginner" | "Intermediate" | "Advanced";
  type: "Course" | "Workshop" | "Bootcamp" | "Seminar";
}

interface ContentCardProps {
  href: string;
  title: string;
  imageUrl?: string;
  description?: string;
  price?: string;
  originalPrice?: string;
  locale?: string;

  variant?:
    | "hero-course"
    | "article-large"
    | "article-medium"
    | "course-dark"
    | "light"
    | "dark";
  author?: string;
  date?: string;
  level?: string;
  reviews?: number;
  rating?: number;
  commentCount?: number;
  courseData?: CourseData;
  showAddToCart?: boolean;
}

const ContentCard: React.FC<ContentCardProps> = ({
  href,
  imageUrl,
  title,
  description,
  price,
  originalPrice,
  locale = "en",

  variant = "light",
  author,
  date,
  level,
  reviews = 0,
  rating,
  commentCount = 0,
  courseData,
  showAddToCart = false,
}) => {
  const [imageError, setImageError] = useState(false);

  // Hero course variant (circular buttons)
  if (variant === "hero-course") {
    return (
      <Link href={href} className="group">
        <div className="text-center">
          <div className="w-24 h-24 bg-background rounded-full flex items-center justify-center mb-3 hover:scale-105 transition-transform cursor-pointer shadow-lg">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
              <span className="text-background text-2xl">🏛️</span>
            </div>
          </div>
          <p className="text-sm font-medium text-background">
            {title.split(" ").slice(0, 2).join(" ")}
            <br />
            {title.split(" ").slice(2).join(" ")}
          </p>
        </div>
      </Link>
    );
  }

  // Large article variant with overlay
  if (variant === "article-large") {
    return (
      <Link href={href} className="group">
        <div className="bg-gradient-to-br from-gray-700 to-gray-900 rounded-2xl overflow-hidden relative h-96 hover:shadow-xl transition-shadow">
          {imageUrl && !imageError && (
            <Image
              src={imageUrl}
              alt={title}
              fill
              className="object-cover"
              loading="lazy"
              onError={() => setImageError(true)}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
          <div className="absolute bottom-6 right-6 text-background z-10">
            <h3 className="text-xl font-bold mb-2 line-clamp-2">{title}</h3>
            {date && <p className="text-sm text-gray-300">{date}</p>}
          </div>
        </div>
      </Link>
    );
  }

  // Medium article variant
  if (variant === "article-medium") {
    return (
      <Link href={href} className="group">
        <div className="bg-gradient-to-br from-yellow-600 to-orange-700 rounded-2xl overflow-hidden relative h-44 hover:shadow-lg transition-shadow">
          {imageUrl && !imageError && (
            <Image
              src={imageUrl}
              alt={title}
              fill
              className="object-cover"
              loading="lazy"
              onError={() => setImageError(true)}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
          <div className="absolute bottom-4 right-4 text-background z-10">
            <h4 className="font-bold text-sm line-clamp-2">{title}</h4>
            {date && <p className="text-xs text-gray-300 mt-1">{date}</p>}
          </div>
        </div>
      </Link>
    );
  }

  // Dark course variant
  if (variant === "course-dark") {
    return (
      <Link href={href} className="group">
        <div className="bg-background rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow h-full flex flex-col">
          <div className="aspect-video h-48 bg-gradient-to-br from-gray-400 to-gray-600 relative overflow-hidden flex-shrink-0">
            {imageUrl && !imageError ? (
              <Image
                src={imageUrl}
                alt={title}
                fill
                className="aspect-video h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center">
                <span className="text-4xl text-background">🏛️</span>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>

            {level && (
              <div className="absolute top-4 right-4 bg-background bg-opacity-20 backdrop-blur-sm rounded-lg px-3 py-1">
                <span className="text-background text-sm font-medium">
                  {level}
                </span>
              </div>
            )}
          </div>

          <div className="p-6 bg-gray-800 text-background flex-1 flex flex-col h-28">
            <h3 className="text-lg font-bold mb-2 line-clamp-2 group-hover:text-primary transition-colors flex-1">
              {title}
            </h3>

            <div className="flex items-center justify-between mt-auto">
              <div className="text-sm text-gray-300">{level || "مقدماتی"}</div>
              <div className="flex items-center gap-1">
                {rating && rating > 0 && (
                  <svg
                    className="w-4 h-4 text-yellow-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                )}
                <svg
                  className="w-4 h-4 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                  />
                </svg>
              </div>
            </div>
          </div>

          {(price || courseData) && (
            <div className="px-6 py-4 bg-gray-800 border-t border-gray-700">
              <div className="flex items-center justify-between mb-3">
                {originalPrice && (
                  <span className="text-sm text-gray-400 line-through">
                    {formatPrice(originalPrice, locale)}
                  </span>
                )}
                <div className="text-xl font-bold text-background">
                  {price
                    ? formatPrice(price, locale)
                    : courseData &&
                      formatPrice(courseData.price.toString(), locale)}
                </div>
              </div>
              {courseData && showAddToCart && (
                <AddToCartButton
                  course={courseData}
                  variant="outline"
                  size="sm"
                  className="w-full text-white border-white hover:bg-white hover:text-gray-800"
                />
              )}
            </div>
          )}
        </div>
      </Link>
    );
  }

  // Default light variant with fixed sizes
  return (
    <Link href={href} className="group">
      <article className="bg-background rounded-2xl shadow-md overflow-hidden transition-transform duration-300 hover:scale-105 hover:shadow-xl h-full border border-background-secondary flex flex-col">
        {/* Fixed aspect ratio image */}
        <div className="relative aspect-video h-48 w-full overflow-hidden flex-shrink-0">
          {imageUrl && !imageError ? (
            <Image
              src={imageUrl}
              alt={title}
              fill
              className="aspect-video h-48 object-cover"
              loading="lazy"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-background-secondary">
              <div className="w-20 h-20 rounded-full flex items-center justify-center bg-text-lightest">
                <svg
                  className="w-10 h-10 text-text-secondary "
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
            </div>
          )}
        </div>

        {/* Fixed height text container */}
        <div className="p-6 flex flex-col">
          <h3 className="text-xl font-bold text-text mb-3 line-clamp-2 transition-colors duration-300 leading-tight group-hover:text-primary flex-1">
            {title}
          </h3>

          {(author || date) && (
            <div className="flex items-center gap-4 mb-3 text-sm text-text-light mt-auto">
              {author && (
                <div className="flex items-center gap-2">
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                  </svg>
                  <span>{author}</span>
                </div>
              )}
              {date && (
                <div className="flex items-center gap-2">
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M9 11H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm2-7h-1V2h-2v2H8V2H6v2H5c-1.1 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z" />
                  </svg>
                  <span>{date}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Description with line clamp */}
        {description && (
          <div className="px-6 pb-4">
            <p className="text-base line-clamp-2 leading-relaxed text-text-secondary">
              {description}
            </p>
          </div>
        )}

        {/* Additional content */}
        {(rating || reviews > 0) && (
          <div className="px-6 pb-4">
            <div className="flex items-center gap-4">
              {rating && (
                <div className="flex items-center gap-1">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg
                        key={star}
                        className={`w-4 h-4 ${star <= rating ? "text-accent-primary" : "text-text-lightest"}`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <span className="text-sm text-text-secondary">
                    ({rating})
                  </span>
                </div>
              )}
              {reviews > 0 && (
                <span className="text-sm text-text-secondary">
                  {formatNumber(reviews.toString(), locale)}{" "}
                  {locale === "fa" ? "دیدگاه" : "reviews"}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Price section */}
        {(price || courseData) && (
          <div className="px-6 pb-6 mt-auto">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                {originalPrice && (
                  <span className="text-sm text-text-lighter line-through">
                    {formatPrice(originalPrice, locale)}
                  </span>
                )}
                <span className="text-lg font-bold text-primary">
                  {price
                    ? formatPrice(price, locale)
                    : courseData &&
                      formatPrice(courseData.price.toString(), locale)}
                </span>
              </div>
            </div>
            {courseData && showAddToCart && (
              <AddToCartButton
                course={courseData}
                variant="default"
                size="sm"
                className="w-full"
              />
            )}
          </div>
        )}
      </article>
    </Link>
  );
};

export default ContentCard;

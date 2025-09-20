"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Clock,
  Users,
  Star,
  Globe,
  BookOpen,
  Award,
  Play,
  Heart,
  Eye,
} from "lucide-react";

interface InternationalCourse {
  id: string;
  title: string;
  title_en?: string;
  description: string;
  description_en?: string;
  instructor: string;
  instructor_en?: string;
  duration: string;
  level: "beginner" | "intermediate" | "advanced";
  languages: string[];
  certification: string;
  price: string;
  originalPrice?: string;
  currency: "USD" | "EUR" | "IRR";
  image: string;
  rating: number;
  studentsCount: number;
  lessonsCount: number;
  isNew?: boolean;
  isFeatured?: boolean;
  category: string;
  slug: string;
}

interface InternationalCourseCardProps {
  course: InternationalCourse;
  locale?: string;
  className?: string;
}

export function InternationalCourseCard({
  course,
  locale = "en",
  className = "",
}: InternationalCourseCardProps) {
  const t = useTranslations("international");
  const [imageError, setImageError] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);

  const isRtl = locale === "fa";
  const title = isRtl ? course.title : (course.title_en || course.title);
  const description = isRtl
    ? course.description
    : (course.description_en || course.description);
  const instructor = isRtl
    ? course.instructor
    : (course.instructor_en || course.instructor);

  const getLevelBadgeColor = (level: string) => {
    switch (level) {
      case "beginner":
        return "bg-green-100 text-green-800";
      case "intermediate":
        return "bg-yellow-100 text-yellow-800";
      case "advanced":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getCurrencySymbol = (currency: string) => {
    switch (currency) {
      case "USD":
        return "$";
      case "EUR":
        return "€";
      case "IRR":
        return "تومان";
      default:
        return "$";
    }
  };

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-3 w-3 ${
              star <= rating
                ? "fill-yellow-400 text-yellow-400"
                : "fill-gray-200 text-gray-200"
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <Card className={`w-full hover:shadow-lg transition-all duration-300 group overflow-hidden ${className}`}>
      <CardContent className="p-0">
        {/* Image Section */}
        <div className="relative w-full h-48 overflow-hidden bg-gradient-to-br from-primary/10 to-accent/10">
          {course.image && !imageError ? (
            <Image
              src={course.image}
              alt={title}
              fill
              className="object-cover transition-transform group-hover:scale-110"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-primary/60">
              <BookOpen className="h-16 w-16" />
            </div>
          )}

          {/* Status badges overlay */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {course.isNew && (
              <Badge className="bg-green-500 hover:bg-green-600 text-white text-xs px-2 py-1">
                {t("courses.new")}
              </Badge>
            )}
            {course.isFeatured && (
              <Badge className="bg-accent hover:bg-accent-primary text-white text-xs px-2 py-1">
                {t("courses.featured")}
              </Badge>
            )}
          </div>

          {/* Wishlist button */}
          <button
            onClick={handleWishlistToggle}
            className="absolute top-3 right-3 p-2 bg-white/90 rounded-full hover:bg-white transition-colors opacity-0 group-hover:opacity-100"
          >
            <Heart
              className={`h-4 w-4 ${
                isWishlisted ? "fill-red-500 text-red-500" : "text-gray-600"
              }`}
            />
          </button>

          {/* Play button overlay */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
            <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center">
              <Play className="h-6 w-6 text-primary ml-1" />
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-6">
          {/* Category and Level */}
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-text-secondary font-medium">
              {course.category}
            </span>
            <Badge
              className={`text-xs px-2 py-1 ${getLevelBadgeColor(course.level)}`}
              variant="secondary"
            >
              {t(`courses.levels.${course.level}`)}
            </Badge>
          </div>

          {/* Title */}
          <h3 className="text-xl font-bold text-text-primary mb-3 leading-tight line-clamp-2 min-h-[3.5rem]">
            <Link
              href={`/${locale}/courses/${course.slug}`}
              className="hover:text-primary transition-colors"
            >
              {title}
            </Link>
          </h3>

          {/* Description */}
          <p className="text-text-secondary text-sm leading-relaxed mb-4 line-clamp-3">
            {description}
          </p>

          {/* Instructor */}
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary-dark rounded-full flex items-center justify-center">
              <Users className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-medium text-text-primary">
              {instructor}
            </span>
          </div>

          {/* Course Stats */}
          <div className="flex items-center justify-between mb-4 py-3 border-y border-background-secondary">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1 text-text-secondary">
                <Clock className="h-4 w-4" />
                <span className="text-xs">{course.duration}</span>
              </div>
              <div className="flex items-center gap-1 text-text-secondary">
                <BookOpen className="h-4 w-4" />
                <span className="text-xs">{course.lessonsCount} lessons</span>
              </div>
              <div className="flex items-center gap-1 text-text-secondary">
                <Globe className="h-4 w-4" />
                <span className="text-xs">{course.languages.length} lang</span>
              </div>
            </div>
          </div>

          {/* Rating and Students */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              {renderStars(course.rating)}
              <span className="text-sm text-text-secondary">
                ({course.rating})
              </span>
            </div>
            <span className="text-xs text-text-light">
              {course.studentsCount} students
            </span>
          </div>

          {/* Languages */}
          <div className="flex items-center gap-2 mb-4">
            <span className="text-sm font-medium text-text-primary">
              {t("courses.languages")}:
            </span>
            <div className="flex flex-wrap gap-1">
              {course.languages.map((language, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="text-xs px-2 py-0.5 border-primary/20 text-primary"
                >
                  {language}
                </Badge>
              ))}
            </div>
          </div>

          {/* Certification */}
          <div className="flex items-center gap-2 mb-6">
            <Award className="h-4 w-4 text-accent" />
            <span className="text-sm text-text-secondary">
              {course.certification}
            </span>
          </div>

          {/* Price and Actions */}
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-primary">
                  {getCurrencySymbol(course.currency)}{course.price}
                </span>
                {course.originalPrice && (
                  <span className="text-sm text-text-light line-through">
                    {getCurrencySymbol(course.currency)}{course.originalPrice}
                  </span>
                )}
              </div>
              <span className="text-xs text-text-secondary">
                {course.currency === "IRR" ? "تومان" : "USD"}
              </span>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="border-primary text-primary hover:bg-primary hover:text-white"
              >
                <Eye className="h-4 w-4 mr-1" />
                {t("courses.preview")}
              </Button>
              <Button
                size="sm"
                className="bg-primary hover:bg-primary-dark text-white"
              >
                {t("courses.enroll")}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default InternationalCourseCard;

"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useTranslations } from "next-intl";

interface CourseProgressData {
  enrollment_id: string;
  course: {
    id: string;
    name: string;
    name_en?: string;
    slug: string;
    type: string;
    level?: string;
    featured_image_url?: string;
  };
  progress_percentage: number;
  enrollment_date: Date | string;
  certificate_eligible: boolean;
  certificate_issued?: boolean;
  estimated_completion_date?: Date | string;
  total_lessons?: number;
  completed_lessons?: number;
  total_assignments?: number;
  completed_assignments?: number;
  instructor_name?: string;
}

interface CertificateProgressProps {
  course: CourseProgressData;
  locale?: string;
  className?: string;
  onGenerateCertificate?: (enrollmentId: string) => void;
  onContinueCourse?: (courseSlug: string) => void;
}

const CertificateProgress: React.FC<CertificateProgressProps> = ({
  course,
  locale = "fa",
  className = "",
  onGenerateCertificate,
  onContinueCourse,
}) => {
  const t = useTranslations("Certificate");
  const isRTL = locale === "fa";

  const formatDate = (date: Date | string): string => {
    const d = typeof date === "string" ? new Date(date) : date;
    if (locale === "fa") {
      return new Intl.DateTimeFormat("fa-IR", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }).format(d);
    }
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(d);
  };

  const getProgressStatus = () => {
    if (course.certificate_issued) {
      return {
        status: "completed",
        text: isRTL ? "گواهینامه صادر شده" : "Certificate Issued",
        color: "text-green-600",
        bgColor: "bg-green-50",
        borderColor: "border-green-200",
      };
    } else if (course.certificate_eligible) {
      return {
        status: "eligible",
        text: isRTL ? "آماده دریافت گواهینامه" : "Ready for Certificate",
        color: "text-accent-primary",
        bgColor: "bg-yellow-50",
        borderColor: "border-yellow-200",
      };
    } else if (course.progress_percentage >= 80) {
      return {
        status: "near_completion",
        text: isRTL ? "نزدیک به تکمیل" : "Near Completion",
        color: "text-blue-600",
        bgColor: "bg-blue-50",
        borderColor: "border-blue-200",
      };
    } else {
      return {
        status: "in_progress",
        text: isRTL ? "در حال انجام" : "In Progress",
        color: "text-primary",
        bgColor: "bg-primary-50",
        borderColor: "border-primary-200",
      };
    }
  };

  const progressStatus = getProgressStatus();
  const remainingPercentage = 100 - course.progress_percentage;

  return (
    <div
      className={`flex flex-col bg-background rounded-xl shadow-md border border-background-secondary overflow-hidden ${className}`}
    >
      {/* Header with Course Image */}
      <div className="flex items-center gap-4 p-6">
        <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
          {course.course.featured_image_url ? (
            <Image
              src={course.course.featured_image_url}
              alt={course.course.name}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <span className="text-background text-xl font-bold">
                {course.course.type.charAt(0)}
              </span>
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-lg text-text mb-1 line-clamp-2">
            {course.course.name}
          </h3>
          <div className="flex items-center gap-2 text-sm text-text-secondary mb-2">
            <span className="px-2 py-1 bg-primary bg-opacity-10 text-primary rounded text-xs font-medium">
              {course.course.type}
            </span>
            {course.course.level && (
              <span className="px-2 py-1 bg-background-secondary text-text-secondary rounded text-xs">
                {course.course.level}
              </span>
            )}
          </div>
          {course.instructor_name && (
            <div className="flex items-center gap-1 text-sm text-text-light">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z" />
              </svg>
              <span>{course.instructor_name}</span>
            </div>
          )}
        </div>
      </div>

      {/* Progress Section */}
      <div className="px-6 pb-6">
        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-text">
              {isRTL ? "پیشرفت دوره" : "Course Progress"}
            </span>
            <span className="text-sm font-bold text-primary">
              {course.progress_percentage}%
            </span>
          </div>

          <div className="w-full bg-background-secondary rounded-full h-3 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ease-out ${
                course.progress_percentage >= 100
                  ? "bg-gradient-to-r from-green-500 to-green-600"
                  : course.progress_percentage >= 80
                    ? "bg-gradient-to-r from-blue-500 to-blue-600"
                    : "bg-gradient-to-r from-primary to-primary-dark"
              }`}
              style={{ width: `${Math.min(course.progress_percentage, 100)}%` }}
            >
              {/* Progress shine effect */}
              <div className="w-full h-full bg-gradient-to-r from-transparent via-white via-transparent animate-pulse opacity-20"></div>
            </div>
          </div>

          {/* Progress Details */}
          <div className="flex items-center justify-between mt-2 text-xs text-text-secondary">
            <div className="flex items-center gap-4">
              {course.completed_lessons !== undefined &&
                course.total_lessons && (
                  <span>
                    {isRTL ? "درس‌ها:" : "Lessons:"} {course.completed_lessons}/
                    {course.total_lessons}
                  </span>
                )}
              {course.completed_assignments !== undefined &&
                course.total_assignments && (
                  <span>
                    {isRTL ? "تکالیف:" : "Assignments:"}{" "}
                    {course.completed_assignments}/{course.total_assignments}
                  </span>
                )}
            </div>
            {remainingPercentage > 0 && (
              <span>
                {isRTL
                  ? `${remainingPercentage}% باقی مانده`
                  : `${remainingPercentage}% remaining`}
              </span>
            )}
          </div>
        </div>

        {/* Status Badge */}
        <div
          className={`flex items-center gap-2 p-3 rounded-lg border mb-4 ${progressStatus.bgColor} ${progressStatus.borderColor}`}
        >
          <div className="flex-shrink-0">
            {course.certificate_issued ? (
              <svg
                className="w-5 h-5 text-green-600"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M14,17H7V15H14M17,13H7V11H17M17,9H7V7H17M19,3H5C3.89,3 3,3.89 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5C21,3.89 20.1,3 19,3Z" />
              </svg>
            ) : course.certificate_eligible ? (
              <svg
                className="w-5 h-5 text-accent-primary"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M11,16.5L18,9.5L16.59,8.09L11,13.67L7.41,10.09L6,11.5L11,16.5Z" />
              </svg>
            ) : (
              <svg
                className="w-5 h-5 text-primary"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,6A2,2 0 0,1 14,8A2,2 0 0,1 12,10A2,2 0 0,1 10,8A2,2 0 0,1 12,6M12,20C10,20 8.4,19.2 7.59,17.91C8.1,16.91 10,16.5 12,16.5C14,16.5 15.9,16.91 16.41,17.91C15.6,19.2 14,20 12,20Z" />
              </svg>
            )}
          </div>
          <div className="flex-1">
            <p className={`font-semibold ${progressStatus.color}`}>
              {progressStatus.text}
            </p>
            {!course.certificate_issued && course.progress_percentage < 100 && (
              <p className="text-xs text-text-secondary mt-1">
                {isRTL
                  ? `${remainingPercentage}% دیگر برای دریافت گواهینامه`
                  : `${remainingPercentage}% more for certificate`}
              </p>
            )}
            {course.certificate_eligible && !course.certificate_issued && (
              <p className="text-xs text-accent mt-1">
                {isRTL
                  ? "می‌توانید گواهینامه دریافت کنید"
                  : "You can now claim your certificate"}
              </p>
            )}
          </div>
        </div>

        {/* Enrollment Information */}
        <div className="flex items-center justify-between text-sm text-text-secondary mb-4">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19,19H5V8H19M16,1V3H8V1H6V3H5C3.89,3 3,3.89 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5C21,3.89 20.1,3 19,3H18V1M17,12H12V17H17V12Z" />
            </svg>
            <span>
              {isRTL ? "تاریخ ثبت‌نام:" : "Enrolled:"}{" "}
              {formatDate(course.enrollment_date)}
            </span>
          </div>
          {course.estimated_completion_date &&
            course.progress_percentage < 100 && (
              <div className="flex items-center gap-2">
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M15,13H16.5V15.82L18.94,17.23L18.19,18.53L15,16.69V13M19,8H5V19H9.67C9.24,18.09 9,17.07 9,16A7,7 0 0,1 16,9C17.07,9 18.09,9.24 19,9.67V8M5,21C3.89,21 3,20.1 3,19V5C3,3.89 3.89,3 5,3H6V1H8V3H16V1H18V3H19A2,2 0 0,1 21,5V11.1C22.24,12.36 23,14.09 23,16A7,7 0 0,1 16,23C14.09,23 12.36,22.24 11.1,21H5M16,11.15A4.85,4.85 0 0,0 11.15,16C11.15,18.68 13.32,20.85 16,20.85A4.85,4.85 0 0,0 20.85,16C20.85,13.32 18.68,11.15 16,11.15Z" />
                </svg>
                <span>
                  {isRTL ? "تکمیل تخمینی:" : "Est. completion:"}{" "}
                  {formatDate(course.estimated_completion_date)}
                </span>
              </div>
            )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          {course.certificate_issued ? (
            <Link
              href={`/user/certificates`}
              className="flex-1 bg-green-500 text-background text-center py-3 px-4 rounded-lg hover:bg-green-600 transition-colors font-medium"
            >
              {t("list.viewCertificate")}
            </Link>
          ) : course.certificate_eligible ? (
            <button
              onClick={() => onGenerateCertificate?.(course.enrollment_id)}
              className="flex-1 bg-accent-primary text-background py-3 px-4 rounded-lg hover:bg-accent transition-colors font-medium flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M14,17H7V15H14M17,13H7V11H17M17,9H7V7H17M19,3H5C3.89,3 3,3.89 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5C21,3.89 20.1,3 19,3Z" />
              </svg>
              <span>{t("progress.generateCertificate")}</span>
            </button>
          ) : (
            <Link
              href={`/course/${course.course.slug}`}
              className="flex-1 bg-primary text-background text-center py-3 px-4 rounded-lg hover:bg-primary-dark transition-colors font-medium flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8,5.14V19.14L19,12.14L8,5.14Z" />
              </svg>
              <span>{t("progress.continueStudying")}</span>
            </Link>
          )}

          <Link
            href={`/course/${course.course.slug}`}
            className="px-4 py-3 border-2 border-background-secondary text-text-secondary rounded-lg hover:bg-background-secondary transition-colors"
            title={t("actions.view")}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9M12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17M12,4.5C7,4.5 2.73,7.61 1,12C2.73,16.39 7,19.5 12,19.5C17,19.5 21.27,16.39 23,12C21.27,7.61 17,4.5 12,4.5Z" />
            </svg>
          </Link>
        </div>

        {/* Progress Tip */}
        {course.progress_percentage < 100 && (
          <div className="mt-4 p-3 bg-background-primary rounded-lg border-l-4 border-primary">
            <div className="flex items-start gap-2">
              <svg
                className="w-4 h-4 text-primary mt-0.5 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M11,9H13V7H11M12,20C7.59,20 4,16.41 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20,12C20,16.41 16.41,20 12,20M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M11,17H13V11H11V17Z" />
              </svg>
              <div className="text-sm">
                <p className="text-text font-medium mb-1">
                  {locale === "fa" ? "نکته:" : "Tip:"}
                </p>
                <p className="text-xs text-text-secondary">
                  {course.progress_percentage >= 80
                    ? locale === "fa"
                      ? "شما نزدیک به تکمیل دوره هستید! همین الان ادامه دهید."
                      : "You're close to completion! Keep going to earn your certificate."
                    : locale === "fa"
                      ? "برای دریافت گواهینامه، باید تمام قسمت‌های دوره را تکمیل کنید."
                      : "Complete all course sections to earn your certificate."}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CertificateProgress;

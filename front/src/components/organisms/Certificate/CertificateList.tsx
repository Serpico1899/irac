"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { formatDate } from "@/utils/dateUtils";

interface Certificate {
  id: string;
  certificate_number: string;
  student_name: string;
  student_name_en?: string;
  course: {
    id: string;
    name: string;
    name_en?: string;
    slug: string;
    type: string;
    level?: string;
    featured_image_url?: string;
  };
  instructor_name: string;
  issue_date: Date | string;
  completion_date: Date | string;
  final_grade?: number;
  verification_hash: string;
  status: "active" | "revoked";
  download_url: string;
  verify_url: string;
  share_url: string;
}

interface CourseInProgress {
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
}

interface CertificateListProps {
  certificates: Certificate[];
  coursesInProgress?: CourseInProgress[];
  loading?: boolean;
  error?: string;
  locale?: string;
  onLoadMore?: () => void;
  hasMore?: boolean;
  className?: string;
}

const CertificateList: React.FC<CertificateListProps> = ({
  certificates,
  coursesInProgress = [],
  loading = false,
  error,
  locale = "fa",
  onLoadMore,
  hasMore = false,
  className = "",
}) => {
  const t = useTranslations("Certificate");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "active" | "revoked"
  >("all");
  const [filterType, setFilterType] = useState<
    "all" | "Course" | "Workshop" | "Bootcamp" | "Seminar"
  >("all");
  const [filteredCertificates, setFilteredCertificates] =
    useState<Certificate[]>(certificates);

  const isRTL = locale === "fa";

  // Filter certificates based on search and filters
  useEffect(() => {
    let filtered = certificates;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (cert) =>
          cert.course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          cert.course.name_en
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          cert.certificate_number
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          cert.instructor_name.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    // Status filter
    if (filterStatus !== "all") {
      filtered = filtered.filter((cert) => cert.status === filterStatus);
    }

    // Type filter
    if (filterType !== "all") {
      filtered = filtered.filter((cert) => cert.course.type === filterType);
    }

    setFilteredCertificates(filtered);
  }, [certificates, searchTerm, filterStatus, filterType]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <svg
            className="w-8 h-8 text-red-500"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12,2C17.53,2 22,6.47 22,12C22,17.53 17.53,22 12,22C6.47,22 2,17.53 2,12C2,6.47 6.47,2 12,2M15.59,7L12,10.59L8.41,7L7,8.41L10.59,12L7,15.59L8.41,17L12,13.41L15.59,17L17,15.59L13.41,12L17,8.41L15.59,7Z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-text mb-2">
          {t("errors.loadFailed")}
        </h3>
        <p className="text-text-secondary">{error}</p>
      </div>
    );
  }

  return (
    <div className={`flex flex-col ${className}`}>
      {/* Header with Search and Filters */}
      <div className="flex flex-col gap-4 mb-8">
        {/* Search Bar */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                placeholder={t("list.searchPlaceholder")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 pr-12 border border-background-secondary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent search-input"
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <svg
                  className="w-5 h-5 text-text-secondary"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-3">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="px-4 py-3 border border-background-secondary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
            >
              <option value="all">
                {isRTL ? "همه وضعیت‌ها" : "All Statuses"}
              </option>
              <option value="active">{t("active")}</option>
              <option value="revoked">{t("revoked")}</option>
            </select>

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="px-4 py-3 border border-background-secondary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
            >
              <option value="all">{isRTL ? "همه انواع" : "All Types"}</option>
              <option value="Course">{isRTL ? "دوره" : "Course"}</option>
              <option value="Workshop">{isRTL ? "کارگاه" : "Workshop"}</option>
              <option value="Bootcamp">{isRTL ? "بوت کمپ" : "Bootcamp"}</option>
              <option value="Seminar">{isRTL ? "سمینار" : "Seminar"}</option>
            </select>
          </div>
        </div>

        {/* Results Summary */}
        <div className="flex items-center justify-between text-sm text-text-secondary">
          <span>
            {isRTL
              ? `${filteredCertificates.length} گواهینامه از ${certificates.length} گواهینامه`
              : `${filteredCertificates.length} of ${certificates.length} certificates`}
          </span>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="text-primary hover:text-primary-dark"
            >
              {isRTL ? "پاک کردن جستجو" : "Clear search"}
            </button>
          )}
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="loader"></div>
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredCertificates.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-24 h-24 bg-background-secondary rounded-full flex items-center justify-center mb-6">
            <svg
              className="w-12 h-12 text-text-lighter"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M14,17H7V15H14M17,13H7V11H17M17,9H7V7H17M19,3H5C3.89,3 3,3.89 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5C21,3.89 20.1,3 19,3Z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-text mb-2">
            {searchTerm || filterStatus !== "all" || filterType !== "all"
              ? t("list.noResults")
              : t("dashboard.noCertificates")}
          </h3>
          <p className="text-text-secondary">
            {searchTerm || filterStatus !== "all" || filterType !== "all"
              ? t("list.noResults")
              : t("dashboard.noCertificatesDescription")}
          </p>
        </div>
      )}

      {/* Certificates Grid */}
      {!loading && filteredCertificates.length > 0 && (
        <div className="flex flex-wrap gap-6">
          {filteredCertificates.map((certificate) => (
            <CertificateCard
              key={certificate.id}
              certificate={certificate}
              locale={locale}
            />
          ))}
        </div>
      )}

      {/* Load More Button */}
      {hasMore && onLoadMore && (
        <div className="flex justify-center mt-8">
          <button
            onClick={onLoadMore}
            className="px-6 py-3 bg-primary text-background rounded-lg hover:bg-primary-dark transition-colors"
          >
            {isRTL ? "نمایش بیشتر" : "Load More"}
          </button>
        </div>
      )}

      {/* Courses in Progress Section */}
      {coursesInProgress.length > 0 && (
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-text mb-4">
            {t("dashboard.coursesInProgress")}
          </h2>
          <div className="flex flex-wrap gap-4">
            {coursesInProgress.map((course) => (
              <ProgressCourseCard
                key={course.enrollment_id}
                course={course}
                locale={locale}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Certificate Card Component
const CertificateCard: React.FC<{
  certificate: Certificate;
  locale: string;
}> = ({ certificate, locale }) => {
  const isRTL = locale === "fa";

  return (
    <div className="flex flex-col w-full md:w-1/2 lg:w-1/3 min-w-80">
      <div className="bg-background rounded-xl shadow-lg border border-background-secondary hover:shadow-xl transition-shadow h-full flex flex-col">
        {/* Header with Course Image */}
        <div className="relative h-48 bg-gradient-to-br from-primary to-accent rounded-t-xl overflow-hidden">
          {certificate.course.featured_image_url ? (
            <Image
              src={certificate.course.featured_image_url}
              alt={certificate.course.name}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-4xl text-background">🎓</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>

          {/* Status Badge */}
          <div className="absolute top-4 right-4">
            <div
              className={`px-3 py-1 rounded-full text-xs font-medium ${
                certificate.status === "active"
                  ? "bg-green-500 text-white"
                  : "bg-red-500 text-white"
              }`}
            >
              {certificate.status === "active" ? t("active") : t("revoked")}
            </div>
          </div>

          {/* Certificate Type */}
          <div className="absolute bottom-4 left-4">
            <div className="bg-background bg-opacity-20 backdrop-blur-sm rounded-lg px-3 py-1">
              <span className="text-background text-sm font-medium">
                {certificate.course.type}
              </span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col flex-1">
          <div className="flex-1">
            <h3 className="text-lg font-bold text-text mb-2 line-clamp-2">
              {certificate.course.name}
            </h3>

            <div className="flex items-center gap-2 text-sm text-text-secondary mb-3">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2A10 10 0 0 0 2 12A10 10 0 0 0 12 22A10 10 0 0 0 22 12A10 10 0 0 0 12 2M12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4M12.5 7V12.25L17 14.92L16.25 16.15L11 13V7H12.5Z" />
              </svg>
              <span>{formatDate(certificate.issue_date, locale)}</span>
            </div>

            <div className="flex items-center gap-2 text-sm text-text-secondary mb-4">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z" />
              </svg>
              <span>{certificate.instructor_name}</span>
            </div>

            {certificate.final_grade && (
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center gap-1">
                  <span className="text-sm text-text-secondary">
                    {isRTL ? "نمره:" : "Grade:"}
                  </span>
                  <span className="font-bold text-accent-primary">
                    {certificate.final_grade}/100
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Certificate Number */}
          <div className="bg-background-primary rounded-lg p-3 mb-4">
            <div className="text-xs text-text-secondary mb-1">
              {isRTL ? "شماره گواهینامه" : "Certificate Number"}
            </div>
            <div className="font-mono text-sm font-medium text-text">
              {certificate.certificate_number}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Link
              href={`/certificate/${certificate.certificate_number}`}
              className="flex-1 bg-primary text-background text-center py-2 px-4 rounded-lg hover:bg-primary-dark transition-colors text-sm font-medium"
            >
              {isRTL ? "مشاهده" : "View"}
            </Link>

            <a
              href={certificate.download_url}
              className="flex-1 border border-primary text-primary text-center py-2 px-4 rounded-lg hover:bg-primary hover:text-background transition-colors text-sm font-medium"
            >
              {isRTL ? "دانلود" : "Download"}
            </a>

            <a
              href={certificate.verify_url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 border border-background-secondary text-text-secondary rounded-lg hover:bg-background-secondary transition-colors"
              title={isRTL ? "تایید گواهینامه" : "Verify Certificate"}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12,1L3,5V11C3,16.55 6.84,21.74 12,23C17.16,21.74 21,16.55 21,11V5L12,1M10,17L6,13L7.41,11.59L10,14.17L16.59,7.58L18,9L10,17Z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

// Progress Course Card Component
const ProgressCourseCard: React.FC<{
  course: CourseInProgress;
  locale: string;
}> = ({ course, locale }) => {
  const isRTL = locale === "fa";

  return (
    <div className="flex flex-col w-full md:w-1/2 lg:w-1/3 min-w-80">
      <div className="bg-background rounded-xl shadow-md border border-background-secondary p-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center text-background text-xl font-bold">
            {course.course.type.charAt(0)}
          </div>
          <div className="flex-1">
            <h4 className="font-bold text-text mb-1 line-clamp-2">
              {course.course.name}
            </h4>
            <p className="text-sm text-text-secondary">
              {course.course.type} • {course.course.level}
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-text-secondary">
              {isRTL ? "پیشرفت دوره" : "Course Progress"}
            </span>
            <span className="text-sm font-medium text-text">
              {course.progress_percentage}%
            </span>
          </div>
          <div className="w-full bg-background-secondary rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${course.progress_percentage}%` }}
            ></div>
          </div>
        </div>

        {/* Certificate Status */}
        <div
          className={`text-center py-2 px-4 rounded-lg text-sm font-medium ${
            course.certificate_eligible
              ? "bg-green-100 text-green-700"
              : "bg-background-secondary text-text-secondary"
          }`}
        >
          {course.certificate_eligible
            ? t("progress.certificateEligible")
            : isRTL
              ? `${100 - course.progress_percentage}% تا دریافت گواهینامه`
              : `${100 - course.progress_percentage}% to certificate`}
        </div>
      </div>
    </div>
  );
};

export default CertificateList;

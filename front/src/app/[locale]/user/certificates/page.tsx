"use client";

import React, { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useUser } from "@/hooks/useUser";
import CertificateList from "@/components/organisms/Certificate/CertificateList";
import CertificateProgress from "@/components/organisms/Certificate/CertificateProgress";
import { Loader } from "@/components/organisms/Loader";

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

interface CertificatePageProps {
  params: {
    locale: string;
  };
}

const CertificatesPage: React.FC<CertificatePageProps> = ({ params }) => {
  const { locale } = params;
  const t = useTranslations("Certificate");
  const { user, loading: userLoading } = useUser();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [coursesInProgress, setCoursesInProgress] = useState<
    CourseInProgress[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [offset, setOffset] = useState(0);
  const [generating, setGenerating] = useState<string | null>(null);

  const isRTL = locale === "fa";

  // Fetch user certificates
  const fetchCertificates = async (loadMore = false) => {
    try {
      const currentOffset = loadMore ? offset : 0;
      setLoading(!loadMore);

      const response = await fetch("/api/getUserCertificates", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          set: {
            limit: 12,
            offset: currentOffset,
          },
        }),
      });

      const data = await response.json();

      if (data.success) {
        if (loadMore) {
          setCertificates((prev) => [...prev, ...data.data.certificates]);
        } else {
          setCertificates(data.data.certificates);
          setCoursesInProgress(data.data.courses_in_progress || []);
        }

        setHasMore(data.data.pagination?.has_more || false);
        setOffset(currentOffset + (data.data.certificates?.length || 0));
        setError(null);
      } else {
        setError(data.error || t("errors.loadFailed"));
      }
    } catch (err: any) {
      console.error("Failed to fetch certificates:", err);
      setError(t("errors.networkError"));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Generate certificate for eligible course
  const handleGenerateCertificate = async (enrollmentId: string) => {
    setGenerating(enrollmentId);
    try {
      const response = await fetch("/api/generateCertificate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          set: {
            enrollment_id: enrollmentId,
            template_id: "standard",
          },
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Refresh certificates list to show new certificate
        await fetchCertificates();

        // Show success notification (you can implement toast/notification system)
        alert(t("admin.certificateGenerated"));
      } else {
        alert(data.error || t("admin.generationFailed"));
      }
    } catch (err: any) {
      console.error("Failed to generate certificate:", err);
      alert(t("errors.networkError"));
    } finally {
      setGenerating(null);
    }
  };

  // Refresh certificates
  const handleRefresh = async () => {
    setRefreshing(true);
    setOffset(0);
    await fetchCertificates();
  };

  // Load more certificates
  const handleLoadMore = async () => {
    await fetchCertificates(true);
  };

  // Download all certificates
  const handleDownloadAll = async () => {
    try {
      // This would need to be implemented in the backend
      const response = await fetch("/api/downloadAllCertificates", {
        method: "POST",
        headers: {
          "Content-Type": "application/zip",
        },
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `certificates-${user?.details?.name || "user"}.zip`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (err: any) {
      console.error("Failed to download all certificates:", err);
      alert(
        isRTL ? "خطا در دانلود فایل‌ها" : "Failed to download certificates",
      );
    }
  };

  useEffect(() => {
    if (!userLoading && user) {
      fetchCertificates();
    }
  }, [userLoading, user]);

  // Show loading state
  if (userLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader />
      </div>
    );
  }

  // Show error if user not found
  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <svg
            className="w-8 h-8 text-red-500"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12,2C17.53,2 22,6.47 22,12C22,17.53 17.53,22 12,22C6.47,22 2,17.53 2,12C2,6.47 6.47,2 12,2M15.59,7L12,10.59L8.41,7L7,8.41L10.59,12L7,15.59L8.41,17L12,13.41L15.59,17L17,15.59L13.41,12L17,8.41L15.59,7Z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-text mb-2">
          {isRTL ? "خطا در احراز هویت" : "Authentication Error"}
        </h2>
        <p className="text-text-secondary">
          {isRTL
            ? "لطفاً وارد حساب کاربری خود شوید"
            : "Please log in to access your certificates"}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-text mb-2">
            {isRTL ? "گواهینامه‌های من" : "My Certificates"}
          </h1>
          <p className="text-text-secondary">
            {isRTL
              ? "مشاهده و مدیریت گواهینامه‌های دریافتی و پیشرفت دوره‌ها"
              : "View and manage your earned certificates and course progress"}
          </p>
        </div>

        <div className="flex gap-3">
          {/* Refresh Button */}
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 border-2 border-background-secondary text-text-secondary rounded-lg hover:bg-background-secondary transition-colors disabled:opacity-50"
          >
            <svg
              className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M17.65,6.35C16.2,4.9 14.21,4 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20C15.73,20 18.84,17.45 19.73,14H17.65C16.83,16.33 14.61,18 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6C13.66,6 15.14,6.69 16.22,7.78L13,11H20V4L17.65,6.35Z" />
            </svg>
            <span>
              {refreshing
                ? isRTL
                  ? "در حال بروزرسانی..."
                  : "Refreshing..."
                : isRTL
                  ? "بروزرسانی"
                  : "Refresh"}
            </span>
          </button>

          {/* Download All Button */}
          {certificates.length > 0 && (
            <button
              onClick={handleDownloadAll}
              className="flex items-center gap-2 bg-primary text-background px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
              </svg>
              <span>{isRTL ? "دانلود همه" : "Download All"}</span>
            </button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="flex flex-wrap gap-6 mb-8">
        <div className="flex flex-col bg-gradient-to-br from-primary to-primary-dark text-background rounded-xl p-6 min-w-48 flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-background bg-opacity-20 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M14,17H7V15H14M17,13H7V11H17M17,9H7V7H17M19,3H5C3.89,3 3,3.89 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5C21,3.89 20.1,3 19,3Z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold">{certificates.length}</p>
              <p className="text-background text-opacity-90 text-sm">
                {isRTL ? "گواهینامه‌های دریافتی" : "Earned Certificates"}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col bg-gradient-to-br from-accent to-accent-primary text-background rounded-xl p-6 min-w-48 flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-background bg-opacity-20 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,6A2,2 0 0,1 14,8A2,2 0 0,1 12,10A2,2 0 0,1 10,8A2,2 0 0,1 12,6M12,20C10,20 8.4,19.2 7.59,17.91C8.1,16.91 10,16.5 12,16.5C14,16.5 15.9,16.91 16.41,17.91C15.6,19.2 14,20 12,20Z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold">{coursesInProgress.length}</p>
              <p className="text-background text-opacity-90 text-sm">
                {isRTL ? "دوره‌های در حال انجام" : "Courses in Progress"}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col bg-gradient-to-br from-green-500 to-green-600 text-background rounded-xl p-6 min-w-48 flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-background bg-opacity-20 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12,1L3,5V11C3,16.55 6.84,21.74 12,23C17.16,21.74 21,16.55 21,11V5L12,1M10,17L6,13L7.41,11.59L10,14.17L16.59,7.58L18,9L10,17Z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold">
                {
                  coursesInProgress.filter(
                    (course) => course.certificate_eligible,
                  ).length
                }
              </p>
              <p className="text-background text-opacity-90 text-sm">
                {isRTL ? "آماده صدور گواهینامه" : "Ready for Certificate"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col gap-12">
        {/* Certificates List */}
        <div>
          <CertificateList
            certificates={certificates}
            coursesInProgress={coursesInProgress}
            loading={false}
            error={error}
            locale={locale || undefined}
            onLoadMore={hasMore ? handleLoadMore : undefined}
            hasMore={hasMore}
          />
        </div>

        {/* Courses in Progress */}
        {coursesInProgress.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-text">
                {isRTL ? "دوره‌های در حال تکمیل" : "Courses in Progress"}
              </h2>
              <div className="flex items-center gap-2 text-sm text-text-secondary">
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M11,9H13V7H11M12,20C7.59,20 4,16.41 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20,12C20,16.41 16.41,20 12,20M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,12 0 0,0 12,2M11,17H13V11H11V17Z" />
                </svg>
                <span>
                  {isRTL
                    ? "با تکمیل 100% دوره، گواهینامه دریافت کنید"
                    : "Complete 100% of the course to earn a certificate"}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-6">
              {coursesInProgress.map((course) => (
                <div
                  key={course.enrollment_id}
                  className="flex flex-col w-full lg:w-1/2 min-w-96"
                >
                  <CertificateProgress
                    course={{
                      ...course,
                      instructor_name: "مدرس دوره", // This should come from the API
                    }}
                    locale={locale}
                    onGenerateCertificate={handleGenerateCertificate}
                  />

                  {/* Loading overlay for certificate generation */}
                  {generating === course.enrollment_id && (
                    <div className="fixed inset-0 bg-background bg-opacity-80 flex items-center justify-center z-50">
                      <div className="bg-background rounded-xl p-8 shadow-xl border border-background-secondary">
                        <div className="flex flex-col items-center gap-4">
                          <div className="loader"></div>
                          <p className="text-text font-medium">
                            {isRTL
                              ? "در حال صدور گواهینامه..."
                              : "Generating certificate..."}
                          </p>
                          <p className="text-text-secondary text-sm text-center">
                            {isRTL
                              ? "این فرآیند ممکن است چند لحظه طول بکشد"
                              : "This may take a few moments"}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Empty State for New Users */}
      {!loading &&
        certificates.length === 0 &&
        coursesInProgress.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-32 h-32 bg-background-secondary rounded-full flex items-center justify-center mb-6">
              <svg
                className="w-16 h-16 text-text-lighter"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12,3L1,9L12,15L21,10.09V17H23V9M5,13.18V17.18L12,21L19,17.18V13.18L12,17L5,13.18Z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-text mb-4">
              {isRTL
                ? "شروع یادگیری خود را آغاز کنید"
                : "Start Your Learning Journey"}
            </h3>
            <p className="text-text-secondary max-w-md mb-8">
              {isRTL
                ? "هنوز در هیچ دوره‌ای ثبت‌نام نکرده‌اید. برای دریافت گواهینامه، در دوره‌های مختلف شرکت کنید."
                : "You haven't enrolled in any courses yet. Join courses to earn certificates and expand your knowledge."}
            </p>
            <a
              href={`/${locale}/courses`}
              className="bg-primary text-background px-8 py-3 rounded-lg hover:bg-primary-dark transition-colors font-medium"
            >
              {isRTL ? "مشاهده دوره‌ها" : "Browse Courses"}
            </a>
          </div>
        )}
    </div>
  );
};

export default CertificatesPage;

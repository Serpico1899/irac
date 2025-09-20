'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface CompletionStatusProps {
  enrollmentStatus: {
    is_enrolled: boolean;
    enrollment_date?: string;
    progress_percentage?: number;
    status?: string;
    completed_date?: string;
    certificate_issued?: boolean;
    certificate_id?: string;
    certificate_issue_date?: string;
    final_grade?: number;
  };
  courseDetails: {
    _id: string;
    title: string;
    title_en?: string;
    passing_grade?: number;
    certificate_template_id?: string;
    duration_hours?: number;
    total_lessons?: number;
    completed_lessons?: number;
  };
  locale: string;
}

export default function CompletionStatus({
  enrollmentStatus,
  courseDetails,
  locale
}: CompletionStatusProps) {
  const router = useRouter();
  const [downloadingCertificate, setDownloadingCertificate] = useState(false);

  if (!enrollmentStatus?.is_enrolled) {
    return null;
  }

  const {
    progress_percentage = 0,
    status,
    completed_date,
    certificate_issued = false,
    certificate_id,
    certificate_issue_date,
    final_grade
  } = enrollmentStatus;

  const {
    title,
    title_en,
    passing_grade = 70,
    duration_hours,
    total_lessons,
    completed_lessons
  } = courseDetails;

  const isCompleted = status === 'Completed' || progress_percentage >= 100;
  const isPassingGrade = final_grade ? final_grade >= passing_grade : true;
  const canGetCertificate = isCompleted && isPassingGrade;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return locale === 'fa'
      ? date.toLocaleDateString('fa-IR')
      : date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
  };

  const handleCertificateDownload = async () => {
    if (!certificate_id) return;

    setDownloadingCertificate(true);
    try {
      // Redirect to certificate download page
      router.push(`/${locale}/user/certificates/download/${certificate_id}`);
    } catch (error) {
      console.error('Error downloading certificate:', error);
    } finally {
      setDownloadingCertificate(false);
    }
  };

  const handleViewCertificates = () => {
    router.push(`/${locale}/user/certificates`);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-background-darkest p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-text">
          {locale === 'fa' ? 'وضعیت تکمیل دوره' : 'Course Completion Status'}
        </h3>
        {isCompleted && (
          <div className="flex items-center text-green-600">
            <svg className="w-5 h-5 ml-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="font-semibold">
              {locale === 'fa' ? 'تکمیل شده' : 'Completed'}
            </span>
          </div>
        )}
      </div>

      {/* Progress Section */}
      <div className="space-y-4">
        {/* Overall Progress */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-text-secondary">
              {locale === 'fa' ? 'پیشرفت کلی' : 'Overall Progress'}
            </span>
            <span className="text-sm font-bold text-text">
              {progress_percentage}%
            </span>
          </div>
          <div className="w-full bg-background-secondary rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all duration-300 ${
                isCompleted ? 'bg-green-500' : 'bg-primary'
              }`}
              style={{ width: `${Math.min(progress_percentage, 100)}%` }}
            />
          </div>
        </div>

        {/* Detailed Progress Stats */}
        <div className="flex flex-wrap gap-4 pt-2">
          {total_lessons && (
            <div className="flex flex-col">
              <span className="text-xs text-text-secondary">
                {locale === 'fa' ? 'درس‌ها' : 'Lessons'}
              </span>
              <span className="text-sm font-medium text-text">
                {completed_lessons || 0}/{total_lessons}
              </span>
            </div>
          )}

          {duration_hours && (
            <div className="flex flex-col">
              <span className="text-xs text-text-secondary">
                {locale === 'fa' ? 'مدت زمان' : 'Duration'}
              </span>
              <span className="text-sm font-medium text-text">
                {Math.round((progress_percentage / 100) * duration_hours)}/{duration_hours}
                {locale === 'fa' ? ' ساعت' : ' hours'}
              </span>
            </div>
          )}

          {final_grade !== undefined && (
            <div className="flex flex-col">
              <span className="text-xs text-text-secondary">
                {locale === 'fa' ? 'نمره نهایی' : 'Final Grade'}
              </span>
              <span className={`text-sm font-medium ${
                final_grade >= passing_grade ? 'text-green-600' : 'text-red-500'
              }`}>
                {final_grade}%
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Certificate Section */}
      <div className="border-t border-background-darkest pt-4">
        {certificate_issued ? (
          /* Certificate Ready */
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                  </div>
                </div>
                <div className="mr-4">
                  <h4 className="text-green-800 font-semibold mb-1">
                    🎉 {locale === 'fa' ? 'گواهینامه آماده است!' : 'Certificate Ready!'}
                  </h4>
                  <p className="text-green-700 text-sm">
                    {locale === 'fa' ? 'شماره گواهینامه:' : 'Certificate Number:'} {certificate_id}
                  </p>
                  {certificate_issue_date && (
                    <p className="text-green-600 text-xs mt-1">
                      {locale === 'fa' ? 'تاریخ صدور:' : 'Issued on:'} {formatDate(certificate_issue_date)}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 mt-4">
              <button
                onClick={handleCertificateDownload}
                disabled={downloadingCertificate}
                className="flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {downloadingCertificate ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin ml-2" />
                ) : (
                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                )}
                {locale === 'fa' ? 'دانلود گواهینامه' : 'Download Certificate'}
              </button>

              <button
                onClick={handleViewCertificates}
                className="flex items-center px-4 py-2 border border-green-600 text-green-600 text-sm font-medium rounded-lg hover:bg-green-50 transition-colors"
              >
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                {locale === 'fa' ? 'مشاهده همه گواهینامه‌ها' : 'View All Certificates'}
              </button>
            </div>
          </div>
        ) : canGetCertificate ? (
          /* Certificate Eligible but Not Issued */
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center ml-3">
                  🏆
                </div>
                <div>
                  <h4 className="text-blue-800 font-semibold">
                    {locale === 'fa' ? 'مؤهل دریافت گواهینامه' : 'Eligible for Certificate'}
                  </h4>
                  <p className="text-blue-700 text-sm">
                    {locale === 'fa'
                      ? 'گواهینامه شما در حال آماده‌سازی است'
                      : 'Your certificate is being prepared'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Progress Toward Certificate */
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center ml-3">
                📚
              </div>
              <div className="flex-1">
                <h4 className="text-amber-800 font-semibold mb-2">
                  {locale === 'fa' ? 'در مسیر دریافت گواهینامه' : 'Working Toward Certificate'}
                </h4>

                <div className="space-y-2 text-sm text-amber-700">
                  {progress_percentage < 100 && (
                    <div className="flex items-center">
                      <span className={progress_percentage >= 100 ? 'text-green-600' : ''}>
                        ✓ {locale === 'fa' ? 'تکمیل دوره:' : 'Complete course:'} {progress_percentage}%
                      </span>
                      {progress_percentage < 100 && (
                        <span className="text-amber-600 text-xs mr-2">
                          ({100 - progress_percentage}% {locale === 'fa' ? 'باقیمانده' : 'remaining'})
                        </span>
                      )}
                    </div>
                  )}

                  {final_grade !== undefined && final_grade < passing_grade && (
                    <div className="flex items-center text-red-600">
                      ✗ {locale === 'fa' ? 'حداقل نمره:' : 'Minimum grade:'} {passing_grade}%
                      <span className="text-xs mr-2">
                        ({locale === 'fa' ? 'نمره فعلی:' : 'current:'} {final_grade}%)
                      </span>
                    </div>
                  )}
                </div>

                <div className="mt-3">
                  <div className="text-xs text-amber-600 mb-1">
                    {locale === 'fa' ? 'پیشرفت تا گواهینامه' : 'Progress to Certificate'}
                  </div>
                  <div className="w-full bg-amber-200 rounded-full h-2">
                    <div
                      className="bg-amber-500 h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${Math.min(
                          (progress_percentage / 100) * (isPassingGrade ? 100 : 50),
                          100
                        )}%`
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Completion Details */}
      {completed_date && (
        <div className="text-sm text-text-secondary border-t border-background-darkest pt-4">
          <div className="flex items-center">
            <svg className="w-4 h-4 ml-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
            </svg>
            <span>
              {locale === 'fa' ? 'تاریخ تکمیل:' : 'Completion Date:'} {formatDate(completed_date)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

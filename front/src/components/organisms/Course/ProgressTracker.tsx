'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface ProgressItem {
  id: string;
  type: 'lesson' | 'quiz' | 'assignment' | 'project' | 'attendance';
  title: string;
  title_en?: string;
  completed: boolean;
  score?: number;
  max_score?: number;
  due_date?: string;
  completion_date?: string;
  required_for_certificate: boolean;
  weight: number; // contribution to overall progress (0-1)
}

interface ProgressTrackerProps {
  courseId: string;
  enrollmentId: string;
  courseTitle: string;
  courseTitleEn?: string;
  currentProgress: {
    overall_percentage: number;
    lessons_completed: number;
    total_lessons: number;
    quizzes_completed: number;
    total_quizzes: number;
    assignments_completed: number;
    total_assignments: number;
    attendance_count: number;
    required_attendance: number;
    final_grade?: number;
    passing_grade: number;
  };
  progressItems: ProgressItem[];
  certificateRequirements: {
    min_completion_percentage: number;
    min_final_grade?: number;
    required_attendance?: number;
    required_items: string[]; // IDs of required items
  };
  estimatedTimeToCompletion?: number; // in hours
  locale: string;
  onProgressUpdate?: (newProgress: number) => void;
}

export default function ProgressTracker({
  courseId,
  enrollmentId,
  courseTitle,
  courseTitleEn,
  currentProgress,
  progressItems,
  certificateRequirements,
  estimatedTimeToCompletion,
  locale,
  onProgressUpdate
}: ProgressTrackerProps) {
  const router = useRouter();
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [showAllItems, setShowAllItems] = useState(false);

  const {
    overall_percentage,
    lessons_completed,
    total_lessons,
    quizzes_completed,
    total_quizzes,
    assignments_completed,
    total_assignments,
    attendance_count,
    required_attendance,
    final_grade,
    passing_grade
  } = currentProgress;

  // Calculate certificate eligibility
  const isCertificateEligible = () => {
    const meetsCompletion = overall_percentage >= certificateRequirements.min_completion_percentage;
    const meetsGrade = !certificateRequirements.min_final_grade ||
      (final_grade !== undefined && final_grade >= certificateRequirements.min_final_grade);
    const meetsAttendance = !certificateRequirements.required_attendance ||
      attendance_count >= certificateRequirements.required_attendance;
    const meetsRequiredItems = certificateRequirements.required_items.every(itemId =>
      progressItems.find(item => item.id === itemId)?.completed
    );

    return meetsCompletion && meetsGrade && meetsAttendance && meetsRequiredItems;
  };

  // Group progress items by type
  const groupedItems = progressItems.reduce((groups, item) => {
    if (!groups[item.type]) {
      groups[item.type] = [];
    }
    groups[item.type].push(item);
    return groups;
  }, {} as Record<string, ProgressItem[]>);

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return locale === 'fa'
      ? date.toLocaleDateString('fa-IR')
      : date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric'
        });
  };

  const getTypeLabel = (type: string) => {
    const labels = {
      lesson: locale === 'fa' ? 'درس‌ها' : 'Lessons',
      quiz: locale === 'fa' ? 'آزمون‌ها' : 'Quizzes',
      assignment: locale === 'fa' ? 'تکالیف' : 'Assignments',
      project: locale === 'fa' ? 'پروژه‌ها' : 'Projects',
      attendance: locale === 'fa' ? 'حضور و غیاب' : 'Attendance'
    };
    return labels[type as keyof typeof labels] || type;
  };

  const getTypeIcon = (type: string) => {
    const icons = {
      lesson: '📚',
      quiz: '📝',
      assignment: '📋',
      project: '💼',
      attendance: '👥'
    };
    return icons[type as keyof typeof icons] || '📄';
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-green-500';
    if (percentage >= 70) return 'bg-blue-500';
    if (percentage >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const remainingRequirements = () => {
    const requirements = [];

    if (overall_percentage < certificateRequirements.min_completion_percentage) {
      requirements.push({
        text: locale === 'fa'
          ? `${certificateRequirements.min_completion_percentage - overall_percentage}% تکمیل بیشتر`
          : `${certificateRequirements.min_completion_percentage - overall_percentage}% more completion`,
        type: 'completion'
      });
    }

    if (certificateRequirements.min_final_grade &&
        (final_grade === undefined || final_grade < certificateRequirements.min_final_grade)) {
      requirements.push({
        text: locale === 'fa'
          ? `حداقل نمره ${certificateRequirements.min_final_grade}%`
          : `Minimum grade ${certificateRequirements.min_final_grade}%`,
        type: 'grade'
      });
    }

    if (certificateRequirements.required_attendance &&
        attendance_count < certificateRequirements.required_attendance) {
      requirements.push({
        text: locale === 'fa'
          ? `${certificateRequirements.required_attendance - attendance_count} جلسه حضور بیشتر`
          : `${certificateRequirements.required_attendance - attendance_count} more attendance sessions`,
        type: 'attendance'
      });
    }

    return requirements;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-background-darkest p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-text">
          {locale === 'fa' ? 'پیشرفت تحصیلی' : 'Learning Progress'}
        </h3>
        <div className="flex items-center gap-3">
          {isCertificateEligible() ? (
            <div className="flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
              <svg className="w-4 h-4 ml-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              {locale === 'fa' ? 'آماده گواهینامه' : 'Certificate Ready'}
            </div>
          ) : (
            <div className="flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              {locale === 'fa' ? 'در حال پیشرفت' : 'In Progress'}
            </div>
          )}
        </div>
      </div>

      {/* Overall Progress */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-lg font-semibold text-text">
            {locale === 'fa' ? 'پیشرفت کلی' : 'Overall Progress'}
          </span>
          <span className="text-2xl font-bold text-primary">
            {overall_percentage}%
          </span>
        </div>

        <div className="w-full bg-background-secondary rounded-full h-4">
          <div
            className={`h-4 rounded-full transition-all duration-500 ${getProgressColor(overall_percentage)}`}
            style={{ width: `${Math.min(overall_percentage, 100)}%` }}
          />
        </div>

        {/* Progress Stats */}
        <div className="flex flex-wrap gap-6 pt-2">
          <div className="flex flex-col items-center">
            <span className="text-2xl font-bold text-text">{lessons_completed}</span>
            <span className="text-sm text-text-secondary">
              /{total_lessons} {locale === 'fa' ? 'درس' : 'lessons'}
            </span>
          </div>

          {total_quizzes > 0 && (
            <div className="flex flex-col items-center">
              <span className="text-2xl font-bold text-text">{quizzes_completed}</span>
              <span className="text-sm text-text-secondary">
                /{total_quizzes} {locale === 'fa' ? 'آزمون' : 'quizzes'}
              </span>
            </div>
          )}

          {total_assignments > 0 && (
            <div className="flex flex-col items-center">
              <span className="text-2xl font-bold text-text">{assignments_completed}</span>
              <span className="text-sm text-text-secondary">
                /{total_assignments} {locale === 'fa' ? 'تکلیف' : 'assignments'}
              </span>
            </div>
          )}

          {required_attendance > 0 && (
            <div className="flex flex-col items-center">
              <span className="text-2xl font-bold text-text">{attendance_count}</span>
              <span className="text-sm text-text-secondary">
                /{required_attendance} {locale === 'fa' ? 'حضور' : 'sessions'}
              </span>
            </div>
          )}

          {final_grade !== undefined && (
            <div className="flex flex-col items-center">
              <span className={`text-2xl font-bold ${
                final_grade >= passing_grade ? 'text-green-600' : 'text-red-500'
              }`}>
                {final_grade}%
              </span>
              <span className="text-sm text-text-secondary">
                {locale === 'fa' ? 'نمره نهایی' : 'final grade'}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Certificate Requirements */}
      <div className="border-t border-background-darkest pt-4">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-semibold text-text">
            {locale === 'fa' ? 'شرایط گواهینامه' : 'Certificate Requirements'}
          </h4>
          {estimatedTimeToCompletion && !isCertificateEligible() && (
            <div className="text-sm text-text-secondary">
              {locale === 'fa' ? 'زمان تقریبی باقیمانده:' : 'Est. time remaining:'}
              <span className="font-medium text-primary mr-1">
                {estimatedTimeToCompletion}h
              </span>
            </div>
          )}
        </div>

        {isCertificateEligible() ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center ml-3">
                <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <p className="text-green-800 font-semibold">
                  🎉 {locale === 'fa' ? 'تبریک! شما واجد شرایط دریافت گواهینامه هستید' : 'Congratulations! You are eligible for a certificate'}
                </p>
                <p className="text-green-700 text-sm mt-1">
                  {locale === 'fa'
                    ? 'گواهینامه شما به‌زودی آماده خواهد شد'
                    : 'Your certificate will be ready soon'}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {remainingRequirements().map((req, index) => (
              <div key={index} className="flex items-center p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="w-6 h-6 bg-amber-100 rounded-full flex items-center justify-center ml-3">
                  <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="text-amber-800 font-medium">{req.text}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Detailed Progress Items */}
      <div className="border-t border-background-darkest pt-4">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-semibold text-text">
            {locale === 'fa' ? 'جزئیات پیشرفت' : 'Progress Details'}
          </h4>
          <button
            onClick={() => setShowAllItems(!showAllItems)}
            className="text-sm text-primary hover:text-primary-dark font-medium"
          >
            {showAllItems
              ? (locale === 'fa' ? 'کمتر نمایش بده' : 'Show Less')
              : (locale === 'fa' ? 'نمایش همه' : 'Show All')
            }
          </button>
        </div>

        <div className="space-y-4">
          {Object.entries(groupedItems).slice(0, showAllItems ? undefined : 2).map(([type, items]) => (
            <div key={type} className="border border-background-darkest rounded-lg">
              <button
                onClick={() => toggleSection(type)}
                className="w-full flex items-center justify-between p-4 text-right hover:bg-background-primary transition-colors"
              >
                <div className="flex items-center">
                  <span className="text-xl ml-3">{getTypeIcon(type)}</span>
                  <div>
                    <span className="font-medium text-text">{getTypeLabel(type)}</span>
                    <div className="text-sm text-text-secondary">
                      {items.filter(item => item.completed).length} / {items.length}
                      {locale === 'fa' ? ' تکمیل شده' : ' completed'}
                    </div>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="text-sm font-semibold text-text ml-3">
                    {Math.round((items.filter(item => item.completed).length / items.length) * 100)}%
                  </div>
                  <svg
                    className={`w-5 h-5 text-text-secondary transition-transform ${
                      expandedSections.has(type) ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>

              {expandedSections.has(type) && (
                <div className="border-t border-background-darkest">
                  {items.map((item, index) => (
                    <div key={item.id} className="flex items-center justify-between p-4 border-b border-background-primary last:border-b-0">
                      <div className="flex items-center flex-1">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center ml-3 ${
                          item.completed
                            ? 'bg-green-100 text-green-600'
                            : item.required_for_certificate
                              ? 'bg-red-100 text-red-600'
                              : 'bg-gray-100 text-gray-400'
                        }`}>
                          {item.completed ? (
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          ) : (
                            <span className="text-xs font-bold">{index + 1}</span>
                          )}
                        </div>

                        <div className="flex-1">
                          <p className={`font-medium ${item.completed ? 'text-text' : 'text-text-secondary'}`}>
                            {locale === 'fa' && item.title ? item.title : (item.title_en || item.title)}
                          </p>

                          <div className="flex items-center gap-4 mt-1">
                            {item.score !== undefined && item.max_score && (
                              <span className={`text-sm ${
                                item.score >= (item.max_score * 0.7) ? 'text-green-600' : 'text-red-500'
                              }`}>
                                {item.score}/{item.max_score}
                              </span>
                            )}

                            {item.due_date && !item.completed && (
                              <span className="text-sm text-amber-600">
                                {locale === 'fa' ? 'مهلت:' : 'Due:'} {formatDate(item.due_date)}
                              </span>
                            )}

                            {item.completion_date && (
                              <span className="text-sm text-green-600">
                                {locale === 'fa' ? 'تکمیل شده:' : 'Completed:'} {formatDate(item.completion_date)}
                              </span>
                            )}

                            {item.required_for_certificate && !item.completed && (
                              <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">
                                {locale === 'fa' ? 'ضروری' : 'Required'}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4 border-t border-background-darkest">
        <button
          onClick={() => router.push(`/${locale}/user/certificates`)}
          className="flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
        >
          <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          {locale === 'fa' ? 'مشاهده گواهینامه‌ها' : 'View Certificates'}
        </button>

        <button
          onClick={() => router.push(`/${locale}/user/dashboard`)}
          className="flex items-center px-4 py-2 border border-primary text-primary rounded-lg hover:bg-primary hover:text-white transition-colors"
        >
          <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          {locale === 'fa' ? 'داشبورد' : 'Dashboard'}
        </button>
      </div>
    </div>
  );
}

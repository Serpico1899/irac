'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface NotificationData {
  id: string;
  type: 'course_completed' | 'certificate_ready' | 'certificate_issued' | 'milestone_reached';
  title: string;
  title_en?: string;
  message: string;
  message_en?: string;
  course_id?: string;
  course_name?: string;
  course_name_en?: string;
  certificate_id?: string;
  certificate_number?: string;
  completion_date?: string;
  certificate_issue_date?: string;
  final_grade?: number;
  points_earned?: number;
  achievement_unlocked?: string;
  is_read: boolean;
  created_at: string;
  actions?: {
    primary?: {
      label: string;
      label_en?: string;
      action: string;
      url?: string;
    };
    secondary?: {
      label: string;
      label_en?: string;
      action: string;
      url?: string;
    };
  };
}

interface CompletionNotificationProps {
  notifications: NotificationData[];
  locale: string;
  onNotificationRead?: (notificationId: string) => void;
  onNotificationDismiss?: (notificationId: string) => void;
  autoHideAfter?: number; // milliseconds
  showMaxCount?: number;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'center';
  className?: string;
}

export default function CompletionNotification({
  notifications,
  locale,
  onNotificationRead,
  onNotificationDismiss,
  autoHideAfter = 10000,
  showMaxCount = 3,
  position = 'top-right',
  className = ''
}: CompletionNotificationProps) {
  const router = useRouter();
  const [visibleNotifications, setVisibleNotifications] = useState<string[]>([]);
  const [animatingOut, setAnimatingOut] = useState<Set<string>>(new Set());

  // Show unread notifications
  useEffect(() => {
    const unreadNotifications = notifications
      .filter(n => !n.is_read)
      .slice(0, showMaxCount)
      .map(n => n.id);

    setVisibleNotifications(unreadNotifications);
  }, [notifications, showMaxCount]);

  // Auto-hide notifications
  useEffect(() => {
    if (autoHideAfter > 0) {
      const timers = visibleNotifications.map(id =>
        setTimeout(() => {
          handleDismiss(id);
        }, autoHideAfter)
      );

      return () => {
        timers.forEach(timer => clearTimeout(timer));
      };
    }
  }, [visibleNotifications, autoHideAfter]);

  const handleDismiss = (notificationId: string) => {
    setAnimatingOut(prev => new Set([...prev, notificationId]));

    setTimeout(() => {
      setVisibleNotifications(prev => prev.filter(id => id !== notificationId));
      setAnimatingOut(prev => {
        const newSet = new Set(prev);
        newSet.delete(notificationId);
        return newSet;
      });
      onNotificationDismiss?.(notificationId);
    }, 300);
  };

  const handleAction = (notification: NotificationData, actionType: 'primary' | 'secondary') => {
    const action = notification.actions?.[actionType];
    if (!action) return;

    // Mark as read
    if (onNotificationRead && !notification.is_read) {
      onNotificationRead(notification.id);
    }

    // Handle action
    switch (action.action) {
      case 'download_certificate':
        router.push(`/${locale}/user/certificates/download/${notification.certificate_id}`);
        break;
      case 'view_certificates':
        router.push(`/${locale}/user/certificates`);
        break;
      case 'view_course':
        router.push(`/${locale}/courses/${notification.course_id}`);
        break;
      case 'view_dashboard':
        router.push(`/${locale}/user/dashboard`);
        break;
      case 'external_url':
        if (action.url) {
          window.open(action.url, '_blank');
        }
        break;
      default:
        if (action.url) {
          router.push(action.url);
        }
        break;
    }

    // Auto-dismiss after action
    handleDismiss(notification.id);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'course_completed':
        return '🎉';
      case 'certificate_ready':
      case 'certificate_issued':
        return '🏆';
      case 'milestone_reached':
        return '⭐';
      default:
        return '✨';
    }
  };

  const getNotificationColors = (type: string) => {
    switch (type) {
      case 'course_completed':
        return {
          bg: 'bg-green-50',
          border: 'border-green-200',
          icon: 'bg-green-100 text-green-600',
          title: 'text-green-800',
          message: 'text-green-700',
          primary: 'bg-green-600 hover:bg-green-700',
          secondary: 'border-green-600 text-green-600 hover:bg-green-50'
        };
      case 'certificate_ready':
      case 'certificate_issued':
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          icon: 'bg-blue-100 text-blue-600',
          title: 'text-blue-800',
          message: 'text-blue-700',
          primary: 'bg-blue-600 hover:bg-blue-700',
          secondary: 'border-blue-600 text-blue-600 hover:bg-blue-50'
        };
      case 'milestone_reached':
        return {
          bg: 'bg-yellow-50',
          border: 'border-yellow-200',
          icon: 'bg-yellow-100 text-yellow-600',
          title: 'text-yellow-800',
          message: 'text-yellow-700',
          primary: 'bg-yellow-600 hover:bg-yellow-700',
          secondary: 'border-yellow-600 text-yellow-600 hover:bg-yellow-50'
        };
      default:
        return {
          bg: 'bg-primary-light',
          border: 'border-primary',
          icon: 'bg-primary text-white',
          title: 'text-primary-dark',
          message: 'text-text',
          primary: 'bg-primary hover:bg-primary-dark',
          secondary: 'border-primary text-primary hover:bg-primary-light'
        };
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return locale === 'fa'
      ? date.toLocaleDateString('fa-IR')
      : date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
  };

  const getPositionClasses = () => {
    const baseClasses = 'fixed z-50 pointer-events-none';
    switch (position) {
      case 'top-right':
        return `${baseClasses} top-4 left-4`;
      case 'top-left':
        return `${baseClasses} top-4 right-4`;
      case 'bottom-right':
        return `${baseClasses} bottom-4 left-4`;
      case 'bottom-left':
        return `${baseClasses} bottom-4 right-4`;
      case 'center':
        return `${baseClasses} top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2`;
      default:
        return `${baseClasses} top-4 left-4`;
    }
  };

  if (visibleNotifications.length === 0) {
    return null;
  }

  return (
    <div className={`${getPositionClasses()} ${className}`}>
      <div className="flex flex-col gap-3 max-w-sm">
        {visibleNotifications.map(notificationId => {
          const notification = notifications.find(n => n.id === notificationId);
          if (!notification) return null;

          const colors = getNotificationColors(notification.type);
          const isAnimatingOut = animatingOut.has(notificationId);

          return (
            <div
              key={notificationId}
              className={`pointer-events-auto transform transition-all duration-300 ease-in-out ${
                isAnimatingOut
                  ? 'translate-x-full opacity-0 scale-95'
                  : 'translate-x-0 opacity-100 scale-100'
              }`}
            >
              <div className={`${colors.bg} ${colors.border} border rounded-lg shadow-lg p-4 max-w-sm`}>
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center">
                    <div className={`${colors.icon} w-8 h-8 rounded-full flex items-center justify-center ml-3 flex-shrink-0`}>
                      <span className="text-lg">
                        {getNotificationIcon(notification.type)}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className={`${colors.title} font-semibold text-sm leading-tight`}>
                        {locale === 'fa' && notification.title
                          ? notification.title
                          : (notification.title_en || notification.title)
                        }
                      </h4>
                      {notification.course_name && (
                        <p className="text-xs text-text-secondary mt-1">
                          {locale === 'fa' && notification.course_name
                            ? notification.course_name
                            : (notification.course_name_en || notification.course_name)
                          }
                        </p>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => handleDismiss(notificationId)}
                    className="text-text-secondary hover:text-text flex-shrink-0 p-1 hover:bg-background-secondary rounded-full transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Message */}
                <div className="mb-4">
                  <p className={`${colors.message} text-sm leading-relaxed`}>
                    {locale === 'fa' && notification.message
                      ? notification.message
                      : (notification.message_en || notification.message)
                    }
                  </p>

                  {/* Additional Details */}
                  <div className="flex flex-wrap gap-3 mt-2 text-xs text-text-secondary">
                    {notification.certificate_number && (
                      <span>
                        {locale === 'fa' ? 'شماره:' : 'No:'} {notification.certificate_number}
                      </span>
                    )}
                    {notification.final_grade && (
                      <span>
                        {locale === 'fa' ? 'نمره:' : 'Grade:'} {notification.final_grade}%
                      </span>
                    )}
                    {notification.points_earned && (
                      <span>
                        {locale === 'fa' ? 'امتیاز:' : 'Points:'} +{notification.points_earned}
                      </span>
                    )}
                    {notification.completion_date && (
                      <span>
                        {formatDate(notification.completion_date)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                {notification.actions && (
                  <div className="flex flex-col gap-2">
                    {notification.actions.primary && (
                      <button
                        onClick={() => handleAction(notification, 'primary')}
                        className={`${colors.primary} text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center`}
                      >
                        {locale === 'fa' && notification.actions.primary.label
                          ? notification.actions.primary.label
                          : (notification.actions.primary.label_en || notification.actions.primary.label)
                        }
                      </button>
                    )}

                    {notification.actions.secondary && (
                      <button
                        onClick={() => handleAction(notification, 'secondary')}
                        className={`${colors.secondary} border px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center`}
                      >
                        {locale === 'fa' && notification.actions.secondary.label
                          ? notification.actions.secondary.label
                          : (notification.actions.secondary.label_en || notification.actions.secondary.label)
                        }
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Helper function to create completion notification
export const createCompletionNotification = (data: {
  type: 'course_completed' | 'certificate_ready' | 'certificate_issued';
  courseId: string;
  courseName: string;
  courseNameEn?: string;
  certificateId?: string;
  certificateNumber?: string;
  finalGrade?: number;
  pointsEarned?: number;
  locale: string;
}): NotificationData => {
  const {
    type,
    courseId,
    courseName,
    courseNameEn,
    certificateId,
    certificateNumber,
    finalGrade,
    pointsEarned,
    locale
  } = data;

  const notifications = {
    course_completed: {
      title: locale === 'fa' ? 'تبریک! دوره تکمیل شد' : 'Congratulations! Course Completed',
      title_en: 'Congratulations! Course Completed',
      message: locale === 'fa'
        ? `شما دوره "${courseName}" را با موفقیت تکمیل کردید. گواهینامه شما در حال آماده‌سازی است.`
        : `You have successfully completed "${courseNameEn || courseName}". Your certificate is being prepared.`,
      message_en: `You have successfully completed "${courseNameEn || courseName}". Your certificate is being prepared.`,
      actions: {
        primary: {
          label: locale === 'fa' ? 'مشاهده گواهینامه‌ها' : 'View Certificates',
          label_en: 'View Certificates',
          action: 'view_certificates'
        },
        secondary: {
          label: locale === 'fa' ? 'داشبورد' : 'Dashboard',
          label_en: 'Dashboard',
          action: 'view_dashboard'
        }
      }
    },
    certificate_ready: {
      title: locale === 'fa' ? 'گواهینامه آماده است!' : 'Certificate Ready!',
      title_en: 'Certificate Ready!',
      message: locale === 'fa'
        ? `گواهینامه دوره "${courseName}" آماده دانلود است.`
        : `Your certificate for "${courseNameEn || courseName}" is ready for download.`,
      message_en: `Your certificate for "${courseNameEn || courseName}" is ready for download.`,
      actions: {
        primary: {
          label: locale === 'fa' ? 'دانلود گواهینامه' : 'Download Certificate',
          label_en: 'Download Certificate',
          action: 'download_certificate'
        },
        secondary: {
          label: locale === 'fa' ? 'مشاهده همه' : 'View All',
          label_en: 'View All',
          action: 'view_certificates'
        }
      }
    },
    certificate_issued: {
      title: locale === 'fa' ? 'گواهینامه صادر شد' : 'Certificate Issued',
      title_en: 'Certificate Issued',
      message: locale === 'fa'
        ? `گواهینامه شما با شماره ${certificateNumber} برای دوره "${courseName}" صادر شده است.`
        : `Your certificate #${certificateNumber} for "${courseNameEn || courseName}" has been issued.`,
      message_en: `Your certificate #${certificateNumber} for "${courseNameEn || courseName}" has been issued.`,
      actions: {
        primary: {
          label: locale === 'fa' ? 'دانلود' : 'Download',
          label_en: 'Download',
          action: 'download_certificate'
        },
        secondary: {
          label: locale === 'fa' ? 'اشتراک‌گذاری' : 'Share',
          label_en: 'Share',
          action: 'view_certificates'
        }
      }
    }
  };

  const notificationData = notifications[type];

  return {
    id: `${type}_${courseId}_${Date.now()}`,
    type,
    ...notificationData,
    course_id: courseId,
    course_name: courseName,
    course_name_en: courseNameEn,
    certificate_id: certificateId,
    certificate_number: certificateNumber,
    final_grade: finalGrade,
    points_earned: pointsEarned,
    is_read: false,
    created_at: new Date().toISOString()
  };
};

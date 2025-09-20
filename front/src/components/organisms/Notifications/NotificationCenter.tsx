"use client";

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';

// Icons (you can replace these with your preferred icon library)
const BellIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4.868 4.868l14.264 14.264m0 0l-3.75-3.75m3.75 3.75h-4.5v-4.5" />
  </svg>
);

const SettingsIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const CloseIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const CheckIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

// Notification type icons
const getNotificationIcon = (type: string, className?: string) => {
  const iconClass = className || "w-5 h-5";

  switch (type) {
    case 'COURSE_ENROLLMENT':
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      );
    case 'PAYMENT_SUCCESS':
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    case 'BOOKING_CONFIRMED':
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      );
    case 'CERTIFICATE_READY':
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
        </svg>
      );
    default:
      return <BellIcon className={iconClass} />;
  }
};

// Types
interface Notification {
  id: string;
  type: string;
  category: string;
  title_fa: string;
  title_en: string;
  message_fa: string;
  message_en: string;
  is_read: boolean;
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  created_at: string;
  action_url?: string;
  action_label_fa?: string;
  action_label_en?: string;
}

interface NotificationCenterProps {
  locale: string;
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

export default function NotificationCenter({
  locale,
  isOpen,
  onClose,
  className = ""
}: NotificationCenterProps) {
  const t = useTranslations('notifications');
  const isRTL = locale === 'fa';

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  // Mock notifications for development
  const mockNotifications: Notification[] = [
    {
      id: '1',
      type: 'COURSE_ENROLLMENT',
      category: 'COURSE',
      title_fa: 'ثبت‌نام در دوره',
      title_en: 'Course Enrollment',
      message_fa: 'شما با موفقیت در دوره "معماری پایدار" ثبت‌نام شدید',
      message_en: 'You have successfully enrolled in the course "Sustainable Architecture"',
      is_read: false,
      priority: 'HIGH',
      created_at: new Date().toISOString(),
      action_url: '/user/courses',
      action_label_fa: 'مشاهده دوره‌ها',
      action_label_en: 'View Courses'
    },
    {
      id: '2',
      type: 'PAYMENT_SUCCESS',
      category: 'PAYMENT',
      title_fa: 'پرداخت موفق',
      title_en: 'Payment Successful',
      message_fa: 'پرداخت شما به مبلغ 2,500,000 تومان انجام شد',
      message_en: 'Your payment of 2,500,000 IRR has been processed',
      is_read: true,
      priority: 'NORMAL',
      created_at: new Date(Date.now() - 3600000).toISOString(),
      action_url: '/user/payments',
      action_label_fa: 'مشاهده پرداخت‌ها',
      action_label_en: 'View Payments'
    },
    {
      id: '3',
      type: 'CERTIFICATE_READY',
      category: 'CERTIFICATE',
      title_fa: 'گواهینامه آماده',
      title_en: 'Certificate Ready',
      message_fa: 'گواهینامه دوره "طراحی داخلی" شما آماده دانلود است',
      message_en: 'Your certificate for "Interior Design" is ready for download',
      is_read: false,
      priority: 'HIGH',
      created_at: new Date(Date.now() - 7200000).toISOString(),
      action_url: '/user/certificates',
      action_label_fa: 'دانلود گواهینامه',
      action_label_en: 'Download Certificate'
    }
  ];

  // Load notifications
  const loadNotifications = useCallback(async () => {
    setLoading(true);
    try {
      // In real implementation, this would be an API call
      await new Promise(resolve => setTimeout(resolve, 500));
      setNotifications(mockNotifications);
      setUnreadCount(mockNotifications.filter(n => !n.is_read).length);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      loadNotifications();
    }
  }, [isOpen, loadNotifications]);

  // Mark notification as read
  const markAsRead = async (notificationId: string) => {
    try {
      // Update local state immediately
      setNotifications(prev =>
        prev.map(n =>
          n.id === notificationId ? { ...n, is_read: true } : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));

      // In real implementation, make API call
      // await api.markNotificationAsRead(notificationId);
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      // Revert state on error
      loadNotifications();
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      setNotifications(prev =>
        prev.map(n => ({ ...n, is_read: true }))
      );
      setUnreadCount(0);

      // In real implementation, make API call
      // await api.markAllNotificationsAsRead();
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
      loadNotifications();
    }
  };

  // Format relative time
  const formatRelativeTime = (dateString: string, locale: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / 60000);

    if (diffInMinutes < 1) {
      return locale === 'fa' ? 'همین الان' : 'Just now';
    } else if (diffInMinutes < 60) {
      return locale === 'fa' ? `${diffInMinutes} دقیقه پیش` : `${diffInMinutes} minutes ago`;
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return locale === 'fa' ? `${hours} ساعت پیش` : `${hours} hours ago`;
    } else {
      const days = Math.floor(diffInMinutes / 1440);
      return locale === 'fa' ? `${days} روز پیش` : `${days} days ago`;
    }
  };

  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT': return 'text-red-500';
      case 'HIGH': return 'text-orange-500';
      case 'NORMAL': return 'text-primary';
      case 'LOW': return 'text-text-light';
      default: return 'text-text-light';
    }
  };

  // Filter notifications
  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread') return !notification.is_read;
    return true;
  });

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-25 z-40"
            onClick={onClose}
          />

          {/* Notification Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.2 }}
            className={`fixed ${isRTL ? 'left-4' : 'right-4'} top-16 z-50 ${className}`}
            style={{ maxHeight: 'calc(100vh - 100px)' }}
          >
            <div className="flex flex-col w-96 bg-white shadow-2xl rounded-lg border border-background-darkest overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-background-darkest bg-background-primary">
                <div className="flex items-center gap-3">
                  <BellIcon className="w-5 h-5 text-primary" />
                  <h3 className="text-lg font-bold text-text-primary">{t('title')}</h3>
                  {unreadCount > 0 && (
                    <span className="flex items-center justify-center w-6 h-6 bg-primary text-white text-xs font-bold rounded-full">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={markAllAsRead}
                    disabled={unreadCount === 0}
                    className={`text-sm px-3 py-1 rounded-md transition-colors ${
                      unreadCount > 0
                        ? 'text-primary hover:bg-primary hover:text-white'
                        : 'text-text-light cursor-not-allowed'
                    }`}
                  >
                    {t('markAllRead')}
                  </button>

                  <button
                    className="p-2 hover:bg-background-secondary rounded-md transition-colors"
                    title={t('settings') || 'Settings'}
                  >
                    <SettingsIcon className="w-4 h-4 text-text-secondary" />
                  </button>

                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-background-secondary rounded-md transition-colors"
                    title={isRTL ? 'بستن' : 'Close'}
                  >
                    <CloseIcon className="w-4 h-4 text-text-secondary" />
                  </button>
                </div>
              </div>

              {/* Filter Tabs */}
              <div className="flex border-b border-background-darkest bg-white">
                <button
                  onClick={() => setFilter('all')}
                  className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                    filter === 'all'
                      ? 'text-primary border-b-2 border-primary bg-background-primary'
                      : 'text-text-secondary hover:text-text-primary hover:bg-background-primary'
                  }`}
                >
                  {t('all') || (locale === 'fa' ? 'همه' : 'All')} ({notifications.length})
                </button>
                <button
                  onClick={() => setFilter('unread')}
                  className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                    filter === 'unread'
                      ? 'text-primary border-b-2 border-primary bg-background-primary'
                      : 'text-text-secondary hover:text-text-primary hover:bg-background-primary'
                  }`}
                >
                  {t('unread') || (locale === 'fa' ? 'خوانده نشده' : 'Unread')} ({unreadCount})
                </button>
              </div>

              {/* Notification List */}
              <div className="flex flex-col max-h-96 overflow-y-auto">
                {loading ? (
                  <div className="flex items-center justify-center p-8">
                    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : filteredNotifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-8 text-text-secondary">
                    <BellIcon className="w-12 h-12 mb-3 opacity-30" />
                    <p className="text-sm font-medium mb-1">
                      {t('noNotifications') || (locale === 'fa' ? 'اعلانی وجود ندارد' : 'No notifications')}
                    </p>
                    <p className="text-xs">
                      {filter === 'unread'
                        ? (locale === 'fa' ? 'همه اعلان‌ها خوانده شده‌اند' : 'All notifications are read')
                        : (locale === 'fa' ? 'اعلان جدیدی ندارید' : 'You have no new notifications')
                      }
                    </p>
                  </div>
                ) : (
                  filteredNotifications.map((notification) => (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex p-4 border-b border-background-darkest hover:bg-background-primary transition-colors cursor-pointer ${
                        !notification.is_read ? 'bg-blue-50' : ''
                      }`}
                      onClick={() => !notification.is_read && markAsRead(notification.id)}
                    >
                      <div className="flex items-start gap-3 flex-1">
                        {/* Notification Icon */}
                        <div className={`flex-shrink-0 p-2 rounded-full ${
                          !notification.is_read ? 'bg-primary bg-opacity-10' : 'bg-background-secondary'
                        }`}>
                          {getNotificationIcon(notification.type, `w-4 h-4 ${getPriorityColor(notification.priority)}`)}
                        </div>

                        {/* Content */}
                        <div className="flex flex-col flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h4 className={`font-bold text-sm leading-tight ${
                              !notification.is_read ? 'text-text-primary' : 'text-text-secondary'
                            }`}>
                              {locale === 'fa' ? notification.title_fa : notification.title_en}
                            </h4>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              {!notification.is_read && (
                                <div className="w-2 h-2 bg-primary rounded-full"></div>
                              )}
                              <span className="text-xs text-text-light">
                                {formatRelativeTime(notification.created_at, locale)}
                              </span>
                            </div>
                          </div>

                          <p className="text-sm text-text-secondary leading-relaxed mb-2">
                            {locale === 'fa' ? notification.message_fa : notification.message_en}
                          </p>

                          {notification.action_url && (
                            <button className="text-xs text-primary hover:text-primary-dark font-medium self-start">
                              {locale === 'fa'
                                ? (notification.action_label_fa || t('viewDetails'))
                                : (notification.action_label_en || t('viewDetails'))
                              }
                            </button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>

              {/* Footer */}
              {filteredNotifications.length > 0 && (
                <div className="flex items-center justify-center p-4 border-t border-background-darkest bg-background-primary">
                  <button className="text-sm text-primary hover:text-primary-dark font-medium">
                    {t('viewAllNotifications') || (locale === 'fa' ? 'مشاهده همه اعلان‌ها' : 'View all notifications')}
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

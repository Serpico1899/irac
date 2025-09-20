"use client";

import { useState, useEffect, useCallback, useRef } from 'react';

export interface Notification {
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

interface NotificationFilters {
  read_status?: 'all' | 'read' | 'unread';
  category?: string;
  type?: string;
  priority?: string;
  limit?: number;
  offset?: number;
}

interface UseNotificationsOptions {
  userId?: string;
  autoRefresh?: boolean;
  refreshInterval?: number; // in milliseconds
  enableRealTime?: boolean;
}

interface UseNotificationsReturn {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  // Actions
  loadNotifications: (filters?: NotificationFilters) => Promise<void>;
  loadMore: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  refresh: () => Promise<void>;
  // Filters
  setFilters: (filters: NotificationFilters) => void;
  filters: NotificationFilters;
}

const MOCK_NOTIFICATIONS: Notification[] = [
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
  },
  {
    id: '4',
    type: 'BOOKING_REMINDER',
    category: 'BOOKING',
    title_fa: 'یادآوری رزرو',
    title_en: 'Booking Reminder',
    message_fa: 'رزرو فضای کاری شما فردا ساعت 10 صبح است',
    message_en: 'Your workspace booking is tomorrow at 10 AM',
    is_read: false,
    priority: 'URGENT',
    created_at: new Date(Date.now() - 1800000).toISOString(),
    action_url: '/user/bookings',
    action_label_fa: 'مشاهده رزروها',
    action_label_en: 'View Bookings'
  }
];

export const useNotifications = (options: UseNotificationsOptions = {}): UseNotificationsReturn => {
  const {
    userId,
    autoRefresh = false,
    refreshInterval = 30000, // 30 seconds
    enableRealTime = false
  } = options;

  // State
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [filters, setFilters] = useState<NotificationFilters>({
    read_status: 'all',
    limit: 20,
    offset: 0
  });

  // Refs
  const refreshIntervalRef = useRef<NodeJS.Timeout>();
  const abortControllerRef = useRef<AbortController>();

  // Calculate unread count
  const updateUnreadCount = useCallback((notificationList: Notification[]) => {
    const count = notificationList.filter(n => !n.is_read).length;
    setUnreadCount(count);
  }, []);

  // Mock API call - replace with actual API
  const fetchNotifications = async (fetchFilters: NotificationFilters = {}): Promise<{
    notifications: Notification[];
    total: number;
    hasMore: boolean;
  }> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const { read_status = 'all', limit = 20, offset = 0 } = fetchFilters;

    let filteredNotifications = [...MOCK_NOTIFICATIONS];

    // Apply read status filter
    if (read_status === 'read') {
      filteredNotifications = filteredNotifications.filter(n => n.is_read);
    } else if (read_status === 'unread') {
      filteredNotifications = filteredNotifications.filter(n => !n.is_read);
    }

    // Apply pagination
    const start = offset;
    const end = start + limit;
    const paginatedNotifications = filteredNotifications.slice(start, end);

    return {
      notifications: paginatedNotifications,
      total: filteredNotifications.length,
      hasMore: end < filteredNotifications.length
    };
  };

  // Load notifications
  const loadNotifications = useCallback(async (loadFilters?: NotificationFilters) => {
    if (loading) return;

    setLoading(true);
    setError(null);

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    try {
      const finalFilters = { ...filters, ...loadFilters };

      const response = await fetchNotifications(finalFilters);

      if (loadFilters?.offset === 0) {
        // Fresh load - replace notifications
        setNotifications(response.notifications);
      } else {
        // Load more - append notifications
        setNotifications(prev => [...prev, ...response.notifications]);
      }

      setHasMore(response.hasMore);
      updateUnreadCount(response.notifications);

      // Update filters
      if (loadFilters) {
        setFilters(finalFilters);
      }

    } catch (err: any) {
      if (err.name !== 'AbortError') {
        setError(err.message || 'Failed to load notifications');
      }
    } finally {
      setLoading(false);
    }
  }, [filters, loading, updateUnreadCount]);

  // Load more notifications
  const loadMore = useCallback(async () => {
    if (!hasMore || loading) return;

    await loadNotifications({
      ...filters,
      offset: notifications.length
    });
  }, [hasMore, loading, notifications.length, filters, loadNotifications]);

  // Mark single notification as read
  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      // Optimistic update
      setNotifications(prev =>
        prev.map(notification =>
          notification.id === notificationId
            ? { ...notification, is_read: true }
            : notification
        )
      );

      // Update unread count immediately
      setUnreadCount(prev => Math.max(0, prev - 1));

      // Mock API call - replace with actual API
      // await api.markNotificationAsRead(notificationId);

    } catch (err: any) {
      setError(err.message || 'Failed to mark notification as read');
      // Revert optimistic update on error
      await refresh();
    }
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    try {
      // Optimistic update
      setNotifications(prev =>
        prev.map(notification => ({ ...notification, is_read: true }))
      );

      setUnreadCount(0);

      // Mock API call - replace with actual API
      // await api.markAllNotificationsAsRead(userId);

    } catch (err: any) {
      setError(err.message || 'Failed to mark all notifications as read');
      // Revert optimistic update on error
      await refresh();
    }
  }, []);

  // Refresh notifications
  const refresh = useCallback(async () => {
    await loadNotifications({ ...filters, offset: 0 });
  }, [loadNotifications, filters]);

  // Set filters and reload
  const setFiltersAndReload = useCallback((newFilters: NotificationFilters) => {
    const updatedFilters = { ...filters, ...newFilters, offset: 0 };
    setFilters(updatedFilters);
    loadNotifications(updatedFilters);
  }, [filters, loadNotifications]);

  // Initial load
  useEffect(() => {
    loadNotifications();
  }, []);

  // Auto refresh
  useEffect(() => {
    if (autoRefresh && refreshInterval > 0) {
      refreshIntervalRef.current = setInterval(() => {
        refresh();
      }, refreshInterval);

      return () => {
        if (refreshIntervalRef.current) {
          clearInterval(refreshIntervalRef.current);
        }
      };
    }
  }, [autoRefresh, refreshInterval, refresh]);

  // Real-time updates (WebSocket or Server-Sent Events)
  useEffect(() => {
    if (!enableRealTime || !userId) return;

    // Mock real-time updates
    const interval = setInterval(() => {
      // Simulate new notification
      const hasUnreadNotifications = notifications.some(n => !n.is_read);
      if (Math.random() > 0.9 && !hasUnreadNotifications) {
        const newNotification: Notification = {
          id: `real-time-${Date.now()}`,
          type: 'SYSTEM_ANNOUNCEMENT',
          category: 'SYSTEM',
          title_fa: 'اعلان جدید',
          title_en: 'New Announcement',
          message_fa: 'این یک اعلان تست در زمان واقعی است',
          message_en: 'This is a test real-time notification',
          is_read: false,
          priority: 'NORMAL',
          created_at: new Date().toISOString()
        };

        setNotifications(prev => [newNotification, ...prev]);
        setUnreadCount(prev => prev + 1);
      }
    }, 10000); // Every 10 seconds

    return () => clearInterval(interval);
  }, [enableRealTime, userId, notifications]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    hasMore,
    loadNotifications,
    loadMore,
    markAsRead,
    markAllAsRead,
    refresh,
    setFilters: setFiltersAndReload,
    filters
  };
};

export default useNotifications;

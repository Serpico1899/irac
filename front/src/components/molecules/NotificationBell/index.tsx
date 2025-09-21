"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface NotificationBellProps {
  unreadCount: number;
  onClick: () => void;
  locale: string;
  className?: string;
  size?: 'small' | 'medium' | 'large';
}

const NotificationBell = ({
  unreadCount,
  onClick,
  locale,
  className = "",
  size = 'medium'
}: NotificationBellProps) => {
  const [isPressed, setIsPressed] = useState(false);

  const sizeConfig = {
    small: {
      icon: 'w-5 h-5',
      container: 'p-1.5',
      badge: 'w-4 h-4 text-xs',
      badgePosition: '-top-1 -right-1'
    },
    medium: {
      icon: 'w-6 h-6',
      container: 'p-2',
      badge: 'w-5 h-5 text-xs',
      badgePosition: '-top-1 -right-1'
    },
    large: {
      icon: 'w-7 h-7',
      container: 'p-2.5',
      badge: 'w-6 h-6 text-sm',
      badgePosition: '-top-2 -right-2'
    }
  };

  const config = sizeConfig[size];

  const handleClick = () => {
    setIsPressed(true);
    setTimeout(() => setIsPressed(false), 150);
    onClick();
  };

  const bellIcon = (
    <svg
      className={`${config.icon} transition-all duration-200`}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M15 17h5l-5 5v-5zM4.868 4.868l14.264 14.264m0 0l-3.75-3.75m3.75 3.75h-4.5v-4.5"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M15 17h5l-5 5v-5zM4.868 4.868l14.264 14.264m0 0l-3.75-3.75m3.75 3.75h-4.5v-4.5"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M15 17h5l-5 5v-5z"
      />
    </svg>
  );

  // Better bell icon
  const betterBellIcon = (
    <svg
      className={`${config.icon} transition-all duration-200`}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M15 17h5l-5 5v-5z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M13.828 10.172a4 4 0 00-5.656 0l-.707.707a1 1 0 01-1.414 0l-.707-.707a6 6 0 018.485 0l-.707.707a1 1 0 01-1.414 0l-.707-.707z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 21h6"
      />
    </svg>
  );

  // Actual bell icon
  const actualBellIcon = (
    <svg
      className={`${config.icon} transition-all duration-200`}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M15 17h5l-5 5v-5z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M18 8a6 6 0 01-12 0c0-3 0-5 6-5s6 2 6 5z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M13.73 21a2 2 0 01-3.46 0"
      />
    </svg>
  );

  // Final proper bell icon
  const finalBellIcon = (
    <svg
      className={`${config.icon} transition-all duration-200`}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M13.73 21a2 2 0 0 1-3.46 0"
      />
    </svg>
  );

  return (
    <motion.button
      onClick={handleClick}
      className={`
        relative flex items-center justify-center rounded-full
        ${config.container}
        text-text-primary hover:text-primary
        hover:bg-background-primary
        focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50
        transition-all duration-200 ease-in-out
        ${className}
      `}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      animate={isPressed ? { scale: 0.9 } : { scale: 1 }}
      transition={{ duration: 0.1 }}
      aria-label={
        locale === 'fa'
          ? unreadCount > 0
            ? `اعلان‌ها - ${unreadCount} پیام خوانده نشده`
            : 'اعلان‌ها'
          : unreadCount > 0
            ? `Notifications - ${unreadCount} unread messages`
            : 'Notifications'
      }
      title={
        locale === 'fa'
          ? unreadCount > 0
            ? `${unreadCount} پیام خوانده نشده`
            : 'اعلان‌ها'
          : unreadCount > 0
            ? `${unreadCount} unread notifications`
            : 'Notifications'
      }
    >
      {/* Bell Icon */}
      <motion.div
        animate={unreadCount > 0 ? {
          rotate: [0, 10, -10, 10, -10, 0],
        } : {}}
        transition={{
          duration: 0.6,
          repeat: unreadCount > 0 ? Infinity : 0,
          repeatDelay: 3,
        }}
      >
        {finalBellIcon}
      </motion.div>

      {/* Notification Badge */}
      <AnimatePresence>
        {unreadCount > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            className={`
              absolute ${config.badgePosition} ${config.badge}
              bg-red-500 text-white rounded-full
              flex items-center justify-center
              font-bold shadow-sm
              border-2 border-white
              min-w-0
            `}
            style={{
              background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
            }}
          >
            <span className="leading-none">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pulse animation for new notifications */}
      {unreadCount > 0 && (
        <motion.div
          className={`
            absolute ${config.badgePosition} ${config.badge}
            bg-red-400 rounded-full opacity-75
          `}
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.7, 0, 0.7],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      )}

      {/* Active indicator dot */}
      {unreadCount > 0 && (
        <div className="absolute top-0 right-0 w-2 h-2">
          <motion.div
            className="w-full h-full bg-red-500 rounded-full"
            animate={{
              opacity: [1, 0.3, 1],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </div>
      )}

      {/* Accessibility enhancements */}
      <span className="sr-only">
        {locale === 'fa'
          ? unreadCount > 0
            ? `${unreadCount} اعلان خوانده نشده دارید`
            : 'هیچ اعلان جدیدی ندارید'
          : unreadCount > 0
            ? `You have ${unreadCount} unread notifications`
            : 'No new notifications'
        }
      </span>
    </motion.button>
  );
};

export default NotificationBell;

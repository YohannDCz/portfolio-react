'use client';

import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, CheckCircle, Info, LucideIcon, X, XCircle } from "lucide-react";
import { useEffect, useState } from "react";

// =====================================
// TYPE DEFINITIONS
// =====================================

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

interface NotificationConfig {
  icon: LucideIcon;
  className: string;
}

interface NotificationProps {
  type?: NotificationType;
  title?: string;
  message?: string;
  isVisible?: boolean;
  onClose?: () => void;
  autoClose?: boolean;
  autoCloseDelay?: number;
}

interface NotificationItem extends NotificationProps {
  id: number;
}

interface UseNotificationsReturn {
  notifications: NotificationItem[];
  addNotification: (notification: Omit<NotificationItem, 'id'>) => number;
  removeNotification: (id: number) => void;
  clearAll: () => void;
}

// =====================================
// CONSTANTS
// =====================================

const notificationConfig: Record<NotificationType, NotificationConfig> = {
  success: {
    icon: CheckCircle,
    className: "bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300"
  },
  error: {
    icon: XCircle,
    className: "bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300"
  },
  warning: {
    icon: AlertCircle,
    className: "bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-300"
  },
  info: {
    icon: Info,
    className: "bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300"
  }
};

// =====================================
// NOTIFICATION COMPONENT
// =====================================

/**
 * Notification component with different types and animations
 * @param props - Notification properties
 * @returns JSX Element for notification
 */
export default function Notification({
  type = 'info',
  title,
  message,
  isVisible = false,
  onClose,
  autoClose = true,
  autoCloseDelay = 5000
}: NotificationProps): JSX.Element | null {
  const config = notificationConfig[type] || notificationConfig.info;
  const Icon = config.icon;

  useEffect(() => {
    if (isVisible && autoClose && onClose) {
      const timer = setTimeout(() => {
        onClose();
      }, autoCloseDelay);

      return () => clearTimeout(timer);
    }
  }, [isVisible, autoClose, autoCloseDelay, onClose]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="fixed top-4 right-4 z-50 max-w-sm w-full"
        >
          <div className={`p-4 border rounded-lg shadow-lg backdrop-blur-sm ${config.className}`}>
            <div className="flex items-start gap-3">
              <Icon className="h-5 w-5 mt-0.5 flex-shrink-0" />

              <div className="flex-1 min-w-0">
                {title && (
                  <h4 className="font-semibold text-sm mb-1">{title}</h4>
                )}
                {message && (
                  <p className="text-sm opacity-90">{message}</p>
                )}
              </div>

              {onClose && (
                <button
                  onClick={onClose}
                  className="flex-shrink-0 p-1 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// =====================================
// NOTIFICATIONS HOOK
// =====================================

/**
 * Hook to manage multiple notifications
 * @returns Object with notifications state and management functions
 */
export function useNotifications(): UseNotificationsReturn {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  /**
   * Add a new notification to the queue
   * @param notification - Notification data without ID
   * @returns Generated notification ID
   */
  const addNotification = (notification: Omit<NotificationItem, 'id'>): number => {
    const id = Date.now() + Math.random();
    const newNotification: NotificationItem = { ...notification, id };

    setNotifications(prev => [...prev, newNotification]);

    // Auto-remove after delay
    if (notification.autoClose !== false) {
      setTimeout(() => {
        removeNotification(id);
      }, notification.autoCloseDelay || 5000);
    }

    return id;
  };

  /**
   * Remove notification by ID
   * @param id - Notification ID to remove
   */
  const removeNotification = (id: number): void => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  /**
   * Clear all notifications
   */
  const clearAll = (): void => {
    setNotifications([]);
  };

  return {
    notifications,
    addNotification,
    removeNotification,
    clearAll
  };
}

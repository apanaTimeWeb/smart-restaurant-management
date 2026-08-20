"use client";

// RESPONSIBILITY: Reactive custom hook for consuming and filtering global notifications by role.
// DATA FLOW: localStorage (app_notifications) -> useNotifications -> Header / Notification Drawer UI

import { useState, useEffect, useCallback, useMemo } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { STORAGE_KEYS } from "@/lib/localStorageSeeder";
import {
  markNotificationAsRead,
  markAllNotificationsAsRead,
  clearAllNotifications,
} from "@/lib/notificationService";
import type { AppNotification, UserRole } from "@/types/appTypes";

export interface UseNotificationsReturn {
  notifications: AppNotification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
}

export function useNotifications(role?: UserRole): UseNotificationsReturn {
  const [isMounted, setIsMounted] = useState(false);
  const [allNotifications, setAllNotifications] = useLocalStorage<AppNotification[]>(
    STORAGE_KEYS.NOTIFICATIONS,
    []
  );

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Listen for custom storage_notifications events for real-time cross-component sync
  useEffect(() => {
    function handleCustomEvent() {
      try {
        const raw = window.localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
        if (raw) {
          setAllNotifications(JSON.parse(raw));
        }
      } catch (e) {
        console.error("Failed to sync notifications", e);
      }
    }

    window.addEventListener("storage_notifications", handleCustomEvent);
    return () => window.removeEventListener("storage_notifications", handleCustomEvent);
  }, [setAllNotifications]);

  // Compute role-filtered notifications list
  const notifications = useMemo(() => {
    if (!role) return allNotifications;
    return allNotifications.filter((n) => n.role === "ALL" || n.role === role);
  }, [allNotifications, role]);

  // Compute unread count (returns 0 during SSR/initial hydration to prevent mismatch)
  const unreadCount = useMemo(
    () => (isMounted ? notifications.filter((n) => !n.isRead).length : 0),
    [isMounted, notifications]
  );

  const markAsRead = useCallback(
    (id: string) => {
      setAllNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      markNotificationAsRead(id);
    },
    [setAllNotifications]
  );

  const markAllAsRead = useCallback(() => {
    setAllNotifications((prev) =>
      prev.map((n) =>
        !role || n.role === role || n.role === "ALL"
          ? { ...n, isRead: true }
          : n
      )
    );

    if (role) {
      markAllNotificationsAsRead(role);
    } else {
      try {
        const raw = window.localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
        if (raw) {
          const list: AppNotification[] = JSON.parse(raw);
          const updated = list.map((n) => ({ ...n, isRead: true }));
          window.localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(updated));
          window.dispatchEvent(new Event("storage_notifications"));
        }
      } catch (e) {
        console.error("Failed to mark all read:", e);
      }
    }
  }, [role, setAllNotifications]);

  const clearAll = useCallback(() => {
    setAllNotifications([]);
    clearAllNotifications();
  }, [setAllNotifications]);

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearAll,
  };
}

// RESPONSIBILITY: Centralized Notification Service for dispatching, reading, and clearing notifications across all roles.
// DATA FLOW: Action trigger -> dispatchNotification() -> localStorage (app_notifications) -> useNotifications -> UI

import { STORAGE_KEYS } from "@/lib/localStorageSeeder";
import { playKitchenBell, playVoidAlert, playReadyChime } from "@/lib/audioHelper";
import type { AppNotification, UserRole } from "@/types/appTypes";

/**
 * Dispatches a new notification to localStorage and triggers appropriate sound alerts.
 */
export function dispatchNotification(params: {
  role: UserRole | "ALL";
  userId?: string;
  type: string;
  title: string;
  message: string;
  entityId?: string;
  entityType?: AppNotification["entityType"];
  route?: string;
  playSound?: boolean;
  soundType?: "BELL" | "VOID" | "READY";
}): AppNotification | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    const notifications: AppNotification[] = raw ? JSON.parse(raw) : [];

    const newNotification: AppNotification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      role: params.role,
      userId: params.userId,
      type: params.type,
      title: params.title,
      message: params.message,
      entityId: params.entityId,
      entityType: params.entityType,
      route: params.route,
      isRead: false,
      createdAt: Date.now(),
    };

    const updated = [newNotification, ...notifications].slice(0, 100); // Keep latest 100
    window.localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(updated));

    // Sound alert trigger
    if (params.playSound !== false) {
      if (params.soundType === "BELL" || params.type === "KOT_NEW" || params.type === "SERVICE_REQUEST") {
        playKitchenBell();
      } else if (params.soundType === "VOID" || params.type === "VOID_REQUEST") {
        playVoidAlert();
      } else if (params.soundType === "READY" || params.type === "KOT_READY") {
        playReadyChime();
      }
    }

    // Trigger storage event for same-tab sync
    window.dispatchEvent(new Event("storage_notifications"));

    return newNotification;
  } catch (err) {
    console.error("Failed to dispatch notification:", err);
    return null;
  }
}

/**
 * Marks a specific notification as read.
 */
export function markNotificationAsRead(id: string): void {
  if (typeof window === "undefined") return;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    if (!raw) return;

    const notifications: AppNotification[] = JSON.parse(raw);
    const updated = notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n));
    window.localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(updated));
    window.dispatchEvent(new Event("storage_notifications"));
  } catch (err) {
    console.error("Failed to mark notification read:", err);
  }
}

/**
 * Marks all notifications for a specific role as read.
 */
export function markAllNotificationsAsRead(role: UserRole): void {
  if (typeof window === "undefined") return;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    if (!raw) return;

    const notifications: AppNotification[] = JSON.parse(raw);
    const updated = notifications.map((n) =>
      n.role === role || n.role === "ALL" ? { ...n, isRead: true } : n
    );
    window.localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(updated));
    window.dispatchEvent(new Event("storage_notifications"));
  } catch (err) {
    console.error("Failed to mark all notifications read:", err);
  }
}

/**
 * Clears all notifications.
 */
export function clearAllNotifications(): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify([]));
  window.dispatchEvent(new Event("storage_notifications"));
}

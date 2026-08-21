// RESPONSIBILITY: Centralized Immutable Order Event Timeline Logger.
// DATA FLOW: Action Dispatcher -> recordOrderEvent() -> app_order_events -> OrderTimeline UI component

import { STORAGE_KEYS } from "@/lib/localStorageSeeder";
import type { AppOrderEvent, UserRole } from "@/types/appTypes";

/**
 * Records an event in the order timeline history.
 */
export function recordOrderEvent(params: {
  orderId: string;
  type: string;
  message: string;
  actorId?: string;
  actorName?: string;
  actorRole?: UserRole;
  metadata?: Record<string, unknown>;
}): AppOrderEvent | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.ORDER_EVENTS);
    const events: AppOrderEvent[] = raw ? JSON.parse(raw) : [];

    const newEvent: AppOrderEvent = {
      id: `evt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      orderId: params.orderId,
      type: params.type,
      message: params.message,
      actorId: params.actorId,
      actorName: params.actorName,
      actorRole: params.actorRole,
      timestamp: Date.now(),
      metadata: params.metadata,
    };

    const updated = [newEvent, ...events];
    window.localStorage.setItem(STORAGE_KEYS.ORDER_EVENTS, JSON.stringify(updated));

    return newEvent;
  } catch (err) {
    console.error("Failed to record order event:", err);
    return null;
  }
}

/**
 * Retrieves all events associated with a specific order ID, sorted chronologically.
 */
export function getOrderTimelineEvents(orderId: string): AppOrderEvent[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.ORDER_EVENTS);
    if (!raw) return [];

    const events: AppOrderEvent[] = JSON.parse(raw);
    return events
      .filter((e) => e.orderId === orderId)
      .sort((a, b) => a.timestamp - b.timestamp);
  } catch (err) {
    console.error("Failed to fetch order events:", err);
    return [];
  }
}

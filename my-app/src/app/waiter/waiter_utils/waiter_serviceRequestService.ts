// RESPONSIBILITY: Centralized helper service for Customer Service Requests (Call Waiter, Water, Bill, Cutlery, Cleaning).
// DATA FLOW: Customer UI -> createServiceRequest() -> app_service_requests -> Waiter / Cashier Notifications -> Waiter UI

import { STORAGE_KEYS } from "@/lib/localStorageSeeder";
import { dispatchNotification } from "@/lib/notificationService";
import type {
  AppServiceRequest,
  ServiceRequestType,
  ServiceRequestStatus,
  AppTable,
  AppOrder,
} from "@/types/appTypes";

/**
 * Creates a new service request from customer device.
 * Prevents duplicate pending requests of the same type for the same table.
 */
export function createServiceRequest(params: {
  tableId: string;
  tableNumber: string;
  type: ServiceRequestType;
  customMessage?: string;
}): { success: boolean; request?: AppServiceRequest; message?: string } {
  if (typeof window === "undefined") return { success: false, message: "SSR" };

  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.SERVICE_REQUESTS);
    const requests: AppServiceRequest[] = raw ? JSON.parse(raw) : [];

    // Check duplicate pending request of same type on same table
    const existingPending = requests.find(
      (r) =>
        r.tableId === params.tableId &&
        r.type === params.type &&
        (r.status === "PENDING" || r.status === "ACKNOWLEDGED")
    );

    if (existingPending) {
      return {
        success: false,
        message: `A pending ${params.type.toLowerCase()} request for ${params.tableNumber} already exists.`,
      };
    }

    const now = Date.now();
    const newRequest: AppServiceRequest = {
      id: `req-${now}-${Math.random().toString(36).substring(2, 6)}`,
      tableId: params.tableId,
      tableNumber: params.tableNumber,
      type: params.type,
      customMessage: params.customMessage,
      status: "PENDING",
      createdAt: now,
      updatedAt: now,
    };

    const updated = [newRequest, ...requests];
    window.localStorage.setItem(STORAGE_KEYS.SERVICE_REQUESTS, JSON.stringify(updated));

    const emojiMap: Record<ServiceRequestType, string> = {
      WATER: "💧",
      BILL: "🧾",
      WAITER_CALL: "🛎️",
      CLEANING: "🧹",
      CUTLERY: "🍴",
      NAPKINS: "🧻",
      OTHER: "🔔",
    };
    const emoji = emojiMap[params.type] || "🔔";
    const typeLabel = params.type.replace("_", " ");

    // Dispatch notification to Waiters
    dispatchNotification({
      role: "WAITER",
      type: "SERVICE_REQUEST",
      title: `Table ${params.tableNumber} - ${typeLabel} ${emoji}`,
      message: params.customMessage || `Customer on Table ${params.tableNumber} requested ${typeLabel.toLowerCase()} ${emoji}.`,
      entityId: newRequest.id,
      entityType: "SERVICE_REQUEST",
      route: "/waiter",
      playSound: true,
      soundType: "BELL",
    });

    // Special logic for BILL request: notify Cashier & set table billing pending eligibility
    if (params.type === "BILL") {
      dispatchNotification({
        role: "CASHIER",
        type: "BILL_REQUESTED",
        title: `Bill Requested - ${params.tableNumber}`,
        message: `Customer on ${params.tableNumber} has requested the bill.`,
        entityId: newRequest.id,
        entityType: "TABLE",
        route: "/billing",
        playSound: true,
        soundType: "BELL",
      });

      // Update table status to BILLING_PENDING if occupied/active
      const rawTables = window.localStorage.getItem(STORAGE_KEYS.TABLES);
      if (rawTables) {
        const tables: AppTable[] = JSON.parse(rawTables);
        const normalize = (s: string) => (s || "").toLowerCase().replace(/^(tbl|t)-?/i, "");
        const targetNorm = normalize(params.tableId || params.tableNumber);

        const updatedTables = tables.map((t) => {
          const tIdNorm = normalize(t.id);
          const tNumNorm = normalize(t.tableNumber);
          const isMatch =
            tIdNorm === targetNorm ||
            tNumNorm === targetNorm ||
            t.id === params.tableId ||
            t.tableNumber === params.tableNumber;

          if (isMatch) {
            return { ...t, status: "BILLING_PENDING" as const };
          }
          return t;
        });
        window.localStorage.setItem(STORAGE_KEYS.TABLES, JSON.stringify(updatedTables));
      }
    }

    return { success: true, request: newRequest };
  } catch (err) {
    console.error("Failed to create service request:", err);
    return { success: false, message: String(err) };
  }
}

/**
 * Updates status of a service request (ACKNOWLEDGED or COMPLETED).
 */
export function updateServiceRequestStatus(
  id: string,
  newStatus: ServiceRequestStatus,
  waiterId?: string
): void {
  if (typeof window === "undefined") return;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.SERVICE_REQUESTS);
    if (!raw) return;

    const requests: AppServiceRequest[] = JSON.parse(raw);
    const now = Date.now();

    const updated = requests.map((r) => {
      if (r.id !== id) return r;

      const updates: Partial<AppServiceRequest> = {
        status: newStatus,
        updatedAt: now,
      };

      if (waiterId) updates.assignedWaiterId = waiterId;
      if (newStatus === "ACKNOWLEDGED") updates.acknowledgedAt = now;
      if (newStatus === "COMPLETED") updates.completedAt = now;

      return { ...r, ...updates };
    });

    window.localStorage.setItem(STORAGE_KEYS.SERVICE_REQUESTS, JSON.stringify(updated));
  } catch (err) {
    console.error("Failed to update service request:", err);
  }
}

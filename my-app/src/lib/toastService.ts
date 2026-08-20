"use client";

// RESPONSIBILITY: Global Toast Notification Dispatcher & State Event Target.
// DATA FLOW: Any action -> showToast() -> ToastProvider -> UI Toast Overlay

export type ToastType = "success" | "error" | "warning" | "info";

export interface ToastMessage {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
  actionLabel?: string;
  onAction?: () => void;
}

class ToastTarget extends EventTarget {}
export const toastBus = new ToastTarget();

export function showToast(params: {
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
  actionLabel?: string;
  onAction?: () => void;
}): void {
  const event = new CustomEvent<ToastMessage>("toast", {
    detail: {
      id: `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      type: params.type,
      title: params.title,
      message: params.message,
      duration: params.duration || 5000,
      actionLabel: params.actionLabel,
      onAction: params.onAction,
    },
  });
  toastBus.dispatchEvent(event);
}

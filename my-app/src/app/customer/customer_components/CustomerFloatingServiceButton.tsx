"use client";

// RESPONSIBILITY: Floating Service Request Button for Customer QR Self-Service view.
// Triggers "Call Waiter", "Request Water", "Request Bill", "Request Cleaning", "Cutlery", "Custom Request".
// DATA FLOW: Customer action -> createServiceRequest() -> app_service_requests -> Waiter notification

import React, { useState } from "react";
import { createServiceRequest } from "@/lib/serviceRequestService";
import { showToast } from "@/lib/toastService";
import type { ServiceRequestType } from "@/types/appTypes";
import { Bell, Droplets, Receipt, Sparkles, Utensils, X, CheckCircle2 } from "lucide-react";

export interface CustomerFloatingServiceButtonProps {
  tableId: string;
  tableNumber: string;
}

export function CustomerFloatingServiceButton({
  tableId,
  tableNumber,
}: CustomerFloatingServiceButtonProps): React.JSX.Element {
  const [isOpen, setIsOpen] = useState(false);
  const [customMsg, setCustomMsg] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  const handleRequest = (type: ServiceRequestType) => {
    const res = createServiceRequest({
      tableId,
      tableNumber,
      type,
      customMessage: customMsg || undefined,
    });

    if (!res.success) {
      showToast({
        type: "warning",
        message: res.message || "Request already pending",
      });
      setIsOpen(false);
      return;
    }

    setShowSuccess(true);
    setCustomMsg("");
    setTimeout(() => {
      setShowSuccess(false);
      setIsOpen(false);
    }, 2000);
  };

  return (
    <>
      {/* Floating Trigger Button */}
      <div className="fixed bottom-24 right-5 z-40">
        <button
          onClick={() => setIsOpen(true)}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-primary to-amber-500 text-white shadow-xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all"
        >
          <Bell className="h-6 w-6 animate-bounce" />
        </button>
      </div>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-[9990] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="flex h-auto w-full max-w-md flex-col overflow-hidden rounded-3xl border border-border bg-surface text-text-primary shadow-2xl animate-in slide-in-from-bottom duration-300">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border p-4 bg-page/50">
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-primary" />
                <h3 className="font-bold text-lg">Call Staff / Request Service</h3>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-full p-1.5 text-text-muted hover:bg-page"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {showSuccess ? (
              <div className="flex flex-col items-center justify-center py-10 px-4 text-center gap-3">
                <CheckCircle2 className="h-12 w-12 text-emerald-500 animate-bounce" />
                <h4 className="font-bold text-lg text-text-primary">Request Sent!</h4>
                <p className="text-xs text-text-secondary">
                  Our floor team has been notified for Table {tableNumber}.
                </p>
              </div>
            ) : (
              <div className="p-4 space-y-3">
                <p className="text-xs text-text-secondary">
                  Select a quick service request for <strong className="text-text-primary">Table {tableNumber}</strong>:
                </p>

                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    onClick={() => handleRequest("WATER")}
                    className="flex flex-col items-center gap-1.5 rounded-2xl border border-border bg-page p-3.5 hover:bg-primary/10 hover:border-primary/40 transition-all text-center"
                  >
                    <Droplets className="h-6 w-6 text-blue-500" />
                    <span className="font-bold text-xs">Request Water</span>
                  </button>

                  <button
                    onClick={() => handleRequest("BILL")}
                    className="flex flex-col items-center gap-1.5 rounded-2xl border border-border bg-page p-3.5 hover:bg-primary/10 hover:border-primary/40 transition-all text-center"
                  >
                    <Receipt className="h-6 w-6 text-emerald-500" />
                    <span className="font-bold text-xs">Request Bill</span>
                  </button>

                  <button
                    onClick={() => handleRequest("WAITER_CALL")}
                    className="flex flex-col items-center gap-1.5 rounded-2xl border border-border bg-page p-3.5 hover:bg-primary/10 hover:border-primary/40 transition-all text-center"
                  >
                    <Bell className="h-6 w-6 text-amber-500" />
                    <span className="font-bold text-xs">Call Waiter</span>
                  </button>

                  <button
                    onClick={() => handleRequest("CLEANING")}
                    className="flex flex-col items-center gap-1.5 rounded-2xl border border-border bg-page p-3.5 hover:bg-primary/10 hover:border-primary/40 transition-all text-center"
                  >
                    <Sparkles className="h-6 w-6 text-purple-500" />
                    <span className="font-bold text-xs">Table Cleaning</span>
                  </button>
                </div>

                <div className="pt-2">
                  <input
                    type="text"
                    value={customMsg}
                    onChange={(e) => setCustomMsg(e.target.value)}
                    placeholder="Short message (e.g. Extra napkins, Cutlery)..."
                    className="w-full rounded-xl border border-border bg-input px-3.5 py-2.5 text-xs text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none"
                  />
                  {customMsg && (
                    <button
                      onClick={() => handleRequest("OTHER")}
                      className="mt-2 w-full rounded-xl bg-primary py-2.5 text-xs font-bold text-white shadow-md hover:bg-primary-hover"
                    >
                      Send Request
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

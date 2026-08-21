"use client";

// RESPONSIBILITY: Modal for Customer Bill Request with optional phone number input for loyalty/offers,
// persuasive messaging, Web Speech API voice note player, and service request creation.
// DATA FLOW: Customer -> CustomerBillRequestModal -> createServiceRequest() & app_crm_customers -> Waiter/Cashier terminal

import React, { useState, useEffect } from "react";
import {
  Receipt,
  Volume2,
  VolumeX,
  Gift,
  Phone,
  CheckCircle2,
  X,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { createServiceRequest } from "../customer_utils/customer_serviceRequestService";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { STORAGE_KEYS } from "@/lib/localStorageSeeder";
import { showToast } from "@/lib/toastService";
import type { AppCrmCustomer, AppOrder } from "@/types/appTypes";

interface CustomerBillRequestModalProps {
  isOpen: boolean;
  tableId: string;
  tableNumber: string;
  onClose: () => void;
  onSuccess: () => void;
}

const VOICE_NOTE_TEXT =
  "Namaste! Apna mobile number darj karein aur payein humare khas festival offers aur VIP discounts WhatsApp par. Number dena bilkul aipchhik hai!";

export function CustomerBillRequestModal({
  isOpen,
  tableId,
  tableNumber,
  onClose,
  onSuccess,
}: CustomerBillRequestModalProps): React.JSX.Element | null {
  const [crmCustomers, setCrmCustomers] = useLocalStorage<AppCrmCustomer[]>(
    STORAGE_KEYS.CRM_CUSTOMERS,
    []
  );

  const [phone, setPhone] = useState("");
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [, setOrders] = useLocalStorage<AppOrder[]>(STORAGE_KEYS.ORDERS, []);

  // Stop speech synthesis when modal closes
  useEffect(() => {
    if (!isOpen && typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  function toggleVoiceNote() {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      showToast({ type: "info", message: "Audio playback not supported on this browser." });
      return;
    }

    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
    } else {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(VOICE_NOTE_TEXT);
      utterance.lang = "hi-IN";
      utterance.rate = 0.95;

      utterance.onend = () => setIsPlayingAudio(false);
      utterance.onerror = () => setIsPlayingAudio(false);

      setIsPlayingAudio(true);
      window.speechSynthesis.speak(utterance);
    }
  }

  function handleSubmitBillRequest(includePhone: boolean) {
    setIsSubmitting(true);

    const cleanPhone = phone.replace(/\D/g, "");
    const normKey = (s: string) => (s || "").toLowerCase().replace(/^(table|tbl|t)-?/i, "").trim().padStart(2, "0");
    const storageKey = `table_phone_${normKey(tableNumber)}`;

    // If customer entered phone, save to dedicated localStorage key & register in CRM
    if (includePhone && cleanPhone.length === 10) {
      if (typeof window !== "undefined") {
        window.localStorage.setItem(storageKey, cleanPhone);
      }

      setCrmCustomers((prev) => {
        const existing = prev.find((c) => c.phone === cleanPhone);
        if (existing) return prev;
        return [
          ...prev,
          {
            phone: cleanPhone,
            name: `Guest (T-${tableNumber})`,
            loyaltyPoints: 50, // bonus welcome points
            totalVisits: 1,
            history: [],
          },
        ];
      });

      // Update active order for this table with customerInfo
      const normTarget = normKey(tableNumber);
      setOrders((prev) =>
        prev.map((o) =>
          o.status === "ACTIVE" && normKey(o.tableNumber) === normTarget
            ? { ...o, customerInfo: { name: `Guest (T-${tableNumber})`, phone: cleanPhone } }
            : o
        )
      );
    } else {
      if (typeof window !== "undefined") {
        window.localStorage.removeItem(storageKey);
      }
    }

    // Create service request for Bill
    const customMsg = includePhone && cleanPhone.length === 10 ? `WhatsApp: ${cleanPhone}` : undefined;
    const res = createServiceRequest({
      tableId,
      tableNumber,
      type: "BILL",
      customMessage: customMsg,
    });

    setIsSubmitting(false);

    if (!res.success) {
      showToast({
        type: "warning",
        message: res.message || "Bill request already pending for your table.",
      });
    } else {
      showToast({
        type: "success",
        title: "Bill Request Sent 🧾",
        message: `Your cashier & waiter have been notified for Table ${tableNumber}.`,
      });
    }

    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }

    onSuccess();
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-xs p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Request Bill Modal"
    >
      <div className="relative flex w-full max-w-md flex-col gap-4 overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
              <Receipt size={24} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-text-primary">Request Bill for Table {tableNumber}</h2>
              <p className="text-xs text-text-secondary">Cashier will bring your bill shortly</p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close modal"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-text-secondary transition-colors hover:border-danger hover:text-danger"
          >
            <X size={16} />
          </button>
        </div>

        {/* Persuasive Offer Banner */}
        <div className="flex flex-col gap-2 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 relative overflow-hidden">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 text-amber-500 font-extrabold text-xs uppercase tracking-wider">
              <Gift size={16} />
              <span>Instant VIP Offer & Festival Rewards</span>
            </div>

            {/* Voice Note Button 🔊 */}
            <button
              onClick={toggleVoiceNote}
              type="button"
              className={[
                "flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold shadow-sm transition-all",
                isPlayingAudio
                  ? "bg-amber-500 text-black animate-pulse"
                  : "bg-card text-amber-500 border border-amber-500/30 hover:bg-amber-500/20",
              ].join(" ")}
            >
              {isPlayingAudio ? <VolumeX size={14} /> : <Volume2 size={14} />}
              <span>{isPlayingAudio ? "Stop Audio ⏹" : "Suniye 🔊"}</span>
            </button>
          </div>

          <p className="text-xs font-semibold text-text-primary leading-relaxed mt-1">
            🎁 Enter your WhatsApp number to get <strong className="text-amber-500">10% Instant Loyalty Cashback</strong> + Exclusive Festival Offer Passes!
          </p>

          <p className="text-[11px] text-text-secondary italic">
            *Number dena bilkul aipchhik (optional) hai. Hum aapko spam nahi karenge!
          </p>
        </div>

        {/* Phone Input Form */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-text-secondary uppercase tracking-wider flex items-center justify-between">
            <span>WhatsApp Mobile Number (Optional)</span>
            <span className="text-[10px] text-amber-500 font-normal">Get Cashback & Bill Copy</span>
          </label>

          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-text-disabled">
              <Phone size={16} />
            </div>
            <input
              type="tel"
              maxLength={10}
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
              placeholder="e.g. 9876543210"
              className="w-full rounded-xl border border-border bg-input py-3 pl-10 pr-4 text-sm font-semibold text-text-primary placeholder:text-text-disabled focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* Action CTAs */}
        <div className="flex flex-col gap-2 mt-2">
          <button
            onClick={() => handleSubmitBillRequest(true)}
            disabled={isSubmitting}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-sm font-bold text-white shadow-md transition-all hover:bg-emerald-500 active:scale-98 disabled:opacity-50"
          >
            <CheckCircle2 size={18} />
            <span>Submit Number & Request Bill 🧾</span>
          </button>

          <button
            onClick={() => handleSubmitBillRequest(false)}
            disabled={isSubmitting}
            className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-border bg-page py-2.5 text-xs font-semibold text-text-secondary transition-colors hover:bg-surface-hover hover:text-text-primary"
          >
            <span>Skip Number & Request Bill Directly</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

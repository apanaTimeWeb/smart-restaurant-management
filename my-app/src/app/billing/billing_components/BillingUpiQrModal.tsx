"use client";

// RESPONSIBILITY: Renders the UPI QR code modal for the Billing POS.
// Generates a QR code client-side using HTML Canvas (no external library).
// QR encodes a UPI deep link: upi://pay?pa=restaurant@upi&am=AMOUNT&tn=TableXX
// "Payment Received" button confirms payment and closes modal.
// DATA FLOW: billing/page.tsx → BillingUpiQrModal → onConfirm → checkout flow

import { useEffect, useRef } from "react";
import { X, CheckCircle } from "lucide-react";
import { formatCurrency } from "@/lib/formatters";
import type { BillingUpiQrModalProps } from "@/app/billing/billing_types/BillingTypes";

// ─── Constants (Rule 35: No magic strings / numbers) ─────────────────────────

const UPI_PA          = "restaurant@upi"  as const; // Merchant UPI ID
const UPI_MERCHANT    = "Smart POS 360"   as const;
const QR_CANVAS_SIZE  = 200               as const; // px
const QR_MODULE_COUNT = 25                as const; // grid cells
const QR_MODULE_SIZE  = Math.floor(QR_CANVAS_SIZE / QR_MODULE_COUNT);

// ─── Pure Helpers ─────────────────────────────────────────────────────────────

/**
 * Builds the UPI deep link string for QR encoding.
 */
function buildUpiLink(amount: number, tableNumber: string): string {
  const params = new URLSearchParams({
    pa:  UPI_PA,
    pn:  UPI_MERCHANT,
    am:  amount.toFixed(2),
    tn:  `Table ${tableNumber}`,
    cu:  "INR",
  });
  return `upi://pay?${params.toString()}`;
}

/**
 * Draws a simplified visual QR-like pattern on canvas.
 * Uses a deterministic hash of the UPI string to generate a unique pattern.
 * NOTE: This is a visual representation — not a scannable QR code.
 * For production, replace with a proper QR library (e.g. qrcode.js).
 */
function drawQrCanvas(canvas: HTMLCanvasElement, upiLink: string): void {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  canvas.width  = QR_CANVAS_SIZE;
  canvas.height = QR_CANVAS_SIZE;

  // White background
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(0, 0, QR_CANVAS_SIZE, QR_CANVAS_SIZE);

  // Generate deterministic bit pattern from UPI string
  const bits: boolean[] = [];
  for (let i = 0; i < QR_MODULE_COUNT * QR_MODULE_COUNT; i++) {
    const charCode = upiLink.charCodeAt(i % upiLink.length);
    bits.push(((charCode + i * 7) % 3) === 0);
  }

  // Draw modules
  ctx.fillStyle = "#000000";
  for (let row = 0; row < QR_MODULE_COUNT; row++) {
    for (let col = 0; col < QR_MODULE_COUNT; col++) {
      if (bits[row * QR_MODULE_COUNT + col]) {
        ctx.fillRect(
          col * QR_MODULE_SIZE,
          row * QR_MODULE_SIZE,
          QR_MODULE_SIZE,
          QR_MODULE_SIZE
        );
      }
    }
  }

  // Draw finder patterns (3 corners — standard QR visual cue)
  const finderSize = QR_MODULE_SIZE * 7;
  const positions  = [
    [0, 0],
    [QR_CANVAS_SIZE - finderSize, 0],
    [0, QR_CANVAS_SIZE - finderSize],
  ] as const;

  for (const [x, y] of positions) {
    ctx.fillStyle   = "#000000";
    ctx.fillRect(x, y, finderSize, finderSize);
    ctx.fillStyle   = "#FFFFFF";
    ctx.fillRect(x + QR_MODULE_SIZE, y + QR_MODULE_SIZE, finderSize - QR_MODULE_SIZE * 2, finderSize - QR_MODULE_SIZE * 2);
    ctx.fillStyle   = "#000000";
    ctx.fillRect(x + QR_MODULE_SIZE * 2, y + QR_MODULE_SIZE * 2, finderSize - QR_MODULE_SIZE * 4, finderSize - QR_MODULE_SIZE * 4);
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * UPI QR modal — z-40 overlay.
 * Draws QR on canvas on open. Escape key + backdrop click close modal.
 * "Payment Received" calls onConfirm to proceed with checkout.
 */
export function BillingUpiQrModal({
  isOpen,
  amount,
  tableNumber,
  onConfirm,
  onClose,
}: BillingUpiQrModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Draw QR whenever modal opens or amount changes
  // Deps: isOpen, amount, tableNumber — all affect the QR content
  useEffect(() => {
    if (!isOpen || !canvasRef.current) return;
    const upiLink = buildUpiLink(amount, tableNumber);
    drawQrCanvas(canvasRef.current, upiLink);
  }, [isOpen, amount, tableNumber]);

  // Escape key closes modal
  // Deps: isOpen, onClose — listener only active when modal is open
  useEffect(() => {
    if (!isOpen) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const upiLink = buildUpiLink(amount, tableNumber);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="UPI payment QR code"
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-xl border border-border bg-card p-7 shadow-2xl shadow-black/50"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="mb-5 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-[18px] font-bold text-text-primary">Scan & Pay</h2>
            <p className="mt-0.5 text-[12px] text-text-secondary">
              Table {tableNumber} — UPI Payment
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close UPI QR modal"
            className="rounded-md p-1 text-text-secondary transition-colors hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <X size={18} />
          </button>
        </div>

        {/* QR Canvas */}
        <div className="flex flex-col items-center gap-4">
          <div className="rounded-lg border border-border bg-white p-3">
            <canvas
              ref={canvasRef}
              width={QR_CANVAS_SIZE}
              height={QR_CANVAS_SIZE}
              aria-label={`UPI QR code for ${formatCurrency(amount)}`}
            />
          </div>

          {/* Amount */}
          <div className="text-center">
            <p className="text-[28px] font-bold text-text-primary">
              {formatCurrency(amount)}
            </p>
            <p className="text-[11px] text-text-secondary">{UPI_PA}</p>
          </div>

          {/* UPI link (copyable) */}
          <p className="max-w-full truncate rounded-md bg-page px-3 py-1.5 text-[10px] text-text-disabled">
            {upiLink}
          </p>
        </div>

        {/* Confirm button */}
        <button
          onClick={onConfirm}
          className={[
            "mt-6 flex w-full items-center justify-center gap-2 rounded-md bg-success px-5 py-3",
            "text-[14px] font-semibold text-white",
            "transition-colors duration-150 hover:opacity-90 active:scale-95",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-success focus-visible:ring-offset-2 focus-visible:ring-offset-page",
          ].join(" ")}
        >
          <CheckCircle size={16} />
          Payment Received
        </button>
      </div>
    </div>
  );
}

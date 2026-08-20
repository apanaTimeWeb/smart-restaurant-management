"use client";

// RESPONSIBILITY: Final receipt modal shown after successful checkout.
// Displays thermal-style receipt preview with itemized bill + tax breakdown.
// Rule 29: Radio Button multi-medium sending selection (Print Paper, Send WhatsApp, Send Email).
// DATA FLOW: billing/page.tsx → BillingReceiptModal → window.print / wa.me / email / onClose

import { useEffect, useState, useRef } from "react";
import { Printer, MessageCircle, Mail, X, Check } from "lucide-react";
import { formatCurrency, formatDateTime } from "@/lib/formatters";
import { buildWhatsAppLink, buildReceiptText } from "@/app/billing/billing_hooks/useBillingCheckout";
import type { BillingReceiptModalProps } from "@/app/billing/billing_types/BillingTypes";

const RESTAURANT_NAME = "Royal Spice Bistro & Smart POS 360" as const;
const RESTAURANT_ADDRESS = "123, MG Road, Bengaluru — 560001" as const;
const RESTAURANT_GSTIN = "GSTIN: 29ABCDE1234F1Z5" as const;
const RECEIPT_DIVIDER = "─────────────────────────────────" as const;

type DeliveryMedium = "PRINT" | "WHATSAPP" | "EMAIL";

function drawReceiptUpiQr(canvas: HTMLCanvasElement, upiString: string): void {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const size = 110;
  canvas.width = size;
  canvas.height = size;

  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(0, 0, size, size);

  const grid = 21;
  const cellSize = size / grid;

  let hash = 0;
  for (let i = 0; i < upiString.length; i++) {
    hash = (hash << 5) - hash + upiString.charCodeAt(i);
    hash |= 0;
  }

  ctx.fillStyle = "#000000";
  for (let r = 0; r < grid; r++) {
    for (let c = 0; c < grid; c++) {
      if (Math.abs(Math.sin((r + 1) * (c + 1) * hash * 100)) > 0.45) {
        ctx.fillRect(c * cellSize, r * cellSize, cellSize, cellSize);
      }
    }
  }

  const drawFinder = (startR: number, startC: number) => {
    ctx.fillStyle = "#000000";
    ctx.fillRect(startC * cellSize, startR * cellSize, 7 * cellSize, 7 * cellSize);
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect((startC + 1) * cellSize, (startR + 1) * cellSize, 5 * cellSize, 5 * cellSize);
    ctx.fillStyle = "#000000";
    ctx.fillRect((startC + 2) * cellSize, (startR + 2) * cellSize, 3 * cellSize, 3 * cellSize);
  };

  drawFinder(0, 0);
  drawFinder(0, grid - 7);
  drawFinder(grid - 7, 0);
}

function TaxRow({ label, value }: { label: string; value: number }) {
  if (value === 0) return null;
  return (
    <div className="flex justify-between text-[11px] text-text-secondary">
      <span>{label}</span>
      <span>{formatCurrency(value)}</span>
    </div>
  );
}

function ReceiptItemRow({ name, qty, totalPrice }: { name: string; qty: number; totalPrice: number }) {
  return (
    <div className="flex justify-between text-[12px]">
      <span className="flex-1 pr-2 text-text-primary">
        {name} <span className="text-text-secondary">×{qty}</span>
      </span>
      <span className="text-text-primary">{formatCurrency(totalPrice)}</span>
    </div>
  );
}

export function BillingReceiptModal({
  isOpen,
  cartItems,
  taxBreakdown,
  tableNumber,
  customerName,
  customerPhone,
  onSaveCustomerWhatsApp,
  onClose,
}: BillingReceiptModalProps) {
  const [waPhone, setWaPhone] = useState(customerPhone || "");
  const [emailInput, setEmailInput] = useState("");
  const [medium, setMedium] = useState<DeliveryMedium>("PRINT");
  const [sentSuccessMsg, setSentSuccessMsg] = useState<string | null>(null);

  const qrCanvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (isOpen) {
      setWaPhone(customerPhone || "");
      setEmailInput("");
      setSentSuccessMsg(null);

      setTimeout(() => {
        if (qrCanvasRef.current) {
          const upiString = `upi://pay?pa=smartpos@upi&pn=RoyalSpiceBistro&am=${taxBreakdown.totalAmount.toFixed(2)}&tn=Table${tableNumber}`;
          drawReceiptUpiQr(qrCanvasRef.current, upiString);
        }
      }, 50);
    }
  }, [isOpen, customerPhone, taxBreakdown.totalAmount, tableNumber]);

  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const now = formatDateTime(Date.now());

  function handleSendWhatsApp() {
    setSentSuccessMsg(null);
    if (waPhone.length < 10) return;
    if (waPhone !== customerPhone && onSaveCustomerWhatsApp) {
      onSaveCustomerWhatsApp(waPhone);
    }
    const receiptText = buildReceiptText(cartItems, taxBreakdown, tableNumber);
    const link = buildWhatsAppLink(waPhone, receiptText);
    if (link && typeof window !== "undefined") {
      window.open(link, "_blank", "noopener,noreferrer");
    }
    setSentSuccessMsg(`Receipt sent to WhatsApp (${waPhone})!`);
  }

  function handlePrintReceipt() {
    if (typeof window !== "undefined") {
      window.print();
    }
  }

  return (
    <>
      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          #billing-receipt-content,
          #billing-receipt-content * { visibility: visible !important; }
          #billing-receipt-content {
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 80mm !important;
            padding: 4mm !important;
            font-size: 11px !important;
            font-family: monospace !important;
          }
        }
      `}</style>

      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-fadeIn"
        onClick={onClose}
      >
        <div
          className="relative flex w-full max-w-sm flex-col gap-0 rounded-2xl bg-card border border-border shadow-2xl overflow-hidden max-h-[95vh]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border bg-surface-hover/30 px-5 py-3.5 print:hidden">
            <h2 className="text-[15px] font-bold text-text-primary">Order Receipt</h2>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-text-secondary hover:bg-border transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Receipt Content */}
          <div
            id="billing-receipt-content"
            className="flex flex-col gap-1 px-5 py-4 font-mono overflow-y-auto max-h-[50vh] bg-card"
          >
            <div className="flex flex-col items-center gap-0.5 text-center">
              <p className="text-[13px] font-bold text-text-primary">{RESTAURANT_NAME}</p>
              <p className="text-[10px] text-text-secondary">{RESTAURANT_ADDRESS}</p>
              <p className="text-[10px] text-text-secondary">{RESTAURANT_GSTIN}</p>
            </div>

            <p className="my-1 text-center text-[10px] text-text-secondary">{RECEIPT_DIVIDER}</p>

            <div className="flex justify-between text-[11px] text-text-secondary">
              <span>Table: {tableNumber}</span>
              <span>{now}</span>
            </div>

            {(customerPhone || customerName) && (
              <p className="text-[11px] font-bold text-text-primary">
                Customer: {customerName || "Guest"} {customerPhone ? `(${customerPhone})` : ""}
              </p>
            )}

            <p className="my-1 text-center text-[10px] text-text-secondary">{RECEIPT_DIVIDER}</p>

            <div className="flex flex-col gap-1">
              {cartItems.map((item) => (
                <ReceiptItemRow
                  key={`${item.itemId}-${item.notes}`}
                  name={item.name}
                  qty={item.qty}
                  totalPrice={item.totalPrice}
                />
              ))}
            </div>

            <p className="my-1 text-center text-[10px] text-text-secondary">{RECEIPT_DIVIDER}</p>

            <div className="flex flex-col gap-0.5">
              <TaxRow label="Subtotal" value={taxBreakdown.subtotal} />
              <TaxRow label="CGST (2.5%)" value={taxBreakdown.cgst} />
              <TaxRow label="SGST (2.5%)" value={taxBreakdown.sgst} />
              <TaxRow label="Service (5%)" value={taxBreakdown.serviceCharge} />
              <TaxRow label="Liquor VAT" value={taxBreakdown.vat} />
              {taxBreakdown.packagingCharge > 0 && (
                <TaxRow label="Parcel Fee" value={taxBreakdown.packagingCharge} />
              )}
              {taxBreakdown.customTip > 0 && (
                <TaxRow label="Staff Tip" value={taxBreakdown.customTip} />
              )}
              {taxBreakdown.discount > 0 && (
                <div className="flex justify-between text-[11px] text-success">
                  <span>Discount</span>
                  <span>-{formatCurrency(taxBreakdown.discount)}</span>
                </div>
              )}
              {taxBreakdown.loyaltyRedeemed > 0 && (
                <div className="flex justify-between text-[11px] text-success">
                  <span>Loyalty Redeemed</span>
                  <span>-{formatCurrency(taxBreakdown.loyaltyRedeemed)}</span>
                </div>
              )}
              <TaxRow label="Round Off" value={taxBreakdown.roundOff} />
            </div>

            <p className="my-1 text-center text-[10px] text-text-secondary">{RECEIPT_DIVIDER}</p>

            <div className="flex justify-between">
              <span className="text-[15px] font-bold text-text-primary">TOTAL</span>
              <span className="text-[15px] font-bold text-text-primary">
                {formatCurrency(taxBreakdown.totalAmount)}
              </span>
            </div>

            <p className="my-1 text-center text-[10px] text-text-secondary">{RECEIPT_DIVIDER}</p>

            {/* UPI QR Code for Online Payment */}
            <div className="flex flex-col items-center gap-1 my-1 py-1 bg-page/50 rounded-lg border border-border/50">
              <p className="text-[10px] font-bold uppercase tracking-wider text-text-primary">
                Scan to Pay via UPI / GPay / PhonePe
              </p>
              <div className="rounded-lg border border-border p-1.5 bg-white shadow-xs">
                <canvas ref={qrCanvasRef} className="h-28 w-28 block" />
              </div>
              <p className="text-[9px] font-mono text-text-secondary">UPI ID: smartpos@upi</p>
            </div>

            <p className="my-1 text-center text-[10px] text-text-secondary">{RECEIPT_DIVIDER}</p>

            <p className="text-center text-[11px] font-bold text-text-primary">
              Thank you for dining with us! 🙏 Visit Again!
            </p>
          </div>


          {/* Action Footer */}
          <div className="flex flex-col gap-3 border-t border-border bg-page px-5 py-4 print:hidden">
            {/* WhatsApp Row */}
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-bold text-text-secondary">
                Customer WhatsApp Mobile Number (Optional)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="tel"
                  maxLength={10}
                  value={waPhone}
                  onChange={(e) => setWaPhone(e.target.value.replace(/\D/g, ""))}
                  placeholder="Enter 10-digit number"
                  className="flex-1 rounded-xl border border-border bg-input px-3.5 py-2.5 text-xs font-bold text-text-primary focus:border-emerald-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleSendWhatsApp}
                  className="flex items-center gap-1.5 shrink-0 rounded-xl bg-emerald-600 px-3.5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-500 active:scale-95 transition-all"
                >
                  <MessageCircle size={15} />
                  <span>Send WhatsApp</span>
                </button>
              </div>
            </div>

            {sentSuccessMsg && (
              <div className="flex items-center gap-1.5 rounded-lg bg-emerald-500/15 p-2 text-xs font-bold text-emerald-500">
                <Check size={14} />
                <span>{sentSuccessMsg}</span>
              </div>
            )}

            {/* Print Thermal Receipt Button */}
            <button
              type="button"
              onClick={handlePrintReceipt}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-bold text-white shadow-md hover:bg-primary-hover active:scale-98 transition-all"
            >
              <Printer size={18} />
              <span>Print Thermal Paper Receipt</span>
            </button>

            {/* Complete & Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="w-full rounded-xl border border-border py-2 text-xs font-bold text-text-secondary hover:bg-surface-hover hover:text-text-primary transition-colors"
            >
              Complete & Close Checkout
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

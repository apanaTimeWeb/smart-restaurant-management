"use client";

// RESPONSIBILITY: Renders the right panel itemized bill with tax breakdown.
// Shows aggregated cart items table, service charge toggle, full tax breakdown,
// and "Proceed to Payment" button.
// Pure display component — no localStorage access, no calculations.
// DATA FLOW: useBillingOrder → billing/page.tsx → BillingOrderSummary → UI

import { Receipt } from "lucide-react";
import { formatCurrency } from "@/lib/formatters";
import type { BillingOrderSummaryProps } from "@/app/billing/billing_types/BillingTypes";

// ─── Constants (Rule 35: No magic strings) ────────────────────────────────────

const CGST_LABEL           = "CGST (2.5%)"         as const;
const SGST_LABEL           = "SGST (2.5%)"         as const;
const SERVICE_CHARGE_LABEL = "Service Charge (5%)" as const;
const VAT_LABEL            = "Liquor VAT (18%)"    as const;
const DISCOUNT_LABEL       = "Discount"            as const;
const LOYALTY_LABEL        = "Loyalty Redeemed"    as const;
const ROUND_OFF_LABEL      = "Round Off"           as const;

// ─── Sub-component: Tax Row ───────────────────────────────────────────────────

// RESPONSIBILITY: Single row in the tax breakdown section.
interface TaxRowProps {
  label:     string;
  amount:    number;
  isTotal?:  boolean;
  isCredit?: boolean; // discount / loyalty — shown in green
}

function TaxRow({ label, amount, isTotal = false, isCredit = false }: TaxRowProps) {
  if (amount === 0 && !isTotal) return null;

  return (
    <div
      className={[
        "flex items-center justify-between gap-2 py-1",
        isTotal ? "border-t border-border pt-3 mt-1" : "",
      ].join(" ")}
    >
      <span
        className={[
          isTotal
            ? "text-[14px] font-bold text-text-primary"
            : "text-[12px] text-text-secondary",
        ].join(" ")}
      >
        {label}
      </span>
      <span
        className={[
          isTotal
            ? "text-[18px] font-bold text-text-primary"
            : "text-[12px] font-medium",
          isCredit ? "text-success" : "text-text-primary",
        ].join(" ")}
      >
        {isCredit && amount > 0 ? "−" : ""}{formatCurrency(Math.abs(amount))}
      </span>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

/**
 * Right panel — itemized bill table + tax breakdown + proceed button.
 * Service charge toggle switch included.
 * Empty state shown when no table is selected.
 */
export function BillingOrderSummary({
  cartItems,
  taxBreakdown,
  includeServiceCharge,
  onToggleServiceCharge,
  onProceedToPayment,
}: BillingOrderSummaryProps) {

  // ── Empty state — no table selected ───────────────────────────────────────
  if (cartItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-20 text-text-secondary">
        <Receipt size={40} strokeWidth={1.5} />
        <p className="text-sm font-medium">Select a table to view bill</p>
      </div>
    );
  }

  // ── Full render ────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-5">

      {/* ── Itemized cart table ── */}
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-border bg-primary/5">
              <th className="px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-text-secondary">
                Item
              </th>
              <th className="px-3 py-2.5 text-center text-[11px] font-semibold uppercase tracking-wide text-text-secondary">
                Qty
              </th>
              <th className="px-3 py-2.5 text-right text-[11px] font-semibold uppercase tracking-wide text-text-secondary">
                Rate
              </th>
              <th className="px-4 py-2.5 text-right text-[11px] font-semibold uppercase tracking-wide text-text-secondary">
                Total
              </th>
            </tr>
          </thead>
          <tbody>
            {cartItems.map((item, idx) => (
              <tr
                key={`${item.itemId}-${item.notes}-${idx}`}
                className="border-b border-border last:border-0 odd:bg-card even:bg-page"
              >
                <td className="px-4 py-2.5">
                  <p className="text-[13px] font-medium text-text-primary">{item.name}</p>
                  {item.notes && (
                    <p className="text-[11px] italic text-text-secondary">{item.notes}</p>
                  )}
                </td>
                <td className="px-3 py-2.5 text-center text-[13px] text-text-primary">
                  {item.qty}
                </td>
                <td className="px-3 py-2.5 text-right text-[13px] text-text-secondary">
                  {formatCurrency(item.unitPrice)}
                </td>
                <td className="px-4 py-2.5 text-right text-[13px] font-medium text-text-primary">
                  {formatCurrency(item.totalPrice)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Service charge toggle ── */}
      <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-card px-4 py-3">
        <div className="flex flex-col gap-0.5">
          <span className="text-[13px] font-medium text-text-primary">
            Service Charge (5%)
          </span>
          <span className="text-[11px] text-text-secondary">
            {includeServiceCharge
              ? `+${formatCurrency(taxBreakdown.serviceCharge)} added`
              : "Not included"}
          </span>
        </div>
        <button
          role="switch"
          aria-checked={includeServiceCharge}
          aria-label="Toggle service charge"
          onClick={() => onToggleServiceCharge(!includeServiceCharge)}
          className={[
            "relative h-6 w-11 shrink-0 rounded-full transition-colors duration-200",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-page",
            includeServiceCharge ? "bg-primary" : "bg-border",
          ].join(" ")}
        >
          <span
            className={[
              "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200",
              includeServiceCharge ? "translate-x-5" : "translate-x-0.5",
            ].join(" ")}
          />
        </button>
      </div>

      {/* ── Tax breakdown ── */}
      <div className="rounded-lg border border-border bg-card px-4 py-3">
        <TaxRow label="Subtotal"               amount={taxBreakdown.subtotal} />
        <TaxRow label={CGST_LABEL}             amount={taxBreakdown.cgst} />
        <TaxRow label={SGST_LABEL}             amount={taxBreakdown.sgst} />
        <TaxRow label={SERVICE_CHARGE_LABEL}      amount={taxBreakdown.serviceCharge} />
        <TaxRow label={VAT_LABEL}              amount={taxBreakdown.vat} />
        {taxBreakdown.packagingCharge > 0 && (
          <TaxRow label="Parcel / Packaging Fee" amount={taxBreakdown.packagingCharge} />
        )}
        {taxBreakdown.customTip > 0 && (
          <TaxRow label="Staff Tip"              amount={taxBreakdown.customTip} />
        )}
        <TaxRow label={DISCOUNT_LABEL}         amount={taxBreakdown.discount}        isCredit />
        <TaxRow label={LOYALTY_LABEL}          amount={taxBreakdown.loyaltyRedeemed} isCredit />
        <TaxRow label={ROUND_OFF_LABEL}        amount={taxBreakdown.roundOff} />
        <TaxRow label="Total Amount"           amount={taxBreakdown.totalAmount}     isTotal />
      </div>


      {/* ── Proceed to Payment button ── */}
      <button
        onClick={onProceedToPayment}
        className={[
          "w-full rounded-md bg-primary px-5 py-3",
          "text-[14px] font-semibold text-white",
          "transition-colors duration-150 hover:bg-primary-hover",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-page",
          "active:scale-95",
        ].join(" ")}
      >
        Proceed to Payment — {formatCurrency(taxBreakdown.totalAmount)}
      </button>
    </div>
  );
}

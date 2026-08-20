"use client";

// RESPONSIBILITY: Panel for Cashier to add custom tips, parcel/packaging fees, and round-off adjustments.
// DATA FLOW: billing/page.tsx → BillingExtraChargesPanel → useBillingOrder → UI

import { HeartHandshake, Package, SlidersHorizontal } from "lucide-react";

interface BillingExtraChargesPanelProps {
  customTip: number;
  packagingCharge: number;
  onSetTip: (tip: number) => void;
  onSetPackaging: (packaging: number) => void;
}

const TIP_PRESETS = [0, 20, 50, 100];
const PACKAGING_PRESETS = [0, 15, 25, 50];

export function BillingExtraChargesPanel({
  customTip,
  packagingCharge,
  onSetTip,
  onSetPackaging,
}: BillingExtraChargesPanelProps) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm">
      <div className="flex items-center gap-2 border-b border-border/50 pb-2">
        <SlidersHorizontal size={16} className="text-primary" />
        <h3 className="text-xs font-bold uppercase tracking-wider text-text-primary">
          Packaging Charges & Staff Tips
        </h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Packaging / Parcel Charge */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-semibold text-text-secondary flex items-center gap-1">
            <Package size={13} className="text-info" /> Parcel / Packaging Fee (₹)
          </label>
          <div className="flex items-center gap-1.5">
            {PACKAGING_PRESETS.map((fee) => (
              <button
                key={fee}
                type="button"
                onClick={() => onSetPackaging(fee)}
                className={[
                  "rounded-lg px-2.5 py-1 text-xs font-bold border transition-colors",
                  packagingCharge === fee
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-page text-text-secondary hover:text-text-primary",
                ].join(" ")}
              >
                {fee === 0 ? "None" : `₹${fee}`}
              </button>
            ))}
          </div>
        </div>

        {/* Staff Tip */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-semibold text-text-secondary flex items-center gap-1">
            <HeartHandshake size={13} className="text-success" /> Customer Staff Tip (₹)
          </label>
          <div className="flex items-center gap-1.5">
            {TIP_PRESETS.map((tip) => (
              <button
                key={tip}
                type="button"
                onClick={() => onSetTip(tip)}
                className={[
                  "rounded-lg px-2.5 py-1 text-xs font-bold border transition-colors",
                  customTip === tip
                    ? "border-success bg-success-bg text-success"
                    : "border-border bg-page text-text-secondary hover:text-text-primary",
                ].join(" ")}
              >
                {tip === 0 ? "None" : `₹${tip}`}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

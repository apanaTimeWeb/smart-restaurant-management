"use client";

// RESPONSIBILITY: Renders the discount application panel for the Cashier POS.
// Supports PERCENT, FLAT, and NC (Non-Chargeable) discount types.
// NC type requires Admin PIN (4-digit) + reason â€” pessimistic UI on apply.
// Applied discount shown as a green badge with a remove button.
// DATA FLOW: CashierDiscountPanel â†’ onApply/onClear â†’ useCashierOrder.applyDiscount

import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Tag, X } from "lucide-react";
import { formatCurrency } from "@/lib/formatters";
import type { CashierDiscountPanelProps, CashierDiscount, CashierDiscountType } from "@/app/cashier/cashier_types/CashierTypes";

// â”€â”€â”€ Constants (Rule 35: No magic strings) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const DISCOUNT_TYPE_OPTIONS: { value: CashierDiscountType; label: string }[] = [
  { value: "PERCENT", label: "% Percent"          },
  { value: "FLAT",    label: "â‚¹ Flat Amount"       },
  { value: "NC",      label: "NC / Complimentary"  },
];

const NC_ADMIN_PIN = "1234" as const; // In production: verify against stored PIN

// â”€â”€â”€ Zod Schema â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const DiscountSchema = z.object({
  type:     z.enum(["PERCENT", "FLAT", "NC"]),
  value:    z.number().min(0.01, "Enter a valid amount"),
  reason:   z.string().min(3, "Reason required (min 3 chars)"),
  adminPin: z.string(),
}).superRefine((data, ctx) => {
  if (data.type === "NC" && data.adminPin !== NC_ADMIN_PIN) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["adminPin"],
      message: "Invalid Admin PIN",
    });
  }
});

type DiscountFormValues = z.infer<typeof DiscountSchema>;
type DiscountFormInput  = DiscountFormValues;

// â”€â”€â”€ Component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

/**
 * Discount panel â€” PERCENT / FLAT / NC discount form.
 * NC type reveals Admin PIN field (pessimistic: disabled until PIN valid).
 * Applied discount shown as removable green badge.
 */
export function CashierDiscountPanel({
  appliedDiscount,
  onApply,
  onClear,
}: CashierDiscountPanelProps) {
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting, isValid },
  } = useForm<DiscountFormValues>({
    resolver: zodResolver(DiscountSchema),
    mode: "onChange",
    defaultValues: { type: "PERCENT", value: 0, reason: "", adminPin: "" },
  });

  // Watch type to conditionally show Admin PIN field
  const selectedType = useWatch({ control, name: "type" });

  // Reset form when discount is cleared externally
  // Deps: appliedDiscount â€” reset only when it becomes null
  useEffect(() => {
    if (!appliedDiscount) reset({ type: "PERCENT", value: 0, reason: "", adminPin: "" });
  }, [appliedDiscount, reset]);

  function handleFormSubmit(values: DiscountFormValues) {
    const discount: CashierDiscount = {
      type:     values.type,
      value:    values.value,
      reason:   values.reason,
      adminPin: values.adminPin,
    };
    onApply(discount);
  }

  // Quick discount tags click handler
  const handleQuickDiscountTag = (type: CashierDiscountType, val: number, reason: string) => {
    reset({ type, value: val, reason, adminPin: type === "NC" ? "1234" : "" });
  };

  // â”€â”€ Applied badge â€” show when discount is active â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  if (appliedDiscount) {
    const label =
      appliedDiscount.type === "PERCENT"
        ? `${appliedDiscount.value}% off`
        : appliedDiscount.type === "NC"
        ? `NC â€” ${formatCurrency(appliedDiscount.value)}`
        : `Flat ${formatCurrency(appliedDiscount.value)} off`;

    return (
      <div className="flex items-center justify-between gap-3 rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-4">
        <div className="flex items-center gap-2">
          <Tag size={16} className="text-emerald-500" />
          <span className="text-sm font-bold text-emerald-500">{label}</span>
          <span className="text-xs text-text-secondary">â€” {appliedDiscount.reason}</span>
        </div>
        <button
          onClick={onClear}
          aria-label="Remove discount"
          className="rounded-lg p-1 text-text-secondary transition-colors hover:text-danger hover:bg-page"
        >
          <X size={16} />
        </button>
      </div>
    );
  }

  // â”€â”€ Discount form â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} noValidate className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-4 shadow-xs">
      <div className="flex items-center justify-between">
        <p className="text-[12px] font-bold uppercase tracking-wider text-text-secondary">
          Apply Discount & Promo
        </p>
      </div>

      {/* Quick Discount Tags */}
      <div className="flex flex-wrap gap-1.5">
        <button
          type="button"
          onClick={() => handleQuickDiscountTag("PERCENT", 5, "5% Quick Discount")}
          className="rounded-xl border border-border bg-page px-3 py-1 text-xs font-bold text-text-primary hover:bg-primary/10 hover:border-primary/40 transition-all"
        >
          5% OFF
        </button>
        <button
          type="button"
          onClick={() => handleQuickDiscountTag("PERCENT", 10, "10% Quick Discount")}
          className="rounded-xl border border-border bg-page px-3 py-1 text-xs font-bold text-text-primary hover:bg-primary/10 hover:border-primary/40 transition-all"
        >
          10% OFF
        </button>
        <button
          type="button"
          onClick={() => handleQuickDiscountTag("PERCENT", 15, "15% Staff Discount")}
          className="rounded-xl border border-border bg-page px-3 py-1 text-xs font-bold text-text-primary hover:bg-primary/10 hover:border-primary/40 transition-all"
        >
          15% OFF
        </button>
        <button
          type="button"
          onClick={() => handleQuickDiscountTag("FLAT", 100, "Flat â‚¹100 Discount")}
          className="rounded-xl border border-border bg-page px-3 py-1 text-xs font-bold text-text-primary hover:bg-primary/10 hover:border-primary/40 transition-all"
        >
          Flat â‚¹100
        </button>
      </div>

      {/* Type selector */}
      <div className="flex flex-col gap-1.5">
        <label className="text-[12px] font-medium text-text-secondary">
          Discount Type
        </label>
        <div className="flex flex-wrap gap-2">
          {DISCOUNT_TYPE_OPTIONS.map((opt) => (
            <label
              key={opt.value}
              className="flex cursor-pointer items-center gap-1.5"
            >
              <input
                type="radio"
                value={opt.value}
                {...register("type")}
                className="accent-primary"
              />
              <span className="text-[13px] text-text-primary">{opt.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Value input */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="discount-value" className="text-[12px] font-medium text-text-secondary">
          {selectedType === "PERCENT" ? "Percentage (%)" : "Amount (â‚¹)"}
          <span className="text-danger"> *</span>
        </label>
        <input
          id="discount-value"
          type="number"
          step="0.01"
          min="0"
          {...register("value", { valueAsNumber: true })}
          placeholder={selectedType === "PERCENT" ? "e.g. 10" : "e.g. 50"}
          className={[
            "w-full rounded-xl border bg-input px-3 py-2 text-[14px] text-text-primary font-bold",
            "focus:outline-none focus:border-border-focus",
            "[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none",
            errors.value ? "border-danger" : "border-border",
          ].join(" ")}
        />
        {errors.value && <p className="text-[12px] text-danger">{errors.value.message}</p>}
      </div>

      {/* Reason input */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="discount-reason" className="text-[12px] font-medium text-text-secondary">
          Reason <span className="text-danger">*</span>
        </label>
        <input
          id="discount-reason"
          type="text"
          {...register("reason")}
          placeholder="e.g. Regular customer, Manager approval"
          className={[
            "w-full rounded-md border bg-input px-3 py-2 text-[14px] text-text-primary",
            "focus:outline-none focus:border-border-focus",
            errors.reason ? "border-danger" : "border-border",
          ].join(" ")}
        />
        {errors.reason && <p className="text-[12px] text-danger">{errors.reason.message}</p>}
      </div>

      {/* Admin PIN â€” only for NC type */}
      {selectedType === "NC" && (
        <div className="flex flex-col gap-1.5">
          <label htmlFor="admin-pin" className="text-[12px] font-medium text-text-secondary">
            Admin PIN <span className="text-danger">*</span>
          </label>
          <input
            id="admin-pin"
            type="password"
            maxLength={4}
            {...register("adminPin")}
            placeholder="4-digit PIN"
            className={[
              "w-32 rounded-md border bg-input px-3 py-2 text-[14px] text-text-primary",
              "focus:outline-none focus:border-border-focus tracking-widest",
              errors.adminPin ? "border-danger" : "border-border",
            ].join(" ")}
          />
          {errors.adminPin && <p className="text-[12px] text-danger">{errors.adminPin.message}</p>}
        </div>
      )}

      {/* Apply button */}
      <button
        type="submit"
        disabled={!isValid || isSubmitting}
        className={[
          "w-full rounded-md px-4 py-2 text-[14px] font-semibold text-white transition-colors",
          !isValid || isSubmitting
            ? "cursor-not-allowed bg-primary opacity-50"
            : "bg-primary hover:bg-primary-hover",
        ].join(" ")}
      >
        Apply Discount
      </button>
    </form>
  );
}

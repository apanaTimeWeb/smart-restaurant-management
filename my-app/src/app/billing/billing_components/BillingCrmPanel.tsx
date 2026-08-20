"use client";

// RESPONSIBILITY: Renders the CRM customer tagging panel for the Billing POS.
// Debounced phone search (300ms), found customer shows loyalty points + redeem toggle.
// Not found shows inline "Add New Customer" form.
// DATA FLOW: BillingCrmPanel → useBillingCrm → CRM_CUSTOMERS localStorage → onRedeemChange

import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Search, UserPlus, Star, X } from "lucide-react";
import { useBillingCrm } from "@/app/billing/billing_hooks/useBillingCrm";
import { formatCurrency } from "@/lib/formatters";
import type { BillingCrmPanelProps } from "@/app/billing/billing_types/BillingTypes";

// ─── Constants (Rule 35: No magic numbers) ────────────────────────────────────

const DEBOUNCE_MS        = 300  as const;
const PHONE_MIN_LENGTH   = 10   as const;

// ─── Zod Schema for Add New Customer form ─────────────────────────────────────

const AddCustomerSchema = z.object({
  name:  z.string().min(2, "Name min 2 chars"),
  phone: z.string().length(10, "Phone must be 10 digits"),
});

type AddCustomerFormValues = z.infer<typeof AddCustomerSchema>;

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * CRM panel — phone search with 300ms debounce.
 * Found: shows name, loyalty points, earned on this bill, redeem toggle.
 * Not found: shows "Add New Customer" inline form.
 * Calls onRedeemChange whenever redeem amount changes.
 */
export function BillingCrmPanel({ totalAmount, customerPhone = "", onRedeemChange, onCustomerChange }: BillingCrmPanelProps) {
  const {
    customer,
    loyaltyEarned,
    redeemablePoints,
    redeemAmount,
    searchCustomer,
    addNewCustomer,
    setRedeemAmount,
    clearCustomer,
  } = useBillingCrm(totalAmount);

  const [phoneInput,    setPhoneInput]    = useState<string>("");
  const [showAddForm,   setShowAddForm]   = useState<boolean>(false);
  const [hasSearched,   setHasSearched]   = useState<boolean>(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auto-fill or reset phone input when customerPhone prop changes
  useEffect(() => {
    if (customerPhone && customerPhone.length >= 10) {
      const clean = customerPhone.replace(/\D/g, "").slice(0, 10);
      setPhoneInput(clean);
    } else if (!customerPhone) {
      setPhoneInput("");
      setHasSearched(false);
      setShowAddForm(false);
    }
  }, [customerPhone]);

  const {
    register,
    handleSubmit,
    reset: resetAddForm,
    formState: { errors: addErrors, isValid: isAddValid },
  } = useForm<AddCustomerFormValues>({
    resolver: zodResolver(AddCustomerSchema),
    mode: "onChange",
    defaultValues: { name: "", phone: phoneInput },
  });

  // Store callbacks in refs to break dependency loops
  const searchCustomerRef = useRef(searchCustomer);
  useEffect(() => {
    searchCustomerRef.current = searchCustomer;
  }, [searchCustomer]);

  const onCustomerChangeRef = useRef(onCustomerChange);
  useEffect(() => {
    onCustomerChangeRef.current = onCustomerChange;
  }, [onCustomerChange]);

  const onRedeemChangeRef = useRef(onRedeemChange);
  useEffect(() => {
    onRedeemChangeRef.current = onRedeemChange;
  }, [onRedeemChange]);

  const lastCustomerRef = useRef<{ phone: string; name: string }>({ phone: "", name: "" });
  const lastRedeemRef = useRef<number>(-1);

  // Debounced search — fires 300ms after user stops typing
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (phoneInput.length < PHONE_MIN_LENGTH) {
      setHasSearched(false);
      setShowAddForm(false);
      return;
    }

    debounceRef.current = setTimeout(() => {
      searchCustomerRef.current(phoneInput);
      setHasSearched(true);
      setShowAddForm(false);
    }, DEBOUNCE_MS);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [phoneInput]);

  // Notify parent whenever customer or phoneInput changes (guarded by value check)
  useEffect(() => {
    const cleanPhone = phoneInput.replace(/\D/g, "");
    const activePhone = customer?.phone || (cleanPhone.length >= 10 ? cleanPhone : "");
    const activeName  = customer?.name  || (cleanPhone.length >= 10 ? "Guest Customer" : "");

    if (lastCustomerRef.current.phone !== activePhone || lastCustomerRef.current.name !== activeName) {
      lastCustomerRef.current = { phone: activePhone, name: activeName };
      onCustomerChangeRef.current(activePhone, activeName);
    }
  }, [customer, phoneInput]);

  // Notify parent whenever redeemAmount changes (guarded by value check)
  useEffect(() => {
    if (lastRedeemRef.current !== redeemAmount) {
      lastRedeemRef.current = redeemAmount;
      onRedeemChangeRef.current(redeemAmount);
    }
  }, [redeemAmount]);

  function handleClear() {
    setPhoneInput("");
    setHasSearched(false);
    setShowAddForm(false);
    clearCustomer();
  }

  function handleAddSubmit(values: AddCustomerFormValues) {
    addNewCustomer(values.name, values.phone);
    setShowAddForm(false);
    resetAddForm();
  }

  function handleRedeemToggle() {
    if (redeemAmount > 0) {
      setRedeemAmount(0);
    } else {
      setRedeemAmount(redeemablePoints);
    }
  }

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-border bg-card p-4">
      <p className="text-[12px] font-semibold uppercase tracking-wide text-text-secondary">
        CRM / Loyalty
      </p>

      {/* Phone search input */}
      <div className="relative flex items-center gap-2">
        <Search size={14} className="absolute left-3 text-text-secondary" />
        <input
          type="tel"
          value={phoneInput}
          onChange={(e) => setPhoneInput(e.target.value.replace(/\D/g, "").slice(0, 10))}
          placeholder="Search by phone number"
          aria-label="Customer phone number search"
          className={[
            "w-full rounded-md border border-border bg-input py-2 pl-8 pr-8",
            "text-[14px] text-text-primary placeholder:text-text-disabled",
            "focus:outline-none focus:border-border-focus",
          ].join(" ")}
        />
        {phoneInput && (
          <button
            onClick={handleClear}
            aria-label="Clear search"
            className="absolute right-2 text-text-secondary hover:text-text-primary"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* ── Customer found ── */}
      {customer && (
        <div className="flex flex-col gap-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex flex-col gap-0.5">
              <span className="text-[14px] font-semibold text-text-primary">{customer.name}</span>
              <span className="text-[12px] text-text-secondary">{customer.phone}</span>
            </div>
            <div className="flex items-center gap-1 rounded-full bg-warning-bg px-2.5 py-1">
              <Star size={11} className="text-warning" />
              <span className="text-[11px] font-bold text-warning">
                {customer.loyaltyPoints} pts
              </span>
            </div>
          </div>

          {/* Loyalty earned on this bill */}
          <p className="text-[12px] text-success">
            +{loyaltyEarned} points earned on this bill
          </p>

          {/* Redeem toggle — only if customer has points */}
          {redeemablePoints > 0 && (
            <div className="flex items-center justify-between gap-3 rounded-md border border-border px-3 py-2">
              <span className="text-[12px] text-text-primary">
                Redeem {redeemablePoints} pts = {formatCurrency(redeemablePoints)} off
              </span>
              <button
                role="switch"
                aria-checked={redeemAmount > 0}
                aria-label="Toggle loyalty redemption"
                onClick={handleRedeemToggle}
                className={[
                  "relative h-5 w-9 shrink-0 rounded-full transition-colors duration-200",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                  redeemAmount > 0 ? "bg-success" : "bg-border",
                ].join(" ")}
              >
                <span
                  className={[
                    "absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform duration-200",
                    redeemAmount > 0 ? "translate-x-4" : "translate-x-0.5",
                  ].join(" ")}
                />
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── Not found after search ── */}
      {hasSearched && !customer && !showAddForm && (
        <div className="flex items-center justify-between gap-3">
          <p className="text-[12px] text-text-secondary">No customer found for this number</p>
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-[12px] font-medium text-text-primary transition-colors hover:border-primary hover:text-primary"
          >
            <UserPlus size={13} />
            Add New
          </button>
        </div>
      )}

      {/* ── Add new customer inline form ── */}
      {showAddForm && (
        <form
          onSubmit={handleSubmit(handleAddSubmit)}
          noValidate
          className="flex flex-col gap-3 rounded-md border border-border p-3"
        >
          <p className="text-[12px] font-semibold text-text-secondary">New Customer</p>

          <div className="flex flex-col gap-1">
            <input
              type="text"
              {...register("name")}
              placeholder="Customer name"
              className={[
                "w-full rounded-md border bg-input px-3 py-2 text-[13px] text-text-primary",
                "focus:outline-none focus:border-border-focus",
                addErrors.name ? "border-danger" : "border-border",
              ].join(" ")}
            />
            {addErrors.name && <p className="text-[11px] text-danger">{addErrors.name.message}</p>}
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={!isAddValid}
              className={[
                "flex-1 rounded-md px-3 py-1.5 text-[13px] font-semibold text-white transition-colors",
                !isAddValid ? "cursor-not-allowed bg-primary opacity-50" : "bg-primary hover:bg-primary-hover",
              ].join(" ")}
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="rounded-md border border-border px-3 py-1.5 text-[13px] text-text-secondary hover:text-text-primary"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

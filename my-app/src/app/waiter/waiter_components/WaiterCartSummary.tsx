"use client";

// RESPONSIBILITY: Right-panel cart summary inside the order punching modal.
// Shows cart items with qty controls, detected combos, happy-hour discount, and subtotal.
// Pure display + delegation — no business logic (Rule 6: logic in useWaiterOrder).
// DATA FLOW: useWaiterOrder → WaiterOrderModal → WaiterCartSummary → UI

import { Trash2, Minus, Plus, Tag, Zap, ShoppingCart } from "lucide-react";
import { formatCurrency } from "@/lib/formatters";
import type { WaiterCartSummaryProps } from "@/app/waiter/waiter_types/WaiterTypes";

// ─── Constants (Rule 35: No magic strings) ────────────────────────────────────

const EMPTY_CART_MSG   = "Cart is empty"                  as const;
const EMPTY_CART_SUB   = "Add items from the menu"        as const;
const COMBO_LABEL      = "Combo Deal Applied"             as const;
const HAPPY_HOUR_LABEL = "Happy Hours Discount (20% off)" as const;
const KOT_LABEL        = "KOT"                            as const;

const QUICK_TAGS = [
  "Extra Spicy 🌶️",
  "Less Oil 🧈",
  "No Onion/Garlic 🧄",
  "Jain Special 🕉️",
  "Extra Cheese 🧀",
  "Less Salt 🧂",
] as const;

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * Cart summary panel for the waiter order modal.
 * Displays line items, combo savings, happy-hour discount, and subtotal.
 */
export function WaiterCartSummary({
  cart,
  detectedCombos,
  happyHourDiscount,
  subtotal,
  kotNumber,
  onUpdateQty,
  onUpdateNotes,
  onRemove,
}: WaiterCartSummaryProps) {
  // ── Empty state ────────────────────────────────────────────────────────────
  if (cart.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-2 py-12 text-center">
        <ShoppingCart size={32} className="text-text-disabled" aria-hidden="true" />
        <p className="text-[13px] font-semibold text-text-secondary">{EMPTY_CART_MSG}</p>
        <p className="text-[12px] text-text-disabled">{EMPTY_CART_SUB}</p>
      </div>
    );
  }

  const comboSavings = detectedCombos.reduce((sum, d) => sum + d.saving, 0);
  const finalTotal   = subtotal - comboSavings - happyHourDiscount;

  return (
    <div className="flex flex-1 flex-col gap-3 overflow-hidden">
      {/* KOT number indicator */}
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-text-secondary">
          {KOT_LABEL} #{kotNumber}
        </span>
        <span className="text-[11px] text-text-disabled">
          {cart.length} item{cart.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Cart line items — scrollable */}
      <div className="flex flex-1 flex-col gap-2 overflow-y-auto">
        {cart.map((item) => (
          <div
            key={item.cartKey}
            className="flex items-start gap-2 rounded-lg border border-border bg-input p-2"
          >
            {/* Item info */}
            <div className="flex flex-1 flex-col gap-0.5 overflow-hidden">
              <p className="truncate text-[13px] font-semibold text-text-primary">
                {item.name}
              </p>
              {item.variantName && (
                <p className="text-[11px] text-text-secondary">{item.variantName}</p>
              )}
              {item.notes && (
                <p className="truncate text-[11px] italic text-text-disabled">
                  {item.notes}
                </p>
              )}
              <div className="mt-1 flex flex-wrap gap-1">
                {QUICK_TAGS.map(tag => (
                  <button
                    key={tag}
                    onClick={() => {
                      const newNotes = item.notes ? `${item.notes}, ${tag}` : tag;
                      onUpdateNotes(item.cartKey, newNotes);
                    }}
                    className="rounded bg-surface-hover px-1.5 py-0.5 text-[10px] text-text-secondary transition-colors hover:bg-primary/20 hover:text-primary"
                  >
                    +{tag}
                  </button>
                ))}
              </div>
              <p className="mt-1 text-[12px] font-medium text-text-primary">
                {formatCurrency(item.unitPrice * item.qty)}
              </p>
            </div>

            {/* Qty controls */}
            <div className="flex shrink-0 items-center gap-1">
              <button
                onClick={() => onUpdateQty(item.cartKey, -1)}
                aria-label={`Decrease qty for ${item.name}`}
                className="flex h-6 w-6 items-center justify-center rounded border border-border text-text-secondary transition-colors hover:border-danger hover:text-danger"
              >
                <Minus size={10} aria-hidden="true" />
              </button>
              <span className="w-5 text-center text-[13px] font-bold text-text-primary">
                {item.qty}
              </span>
              <button
                onClick={() => onUpdateQty(item.cartKey, 1)}
                aria-label={`Increase qty for ${item.name}`}
                className="flex h-6 w-6 items-center justify-center rounded border border-border text-text-secondary transition-colors hover:border-primary hover:text-primary"
              >
                <Plus size={10} aria-hidden="true" />
              </button>
              <button
                onClick={() => onRemove(item.cartKey)}
                aria-label={`Remove ${item.name} from cart`}
                className="ml-1 flex h-6 w-6 items-center justify-center rounded text-text-disabled transition-colors hover:text-danger"
              >
                <Trash2 size={11} aria-hidden="true" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Combo detected banners */}
      {detectedCombos.map(({ combo, saving }) => (
        <div
          key={combo.id}
          className="flex items-center gap-2 rounded-lg bg-info-bg px-3 py-2"
        >
          <Tag size={13} className="shrink-0 text-info" aria-hidden="true" />
          <div className="flex flex-1 flex-col">
            <p className="text-[12px] font-semibold text-info">{COMBO_LABEL}</p>
            <p className="text-[11px] text-text-secondary">
              {combo.name} — save {formatCurrency(saving)}
            </p>
          </div>
        </div>
      ))}

      {/* Happy hour discount line */}
      {happyHourDiscount > 0 && (
        <div className="flex items-center gap-2 rounded-lg bg-warning-bg px-3 py-2">
          <Zap size={13} className="shrink-0 text-warning" aria-hidden="true" />
          <div className="flex flex-1 flex-col">
            <p className="text-[12px] font-semibold text-warning">{HAPPY_HOUR_LABEL}</p>
            <p className="text-[11px] text-text-secondary">
              −{formatCurrency(happyHourDiscount)}
            </p>
          </div>
        </div>
      )}

      {/* Totals */}
      <div className="flex flex-col gap-1 border-t border-border pt-3">
        {(comboSavings > 0 || happyHourDiscount > 0) && (
          <div className="flex justify-between text-[12px] text-text-secondary">
            <span>Subtotal</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
        )}
        {comboSavings > 0 && (
          <div className="flex justify-between text-[12px] text-success">
            <span>Combo savings</span>
            <span>−{formatCurrency(comboSavings)}</span>
          </div>
        )}
        {happyHourDiscount > 0 && (
          <div className="flex justify-between text-[12px] text-warning">
            <span>Happy hours</span>
            <span>−{formatCurrency(happyHourDiscount)}</span>
          </div>
        )}
        <div className="flex justify-between text-[15px] font-bold text-text-primary">
          <span>Total</span>
          <span>{formatCurrency(finalTotal)}</span>
        </div>
      </div>
    </div>
  );
}

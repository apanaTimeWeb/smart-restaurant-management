"use client";

// RESPONSIBILITY: Bottom-sheet cart drawer for customer self-ordering.
// Slides up from bottom on mobile. Shows cart items with qty controls,
// per-item notes input, cart total, and Place Order button.
// All mutations delegated to parent via props — no direct state.
// DATA FLOW: useCustomerOrder → customer/page.tsx → CustomerCartDrawer → UI

import { useEffect } from "react";
import { X, Minus, Plus, Trash2, Loader2, ShoppingCart } from "lucide-react";
import type { CustomerCartDrawerProps, CustomerCartItem } from "@/app/customer/customer_types/CustomerTypes";

// ─── Constants (Rule 35: No magic strings) ────────────────────────────────────

const MIN_QTY = 1 as const;

// ─── Sub-components ───────────────────────────────────────────────────────────

// RESPONSIBILITY: Single cart line item with qty controls + notes input.
function CartLineItem({
  item,
  onUpdateQty,
  onUpdateNotes,
  onRemove,
}: {
  item:          CustomerCartItem;
  onUpdateQty:   (itemId: string, delta: number) => void;
  onUpdateNotes: (itemId: string, notes: string) => void;
  onRemove:      (itemId: string) => void;
}) {
  return (
    <div className="flex flex-col gap-2 border-b border-border pb-3 last:border-0 last:pb-0">
      <div className="flex items-start gap-3">
        {/* Name + price */}
        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-semibold text-text-primary leading-snug">{item.name}</p>
          <p className="text-[12px] text-text-secondary">₹{item.unitPrice} each</p>
        </div>

        {/* Qty controls */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() =>
              item.qty <= MIN_QTY ? onRemove(item.itemId) : onUpdateQty(item.itemId, -1)
            }
            aria-label={item.qty <= MIN_QTY ? `Remove ${item.name}` : `Decrease ${item.name} qty`}
            className="flex h-7 w-7 items-center justify-center rounded-full border border-border text-text-secondary hover:border-danger hover:text-danger transition-colors"
          >
            {item.qty <= MIN_QTY ? <Trash2 size={13} /> : <Minus size={13} />}
          </button>

          <span className="w-5 text-center text-[14px] font-bold text-text-primary">
            {item.qty}
          </span>

          <button
            onClick={() => onUpdateQty(item.itemId, 1)}
            aria-label={`Increase ${item.name} qty`}
            className="flex h-7 w-7 items-center justify-center rounded-full border border-border text-text-secondary hover:border-primary hover:text-primary transition-colors"
          >
            <Plus size={13} />
          </button>
        </div>

        {/* Line total */}
        <p className="shrink-0 text-[14px] font-bold text-text-primary w-16 text-right">
          ₹{item.unitPrice * item.qty}
        </p>
      </div>

      {/* Notes input */}
      <input
        type="text"
        value={item.notes}
        onChange={(e) => onUpdateNotes(item.itemId, e.target.value)}
        placeholder="Add note (e.g. less spicy, no onion)"
        maxLength={80}
        className="w-full rounded-lg border border-border bg-input px-3 py-1.5 text-[12px] text-text-primary placeholder:text-text-disabled focus:border-border-focus focus:outline-none"
      />
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function CustomerCartDrawer({
  isOpen,
  cart,
  isSubmitting,
  onClose,
  onUpdateQty,
  onUpdateNotes,
  onRemove,
  onPlaceOrder,
}: CustomerCartDrawerProps) {
  const cartTotal = cart.reduce((sum, c) => sum + c.unitPrice * c.qty, 0);
  const cartQty   = cart.reduce((sum, c) => sum + c.qty, 0);

  // Lock body scroll when drawer is open
  // Deps: isOpen — add/remove overflow-hidden on body
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  // Close on Escape key
  // Deps: isOpen, onClose — re-register when drawer opens/closes
  useEffect(() => {
    if (!isOpen) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Bottom sheet */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Your cart"
        className="fixed bottom-0 left-0 right-0 z-50 flex flex-col rounded-t-2xl bg-card shadow-2xl max-h-[85vh]"
      >
        {/* Handle bar */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="h-1 w-10 rounded-full bg-border" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-border">
          <div className="flex items-center gap-2">
            <ShoppingCart size={18} className="text-primary" />
            <p className="text-[16px] font-bold text-text-primary">Your Cart</p>
            <span className="rounded-full bg-primary-subtle px-2 py-0.5 text-[11px] font-semibold text-primary">
              {cartQty} item{cartQty !== 1 ? "s" : ""}
            </span>
          </div>
          <button
            onClick={onClose}
            aria-label="Close cart"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-text-secondary hover:text-text-primary transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Cart items — scrollable */}
        <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-3">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-10 text-center">
              <ShoppingCart size={36} className="text-text-disabled" />
              <p className="text-[14px] text-text-secondary">Your cart is empty</p>
            </div>
          ) : (
            cart.map((item) => (
              <CartLineItem
                key={item.itemId}
                item={item}
                onUpdateQty={onUpdateQty}
                onUpdateNotes={onUpdateNotes}
                onRemove={onRemove}
              />
            ))
          )}
        </div>

        {/* Footer — total + place order */}
        {cart.length > 0 && (
          <div className="border-t border-border px-5 py-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <p className="text-[13px] text-text-secondary">Subtotal ({cartQty} items)</p>
              <p className="text-[16px] font-bold text-text-primary">₹{cartTotal}</p>
            </div>
            <p className="text-[11px] text-text-disabled">
              Taxes & charges will be calculated at billing
            </p>
            <button
              onClick={onPlaceOrder}
              disabled={isSubmitting || cart.length === 0}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-4 text-[15px] font-bold text-white disabled:opacity-60 active:scale-95 transition-transform"
            >
              {isSubmitting && <Loader2 size={16} className="animate-spin" />}
              {isSubmitting ? "Placing Order…" : `Place Order · ₹${cartTotal}`}
            </button>
          </div>
        )}
      </div>
    </>
  );
}

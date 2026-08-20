"use client";

// RESPONSIBILITY: Order confirmation & running bill tracking view for customer QR self-ordering.
// Displays order status step-pipeline, live KOT cooking progress, itemized dish list with individual statuses,
// running bill subtotal & taxes, front-and-center 1-tap table call bells (Water, Bill, Waiter, Cleaning),
// and "+ Add More Items to Table Bill" launcher.
// DATA FLOW: order + menu → CustomerOrderStatus → createServiceRequest + CustomerBillRequestModal → UI

import { useState, useMemo } from "react";
import {
  CheckCircle2,
  Clock,
  Plus,
  UtensilsCrossed,
  Droplets,
  Receipt,
  Bell,
  Sparkles,
  ChevronRight,
  Flame,
  ChefHat,
} from "lucide-react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { STORAGE_KEYS } from "@/lib/localStorageSeeder";
import { createServiceRequest } from "@/lib/serviceRequestService";
import { showToast } from "@/lib/toastService";
import { formatCurrency } from "@/lib/formatters";
import { CustomerBillRequestModal } from "./CustomerBillRequestModal";
import type { AppOrder, AppMenuItem, ServiceRequestType } from "@/types/appTypes";
import type { CustomerOrderStatusProps } from "@/app/customer/customer_types/CustomerTypes";

export function CustomerOrderStatus({
  order,
  tableNumber,
  onOrderMore,
}: CustomerOrderStatusProps) {
  const [menu] = useLocalStorage<AppMenuItem[]>(STORAGE_KEYS.MENU, []);
  const [isBillModalOpen, setIsBillModalOpen] = useState(false);
  const [serviceSuccessMsg, setServiceSuccessMsg] = useState<string | null>(null);

  // Map menu item lookup
  const menuMap = useMemo(
    () => new Map(menu.map((m) => [m.id, m])),
    [menu]
  );

  // Group all KOT items across all KOTs for order summary
  const { orderItems, subtotal, cgst, sgst, grandTotal } = useMemo(() => {
    const map = new Map<string, { itemId: string; name: string; qty: number; unitPrice: number; totalPrice: number; notes?: string; status: string }>();
    let sub = 0;

    for (const kot of order.kots) {
      for (const item of kot.items) {
        if (item.status === "VOIDED") continue;
        const menuItem = menuMap.get(item.itemId);
        const name = menuItem?.name ?? item.itemId;
        const unitPrice = menuItem?.price ?? 0;
        const itemTotal = unitPrice * item.qty;
        sub += itemTotal;

        const key = `${item.itemId}||${item.notes || ""}||${item.status}`;
        const existing = map.get(key);

        if (existing) {
          existing.qty += item.qty;
          existing.totalPrice += itemTotal;
        } else {
          map.set(key, {
            itemId: item.itemId,
            name,
            qty: item.qty,
            unitPrice,
            totalPrice: itemTotal,
            notes: item.notes,
            status: item.status,
          });
        }
      }
    }

    const itemsList = Array.from(map.values());
    const taxCgst = sub * 0.025;
    const taxSgst = sub * 0.025;
    const total = Math.round(sub + taxCgst + taxSgst);

    return {
      orderItems: itemsList,
      subtotal: sub,
      cgst: taxCgst,
      sgst: taxSgst,
      grandTotal: total,
    };
  }, [order, menuMap]);

  // Overall order progress stage
  const overallStage = useMemo(() => {
    if (orderItems.length === 0) return "PLACED";
    const allServed = orderItems.every((i) => i.status === "SERVED");
    const anyReady = orderItems.some((i) => i.status === "READY");
    const anyCooking = orderItems.some((i) => i.status === "COOKING" || i.status === "PREPARING");

    if (allServed) return "SERVED";
    if (anyReady) return "READY";
    if (anyCooking) return "COOKING";
    return "PLACED";
  }, [orderItems]);

  function handleQuickServiceRequest(type: ServiceRequestType, label: string) {
    if (type === "BILL") {
      setIsBillModalOpen(true);
      return;
    }

    const res = createServiceRequest({
      tableId: tableNumber,
      tableNumber,
      type,
    });

    if (!res.success) {
      showToast({
        type: "warning",
        message: res.message || `${label} request already pending.`,
      });
      return;
    }

    setServiceSuccessMsg(`${label} Request Sent to Floor Waiter!`);
    setTimeout(() => setServiceSuccessMsg(null), 3000);
  }

  return (
    <div className="flex flex-col gap-5 py-4 max-w-lg mx-auto pb-24 animate-in fade-in duration-300">
      {/* Order Confirmed Hero Banner */}
      <div className="relative flex flex-col items-center justify-center gap-3 rounded-3xl border border-success/40 bg-gradient-to-b from-success/15 to-success/5 p-6 text-center shadow-lg overflow-hidden">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success text-white shadow-xl ring-4 ring-success/20 animate-in zoom-in duration-300">
          <CheckCircle2 size={36} />
        </div>

        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-black text-text-primary tracking-tight">Order Placed & Confirmed!</h1>
          <p className="text-xs text-text-secondary">
            Kitchen & Waiter Terminal notified for Table{" "}
            <span className="font-extrabold text-success text-sm">{tableNumber}</span>
          </p>
          <div className="mt-1 flex items-center justify-center gap-2 text-[11px] font-mono text-text-disabled">
            <span>Order ID: #{order.id.slice(-6).toUpperCase()}</span>
            <span>&bull;</span>
            <span>{order.kots.length} KOT Ticket{order.kots.length > 1 ? "s" : ""}</span>
          </div>
        </div>
      </div>

      {/* Live Cooking Progress Step Pipeline */}
      <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm">
        <h3 className="text-xs font-bold uppercase tracking-wider text-text-secondary flex items-center gap-1.5">
          <Flame size={14} className="text-amber-500 animate-pulse" />
          <span>Live Cooking Status Tracker</span>
        </h3>

        <div className="grid grid-cols-4 gap-1 text-center pt-2">
          {/* Step 1: Placed */}
          <div className="flex flex-col items-center gap-1">
            <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
              overallStage === "PLACED" || overallStage === "COOKING" || overallStage === "READY" || overallStage === "SERVED"
                ? "bg-success text-white ring-2 ring-success/30"
                : "bg-page text-text-disabled"
            }`}>
              1
            </div>
            <span className="text-[10px] font-bold text-text-primary">Order Placed</span>
          </div>

          {/* Step 2: Cooking */}
          <div className="flex flex-col items-center gap-1">
            <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
              overallStage === "COOKING" || overallStage === "READY" || overallStage === "SERVED"
                ? "bg-amber-500 text-white ring-2 ring-amber-500/30 animate-pulse"
                : "bg-page text-text-disabled"
            }`}>
              2
            </div>
            <span className="text-[10px] font-bold text-text-primary">Cooking</span>
          </div>

          {/* Step 3: Ready */}
          <div className="flex flex-col items-center gap-1">
            <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
              overallStage === "READY" || overallStage === "SERVED"
                ? "bg-emerald-500 text-white ring-2 ring-emerald-500/30"
                : "bg-page text-text-disabled"
            }`}>
              3
            </div>
            <span className="text-[10px] font-bold text-text-primary">Ready</span>
          </div>

          {/* Step 4: Served */}
          <div className="flex flex-col items-center gap-1">
            <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
              overallStage === "SERVED"
                ? "bg-primary text-white ring-2 ring-primary/30"
                : "bg-page text-text-disabled"
            }`}>
              4
            </div>
            <span className="text-[10px] font-bold text-text-primary">Served</span>
          </div>
        </div>
      </div>

      {/* Front-and-Center Quick Table Services (Prominent 1-Tap Action Grid) */}
      <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-5 shadow-sm">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-text-secondary">
            Quick Table Call Bells (1-Tap Call)
          </h2>
          <span className="text-[10px] text-text-disabled font-bold bg-page px-2 py-0.5 rounded-full border border-border">
            Table {tableNumber}
          </span>
        </div>

        {serviceSuccessMsg && (
          <div className="flex items-center gap-2 rounded-xl bg-success/15 border border-success/30 p-3 text-xs font-bold text-success animate-in fade-in">
            <CheckCircle2 size={16} />
            <span>{serviceSuccessMsg}</span>
          </div>
        )}

        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
          <button
            onClick={() => handleQuickServiceRequest("WATER", "Water")}
            className="flex flex-col items-center gap-1.5 rounded-2xl border border-border bg-page p-3.5 hover:border-blue-500/40 hover:bg-blue-500/10 transition-all text-center group active:scale-95 shadow-xs"
          >
            <Droplets className="h-6 w-6 text-blue-500 group-hover:scale-110 transition-transform" />
            <span className="font-bold text-xs text-text-primary">Water 💧</span>
          </button>

          <button
            onClick={() => handleQuickServiceRequest("BILL", "Bill")}
            className="flex flex-col items-center gap-1.5 rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-3.5 hover:bg-emerald-500/20 transition-all text-center group active:scale-95 shadow-xs ring-2 ring-emerald-500/20"
          >
            <Receipt className="h-6 w-6 text-emerald-500 group-hover:scale-110 transition-transform" />
            <span className="font-extrabold text-xs text-emerald-600">Request Bill 🧾</span>
          </button>

          <button
            onClick={() => handleQuickServiceRequest("WAITER_CALL", "Waiter")}
            className="flex flex-col items-center gap-1.5 rounded-2xl border border-border bg-page p-3.5 hover:border-amber-500/40 hover:bg-amber-500/10 transition-all text-center group active:scale-95 shadow-xs"
          >
            <Bell className="h-6 w-6 text-amber-500 group-hover:scale-110 transition-transform" />
            <span className="font-bold text-xs text-text-primary">Call Waiter 🛎️</span>
          </button>

          <button
            onClick={() => handleQuickServiceRequest("CLEANING", "Table Cleaning")}
            className="flex flex-col items-center gap-1.5 rounded-2xl border border-border bg-page p-3.5 hover:border-purple-500/40 hover:bg-purple-500/10 transition-all text-center group active:scale-95 shadow-xs"
          >
            <Sparkles className="h-6 w-6 text-purple-500 group-hover:scale-110 transition-transform" />
            <span className="font-bold text-xs text-text-primary">Cleaning 🧹</span>
          </button>
        </div>
      </div>

      {/* Estimated Time Card */}
      <div className="flex items-center gap-3.5 rounded-2xl border border-border bg-card p-4 shadow-xs">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">
          <Clock size={22} />
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-text-primary">Target Prep Estimate:</span>
            <span className="rounded-md bg-amber-500/20 px-2 py-0.5 text-xs font-black text-amber-500">
              15–20 Mins
            </span>
          </div>
          <p className="text-[11px] text-text-secondary mt-0.5 leading-relaxed">
            Your waiter will serve your dishes fresh to Table {tableNumber} as soon as ready!
          </p>
        </div>
      </div>

      {/* Itemized Order & Running Bill Breakdown */}
      <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-5 shadow-sm">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <UtensilsCrossed size={16} className="text-primary" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-text-secondary">
              Running Bill & Dishes ({orderItems.reduce((acc, i) => acc + i.qty, 0)})
            </h2>
          </div>
          <span className="text-[10px] font-bold text-success bg-success/10 px-2.5 py-0.5 rounded-full border border-success/30">
            Active Running Order
          </span>
        </div>

        {/* Itemized Dishes List */}
        <div className="flex flex-col divide-y divide-border/60">
          {orderItems.length === 0 ? (
            <p className="py-3 text-xs text-text-disabled text-center">No active items in order.</p>
          ) : (
            orderItems.map((item, idx) => (
              <div key={`${item.itemId}-${idx}`} className="flex items-center justify-between py-3">
                <div className="flex flex-col gap-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-text-primary">{item.name}</span>
                    <span className="rounded-md bg-page border border-border px-2 py-0.5 text-[11px] font-extrabold text-primary">
                      ×{item.qty}
                    </span>
                  </div>

                  {item.notes && (
                    <span className="text-[11px] italic text-amber-500">
                      Note: {item.notes}
                    </span>
                  )}
                </div>

                <div className="flex flex-col items-end gap-1">
                  <span className="text-xs font-bold text-text-primary font-mono">
                    {formatCurrency(item.totalPrice)}
                  </span>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${
                    item.status === "READY"
                      ? "bg-emerald-500/20 text-emerald-500 border border-emerald-500/30"
                      : item.status === "SERVED"
                      ? "bg-primary/20 text-primary border border-primary/30"
                      : "bg-amber-500/20 text-amber-500 border border-amber-500/30"
                  }`}>
                    {item.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Estimated Tax & Grand Total Summary */}
        <div className="flex flex-col gap-2 rounded-xl border border-border bg-page p-3.5 mt-2 text-xs">
          <div className="flex justify-between text-text-secondary">
            <span>Items Subtotal:</span>
            <span className="font-mono font-semibold text-text-primary">{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between text-text-secondary">
            <span>CGST (2.5%) + SGST (2.5%):</span>
            <span className="font-mono text-text-primary">{formatCurrency(cgst + sgst)}</span>
          </div>
          <div className="border-t border-border pt-2 flex justify-between items-center">
            <span className="font-bold text-text-primary text-sm">Estimated Total Bill:</span>
            <span className="font-mono font-extrabold text-base text-success">{formatCurrency(grandTotal)}</span>
          </div>
        </div>
      </div>

      {/* Prominent Action Button: Add More Items / Back to Menu */}
      <div className="flex flex-col gap-2.5">
        {onOrderMore && (
          <button
            onClick={onOrderMore}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-4 text-sm font-extrabold text-white shadow-lg transition-all hover:bg-primary-hover active:scale-98"
          >
            <Plus size={18} />
            <span>+ Add More Items to Table Bill</span>
            <ChevronRight size={16} />
          </button>
        )}
      </div>

      {/* Request Bill Modal */}
      <CustomerBillRequestModal
        isOpen={isBillModalOpen}
        tableId={tableNumber}
        tableNumber={tableNumber}
        onClose={() => setIsBillModalOpen(false)}
        onSuccess={() => setServiceSuccessMsg("Bill Request Sent to Cashier!")}
      />
    </div>
  );
}

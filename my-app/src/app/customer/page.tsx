"use client";

// RESPONSIBILITY: Customer QR self-ordering page shell.
// Standalone mobile page — no AppShell, no sidebar, no header.
// Reads ?table= from URL, routes between MENU → ORDER_STATUS → FEEDBACK → THANK_YOU views.
// DATA FLOW: URL(?table) → useCustomerOrder → customer/page.tsx → Customer* components

import { useState } from "react";
import { ThemeToggle } from "@/components/Theme/ThemeToggle";
import { useAuth } from "@/app/auth/auth_hooks/useAuth";
import { useRouter } from "next/navigation";
import { useCustomerOrder } from "@/app/customer/customer_hooks/useCustomerOrder";
import { CustomerMenuBrowser } from "@/app/customer/customer_components/CustomerMenuBrowser";
import { CustomerCartDrawer } from "@/app/customer/customer_components/CustomerCartDrawer";
import { CustomerOrderStatus } from "@/app/customer/customer_components/CustomerOrderStatus";
import { CustomerFeedbackForm } from "@/app/customer/customer_components/CustomerFeedbackForm";
import { CustomerFloatingServiceButton } from "@/app/customer/customer_components/CustomerFloatingServiceButton";


// ─── Constants (Rule 35: No magic strings) ────────────────────────────────────

const VIEW_MENU         = "MENU"         as const;
const VIEW_ORDER_STATUS = "ORDER_STATUS" as const;
const VIEW_FEEDBACK     = "FEEDBACK"     as const;
const VIEW_THANK_YOU    = "THANK_YOU"    as const;

// ─── Thank You Screen ─────────────────────────────────────────────────────────

// RESPONSIBILITY: Final thank-you screen shown after feedback submission.
function ThankYouScreen({ tableNumber }: { tableNumber: string }) {
  const { logout } = useAuth();
  const router = useRouter();
  
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center gap-5">
      <div className="absolute top-4 right-4 flex items-center gap-2">
        <ThemeToggle />
        <button
          onClick={() => { logout(); router.push("/auth/login"); }}
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-danger/10 text-danger hover:bg-danger hover:text-white transition-colors"
        >
          <LogOut size={16} />
        </button>
      </div>
      
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-success-bg text-[40px]">
        🙏
      </div>
      <div>
        <h1 className="text-[24px] font-bold text-text-primary">Thank You!</h1>
        <p className="mt-2 text-[14px] text-text-secondary">
          Your feedback helps us serve you better.
        </p>
        <p className="mt-1 text-[13px] text-text-disabled">
          Table {tableNumber} · Have a great meal!
        </p>
      </div>
      <div className="rounded-2xl border border-border bg-card px-6 py-4 text-[13px] text-text-secondary">
        Please wait for your server to bring the bill.
      </div>
    </div>
  );
}

import { CustomerQrUploadModal } from "@/app/customer/customer_components/CustomerQrUploadModal";
import { Upload, QrCode, Sparkles, LogOut } from "lucide-react";

// ─── No Table Screen with Upload QR Image Option ──────────────────────────────

// RESPONSIBILITY: Shown when no valid ?table= param is found in URL.
// Offers uploading existing Waiter QR code image or quick table selection for laptops.
function NoTableScreen() {
  const { logout } = useAuth();
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(true);

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center p-6 text-center gap-5 bg-page">
      <div className="absolute top-4 right-4 flex items-center gap-2">
        <ThemeToggle />
        <button
          onClick={() => { logout(); router.push("/auth/login"); }}
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-danger/10 text-danger hover:bg-danger hover:text-white transition-colors"
        >
          <LogOut size={16} />
        </button>
      </div>

      <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-success/10 text-success text-[36px] border border-success/30 shadow-lg">
        <QrCode size={40} />
      </div>
      
      <div className="max-w-md">
        <h1 className="text-2xl font-bold text-text-primary">Customer Self-Service QR Access</h1>
        <p className="mt-2 text-sm text-text-secondary">
          Please scan your table QR code, or upload an existing QR code image downloaded from the Waiter Dashboard.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mt-2">
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 rounded-xl bg-success px-5 py-3 text-sm font-bold text-white shadow-md transition-all hover:bg-success/90 active:scale-95"
        >
          <Upload size={18} />
          <span>Upload Existing QR Image / Select Table</span>
        </button>
      </div>

      <CustomerQrUploadModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function CustomerPage() {
  const {
    tableNumber,
    menuItems,
    cart,
    activeOrder,
    pageView,
    isSubmitting,
    isMounted,
    addToCart,
    updateQty,
    updateNotes,
    removeFromCart,
    submitOrder,
    submitFeedback,
    handleComplete,
    openMenu,
    viewOrderStatus,
  } = useCustomerOrder();

  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);

  // Hydration guard
  if (!isMounted) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  // No table param in URL
  if (!tableNumber) {
    return <NoTableScreen />;
  }

  // ── THANK_YOU view ─────────────────────────────────────────────────────────
  if (pageView === VIEW_THANK_YOU) {
    return <ThankYouScreen tableNumber={tableNumber} />;
  }

  // ── FEEDBACK view ──────────────────────────────────────────────────────────
  if (pageView === VIEW_FEEDBACK) {
    return (
      <CustomerFeedbackForm
        orderId={activeOrder?.id ?? ""}
        tableNumber={tableNumber}
        onSubmit={submitFeedback}
        isSubmitting={isSubmitting}
      />
    );
  }

  // ── ORDER_STATUS view ──────────────────────────────────────────────────────
  if (pageView === VIEW_ORDER_STATUS && activeOrder) {
    return (
      <CustomerOrderStatus
        order={activeOrder}
        tableNumber={tableNumber}
        onComplete={handleComplete}
        onOrderMore={openMenu}
      />
    );
  }

  // ── MENU view (default) ────────────────────────────────────────────────────
  return (
    <>
      <CustomerMenuBrowser
        menuItems={menuItems}
        cart={cart}
        activeOrder={activeOrder}
        onAddToCart={addToCart}
        onOpenCart={() => setIsCartOpen(true)}
        onViewRunningOrder={viewOrderStatus}
        onUpdateQty={updateQty}
      />

      <CustomerCartDrawer
        isOpen={isCartOpen}
        cart={cart}
        isSubmitting={isSubmitting}
        onClose={() => setIsCartOpen(false)}
        onUpdateQty={updateQty}
        onUpdateNotes={updateNotes}
        onRemove={removeFromCart}
        onPlaceOrder={async () => {
          await submitOrder();
          setIsCartOpen(false);
        }}
      />

      <CustomerFloatingServiceButton
        tableId={tableNumber}
        tableNumber={tableNumber}
      />
    </>
  );
}


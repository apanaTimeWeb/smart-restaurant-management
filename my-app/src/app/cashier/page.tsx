"use client";

// RESPONSIBILITY: Cashier Cashier POS page shell.
// Two-panel layout: left = CashierTableSelector, right = CashierOrderSummary + panels.
// Feature 17 panels (Discount, CRM, Payment, UPI QR) wired here.
// Manages all state via useCashierOrder + useCashierCrm hooks.
// DATA FLOW: useCashierOrder â†’ cashierTables + cartItems + taxBreakdown
//            â†’ CashierTableSelector + CashierOrderSummary + CashierDiscountPanel
//            + CashierCrmPanel + CashierSplitPaymentPanel + CashierUpiQrModal â†’ UI

import { useState, useEffect, useCallback, useMemo } from "react";
import { Split } from "lucide-react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { STORAGE_KEYS } from "@/lib/localStorageSeeder";
import { useCashierOrder } from "@/app/cashier/cashier_hooks/useCashierOrder";
import { useCashierCheckout } from "@/app/cashier/cashier_hooks/useCashierCheckout";
import { CashierTableSelector } from "@/app/cashier/cashier_components/CashierTableSelector";
import { CashierOrderSummary } from "@/app/cashier/cashier_components/CashierOrderSummary";
import { CashierDiscountPanel } from "@/app/cashier/cashier_components/CashierDiscountPanel";
import { CashierCrmPanel } from "@/app/cashier/cashier_components/CashierCrmPanel";
import { CashierSplitPaymentPanel } from "@/app/cashier/cashier_components/CashierSplitPaymentPanel";
import { CashierExtraChargesPanel } from "@/app/cashier/cashier_components/CashierExtraChargesPanel";
import { CashierShiftSummaryBar } from "@/app/cashier/cashier_components/CashierShiftSummaryBar";
import { CashierGuestSplitModal } from "@/app/cashier/cashier_components/CashierGuestSplitModal";
import { CashierShiftReconciliationModal } from "@/app/cashier/cashier_components/CashierShiftReconciliationModal";
import { CashierUpiQrModal } from "@/app/cashier/cashier_components/CashierUpiQrModal";
import { CashierReceiptModal } from "@/app/cashier/cashier_components/CashierReceiptModal";
import { CashierCashDenominationModal } from "@/app/cashier/cashier_components/CashierCashDenominationModal";
import { CashierApprovalCenterModal } from "@/app/cashier/cashier_components/CashierApprovalCenterModal";
import { CashierManagerPinModal } from "@/app/cashier/cashier_components/CashierManagerPinModal";
import { CashierThermalReceiptPreviewModal } from "@/app/cashier/cashier_components/CashierThermalReceiptPreviewModal";
import { CashierKeyboardShortcutsModal } from "@/app/cashier/cashier_components/CashierKeyboardShortcutsModal";
import { CashierCashCalculatorModal } from "@/app/cashier/cashier_components/CashierCashCalculatorModal";
import { CashierStockRecoveryModal } from "@/app/cashier/cashier_components/CashierStockRecoveryModal";
import { AuthGuard } from "@/app/auth/auth_components/AuthGuard";
import { Calculator, ShieldCheck, Printer, Keyboard, DollarSign, KeyRound, Package } from "lucide-react";
import type {
  CashierPaymentMode,
  CashierSingleMethod,
  CashierSplitPaymentValues,
  CashierShiftMetrics,
} from "@/app/cashier/cashier_types/CashierTypes";
import type { AppCrmCustomer, AppServiceRequest, AppLowStockAlert } from "@/types/appTypes";

const PAGE_TITLE    = "Cashier Cashier POS" as const;
const PAGE_SUBTITLE = "Select a table to view and process the bill" as const;
const SKELETON_ROWS = 3 as const;

export default function CashierPage() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const [crmCustomers, setCrmCustomers] = useLocalStorage<AppCrmCustomer[]>(STORAGE_KEYS.CRM_CUSTOMERS, []);
  const [serviceRequests]               = useLocalStorage<AppServiceRequest[]>(STORAGE_KEYS.SERVICE_REQUESTS, []);

  const {
    cashierTables,
    selectedTableId,
    cartItems,
    taxBreakdown,
    includeServiceCharge,
    appliedDiscount,
    customTip,
    packagingCharge,
    selectTable,
    toggleServiceCharge,
    applyDiscount,
    clearDiscount,
    setLoyaltyRedeemed,
    setCustomTip,
    setPackagingCharge,
  } = useCashierOrder();

  const { isProcessing, processCheckout, buildWhatsAppLink, buildReceiptText } = useCashierCheckout();

  // Modal & Panel States
  const [paymentMode,   setPaymentMode]   = useState<CashierPaymentMode>("SINGLE");
  const [singleMethod,  setSingleMethod]  = useState<CashierSingleMethod>("CASH");
  const [splitValues,   setSplitValues]   = useState<CashierSplitPaymentValues>({ cash: 0, upi: 0, card: 0 });
  const [isUpiQrOpen,   setIsUpiQrOpen]   = useState<boolean>(false);
  const [isGuestSplitOpen, setIsGuestSplitOpen] = useState<boolean>(false);
  const [isReconcileOpen, setIsReconcileOpen]   = useState<boolean>(false);
  const [isDenomOpen, setIsDenomOpen]         = useState<boolean>(false);
  const [isApprovalOpen, setIsApprovalOpen]     = useState<boolean>(false);

  // New Enterprise POS Modal States
  const [isManagerPinOpen, setIsManagerPinOpen]   = useState<boolean>(false);
  const [isThermalPreviewOpen, setIsThermalPreviewOpen] = useState<boolean>(false);
  const [isShortcutsOpen, setIsShortcutsOpen]     = useState<boolean>(false);
  const [isCashCalcOpen, setIsCashCalcOpen]       = useState<boolean>(false);

  // Stock Recovery Hub State
  const [stockAlerts] = useLocalStorage<AppLowStockAlert[]>(STORAGE_KEYS.STOCK_ALERTS, []);
  const [isStockRecoveryOpen, setIsStockRecoveryOpen] = useState<boolean>(false);
  const activeStockAlertsCount = useMemo(
    () => stockAlerts.filter((a) => a.status !== "RESTOCKED").length,
    [stockAlerts]
  );

  // Global POS Keyboard Hotkeys listener (Rule 35 / Real-world POS Ergonomics)
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "F2") {
        e.preventDefault();
        const searchInput = document.getElementById("table-search-input");
        if (searchInput) searchInput.focus();
      } else if (e.key === "F4") {
        e.preventDefault();
        setIsManagerPinOpen(true);
      } else if (e.key === "F8") {
        e.preventDefault();
        handleProceedToPayment();
      } else if (e.key === "F9") {
        e.preventDefault();
        setIsCashCalcOpen(true);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Receipt modal state
  const [isReceiptOpen,  setIsReceiptOpen]  = useState<boolean>(false);
  const [receiptWaLink,  setReceiptWaLink]  = useState<string>("");

  // CRM customer state
  const [crmCustomerPhone, setCrmCustomerPhone] = useState<string>("");
  const [crmCustomerName,  setCrmCustomerName]  = useState<string>("");
  const [crmRedeemAmount,  setCrmRedeemAmount]  = useState<number>(0);

  // Snapshot customer info specifically for receipt modal (prevents state wipe on checkout re-render)
  const [receiptCustomerPhone, setReceiptCustomerPhone] = useState<string>("");
  const [receiptCustomerName,  setReceiptCustomerName]  = useState<string>("");

  const selectedTableInfo   = cashierTables.find((bt) => bt.table.id === selectedTableId);
  const selectedTableNumber = selectedTableInfo?.table.tableNumber ?? "";
  const selectedOrderId     = selectedTableInfo?.order.id ?? "";

  const handlePaymentReady = useCallback(
    (mode: CashierPaymentMode, method: CashierSingleMethod, split: CashierSplitPaymentValues) => {
      setPaymentMode(mode);
      setSingleMethod(method);
      setSplitValues(split);
    },
    []
  );

  // Auto-fill customer phone from dedicated localStorage key, pending BILL requests, or order info
  useEffect(() => {
    if (!selectedTableId) {
      setCrmCustomerPhone("");
      setCrmCustomerName("");
      return;
    }

    const normKey = (s?: string) => {
      if (!s) return "";
      const clean = s.toLowerCase().trim().replace(/^(table|tbl|t)-?/i, "").trim();
      return clean.padStart(2, "0");
    };

    const normSelId  = normKey(selectedTableId);
    const normSelNum = normKey(selectedTableNumber);

    // 0. Check direct dedicated localStorage key
    if (typeof window !== "undefined") {
      const storedPhone =
        (normSelNum ? window.localStorage.getItem(`table_phone_${normSelNum}`) : null) ||
        (normSelId ? window.localStorage.getItem(`table_phone_${normSelId}`) : null);

      if (storedPhone && storedPhone.length >= 10) {
        const clean = storedPhone.replace(/\D/g, "").slice(0, 10);
        setCrmCustomerPhone(clean);
        setCrmCustomerName(`Guest (Table ${selectedTableNumber || normSelNum})`);
        return;
      }
    }

    // 1. Check ALL (pending, acknowledged, completed) BILL service requests for phone number
    const billReq = serviceRequests.find(
      (r) =>
        r &&
        r.type === "BILL" &&
        (normKey(r.tableId) === normSelId ||
         normKey(r.tableNumber) === normSelId ||
         normKey(r.tableId) === normSelNum ||
         normKey(r.tableNumber) === normSelNum)
    );

    if (billReq?.customMessage) {
      const phoneMatch = billReq.customMessage.match(/\b\d{10}\b/);
      if (phoneMatch) {
        setCrmCustomerPhone(phoneMatch[0]);
        setCrmCustomerName(`Guest (Table ${selectedTableNumber || normSelNum})`);
        return;
      }
    }

    // 2. Check if active order has customerInfo phone
    if (selectedTableInfo?.order?.customerInfo?.phone) {
      const cleanPhone = selectedTableInfo.order.customerInfo.phone.replace(/\D/g, "");
      if (cleanPhone.length >= 10) {
        setCrmCustomerPhone(cleanPhone.slice(0, 10));
        setCrmCustomerName(selectedTableInfo.order.customerInfo.name || "Guest");
        return;
      }
    }

    // 3. Otherwise leave empty so cashier can ask customer and type manually
    setCrmCustomerPhone("");
    setCrmCustomerName("");
  }, [selectedTableId, selectedTableNumber, serviceRequests, selectedTableInfo]);

  // Listen to cross-tab storage changes (e.g. when customer submits bill request in another tab)
  useEffect(() => {
    function handleStorageChange(e: StorageEvent) {
      if (!selectedTableId) return;
      if (e.key?.startsWith("table_phone_") || e.key === STORAGE_KEYS.SERVICE_REQUESTS) {
        const normKey = (s?: string) => (s || "").toLowerCase().trim().replace(/^(table|tbl|t)-?/i, "").trim().padStart(2, "0");
        const normSelNum = normKey(selectedTableNumber);
        const normSelId  = normKey(selectedTableId);
        const stored =
          (normSelNum ? window.localStorage.getItem(`table_phone_${normSelNum}`) : null) ||
          (normSelId ? window.localStorage.getItem(`table_phone_${normSelId}`) : null);

        if (stored && stored.length >= 10) {
          const clean = stored.replace(/\D/g, "").slice(0, 10);
          setCrmCustomerPhone(clean);
          setCrmCustomerName(`Guest (Table ${selectedTableNumber || normSelNum})`);
        }
      }
    }

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [selectedTableId, selectedTableNumber]);

  const handleCheckout = useCallback(async () => {
    const normKey = (s?: string) => {
      if (!s) return "";
      const clean = s.toLowerCase().trim().replace(/^(table|tbl|t)-?/i, "").trim();
      return clean.padStart(2, "0");
    };

    const normSelId  = normKey(selectedTableId);
    const normSelNum = normKey(selectedTableNumber);

    // Synchronous real-time lookup directly from storage at click time
    let resolvedPhone = crmCustomerPhone;

    if (!resolvedPhone || resolvedPhone.length < 10) {
      if (typeof window !== "undefined") {
        const stored =
          (normSelNum ? window.localStorage.getItem(`table_phone_${normSelNum}`) : null) ||
          (normSelId ? window.localStorage.getItem(`table_phone_${normSelId}`) : null);

        if (stored && stored.length >= 10) {
          resolvedPhone = stored.replace(/\D/g, "").slice(0, 10);
        }
      }
    }

    if (!resolvedPhone || resolvedPhone.length < 10) {
      try {
        const rawReqs = typeof window !== "undefined" ? window.localStorage.getItem(STORAGE_KEYS.SERVICE_REQUESTS) : null;
        if (rawReqs) {
          const reqs: AppServiceRequest[] = JSON.parse(rawReqs);
          const billReq = reqs.find(
            (r) =>
              r &&
              r.type === "BILL" &&
              (normKey(r.tableId) === normSelId ||
               normKey(r.tableNumber) === normSelId ||
               normKey(r.tableId) === normSelNum ||
               normKey(r.tableNumber) === normSelNum)
          );
          if (billReq?.customMessage) {
            const phoneMatch = billReq.customMessage.match(/\b\d{10}\b/);
            if (phoneMatch) {
              resolvedPhone = phoneMatch[0];
            }
          }
        }
      } catch (err) {
        console.error("Error reading service request phone:", err);
      }
    }

    if (!resolvedPhone || resolvedPhone.length < 10) {
      if (selectedTableInfo?.order?.customerInfo?.phone) {
        const clean = selectedTableInfo.order.customerInfo.phone.replace(/\D/g, "");
        if (clean.length >= 10) resolvedPhone = clean.slice(0, 10);
      }
    }

    const targetPhone = resolvedPhone || "";
    const targetName  = crmCustomerName || (targetPhone ? `Guest (Table ${selectedTableNumber || normSelNum})` : "");

    setReceiptCustomerPhone(targetPhone);
    setReceiptCustomerName(targetName);
    if (targetPhone) setCrmCustomerPhone(targetPhone);

    const success = await processCheckout({
      orderId:       selectedOrderId,
      tableNumber:   selectedTableNumber,
      taxBreakdown,
      cartItems,
      paymentMode,
      singleMethod,
      splitValues,
      customerPhone: targetPhone,
      loyaltyEarned: Math.floor(taxBreakdown.totalAmount * 0.05),
      redeemAmount:  crmRedeemAmount,
    });

    if (!success) return;

    // Build WhatsApp link if customer phone is present
    if (targetPhone && targetPhone.length >= 10) {
      const receiptText = buildReceiptText(cartItems, taxBreakdown, selectedTableNumber);
      const link = buildWhatsAppLink(targetPhone, receiptText);
      setReceiptWaLink(link);
    } else {
      setReceiptWaLink("");
    }

    setIsReceiptOpen(true);
  }, [
    processCheckout, selectedOrderId, selectedTableNumber, selectedTableId, selectedTableInfo,
    taxBreakdown, cartItems, paymentMode, singleMethod, splitValues,
    crmCustomerPhone, crmCustomerName, crmRedeemAmount,
    buildReceiptText, buildWhatsAppLink,
  ]);

  function handleProceedToPayment() {
    if (!selectedOrderId || !selectedTableNumber) return;
    if (singleMethod === "UPI" && paymentMode === "SINGLE") {
      setIsUpiQrOpen(true);
      return;
    }
    void handleCheckout();
  }

  function handleUpiConfirm() {
    setIsUpiQrOpen(false);
    void handleCheckout();
  }

  function handleReceiptClose() {
    if (typeof window !== "undefined" && selectedTableNumber) {
      const normKey = (s: string) => (s || "").toLowerCase().replace(/^(table|tbl|t)-?/i, "").trim().padStart(2, "0");
      window.localStorage.removeItem(`table_phone_${normKey(selectedTableNumber)}`);
    }
    setIsReceiptOpen(false);
    setReceiptWaLink("");
    setReceiptCustomerPhone("");
    setReceiptCustomerName("");
    setCrmCustomerPhone("");
    setCrmCustomerName("");
    setCrmRedeemAmount(0);
    selectTable("");
  }

  function handleSaveCustomerWhatsApp(phone: string) {
    setCrmCustomers((prev) => {
      if (prev.some((c) => c.phone === phone)) return prev;
      return [
        ...prev,
        {
          name: "Guest",
          phone,
          loyaltyPoints: 0,
          totalVisits: 0,
          history: [],
        },
      ];
    });
  }

  // Cashier shift metrics
  const shiftMetrics: CashierShiftMetrics = useMemo(() => ({
    openingFloat:   2000,
    cashCollected:  4850,
    upiCollected:   6200,
    cardCollected:  3100,
    discountGiven:  450,
    totalNetSales:  14150,
    totalBillsPaid: 18,
  }), []);

  if (!isMounted) {
    return (
      <div className="rounded-xl border border-primary/20 bg-white/10 backdrop-blur-lg p-6 shadow-lg flex flex-col gap-6">
        <CashierPageHeader />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[320px_1fr]">
          <div className="flex flex-col gap-2">
            {Array.from({ length: SKELETON_ROWS }).map((_, i) => (
              <div key={i} className="skeleton h-20 rounded-lg" />
            ))}
          </div>
          <div className="skeleton h-96 rounded-lg" />
        </div>
      </div>
    );
  }

  return (
    <AuthGuard allowedRoles={["CASHIER", "ADMIN"]}>
      <div className="rounded-xl border border-primary/20 bg-white/10 backdrop-blur-lg p-6 shadow-lg flex flex-col gap-6">
        <CashierPageHeader
          onOpenDenom={() => setIsDenomOpen(true)}
          onOpenApproval={() => setIsApprovalOpen(true)}
          onOpenPin={() => setIsManagerPinOpen(true)}
          onOpenHotkeys={() => setIsShortcutsOpen(true)}
          onOpenStockRecovery={() => setIsStockRecoveryOpen(true)}
          activeStockAlertsCount={activeStockAlertsCount}
        />

        {/* Live Cashier Shift Summary Overview Bar */}
        <CashierShiftSummaryBar
          metrics={shiftMetrics}
          onOpenReconciliation={() => setIsReconcileOpen(true)}
        />

        {/* Two-panel layout: left selector + right summary */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[320px_1fr]">
          {/* Left panel â€” table selector */}
          <div className="flex flex-col gap-3">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-text-secondary">
              Pending Tables ({cashierTables.length})
            </p>
            <CashierTableSelector
              tables={cashierTables}
              selectedTableId={selectedTableId}
              onSelect={selectTable}
            />
          </div>

          {/* Right panel â€” order summary + extra charges + discount + CRM + payment */}
          <div className="flex flex-col gap-4">
            {selectedTableId && (
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-text-secondary">
                  Bill Summary & Breakdown
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsThermalPreviewOpen(true)}
                    className="flex items-center gap-1.5 rounded-xl border border-border bg-page px-2.5 py-1 text-xs font-bold text-text-primary hover:bg-surface-hover transition-colors"
                  >
                    <Printer size={13} className="text-primary" />
                    <span>80mm Thermal Receipt</span>
                  </button>

                  <button
                    onClick={() => setIsCashCalcOpen(true)}
                    className="flex items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs font-bold text-emerald-500 hover:bg-emerald-500/20 transition-colors"
                  >
                    <DollarSign size={13} />
                    <span>Cash Calc [F9]</span>
                  </button>

                  <button
                    onClick={() => setIsGuestSplitOpen(true)}
                    className="flex items-center gap-1.5 rounded-xl border border-primary/30 bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary hover:bg-primary/20 transition-colors"
                  >
                    <Split size={13} />
                    <span>Guest Split</span>
                  </button>
                </div>
              </div>
            )}

            <CashierOrderSummary
              cartItems={cartItems}
              taxBreakdown={taxBreakdown}
              includeServiceCharge={includeServiceCharge}
              onToggleServiceCharge={toggleServiceCharge}
              onProceedToPayment={handleProceedToPayment}
            />

            {/* Cashier panels â€” only shown when a table is selected */}
            {selectedTableId && cartItems.length > 0 && (
              <>
                <CashierExtraChargesPanel
                  customTip={customTip}
                  packagingCharge={packagingCharge}
                  onSetTip={setCustomTip}
                  onSetPackaging={setPackagingCharge}
                />
                <CashierDiscountPanel
                  appliedDiscount={appliedDiscount}
                  onApply={applyDiscount}
                  onClear={clearDiscount}
                />
                <CashierCrmPanel
                  totalAmount={taxBreakdown.totalAmount}
                  customerPhone={crmCustomerPhone}
                  onRedeemChange={(amount) => {
                    setLoyaltyRedeemed(amount);
                    setCrmRedeemAmount(amount);
                  }}
                  onCustomerChange={(phone, name) => {
                    setCrmCustomerPhone(phone);
                    setCrmCustomerName(name);
                  }}
                />
                <CashierSplitPaymentPanel
                  totalAmount={taxBreakdown.totalAmount}
                  onPaymentReady={handlePaymentReady}
                />
              </>
            )}
          </div>
        </div>

        {/* Guest Split Modal â€” z-50 */}
        <CashierGuestSplitModal
          isOpen={isGuestSplitOpen}
          tableNumber={selectedTableNumber}
          cartItems={cartItems}
          taxBreakdown={taxBreakdown}
          onClose={() => setIsGuestSplitOpen(false)}
        />

        {/* Shift Till Reconciliation Z-Report Modal â€” z-50 */}
        <CashierShiftReconciliationModal
          isOpen={isReconcileOpen}
          metrics={shiftMetrics}
          onClose={() => setIsReconcileOpen(false)}
        />

        {/* UPI QR Modal â€” z-40 */}
        <CashierUpiQrModal
          isOpen={isUpiQrOpen}
          amount={taxBreakdown.totalAmount}
          tableNumber={selectedTableNumber}
          onConfirm={handleUpiConfirm}
          onClose={() => setIsUpiQrOpen(false)}
        />

        {/* Receipt Modal â€” z-50 */}
        <CashierReceiptModal
          isOpen={isReceiptOpen}
          cartItems={cartItems}
          taxBreakdown={taxBreakdown}
          tableNumber={selectedTableNumber}
          customerName={receiptCustomerName || crmCustomerName}
          customerPhone={receiptCustomerPhone || crmCustomerPhone}
          whatsAppLink={receiptWaLink}
          onSaveCustomerWhatsApp={handleSaveCustomerWhatsApp}
          onClose={handleReceiptClose}
        />

        {/* Cash Denomination Modal */}
        <CashierCashDenominationModal
          isOpen={isDenomOpen}
          onClose={() => setIsDenomOpen(false)}
          expectedCash={shiftMetrics.cashCollected}
        />

        {/* Void & Discount Approval Center Modal */}
        <CashierApprovalCenterModal
          isOpen={isApprovalOpen}
          onClose={() => setIsApprovalOpen(false)}
        />

        {/* Manager PIN Authorization Modal */}
        <CashierManagerPinModal
          isOpen={isManagerPinOpen}
          onClose={() => setIsManagerPinOpen(false)}
          onSuccess={() => undefined}
        />

        {/* 80mm Thermal Receipt Preview Modal */}
        <CashierThermalReceiptPreviewModal
          isOpen={isThermalPreviewOpen}
          onClose={() => setIsThermalPreviewOpen(false)}
          tableNumber={selectedTableNumber}
          cartItems={cartItems}
          taxBreakdown={taxBreakdown}
          customerPhone={crmCustomerPhone}
          customerName={crmCustomerName}
        />

        {/* POS Hotkeys Guide Modal */}
        <CashierKeyboardShortcutsModal
          isOpen={isShortcutsOpen}
          onClose={() => setIsShortcutsOpen(false)}
        />

        {/* Quick Cash Change Calculator Modal */}
        <CashierCashCalculatorModal
          isOpen={isCashCalcOpen}
          onClose={() => setIsCashCalcOpen(false)}
          payableAmount={taxBreakdown.totalAmount}
          onConfirmPayment={() => handleProceedToPayment()}
        />

        {/* Dedicated Cashier Stock Recovery Hub Modal */}
        <CashierStockRecoveryModal
          isOpen={isStockRecoveryOpen}
          onClose={() => setIsStockRecoveryOpen(false)}
        />
      </div>
    </AuthGuard>
  );
}


// â”€â”€â”€ Sub-components â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function CashierPageHeader({
  onOpenDenom,
  onOpenApproval,
  onOpenPin,
  onOpenHotkeys,
  onOpenStockRecovery,
  activeStockAlertsCount = 0,
}: {
  onOpenDenom?: () => void;
  onOpenApproval?: () => void;
  onOpenPin?: () => void;
  onOpenHotkeys?: () => void;
  onOpenStockRecovery?: () => void;
  activeStockAlertsCount?: number;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-primary">{PAGE_TITLE}</h1>
        <p className="text-sm text-text-secondary">{PAGE_SUBTITLE}</p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {onOpenStockRecovery && (
          <button
            onClick={onOpenStockRecovery}
            className="flex items-center gap-1.5 rounded-xl border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-xs font-bold text-amber-400 hover:bg-amber-500/20 transition-all relative shadow-xs"
          >
            <Package className="h-4 w-4 text-amber-400" />
            <span>Stock Recovery Hub ðŸ“¦</span>
            {activeStockAlertsCount > 0 && (
              <span className="rounded-full bg-amber-500 px-1.5 py-0.2 text-[10px] font-extrabold text-white animate-pulse">
                {activeStockAlertsCount}
              </span>
            )}
          </button>
        )}

        {onOpenHotkeys && (
          <button
            onClick={onOpenHotkeys}
            className="flex items-center gap-1.5 rounded-xl border border-border bg-card px-3 py-2 text-xs font-bold text-text-primary hover:border-primary transition-all"
          >
            <Keyboard className="h-4 w-4 text-primary" />
            <span>Hotkeys [F1]</span>
          </button>
        )}

        {onOpenPin && (
          <button
            onClick={onOpenPin}
            className="flex items-center gap-1.5 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs font-bold text-red-500 hover:bg-red-500/20 transition-all"
          >
            <KeyRound className="h-4 w-4" />
            <span>Manager PIN [F4]</span>
          </button>
        )}

        {onOpenDenom && (
          <button
            onClick={onOpenDenom}
            className="flex items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs font-bold text-emerald-500 hover:bg-emerald-500/20 transition-all"
          >
            <Calculator className="h-4 w-4" />
            <span>Cash Denominations</span>
          </button>
        )}
        {onOpenApproval && (
          <button
            onClick={onOpenApproval}
            className="flex items-center gap-1.5 rounded-xl border border-primary/30 bg-primary/10 px-3 py-2 text-xs font-bold text-primary hover:bg-primary/20 transition-all"
          >
            <ShieldCheck className="h-4 w-4" />
            <span>Approval Center</span>
          </button>
        )}
      </div>
    </div>
  );
}


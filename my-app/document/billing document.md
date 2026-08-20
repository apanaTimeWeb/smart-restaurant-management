# Smart Restaurant Management System (`my-app`) — Cashier & Billing POS Module Documentation

Welcome to the **Cashier & Billing POS Module Documentation** for the **Smart Restaurant Management System (`my-app`)**. This document provides an exhaustive, function-by-function, component-by-component, and flow-by-flow technical breakdown of the entire billing system.

---

## 📖 Table of Contents

1. [Cashier Role Overview & Security Access Permissions](#1-cashier-role-overview--security-access-permissions)
2. [Main POS Interface Layout (`/billing`)](#2-main-pos-interface-layout-billing)
3. [Pending Tables & Service Requests Selector (`BillingTableSelector.tsx`)](#3-pending-tables--service-requests-selector-billingtableselectortsx)
4. [Order Aggregation & Tax Calculation Engine (`useBillingOrder.ts`, `BillingOrderSummary.tsx`)](#4-order-aggregation--tax-calculation-engine-usebillingordertsx-billingordersummarytsx)
5. [Extra Charges & Tip Panel (`BillingExtraChargesPanel.tsx`)](#5-extra-charges--tip-panel-billingextrachargespaneltsx)
6. [Discount Manager & Security Override (`BillingDiscountPanel.tsx`, `BillingManagerPinModal.tsx`)](#6-discount-manager--security-override-billingdiscountpaneltsx-billingmanagerpinmodaltsx)
7. [Customer CRM & Loyalty Points Engine (`BillingCrmPanel.tsx`, `useBillingCrm.ts`)](#7-customer-crm--loyalty-points-engine-billingcrmpaneltsx-usebillingcrmts)
8. [Payment Processing & Split Payment Engine (`BillingSplitPaymentPanel.tsx`, `BillingUpiQrModal.tsx`)](#8-payment-processing--split-payment-engine-billingsplitpaymentpaneltsx-billingupiqrmodaltsx)
9. [Automated Checkout & Stock Depletion Engine (`useBillingCheckout.ts`)](#9-automated-checkout--stock-depletion-engine-usebillingcheckoutts)
10. [Receipt Printing, 80mm Thermal Preview & WhatsApp Receipt Integration (`BillingReceiptModal.tsx`, `BillingThermalReceiptPreviewModal.tsx`)](#10-receipt-printing-80mm-thermal-preview--whatsapp-receipt-integration-billingreceiptmodaltsx-billingthermalreceiptpreviewmodaltsx)
11. [Guest Bill Splitting Engine (`BillingGuestSplitModal.tsx`)](#11-guest-bill-splitting-engine-billingguestsplitmodaltsx)
12. [Shift Summary, Cash Till Reconciliation & Denominations (`BillingShiftSummaryBar.tsx`, `BillingShiftReconciliationModal.tsx`, `BillingCashDenominationModal.tsx`)](#12-shift-summary-cash-till-reconciliation--denominations-billingshiftsummarybartsx-billington-modaltsx)
13. [Void & High-Discount Approval Center (`BillingApprovalCenterModal.tsx`)](#13-void--high-discount-approval-center-billingapprovalcentermodaltsx)
14. [Quick Cash Change Calculator & POS Keyboard Hotkeys (`BillingCashCalculatorModal.tsx`, `BillingKeyboardShortcutsModal.tsx`)](#14-quick-cash-change-calculator--pos-keyboard-hotkeys-billingcashcalculatormodaltsx-billingkeyboardshortcutsmodaltsx)
15. [Technical Directory Architecture & Function Index](#15-technical-directory-architecture--function-index)

---

## 1. Cashier Role Overview & Security Access Permissions

The **Cashier Billing POS** module (`/billing`) is the financial backbone of the restaurant operations.

- **Route**: `/billing`
- **RBAC Security Guard**: Enforced by `AuthGuard allowedRoles={["CASHIER", "ADMIN"]}`.
- **Key Responsibilities**:
  - Viewing occupied tables and table bill requests.
  - Aggregating kitchen order tickets (KOTs) into a unified itemized bill.
  - Applying taxes (CGST 2.5%, SGST 2.5%, optional Service Charge 5%, Liquor VAT 18%).
  - Managing discounts, promo codes, and Non-Chargeable (NC) complimentary settlements.
  - Linking customer phone numbers, calculating loyalty points cashback (5%), and redeeming points.
  - Processing Cash, UPI (Dynamic QR Code), Card (POS Terminal), and Multi-Method Split Payments.
  - Automatic inventory deduction based on dish ingredient recipes.
  - Generating printable 80mm thermal receipts and instant WhatsApp bill links.
  - Shift cash float tracking, cash drawer denomination counting, and Day-End Till Reconciliation (Z-Report).

---

## 2. Main POS Interface Layout (`/billing`)

The main page (`billing/page.tsx`) features an ergonomic two-column POS grid layout:

- **Top Header Bar**: System title, operational action buttons:
  - `Stock Recovery Hub 📦`: Dedicated modal to manage low stock alerts from kitchen with *In Progress 🚚* & *Stock Supplied 📦* actions.
  - `Hotkeys [F1]`: POS keyboard shortcuts guide.
  - `Manager PIN [F4]`: 4-digit security authorization popup.
  - `Cash Denominations`: Physical drawer cash counter.
  - `Approval Center`: Pending void and discount requests queue.
- **Shift Summary Bar (`BillingShiftSummaryBar.tsx`)**: Real-time counter of Opening Float, Cash Collected, UPI Collected, Card Collected, Discounts, Net Sales, and Total Bills Settle count.
- **Left Panel (320px)**: Pending tables selector with real-time bill request indicators.
- **Right Panel (Flex-1)**: Selected table's bill summary, itemized breakdown, tax details, and collapsible action panels.

---

## 3. Pending Tables & Service Requests Selector (`BillingTableSelector.tsx`)

Manages table discovery and customer bill call alerts.

- **Search & Filter**: Search box (`F2` shortcut) to quickly search tables by number or name.
- **Table Card Badges**:
  - 🟢 **`OCCUPIED`**: Active dining table with open order.
  - 🟡 **`BILLING_PENDING`**: Waiter or Customer has requested the bill.
  - 🔔 **`Customer Bill Request`**: Highlights tables where customer tapped "Request Bill" on their QR menu dashboard. Auto-populates the customer's phone number into the billing CRM input!
- **Table Card Data**: Table Number, Guest Count, Order ID, Active KOT Count, Total Bill Amount (₹), Elapsed Dining Time.

---

## 4. Order Aggregation & Tax Calculation Engine (`useBillingOrder.ts`, `BillingOrderSummary.tsx`)

### 4.1 KOT Aggregation Logic (`aggregateKots`)
- Iterates over all KOTs associated with the selected active order.
- Merges identical items (same `itemId` + `notes`) by summing quantities.
- **Excludes Voided Items**: Any item marked with `status === "VOIDED"` is automatically filtered out from the final bill.

### 4.2 Tax Breakdown Calculation Logic (`calculateTax`)
Computes precise mathematical breakdown using standard rates:
- **Subtotal**: Sum of all non-voided cart items ($\sum \text{qty} \times \text{unitPrice}$).
- **CGST (2.5%)**: $\text{Subtotal} \times 0.025$.
- **SGST (2.5%)**: $\text{Subtotal} \times 0.025$.
- **Service Charge (5%)**: $\text{Subtotal} \times 0.05$ (Optional toggle button on POS).
- **Liquor VAT (18%)**: Applicable strictly to items routed to the `Bar` kitchen station ($\text{Bar Subtotal} \times 0.18$).
- **Discounts & Loyalty**: Deducts percentage/flat discounts and redeemed loyalty points.
- **Extra Charges**: Adds custom tip amount and packaging/delivery fees.
- **Round-Off**: Calculates nearest integer rupee rounding adjustment ($\text{Total Rounded} - \text{Pre-Total Exact}$).
- **Final Payable Amount**: $\max(0, \text{Total Rounded})$.

---

## 5. Extra Charges & Tip Panel (`BillingExtraChargesPanel.tsx`)

Allows cashiers to add optional extra charges to the bill prior to checkout:
- **Custom Tip Input (₹)**: Staff tip amount added directly to the total bill.
- **Packaging / Delivery Charge (₹)**: Container or takeaway delivery fee.

---

## 6. Discount Manager & Security Override (`BillingDiscountPanel.tsx`, `BillingManagerPinModal.tsx`)

### 6.1 Discount Types
- **`PERCENTAGE`**: e.g., 10% OFF, 15% OFF, 20% OFF.
- **`FLAT`**: Flat ₹ amount discount (e.g. ₹100 OFF).
- **`NC` (Non-Chargeable)**: Settles bill at ₹0 for VIPs, management, or food testing.

### 6.2 Manager PIN Security Guard (`BillingManagerPinModal.tsx`)
- Configured 4-digit Manager PIN (Default: `1234` / `9999`).
- **Trigger**: Any discount exceeding **15%**, item void request, or NC bill automatically locks the checkout and demands Manager PIN entry.
- Writes an immutable security entry to `app_audit_logs`.

---

## 7. Customer CRM & Loyalty Points Engine (`BillingCrmPanel.tsx`, `useBillingCrm.ts`)

- **Phone Number Lookup**: Instant search across `app_crm_customers`.
- **Customer Phone Auto-Fill & Manual Input**:
  - When customer requests a bill on their phone screen with a WhatsApp mobile number, the Cashier POS automatically extracts the 10-digit number from `app_service_requests` when that table is selected.
  - The phone number automatically auto-fills into the Cashier CRM Panel and Thermal Receipt WhatsApp Sharing modal for instant 5% loyalty points calculation and 1-tap WhatsApp receipt dispatch.
  - If the customer did NOT provide a phone number (or walked directly to the Cashier counter), the phone input box remains blank so the Cashier can ask the customer directly and type their 10-digit number manually.
- **Loyalty Points Earning Rate**: Customers earn **5% cashback** in loyalty points on every settled bill ($\lfloor \text{Total Amount} \times 0.05 \rfloor$).
- **Redemption Rate**: 1 Loyalty Point = ₹1 Discount. Cashier can enter custom redemption points up to maximum customer balance.
- **New Customer Creation**: Quickly registers new customer with name and phone number directly from billing panel.

---

## 8. Payment Processing & Split Payment Engine (`BillingSplitPaymentPanel.tsx`, `BillingUpiQrModal.tsx`)

### 8.1 Single Payment Mode
- 💵 **Cash**: Cash settlement; unlocks Quick Cash Calculator (`F9`).
- 📱 **UPI / Dynamic QR (`BillingUpiQrModal.tsx`)**: Generates dynamic UPI QR code containing exact payable amount and restaurant VPA (`restaurant@upi`).
- 💳 **Card**: POS Card swipe/dip terminal payment.

### 8.2 Multi-Method Split Payment Mode (`BillingSplitPaymentPanel.tsx`)
- Allows customers to split a single bill across Cash, UPI, and Card simultaneously (e.g., ₹500 Cash + ₹750 UPI).
- Real-time validator highlights remaining balance or excess allocation errors.

---

## 9. Automated Checkout & Stock Depletion Engine (`useBillingCheckout.ts`)

When cashier clicks **"Proceed to Payment"**, the checkout hook executes a **7-step sequential workflow**:

1. **Recipe Inventory Stock Depletion (`app_inventory`)**:
   - Inspects ingredient recipe mapping for each dish (`menuItem.recipe`).
   - Multiplies recipe ingredient quantity by ordered dish quantity.
   - Automatically deducts raw material stock from `app_inventory`.
2. **Sales Record Creation (`app_sales_history`)**:
   - Stores itemized sales record with sale ID, order ID, table number, tax breakdown, payment method, split details, cashier ID, and timestamp.
3. **CRM Customer Update (`app_crm_customers`)**:
   - Adds earned loyalty points, deducts redeemed points, increments `totalVisits`, and appends sale ID to customer order history.
4. **Order Status Finalization (`app_orders`)**:
   - Updates order status from `ACTIVE` to `COMPLETED`.
5. **Table Reset (`app_tables`)**:
   - Updates table status to `CLEANING` and sets `currentOrderId = null`.
6. **Audit Log Dispatch (`app_audit_logs`)**:
   - Logs `CHECKOUT_COMPLETED` audit trail entry with full payment details.
7. **Waiter Notification Dispatch (`dispatchNotification`)**:
   - Sends real-time bell sound notification to Waiter POS: *"Bill Ready - Table X 🧾"*.

---

## 10. Receipt Printing, 80mm Thermal Preview & WhatsApp Receipt Integration (`BillingReceiptModal.tsx`, `BillingThermalReceiptPreviewModal.tsx`)

### 10.1 Printable Bill Modal (`BillingReceiptModal.tsx`)
- Formatted printable receipt featuring restaurant header, GSTIN, table number, order ID, itemized list, tax breakdown, and footer thank-you message.
- 1-Click `Print Receipt` triggers browser print / thermal printer output.

### 10.2 80mm Thermal Receipt Preview (`BillingThermalReceiptPreviewModal.tsx`)
- Monospaced 80mm POS thermal paper preview modal with exact character formatting for POS receipt hardware.

### 10.3 Instant WhatsApp Receipt Sharing (`buildWhatsAppLink`, `buildReceiptText`)
- Generates formatted plain-text receipt text message.
- Creates `wa.me` URL string (`https://wa.me/91XXXXXXXXXX?text=...`).
- Allows Cashier to enter/confirm customer WhatsApp number and open WhatsApp web/app with 1 click!

---

## 11. Guest Bill Splitting Engine (`BillingGuestSplitModal.tsx`)

Enables table bill splitting among multiple dining guests:
- **Even Split**: Divides total bill amount equally among N guests (2 to 10 guests).
- **Itemized Split**: Assigns individual menu dishes to specific guests.
- Calculates individual payable amounts and prints individual mini-receipts for each guest.

---

## 12. Shift Summary, Cash Till Reconciliation & Denominations (`BillingShiftSummaryBar.tsx`, `BillingShiftReconciliationModal.tsx`, `BillingCashDenominationModal.tsx`)

### 12.1 Cashier Shift Summary Bar (`BillingShiftSummaryBar.tsx`)
- Displays live shift counters for float, cash, UPI, card, discounts, and total net sales.

### 12.2 Physical Cash Denomination Counter (`BillingCashDenominationModal.tsx`)
- Interactive currency note counter grid:
  - ₹2000, ₹500, ₹200, ₹100, ₹50, ₹20, ₹10, ₹5 notes & Coins.
- Calculates total physical cash counted in drawer and compares against system expected cash.

### 12.3 Day-End Till Reconciliation Z-Report (`BillingShiftReconciliationModal.tsx`)
- Enter physical cash counted in drawer.
- Calculates cash variance ($\text{Physical Cash} - \text{Expected Cash}$).
- Identifies Cash Excess (+) or Shortage (-).
- Generates Z-Report summary and locks shift register.

---

## 13. Void & High-Discount Approval Center (`BillingApprovalCenterModal.tsx`)

Centralized queue for Cashiers and Admins to audit pending kitchen void item requests and high-discount authorization requests:
- Lists dish name, table number, requesting staff, reason for void/discount.
- Action buttons: `Approve` or `Reject` (requires Manager PIN).

---

## 14. Quick Cash Change Calculator & POS Keyboard Hotkeys (`BillingCashCalculatorModal.tsx`, `BillingKeyboardShortcutsModal.tsx`)

### 14.1 Quick Cash Change Calculator (`BillingCashCalculatorModal.tsx`)
- Cashier enters Cash Received from customer (e.g. ₹2,000 note on a ₹1,340 bill).
- Calculates exact Change to Return ($\text{Received} - \text{Payable} = \text{₹660}$).
- Quick preset cash buttons (+₹100, +₹500, +₹2000).

### 14.2 POS Ergonomic Keyboard Hotkeys Guide (`BillingKeyboardShortcutsModal.tsx`)
- `F1`: Open POS Keyboard Hotkeys Guide.
- `F2`: Focus Table Search Input box.
- `F4`: Open Manager PIN Authorization Modal.
- `F8`: Trigger Proceed to Payment / Settlement.
- `F9`: Open Quick Cash Change Calculator.

---

## 15. Cashier Stock Recovery Hub (`BillingStockRecoveryModal.tsx`)

Dedicated low stock procurement management modal for cashiers:
- **Real-Time Active Alert Queue**: Displays all active low stock alerts sent from kitchen (`app_stock_alerts`).
- **Interactive Cashier Actions**:
  - 🚚 **`Mark Restock In Progress`**: Updates alert status to `IN_PROGRESS` $\rightarrow$ Syncs live with Admin SLA Monitor & Kitchen Terminal (Blue Badge).
  - 📦 **`Mark Stock Supplied`**: Updates alert status to `DISPATCHED` $\rightarrow$ Notifies Kitchen to confirm receipt (Purple Badge).
- **Auto-Removal on Restock**: When Kitchen staff confirms *Full Stock Received*, item automatically toggles to `IN_STOCK` and **disappears from Cashier Stock Recovery Hub & Admin Monitor!**

---

## 16. Technical Directory Architecture & Function Index

### 📁 `src/app/billing/`
- **`page.tsx`**: Main Cashier POS shell, manages layout, hooks wiring, keyboard hotkeys, and modals.
- **`BillingErrorBoundary.tsx`**: React Error Boundary catch for billing crashes.
- **`billing_url_config.ts`**: Billing route configuration.

### 📁 `src/app/billing/billing_hooks/`
- **`useBillingOrder.ts`**: Reads tables, orders, menu, aggregates KOTs, computes tax breakdown.
- **`useBillingCheckout.ts`**: Orchestrates 7-step checkout, inventory recipe deduction, sales record, CRM update, WhatsApp receipt.
- **`useBillingCrm.ts`**: Handles CRM customer lookup, 5% cashback calculation, points redemption.

### 📁 `src/app/billing/billing_components/`
- `BillingTableSelector.tsx` — Table list & bill request badges.
- `BillingOrderSummary.tsx` — Cart items & tax breakdown summary.
- `BillingExtraChargesPanel.tsx` — Tip & packaging fee controls.
- `BillingDiscountPanel.tsx` — Promo codes & discount options.
- `BillingCrmPanel.tsx` — Customer phone & loyalty point controls.
- `BillingSplitPaymentPanel.tsx` — Single & split payment controls.
- `BillingUpiQrModal.tsx` — Dynamic UPI QR code popup.
- `BillingReceiptModal.tsx` — Printable receipt & WhatsApp link launcher.
- `BillingThermalReceiptPreviewModal.tsx` — 80mm monospaced thermal preview.
- `BillingGuestSplitModal.tsx` — Guest bill splitter modal.
- `BillingShiftSummaryBar.tsx` — Live shift KPI overview bar.
- `BillingShiftReconciliationModal.tsx` — Till reconciliation & Z-Report modal.
- `BillingCashDenominationModal.tsx` — Currency notes denomination counter.
- `BillingApprovalCenterModal.tsx` — Manager void & discount approval queue.
- `BillingManagerPinModal.tsx` — Manager 4-digit PIN override modal.
- `BillingKeyboardShortcutsModal.tsx` — Hotkeys guide dialog.
- `BillingCashCalculatorModal.tsx` — Cash change calculator dialog.
- `BillingStockRecoveryModal.tsx` — Cashier low stock recovery hub modal.

### 📁 `src/app/billing/billing_types/`
- **`BillingTypes.ts`**: TypeScript definitions for `BillingCartItem`, `BillingTaxBreakdown`, `BillingDiscount`, `BillingCheckoutPayload`, `BillingShiftMetrics`, `BillingPaymentMode`.

---

*Document generated for Smart Restaurant Management System (`my-app`). Location: `my-app/document/billing document.md`.*

---

## 🚀 Version 2.0 & Multi-Tenant Updates
- **Multi-Tenant Integration**: The billing system is now securely isolated per tenant, ensuring data privacy and correct reporting for distinct hotel owners.
- **Enhanced SLA Alerts**: Critical alerts regarding Kitchen inventory SLA breaches are now prominently displayed to cashiers for immediate action.

# Smart Restaurant Management System (`my-app`) — Cashier & Billing POS Module Full Hinglish Documentation

Is document me **Smart Restaurant Management System (`my-app`)** ke **CASHIER & BILLING POS** module ka har ek feature, sub-page, button, calculation, business logic, hook, aur component pure **Hinglish** me detailed me samjhaya gaya hai.

---

## 📖 Table of Contents

1. [Cashier Role Overview Aur Access Rights](#1-cashier-role-overview-aur-access-rights)
2. [Main POS Interface Layout (`/billing`)](#2-main-pos-interface-layout-billing)
3. [Pending Tables Selector Aur Customer Bill Requests (`BillingTableSelector.tsx`)](#3-pending-tables-selector-aur-customer-bill-requests-billingtableselectortsx)
4. [Order Aggregation Aur Tax Calculation Engine (`useBillingOrder.ts`, `BillingOrderSummary.tsx`)](#4-order-aggregation-aur-tax-calculation-engine-usebillingordertsx-billingordersummarytsx)
5. [Extra Charges Aur Tip Panel (`BillingExtraChargesPanel.tsx`)](#5-extra-charges-aur-tip-panel-billingextrachargespaneltsx)
6. [Discount Rules Aur Manager PIN Security (`BillingDiscountPanel.tsx`, `BillingManagerPinModal.tsx`)](#6-discount-rules-aur-manager-pin-security-billingdiscountpaneltsx-billingmanagerpinmodaltsx)
7. [Customer CRM Aur Loyalty Points System (`BillingCrmPanel.tsx`, `useBillingCrm.ts`)](#7-customer-crm-aur-loyalty-points-system-billingcrmpaneltsx-usebillingcrmts)
8. [Payment Modes Aur Split Payment System (`BillingSplitPaymentPanel.tsx`, `BillingUpiQrModal.tsx`)](#8-payment-modes-aur-split-payment-system-billingsplitpaymentpaneltsx-billingupiqrmodaltsx)
9. [Automated Checkout Sequence Aur Recipe Inventory Depletion (`useBillingCheckout.ts`)](#9-automated-checkout-sequence-aur-recipe-inventory-depletion-usebillingcheckoutts)
10. [Printable Bill Receipt, 80mm Thermal Preview Aur WhatsApp Receipt Integration (`BillingReceiptModal.tsx`, `BillingThermalReceiptPreviewModal.tsx`)](#10-printable-bill-receipt-80mm-thermal-preview-aur-whatsapp-receipt-integration-billingreceiptmodaltsx-billingthermalreceiptpreviewmodaltsx)
11. [Guest Bill Split System (`BillingGuestSplitModal.tsx`)](#11-guest-bill-split-system-billingguestsplitmodaltsx)
12. [Shift Register Summary, Till Reconciliation Aur Cash Denomination Counter (`BillingShiftSummaryBar.tsx`, `BillingShiftReconciliationModal.tsx`, `BillingCashDenominationModal.tsx`)](#12-shift-register-summary-till-reconciliation-aur-cash-denomination-counter-billingshiftsummarybartsx-billington-modaltsx)
13. [Void Item Requests Aur High-Discount Approval Center (`BillingApprovalCenterModal.tsx`)](#13-void-item-requests-aur-high-discount-approval-center-billingapprovalcentermodaltsx)
14. [Quick Cash Change Calculator Aur POS Keyboard Hotkeys (`BillingCashCalculatorModal.tsx`, `BillingKeyboardShortcutsModal.tsx`)](#14-quick-cash-change-calculator-aur-pos-keyboard-hotkeys-billingcashcalculatormodaltsx-billingkeyboardshortcutsmodaltsx)
15. [Technical Directory Architecture Aur Function Index](#15-technical-directory-architecture-aur-function-index)

---

## 1. Cashier Role Overview Aur Access Rights

**Cashier Billing POS** module (`/billing`) restaurant ke daily financial settlements ka sabse main center hai.

- **Allowed Route**: `/billing`
- **RBAC Security Guard**: Is page ko sirf `CASHIER` aur `ADMIN` login wale users hi open kar sakte hain (`AuthGuard allowedRoles={["CASHIER", "ADMIN"]}`).
- **Cashier Ki Main Responsibilities**:
  - Restaurant ke active dining tables aur unke bill requests dekhna.
  - Waiters dwara bheje gaye multiple Kitchen Order Tickets (KOTs) ko ek single bill me summarize karna.
  - Applicable Taxes add karna (CGST 2.5%, SGST 2.5%, optional Service Charge 5%, Liquor VAT 18%).
  - Customer ke discount codes, promo offers, ya Complimentary Non-Chargeable (NC) bills process karna.
  - Customer phone number link karke 5% loyalty points cashback calculate karna aur purane points redeem karna.
  - Cash, UPI (Dynamic QR Code), Card (POS Terminal), aur Multi-Method Split Payments handle karna.
  - Dish ke ingredients ke hisab se raw inventory stock automatic reduce/deduct karna.
  - Formatted printable bill receipt, 80mm thermal receipt print karna, aur customer ke WhatsApp par bill link bhejnik.
  - Opening cash float handle karna, cash drawer notes count karna, aur Shift End Till Reconciliation (Z-Report) submit karna.

---

## 2. Main POS Interface Layout (`/billing`)

Main Cashier Billing page (`billing/page.tsx`) me super-fast billing ke liye ergonomically designed 2-column layout diya gaya hai:

- **Top Header Bar**: System title ke saath quick operational control buttons:
  - `Hotkeys [F1]`: POS keyboard shortcuts dialog.
  - `Manager PIN [F4]`: Manager PIN security popup modal.
  - `Cash Denominations`: Physical drawer cash notes counter.
  - `Approval Center`: Pending void items aur high-discount requests queue.
- **Shift Summary Overview Bar (`BillingShiftSummaryBar.tsx`)**: Live counter jo batata hai Opening Float, Cash Collected, UPI Collected, Card Collected, Discounts Given, Total Net Sales, aur Bills Paid count.
- **Left Panel (320px width)**: Active aur pending tables ka selector list.
- **Right Panel (Flex-1 width)**: Selected table ka detailed bill, itemized dish list, tax summary, aur payment options.

---

## 3. Pending Tables Selector Aur Customer Bill Requests (`BillingTableSelector.tsx`)

Table discovery aur customer bill request alerts handling.

- **Search & Quick Filter**: Search input box (`F2` shortcut) jisse table number ya name instantly search kiya ja sakta hai.
- **Table Card Status Badges**:
  - 🟢 **`OCCUPIED`**: Table par customer baitha hai aur active order chal raha hai.
  - 🟡 **`BILLING_PENDING`**: Waiter ya Customer ne bill generate karne ke liye request kiya hai.
  - 🔔 **`Customer Bill Request`**: Jab customer apne QR Menu dashboard se "Request Bill" par tap karta hai aur apna WhatsApp phone number enter karta hai, toh yahan live Notification alert highlight hota hai! Subse khaas baat yeh hai ki Cashier jab table select karta hai, toh **Customer Ka Phone Number Automatic Billing Panel me auto-fill ho jata hai!**
- **Table Card Info**: Table Number, Guest Count, Order ID, Active KOT Count, Total Bill Amount (₹), aur Dining Time Elapsed.

---

## 4. Order Aggregation Aur Tax Calculation Engine (`useBillingOrder.ts`, `BillingOrderSummary.tsx`)

### 4.1 KOT Aggregation Logic (`aggregateKots`)
- Active order ke saare KOTs ko scan karke ek single consolidated item list banata hai.
- Duplicate items (Same `itemId` + Same `notes`) ko merge karke item quantity sum up karta hai.
- **Voided Items Exclusion**: Agar kitchen ya waiter ne kisi item ko `status === "VOIDED"` mark kiya hai, toh wo item bill me se automatic eliminate ho jata hai.

### 4.2 Tax Calculation Logic (`calculateTax`)
Precise tax formulas ke saath auto-calculation hota hai:
- **Subtotal**: Saare non-voided cart items ka subtotal ($\sum \text{qty} \times \text{unitPrice}$).
- **CGST (2.5%)**: $\text{Subtotal} \times 0.025$.
- **SGST (2.5%)**: $\text{Subtotal} \times 0.025$.
- **Service Charge (5%)**: $\text{Subtotal} \times 0.05$ (Cashier isse screen par 1-click me ON/OFF toggle kar sakta hai).
- **Liquor VAT (18%)**: Sirf unhi items par lagta hai jo `Bar` station ke hote hain ($\text{Bar Items Subtotal} \times 0.18$).
- **Discounts & Loyalty**: Total bill me se promo discounts aur loyalty points minus hote hain.
- **Extra Charges**: Custom Tip aur Packaging fees add hote hain.
- **Round-Off**: Final bill ko nearest rupee par round off karta hai ($\text{Total Rounded} - \text{Pre-Total Exact}$).
- **Net Payable Amount**: $\max(0, \text{Total Rounded})$.

---

## 5. Extra Charges Aur Tip Panel (`BillingExtraChargesPanel.tsx`)

Cashier bill checkout se pehle optional extra charges apply kar sakta hai:
- **Custom Tip Input (₹)**: Customer dwara diya gaya tip amount jo bill me add ho jata hai.
- **Packaging / Delivery Charge (₹)**: Takeaway packing box ya delivery charge.

---

## 6. Discount Rules Aur Manager PIN Security (`BillingDiscountPanel.tsx`, `BillingManagerPinModal.tsx`)

### 6.1 Discount Types
- **`PERCENTAGE`**: e.g., 10% OFF, 15% OFF, 20% OFF.
- **`FLAT`**: Flat ₹ amount discount (e.g. ₹100 OFF).
- **`NC` (Non-Chargeable)**: VIPs, restaurant owner guests, ya staff food testing ke liye bill ₹0 par settle karna.

### 6.2 Manager PIN Security Guard (`BillingManagerPinModal.tsx`)
- 4-digit Manager Security PIN (Default: `1234` / `9999`).
- **Security Trigger**: Jab bhi discount **15%** se zyaada ho, item void karna ho, ya NC bill settle karna ho, tab system mandatory Manager PIN popup show karta hai.
- Manager PIN verify hone par hi discount apply hota hai aur system audit log me security entry record karta hai.

---

## 7. Customer CRM Aur Loyalty Points System (`BillingCrmPanel.tsx`, `useBillingCrm.ts`)

- **Phone Number Lookup**: Phone number se instant customer search (`app_crm_customers`).
- **Customer Phone Auto-Fill Aur Manual Input**:
  - Agar customer ne self-ordering QR screen par bill request karte waqt apna WhatsApp number dala tha, toh Cashier POS par us table ko select karte hi **Customer CRM Panel aur Receipt WhatsApp input box me wo number AUTOMATICALLY auto-fill ho jata hai**.
  - Agar customer ne bill request par number nahi dala tha (ya customer khud counter par direct aake bill banwa raha hai), toh **Cashier POS ka phone input box bilkul BLANK rehta hai** taaki Cashier customer se puch kar khud mobile number type kar sake.
- **Loyalty Cashback (5%)**: Har settled bill par customer ko total amount ka **5% cashback** loyalty points ke roop me milta hai ($\lfloor \text{Total Amount} \times 0.05 \rfloor$).
- **Loyalty Points Redemption**: 1 Point = ₹1 Discount. Cashier customer ke available points ko bill me discount ke roop me redeem kar sakta hai.
- **New Customer Direct Onboarding**: Agar naya customer hai, toh Cashier uska Name aur Phone number daal kar instantly register kar sakta hai.

---

## 8. Payment Modes Aur Split Payment System (`BillingSplitPaymentPanel.tsx`, `BillingUpiQrModal.tsx`)

### 8.1 Single Payment Mode
- 💵 **Cash**: Cash payment; 1-click me Quick Cash Calculator (`F9`) launch hota hai.
- 📱 **UPI / Dynamic QR (`BillingUpiQrModal.tsx`)**: Exact bill amount ka dynamic QR Code generate karta hai restaurant ke VPA (`restaurant@upi`) ke saath. Customer Google Pay, PhonePe, ya Paytm se scan karke pay kar sakta hai.
- 💳 **Card**: POS Card terminal swipe/dip payment.

### 8.2 Multi-Method Split Payment Mode (`BillingSplitPaymentPanel.tsx`)
- Jab customer bill ko multiple mediums se split karke pay karna chahe (Jaise ₹500 Cash + ₹750 UPI).
- Real-time calculator remaining balance aur calculation errors highlights karta hai.

---

## 9. Automated Checkout Sequence Aur Recipe Inventory Depletion (`useBillingCheckout.ts`)

Jab Cashier **"Proceed to Payment"** par click karta hai, tab system ek saath **7 automated steps** execute karta hai:

1. **Recipe-based Inventory Stock Depletion (`app_inventory`)**:
   - Bill me ordered har dish ke recipe ingredients scan karta hai.
   - Dish quantity $\times$ ingredient quantity compute karke raw material stock ko `app_inventory` se automatic minus karta hai.
2. **Sales Record Entry (`app_sales_history`)**:
   - Bill ka complete itemized sales record (Sale ID, Order ID, Table, Subtotal, CGST, SGST, Service Charge, VAT, Discount, Net Amount, Payment Method, Split Breakdown, Cashier ID, Timestamp) save karta hai.
3. **CRM Loyalty Update (`app_crm_customers`)**:
   - Customer ke account me naye earned loyalty points add karta hai, redeemed points deduct karta hai, `totalVisits` increment karta hai, aur sale ID history me attach karta hai.
4. **Order Status Settlement (`app_orders`)**:
   - Order ka status `ACTIVE` se change karke `COMPLETED` karta hai.
5. **Table Status Reset (`app_tables`)**:
   - Table ka status `CLEANING` me set karta hai aur `currentOrderId = null` karta hai taaki naye customers baith sakein.
6. **Audit Log Generation (`app_audit_logs`)**:
   - System audit logs me immutable `CHECKOUT_COMPLETED` entry record karta hai.
7. **Waiter Instant Notification (`dispatchNotification`)**:
   - Waiter POS app par instant Bell sound alert bhejta hai: *"Bill Ready - Table X 🧾"*.

---

## 10. Printable Bill Receipt, 80mm Thermal Preview Aur WhatsApp Receipt Integration (`BillingReceiptModal.tsx`, `BillingThermalReceiptPreviewModal.tsx`)

### 10.1 Printable Receipt Modal (`BillingReceiptModal.tsx`)
- Formatted printable bill receipt jisme Restaurant Name, GSTIN, Address, Table Number, Order ID, Date & Time, Itemized List, Tax Details, aur Footer note dikhta hai.
- `Print Receipt` button par click karne par browser print ya connected receipt printer se bill print nikalta hai.

### 10.2 80mm Thermal Receipt Preview (`BillingThermalReceiptPreviewModal.tsx`)
- Standard 80mm POS thermal paper receipt preview modal monospaced font formatting ke saath.

### 10.3 Instant WhatsApp Receipt Sharing (`buildWhatsAppLink`, `buildReceiptText`)
- Bill ka formatted text summary auto-generate hota hai.
- Direct `wa.me` WhatsApp link generate hota hai (`https://wa.me/91XXXXXXXXXX?text=...`).
- Cashier customer ka WhatsApp number verify/enter karke 1-click me WhatsApp Web / App par bill text message bhej sakta hai!

---

## 11. Guest Bill Split System (`BillingGuestSplitModal.tsx`)

Table bill ko multiple guests ke beech split karne ka module:
- **Even Split**: Total bill ko N guests (2 se 10 guests) me barabar baanta hai.
- **Itemized Split**: Har guest ko uske ordered specific dishes assign karke alag-alag bill banata hai.
- Har guest ka alag payable amount calculation aur mini-receipt print option.

---

## 12. Shift Register Summary, Till Reconciliation Aur Cash Denomination Counter (`BillingShiftSummaryBar.tsx`, `BillingShiftReconciliationModal.tsx`, `BillingCashDenominationModal.tsx`)

### 12.1 Cashier Shift Summary Bar (`BillingShiftSummaryBar.tsx`)
- Top bar jo live Opening Float, Cash Collected, UPI Collected, Card Collected, Discounts, aur Total Net Sales batata hai.

### 12.2 Physical Cash Denomination Counter (`BillingCashDenominationModal.tsx`)
- Cash drawer me gine gaye physical notes ka counter:
  - ₹2000, ₹500, ₹200, ₹100, ₹50, ₹20, ₹10, ₹5 notes aur Coins count inputs.
- Total cash calculated karke system expected cash se compare karta hai.

### 12.3 Day-End Till Reconciliation Z-Report (`BillingShiftReconciliationModal.tsx`)
- Shift end par Cashier physical cash enter karta hai.
- System Cash Variance calculate karta hai ($\text{Physical Cash} - \text{Expected Cash}$).
- Batata hai cash **Excess (+)** hai ya **Shortage (-)**.
- Z-Report summary generate karke shift register lock karta hai.

---

## 13. Void Item Requests Aur High-Discount Approval Center (`BillingApprovalCenterModal.tsx`)

Cashier aur Admin ke liye pending void item requests aur high-discount authorizations ka approval center:
- Kitchen void requests (Reason: Burnt, Wrong Order, Spoiled) list hoti hain.
- `Approve` ya `Reject` button (Manager PIN verification required).

---

## 14. Quick Cash Change Calculator Aur POS Keyboard Hotkeys (`BillingCashCalculatorModal.tsx`, `BillingKeyboardShortcutsModal.tsx`)

### 14.1 Quick Cash Change Calculator (`BillingCashCalculatorModal.tsx`)
- Customer se mila cash enter karne par change return calculate karta hai (Jaise ₹1,340 ke bill par ₹2,000 ka note mila $\rightarrow$ **Return Change: ₹660**).
- Quick cash preset buttons (+₹100, +₹500, +₹2000).

### 14.2 POS Ergonomic Keyboard Hotkeys Guide (`BillingKeyboardShortcutsModal.tsx`)
- `F1`: Open POS Keyboard Hotkeys Guide.
- `F2`: Table Search Input box focus karna.
- `F4`: Open Manager PIN Authorization Modal.
- `F8`: Trigger Proceed to Payment / Settlement.
- `F9`: Quick Cash Change Calculator open karna.

---

## 15. Cashier Stock Recovery Hub (`BillingStockRecoveryModal.tsx`)

Dedicated low stock procurement management modal for cashiers:
- **Real-Time Active Alert Queue**: Kitchen se aaye sabhi active low stock alerts yahan list hote hain (`app_stock_alerts`).
- **Interactive Cashier Actions**:
  - 🚚 **`Mark Restock In Progress`**: Alert status `IN_PROGRESS` me change hota hai $\rightarrow$ Admin SLA Monitor & Kitchen Terminal par live Blue Badge dikhta hai.
  - 📦 **`Mark Stock Supplied`**: Alert status `DISPATCHED` me change hota hai $\rightarrow$ Kitchen ko stock confirm karne ke liye notify karta hai (Purple Badge).
- **Auto-Removal on Restock**: Jab Kitchen staff *Full Stock Received* dabate hain, item automatically `IN_STOCK` ho jata hai aur **yeh alert Cashier Stock Recovery Hub & Admin Monitor dono me se AUTOMATICALLY REMOVE ho jata hai!**

---

## 16. Technical Directory Architecture Aur Function Index

### 📁 `src/app/billing/`
- **`page.tsx`**: Main Cashier POS page shell, layout rendering, hook integration, keyboard shortcuts listener, modal triggers.
- **`BillingErrorBoundary.tsx`**: Billing page React error boundary catch.
- **`billing_url_config.ts`**: Billing route config.

### 📁 `src/app/billing/billing_hooks/`
- **`useBillingOrder.ts`**: Tables, orders, menu read karna, KOTs aggregate karna, taxes calculate karna.
- **`useBillingCheckout.ts`**: 7-step checkout sequence, recipe inventory stock deduction, sales save, CRM update, WhatsApp receipt link.
- **`useBillingCrm.ts`**: CRM customer lookup, 5% cashback calculation, points redeem control.

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
- **`BillingTypes.ts`**: `BillingCartItem`, `BillingTaxBreakdown`, `BillingDiscount`, `BillingCheckoutPayload`, `BillingShiftMetrics`, `BillingPaymentMode` interfaces.

---

*Document generated for Smart Restaurant Management System (`my-app`). Location: `my-app/document/billinghinglish.md`.*

---

## 🚀 Version 2.0 & Multi-Tenant Updates
- **Multi-Tenant Integration**: Ab har hotel ka data aur billing completely separate hai (	enantId ke madhyam se), jisse security aur reports 100% accurate rehte hain.
- **Inventory SLA Alerts**: Agar kitchen staff ko raw material chahiye aur 24 hours cross ho jaye, toh cashier/billing module pe high priority alerts show honge.

# Smart Restaurant Management System (`my-app`) — Customer QR Self-Ordering Module Documentation

Welcome to the **Customer QR Self-Ordering Module Documentation** for the **Smart Restaurant Management System (`my-app`)**. This document provides an exhaustive technical breakdown of every page, component, hook, modal, calculation, business logic rule, and data flow in the Customer module.

---

## 📖 Table of Contents

1. [Customer Role Overview & Access Rights](#1-customer-role-overview--access-rights)
2. [Standalone Mobile Layout Architecture (`/customer?table=T-01`)](#2-standalone-mobile-layout-architecture-customertablet-01)
3. [URL Parameter Parsing & Table Session Hydration (`useCustomerOrder.ts`)](#3-url-parameter-parsing--table-session-hydration-usecustomerordertsx)
4. [Digital QR Menu Browser & Category Filters (`CustomerMenuBrowser.tsx`)](#4-digital-qr-menu-browser--category-filters-customermenubrowsertsx)
5. [Cart Management & Self-Order Submission (`CustomerCartDrawer.tsx`)](#5-cart-management--self-order-submission-customercartdrawertsx)
6. [Live Order Progress Tracker & Prep Timer (`CustomerOrderStatus.tsx`)](#6-live-order-progress-tracker--prep-timer-customerorderstatustsx)
7. [Floating Call Bell & Service Requests (`CustomerFloatingServiceButton.tsx`)](#7-floating-call-bell--service-requests-customerfloatingservicebuttontsx)
8. [WhatsApp Bill Request & Cashier Auto-Sync (`CustomerBillRequestModal.tsx`)](#8-whatsapp-bill-request--cashier-auto-sync-customerbillrequestmodaltsx)
9. [Customer Experience & Star Rating Feedback (`CustomerFeedbackForm.tsx`)](#9-customer-experience--star-rating-feedback-customerfeedbackformtsx)
10. [Advance Table Reservation Engine (`CustomerAdvanceBookingModal.tsx`)](#10-advance-table-reservation-engine-customeradvancebookingmodaltsx)
11. [QR Image Uploader & Desktop Fallback (`CustomerQrUploadModal.tsx`)](#11-qr-image-uploader--desktop-fallback-customerqruploadmodaltsx)
12. [Technical Directory Architecture & Function Index](#12-technical-directory-architecture--function-index)

---

## 1. Customer Role Overview & Access Rights

The **Customer QR Self-Ordering** module (`/customer`) provides a contactless, app-less mobile web interface for restaurant guests to scan table QR codes, browse digital menus, place orders, request waiter service, track live cooking progress, request bills via WhatsApp, and submit dining feedback.

- **Route**: `/customer?table=T-01`
- **RBAC Security Guard**: Enforced by `AuthGuard allowedRoles={["CUSTOMER", "ADMIN"]}` (Publicly accessible via table QR links).
- **Key Responsibilities**:
  - Scanning physical table QR code and auto-attaching to table session.
  - Browsing visual digital menu with dietary badges (`VEG`, `NON_VEG`, `SPICY`) and Chef Recommendations.
  - Selecting portion variants (Half/Full/Large) and adding special cooking instructions.
  - Placing self-service KOT orders directly to KDS kitchen display and Waiter terminals.
  - Appending additional KOT items to active dining order.
  - Tracking real-time dish cooking statuses (`Placed` $\rightarrow$ `Preparing` $\rightarrow$ `Ready` $\rightarrow$ `Served`).
  - Summoning waiter via Floating Call Bell button (`WATER`, `BILL`, `NAPKINS`, `CALL WAITER`).
  - Requesting final bill with optional WhatsApp phone number input (auto-populates Cashier CRM!).
  - Submitting 5-star rating reviews and dining feedback.
  - Booking advance table reservations.

---

## 2. Standalone Mobile Layout Architecture (`/customer?table=T-01`)

The Customer module is designed as a **standalone mobile PWA view**:
- **No Sidebar / No Admin Header**: Eliminates standard app navigation shell to provide a clean, distraction-free mobile web experience.
- **Multi-Stage Page State Pipeline**:
  1. **`MENU`**: Digital menu browser & shopping cart.
  2. **`ORDER_STATUS`**: Live KOT cooking progress tracker.
  3. **`FEEDBACK`**: Star rating & review form.
  4. **`THANK_YOU`**: Final thank-you confirmation screen.

---

## 3. URL Parameter Parsing & Table Session Hydration (`useCustomerOrder.ts`)

- **Table Parameter Detection**: Extracts `?table=T-01` from `window.location.search`.
- **Automatic Table Occupancy**: Automatically marks table status as `OCCUPIED` in `app_tables` when customer scans QR code and enters table session.
- **Active Order QR Re-Scan Persistence**:
  - Searches `app_orders` for any existing active order (`status === "ACTIVE"`) matching the table number.
  - If customer accidentally closes browser or re-scans table QR code, the system **automatically re-hydrates their ongoing active order** and opens the `ORDER_STATUS` page with all their ordered dishes and cooking progress!
  - When Cashier completes bill checkout, order status becomes `COMPLETED` and table becomes `AVAILABLE`, which clears the active session for the next customer.
- **Fallback Handling (`NoTableScreen`)**: If no `table` parameter is found in URL, displays `NoTableScreen` with `CustomerQrUploadModal` allowing users to upload a downloaded QR code image or select a test table.

---

## 4. Digital QR Menu Browser & Category Filters (`CustomerMenuBrowser.tsx`)

- **Restaurant Branding Header**: Displays Restaurant Name, Address, Logo, and active Table Number badge.
- **Active Running Order Banner**: Displays a prominent warning banner when an active order is in progress on the table: *"Running Order Active — New items will be added to your table bill"* with a quick 1-tap *"View Order 🧾"* button.
- **Category Filter Pills**: Starters, Main Course, Beverages, Desserts.
- **Dietary Filter Switches**:
  - 🟢 **`VEG`**: Vegetarian dishes only.
  - 🔴 **`NON_VEG`**: Non-vegetarian items.
  - 🌶️ **`SPICY`**: Spicy chef specials.
- **Chef Special Banner**: Highlights daily recommendations and promotional combo deals.
- **Item Card**: Dish image, description, portion price (₹), variant selector (Half/Full), and `Add to Order` button.
- **Floating Cart Bar**: Displays total cart items count and running total amount with a 1-tap `View Order` button.
- **Header Actions**: `Request Bill` button and `Book Table` button.

---

## 5. Cart Management & Self-Order Submission (`CustomerCartDrawer.tsx`)

- Slide-up bottom drawer displaying itemized cart contents.
- **Quantity Stepper**: (+ / -) buttons to update item quantities.
- **Special Cooking Instructions**: Text input for custom chef notes (e.g. *"Extra spicy"*, *"No coriander"*).
- **Bill Estimate**: Subtotal, CGST (2.5%), SGST (2.5%), and Total Estimated Amount.
- **KOT Appending Engine (`submitOrder`)**:
  - If active order already exists for the table, newly ordered items are **appended as a new KOT (`kot-2`, `kot-3`) to the SAME active order**!
  - If no active order exists, creates a brand new `AppOrder` entry.
  - Updates table status to `OCCUPIED`.
  - Dispatches KOT payload to Kitchen KDS and Waiter terminals.
  - Transitions page view state to `ORDER_STATUS`.

---

## 6. Live Order Progress Tracker & Prep Timer (`CustomerOrderStatus.tsx`)

- Real-time order progress dashboard rendered after order submission or QR re-scan:
- **Visual Step Pipeline**:
  - 🟢 **Step 1: Order Placed** (KOT sent to kitchen).
  - 🔵 **Step 2: Preparing in Kitchen** (Chefs cooking on KDS).
  - 🔔 **Step 3: Ready for Serving** (Food ready for pickup).
  - ✅ **Step 4: Served at Table** (Delivered to customer).
- **Itemized KOT Breakdown**: Lists all dishes across all KOTs for the table with unit prices, total item prices, notes, and live status badges (`PENDING` ⏳, `COOKING` 🔵, `READY` 🔔, `SERVED` ✅).
- **Running Bill Summary**: Item Subtotal, CGST 2.5%, SGST 2.5%, and Total Estimated Bill Amount (₹).
- **Action Buttons**: `+ Add More Items to Table Bill` (reopens menu browser) and `I've Finished Eating` (launches feedback form).

---

## 7. Floating Call Bell & Service Requests (`CustomerFloatingServiceButton.tsx`)

- Floating call bell icon positioned at bottom-right of customer screen.
- Tapping expands 4 quick service action buttons:
  - 💧 **Water**: Sends request for drinking water.
  - 🧾 **Bill**: Opens `CustomerBillRequestModal`.
  - 🧻 **Napkins**: Sends request for extra napkins/cutlery.
  - 🛎️ **Call Waiter**: Calls floor captain to table.
- Instantly dispatches service request notification to Waiter POS and Cashier POS!

---

## 8. WhatsApp Bill Request & Cashier POS Auto-Sync (`CustomerBillRequestModal.tsx`)

- Tapping "Request Bill" opens the Bill Request popup.
- Allows customer to optionally enter their **10-Digit Mobile Number**.
- **Cross-Tab & LocalStorage Sync (`table_phone_XX`)**:
  - Saves number under dedicated `table_phone_XX` key.
  - Instantly syncs across tabs to Cashier POS screen (`billing/page.tsx`) via cross-tab `storage` event listener and 1ms fallback lookup during checkout.
  - Auto-prefills CRM customer panel and prints customer phone number on 80mm thermal receipts (`BillingReceiptModal.tsx` & `BillingThermalReceiptPreviewModal.tsx`)!
- If customer skips entering a number, input remains blank so Cashier can enter manually if desired.

---

## 9. Customer Experience & Star Rating Feedback (`CustomerFeedbackForm.tsx`)

- 5-Star Rating Selector (⭐ ⭐ ⭐ ⭐ ⭐).
- Multi-dimensional rating criteria: Food Quality, Service Speed, Ambiance & Cleanliness.
- Text Review Comments input for detailed customer feedback.
- Saves feedback record to `app_feedbacks` for Admin analytics and transitions view to `ThankYouScreen`.

---

## 10. Advance Table Reservation Engine (`CustomerAdvanceBookingModal.tsx`)

- Customer table pre-booking modal:
  - Select Guest Count (1 to 20 guests).
  - Select Reservation Date & Time Slot.
  - Select Seating Section Preference (Indoor Dining, AC Room, Outdoor Garden).
  - Customer Full Name & Phone Number input.
- Submits reservation payload to `app_reservations` for Admin approval.

---

## 11. QR Image Uploader & Desktop Fallback (`CustomerQrUploadModal.tsx`)

- Fallback modal for desktop testing or manual QR code scanning:
- Allows users to upload a downloaded table QR image file (`.png`, `.jpg`).
- Decodes QR code URL or allows direct selection from available restaurant tables.

---

## 12. Technical Directory Architecture & Function Index

### 📁 `src/app/customer/`
- **`page.tsx`**: Main Customer QR shell, handles URL table parsing, view state pipeline (`MENU` $\rightarrow$ `ORDER_STATUS` $\rightarrow$ `FEEDBACK` $\rightarrow$ `THANK_YOU`), and fallback screens.
- **`CustomerErrorBoundary.tsx`**: React Error Boundary catch for customer screen crashes.
- **`customer_url_config.ts`**: Customer route config constants.

### 📁 `src/app/customer/customer_hooks/`
- **`useCustomerOrder.ts`**: URL table parameter detection, menu reading, cart state, order placement, KOT dispatch, feedback submission.

### 📁 `src/app/customer/customer_components/`
- `CustomerMenuBrowser.tsx` — Digital menu browser with category & dietary filters.
- `CustomerCartDrawer.tsx` — Slide-up cart drawer & order placement.
- `CustomerOrderStatus.tsx` — Live KOT cooking progress step tracker.
- `CustomerFloatingServiceButton.tsx` — Floating call bell service request button.
- `CustomerBillRequestModal.tsx` — Bill request dialog with WhatsApp phone input.
- `CustomerFeedbackForm.tsx` — 5-Star rating review form.
- `CustomerAdvanceBookingModal.tsx` — Table reservation dialog.
- `CustomerQrUploadModal.tsx` — QR code image uploader & fallback table picker.

### 📁 `src/app/customer/customer_types/`
- **`CustomerTypes.ts`**: Interfaces for `CustomerPageView`, `CustomerCartItem`, `CustomerOrderModalProps`, `CustomerFeedbackPayload`.

---

*Document generated for Smart Restaurant Management System (`my-app`). Location: `my-app/document/customer document.md`.*

---

## 🚀 Version 2.0 & Multi-Tenant Updates
- **Public Hotel Details Page**: New dynamic landing pages (/hotel/[tenantId]) showing beautiful hero sections, gallery, and special offers.
- **Advance Reservation & Pre-Ordering**: Customers can now pre-book tables and pre-order food items directly from the unified booking portal (/reservations/book).
- **Unified Registration**: Enhanced /auth/register portal for customers to easily create accounts and save their booking history.

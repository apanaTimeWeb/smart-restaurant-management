# Smart Restaurant Management System (`my-app`) — Waiter & Floor Captain POS Module Documentation

Welcome to the **Waiter & Floor Captain POS Module Documentation** for the **Smart Restaurant Management System (`my-app`)**. This document provides an exhaustive technical breakdown of every page, component, hook, modal, calculation, business logic rule, and data flow in the Waiter module.

---

## 📖 Table of Contents

1. [Waiter Role Overview & RBAC Permissions](#1-waiter-role-overview--rbac-permissions)
2. [Main Floor Captain Interface Layout (`/waiter`)](#2-main-floor-captain-interface-layout-waiter)
3. [Dining Section Filters & Table Grid Layout (`WaiterTableGrid.tsx`, `WaiterTableCard.tsx`)](#3-dining-section-filters--table-grid-layout-waitertablegridtsx-waitertablecardtsx)
4. [Order Taking & KOT Dispatch Modal (`WaiterOrderModal.tsx`, `WaiterCartSummary.tsx`, `useWaiterOrder.ts`)](#4-order-taking--kot-dispatch-modal-waiterordermodaltsx-waitercartsummarytsx-usewaiterordertsx)
5. [Table Action Controls & Active KOT Inspector (`WaiterTableActionsDrawer.tsx`)](#5-table-action-controls--active-kot-inspector-waitertableactionsdrawertsx)
6. [Table Transfer & Order Merging Engine (`WaiterTableTransferModal.tsx`, `useWaiterTableActions.ts`)](#6-table-transfer--order-merging-engine-waitertabletransfermodaltsx-usewaitertableactionsts)
7. [Item Void & Cancellation Request Engine (`WaiterVoidRequestModal.tsx`)](#7-item-void--cancellation-request-engine-waitervoidrequestmodaltsx)
8. [Live Customer Service Call Bell System (`WaiterServiceRequestsDrawer.tsx`)](#8-live-customer-service-call-bell-system-waiterservicerequestsdrawertsx)
9. [Live Ready-to-Serve Order Pickups (`WaiterReadyQueue.tsx`)](#9-live-ready-to-serve-order-pickups-waiterreadyqueuetsx)
10. [Table QR Code Generator & Stand Cards (`WaiterTableQrModal.tsx`)](#10-table-qr-code-generator--stand-cards-waitertableqrmodaltsx)
11. [Multilingual Support & Language Toggle System (`useLanguage.ts`)](#11-multilingual-support--language-toggle-system-uselanguagets)
12. [Technical Directory Architecture & Function Index](#12-technical-directory-architecture--function-index)

---

## 1. Waiter Role Overview & RBAC Permissions

The **Waiter / Floor Captain** module (`/waiter`) handles dining floor management, order taking, KOT creation, table movements, customer call bell acknowledgments, and food serving notifications.

- **Route**: `/waiter`
- **RBAC Security Guard**: Enforced by `AuthGuard allowedRoles={["WAITER", "ADMIN"]}`.
- **Key Responsibilities**:
  - Viewing live table statuses across dining floor sections (Dining, AC, Outdoor).
  - Creating new orders and dispatching Kitchen Order Tickets (KOTs) to KDS.
  - Adding extra dishes to existing active orders (KOT appending).
  - Monitoring real-time KOT preparation statuses (`PENDING`, `PREPARING`, `READY`, `SERVED`, `VOIDED`).
  - Receiving audio-visual alerts when food is marked **READY** by Kitchen staff.
  - Responding to live Customer Service Call Bells (`WATER`, `BILL`, `NAPKINS`, `WAITER`).
  - Requesting table bill generation for Cashier settlement (`BILLING_PENDING`).
  - Transferring orders between tables or merging two occupied tables into one.
  - Requesting item voids with mandatory audit logging and reason classification.
  - Multi-language UI toggle (English ↔ Hindi).

---

## 2. Main Floor Captain Interface Layout (`/waiter`)

The main page (`waiter/page.tsx`) provides a real-time dining floor dashboard:

- **Top Action Bar**: Title, live Customer Service Call Bell button with badge counter, Table Transfer/Merge button, and Language Toggle button (English ↔ Hindi).
- **Live Ready-to-Serve Broadcast Bar (`WaiterReadyQueue.tsx`)**: Displays orders marked ready by Kitchen staff with instant 1-click **"Serve Order"** confirmation.
- **Kitchen Pickup Alerts & Call Bell Banners**: Real-time pulsating alerts for dish pickup and pending customer calls.
- **Floor Overview Banner**: Occupied table counts, Billing Pending counts, and daily Chef Recommendation upsell tips.
- **Search & Filter Controls**: Section tabs (`All`, `Dining`, `AC`, `Outdoor`), table search input box, status filter dropdown (`Available`, `Occupied`, `Billing Pending`, `Reserved`), and view mode toggle (`Grid` vs `Floor Map`).
- **Main Interactive Table Grid**: Card view rendering physical tables and real-time status indicators.

---

## 3. Dining Section Filters & Table Grid Layout (`WaiterTableGrid.tsx`, `WaiterTableCard.tsx`)

### 3.1 Dining Floor Sections
Organizes tables into physical seating areas:
- **`All`**: Complete view of all restaurant tables.
- **`Dining`**: Main indoor dining hall.
- **`AC`**: Air-conditioned premium section.
- **`Outdoor`**: Garden / Balcony outdoor seating.

### 3.2 Interactive Table Card (`WaiterTableCard.tsx`)
Visual indicator displaying:
- Table Number and Section badge.
- Seating Capacity (e.g. 4 Seats).
- **Table Status**:
  - 🟢 **`AVAILABLE`**: Clean, empty table ready for seating guests.
  - 🔴 **`OCCUPIED`**: Active dining order in progress.
  - 🟡 **`BILLING_PENDING`**: Bill requested; waiting for Cashier checkout.
  - 🧹 **`CLEANING`**: Bill paid by Cashier; needs cleaning. Features 1-click **"Mark Cleaned 🟢"** button right on table card to reset status back to **`AVAILABLE`**!
  - 🔵 **`RESERVED`**: Table pre-booked for guests.
- **Active KOT Badges**: Counts items in `PREPARING` ⏳, `READY` 🔔, and `SERVED` ✅ states.
- Current Order Subtotal (₹) and elapsed dining time timer.
- Quick action buttons: Tapping card opens Order Modal or Actions Drawer; QR icon opens Table QR Modal.

---

## 4. Order Taking & KOT Dispatch Modal (`WaiterOrderModal.tsx`, `WaiterCartSummary.tsx`, `useWaiterOrder.ts`)

### 4.1 Menu Browser & Item Selection (`WaiterMenuItemCard.tsx`)
- Filter menu dishes by Category (Starters, Main Course, Beverages, Desserts) or Search input.
- Displays Dish Name, Category, Price (₹), Dietary badges (`VEG` 🟢, `NON_VEG` 🔴, `SPICY` 🌶️), Chef Special tag, and Out of Stock availability switch.
- **Variant Selector**: Half / Full / Large portion selection.
- **Quantity Stepper**: Increments/decrements dish quantities.
- **Special Preparation Notes Input**: Add custom instructions (e.g., *"Less spicy"*, *"No onion"*, *"Extra sauce"*).

### 4.2 Cart Summary & KOT Creation (`WaiterCartSummary.tsx`)
- Displays aggregated cart items, individual pricing, and estimated prep time.
- **Chef Recommendation Upsell Box**: Suggests popular pairing items (e.g. *Paneer Tikka + Mango Lassi*).
- **"Send KOT to Kitchen" Button**: Dispatches KOT payload to `app_orders` and updates table status to `OCCUPIED`.

### 4.3 KOT Logic Hook (`useWaiterOrder.ts`)
- **`createOrder(tableId, items)`**: Generates new `AppOrder` object, creates `kot-1`, sets order status = `ACTIVE`, updates table status = `OCCUPIED`.
- **`addKotItems(orderId, items)`**: Appends new KOT (`kot-2`, `kot-3`, etc.) to existing active order without resetting previously served items!

---

## 5. Table Action Controls & Active KOT Inspector (`WaiterTableActionsDrawer.tsx`)

Tapping an **OCCUPIED** or **BILLING_PENDING** table opens the Table Actions Drawer:

- **Active Order Header**: Table number, Guest Count, Order ID, Dining Time, Total Amount (₹).
- **Itemized KOT Status Inspector**: Lists all dishes across all KOTs with real-time status badges:
  - 🟡 **`PENDING`**: Sent to kitchen, waiting for chef acknowledgment.
  - 🔵 **`PREPARING`**: Currently cooking on KDS terminal.
  - 🟢 **`READY`**: Cooking completed, waiting for waiter pickup.
  - ✅ **`SERVED`**: Delivered to customer table.
  - 🔴 **`VOIDED`**: Cancelled / voided item.
- **Action Buttons**:
  - `+ Add More Items`: Opens `WaiterOrderModal` to append new KOT.
  - `🧾 Request Bill`: Updates table status to `BILLING_PENDING` and triggers cashier alert.
  - `❌ Void Item`: Opens `WaiterVoidRequestModal` for item cancellation.
  - `🔀 Transfer / Merge Table`: Opens `WaiterTableTransferModal`.
  - `📱 View Table QR`: Opens `WaiterTableQrModal`.

---

## 6. Table Transfer & Order Merging Engine (`WaiterTableTransferModal.tsx`, `useWaiterTableActions.ts`)

### 6.1 Move Order (Transfer Table)
- Transferred active order from an occupied table to an empty `AVAILABLE` table.
- Re-binds `currentOrderId` to target table and resets source table to `AVAILABLE`.

### 6.2 Merge Tables
- Combines active orders from two separate occupied tables into a single master order (e.g. Table T-01 + Table T-02).
- Merges all KOTs into target table's order, calculates combined total, updates target table guest count, and sets source table status to `AVAILABLE`.

---

## 7. Item Void & Cancellation Request Engine (`WaiterVoidRequestModal.tsx`)

Handles item cancellation from active orders:
- **Dish Selection**: Select specific dish and quantity to void.
- **Reason Classification**:
  - Customer Changed Mind
  - Ordered by Mistake
  - Kitchen Delay (>30 mins)
  - Food Quality / Burnt / Spoiled
- **Security Submission**: Sends void request to `BillingApprovalCenterModal` for Manager PIN / Admin approval and records audit log.

---

## 8. Live Customer Service Call Bell System (`WaiterServiceRequestsDrawer.tsx`)

Tracks customer requests submitted via physical tables or QR self-ordering:
- **Request Types**:
  - 💧 **`WATER`**: Customer requested drinking water.
  - 🧾 **`BILL`**: Customer requested final bill.
  - 🧻 **`NAPKINS`**: Customer requested extra napkins/cutlery.
  - 🛎️ **`WAITER`**: Customer called floor captain to table.
- **Real-Time Notification Banner**: Displays pulsating amber alert bar on main waiter screen.
- **"Acknowledge" Button**: Marks request as `ACKNOWLEDGED` when waiter attends to the customer.

---

## 9. Live Ready-to-Serve Order Pickups (`WaiterReadyQueue.tsx`)

Broadcast banner alerting floor staff when KDS chefs mark KOTs as **`READY`**:
- Displays Table Number, Dish Name, Quantity, Kitchen Station (`Kitchen`, `Bar`, `Bakery`), and Elapsed Ready Time.
- **"Serve Order" Button**: Tapping button updates item status to `SERVED` and notifies kitchen staff.

---

## 10. Table QR Code Generator & Stand Cards (`WaiterTableQrModal.tsx`)

- Displays unique QR code graphic for selected table.
- QR Target URL: `/customer?table=T-01`.
- **Printable Table Stand Card Launcher**: Formatted stand card view with table number and QR graphic for placing on physical dining tables.

---

## 11. Multilingual Support & Language Toggle System (`useLanguage.ts`)

- 1-Click language switcher button in header bar (English ↔ Hindi).
- Dynamically translates UI labels, status messages, section tabs, and order action buttons across the Waiter Terminal.

---

## 12. Technical Directory Architecture & Function Index

### 📁 `src/app/waiter/`
- **`page.tsx`**: Main Waiter Terminal shell, floor section tabs, search, call bell banners, table grid layout, and modal controllers.
- **`WaiterErrorBoundary.tsx`**: React Error Boundary wrapper for waiter app crashes.
- **`waiter_url_config.ts`**: Waiter route config constants.

### 📁 `src/app/waiter/waiter_hooks/`
- **`useWaiterOrder.ts`**: Creates orders, appends KOT items, updates KOT item statuses, saves to `app_orders` and `app_tables`.
- **`useWaiterTableActions.ts`**: Handles `moveTable`, `mergeTable`, `requestBill`, and `clearTable` operations.

### 📁 `src/app/waiter/waiter_components/`
- `WaiterTableGrid.tsx` — Grid / Floor map layout container.
- `WaiterTableCard.tsx` — Individual interactive table card with status & KOT badges.
- `WaiterOrderModal.tsx` — Order taking dialog with category filters & dish search.
- `WaiterCartSummary.tsx` — Cart drawer with quantity stepper & KOT send action.
- `WaiterMenuItemCard.tsx` — Dish card with variants, dietary tags, notes input.
- `WaiterTableActionsDrawer.tsx` — Active order inspector & quick table actions drawer.
- `WaiterTableTransferModal.tsx` — Move / Merge table dialog.
- `WaiterVoidRequestModal.tsx` — Item void request dialog with reason selection.
- `WaiterServiceRequestsDrawer.tsx` — Customer call bell requests drawer.
- `WaiterReadyQueue.tsx` — Live ready-to-serve food pickup broadcast queue.
- `WaiterTableQrModal.tsx` — Table QR code & stand card modal.

### 📁 `src/app/waiter/waiter_types/`
- **`WaiterTypes.ts`**: Interfaces for `WaiterViewMode`, `WaiterTableSection`, `WaiterCartItem`, `WaiterOrderModalProps`, `WaiterTableActionsDrawerProps`.

---

*Document generated for Smart Restaurant Management System (`my-app`). Location: `my-app/document/waiter document.md`.*

---

## 🚀 Version 2.0 & Multi-Tenant Updates
- **Multi-Tenant Architecture**: Waiter module now seamlessly connects with specific hotel tenants, fetching the exact menu and table layout for the assigned restaurant.
- **Enhanced Bill Requests**: Faster real-time syncing for customer bill requests initiated from dynamic table QR codes.

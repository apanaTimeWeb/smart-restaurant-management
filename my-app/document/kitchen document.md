# Smart Restaurant Management System (`my-app`) — Kitchen KDS & KOT Module Documentation

Welcome to the **Kitchen KDS & KOT Module Documentation** for the **Smart Restaurant Management System (`my-app`)**. This document provides an exhaustive technical breakdown of every page, component, hook, modal, calculation, business logic rule, and data flow in the Kitchen Display System (KDS).

---

## 📖 Table of Contents

1. [Kitchen Role Overview & RBAC Permissions](#1-kitchen-role-overview--rbac-permissions)
2. [Main KDS Interface Layout (`/kitchen`)](#2-main-kds-interface-layout-kitchen)
3. [KDS Station Routing & Tab Filter System (`page.tsx`)](#3-kds-station-routing--tab-filter-system-pagetsx)
4. [Kitchen KPI Overview & SLA Performance Bar (`KitchenKpiSummaryBar.tsx`)](#4-kitchen-kpi-overview--sla-performance-bar-kitchenkpisummarybartsx)
5. [Real-Time KOT Order Card & Ticket Workflow (`KitchenKotCard.tsx`, `useKitchenKds.ts`)](#5-real-time-kot-order-card--ticket-workflow-kitchenkotcardtsx-usekitchenkdstsx)
6. [Consolidated Dish Prep Aggregator (`KitchenConsolidatedItemsModal.tsx`)](#6-consolidated-dish-prep-aggregator-kitchenconsolidateditemsmodaltsx)
7. [Kitchen SLA Timers & Overdue Alert Escalation](#7-kitchen-sla-timers--overdue-alert-escalation)
8. [Stock Availability Control & Low Stock SLA Alerts (`KitchenStockToggle.tsx`, `useKitchenStock.ts`)](#8-stock-availability-control--low-stock-sla-alerts-kitchenstocktoggletsx-usekitchenstockts)
9. [Kitchen Food Wastage Logging Engine (`KitchenWasteLogModal.tsx`)](#9-kitchen-food-wastage-logging-engine-kitchenwastelogmodaltsx)
10. [Chef Recipe Specification Sheet Modal (`KitchenRecipeModal.tsx`)](#10-chef-recipe-specification-sheet-modal-kitchenrecipemodaltsx)
11. [80mm Thermal KOT Ticket Printing (`KitchenTicketModal.tsx`)](#11-80mm-thermal-kot-ticket-printing-kitchenticketmodaltsx)
12. [Completed KOT History & Order Recall Engine (`KitchenCompletedOrdersView.tsx`)](#12-completed-kot-history--order-recall-engine-kitchencompletedordersviewtsx)
13. [Kitchen Performance Analytics Engine (`KitchenAnalyticsModal.tsx`)](#13-kitchen-performance-analytics-engine-kitchenanalyticsmodaltsx)
14. [Audio Bell Alerts & Audio Engine (`playKitchenBell`)](#14-audio-bell-alerts--audio-engine-playkitchenbell)
15. [Technical Directory Architecture & Function Index](#15-technical-directory-architecture--function-index)

---

## 1. Kitchen Role Overview & RBAC Permissions

The **Kitchen KDS & KOT** module (`/kitchen`) is the operational kitchen display terminal for chefs, cooks, baristas, and kitchen supervisors.

- **Route**: `/kitchen`
- **RBAC Security Guard**: Enforced by `AuthGuard allowedRoles={["KITCHEN", "ADMIN"]}`.
- **Key Responsibilities**:
  - Receiving real-time Kitchen Order Tickets (KOTs) dispatched by Waiters or Customer QR Self-Orders.
  - Station routing across Main Kitchen, Bar/Drinks, and Bakery/Desserts.
  - Tracking live cooking SLA timers with visual color coding (Green $\rightarrow$ Yellow $\rightarrow$ Red).
  - Updating item cooking progress (`PENDING` $\rightarrow$ `COOKING` $\rightarrow$ `READY` $\rightarrow$ `SERVED`).
  - Broadcasting instant pickup notifications to Waiter POS terminals when dishes are marked **`READY`**.
  - Aggregating identical active dishes across all table tickets into a single consolidated prep view.
  - Toggling dish availability (**Available** ↔ **Out of Stock**) with instant POS sync.
  - Triggering 24-Hour Procurement SLA alerts for low stock ingredients.
  - Logging kitchen wastage (spoiled, burnt, expired food) with financial loss auditing.
  - Viewing chef recipe specifications, ingredient portion ratios, and plating specs.
  - Printing 80mm thermal KOT tickets for physical kitchen pass hooks.
  - Recalling accidentally completed KOT orders back to active feed.

---

## 2. Main KDS Interface Layout (`/kitchen`)

The main page (`kitchen/page.tsx`) features an ergonomic dark-mode touch terminal layout optimized for kitchen environments:

- **Header Controls**: Page title, "Consolidated Items View" button launcher.
- **Live KPI & SLA Summary Bar (`KitchenKpiSummaryBar.tsx`)**: Real-time counter of Total Active KOTs, Cooking Items, Pending Items, Overdue SLA Breaches, Out of Stock Count, Sound Mute/Test toggle, and Analytics trigger.
- **Navigation Tab Bar**: Station filters (`All Stations`, `Main Kitchen`, `Bar / Drinks`, `Bakery / Desserts`), `Stock & Waste` tab, and `Completed Orders` tab.
- **Search & Filter Controls**: Order ID / Table search input box, item status filter dropdown (`All`, `Pending Only`, `Cooking Only`, `Ready Only`).
- **Main KOT Grid Container (`KitchenKotGrid.tsx`)**: Oldest-first (FIFO) sorted ticket feed.

---

## 3. KDS Station Routing & Tab Filter System (`page.tsx`)

Menu items are automatically assigned to specific kitchen preparation stations (`station` field):
- **`Kitchen` (Main Kitchen)**: Curries, biryanis, tandoor items, appetizers, rotis.
- **`Bar` (Bar / Drinks)**: Beverages, cocktails, mocktails, juices, milkshakes.
- **`Bakery` (Bakery / Desserts)**: Cakes, ice creams, puddings, bakery products.

Station tabs filter the active KOT feed so station cooks only see tickets relevant to their station!

---

## 4. Kitchen KPI Overview & SLA Performance Bar (`KitchenKpiSummaryBar.tsx`)

Displays real-time operational metrics calculated from `useKitchenKds`:
- **Active KOTs**: Total open tickets currently on the KDS feed.
- **Items Cooking**: Total individual dishes currently in `PREPARING` state.
- **Pending Orders**: Total tickets waiting for chef acknowledgment.
- **SLA Breaches (Red)**: Tickets exceeding the 15-minute danger threshold.
- **Out of Stock Items**: Badge displaying unavailable menu items; clicking jumps directly to the Stock Toggle tab.
- **Audio Controls**: Mute/Unmute audio bell, and "Test Sound" diagnostic button.
- **Kitchen Analytics**: Opens `KitchenAnalyticsModal`.

---

## 5. Real-Time KOT Order Card & Ticket Workflow (`KitchenKotCard.tsx`, `useKitchenKds.ts`)

### 5.1 KOT Ticket Structure
Each ticket card displays:
- Header: KOT ID, Table Number, Dining Section, Guest Count, Station Badge, Time Elapsed Timer.
- SLA Color Border:
  - 🟢 **Green**: Under 10 minutes (Normal prep).
  - 🟡 **Yellow**: 10 to 15 minutes (SLA Warning threshold).
  - 🔴 **Red (Pulsating)**: Over 15 minutes (SLA Breach / Danger threshold).
- Itemized Dish List: Portion size (Half/Full), Quantity, Dietary icons (`VEG` 🟢, `NON_VEG` 🔴, `SPICY` 🌶️), and Special Cooking Notes (e.g. *"Extra spicy"*, *"No garlic"*).

### 5.2 Item & Ticket Status Progression
1. **`PENDING`** $\rightarrow$ Click **"Start Cooking"**: Changes item status to `PREPARING` / `COOKING`.
2. **`COOKING`** $\rightarrow$ Click **"Mark Ready"**: Changes item status to `READY` and triggers audio chime.
3. Click **"Notify Waiter"**: Dispatches live audio-visual pickup notification to Waiter POS terminal.
4. Click **"Mark Served"**: Changes status to `SERVED`. When all items on a KOT are served, the ticket moves automatically to `Completed Orders` history.

---

## 6. Consolidated Dish Prep Aggregator (`KitchenConsolidatedItemsModal.tsx`)

- Aggregates identical active dishes across all open KOT tickets into a single unified prep list!
- Example: If Table T-01 ordered 3 Naan, Table T-04 ordered 4 Naan, and Table T-09 ordered 5 Naan, the Consolidated View shows **Total 12 Naans Needed**!
- Allows head chefs to batch-cook popular items efficiently without counting cards manually.

---

## 7. Kitchen SLA Timers & Overdue Alert Escalation

- **Default Target Prep Time**: 15 minutes per order (configurable in Admin Settings).
- **Warning Threshold (Yellow)**: Reached at 10 minutes (75% of target time).
- **Danger Threshold (Red)**: Reached at 15 minutes; card turns pulsating red and increments SLA Breach metric.
- **Custom Item Prep Time Override (`setItemPrepTime`)**: Allows chefs to set custom target times for slow-cooked dishes (e.g. 25 mins for Whole Roasted Lamb).

---

## 8. Stock Availability Control & Low Stock SLA Alerts (`KitchenStockToggle.tsx`, `useKitchenStock.ts`)

### 8.1 Instant Stock Toggle
- Chefs can toggle any menu dish **In Stock** ↔ **Out of Stock** with 1 click.
- Instantly syncs across Waiter POS and Customer QR Menu, preventing orders for sold-out dishes.

### 8.2 Two-Way Procurement SLA & Restock Recovery System (`KitchenStockToggle.tsx`)
- When an ingredient is running dangerously low, kitchen staff click **"Send Low Stock Alert"**.
- Dispatches instant warning notification to Cashier and Admin.
- **Dynamic Restock Status Badges**:
  - 🚨 **`Alert Sent 🚨`**: Alert dispatched to Cashier & Admin.
  - 🚚 **`Restock In Progress 🚚`**: Cashier has initiated restock procurement (updates live on Kitchen KDS).
  - 📦 **`Stock Supplied 📦`**: Cashier has delivered stock to kitchen (updates live on Kitchen KDS).
- **"Full Stock Received 🟢" Action**:
  - When Kitchen staff confirm stock delivery, they click **"Full Stock Received 🟢"**.
  - Automatically toggles item back to **`IN_STOCK` (Available)**!
  - Marks alert status as **`RESTOCKED`** and **automatically clears the alert from Cashier Stock Recovery Hub and Admin Monitor!**

---

## 9. Kitchen Food Wastage Logging Engine (`KitchenWasteLogModal.tsx`)

- Allows kitchen staff to log food wastage entries into `app_wastage`.
- **Wastage Reasons**: Spoiled, Burnt in Cooking, Expired Ingredient, Order Cancelled by Customer.
- Captures dish/ingredient name, wasted quantity, unit cost (₹), total loss amount (₹), and chef notes.
- Syncs with Admin Audit & Financial Reports.

---

## 10. Chef Recipe Specification Sheet Modal (`KitchenRecipeModal.tsx`)

- Interactive modal displaying exact preparation formulas for any menu dish.
- **Recipe Data**: Raw ingredient list with exact gram/ml measurements, portion ratios, cooking temperature, preparation steps, allergen warnings, and plating presentation specs.

---

## 11. 80mm Thermal KOT Ticket Printing (`KitchenTicketModal.tsx`)

- Formatted 80mm monospaced thermal paper preview modal for kitchen ticket hardware.
- Displays KOT ID, Table Number, Timestamp, Dish Quantities, and Preparation Notes in bold print format.
- 1-Click `Print Ticket` button triggers hardware printer output.

---

## 12. Completed KOT History & Order Recall Engine (`KitchenCompletedOrdersView.tsx`)

- Stores history of all completed and served KOT tickets.
- **Order Recall Engine (`recallCompletedKot`)**: Allows chefs to click **"Recall Order"** to restore an accidentally completed ticket back to the active KDS feed!

---

## 13. Kitchen Performance Analytics Engine (`KitchenAnalyticsModal.tsx`)

Displays kitchen operational performance charts and analytics:
- Average Preparation Time per Station (Kitchen vs Bar vs Bakery).
- SLA Compliance Rate (%) (Orders completed within 15 mins).
- Peak Hour Bottlenecks & Order Volume Distribution.
- Most Prepared Dishes Ranking.

---

## 14. Audio Bell Alerts & Audio Engine (`playKitchenBell`)

- Synthesizes HTML5 Audio chime (`beep_short.ogg` / Web Audio API synth bell).
- Triggers audio chime when a new KOT arrives or when dishes are marked Ready.
- Includes Mute/Unmute toggle and "Test Sound" diagnostic button.

---

## 15. Technical Directory Architecture & Function Index

### 📁 `src/app/kitchen/`
- **`page.tsx`**: Main KDS shell, manages tabs, search, filters, audio triggers, and modal states.
- **`KitchenErrorBoundary.tsx`**: React Error Boundary catch for KDS crashes.
- **`kitchen_url_config.ts`**: Kitchen route config constants.

### 📁 `src/app/kitchen/kitchen_hooks/`
- **`useKitchenKds.ts`**: Reads orders, menu, flattens KOTs, manages item status transitions, SLA calculations, pickup broadcasts, and order recalls.
- **`useKitchenStock.ts`**: Toggles menu item availability, logs stock changes, triggers 24-hour procurement SLA alerts.

### 📁 `src/app/kitchen/kitchen_components/`
- `KitchenKotGrid.tsx` — FIFO sorted KOT card grid container.
- `KitchenKotCard.tsx` — Interactive KOT card with SLA color border & action buttons.
- `KitchenKpiSummaryBar.tsx` — Live KDS metrics overview bar.
- `KitchenConsolidatedItemsModal.tsx` — Aggregated dish prep list modal.
- `KitchenCompletedOrdersView.tsx` — Completed KOT history & recall view.
- `KitchenStockToggle.tsx` — Menu item availability table & low stock trigger.
- `KitchenWasteLogModal.tsx` — Food wastage logging dialog.
- `KitchenRecipeModal.tsx` — Recipe specification sheet dialog.
- `KitchenTicketModal.tsx` — 80mm thermal KOT ticket preview & print dialog.
- `KitchenAnalyticsModal.tsx` — Kitchen performance analytics dialog.
- `KitchenStatusPipeline.tsx` — Visual step progress bar for dish status.
- `KitchenPrepTimeInput.tsx` — Custom prep time override input.

### 📁 `src/app/kitchen/kitchen_types/`
- **`KitchenTypes.ts`**: Interfaces for `KitchenStationTab`, `KitchenFlatKot`, `KitchenKotItem`, `KitchenKdsMetrics`, `KitchenSlaStatus`.

---

*Document generated for Smart Restaurant Management System (`my-app`). Location: `my-app/document/kitchen document.md`.*

---

## 🚀 Version 2.0 & Multi-Tenant Updates
- **Inventory Access**: Kitchen staff now have access to the /admin/inventory page.
- **Stock Status Tracking**: Ability to track precise item statuses including "Fresh", "Low", and "Expired".
- **Menu Access**: Kitchen staff can now view and edit the Menu to quickly toggle out-of-stock items.

# Smart Restaurant Management System (`my-app`) — Kitchen KDS & KOT Module Full Hinglish Documentation

Is document me **Smart Restaurant Management System (`my-app`)** ke **KITCHEN KDS & KOT** module ka har ek feature, sub-page, button, calculation, business logic, hook, aur component pure **Hinglish** me detailed me samjhaya gaya hai.

---

## 📖 Table of Contents

1. [Kitchen Role Overview Aur Access Rights](#1-kitchen-role-overview-aur-access-rights)
2. [Main KDS Touch Screen Layout (`/kitchen`)](#2-main-kds-touch-screen-layout-kitchen)
3. [KDS Station Routing Aur Tab System (`page.tsx`)](#3-kds-station-routing-aur-tab-system-pagetsx)
4. [Kitchen KPI Overview Aur SLA Performance Bar (`KitchenKpiSummaryBar.tsx`)](#4-kitchen-kpi-overview-aur-sla-performance-bar-kitchenkpisummarybartsx)
5. [Real-Time KOT Card Aur Cooking Workflow (`KitchenKotCard.tsx`, `useKitchenKds.ts`)](#5-real-time-kot-card-aur-cooking-workflow-kitchenkotcardtsx-usekitchenkdstsx)
6. [Consolidated Dish Prep Aggregator (`KitchenConsolidatedItemsModal.tsx`)](#6-consolidated-dish-prep-aggregator-kitchenconsolidateditemsmodaltsx)
7. [Kitchen SLA Timers Aur Overdue Alert Escalation](#7-kitchen-sla-timers-aur-overdue-alert-escalation)
8. [Stock Availability Control Aur Low Stock SLA Alerts (`KitchenStockToggle.tsx`, `useKitchenStock.ts`)](#8-stock-availability-control-aur-low-stock-sla-alerts-kitchenstocktoggletsx-usekitchenstockts)
9. [Kitchen Food Wastage Logging Engine (`KitchenWasteLogModal.tsx`)](#9-kitchen-food-wastage-logging-engine-kitchenwastelogmodaltsx)
10. [Chef Recipe Spec Sheet Modal (`KitchenRecipeModal.tsx`)](#10-chef-recipe-spec-sheet-modal-kitchenrecipemodaltsx)
11. [80mm Thermal KOT Ticket Printing (`KitchenTicketModal.tsx`)](#11-80mm-thermal-kot-ticket-printing-kitchenticketmodaltsx)
12. [Completed KOT History Aur Order Recall Engine (`KitchenCompletedOrdersView.tsx`)](#12-completed-kot-history-aur-order-recall-engine-kitchencompletedordersviewtsx)
13. [Kitchen Performance Analytics Engine (`KitchenAnalyticsModal.tsx`)](#13-kitchen-performance-analytics-engine-kitchenanalyticsmodaltsx)
14. [Audio Bell Alerts Engine (`playKitchenBell`)](#14-audio-bell-alerts-engine-playkitchenbell)
15. [Technical Directory Architecture Aur Function Index](#15-technical-directory-architecture-aur-function-index)

---

## 1. Kitchen Role Overview Aur Access Rights

**Kitchen KDS & KOT** module (`/kitchen`) chefs, cooks, baristas, aur kitchen supervisors ke liye real-time Kitchen Display System terminal hai.

- **Allowed Route**: `/kitchen`
- **RBAC Security Guard**: Is page ko sirf `KITCHEN` aur `ADMIN` login wale users hi open kar sakte hain (`AuthGuard allowedRoles={["KITCHEN", "ADMIN"]}`).
- **Kitchen Staff Ki Main Responsibilities**:
  - Waiters aur Customer QR Self-Orders se aane wale real-time Kitchen Order Tickets (KOTs) ko KDS screen par dekhna.
  - Dishes ko unke kitchen stations (`Kitchen`, `Bar`, `Bakery`) ke hisab se filter karke cook karna.
  - Cooking SLA timers track karna (Green $\rightarrow$ Yellow $\rightarrow$ Red).
  - Dish status progression update karna (`PENDING` $\rightarrow$ `COOKING` $\rightarrow$ `READY` $\rightarrow$ `SERVED`).
  - Dish **`READY`** hone par Waiter POS terminal par live pickup notification broadcast bhejnik.
  - Saare active KOT tickets ke same dishes ko ek jagah consolidate karke batana (Consolidated Items View).
  - Dishes ko **In Stock** ya **Out of Stock** toggle karna jo POS aur QR menu par instantly update ho jata hai.
  - Raw ingredient stock low hone par Admin ke liye **24-Hour Procurement SLA Alert** dispatch karna.
  - Kitchen wastage (Spoiled, Burnt, Expired food) log karna.
  - Dish ki recipe spec sheets, ingredient quantities, aur plating guides dekhna.
  - 80mm thermal KOT receipt print nikalna.
  - Galti se completed mark hue orders ko wapas active feed par **Recall** karna.

---

## 2. Main KDS Touch Screen Layout (`/kitchen`)

Main Kitchen KDS page (`kitchen/page.tsx`) touch screen screens ke liye dark theme layout me designed hai:

- **Top Header Bar**: Title, Subtitle, aur `Consolidated Items View` button.
- **Live KPI & SLA Performance Bar (`KitchenKpiSummaryBar.tsx`)**: Active KOTs, Cooking Items, Pending Orders, Overdue Breaches (Red), Out of Stock count, Sound Mute/Test controls, aur Analytics launcher.
- **Navigation Tabs**: Station Filters (`All Stations`, `Main Kitchen`, `Bar / Drinks`, `Bakery / Desserts`), `Stock & Waste` tab, aur `Completed Orders` tab.
- **Search & Filter Controls**: Order ID / Table search input box, Item status filter (`All`, `Pending Only`, `Cooking Only`, `Ready Only`).
- **Main KOT Feed Grid (`KitchenKotGrid.tsx`)**: Sabse purane orders pehle (Oldest-First FIFO queue) display hone wala cards grid.

---

## 3. KDS Station Routing Aur Tab System (`page.tsx`)

Menu items unke preparation area ke hisab se 3 main stations me assigned hote hain:
- **`Kitchen` (Main Kitchen)**: Indian curries, tandoor items, snacks, rotis, rice.
- **`Bar` (Bar / Drinks)**: Cold drinks, juices, mocktails, cocktails, shakes.
- **`Bakery` (Bakery / Desserts)**: Ice creams, cakes, desserts, bakery items.

Chefs station tabs par click karke sirf apne station se related dishes dekh sakte hain!

---

## 4. Kitchen KPI Overview Aur SLA Performance Bar (`KitchenKpiSummaryBar.tsx`)

Live operational counters:
- **Active KOTs**: Screen par total open tickets count.
- **Items Cooking**: Total dishes jo abhi `PREPARING` status me hain.
- **Pending Orders**: Tickets jo chef ke accept hone ka wait kar rahi hain.
- **SLA Breaches (Red)**: Tickets jo 15 minute ke target time se late ho chuki hain.
- **Out of Stock Items**: Status count badge; click karne par seedhe Stock Tab open hota hai.
- **Audio Controls**: Mute/Unmute audio chime, aur "Test Sound" button.
- **Analytics Button**: `KitchenAnalyticsModal` open karta hai.

---

## 5. Real-Time KOT Card Aur Cooking Workflow (`KitchenKotCard.tsx`, `useKitchenKds.ts`)

### 5.1 KOT Card Elements
- Header: KOT ID, Table Number, Dining Section, Guest Count, Station Badge, Time Elapsed Timer.
- SLA Border Color:
  - 🟢 **Green**: Under 10 minutes (Normal prep).
  - 🟡 **Yellow**: 10 to 15 minutes (SLA Warning limit).
  - 🔴 **Red (Pulsating)**: Over 15 minutes (SLA Danger / Overdue Breach).
- Itemized Dish List: Portion size (Half/Full), Quantity, Dietary Badges (`VEG` 🟢, `NON_VEG` 🔴, `SPICY` 🌶️), aur Special Preparation Notes (e.g. *"Kam mirchi"*, *"Bina pyaz"*).

### 5.2 Dish Status Action Steps
1. **`PENDING`** $\rightarrow$ Click **"Start Cooking"**: Status `PREPARING` / `COOKING` ho jata hai.
2. **`COOKING`** $\rightarrow$ Click **"Mark Ready"**: Status `READY` ho jata hai aur audio chime sound bajti hai.
3. Click **"Notify Waiter"**: Waiter POS app par live pickup alert bhejta hai.
4. Click **"Mark Served"**: Status `SERVED` ho jata hai. Jab KOT ki saari dishes serve ho jaati hain, ticket automatically `Completed Orders` history me shift ho jaati hai.

---

## 6. Consolidated Dish Prep Aggregator (`KitchenConsolidatedItemsModal.tsx`)

- Saare open KOT tickets me se identical dishes ko aggregate karke total prep count batata hai!
- Example: Agar Table T-01 me 3 Naan, Table T-04 me 4 Naan, aur Table T-09 me 5 Naan hain, toh Consolidated View batata hai: **Total 12 Naans Needed**!
- Head chef ko bulk cooking me super-efficiency milti hai.

---

## 7. Kitchen SLA Timers Aur Overdue Alert Escalation

- **Default Target Time**: 15 minutes per order (Admin settings me configurable).
- **Warning Limit (Yellow)**: 10 minutes hone par card border yellow ho jata hai.
- **Danger Limit (Red)**: 15 minutes cross hone par card border red animation ke saath alert karta hai.
- **Custom Item Prep Time Override (`setItemPrepTime`)**: Chef slow-cooked dishes (jaise Roasted Mutton) ke liye target prep time (e.g. 25 mins) set kar sakta hai.

---

## 8. Stock Availability Control Aur Low Stock SLA Alerts (`KitchenStockToggle.tsx`, `useKitchenStock.ts`)

### 8.1 Instant Dish Stock Toggle
- Chef kisi bhi dish ko 1-click me **In Stock** ↔ **Out of Stock** toggle kar sakta hai.
- Toggle hote hi Waiter POS aur Customer QR Menu me dish disable ho jaati hai.

### 8.2 Two-Way Procurement SLA & Restock Recovery System (`KitchenStockToggle.tsx`)
- Raw ingredient kam hone par Chef **"Send Low Stock Alert"** button click karta hai.
- Instant alert Admin aur Cashier ko jata hai aur Admin Dashboard par 24-Hour SLA Timer start ho jata hai.
- **Dynamic Restock Status Badges (Live Sync)**:
  - 🚨 **`Alert Sent 🚨`**: Alert Cashier aur Admin ko bhej diya gaya hai (Amber Badge).
  - 🚚 **`Restock In Progress 🚚`**: Jab Cashier procurement initiate karta hai, KDS par live Blue Badge dikhta hai.
  - 📦 **`Stock Supplied 📦`**: Jab Cashier stock kitchen me deliver kar deta hai, KDS par live Purple Badge dikhta hai.
- **"Full Stock Received 🟢" Action**:
  - Jab Kitchen staff ko new stock mil jata hai, wo **"Full Stock Received 🟢"** dabate hain.
  - Item automatically **`IN_STOCK` (Available)** reset ho jata hai!
  - Restock alert closed ho kar **Cashier Stock Recovery Hub aur Admin SLA Monitor dono me se AUTOMATICALLY REMOVE ho jata hai!**

---

## 9. Kitchen Food Wastage Logging Engine (`KitchenWasteLogModal.tsx`)

- Kitchen staff dwara kharab ya cancel hue khaane ko log karne ka module.
- **Wastage Reasons**: Spoiled Food, Burnt in Cooking, Expired Ingredient, Customer Cancelled Order.
- Item Name, Quantity, Unit Cost (₹), Total Loss Amount (₹), aur Chef Notes save hote hain.

---

## 10. Chef Recipe Spec Sheet Modal (`KitchenRecipeModal.tsx`)

- Har dish ki precise recipe spec sheet display karta hai:
- Raw ingredients weight (grams/ml), portion ratios, cooking temperature, step-by-step prep instructions, allergen info, aur plating guidelines.

---

## 11. 80mm Thermal KOT Ticket Printing (`KitchenTicketModal.tsx`)

- 80mm POS thermal paper receipt preview modal.
- Bold monospaced print format me KOT ID, Table Number, Timestamp, Dish Quantities, aur Preparation Notes.
- 1-Click `Print Ticket` button se kitchen pass printer se ticket print nikalta hai.

---

## 12. Completed KOT History Aur Order Recall Engine (`KitchenCompletedOrdersView.tsx`)

- History tab jo aaj ke saare completed/served KOT tickets dikhata hai.
- **Order Recall Engine (`recallCompletedKot`)**: Galti se complete mark hue order ko **"Recall Order"** button dabakar wapas live KDS feed par active kar sakta hai!

---

## 13. Kitchen Performance Analytics Engine (`KitchenAnalyticsModal.tsx`)

Kitchen operational charts aur metrics:
- Station-wise Average Prep Time (Kitchen vs Bar vs Bakery).
- SLA Compliance Rate (%) (Target time me complete hue orders ka percentage).
- Peak Hour Rush Timing & Order Bottlenecks.
- Top Prepared Dishes Ranking.

---

## 14. Audio Bell Alerts Engine (`playKitchenBell`)

- HTML5 Audio chime synthesizer (`beep_short.ogg`).
- Naya KOT aane par ya dish `READY` mark hone par sound play karta hai.
- Mute/Unmute toggle aur "Test Sound" diagnostic button.

---

## 15. Technical Directory Architecture Aur Function Index

### 📁 `src/app/kitchen/`
- **`page.tsx`**: Main KDS shell, tabs, search, filters, audio triggers, modal logic.
- **`KitchenErrorBoundary.tsx`**: KDS module React error boundary catch.
- **`kitchen_url_config.ts`**: Kitchen route config.

### 📁 `src/app/kitchen/kitchen_hooks/`
- **`useKitchenKds.ts`**: Reads orders, menu, flattens KOTs, item status transitions, SLA calculations, pickup broadcasts, order recalls.
- **`useKitchenStock.ts`**: Stock availability toggle, audit logging, 24-hour procurement SLA alerts.

### 📁 `src/app/kitchen/kitchen_components/`
- `KitchenKotGrid.tsx` — FIFO sorted KOT cards grid container.
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
- **`KitchenTypes.ts`**: `KitchenStationTab`, `KitchenFlatKot`, `KitchenKotItem`, `KitchenKdsMetrics`, `KitchenSlaStatus` TypeScript interfaces.

---

*Document generated for Smart Restaurant Management System (`my-app`). Location: `my-app/document/kitchenhinglish.md`.*

---

## 🚀 Version 2.0 & Multi-Tenant Updates
- **Inventory Access**: Kitchen staff ab /admin/inventory page open karke directly stock manage kar sakte hain.
- **Current Stock Updates**: Kitchen staff update kar sakte hain ki kitna raw material (jaise paneer) use hua hai, kitna bacha hai, aur items "Fresh", "Low", ya "Expired" hain.
- **Menu Tracking**: Kitchen wale menu item page access karke directly items ko available/out-of-stock mark kar sakte hain.

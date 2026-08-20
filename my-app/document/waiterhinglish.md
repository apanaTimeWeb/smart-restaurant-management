# Smart Restaurant Management System (`my-app`) — Waiter & Floor Captain Module Full Hinglish Documentation

Is document me **Smart Restaurant Management System (`my-app`)** ke **WAITER & FLOOR CAPTAIN** module ka har ek feature, sub-page, button, calculation, business logic, hook, aur component pure **Hinglish** me detailed me samjhaya gaya hai.

---

## 📖 Table of Contents

1. [Waiter Role Overview Aur Access Rights](#1-waiter-role-overview-aur-access-rights)
2. [Main Floor Captain Screen Layout (`/waiter`)](#2-main-floor-captain-screen-layout-waiter)
3. [Dining Section Filters Aur Table Grid Layout (`WaiterTableGrid.tsx`, `WaiterTableCard.tsx`)](#3-dining-section-filters-aur-table-grid-layout-waitertablegridtsx-waitertablecardtsx)
4. [Order Taking Aur KOT Dispatch Engine (`WaiterOrderModal.tsx`, `WaiterCartSummary.tsx`, `useWaiterOrder.ts`)](#4-order-taking-aur-kot-dispatch-engine-waiterordermodaltsx-waitercartsummarytsx-usewaiterordertsx)
5. [Table Action Controls Aur Active KOT Inspector (`WaiterTableActionsDrawer.tsx`)](#5-table-action-controls-aur-active-kot-inspector-waitertableactionsdrawertsx)
6. [Table Transfer Aur Order Merging Engine (`WaiterTableTransferModal.tsx`, `useWaiterTableActions.ts`)](#6-table-transfer-aur-order-merging-engine-waitertabletransfermodaltsx-usewaitertableactionsts)
7. [Item Void Aur Cancellation Request System (`WaiterVoidRequestModal.tsx`)](#7-item-void-aur-cancellation-request-system-waitervoidrequestmodaltsx)
8. [Live Customer Service Call Bell System (`WaiterServiceRequestsDrawer.tsx`)](#8-live-customer-service-call-bell-system-waiterservicerequestsdrawertsx)
9. [Live Ready-to-Serve Order Pickups (`WaiterReadyQueue.tsx`)](#9-live-ready-to-serve-order-pickups-waiterreadyqueuetsx)
10. [Table QR Code Generator Aur Printable Stand Cards (`WaiterTableQrModal.tsx`)](#10-table-qr-code-generator-aur-printable-stand-cards-waitertableqrmodaltsx)
11. [Multilingual Support Aur Language Toggle System (`useLanguage.ts`)](#11-multilingual-support-aur-language-toggle-system-uselanguagets)
12. [Technical Directory Architecture Aur Function Index](#12-technical-directory-architecture-aur-function-index)

---

## 1. Waiter Role Overview Aur Access Rights

**Waiter / Floor Captain** module (`/waiter`) restaurant ke dining hall operations, floor management, table status tracking, new orders, KOT creation, table transfers, aur customer call bells handle karta hai.

- **Allowed Route**: `/waiter`
- **RBAC Security Guard**: Is page ko sirf `WAITER` aur `ADMIN` login wale users hi access kar sakte hain (`AuthGuard allowedRoles={["WAITER", "ADMIN"]}`).
- **Waiter Ki Main Responsibilities**:
  - Dining floor ke alag-alag sections (Dining, AC, Outdoor) me live tables ki status dekhna.
  - Customers ke liye naya order Lena aur Kitchen Order Ticket (KOT) KDS kitchen terminal par bhejnik.
  - Running occupied table me extra dishes add karna (KOT appending).
  - Kitchen me dishes ka real-time cooking status track karna (`PENDING`, `PREPARING`, `READY`, `SERVED`, `VOIDED`).
  - Kitchen se dish **READY** hone par live sound alert ke saath ready dish pickup karna aur serve karna.
  - Customer ke live Call Bell requests (`WATER`, `BILL`, `NAPKINS`, `WAITER`) par respond karke acknowledge karna.
  - Dining complete hone par table ka Bill Request submit karna (`BILLING_PENDING`) taaki Cashier bill banaye.
  - Order ko ek table se doosri table par Shift (Transfer) karna ya do tables ko Merge karna.
  - Item Cancel / Void request bhejnik audit log ke saath.
  - Language Hindi ↔ English switch karna.

---

## 2. Main Floor Captain Screen Layout (`/waiter`)

Main Waiter page (`waiter/page.tsx`) floor captain ko live real-time visual control desk deta hai:

- **Top Action Bar**: Main title, live Customer Call Bell button badge counter ke saath, Table Transfer/Merge button, aur Language Switcher button (हिन्दी ↔ English).
- **Live Ready-to-Serve Queue Bar (`WaiterReadyQueue.tsx`)**: Kitchen staff dwara READY mark ki gayi dishes ka broadcast panel jahan Waiter 1-click me **"Serve Order"** press karta hai.
- **Live Pickup & Call Bell Banners**: Pulsating visual warning banners jab bhi koi dish ready hoti hai ya customer pani/bill ke liye call karta hai.
- **Floor Status Banner**: Active Occupied tables, Billing Pending tables count, aur daily Chef Recommendation upsell suggestions.
- **Search & Filter Bar**: Section Tabs (`All`, `Dining`, `AC`, `Outdoor`), Table search box, Status Filter (`Available`, `Occupied`, `Billing Pending`, `Reserved`), aur View Toggle (`Grid View` vs `Floor Map View`).
- **Main Interactive Table Grid**: Dynamic cards rendering jo har physical table ka real-time snapshot dikhate hain.

---

## 3. Dining Section Filters Aur Table Grid Layout (`WaiterTableGrid.tsx`, `WaiterTableCard.tsx`)

### 3.1 Dining Floor Sections
Tables ko restaurant ke alag-alag areas me divide karta hai:
- **`All`**: Sabhi sections ke tables ek saath dekhna.
- **`Dining`**: Main indoor dining hall area.
- **`AC`**: Air-conditioned premium dining section.
- **`Outdoor`**: Balcony / Open outdoor seating section.

### 3.2 Interactive Table Card (`WaiterTableCard.tsx`)
Visual card jo batata hai:
- Table Number aur Section badge.
- Seating Capacity (e.g. 4 Seats).
- **Table Status Badges**:
  - 🟢 **`AVAILABLE`**: Khaali, clean table jahan naye customer ko bithaya ja sakta hai.
  - 🔴 **`OCCUPIED`**: Active dining order chal raha hai.
  - 🟡 **`BILLING_PENDING`**: Customer ne bill maanga hai; Cashier checkout ka wait ho raha hai.
  - 🧹 **`CLEANING`**: Bill pay hone ke baad table saaf honi hai. Table card par hi 1-click **"Mark Cleaned 🟢"** button hai jisse table instantly **`AVAILABLE`** reset ho jati hai!
  - 🔵 **`RESERVED`**: Table pre-booked hai.
- **Active KOT Item Badges**: KOT items ka status: `PREPARING` ⏳, `READY` 🔔, `SERVED` ✅.
- Running Order ka Subtotal (₹) aur kitne minute se customer baitha hai.
- Card par click karne se Order Modal ya Table Actions Drawer open hota hai.

---

## 4. Order Taking Aur KOT Dispatch Engine (`WaiterOrderModal.tsx`, `WaiterCartSummary.tsx`, `useWaiterOrder.ts`)

### 4.1 Menu Selector Aur Item Selection (`WaiterMenuItemCard.tsx`)
- Menu dishes ko Category (Starters, Main Course, Drinks, Desserts) ya Search bar se find karna.
- Dish Name, Category, Price (₹), Dietary Badges (`VEG` 🟢, `NON_VEG` 🔴, `SPICY` 🌶️), Chef Special tag, aur Out of Stock toggle indicator.
- **Variant Selector**: Half / Full / Large portion choice.
- **Quantity Buttons**: Items + aur - karne ke controls.
- **Special Preparation Notes Input**: Custom instructions enter karna (Jaise *"Kam mirchi"*, *"Bina pyaz"*, *"Extra chutney"*).

### 4.2 Cart Summary Aur KOT Creation (`WaiterCartSummary.tsx`)
- Selected items ka summary, total pricing, aur estimated cooking time.
- **Chef Recommendation Upsell Box**: Best food combinations suggest karta hai (e.g. *Paneer Tikka + Mango Lassi*).
- **"Send KOT to Kitchen" Button**: KOT payload `app_orders` me push karke table status ko `OCCUPIED` me update karta hai.

### 4.3 KOT Logic Hook (`useWaiterOrder.ts`)
- **`createOrder(tableId, items)`**: Khaali table ke liye naya order create karke `kot-1` bhejta hai aur table `OCCUPIED` karta hai.
- **`addKotItems(orderId, items)`**: Pehle se chal rahe order me naye items ka KOT (`kot-2`, `kot-3`, etc.) add karta hai bina purani dishes ko disturbance kiye!

---

## 5. Table Action Controls Aur Active KOT Inspector (`WaiterTableActionsDrawer.tsx`)

Jab Waiter kisi **OCCUPIED** ya **BILLING_PENDING** table par click karta hai, tab Table Actions Drawer open hota hai:

- **Order Header Summary**: Table number, Guest Count, Order ID, Running Time, Total Amount (₹).
- **Itemized KOT Status Inspector**: Saari KOT dishes ka status live dikhata hai:
  - 🟡 **`PENDING`**: Kitchen me gaya hai, chef ke accept hone ka wait hai.
  - 🔵 **`PREPARING`**: KDS screen par cook ho raha hai.
  - 🟢 **`READY`**: Food tayyar hai, kitchen counter se pickup karna hai.
  - ✅ **`SERVED`**: Customer ke table par deliver ho chuka hai.
  - 🔴 **`VOIDED`**: Dish cancel ho chuki hai.
- **Quick Action Buttons**:
  - `+ Add More Items`: Naya KOT bhejnik `WaiterOrderModal` open karta hai.
  - `🧾 Request Bill`: Table status ko `BILLING_PENDING` me convert karke Cashier ko alert bhejta hai.
  - `❌ Void Item`: Item cancel karne ke liye `WaiterVoidRequestModal` open karta hai.
  - `🔀 Transfer / Merge Table`: Table shift karne ke liye `WaiterTableTransferModal` open karta hai.
  - `📱 View Table QR`: Customer QR code dekhne ke liye `WaiterTableQrModal` open karta hai.

---

## 6. Table Transfer Aur Order Merging Engine (`WaiterTableTransferModal.tsx`, `useWaiterTableActions.ts`)

### 6.1 Move Order (Transfer Table)
- Active running order ko ek occupied table se kisi doosri khaali `AVAILABLE` table par shift karta hai.
- Target table `OCCUPIED` ho jata hai aur purani table `AVAILABLE` ho jati hai.

### 6.2 Merge Tables
- Do alag-alag occupied tables ke running orders ko ek single table me merge kar deta hai (Jaise Table T-01 + Table T-02).
- Sabhi KOTs ek order me jud jaate hain, combined total calculate hota hai, aur source table khaali ho jati hai.

---

## 7. Item Void Aur Cancellation Request System (`WaiterVoidRequestModal.tsx`)

Order me se kisi dish ko cancel karne ka formal process:
- **Dish & Quantity Select**: Dish aur cancel hone wali quantity choose karna.
- **Reason Selection**:
  - Customer Changed Mind (Customer ne mana kar diya)
  - Ordered by Mistake (Galti se order ho gaya)
  - Kitchen Delay (>30 mins late)
  - Quality Issue / Burnt / Spoiled
- **Approval Request**: Request `BillingApprovalCenterModal` me bhejta hai Manager PIN / Admin Approval ke liye aur security audit log me entry hoti hai.

---

## 8. Live Customer Service Call Bell System (`WaiterServiceRequestsDrawer.tsx`)

Physical table ya Customer QR menu se aane wale live service alerts:
- **Request Types**:
  - 💧 **`WATER`**: Customer ne peene ka paani maanga hai.
  - 🧾 **`BILL`**: Customer ne bill maanga hai.
  - 🧻 **`NAPKINS`**: Customer ne extra napkins / spoons maange hain.
  - 🛎️ **`WAITER`**: Customer ne waiter ko table par bulaya hai.
- **Real-Time Warning Banner**: Screen ke top par pulsating alert bar aati hai.
- **"Acknowledge" Button**: Click karne par alert clear hota hai aur request `ACKNOWLEDGED` mark hoti hai.

---

## 9. Live Ready-to-Serve Order Pickups (`WaiterReadyQueue.tsx`)

Jab KDS par Chefs kisi dish ko **`READY`** mark karte hain, tab Waiter Screen par live broadcast banner aata hai:
- Table Number, Dish Name, Quantity, Kitchen Station (`Kitchen`, `Bar`, `Bakery`), aur time highlight hota hai.
- **"Serve Order" Button**: Waiter dish pick karke button click karta hai jisse status `SERVED` ho jata hai.

---

## 10. Table QR Code Generator Aur Printable Stand Cards (`WaiterTableQrModal.tsx`)

- Selected table ka unique QR Code graphic show karta hai.
- QR URL Target: `/customer?table=T-01`.
- **Printable Table Stand Card**: Formatted printable view jise print karke restaurant ke physical dining tables par rakha jata hai.

---

## 11. Multilingual Support Aur Language Toggle System (`useLanguage.ts`)

- Top bar me 1-click Language Switcher button (हिन्दी ↔ English).
- Subhi UI labels, section names, status badges, aur buttons instantly Hindi/English me switch ho jate hain.

---

## 12. Technical Directory Architecture Aur Function Index

### 📁 `src/app/waiter/`
- **`page.tsx`**: Main Waiter Terminal shell, section tabs, search, call bell banners, table grid, modal logic.
- **`WaiterErrorBoundary.tsx`**: Waiter module React error boundary catch.
- **`waiter_url_config.ts`**: Waiter route config.

### 📁 `src/app/waiter/waiter_hooks/`
- **`useWaiterOrder.ts`**: Naya order banana, KOT append karna, KOT statuses update karna, `app_orders` & `app_tables` me save karna.
- **`useWaiterTableActions.ts`**: `moveTable`, `mergeTable`, `requestBill`, aur `clearTable` operations.

### 📁 `src/app/waiter/waiter_components/`
- `WaiterTableGrid.tsx` — Grid / Floor map view renderer.
- `WaiterTableCard.tsx` — Dynamic table card with status & KOT badges.
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
- **`WaiterTypes.ts`**: `WaiterViewMode`, `WaiterTableSection`, `WaiterCartItem`, `WaiterOrderModalProps`, `WaiterTableActionsDrawerProps` TypeScript interfaces.

---

*Document generated for Smart Restaurant Management System (`my-app`). Location: `my-app/document/waiterhinglish.md`.*

---

## 🚀 Version 2.0 & Multi-Tenant Updates
- **Multi-Tenant Architecture**: Waiter module ab directly assigned hotel/tenant se connect karta hai, sirf usi hotel ka menu aur table data fetch karega.
- **Customer QR Integration**: Jab customer apne table se QR scan karke Bill Request dalta hai, toh ab waiter dashboard pe real-time instant notification aayega.

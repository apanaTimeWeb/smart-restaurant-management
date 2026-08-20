# Smart Restaurant Management System (`my-app`) — Customer QR Self-Ordering Module Full Hinglish Documentation

Is document me **Smart Restaurant Management System (`my-app`)** ke **CUSTOMER QR SELF-ORDERING** module ka har ek feature, sub-page, button, calculation, business logic, hook, aur component pure **Hinglish** me detailed me samjhaya gaya hai.

---

## 📖 Table of Contents

1. [Customer Role Overview Aur Access Rights](#1-customer-role-overview-aur-access-rights)
2. [Standalone Mobile Layout Architecture (`/customer?table=T-01`)](#2-standalone-mobile-layout-architecture-customertablet-01)
3. [URL Parameter Parsing Aur Table Session Hydration (`useCustomerOrder.ts`)](#3-url-parameter-parsing-aur-table-session-hydration-usecustomerordertsx)
4. [Digital QR Menu Browser Aur Category Filters (`CustomerMenuBrowser.tsx`)](#4-digital-qr-menu-browser-aur-category-filters-customermenubrowsertsx)
5. [Cart Management Aur Self-Order Submission (`CustomerCartDrawer.tsx`)](#5-cart-management-aur-self-order-submission-customercartdrawertsx)
6. [Live Order Progress Tracker Aur Cooking Timer (`CustomerOrderStatus.tsx`)](#6-live-order-progress-tracker-aur-cooking-timer-customerorderstatustsx)
7. [Floating Call Bell Aur Service Requests (`CustomerFloatingServiceButton.tsx`)](#7-floating-call-bell-aur-service-requests-customerfloatingservicebuttontsx)
8. [WhatsApp Bill Request Aur Cashier Auto-Sync (`CustomerBillRequestModal.tsx`)](#8-whatsapp-bill-request-aur-cashier-auto-sync-customerbillrequestmodaltsx)
9. [Customer Experience Aur Star Rating Feedback (`CustomerFeedbackForm.tsx`)](#9-customer-experience-aur-star-rating-feedback-customerfeedbackformtsx)
10. [Advance Table Reservation Engine (`CustomerAdvanceBookingModal.tsx`)](#10-advance-table-reservation-engine-customeradvancebookingmodaltsx)
11. [QR Image Uploader Aur Desktop Fallback (`CustomerQrUploadModal.tsx`)](#11-qr-image-uploader-aur-desktop-fallback-customerqruploadmodaltsx)
12. [Technical Directory Architecture Aur Function Index](#12-technical-directory-architecture-aur-function-index)

---

## 1. Customer Role Overview Aur Access Rights

**Customer QR Self-Ordering** module (`/customer`) restaurant guests ko contactless, web-based mobile experience deta hai jahan customer bina app download kiye table QR code scan karke menu browser open kar sakta hai, order place kar sakta hai, waiter bulata hai, bill maangta hai, aur feedback submit karta hai.

- **Allowed Route**: `/customer?table=T-01`
- **RBAC Security Guard**: Is page ko public customers access kar sakte hain (`AuthGuard allowedRoles={["CUSTOMER", "ADMIN"]}`).
- **Customer Features & Responsibilities**:
  - Dining table QR code scan karke web app par automatically connect hona.
  - Digital visual menu browse karna dietary badges (`VEG` 🟢, `NON_VEG` 🔴, `SPICY` 🌶️) aur Chef Specials ke saath.
  - Dish portion variants (Half/Full/Large) select karna aur custom cooking notes enter karna.
  - Self-service order confirm karke direct Kitchen KDS aur Waiter POS par KOT bhejnik.
  - Active dining order me naye KOT items append karna.
  - Real-time dish cooking progress live step-tracker par dekhna (`Order Placed` $\rightarrow$ `Preparing` $\rightarrow$ `Ready` $\rightarrow$ `Served`).
  - Floating Call Bell button se waiter bulana (`WATER`, `BILL`, `NAPKINS`, `CALL WAITER`).
  - Final Bill request maangna apna WhatsApp phone number enter karke (jo Cashier CRM me automatic auto-fill ho jata hai!).
  - 5-Star rating review aur feedback form submit karna.
  - Advance table booking reservation request bhejnik.

---

## 2. Standalone Mobile Layout Architecture (`/customer?table=T-01`)

Customer module ek clean **standalone mobile web application** ki tarah kaam karta hai:
- **No App Shell Sidebar / No Header**: Customer view me koi unnecessary admin controls, headers, ya sidebars nahi dikhte — pure distraction-free mobile web UI.
- **Multi-Stage Page Pipeline State**:
  1. **`MENU`**: Digital menu browser & shopping cart drawer.
  2. **`ORDER_STATUS`**: Real-time KOT cooking progress step-tracker.
  3. **`FEEDBACK`**: Star rating review form.
  4. **`THANK_YOU`**: Final t---

## 3. URL Parameter Parsing Aur Table Session Hydration (`useCustomerOrder.ts`)

- **Table Parameter Detection**: URL se `?table=T-01` extract karta hai.
- **Automatic Table Occupancy**: Customer QR code scan karte hi `app_tables` me table status ko `OCCUPIED` mark kar diya jata hai.
- **Active Order QR Re-Scan Session Recovery**:
  - System `app_orders` me us table ka active order (`status === "ACTIVE"`) scan karta hai.
  - Agar customer galti se browser tab/page close kar deta hai ya waiter se dubara ushi table ka QR scan karta hai, toh system **AUTOMATICALLY uske ongoing active order ko load karke `ORDER_STATUS` page par le jata hai** jahan uski saari ordered dishes, cooking statuses, aur running bill summary dikhti hai!
  - Jab Cashier bill checkout settle karta hai (`COMPLETED`), table `AVAILABLE` ho jati hai aur customer session clear ho jata hai taaki naya customer fresh Menu open kar sake.
- **Fallback Screen (`NoTableScreen`)**: Agar URL me `table` parameter nahi milta, toh `NoTableScreen` open hota hai jahan customer Waiter module se download ki gayi QR code image upload kar sakta hai ya laptop testing ke liye table select kar sakta hai.

---

## 4. Digital QR Menu Browser Aur Category Filters (`CustomerMenuBrowser.tsx`)

- **Branded Header**: Restaurant Name, Address, Logo, aur Active Table Number badge.
- **Active Running Order Notification Banner**: Active order hone par menu ke top par warning bar highlight hoti hai: *"Running Order Active — New items will be added to your table bill"* 1-tap *"View Order 🧾"* button ke saath.
- **Category Filter Tabs**: Starters, Main Course, Drinks, Desserts.
- **Dietary Filter Switches**:
  - 🟢 **`VEG`**: Shuddh shakahari dishes filter karna.
  - 🔴 **`NON_VEG`**: Non-veg dishes.
  - 🌶️ **`SPICY`**: Teekha chef special items.
- **Chef Special Banner**: Today's special offers aur recommended combo deals carousel.
- **Dish Card**: Dish image, description, price (₹), Half/Full variant selector, aur `Add to Order` button.
- **Floating Cart Bar**: Screen ke neeche floating bar jo total item count aur bill amount dikhata hai 1-tap `View Cart` button ke saath.
- **Header Quick Actions**: `Request Bill` button aur `Book Table` button.

---

## 5. Cart Management Aur Self-Order Submission (`CustomerCartDrawer.tsx`)

- Screen ke bottom se slide-up hone wala cart drawer.
- **Quantity Controls**: (+ / -) buttons se dishes ki quantity update karna.
- **Special Preparation Notes Input**: Custom instructions enter karna (Jaise *"Jain food"*, *"Kam mirchi"*, *"Extra cheese"*).
- **Bill Estimate Breakdown**: Subtotal, CGST 2.5%, SGST 2.5%, aur Total Estimated Amount.
- **KOT Appending Engine (`submitOrder`)**:
  - Agar pehle se table par active order chal raha hai, toh naye ordered items **nayi KOT (`kot-2`, `kot-3`) ban kar USHI SAME active order me add (plus) ho jate hain**!
  - Direct Kitchen KDS aur Waiter POS par KOT bhejta hai.
  - Table status `OCCUPIED` rehta hai aur customer screen ko `ORDER_STATUS` view par le jata hai.

---

## 6. Live Order Progress Tracker Aur Cooking Timer (`CustomerOrderStatus.tsx`)

- Order place karne ya QR re-scan karne ke baad live tracking dashboard:
- **Visual Step Pipeline**:
  - 🟢 **Step 1: Order Placed** (KOT kitchen me chala gaya hai).
  - 🔵 **Step 2: Preparing in Kitchen** (Chefs cook kar rahe hain).
  - 🔔 **Step 3: Ready for Serving** (Food tayyar hai, waiter pick kar raha hai).
  - ✅ **Step 4: Served at Table** (Table par aa chuka hai).
- **Itemized Dish List & Individual Statuses**: Saari KOT dishes ka status badge (⏳ Pending/Cooking, 🔔 Ready, ✅ Served), dish quantities, individual prices, aur custom notes.
- **Running Bill Summary**: Item Subtotal, CGST 2.5%, SGST 2.5%, aur Total Estimated Bill Amount (₹).
- **Action Buttons**: `+ Add More Items to Table Bill` (wapas menu open karta hai) aur `I've Finished Eating` (feedback form open karta hai).

---

## 7. Floating Call Bell Aur Service Requests (`CustomerFloatingServiceButton.tsx`)

- Screen ke bottom-right par floating bell icon:
- Tap karne par 4 quick options open hote hain:
  - 💧 **Water**: Peene ke paani ki request.
  - 🧾 **Bill**: Bill ki request (`CustomerBillRequestModal`).
  - 🧻 **Napkins**: Extra napkins / spoons ki request.
  - 🛎️ **Call Waiter**: Waiter ko table par bulana.
- Request bhejte hi Waiter POS aur Cashier POS par instant notification aur sound chime alert chala jata hai!

---

## 8. WhatsApp Bill Request Aur Cashier POS Auto-Sync (`CustomerBillRequestModal.tsx`)

- Customer "Request Bill" par click karke popup open karta hai.
- Customer apna **10-Digit Mobile Number** enter kar sakta hai (Optional).
- **Cross-Tab & LocalStorage Sync (`table_phone_XX`)**:
  - Number dedicated `table_phone_XX` key me save hota hai.
  - Cashier POS screen (`billing/page.tsx`) par cross-tab `storage` event listener aur checkout timing lookup se instantly sync ho jata hai.
  - Customer ka Phone Number Cashier ke CRM Panel me **AUTOMATICALLY auto-fill** ho jata hai aur **80mm Thermal Receipt** par customer phone number ke saath print hota hai!
- Agar customer ne number nahi dala, toh input empty rehta hai.

---

## 9. Customer Experience Aur Star Rating Feedback (`CustomerFeedbackForm.tsx`)

- 5-Star Rating Selector (⭐ ⭐ ⭐ ⭐ ⭐).
- Ratings Criteria: Food Quality, Service Speed, Ambiance & Cleanliness.
- Detailed Text Review Comments input box.
- Feedback `app_feedbacks` me save hota hai Admin analytics ke liye aur customer ko `ThankYouScreen` par redirect karta hai.

---

## 10. Advance Table Reservation Engine (`CustomerAdvanceBookingModal.tsx`)

- Advance table booking popup:
  - Guest Count (1 se 20 guests).
  - Booking Date & Time Slot selection.
  - Seating Area preference (Indoor, AC, Outdoor Garden).
  - Customer Full Name & Phone Number.
- Reservation request `app_reservations` me push karta hai Admin approval ke liye.

---

## 11. QR Image Uploader Aur Desktop Fallback (`CustomerQrUploadModal.tsx`)

- Desktop / Laptop par test karne ke liye fallback uploader modal:
- Waiter module se download ki gayi Table QR Code image file (`.png`, `.jpg`) upload karne ka option.
- Image me se table decode karta hai ya directly available tables me se select karne ka option deta hai.

---

## 12. Technical Directory Architecture Aur Function Index

### 📁 `src/app/customer/`
- **`page.tsx`**: Main Customer QR shell, URL table parsing, view state pipeline (`MENU` $\rightarrow$ `ORDER_STATUS` $\rightarrow$ `FEEDBACK` $\rightarrow$ `THANK_YOU`), fallback screens.
- **`CustomerErrorBoundary.tsx`**: Customer screen React error boundary catch.
- **`customer_url_config.ts`**: Customer route config.

### 📁 `src/app/customer/customer_hooks/`
- **`useCustomerOrder.ts`**: URL table parameter detection, menu fetch, cart state, order submission, KOT dispatch, feedback save.

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
- **`CustomerTypes.ts`**: `CustomerPageView`, `CustomerCartItem`, `CustomerOrderModalProps`, `CustomerFeedbackPayload` TypeScript interfaces.

---

*Document generated for Smart Restaurant Management System (`my-app`). Location: `my-app/document/customerhinglish.md`.*

---

## 🚀 Version 2.0 & Multi-Tenant Updates
- **Public Hotel Details Page**: Naye beautiful landing pages (/hotel/[tenantId]) jisme hotel ka hero banner, menu, aur offers show hote hain.
- **Advance Reservation & Pre-Order**: Customer ab table book karne ke sath-sath pehle se hi food pre-order kar sakte hain booking portal se.
- **Unified Registration**: Customer ke liye naya login/register page (/auth/register) jisme customer apna history aur details save kar sakte hain.

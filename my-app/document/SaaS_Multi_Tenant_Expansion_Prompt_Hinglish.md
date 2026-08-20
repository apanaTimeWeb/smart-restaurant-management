# 🚀 Master SaaS Multi-Tenant Platform Expansion — Full Hinglish Blueprint & Master Prompt

> **Goal**: Is system ko ek single restaurant POS se badha kar ek **Enterprise Multi-Tenant SaaS Restaurant Marketplace & POS Platform** (`Smart POS 360 SaaS`) banana.
> **File Location**: `my-app/document/SaaS_Multi_Tenant_Expansion_Prompt_Hinglish.md`

---

## 📖 Table of Contents

1. [Architectural Vision Aur System Flow](#1-architectural-vision-aur-system-flow)
2. [SaaS Platform Ke User Roles](#2-saas-platform-ke-user-roles)
3. [Public City Marketplace Landing Page (`/`)](#3-public-city-marketplace-landing-page-)
4. [Dual Customer Pathways: Walk-In Table QR vs Online Advance Booking](#4-dual-customer-pathways-walk-in-table-qr-vs-online-advance-booking)
5. [Hotel / Restaurant Owner Registration Aur Profile Wizard](#5-hotel--restaurant-owner-registration-aur-profile-wizard)
6. [Super Admin Verification Queue (`/super-admin/requests`)](#6-super-admin-verification-queue-super-adminrequests)
7. [Hotel Owner Advance Subscription Payment Gateway](#7-hotel-owner-advance-subscription-payment-gateway)
8. [Super Admin Payment Approval Aur Automatic Tenant Activation](#8-super-admin-payment-approval-aur-automatic-tenant-activation)
9. [Multi-Tenant Data Isolation Strategy (`tenantId`)](#9-multi-tenant-data-isolation-strategy-tenantid)
10. [Super Admin Master Dashboard (`/super-admin`)](#10-super-admin-master-dashboard-super-admin)
11. [Hotel Owner Tenant Dashboard (`/owner/dashboard`)](#11-hotel-owner-tenant-dashboard-ownerdashboard)
12. [Master Implementation Prompt (Naye Phase Ke Liye)](#12-master-implementation-prompt-naye-phase-ke-liye)

---

## 1. Architectural Vision Aur System Flow

Abhi hamara **Smart POS 360** ek single restaurant ke liye kaam kar raha hai (Admin, Cashier, Waiter, Kitchen, Customer QR). 

Is naye expansion se hamara application ek **B2B Multi-Tenant SaaS Marketplace** ban jayega:
1. **Public Marketplace (`/`)**: Main Home page par koi bhi customer aayega, apni City select karega, aur wahan ke best listed restaurants browse, search, aur QR menu dekh payega.
2. **Restaurant Owner Partner Registration**: Kisi hotel/restaurant owner ko apni hotel list karwani hai aur hamara POS system use karna hai, toh wo Signup karega as `HOTEL_OWNER`.
3. **Restaurant Profile Creation**: Owner apni hotel ki details bharega (Name, Address, City, Cuisine, FSSAI License, GSTIN, Branding, Operating Hours) aur Approval Request submit karega (`APPROVAL_PENDING`).
4. **Super Admin Approval (Aap — App Owner)**: Nayi request **Super Admin** (Aapke paas) aayegi. Aap hotel ki details verify karenge aur unhe **Advance Subscription Payment Request Notification** bhejenge (`PAYMENT_PENDING`).
5. **Hotel Owner Payment Checkout**: Hotel Owner Dashboard par **"Pay Advance Subscription Fee"** button activate ho jayega. Owner PhonePe, UPI, Card, Razorpay, Stripe, ya Google Pay se payment karega (`PAYMENT_SUBMITTED`).
6. **Super Admin Confirmation & Instant Activation**: Payment receipt aate hi Super Admin **"Verify Payment & Activate Tenant"** par click karega. Hotel Owner ko instant Confirmation alert aur Access mil jayega!
7. **Complete POS Access**: Activate hote hi Hotel Owner apne restaurant ke liye hamare saare POS modules (Admin, Cashier, Waiter, Kitchen, Customer QR) use kar sakta hai, aur har restaurant ka data completely isolate (`tenantId`) rahega!

---

## 2. SaaS Platform Ke User Roles

```
                               ┌──────────────────────────────────┐
                               │     SUPER_ADMIN (App Owner)      │
                               │  Global SaaS Command & Billing   │
                               └────────────────┬─────────────────┘
                                                │
                                                ▼
                               ┌──────────────────────────────────┐
                               │   HOTEL_OWNER / TENANT_ADMIN    │
                               │ Restaurant Business & Outlets    │
                               └────────────────┬─────────────────┘
                                                │
        ┌───────────────────────┬───────────────┴───────┬───────────────────────┐
        ▼                       ▼                       ▼                       ▼
┌───────────────┐       ┌───────────────┐       ┌───────────────┐       ┌───────────────┐
│    CASHIER    │       │    WAITER     │       │    KITCHEN    │       │   CUSTOMER    │
│  Billing POS  │       │ Floor Captain │       │ Kitchen KDS   │       │  QR Ordering  │
└───────────────┘       └───────────────┘       └───────────────┘       └───────────────┘
```

1. **`SUPER_ADMIN` (App Master / Maloon / App Owner — AAP)**:
   - System ka main boss. Global SaaS platform revenue, subscription plans, aur active restaurants manage karta hai.
   - Naye Hotel Registration requests ko verify, approve, ya reject karta hai.
   - Advance payment request bhejta hai aur payment verify karke instant tenant activate karta hai.
2. **`HOTEL_OWNER` / `TENANT_ADMIN` (Hotel / Restaurant Owner)**:
   - Apni hotel register karta hai, FSSAI/GSTIN details submit karta hai.
   - Advance subscription fee pay karta hai (Card/UPI/PhonePe/Razorpay).
   - Apne restaurant ke staff (`CASHIER`, `WAITER`, `KITCHEN`), menu, tables, inventory, aur sales reports manage karta hai.
3. **`CASHIER`**: Apne hotel tenant ka billing POS, CRM cashback, payment split, stock recovery, aur shift reconciliation handle karta hai.
4. **`WAITER`**: Apne hotel tenant ka dining floor map, order taking, KOT creation, call bells, aur table cleaning resets manage karta hai.
5. **`KITCHEN`**: Apne hotel tenant ka live KDS tickets, stock toggles, wastage logging, aur low stock alerts handle karta hai.
6. **`CUSTOMER`**: Public marketplace browse karta hai, city-wise restaurants dhoondhta hai, dining table QR code scan karke self-ordering karta hai.

---

## 3. Public City Marketplace Landing Page (`/`)

Application ka main route (`/`) ek premium **Multi-City Restaurant Discovery Portal** me transform hoga:

- **Hero Header**: *"Search & Discover the Best Restaurants in Your City 🍽️"*.
- **City Selector Dropdown**: City filters (Jaise *Bengaluru*, *Mumbai*, *Delhi NCR*, *Hyderabad*, *Pune*, *Jaipur*, *Goa*).
- **Search & Filter Bar**:
  - Restaurant Name, Dish, ya Locality search input.
  - Cuisine Filter Pills (*North Indian*, *Chinese*, *South Indian*, *Italian*, *Biryani*, *Cafes*).
  - Quick Filters (4.0+ Ratings, Pure Veg, Family Dining, Rooftop).
- **Featured Restaurant Cards Grid**:
  - Banner image, Restaurant Name, City/Locality, Cuisine tags, Rating ⭐ (e.g. 4.8), Avg Cost for Two (₹), Open/Closed Status.
  - Quick Buttons: **"View Digital QR Menu"** & **"Book a Table"**.
- **"List Your Restaurant / Partner With Us" Header Button**: Direct CTA jo hotel owners ko signup page par le jata hai.

---

## 4. Dual Customer Pathways: Walk-In Table QR vs Online Advance Booking

Application me Customer ordering ke 2 bilkul distinct pathways honge:

### Pathway 4.1: Walk-In Table QR Customer (Zero Friction — No Signup / Login Required)
- **Scenario**: Customer bina kisi advance booking ke direct hotel dining hall me aata hai.
- **Scanning**: Waiter table par laga physical QR code dikhata hai ya customer scan karta hai (`/customer?table=T-01&tenant=tenant-1`).
- **Zero Friction**: Customer ko koi account create karne, signup, ya login karne ki BILKUL JARURAT NAHI hai!
- **Digital Menu & Ordering**: Instant digital menu open hoga, customer dish select karega, kitchen ko order bhejega, prep status track karega, waiter ko call bell bhejega, aur final bill request karega.

### Pathway 4.2: Online Advance Table Booking & Zero-Wait Pre-Ordering System
- **Scenario**: Customer ghar baithe Marketplace (`/`) par city ke best hotels dhoondhta hai aur advance me table book karna chahta hai.
- **Account Login**: Customer as `CUSTOMER` signup / login karta hai (Profile save rehti hai taaki agli baar advance booking me phirse bada form na bharna pade!).
- **Advance Booking Form (`/reservations/book`)**:
  - Customer Date, Time Slot, aur Number of Guests (Persons) enter karta hai (Jaise *10 Persons*).
  - **Per-Person Advance Deposit Calculation**: Automatically Per-Person rate ke hisab se advance amount calculate hoti hai (Jaise 10 Persons $\times$ ₹100 = ₹1,000 Advance Deposit).
  - Customer Name, Mobile Number, aur Email account profile se pre-fill ho jata hai.
- **Multi-Option Payment Gateway Modal**:
  - Customer Advance Deposit pay karta hai via Card, PhonePe, UPI, Razorpay, Stripe, ya GPay.
- **Instant Pre-Order Menu Screen (Zero Wait Time Experience)**:
  - Advance payment successfully hote hi screen par instant **Pre-Order Menu Screen** khulega.
  - Customer pehle se hi apni favorite dishes select karke pre-order kar sakta hai taaki jab wo hotel pahunche, toh use khane ke liye bilkul wait na karna pade (Zero Wait Time)!
  - Is screen par **Bill Request** button bhi hoga (Mobile number phirse NAHI puchega kyunki booking form me number pehle hi link ho chuka hai!).
- **Hotel Owner Reservations Management Module (`/owner/reservations` & `/admin/reservations`)**:
  - Hotel Owner apne dashboard me sabhi upcoming advance bookings, total guest count (Persons), advance deposit paid (e.g. ₹1,000 for 10 persons), pre-ordered dishes list, aur assigned table numbers live dekh sakta hai.
- **Post-Dining Reset & Saved Profile Persistence**:
  - Customer ke khana kha kar final bill pay kar dene ke baad active pre-ordered session clear ho jata hai.
  - Customer ki profile aur saved contact details dashboard par hamesha saved rehti hain taaki agli baar booking me dubara long form na bharna pade!

---

## 5. Hotel / Restaurant Owner Registration Aur Profile Wizard

### Step 1: Owner Registration (`/owner/register`)
- Hotel Owner signup karega: Owner Name, Mobile Number, Email Address, Password.
- Role auto-assign: `HOTEL_OWNER`.

### Step 2: Restaurant Profile Creation Wizard (`/owner/onboarding`)
- Owner hotel ki sabhi details fill karega:
  - **Basic Info**: Hotel Name, Tagline, Business Type (*Fine Dine*, *Quick Service*, *Cafe*, *Bar*).
  - **Location Details**: Full Address, Landmark, City, Pincode, State, Google Maps Link.
  - **Contact Details**: Phone Number, Email, Opening Time, Closing Time, Weekly Off Day.
  - **Legal Documents**: FSSAI License Number, GSTIN Number, Owner PAN/Aadhaar number.
  - **Branding Assets**: Hotel Logo Image URL, Cover Banner Image URL, UPI VPA ID (`restaurant@upi`).
- Owner **"Submit Restaurant Registration for Approval"** click karega.
- Registration Status: **`APPROVAL_PENDING`**.
- Onboarding Progress Bar: **Step 1: Submitted ✅ $\rightarrow$ Step 2: Super Admin Verification ⏳**.

---

## 5. Super Admin Verification Queue (`/super-admin/requests`)

Super Admin (Aap) ke paas naye restaurant applications ki list aayegi:

- **Pending Approvals Audit Feed**: Naye hotel applications inspect karne ka panel.
- **Verification Audit**:
  - Super Admin FSSAI License, GSTIN, Address, map location check karega.
  - Action 1: **"Reject / Request Info Update"** (Owner ko reason notification bhejega).
  - Action 2: **"Verify & Send Advance Payment Request"**.
- **Advance Payment Dispatch**:
  - Click karte hi status update hoga: **`PAYMENT_PENDING`**.
  - Hotel Owner ko instant Notification & Email alert jayega:
    > 🔔 *Your restaurant registration for [Hotel Name] has been VERIFIED! Please pay the advance subscription fee to activate your POS terminal.*

---

## 6. Hotel Owner Advance Subscription Payment Gateway

### Step 3: Advance Payment Modal (`/owner/dashboard`)
- Hotel Owner jab apne dashboard par login karega, status update ho chuka hoga: **"Pay Advance Subscription Fee"**.
- Prominent CTA Button: **`💳 Pay Advance Subscription Fee (₹2,999 / Year)`**.

### Multi-Option Payment Gateway Modal:
- Order summary (SaaS POS License, 1-Year Cloud Storage, Unlimited Staff Accounts, Customer QR System).
- **Payment Method Options**:
  1. 💳 **Credit / Debit Card** (Visa, MasterCard, RuPay).
  2. 📱 **PhonePe / UPI / GPay** (Dynamic QR / UPI VPA input).
  3. ⚡ **Razorpay Gateway Simulation**.
  4. 🌐 **Stripe Gateway Simulation**.
  5. 💵 **Direct Bank NEFT / RTGS Transfer**.
- Owner payment option select karke **"Complete Advance Payment"** click karega.
- System transaction reference ID save karega aur status hoga: **`PAYMENT_SUBMITTED`**.
- Super Admin ko instant alert notification jayegi!

---

## 7. Super Admin Payment Approval Aur Automatic Tenant Activation

### Step 4: Payment Verification (`/super-admin/payments`)
- Super Admin ko alert notification aayegi: *"Hotel Owner paid advance subscription fee for [Hotel Name] (Txn ID: TXN12345)"*.
- Super Admin payment audit queue me transaction details inspect karega.
- Super Admin click karega: **`🟢 Confirm Payment & Activate Tenant POS`**.

### Automated Multi-Tenant Activation:
1. System restaurant status ko **`ACTIVE`** set kar dega.
2. Automatically isolated tenant workspace (`tenantId`) provision hoga.
3. Default dining tables, sample menu categories, initial settings, aur staff role credentials seed ho jayenge.
4. Hotel Owner ko confirmation alert aur access mil jayega:
   > 🎉 *Congratulations! Your restaurant POS terminal for [Hotel Name] is now FULLY ACTIVE. Click here to access your Admin POS Dashboard!*
5. Restaurant automatically Public Marketplace (`/`) par live list ho jayega!

---

## 8. Multi-Tenant Data Isolation Strategy (`tenantId`)

Har ek restaurant ka data isolated aur private rakhne ke liye har database table me **`tenantId`** hoga:

```typescript
export interface AppTenant {
  tenantId: string; // e.g. "tenant-royal-spice-01"
  restaurantName: string;
  city: string;
  status: "APPROVAL_PENDING" | "PAYMENT_PENDING" | "PAYMENT_SUBMITTED" | "ACTIVE" | "SUSPENDED";
  subscriptionPlan: "STARTER" | "PRO" | "ENTERPRISE";
  paidAmount: number;
  paidAt?: number;
  expiresAt?: number;
  createdAt: number;
}
```

- `app_tables` $\rightarrow$ Filtered by `tenantId`.
- `app_orders` $\rightarrow$ Filtered by `tenantId`.
- `app_menu` $\rightarrow$ Filtered by `tenantId`.
- `app_inventory` $\rightarrow$ Filtered by `tenantId`.
- `app_sales_history` $\rightarrow$ Filtered by `tenantId`.
- `app_users` $\rightarrow$ Filtered by `tenantId`.

---

## 9. Super Admin Master Dashboard (`/super-admin`)

System Owner (Aapke liye) Command Center:
- **SaaS Platform Revenue KPIs**: Total SaaS Subscription Revenue (₹), Total Registered Hotels, Active Tenants, Pending Requests.
- **Tenant Management Table**: City-wise hotels list, owner details, subscription expiry dates, and status toggles (`ACTIVE` / `SUSPENDED`).
- **Subscription Plans Manager**: SaaS pricing packages set karna (Monthly ₹299 / Yearly ₹2,999).

---

## 10. Hotel Owner Tenant Dashboard (`/owner/dashboard`)

Hotel Owners ke liye central dashboard:
- **Onboarding Progress Tracker**: 4-Step visual progress timeline.
- **Quick POS Module Launchpad**: 1-Click shortcuts:
  - 🛠️ **Admin Management** (`/admin`)
  - 🧾 **Cashier Billing POS** (`/billing`)
  - 🍽️ **Waiter Terminal** (`/waiter`)
  - 👨‍🍳 **Kitchen KDS** (`/kitchen`)
  - 📱 **Customer QR Menu Preview** (`/customer?tenant=...`)
- **Subscription Invoice & Renewal**: Tax invoices download karna aur plan renew karna.

---

## 11. Master Implementation Prompt (Naye Phase Ke Liye)

Naye phase me build start karne ke liye niche diya gaya prompt use karein:

```markdown
### 🎯 IMPLEMENTATION PROMPT: BUILD SAAS MULTI-TENANT RESTAURANT PLATFORM

Build the SaaS Multi-Tenant Architecture Expansion for Smart POS 360 as specified in my-app/document/SaaS_Multi_Tenant_Expansion_Prompt_Hinglish.md.

#### Core Modules to Implement:
1. Public Restaurant Marketplace Homepage (/) with City Filters, Cuisine Pills, Search, Featured Cards, and "List Your Restaurant" CTA.
2. Dual Customer Pathways:
   - Walk-In Table QR Scan (/customer?table=T-01) with ZERO FRICTION (No Signup / Login required).
   - Online Advance Table Booking & Zero-Wait Pre-Ordering System (/reservations/book) with Per-Person advance calculation, Multi-Gateway deposit payment, instant Pre-Order dish selection, and Saved Customer Profile persistence.
3. Hotel Owner Reservations Management Module (/owner/reservations & /admin/reservations) to view upcoming advance bookings, person count, advance deposit paid, and pre-ordered dishes.
4. Owner Registration (/owner/register) and Onboarding Profile Creation Wizard (/owner/onboarding) supporting FSSAI, GSTIN, Map Location, and Logo upload.
5. Super Admin Onboarding Audit Queue (/super-admin/requests) allowing Super Admin to inspect requests and trigger Advance Payment notifications.
6. Multi-Gateway Payment Modal (/owner/dashboard) supporting Card, PhonePe, UPI, Razorpay, Stripe, and Google Pay for paying advance subscription fees.
7. Super Admin Payment Verification (/super-admin/payments) to verify transactions and trigger 1-Click Automated Tenant POS Provisioning (tenantId isolation).
8. Super Admin Command Center (/super-admin) showing global SaaS revenue, tenant status toggles, and subscription plan managers.
9. Tenant Data Isolation Wrapper to filter all orders, tables, menu, inventory, staff, and sales by tenantId.

Follow all UI/UX guidelines: dark mode glassmorphism, responsive layouts, toast notifications, sound alerts, and 0 hydration errors.
```

---

*Document created for Smart Restaurant Management System (`my-app`). Location: `my-app/document/SaaS_Multi_Tenant_Expansion_Prompt_Hinglish.md`.*

# 🚀 Master SaaS Multi-Tenant Platform Expansion Blueprint & Prompt Specification

> **Project Target**: Transition from a single-restaurant POS into an **Enterprise Multi-Tenant SaaS Restaurant Marketplace & POS Platform** (`Smart POS 360 SaaS`).
> **File Location**: `my-app/document/SaaS_Multi_Tenant_Expansion_Prompt.md`

---

## 📖 Table of Contents

1. [Architectural Overview & Multi-Tenant Vision](#1-architectural-overview--multi-tenant-vision)
2. [Complete User Role Hierarchy](#2-complete-user-role-hierarchy)
3. [Public City Marketplace & Discovery Portal (`/`)](#3-public-city-marketplace--discovery-portal-)
4. [Dual Customer Pathways: Walk-In Table QR vs Online Advance Booking](#4-dual-customer-pathways-walk-in-table-qr-vs-online-advance-booking)
5. [Hotel / Restaurant Owner Self-Onboarding & Registration Flow](#5-hotel--restaurant-owner-self-onboarding--registration-flow)
6. [Super Admin Verification & Verification Queue (`/super-admin/requests`)](#6-super-admin-verification--verification-queue-super-adminrequests)
7. [Hotel Owner Payment Gateway & Advance Subscription Checkout](#7-hotel-owner-payment-gateway--advance-subscription-checkout)
8. [Super Admin Payment Approval & Automated Tenant Provisioning](#8-super-admin-payment-approval--automated-tenant-provisioning)
9. [Multi-Tenant Data Isolation Architecture (`tenantId`)](#9-multi-tenant-data-isolation-architecture-tenantid)
10. [Super Admin Platform Command Center (`/super-admin`)](#10-super-admin-platform-command-center-super-admin)
11. [Hotel Owner Tenant Dashboard (`/owner/dashboard`)](#11-hotel-owner-tenant-dashboard-ownerdashboard)
12. [Complete End-to-End Implementation Prompt for Next Phase](#12-complete-end-to-end-implementation-prompt-for-next-phase)

---

## 1. Architectural Overview & Multi-Tenant Vision

Currently, **Smart POS 360** operates as a single-restaurant POS solution (Admin, Cashier, Waiter, Kitchen, Customer QR). 

This expansion transforms the system into a **B2B Multi-Tenant Restaurant SaaS Marketplace**:
1. **Public Marketplace (`/`)**: Customers browse, discover, and search the best restaurants in their city by location, cuisine, and rating.
2. **Partner Registration**: Restaurant Owners sign up, register their business, submit verification documents (FSSAI, GSTIN), and request onboarding.
3. **Super Admin Control (App Master / Owner)**: You (the Platform Owner) audit new restaurant applications, verify location/documents, and issue advance subscription payment requests.
4. **Integrated Payment Gateway**: Restaurant Owners pay advance subscription fees via Card, PhonePe, UPI, Razorpay, Stripe, or Google Pay.
5. **Instant Tenant Activation**: Super Admin confirms payment $\rightarrow$ System automatically provisions isolated tenant data (`tenantId`) $\rightarrow$ Hotel Owner gets complete access to manage their restaurant's POS modules (Admin, Cashier, Waiter, Kitchen, Customer QR)!

---

## 2. Complete User Role Hierarchy

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

1. **`SUPER_ADMIN` (Platform Owner / System Master)**:
   - Full control over global SaaS platform.
   - Audits restaurant onboarding requests, approves/rejects listings.
   - Issues advance payment requests & verifies payment receipts.
   - Manages SaaS subscription plans, platform revenue analytics, and tenant lifecycles.
2. **`HOTEL_OWNER` / `TENANT_ADMIN` (Restaurant Owner)**:
   - Registers restaurant business and submits verification documents.
   - Pays advance subscription fee via multi-option payment gateway.
   - Manages tenant staff (`CASHIER`, `WAITER`, `KITCHEN`), menu items, dining tables, inventory, and sales reports.
3. **`CASHIER`**: Handles billing, payment settlement, customer CRM, stock recovery, and daily shift reconciliation for their specific tenant.
4. **`WAITER`**: Manages dining floor, orders, KOT creation, call bells, table transfers, and cleaning resets for their specific tenant.
5. **`KITCHEN`**: Manages live KDS preparation tickets, stock toggles, wastage logging, and low stock alerts for their specific tenant.
6. **`CUSTOMER`**: Browses public marketplace, scans table QR code, places self-service orders, tracks live KOT prep status, and requests bills.

---

## 3. Public City Marketplace & Discovery Portal (`/`)

The application root page (`/`) transforms into a modern, high-converting **Restaurant Discovery & Booking Marketplace**:

### Key Features:
- **Hero Section**: "Search & Discover the Best Restaurants in Your City 🍽️".
- **City Selector Dropdown**: City filters (e.g., *Bengaluru*, *Mumbai*, *Delhi NCR*, *Hyderabad*, *Pune*, *Goa*, *Jaipur*).
- **Search & Filter Bar**:
  - Live search by Restaurant Name, Dish, or Landmark.
  - Cuisine Filter Pills (*North Indian*, *Chinese*, *South Indian*, *Italian*, *Biryani*, *Cafes & Bakery*).
  - Rating & Price Filter (4.0+ Stars, Pure Veg, Family Dining, Rooftop).
- **Featured Restaurant Cards Grid**:
  - Banner image, Restaurant Name, City/Locality, Cuisine tags, Rating ⭐ (e.g. 4.8), Average Cost for Two (₹), and Operating Status (Open Now / Closed).
  - Quick Buttons: **"View QR Digital Menu"** and **"Book a Table"**.
- **"List Your Restaurant / Partner With Us" CTA Header Button**: Prominently guides restaurant owners to sign up.

---

## 4. Dual Customer Pathways: Walk-In Table QR vs Online Advance Booking

The platform supports two distinct customer dining & ordering workflows:

### Pathway 4.1: Walk-In Table QR Customer (Zero Friction — No Signup / Login Required)
- **Scenario**: A dining guest walks directly into a restaurant without pre-booking.
- **Scanning**: The guest scans the physical table QR code (`/customer?table=T-01&tenant=tenant-1`).
- **Zero Friction**: The customer is NOT required to create an account, sign up, or log in!
- **Digital Menu & Ordering**: Opens the live digital menu instantly, allows selecting dishes, placing KOT orders, tracking prep status, calling waiter, and requesting final bill.

### Pathway 4.2: Online Advance Table Booking & Zero-Wait Pre-Ordering System
- **Scenario**: A guest searches restaurants on the Marketplace (`/`) and wants to reserve a table in advance.
- **Account Login**: Customer signs up / logs in as a `CUSTOMER` (Profile saved so future bookings don't require re-entering long form details!).
- **Advance Booking Form (`/reservations/book`)**:
  - Guest selects Date, Time Slot, and Guest Count (e.g. 10 Persons).
  - **Dynamic Advance Deposit Calculation**: Automatically calculates advance deposit based on per-person rate (e.g. 10 Persons $\times$ ₹100 = ₹1,000 Advance Deposit).
  - Contact details (Name, Phone, Email) auto-populated from customer profile.
- **Multi-Option Payment Gateway Modal**:
  - Customer pays advance deposit via Credit/Debit Card, PhonePe, UPI, Razorpay, Stripe, or Google Pay.
- **Instant Pre-Order Menu Screen (Zero Wait Time Experience)**:
  - Immediately after payment completion, the customer is directed to the **Pre-Order Menu Screen**.
  - Customer can select dishes in advance so the kitchen prepares food prior to arrival (Zero Waiting Time when arriving at restaurant!).
  - Includes **Bill Request** button (does NOT prompt for mobile number again since mobile number is already captured in the booking form!).
- **Hotel Owner Reservations Management Module (`/owner/reservations` & `/admin/reservations`)**:
  - Hotel Owner sees all upcoming advance bookings, guest count, advance deposit paid (e.g. ₹1,000), pre-ordered dishes, and assigned table numbers.
- **Post-Dining Reset & Saved Profile Persistence**:
  - When the customer finishes dining, requests bill, and pays final balance, active pre-ordered session clears.
  - Customer profile & saved contact details remain stored so next time they book, they don't have to re-enter long form details!

---

## 5. Hotel / Restaurant Owner Self-Onboarding & Registration Flow

### Step 1: Owner Registration (`/owner/register`)
- Restaurant Owner creates account with:
  - Owner Full Name, Mobile Number, Email Address, Password.
  - Role automatically assigned as `HOTEL_OWNER`.

### Step 2: Restaurant Profile Creation Wizard (`/owner/onboarding`)
- Owner fills complete restaurant metadata:
  - **Basic Info**: Restaurant Name, Tagline, Business Type (*Fine Dine*, *Quick Service POS*, *Cafe*, *Bar & Brewery*).
  - **Location Details**: Address, Landmark, City, Pincode, State, Google Maps Location Link.
  - **Contact & Operating Info**: Manager Contact Phone, Email, Opening Time, Closing Time, Weekly Off Day.
  - **Legal & Tax Credentials**: FSSAI License Number, GSTIN Number, Owner PAN/Aadhaar number.
  - **Branding Assets**: Restaurant Logo Image URL, Cover Banner Image URL, UPI VPA ID (e.g. `restaurant@upi`).
- Owner clicks **"Submit Restaurant Registration for Approval"**.
- Registration status is set to: **`APPROVAL_PENDING`**.
- Onboarding Progress Bar displays: **Step 1: Submitted ✅ $\rightarrow$ Step 2: Under Super Admin Review ⏳**.

---

## 5. Super Admin Verification & Verification Queue (`/super-admin/requests`)

You (the Super Admin / App Master) manage all incoming partner registration requests:

### Key Features:
- **Pending Approvals Feed**: Displays all new restaurant registration applications.
- **Document & Location Verification**:
  - Super Admin inspects FSSAI License, GSTIN, Address, Map location, and contact details.
  - Action 1: **"Reject / Request Info Update"** (Sends reason notification to owner).
  - Action 2: **"Verify & Send Advance Payment Request"**.
- **Advance Payment Dispatch**:
  - When Super Admin clicks *Verify & Send Advance Payment Request*, system updates tenant status to **`PAYMENT_PENDING`**.
  - Sends instant Notification & Email alert to Hotel Owner:
    > 🔔 *Your restaurant registration for [Restaurant Name] has been VERIFIED! Please pay the advance subscription fee to activate your POS terminal.*

---

## 6. Hotel Owner Payment Gateway & Advance Subscription Checkout

### Step 3: Advance Payment Modal (`/owner/dashboard`)
- When Hotel Owner logs into their dashboard, the status updates to **"Pay Advance Subscription Fee"**.
- Prominent CTA Button: **`💳 Pay Advance Subscription Fee (₹2,999 / Year)`** (Configurable SaaS price).

### Multi-Option Payment Gateway Drawer / Modal:
- Shows order summary (SaaS POS License, 1-Year Cloud Storage, Unlimited Staff Accounts, Customer QR System).
- **Payment Method Options**:
  1. 💳 **Credit / Debit Card** (Visa, MasterCard, RuPay).
  2. 📱 **PhonePe / UPI / GPay** (Dynamic QR / UPI VPA input).
  3. ⚡ **Razorpay Gateway Simulation**.
  4. 🌐 **Stripe Gateway Simulation**.
  5. 💵 **Direct Bank NEFT / RTGS Transfer**.
- Owner selects payment method and clicks **"Complete Advance Payment"**.
- System records transaction reference ID and sets status to: **`PAYMENT_SUBMITTED`**.
- Dispatches instant high-priority notification to Super Admin!

---

## 7. Super Admin Payment Approval & Automated Tenant Provisioning

### Step 4: Payment Verification (`/super-admin/payments`)
- Super Admin receives notification: *"Hotel Owner paid advance subscription fee for [Restaurant Name] (Txn ID: TXN12345)"*.
- Super Admin opens Payment Audit Queue and inspects transaction details.
- Super Admin clicks: **`🟢 Confirm Payment & Activate Tenant POS`**.

### Automated Multi-Tenant Activation:
1. System sets restaurant status to **`ACTIVE`**.
2. Automatically provisions isolated tenant workspace (`tenantId`).
3. Seeds default dining tables, sample menu categories, initial settings, and role credentials for the new restaurant.
4. Sends confirmation notification & email to Hotel Owner:
   > 🎉 *Congratulations! Your restaurant POS terminal for [Restaurant Name] is now FULLY ACTIVE. Click here to access your Admin POS Dashboard!*
5. The restaurant is automatically published onto the public City Marketplace (`/`)!

---

## 8. Multi-Tenant Data Isolation Architecture (`tenantId`)

To ensure complete data privacy and security between restaurants, every database record includes a mandatory **`tenantId`** attribute:

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

### Data Filtering Strategy:
- `app_tables` $\rightarrow$ Filtered by `t.tenantId === currentTenantId`.
- `app_orders` $\rightarrow$ Filtered by `o.tenantId === currentTenantId`.
- `app_menu` $\rightarrow$ Filtered by `m.tenantId === currentTenantId`.
- `app_inventory` $\rightarrow$ Filtered by `i.tenantId === currentTenantId`.
- `app_sales_history` $\rightarrow$ Filtered by `s.tenantId === currentTenantId`.
- `app_users` $\rightarrow$ Filtered by `u.tenantId === currentTenantId`.

---

## 9. Super Admin Platform Command Center (`/super-admin`)

Central dashboard for the Platform Owner (You):
- **SaaS Platform Revenue KPIs**: Total SaaS Subscription Revenue Collected (₹), Total Registered Restaurants, Active Tenants, Pending Requests.
- **Tenant Management Table**: List all restaurants, cities, owner details, subscription expiry dates, and status toggles (`ACTIVE` / `SUSPENDED`).
- **Subscription Plans Manager**: Create and edit SaaS pricing packages (Monthly ₹299 / Yearly ₹2,999).
- **Global Broadcast System**: Send system-wide announcements or maintenance alerts to all restaurant owners.

---

## 10. Hotel Owner Tenant Dashboard (`/owner/dashboard`)

Central command center for Restaurant Owners:
- **Onboarding Progress Tracker**: Visual 4-step timeline showing current onboarding stage.
- **Branch & Outlet Switcher**: Manage single or multiple restaurant outlets.
- **Quick Module Launchpad**: Direct 1-click links to launch:
  - 🛠️ **Admin Management** (`/admin`)
  - 🧾 **Cashier Billing POS** (`/billing`)
  - 🍽️ **Waiter Terminal** (`/waiter`)
  - 👨‍🍳 **Kitchen KDS** (`/kitchen`)
  - 📱 **Customer QR Menu Preview** (`/customer?tenant=...`)
- **Subscription Invoice & Renewal Manager**: Download GST tax invoices for subscription payments.

---

## 11. Complete End-to-End Implementation Prompt for Next Phase

Copy the prompt below to trigger the complete SaaS Multi-Tenant expansion:

```markdown
### 🎯 IMPLEMENTATION PROMPT: BUILD SAAS MULTI-TENANT RESTAURANT PLATFORM

Build the SaaS Multi-Tenant Architecture Expansion for Smart POS 360 as specified in my-app/document/SaaS_Multi_Tenant_Expansion_Prompt.md.

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

*Document created for Smart Restaurant Management System (`my-app`). Location: `my-app/document/SaaS_Multi_Tenant_Expansion_Prompt.md`.*

# Smart Restaurant Management System (`my-app`) — Super Admin Module Documentation

Welcome to the **Super Admin Module Documentation**. The Super Admin is the highest level of access in the platform, intended for the SaaS Platform Owners.

---

## 📖 Table of Contents
1. [Role Overview & Responsibilities](#1-role-overview--responsibilities)
2. [Global SaaS Dashboard (`/super-admin/dashboard`)](#2-global-saas-dashboard-super-admindashboard)
3. [Tenant & Hotel Management (`/super-admin/hotels`)](#3-tenant--hotel-management-super-adminhotels)
4. [Activation Requests & Onboarding (`/super-admin/requests`)](#4-activation-requests--onboarding-super-adminrequests)
5. [Billing & Payments (`/super-admin/payments`)](#5-billing--payments-super-adminpayments)
6. [Global Settings & System Logs (`/super-admin/settings` & `/super-admin/audit`)](#6-global-settings--system-logs)

---

## 1. Role Overview & Responsibilities
The **`SUPER_ADMIN`** role orchestrates the entire multi-tenant SaaS platform. 
- **Allowed Routes**: `/super-admin/*`
- **Key Responsibilities**:
  - Approving new hotel/restaurant registrations.
  - Generating dynamic payment links and verifying UPI transactions for SaaS subscriptions.
  - Activating tenant accounts (`tenantId`) and provisioning POS workspaces.
  - Monitoring global platform metrics (Total MRR, Active Tenants, Total Platform Orders).
  - Conducting global security audits and managing platform-wide settings.

---

## 2. Global SaaS Dashboard (`/super-admin/dashboard`)
The central command center for the platform owner.
- **Global KPI Metrics**: View Total Monthly Recurring Revenue (MRR), Total Active Hotels, Platform-wide Daily Orders, and Pending Activation Requests.
- **Revenue Charts**: Visual charts showing platform-wide subscription revenue growth over the past months.

---

## 3. Tenant & Hotel Management (`/super-admin/hotels`)
Complete directory of all registered restaurants on the platform.
- **Tenant Directory**: View all active, inactive, and pending restaurants.
- **Tenant Controls**: Ability to suspend a restaurant's access or revoke their subscription.
- **Detailed View**: See the number of staff, total generated revenue, and subscription expiry date for any specific hotel.

---

## 4. Activation Requests & Onboarding (`/super-admin/requests`)
When a new Hotel Owner registers, their account goes into a "Pending Review" state.
- **Document Verification**: Super Admins can verify uploaded documents (e.g., FSSAI, GSTIN).
- **1-Click Provisioning**: Once payment is verified, clicking "Activate Tenant" automatically generates their isolated `tenantId`, provisions their database space, and sends an activation email.

---

## 5. Billing & Payments (`/super-admin/payments`)
Monetization center for the SaaS platform.
- **Subscription Tiers**: Manage the pricing plans (e.g., Basic, Pro, Enterprise) offered to hotel owners.
- **Payment Verification**: Cross-check UPI/Bank reference numbers submitted by new registrants.
- **Automated Invoicing**: View all past invoices sent to tenant hotels for their monthly/yearly subscriptions.

---

## 6. Global Settings & System Logs
- **`/super-admin/settings`**: Configure global platform settings, SEO meta-tags for the main landing page, and default SMS/Email gateway APIs.
- **`/super-admin/audit`**: Platform-wide immutable audit logs. Tracks every major action taken by any Admin or Hotel Owner across the entire platform.
- **`/super-admin/backup`**: Download full JSON snapshots of the entire multi-tenant database.

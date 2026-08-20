# Smart Restaurant Management System (`my-app`) — Super Admin Module Documentation

Welcome to the **Super Admin Module Documentation**. Super Admin platform ka sabse bada level of access hai, jo main SaaS Platform Owners (software banane walo) ke liye banaya gaya hai.

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
**`SUPER_ADMIN`** role poore multi-tenant SaaS platform ko control karta hai.
- **Allowed Routes**: `/super-admin/*`
- **Key Responsibilities**:
  - Naye hotel/restaurant registrations ko approve karna.
  - SaaS subscriptions ke liye dynamic payment links generate karna aur UPI transactions verify karna.
  - Tenant accounts activate karna (`tenantId` assign karke) aur unke POS workspaces setup karna.
  - Global platform metrics (jaise Total MRR, Active Tenants, Total Orders) monitor karna.
  - Global security audits conduct karna aur platform-wide settings manage karna.

---

## 2. Global SaaS Dashboard (`/super-admin/dashboard`)
Platform owner ke liye central command center.
- **Global KPI Metrics**: Total Monthly Recurring Revenue (MRR), Total Active Hotels, roz ke platform-wide Orders, aur Pending Activation Requests dekhein.
- **Revenue Charts**: Visual charts jo platform ki subscription revenue growth dikhate hain.

---

## 3. Tenant & Hotel Management (`/super-admin/hotels`)
Platform par registered sabhi restaurants ki complete directory.
- **Tenant Directory**: Sabhi active, inactive, aur pending restaurants ko ek jagah dekhein.
- **Tenant Controls**: Kisi bhi restaurant ka access suspend karna ya subscription revoke karne ka control.
- **Detailed View**: Kisi specific hotel mein kitne staff hain, unhone kitna revenue generate kiya hai, aur unki subscription expiry date kya hai, yeh sab check karein.

---

## 4. Activation Requests & Onboarding (`/super-admin/requests`)
Jab naya Hotel Owner register karta hai, toh unka account "Pending Review" state mein jata hai.
- **Document Verification**: Super Admins uploaded documents (jaise FSSAI, GSTIN) ko verify kar sakte hain.
- **1-Click Provisioning**: Payment verify hone ke baad, "Activate Tenant" button par click karte hi unka alag `tenantId` generate ho jata hai, database space ready ho jata hai, aur activation email chala jata hai.

---

## 5. Billing & Payments (`/super-admin/payments`)
SaaS platform ka monetization center.
- **Subscription Tiers**: Hotel owners ko diye gaye pricing plans (e.g., Basic, Pro, Enterprise) ko manage karein.
- **Payment Verification**: Naye aane wale registrants dvara submit kiye gaye UPI/Bank reference numbers ko cross-check karein.
- **Automated Invoicing**: Tenant hotels ko bheji gayi past monthly/yearly subscription invoices dekhein.

---

## 6. Global Settings & System Logs
- **`/super-admin/settings`**: Global platform settings, main landing page ke liye SEO meta-tags, aur default SMS/Email gateway APIs configure karein.
- **`/super-admin/audit`**: Platform-wide immutable audit logs. Kisi bhi Admin ya Hotel Owner dvara kiye gaye bade actions ko track karein.
- **`/super-admin/backup`**: Poore multi-tenant database ka full JSON snapshot download karein.

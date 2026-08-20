# Smart Restaurant Management System (`my-app`) — Admin Module Documentation

Welcome to the **Admin Module Documentation** for **Smart Restaurant Management System (`my-app`)**. This document provides a complete, exhaustive breakdown of every single page, feature, metric, control, business logic rule, and data model related to the **ADMIN** role.

---

## 📖 Table of Contents

1. [Admin Role Overview & Access Permissions](#1-admin-role-overview--access-permissions)
2. [Admin Main Dashboard (`/admin`)](#2-admin-main-dashboard-admin)
3. [Staff Management, Attendance & Payroll (`/admin/staff`)](#3-staff-management-attendance--payroll-adminstaff)
4. [Menu Catalog & Recipe Master (`/admin/menu`)](#4-menu-catalog--recipe-master-adminmenu)
5. [Stock Inventory & Supplier POs (`/admin/inventory`)](#5-stock-inventory--supplier-pos-admininventory)
6. [Coupons & Discount Rules Manager (`/admin/coupons`)](#6-coupons--discount-rules-manager-admincoupons)
7. [Master Restaurant Settings (`/admin/settings`)](#7-master-restaurant-settings-adminsettings)
8. [Shift & Day-Close Z-Report (`/admin/shift`)](#8-shift--day-close-z-report-adminshift)
9. [Permissions & Security Audit Logs (`/admin/audit`)](#9-permissions--security-audit-logs-adminaudit)
10. [Data Backup, Restore & Reset (`/admin/data`)](#10-data-backup-restore--reset-admindata)
11. [Table QR Code Generator (`/admin/qr`)](#11-table-qr-code-generator-adminqr)

---

## 1. Admin Role Overview & Access Permissions

The **`ADMIN`** role is the super-user of the system. Admins have complete read and write access across all modules of the application.

- **Allowed Routes**: `/admin/*`, `/waiter`, `/kitchen`, `/billing`, `/reports`, `/reservations`, `/customer`, `/dashboard`.
- **RBAC Guard**: Enforced via `AuthGuard` (`AuthGuard allowedRoles={["ADMIN"]}`).
- **Key Responsibilities**:
  - Full system setup and master restaurant branding.
  - Staff onboarding, role allocation, and credentials management.
  - Daily attendance logging and automated monthly payroll/payslip generation.
  - Menu catalog management, pricing, recipe ingredient linking, and combo deals.
  - Inventory tracking, minimum stock reorder alerts, and supplier purchase orders.
  - Promo coupon creation and discount limits.
  - Shift register auditing, cash variance tracking, and Day-Close Z-Reports.
  - System security, Manager PIN overrides, and immutable audit logging.
  - JSON Database backup, restore, and factory reset.

---

## 2. Admin Main Dashboard (`/admin`)

The main Admin Dashboard provides a real-time command center for restaurant owners and managers.

### 2.1 Live KPI Summary Cards (`AdminKpiGrid.tsx`)
Top row metric cards calculated dynamically from settled sales (`app_sales_history`):
- **Total Revenue (Gross Sales)**: Total sales revenue generated today/this month (includes taxes and charges).
- **Net Sales (Net Revenue)**: Gross revenue minus discounts and refunds.
- **Total Orders Count**: Total completed bills settled.
- **Average Order Value (AOV)**: Calculated as `Total Revenue / Total Orders`.
- **Busy Hours Peak**: Identifies peak ordering time windows (e.g. 8:00 PM - 10:00 PM).
- **Active Staff On-Duty**: Count of staff present today.

### 2.2 Kitchen Low Stock SLA Monitor (`AdminLowStockSlaTracker.tsx`)
- Displays real-time pending low stock notifications triggered by kitchen staff.
- **24-Hour Procurement SLA Countdown**: Live timer counting down 24 hours from the moment low stock alert is sent.
- **Overdue Handling (> 24 Hours)**: Automatically flags items as **`CRITICAL LOW STOCK`** with pulsating red badges when restock time exceeds 24 hours.
- **Send Strict Reminder to Cashier**: Dedicated button allowing Admin to send high-priority alert notifications directly to Cashier for immediate procurement.

### 2.3 5-Day Revenue Window Filter & Analytics (`AdminSingleDayRevenueFilter.tsx`)
- Interactive date picker component allowing Admin to select any start date and view performance over a 5-day window.
- Calculates Target Revenue, Total Orders Billed, Average Order Value (AOV), and itemized payment breakdown (Cash, UPI, Card).
- Includes quick **"Today"** reset button to jump back to current date metrics.

### 2.4 Revenue & Sales Trend Chart (`AdminRevenueChart.tsx`)
- Visual ApexCharts bar + line combo chart rendering daily revenue breakdown over the last 7 days.
- Displays Sales trend vs Target sales with custom dark theme styling.

### 2.5 Payment Method Breakdown Donut (`AdminPaymentDonut.tsx`)
- Interactive donut chart showing payment split:
  - **Cash** 💵
  - **UPI / Dynamic QR** 📱
  - **Card (POS Terminal)** 💳
  - **Split Payment** 🔀
- Displays total transaction count and percentage split per payment method.

### 2.6 Staff Credentials Generator Panel (`AdminStaffCredentialsPanel.tsx`)
- Quick management panel to view all staff, generate system IDs and random passwords for `CASHIER`, `WAITER`, and `KITCHEN` roles.
- Features auto-suggested usernames, role filter tabs, active/inactive toggles, and automatic immutable audit logging for credential changes.

---

## 3. Staff Management, Attendance & Payroll (`/admin/staff`)

Complete HR, Staff Credentials, Daily Attendance, and Monthly Payroll module.

### 3.1 Staff Account Management
- Create, view, edit, and deactivate staff profiles.
- Fields: Staff Name,- **Role Architecture**: `SUPER_ADMIN` (Platform Owner), `HOTEL_OWNER` (Tenant Owner), `ADMIN` (Store Manager), `CASHIER`, `WAITER`, `KITCHEN`, `CUSTOMER`.
- **Public City Marketplace (`/`)**: Multi-City restaurant discovery, search, cuisine pills, featured cards, and partner onboarding CTA.
- **SaaS Onboarding & Automated Provisioning**: Super Admin audits FSSAI/GSTIN (`/super-admin/requests`), dispatches payment request, verifies transaction (`/super-admin/payments`), and triggers 1-Click Tenant POS Activation (`tenantId` isolated).Phone Number, Email, Base Monthly Salary (₹), Joining Date, Status (`ACTIVE`, `INACTIVE`).

### 3.2 Attendance Calendar & Tracking (`app_staff_attendance`)
- Daily attendance logging per staff member.
- Attendance Statuses:
  - 🟢 **`PRESENT`**: Full day worked.
  - 🔴 **`ABSENT`**: Unexcused leave (deducts 1 day salary).
  - 🟡 **`HALF_DAY`**: Half day worked (deducts 0.5 day salary).
- Attendance calendar visualization with attendance percentage calculations (`AdminStaffAttendanceCalendarModal.tsx`).

### 3.3 Automated Payroll & Payslip Engine (`app_salary_records`)
- Automatically calculates monthly Net Payable Salary using the formula:
  $$\text{Net Salary} = \text{Base Salary} - \left(\text{Absence Days} \times \frac{\text{Base Salary}}{30}\right) + \text{Bonus} + \text{Overtime} - \text{Deductions}$$
- **Fixed Monthly Salary Modal (`AdminStaffSalaryModal.tsx`)**: Eliminates manual input errors by auto-calculating leave deductions based on 30-day rate, performance bonuses, and overtime pay.
- **Printable Payslip Modal (`AdminStaffSalaryPayslipModal.tsx`)**: Generates official itemized salary slip showing restaurant header, Base Pay, Attendance Deductions, Bonuses, Net Pay, Voucher ID, and electronic signature footer with print/PDF capability.

---

## 4. Menu Catalog & Recipe Master (`/admin/menu`)

Complete menu management, recipe mapping, and combo builder.

### 4.1 Menu Item Master (`app_menu`)
- Add/Edit/Delete menu items (`AdminMenuTable.tsx`, `AdminMenuFormModal.tsx`).
- Fields: Dish Name, Category (Starter, Main Course, Beverage, Dessert), Price (₹), Kitchen Station (`Kitchen`, `Bar`, `Bakery`), Variants (Half / Full / Large), Dietary Tags (`VEG` 🟢, `NON_VEG` 🔴, `SPICY` 🌶️), Daily Special Flag.
- Availability toggle: Mark item **Available** or **Out of Stock** (syncs immediately across Waiter POS and Customer QR Menu).

### 4.2 Recipe Ingredient Linking (`AdminRecipeEditor.tsx`)
- Link inventory raw materials/ingredients to menu dishes with precise quantities.
- Example: *Paneer Butter Masala 1 Portion* requires *200g Paneer*, *50g Butter*, *100ml Tomato Gravy*.
- **Automated Stock Depletion**: When Cashier completes order checkout, recipe ingredient stock is automatically deducted from `app_inventory`.

### 4.3 Happy Hour Combo Builder (`AdminComboEditor.tsx`)
- Create bundled dish combos at discounted pricing (e.g. *Burger + Fries + Coke Combo for ₹249*).
- Define Happy Hour valid time windows (e.g. 4:00 PM - 7:00 PM).

---

## 5. Stock Inventory & Supplier POs (`/admin/inventory`)

Real-time ingredient stock control and purchase order management.

### 5.1 Stock Tracking (`app_inventory`)
- Track inventory items by unit (`kg`, `g`, `ltr`, `ml`, `pcs`, `pack`).
- Fields: Ingredient Name, Current Stock, Minimum Threshold Level, Unit Cost (₹), Last Restocked Date (`AdminInventoryTable.tsx`).

### 5.2 Minimum Stock Reorder Alerts, 24-Hour SLA System & Two-Way Stock Recovery Hub
- Visual warning badges for ingredients below minimum threshold level.
- Integration with `AdminLowStockSlaTracker` for 24-hour procurement SLA tracking and critical alerts.
- **Two-Way Real-Time Closed-Loop Restocking Lifecycle**:
  - 🚨 **`ALERT_SENT`**: Kitchen triggers alert $\rightarrow$ Admin SLA Monitor & Cashier Hub display Amber alert badge.
  - 🚚 **`IN_PROGRESS`**: Cashier clicks *Mark Restock In Progress* $\rightarrow$ Admin SLA Monitor updates live with Blue **"Restock In Progress 🚚"** badge.
  - 📦 **`DISPATCHED`**: Cashier clicks *Stock Supplied* $\rightarrow$ Admin SLA Monitor updates live with Purple **"Stock Supplied 📦"** badge.
  - 🟢 **`RESTOCKED`**: Kitchen clicks *Full Stock Received* $\rightarrow$ Item automatically toggles to **`IN_STOCK`**, and the alert is **automatically removed** from both Admin SLA Tracker and Cashier Stock Recovery Hub!

### 5.3 Supplier Purchase Orders Manager (`AdminSupplierPoModal.tsx`)
- Generate formal Purchase Orders (PO) for low-stock ingredients.
- Select supplier details, order quantities, unit costs, and track PO statuses (`DRAFT`, `ORDERED`, `RECEIVED`).
- Automatically updates inventory stock upon PO fulfillment.

### 5.4 Wastage Log Auditing (`app_wastage`)
- View kitchen waste entries logged by kitchen staff (Spoiled, Burnt, Expired, Order Cancelled).
- Tracks total financial loss due to ingredient wastage.

---

## 6. Coupons & Discount Rules Manager (`/admin/coupons`)

Promo codes and discount rules engine (`app_coupons`).

- **Coupon Types**:
  - **`PERCENTAGE`**: e.g., `SAVE15` (15% OFF).
  - **`FLAT`**: e.g., `FLAT100` (Flat ₹100 OFF).
- **Rules & Constraints**:
  - Minimum Order Value (₹) requirement (e.g. Min Order ₹500).
  - Usage Limits (e.g. Max 100 uses).
  - Expiry Date validity.
  - Active / Inactive toggle switch.

---

## 7. Master Restaurant Settings (`/admin/settings`)

Centralized restaurant operational and financial configuration (`app_restaurant_settings`).

### 7.1 Branding & Contact Details
- Restaurant Name, Logo Image URL, Address, Phone Number, Business Hours.

### 7.2 Tax & Invoicing Rules
- **GSTIN Number**: Official 15-digit Tax Registration.
- **CGST Rate (%)**: Default 2.5%.
- **SGST Rate (%)**: Default 2.5%.
- **Service Charge (%)**: Default 5% (optional toggle on POS).
- **Liquor VAT (%)**: Applicable for Bar station items.
- **UPI VPA Address**: e.g., `restaurant@upi` (used for generating dynamic UPI QR codes).
- **Receipt Footer Message**: Custom thank-you message printed at bottom of bills.

### 7.3 KDS Operational SLA Thresholds
- **Default Prep Time**: Target preparation time estimate (mins).
- **KDS SLA Warning Threshold (Yellow)**: Time in minutes before order turns Yellow (Default: 10 mins / 75%).
- **KDS SLA Danger Threshold (Red)**: Time in minutes before order turns Red Alert (Default: 15 mins).

---

## 8. Shift & Day-Close Z-Report (`/admin/shift`)

Shift register auditing and daily counter closure (`app_shift_register`).

- **Shift Register Tracking**:
  - Opening Cash Float (e.g. ₹2,000).
  - Total Cash Collected.
  - Total UPI Collected.
  - Total Card Payments.
  - Total Discounts Given.
  - Expected System Cash.
- **Till Reconciliation & Cash Variance**:
  - Admin enters physical cash counted in drawer.
  - Calculates Variance: $\text{Physical Cash} - \text{Expected Cash}$.
  - Identifies **Cash Excess (+)** or **Shortage (-)**.
- **Day-Close Z-Report Generation**:
  - Generates immutable Z-Report summary at day end.
  - Locks settled orders and resets daily register for next shift.

---

## 9. Permissions & Security Audit Logs (`/admin/audit`)

Security auditing and Manager PIN configuration (`app_audit_logs`).

### 9.1 Immutable Audit Log Feed
- Records every critical action with timestamp, user role, action type, and details:
  - Order Checkouts (`CHECKOUT_COMPLETED`)
  - Stock Availability Toggles (`STOCK_TOGGLE`)
  - Waste Logs (`WASTE_LOG`)
  - Void Item Requests & Approvals (`VOID_APPROVED`, `VOID_REJECTED`)
  - High-Value Discounts Applied
  - Database Backups & Resets

### 9.2 Manager PIN Security System
- Configures 4-digit Manager PIN (Default: `1234` / `9999`).
- Requires Manager PIN authorization whenever a cashier attempts:
  - Discount percentage > 15%.
  - Item void or order cancellation.
  - Complimentary / Non-Chargeable (NC) bill settlement.

---

## 10. Data Backup, Restore & Reset (`/admin/data`)

Database maintenance and disaster recovery tools.

- **JSON Database Export**: 1-Click download of full database snapshot containing all 29 localStorage keys.
- **JSON Database Import / Restore**: Upload previously exported JSON backup file to restore complete system state.
- **Factory Reset**: Clears custom data and re-seeds default tables, menu items, inventory, users, and settings.

---

## 11. Table QR Code Generator (`/admin/qr`)

Customer QR self-ordering code builder.

- Generates unique QR code URLs for each table (e.g., `/customer?table=T-01`).
- **Printable Table Stand Cards**: Formatted printable stand cards featuring Table Number and QR code graphic for placing on physical restaurant dining tables.

---

*Document generated for Smart Restaurant Management System (`my-app`). Location: `my-app/document/admin document.md`.*

---

## 🚀 Version 2.0 & Multi-Tenant Updates
- **Multi-Tenant Architecture**: Support for distinct restaurant tenants using 	enantService.
- **RBAC & Security Guard**: Advanced role-based access control preventing Kitchen staff from accessing Shift/Staff pages.
- **Inventory & Kitchen Link**: Kitchen staff now have access to view and update Inventory Stock (Fresh/Low/Expired) directly.
- **Table QR Code Standee Generator**: Generate and print beautiful QR Code standees for tables with deep links to your hotel's menu.

# Smart Restaurant Management System (`my-app`) — Admin Module Full Hinglish Documentation

Is document me **Smart Restaurant Management System (`my-app`)** ke **ADMIN** module ka har ek feature, sub-page, button, metric, aur business logic pure **Hinglish** me detailed me samjhaya gaya hai.

---

## 📖 Table of Contents

1. [Admin Role Ka Overview Aur Rights](#1-admin-role-ka-overview-aur-rights)
2. [Main Admin Dashboard (`/admin`)](#2-main-admin-dashboard-admin)
3. [Staff Management, Attendance Aur Payroll (`/admin/staff`)](#3-staff-management-attendance-aur-payroll-adminstaff)
4. [Menu Catalog Aur Recipe Master (`/admin/menu`)](#4-menu-catalog-aur-recipe-master-adminmenu)
5. [Stock Inventory Aur Supplier POs (`/admin/inventory`)](#5-stock-inventory-aur-supplier-pos-admininventory)
6. [Coupons Aur Promo Rules Manager (`/admin/coupons`)](#6-coupons-aur-promo-rules-manager-admincoupons)
7. [Master Restaurant Settings (`/admin/settings`)](#7-master-restaurant-settings-adminsettings)
8. [Shift Register Aur Day-Close Z-Report (`/admin/shift`)](#8-shift-register-aur-day-close-z-report-adminshift)
9. [Permissions, Manager PIN Aur Audit Logs (`/admin/audit`)](#9-permissions-manager-pin-aur-audit-logs-adminaudit)
10. [Data Backup, Restore Aur Reset (`/admin/data`)](#10-data-backup-restore-aur-reset-admindata)
11. [Table QR Code Generator (`/admin/qr`)](#11-table-qr-code-generator-adminqr)

---

## 1. Admin Role Ka Overview Aur Rights

**`ADMIN`** role is system ka Super-User hai. Admin ke paas pooray application me har ek page, action, aur setting ka full Read & Write access hota hai.

- **Allowed Routes**: `/admin/*`, `/waiter`, `/kitchen`, `/billing`, `/reports`, `/reservations`, `/customer`, `/dashboard`.
- **RBAC Security Guard**: Admin ko chhor kar koi doosra user Admin pages open nahi kar sakta (`AuthGuard allowedRoles={["ADMIN"]}`).
- **Admin Ki Main Responsibilities**:
  - Restaurant ke branding, GST, aur UPI details set karna.
  - Staff onboarding, roles assign karna, aur login credentials generate karna.
  - Staff ki daily attendance mark karna aur automatic monthly salary/payslip banana.
  - Menu catalog, dish pricing, recipe ingredient linking, aur combos handle karna.
  - Inventory stock level track karna, low stock alerts dekhna, aur purchase orders create karna.
  - Promo coupons aur discount rules set karna.
  - Shift end par cash drawer calculate karna aur Day-Close Z-Report generate karna.
  - Manager PIN security override aur audit logs inspect karna.
  - Full system database backup (JSON) download, restore, ya reset karna.

---

## 2. Main Admin Dashboard (`/admin`)

Main Admin Dashboard restaurant owner ko live real-time business performance ka view deta hai.

### 2.1 Live KPI Summary Cards (Top Row) (`AdminKpiGrid.tsx`)
Yeh cards settled bills (`app_sales_history`) se automatically calculate hote hain:
- **Total Revenue (Gross Sales)**: Aaj ya is mahine ki total sale (taxes aur extra charges ke saath).
- **Net Sales (Net Revenue)**: Gross revenue me se total discounts minus karke bacha hua net paisa.
- **Total Orders Count**: Total kitne bills settle ho chuke hain.
- **Average Order Value (AOV)**: Ek customer ka average bill kitne ka hai ($\text{Total Revenue} / \text{Total Orders}$).
- **Busy Hours Peak**: Restaurant me sabse zyaada rush timing kab thi (jaise 8:00 PM - 10:00 PM).
- **Active Staff On-Duty**: Aaj kitne staff present hain.

### 2.2 Kitchen Low Stock SLA Monitor (`AdminLowStockSlaTracker.tsx`)
- Main dashboard ke top par Kitchen staff dwaara bheje gaye pending low stock alerts ka live monitoring panel.
- **24-Hour Procurement SLA Countdown Timer**: Alert aate hi 24 ghante ka timer start ho jata hai.
- **Overdue Alert (> 24 Hours)**: Agar 24 ghante me stock restock nahi hota, toh item ke aage bright Red **`CRITICAL LOW STOCK`** indicator highlight hone lagta hai.
- **Send Strict Reminder to Cashier**: Dedicated button jisse Admin Cashier ko instant high-priority strict warning notification bhej sakta hai.

### 2.3 5-Day Revenue Window Filter & Custom Date Analytics (`AdminSingleDayRevenueFilter.tsx`)
- Interactive date picker component jisse Admin kisi bhi date ko select karke 5-day window ka total revenue, total orders count, Average Order Value (AOV), aur payment split (Cash, UPI, Card) view aur filter kar sakta hai.
- Isme quick **"Today"** reset button hai jisse instantly aaj ke metrics par wapas aaya ja sakta hai.

### 2.4 Revenue & Sales Trend Chart (`AdminRevenueChart.tsx`)
- Graph jo pichle 7 dinon ka daily revenue trend aur order count ko side-by-side ApexCharts se visualize karta hai.

### 2.5 Payment Method Breakdown Donut (`AdminPaymentDonut.tsx`)
- Donut chart jo batata hai kitna paisa kis medium se aaya:
  - **Cash** 💵
  - **UPI / QR Code** 📱
  - **Card (POS Terminal)** 💳
  - **Split Payment** 🔀
- Isme total transaction count aur percentage split real-time dikhta hai.

### 2.6 Staff Credentials Generator Panel (`AdminStaffCredentialsPanel.tsx`)
- Quick panel jisse Admin kisi bhi role (`WAITER`, `KITCHEN`, `CASHIER`) ke liye staff list dekh sakta hai, auto-suggested Username aur random Password generate kar sakta hai, Active/Inactive toggle kar sakta hai, aur immutable audit log create hota hai.

---

## 3. Staff Management, Attendance Aur Payroll (`/admin/staff`)

Yeh module HR operations, staff login credentials, daily attendance, aur automatic monthly salary slips (payslips) ko manage karta hai.

### 3.1 Staff Account Management
- Naya staff add karna, existing staff ko edit karna, ya inactive karna.
- Fields: Staff Name,- **Role Hierarchy**: `SUPER_ADMIN` (App Owner), `HOTEL_OWNER` (Restaurant Malik), `ADMIN` (Manager), `CASHIER`, `WAITER`, `KITCHEN`, `CUSTOMER`.
- **Public City Marketplace (`/`)**: City-wise restaurant discovery, search, cuisine pills, featured cards, aur partner registration CTA.
- **SaaS Onboarding & Automated Tenant POS**: Super Admin FSSAI/GSTIN verify karke advance payment request bhejta hai (`/super-admin/requests`), payment verify hone par 1-Click Automated Tenant POS Activate kar deta hai!Phone Number, Email, Base Monthly Salary (₹), Joining Date, Status (`ACTIVE`, `INACTIVE`).

### 3.2 Attendance Calendar & Tracking (`app_staff_attendance`)
- Staff ki daily attendance mark karne ka option:
  - 🟢 **`PRESENT`**: Full day kaam kiya.
  - 🔴 **`ABSENT`**: Anupasthit (1 din ki salary kat ti hai).
  - 🟡 **`HALF_DAY`**: Half day kaam kiya (0.5 din ki salary kat ti hai).
- Monthly attendance calendar view modal (`AdminStaffAttendanceCalendarModal.tsx`) aur attendance percentage calculation.

### 3.3 Automated Payroll & Payslip Engine (`app_salary_records`)
- Automatically monthly Net Payable Salary calculate karta hai formula ke saath:
  $$\text{Net Salary} = \text{Base Salary} - \left(\text{Absence Days} \times \frac{\text{Base Salary}}{30}\right) + \text{Bonus} + \text{Overtime} - \text{Deductions}$$
- **Fixed Monthly Salary Modal (`AdminStaffSalaryModal.tsx`)**: Attendance leave days ke hisab se daily rate ($\text{Base Salary} / 30$) par exact deduction compute karta hai, bonus aur overtime add karke net salary calculate karta hai.
- **Printable Salary Slip (`AdminStaffSalaryPayslipModal.tsx`)**: Formatted itemized salary slip view jisme restaurant header, Base Pay, Attendance Deductions, Bonuses, Overtime, Net Payable Amount, Voucher ID, aur electronic signature footer dikhta hai jise 1-click me Print ya PDF download kiya ja sakta hai.

---

## 4. Menu Catalog Aur Recipe Master (`/admin/menu`)

Complete menu management, dish pricing, recipe ingredient linking, aur combos deal.

### 4.1 Menu Item Master (`app_menu`)
- Nayi dish add karna, price update karna, ya dish delete karna (`AdminMenuTable.tsx`, `AdminMenuFormModal.tsx`).
- Fields: Dish Name, Category (Starter, Main Course, Beverage, Dessert), Price (₹), Kitchen Station (`Kitchen`, `Bar`, `Bakery`), Variants (Half / Full / Large), Dietary Badges (`VEG` 🟢, `NON_VEG` 🔴, `SPICY` 🌶️), Chef Special Tag.
- **Availability Switch**: Dish ko **In Stock** ya **Out of Stock** toggle karne par Waiter POS aur Customer QR Menu me instantly update ho jata hai.

### 4.2 Recipe Ingredient Linking (`AdminRecipeEditor.tsx`)
- Recipe master me dish ke saath raw materials/ingredients ki quantity link karna.
- Example: *1 Portion Paneer Butter Masala* ke liye *200g Paneer*, *50g Butter*, *100ml Tomato Gravy*.
- **Automatic Stock Depletion**: Jaise hi Cashier bill checkout karta hai, `app_inventory` se linked ingredients ka stock automatic minus ho jata hai.

### 4.3 Happy Hour Combo Builder (`AdminComboEditor.tsx`)
- Bundled combo offers create karna (Jaise *Burger + Fries + Cold Drink Combo @ ₹249*).
- Happy hour timing set karna (Jaise 4:00 PM - 7:00 PM).

---

## 5. Stock Inventory Aur Supplier POs (`/admin/inventory`)

Real-time raw material stock control aur supplier purchase orders.

### 5.1 Stock Tracking (`app_inventory`)
- Har raw material item ko units me track karna (`kg`, `g`, `ltr`, `ml`, `pcs`, `pack`).
- Fields: Ingredient Name, Current Stock Level, Minimum Reorder Threshold, Unit Cost (₹), Last Restocked Date (`AdminInventoryTable.tsx`).

### 5.2 Minimum Stock Reorder Alerts, 24-Hour SLA Escalation & Two-Way Stock Recovery Hub
- Minimum limit se kam stock wale items par Red Warning Alert dikhta hai.
- **Kitchen Low Stock Trigger & Instant Notifications**: Kitchen Staff `Send Low Stock Alert` button click karke Cashier aur Admin ko instant notification bhejta hai: `"Urgent: [Item Name] stock is low! Please restock as soon as possible."`
- **Two-Way Closed-Loop Restocking Lifecycle**:
  - 🚨 **`ALERT_SENT`**: Kitchen alert bhejta hai $\rightarrow$ Admin Monitor aur Cashier Hub par Amber alert badge dikhta hai.
  - 🚚 **`IN_PROGRESS`**: Cashier *Mark Restock In Progress* click karta hai $\rightarrow$ Admin SLA Tracker par live status Blue **"Restock In Progress 🚚"** badge me update ho jata hai.
  - 📦 **`DISPATCHED`**: Cashier stock deliver karke *Stock Supplied* click karta hai $\rightarrow$ Admin SLA Tracker par Purple **"Stock Supplied 📦"** badge dikhta hai.
  - 🟢 **`RESTOCKED`**: Jab Kitchen *Full Stock Received* dabata hai, item automatically **`IN_STOCK`** ho jata hai aur yeh alert **Cashier Stock Recovery Hub aur Admin SLA Monitor dono me se AUTOMATICALLY REMOVE ho jata hai!**
- **24-Hour SLA Timer**: Alert bating par 24-Hour SLA timer monitor hota hai. Overdue hone par `CRITICAL LOW STOCK` red badge display hota hai.

### 5.3 Supplier Purchase Orders Manager (`AdminSupplierPoModal.tsx`)
- Low stock items ke liye formal Purchase Orders (PO) create karna.
- Supplier details, quantity, unit cost select karna, aur PO status track karna (`DRAFT`, `ORDERED`, `RECEIVED`).
- Stock receive hone par automatically inventory stock update hota hai.

### 5.4 Kitchen Wastage Auditing (`app_wastage`)
- Kitchen staff dwaara enter kiya gaya waste log (Spoiled, Burnt, Expired, Order Cancelled) Admin audit kar sakta hai.
- Wastage se hone wale kul financial nuksaan (₹) ka total dikhta hai.

---

## 6. Coupons Aur Promo Rules Manager (`/admin/coupons`)

Discount coupons aur promo code engine (`app_coupons`).

- **Coupon Types**:
  - **`PERCENTAGE`**: e.g., `SAVE15` (15% OFF).
  - **`FLAT`**: e.g., `FLAT100` (Flat ₹100 OFF).
- **Rules & Constraints**:
  - Minimum Order Amount shart (e.g. Min Order ₹500).
  - Usage Limits (e.g. Max 100 customers).
  - Expiry Date selection.
  - Active / Inactive status toggle.

---

## 7. Master Restaurant Settings (`/admin/settings`)

Restaurant ki central operational aur financial master setup (`app_restaurant_settings`).

### 7.1 Branding & Contact Details
- Restaurant Name, Logo Image URL, Address, Phone Number, Operating Hours.

### 7.2 Tax & Invoicing Rules
- **GSTIN Number**: Official 15-digit Tax Identification Number.
- **CGST Rate (%)**: Default 2.5%.
- **SGST Rate (%)**: Default 2.5%.
- **Service Charge (%)**: Default 5% (POS par optional toggle).
- **Liquor VAT (%)**: Bar items par applicable tax.
- **UPI VPA Address**: e.g., `restaurant@upi` (used for generating dynamic QR codes).
- **Receipt Footer Note**: Bill ke neeche print hone wala custom thank-you message.

### 7.3 KDS Operational SLA Thresholds
- **Default Prep Time**: Target order prep time estimate (mins).
- **KDS SLA Warning Threshold (Yellow)**: Kitne minute baad KOT order Yellow hoga (Default: 10 mins).
- **KDS SLA Danger Threshold (Red)**: Kitne minute baad KOT order Red Alert hoga (Default: 15 mins).

---

## 8. Shift Register Aur Day-Close Z-Report (`/admin/shift`)

Daily cash register close aur audit system (`app_shift_register`).

- **Shift Register Tracking**:
  - Opening Cash Float (e.g. ₹2,000).
  - Total Cash Collected.
  - Total UPI Collected.
  - Total Card Payments.
  - Total Discounts Given.
  - Expected System Cash.
- **Till Reconciliation & Variance Calculation**:
  - Admin cash drawer me gine gaye physical cash ko enter karta hai.
  - Variance calculate hota hai: $\text{Physical Cash} - \text{Expected Cash}$.
  - System batata hai cash **Excess (+)** hai ya **Shortage (-)**.
- **Day-Close Z-Report Generation**:
  - Din ke aakhir me immutable Z-Report generate karta hai.
  - Daily orders ko lock karke agle shift ke liye register reset karta hai.

---

## 9. Permissions, Manager PIN Aur Audit Logs (`/admin/audit`)

Security audit trail aur Manager PIN overrides (`app_audit_logs`).

### 9.1 Immutable Audit Log Feed
- Har ek critical action ka timestamp, user role, aur details log karta hai:
  - Order Checkouts (`CHECKOUT_COMPLETED`)
  - Stock Availability Toggles (`STOCK_TOGGLE`)
  - Kitchen Waste Logs (`WASTE_LOG`)
  - Void Item Requests & Approvals (`VOID_APPROVED`, `VOID_REJECTED`)
  - High-Value Discounts Applied (>15%)
  - System Database Backups & Resets

### 9.2 Manager PIN Security System
- 4-digit Manager PIN setup (Default PIN: `1234` ya `9999`).
- Cashier jab bhi 15% se zyaada discount lagata hai, item void karta hai, ya Non-Chargeable (NC) bill karta hai, tab Manager PIN verification popup mandatory hota hai.

---

## 10. Data Backup, Restore Aur Reset (`/admin/data`)

Database maintenance aur backup tools.

- **1-Click JSON Database Export**: Pooray system database ka ek JSON file snapshot download karta hai.
- **1-Click JSON Database Restore**: Download ki gayi JSON backup file ko upload karke purana data waapas restore karta hai.
- **Factory Database Reset**: Custom data clear karke fresh default tables, menu, users, aur settings re-seed karta hai.

---

## 11. Table QR Code Generator (`/admin/qr`)

Customer QR self-ordering system ka QR code generator.

- Har dining table ke liye unique QR code links generate karta hai (`/customer?table=T-01`).
- **Printable Table Stand Cards**: Formatted printable stand cards jise print karke restaurant ke physical dining tables par rakha ja sakta hai.

---

*Document generated for Smart Restaurant Management System (`my-app`). Location: `my-app/document/adminhinglish.md`.*







mene custer ke account se do bar bill request bheju table 1 se or table 2 se lakin ak bhi request cashier ko nahi ai like cashier ko sirf ak hi bill ki request ari he he or ha jab bhi cashier bill banaye vo print to nikanla cumplasry he lakin wast pe print bhejna option he like jese bill ki request aye vese hi vo print kare print me ager customer cashier ke pass ake bill pay karta he to cashier puche ga kaya ap apka watsp number dena chahe ge ha to us input box me number dalega or bill us ke wast pe ayaga or or print nikalna ke customer ko dena cumpalsary he or ager customer apbe dashord se reqest to bill karta he or apna number dal ke reqest to bill karta he to cashier pass us ki vo detail jayegi or jese cashier proceed are ga vo print us ke wastp pe jaygi or print bhi nikale gi 
---

## 🚀 Version 2.0 & Multi-Tenant Updates
- **Multi-Tenant Architecture**: Ab multiple hotels/restaurants support hote hain alag-alag 	enantId ke sath.
- **Security & Access (RBAC)**: Kitchen staff ko specific access diya gaya hai (Inventory & Menu) aur Shift/Staff pages se restrict kiya gaya hai.
- **Stock Tracking**: Kitchen staff directly Inventory mein "Fresh", "Low", aur "Expired" stock update kar sakte hain (e.g. kitna paneer bacha hai).
- **Table QR Standee Generator**: Admin ab asani se QR code standees generate karke print kar sakte hain jo directly customer ko menu pe le jayega.

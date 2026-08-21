# Manager Features & Architecture Documentation

## Overview
This module is strictly isolated to the **manager** role in the Smart Restaurant Management system. In accordance with the project's **Total Role Isolation** architecture, this folder contains all pages, components, hooks, and types specifically built for the manager. This prevents cross-role bugs and AI hallucinations by isolating role-specific UI and logic.

## Directory Structure
- manager_components/: Contains all React components used exclusively by this module. Files are micro-modularized and capped in size to ensure single-responsibility.
- manager_hooks/: Contains custom React hooks. All complex business logic, state management, and data transformations are extracted here, keeping the .tsx components purely as view layers.
- manager_types/: Centralized TypeScript interfaces and types for the module to prevent inline type declarations and ensure a strict Prop Blueprint.

## Core Features & Pages
The following features exist inside this module. Each contains its own page.tsx acting as a Server Component entry point, allowing future developers and AI agents to instantly identify what business logic lives where:

- **/audit**: Tracks system access, permission changes, and security logs for transparency and compliance.
- **/coupons**: Manages discount codes, promotional offers, and happy hour rules for customer billing.
- **/dashboard**: High-level analytics overview, displaying key performance indicators (KPIs) like daily revenue, top items, and live operations.
- **/data**: Data management controls, including backups, restores, and bulk exports of system records.
- **/inventory**: Stock and inventory management, tracking raw materials, low stock alerts, and supplier procurement.
- **/list-hotel**: Profile enrichment for the restaurant/hotel, managing branding, contact info, and public directory listings.
- **/menu**: Menu and item master management, covering pricing, categories, combos, and recipe specifications.
- **/onboarding**: Initial setup wizard for configuring a new restaurant/hotel on the platform.
- **/qr**: QR code generator for tables, allowing customers to scan and access digital menus or place orders.
- **/register**: Registration and sign-up flow for new tenants.
- **/reports**: Detailed financial and operational reporting, including GST/tax breakdown, sales trends, and order volumes.
- **/reservations**: Advance table booking management, tracking customer reservations, capacity planning, and walk-ins.
- **/settings**: System and restaurant settings, configuring tax rates, operational hours, receipt formats, and general preferences.
- **/shift**: Shift and day-close operations, managing cashier handovers, cash drawer reconciliation, and end-of-day summaries.
- **/staff**: Staff and employee management, handling payroll details, role assignments, and shift scheduling.
- **/staff-credentials**: Auto-generation and distribution of login credentials for newly onboarded staff members.

## Centralized Data & State Management
- **State Management**: Uses localized Zustand stores for complex async state and useState for private component UI state. Avoids prop-drilling.
- **Hardcoded Data**: All dummy data currently feeds from localStorageSeeder.ts to simulate a real Database-per-Tenant backend environment until the API is integrated. No data is hardcoded deeply inside UI components.

## Strict Architectural Rules (AI & Developer Instructions)
When making modifications to this module, the following Enterprise-Grade rules **MUST** be strictly followed:

1. **Micro-Modularization & File Size Ceilings**: Every file must contain only one React component. Files should not exceed ~250-350 lines. If a file grows too large, extract child components into their own files.
2. **Total Role Isolation**: Never import business components from other roles (e.g., do not import a table from /admin into /cashier). Duplicate and adapt components instead of sharing them to prevent cross-role bugs.
3. **Hyper-Descriptive Naming**: Ensure new components strictly adhere to the manager_[ComponentName] naming convention. The component name must exactly match the filename and end with its exact structural type (e.g. ...Modal.tsx, ...Table.tsx).
4. **Separation of Logic and UI (Custom Hooks)**: Keep heavy logic (useEffect, data fetching, complex state) isolated inside _hooks (e.g. use[ComponentName].ts). The .tsx component inside _components should purely serve as a view layer.
5. **Interface Isolation**: Do not define complex Types or Interfaces inline. All TypeScript definitions (Props, API Payloads, State Shapes) must go into the centralized _types directory. No inline string type unions.
6. **Theme Independence (No Inline Colors)**: Never use hardcoded Tailwind bracket colors (e.g., g-[#1A1A2E]). Strictly use standard Tailwind classes (e.g., g-card) mapped to CSS variables in globals.css.
7. **Server vs. Client Components**: page.tsx files should be Server Components by default to handle data fetching securely. Push "use client" directives down to the micro-modularized leaf components inside _components.
8. **Absolute Imports Only**: Do not use relative imports (like ../../). Always use absolute imports (e.g., @/app/...).
9. **Backend-Ready Centralized Data**: Extract hardcoded UI data (dropdowns, presets) into constants files so they can be easily replaced by API calls in the future.
10. **Error Boundaries & Skeleton UI**: Utilize loading.tsx for premium skeleton UIs and wrap client components with specific Error Boundaries (with retry functions) rather than full page generic crashes.

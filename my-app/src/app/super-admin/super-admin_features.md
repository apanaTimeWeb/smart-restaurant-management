# Super-Admin Features & Architecture Documentation

## Overview
This module is strictly isolated to the **super-admin** role in the Smart Restaurant Management system. In accordance with the project's **Total Role Isolation** architecture, this folder contains all pages, components, hooks, and types specifically built for the super-admin. This prevents cross-role bugs and AI hallucinations by isolating role-specific UI and logic.

## Directory Structure
- super-admin_components/: Contains all React components used exclusively by this module. Files are micro-modularized and capped in size to ensure single-responsibility.
- super-admin_hooks/: Contains custom React hooks. All complex business logic, state management, and data transformations are extracted here, keeping the .tsx components purely as view layers.
- super-admin_types/: Centralized TypeScript interfaces and types for the module to prevent inline type declarations and ensure a strict Prop Blueprint.

## Core Features & Pages
The following features exist inside this module. Each contains its own page.tsx acting as a Server Component entry point, allowing future developers and AI agents to instantly identify what business logic lives where:

- **/analytics**: Platform-wide analytics covering all registered hotels, gross transaction volumes, and subscription metrics.
- **/audit**: Tracks system access, permission changes, and security logs for transparency and compliance.
- **/backup**: Global platform data backups and disaster recovery controls.
- **/billing**: SaaS billing and invoicing for managers subscribing to the platform.
- **/dashboard**: High-level analytics overview, displaying key performance indicators (KPIs) like daily revenue, top items, and live operations.
- **/data**: Data management controls, including backups, restores, and bulk exports of system records.
- **/hotels**: Global directory of all onboarded restaurants/hotels on the platform.
- **/payments**: Global payment gateway integrations and settlement tracking.
- **/requests**: Incoming requests from potential clients or support tickets from existing owners.
- **/settings**: System and restaurant settings, configuring tax rates, operational hours, receipt formats, and general preferences.
- **/subscriptions**: SaaS subscription tier management, defining feature access based on pricing plans.
- **/users**: Global user management for platform administrators and super-admin access.

## Centralized Data & State Management
- **State Management**: Uses localized Zustand stores for complex async state and useState for private component UI state. Avoids prop-drilling.
- **Hardcoded Data**: All dummy data currently feeds from localStorageSeeder.ts to simulate a real Database-per-Tenant backend environment until the API is integrated. No data is hardcoded deeply inside UI components.

## Strict Architectural Rules (AI & Developer Instructions)
When making modifications to this module, the following Enterprise-Grade rules **MUST** be strictly followed:

1. **Micro-Modularization & File Size Ceilings**: Every file must contain only one React component. Files should not exceed ~250-350 lines. If a file grows too large, extract child components into their own files.
2. **Total Role Isolation**: Never import business components from other roles (e.g., do not import a table from /admin into /cashier). Duplicate and adapt components instead of sharing them to prevent cross-role bugs.
3. **Hyper-Descriptive Naming**: Ensure new components strictly adhere to the super-admin_[ComponentName] naming convention. The component name must exactly match the filename and end with its exact structural type (e.g. ...Modal.tsx, ...Table.tsx).
4. **Separation of Logic and UI (Custom Hooks)**: Keep heavy logic (useEffect, data fetching, complex state) isolated inside _hooks (e.g. use[ComponentName].ts). The .tsx component inside _components should purely serve as a view layer.
5. **Interface Isolation**: Do not define complex Types or Interfaces inline. All TypeScript definitions (Props, API Payloads, State Shapes) must go into the centralized _types directory. No inline string type unions.
6. **Theme Independence (No Inline Colors)**: Never use hardcoded Tailwind bracket colors (e.g., g-[#1A1A2E]). Strictly use standard Tailwind classes (e.g., g-card) mapped to CSS variables in globals.css.
7. **Server vs. Client Components**: page.tsx files should be Server Components by default to handle data fetching securely. Push "use client" directives down to the micro-modularized leaf components inside _components.
8. **Absolute Imports Only**: Do not use relative imports (like ../../). Always use absolute imports (e.g., @/app/...).
9. **Backend-Ready Centralized Data**: Extract hardcoded UI data (dropdowns, presets) into constants files so they can be easily replaced by API calls in the future.
10. **Error Boundaries & Skeleton UI**: Utilize loading.tsx for premium skeleton UIs and wrap client components with specific Error Boundaries (with retry functions) rather than full page generic crashes.

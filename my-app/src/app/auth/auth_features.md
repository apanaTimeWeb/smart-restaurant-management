# Auth Features & Architecture Documentation

## Overview
This module is strictly isolated to handle authentication and onboarding flows across all roles in the Smart Restaurant Management system. It is designed to be the central gateway, managing login, registration, and role-based redirect logic while adhering to the **Total Role Isolation** architecture.

## Directory Structure & Core Features

```
auth/
├── layout.tsx                     # Auth module layout wrapper
├── loading.tsx                    # Module loading skeleton
├── error.tsx                      # Error boundary with Retry
├── not-found.tsx                  # 404 page for auth
├── AuthErrorBoundary.tsx          # Specific error boundary for auth
├── auth_features.md               # This file
├── auth_forbidden.md              # Module anti-patterns
├── auth_theme_contract.md         # Theme CSS variables
├── auth_url_config.ts             # All routes for authentication
├── auth_components/               # UI components exclusively for this module
├── auth_constants/                # Hardcoded values, regex patterns, text strings
├── auth_hooks/                    # Custom React hooks (logic, API calls, state)
├── auth_types/                    # Centralized TypeScript interfaces/types
├── admin-signup/                  # Initial tenant/restaurant admin registration
├── customer-signup/               # Customer account creation for public hotel view
├── login/                         # Universal login portal for all roles
└── register/                      # Sub-account creation and validation
```

## Centralized Data & State Management
- **State Management**: Uses localized Zustand stores or Context API for authentication context during the login flow. Post-login, state is handled by global middleware or cookies.
- **Form State**: Relies heavily on React Hook Form and Zod for strict type-safe validation before API submission.

## Strict Architectural Rules (AI & Developer Instructions)
When making modifications to this module, the following Enterprise-Grade rules **MUST** be strictly followed:

1. **Micro-Modularization & File Size Ceilings**: Every file must contain only one React component. Files should not exceed ~250-350 lines. If a file grows too large, extract child components into their own files.
2. **Hyper-Descriptive Naming**: Ensure new components strictly adhere to the `auth_[ComponentName]` naming convention. The component name must exactly match the filename and end with its exact structural type (e.g. `...Form.tsx`, `...Button.tsx`).
3. **Separation of Logic and UI (Custom Hooks)**: Keep heavy logic (useEffect, data fetching, validation schema definitions) isolated inside `_hooks` (e.g. `use[ComponentName].ts`). The `.tsx` component inside `_components` should purely serve as a view layer.
4. **Interface Isolation**: Do not define complex Types or Interfaces inline. All TypeScript definitions (Props, API Payloads, Token Shapes) must go into the centralized `_types` directory. No inline string type unions.
5. **Theme Independence (No Inline Colors)**: Never use hardcoded Tailwind bracket colors (e.g., `bg-[#1A1A2E]`). Strictly use standard Tailwind classes (e.g., `bg-card`) mapped to CSS variables in globals.css.
6. **Server vs. Client Components**: `page.tsx` files should be Server Components by default to handle secure redirects. Push `"use client"` directives down to the micro-modularized leaf components inside `_components`.
7. **Absolute Imports Only**: Do not use relative imports (like `../../`). Always use absolute imports (e.g., `@/app/...`).
8. **Error Boundaries & Skeleton UI**: Utilize `loading.tsx` for premium skeleton UIs and wrap client components with specific Error Boundaries (with retry functions) rather than full page generic crashes.

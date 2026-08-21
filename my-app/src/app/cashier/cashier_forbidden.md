# Forbidden Patterns: CASHIER

The following practices are explicitly **STRICTLY FORBIDDEN** within the `cashier` module to maintain Enterprise-Grade Architecture:

1. **No Cross-Module Imports:** You cannot import components, hooks, or types from any other module (e.g., `@/app/admin/`). This module must remain 100% self-contained.
2. **No Inline Styling or Magic Colors:** Never use arbitrary Tailwind classes like `w-[300px]` or `bg-[#121212]`. Use the standard scale and mapped theme variables (e.g., `w-72`, `bg-card`).
3. **No "use client" on Page Roots:** The top-level `page.tsx` must remain a Server Component. Data fetching happens there; interactivity happens in imported Client Components.
4. **No UI Logic in JSX:** Do not write complex `useEffect` or multi-step state transformations directly inside `.tsx` files. Extract them to `useCashier[Feature].ts` hooks.
5. **No Inline Types:** Do not define large interfaces inside component files. Place them in `cashier_types/`.
6. **No Shared Global State for Local UI:** Do not put local UI state (like dropdown open/close) into Zustand. Use local `useState` or `useReducer`.
7. **No Hardcoded URLs:** Never hardcode route paths (e.g., `/login`). They must be imported from `cashier_url_config.ts`.
8. **No Direct `localStorage`:** Do not use `window.localStorage` directly.
9. **No `any` Types:** The `any` type is strictly banned. Use `unknown` and Zod parsing for uncertain payloads.
10. **No Console Logs:** Do not commit `console.log`.

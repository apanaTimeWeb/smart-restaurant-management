Hey, I want you to deeply analyze the @[app/(app)/[MODULE_NAME]] folder and refactor it into an Enterprise-Grade, Highly Scalable, and strictly "AI-Friendly" architecture. 

Currently, no one writes code manually; AI writes it. Because of this, my primary goal is extreme isolation. Tomorrow, if I ask an AI to fix a specific bug, I should only need to provide ONE exact file to the AI, completely eliminating the risk of the AI hallucinating and breaking other working functionalities. However, the folder architecture must remain highly organized and visually logical so that human developers can easily navigate it without getting lost in a flat directory of 50+ files.

Please follow these strict architectural rules:

1. **Micro-Modularization, Feature-Based Sub-folders & File Size Ceilings (Crucial)**: 
Break down all large or mixed files. Every file must contain only one React component and handle only one specific micro-functionality. **CRITICAL:** Do not dump all these micro-files into a single flat directory. Group them logically into cohesive sub-folders within the module. 
**IMPORTANT FOLDER NAMING:** Always prefix the main internal folders with the module name (e.g., use `[moduleName]_components/`, `[moduleName]_context/`, `[moduleName]_utils/` instead of generic names like `components/`). This ensures that when providing context to an AI (using `@`), the AI only loads the exact folder for this module, avoiding cross-module hallucinations. Inside these prefixed folders, group files logically (e.g., `[moduleName]_components/Header/`).
**File Size Ceiling:** Component files should not exceed ~250-350 lines; if a component's JSX grows beyond that, extract sub-sections into their own child component files inside the same feature folder to force real component-level granularity.
Next.js App Router uses Server Components by default, so you MUST explicitly include `"use client";` at the top of any file that uses hooks (`useState`, `useEffect`) or event listeners.

2. **Total Role Isolation (No Shared Business Components)**:
To completely eliminate the risk of cross-role AI hallucinations, there is no unified `/erp` folder. Each role gets a completely isolated root folder (e.g., `/admin`, `/manager`, `/trainer`). Business components (like `MembersTable`) must be duplicated into each role's folder (`AdminMembersTable.tsx`, `ManagerMembersTable.tsx`). Only dumb UI components (like `Button`) are shared in `src/components/ui`.

3. **Hyper-Descriptive Naming & Mandatory Module Prefix**: 
Rename all components, files, and folders to be extremely descriptive based on exactly what they do. **It does not matter if a filename becomes exceptionally long** (e.g., `AdminMembersSubscriptionRenewalForm.tsx`). Meaningfulness and convenience are the only priorities. 
- **Module Name Prefixing (CRITICAL):** Every file name (not just the containing folder) MUST begin with the module name as a prefix. Example: `AdminBillingInvoiceSearchBox.tsx`.
- **Component Name Matching:** The exported component/class/function name inside the file MUST exactly match the filename (minus extension).
- **No Abbreviations**: Never use `Btn`, `Nav`, `Utils`. Use `Button`, `Navigation`, `Utilities`.
- **Strict Suffixing**: Component names must end with their exact UI structural type (e.g., `...Modal.tsx`, `...Table.tsx`, `...Form.tsx`, `...Card.tsx`, `...Dropdown.tsx`).
- **Prop Naming**: Do not export generic `Props` or `Data` interfaces. Always prefix them (e.g., `export interface InquiriesTableProps`).

3. **Backend-Ready Centralized Data (Single Source of Truth)**: 
Find all hardcoded UI data (dropdown options, filter lists, default preset arrays, payment modes, etc.) scattered across the UI components. Extract them into feature-specific constant files alongside their components (e.g., `HeaderConstants.ts` inside the `/Header` folder) or a module-level `[ModuleName]SharedConstants.ts` for data used across multiple sub-folders.
*Why?* Because tomorrow, this hardcoded data will be replaced by a Backend API call. By keeping it all in one file today, I will only have to change one file tomorrow to integrate the API, without touching the UI components. Derive your TypeScript types directly from these central arrays.

4. **Theme Independence & Portability Contract (No Inline Colors)**: 
Remove all hardcoded Tailwind color utilities from the JSX. Map all CSS variables (e.g., `--bg-card`, `--text-primary`) in `tailwind.config.ts` as named tokens so you can use standard Tailwind classes like `bg-card` or `text-primary` **without** arbitrary bracket values. **The one canonical pattern is: define the variable in `globals.css`, map it in `tailwind.config.ts`, and use the Tailwind class name (e.g., `bg-card`) in JSX. Never use `bg-[var(--bg-card)]` or `bg-[#1A1A2E]` directly in JSX.**
- **Theme Portability Contract:** Every module must have a small `[moduleName]_theme_contract.md` or a dedicated comment listing exactly which CSS variables it depends on (e.g., `--bg-card`, `--text-primary`, `--danger`). This ensures that when copying the module into a new project, we know exactly what variables need to be defined in the new `globals.css`.

5. **Smart & Isolated State Management (The Canonical Decision Boundary)**: 
Because the components will be heavily micro-modularized, avoid creating a massive web of prop drilling. Do NOT bloat the global app state; keep the state architecture isolated to the feature.
**The Canonical Decision Boundary:**
- **React Context:** ONLY for synchronous, rarely-changing UI state (theme, sidebar open/close, locale). Never put API data or loading states in Context. You MUST implement proper memoization (`useMemo`, `useCallback`) to prevent massive re-render chains.
- **Zustand (module-scoped store):** For ALL async data (API responses), loading states, and any state shared across more than one component within a module.
- **Local `useState`:** Only for state that is strictly private to a single component and never needs to be shared.

6. **Separation of Logic and UI (Custom Hooks for Extreme Isolation)**: 
Do not mix complex React logic (`useEffect`, multi-step state calculations, data transformations) with JSX markup.
Extract all heavy logic into an adjacent custom hook file (e.g., `use[ComponentName].ts`). The actual `.tsx` file should act purely as a "View" layer that consumes the hook.
*Why?* If there is a bug in the calculation logic, you feed the AI only the `use...` file. It fixes the logic with zero risk of accidentally deleting a `<div>` or altering the UI structure.

7. **Interface & Type Isolation (The Prop Blueprint)**: 
Never define complex `Interfaces` or `Types` directly inside the component files. Extract all TypeScript definitions (Component Props, API Payloads, State Shapes) into a dedicated `[moduleName]_types.ts` file or folder.
- **No Inline String Type Unions:** Never hardcode string type unions or any values as string literals (e.g., `'idle' | 'loading' | 'success' | 'error'`) inline inside interfaces or hook declarations. Always extract these into a named type inside the module's `_constants.ts` or `_types.ts` file.

8. **Strict Server vs. Client Component Boundaries (Next.js Specific)**: 
Respect the Next.js App Router architecture. Keep top-level files like `page.tsx` or `layout.tsx` strictly as **Server Components** (no `"use client"`). Use these to fetch initial data securely. Pass this data downwards as props into your micro-modularized **Client Components**.
*Why?* It creates a clean separation of concerns. Data fetching issues are solved in the Server Component; interactivity issues are solved in the Client Component. You will never need to feed an AI both files at the same time.

9. **Leverage Next.js Native Features & Typed Error Boundaries**: 
Ensure that the module properly utilizes Next.js native routing features for a great user experience.
- **`loading.tsx` (Skeleton UI):** You MUST extract loading states into a `loading.tsx` file wherever applicable in the module's directory. Never use a generic spinning circle for a full page load. Instead, design a premium Skeleton UI that mimics the actual layout of the page (using `bg-skeleton-base` and `bg-skeleton-highlight`).
- **`error.tsx` (Error Boundaries):** Beyond the global `error.tsx`, every module must have a typed React Error Boundary component (`[ModuleName]ErrorBoundary.tsx` or a standard Next.js `error.tsx`) that wraps the module's root client component. It must display a module-specific fallback UI matching the app shell (not a generic "Something went wrong" browser error) and include a primary "Retry" button that calls `reset()`.
- **`not-found.tsx` (404 Handling):** Handle missing dynamic routes gracefully by defining a `not-found.tsx` file. It should be beautifully branded and offer a clear "Back to Dashboard" button.

10. **Absolute Imports Only (No Relative Paths)**: 
Never use relative imports (like `../../` or `./`) for importing components, contexts, utilities, or types. Always use absolute imports starting with `@/` (e.g., `@/app/(erp)/workout/workout_context/WorkoutContext`).
*Why?* This allows files to be moved around easily without breaking import paths and makes it much easier to copy-paste code snippets or have an AI generate standalone code without worrying about relative directory depth.

11. **Centralized URL Configuration (No Hardcoded URLs)**: 
Never hardcode URLs (e.g., `/api/auth/refresh`, `/login`, etc.) directly into API wrappers or React components. Each module must have exactly one centralized URL configuration file, named exactly `[moduleName]_url_config.ts` (e.g., `auth_url_config.ts`). This file must export all internal page routes and external API routes used by that module as named constants. Any file in the module or global utilities that needs to call an endpoint or navigate to a page must import the URL from this specific config file.

12. **No Hardcoded HTTP Status Codes**: 
Never hardcode numeric HTTP status codes (e.g., `401`, `500`, `200`) in API routes, proxies, or fetch wrappers. Always use standard enums/constants from libraries like `http-status-codes` (e.g., `StatusCodes.UNAUTHORIZED`). This improves code readability and prevents silly typos in status codes.

13. **Update AI-Context Documentation**: 
Once the entire refactor is complete, update the project documentation in @[[MODULE_NAME]_features.md]. This document must serve as a map for future AI sessions. Clearly document the new "Feature-Based Sub-folder" directory structure, what each file precisely does, and where the centralized data/state is kept.

14. **Backend-Driven UI Messages (No Hardcoded Toasts/Alerts)**: 
Never hardcode success or error messages (e.g., "User created successfully" or "Invalid credentials") in the frontend components, hooks, or toast notifications. The frontend must strictly display the `message` string provided by the backend's standardized JSON response envelope.

15. **Performance & Optimization Architecture**:
- **Debounce API Calls**: Any search input or filter that triggers backend API calls MUST be debounced (e.g., using a custom `useDebounce` hook or a library like `lodash.debounce`) with at least a 300ms delay.
- **Server-Side Pagination & Filtering**: Do not fetch thousands of records and paginate/filter them on the client. Always implement robust server-side pagination, sorting, and filtering.
- **Lazy Loading & Suspense**: For heavy components that are not immediately visible on initial load, use React's `lazy()` or Next.js `next/dynamic` to code-split them.
- **Strict Memoization for Contexts**: If using Context, ensure Provider values are strictly memoized using `useMemo` and `useCallback`.
- **Pessimistic UI Updates (Cache Mutation)**: This applies universally to ALL mutations. Do NOT trigger a full page refresh after mutating data. Await the successful response, then manually mutate the Zustand store. **Strict Pessimistic UI for Financial/Destructive Actions:** For any action involving money or irreversible operations (delete, suspend), the submit button MUST transition to a disabled loading state. The UI must only mutate the store after `2xx` confirmation. Optimistic updates are completely forbidden for these actions.

16. **Robust Form Handling & Validation**:
For any forms with more than two inputs, strictly avoid using individual `useState` hooks. Use a robust form management library (like **React Hook Form**) paired with a schema validation library (like **Zod**). Define the validation schema in your `_types` or `_utils` folder.

17. **Centralized API Error Interception**:
Never handle generic global errors (like `401 Unauthorized` or `500 Server Errors`) inside individual UI components. Implement a centralized API wrapper or interceptor (in your `api.ts`) that catches these global status codes, triggers a global toast/redirect, and smoothly refreshes tokens.

18. **Enterprise Accessibility (a11y)**:
Ensure UI components are accessible. Use semantic HTML, include `aria-label` tags for icon-only buttons, and ensure modals and dropdowns can be navigated via keyboard (Tab trapping, Esc to close).

19. **Interactive Data Tables (Clickable Rows)**:
Whenever displaying a list of entities in a table, the entire row MUST be clickable. Add `cursor-pointer` to the `<tr>` element. Remove redundant "View/Eye" buttons. Action buttons (Edit, Delete) must have `e.stopPropagation()`.

20. **Searchable Dropdowns for Large Datasets**:
Whenever presenting a dropdown for a large dataset, you MUST NOT use a native HTML `<select>` element. You must implement a custom popover/dropdown component that includes a search `<input>` field at the top.

21. **Real-Time Communication (In-House WebSocket Architecture)**:
For any real-time in-app communication, the project strictly uses an in-house WebSocket architecture (using `socket.io-client`). Do NOT rely on long-polling, SSE, or external managed services like Pusher/Supabase.

22. **Tenant Context & Centralized Headers (Multi-Tenancy)**:
The backend utilizes a strict Database-per-Tenant architecture. The frontend MUST NOT rely on components to manually send tenant info. A centralized API fetch wrapper must automatically intercept and inject `x-tenant-id`.

23. **Password Visibility Toggle**:
Whenever there is a password input field, you MUST include an eye icon (visibility toggle) to switch between `password` and `text`. Use standard icons from lucide-react.

24. **Date & Time Standardization (Timezone Safety)**:
Frontend UI components must never send raw `new Date()` objects. The backend must receive dates in **UTC (ISO 8601 format)**. When displaying, convert UTC strings to local time using `date-fns` or `dayjs`.

25. **Role-Based UI Hiding (RBAC)**:
Never rely solely on the backend to block unauthorized actions while leaving the action button visible. The frontend must implement a centralized `usePermissions()` hook. Destructive/restricted UI elements MUST be completely hidden or safely disabled.

26. **Skeleton Loaders over Generic Spinners**:
When fetching complex layout data or lists, implement **Skeleton Loaders** (using Tailwind's `animate-pulse` or a library) that mimic the shape of incoming data instead of full-page spinning circles.

27. **Strict TypeScript (No `any` Rule)**:
The use of the `any` type is strictly forbidden. If a payload is unknown, use the `unknown` type and assert/validate safely via Zod. (Mechanically enforced via ESLint, see Rule 65).

28. **Icon-Driven Action Columns**:
Whenever displaying action buttons in data tables/lists, prioritize using semantic icons (e.g., from `lucide-react`) instead of bulky text labels. Include descriptive tooltips and `aria-label`s.

29. **Multi-Medium Sending Selection (Radio Buttons)**:
Whenever the user performs an action that sends a proof/document, present an option to choose between mediums (e.g., WhatsApp vs. Email) using Radio Buttons. Do NOT use checkboxes if only one is to be selected.

30. **Mandatory Table Controls (Pagination, Sorting, & Filtering)**:
Whenever displaying tabular data, you MUST always implement pagination, column sorting, and relevant filtering directly above the table.

31. **Modularized API Clients (No Centralized API Blob)**:
Do not define module-specific API routes in a giant global file. Every module MUST have its own API file inside a dedicated folder (e.g., `[moduleName]_api/[moduleName]_api.ts`) importing the core base fetcher.

32. **The "No Barrel File" Rule (Avoid `index.ts`)**:
Strictly avoid using `index.ts` or `index.js` files to re-export modules. Always import directly from the explicitly named file to prevent circular dependencies.

33. **Framework-Specific Media Optimization**:
Never use standard HTML `<img>` tags for remote or static assets. Strictly mandate Next.js `<Image>` component (`next/image`).

34. **Environment Variable Segregation & Security**:
Strictly segregate public and private environment variables. Prefix public variables with `NEXT_PUBLIC_`. Never leak secret keys.

35. **Strict Prohibition of Magic Strings & Numbers**:
Never use raw strings or numbers directly in logic/UI. All magic values must be defined as TypeScript `enums` or `const` objects. (Mechanically enforced via ESLint, see Rule 65).

36. **No Arbitrary Tailwind Values (Strict Design System)**:
Never use arbitrary, hardcoded pixel/hex values in Tailwind (e.g., `w-[325px]`). Adhere to standard framework scales (e.g., `w-80`). (Mechanically enforced via ESLint, see Rule 65).

37. **JSDoc for Complex Logic (AI Context Enhancer)**:
Every custom hook, utility function, and complex data transformation MUST be prefixed with a short, descriptive JSDoc block detailing its intent.

38. **Strict Component Responsibility Contract**:
Every component file must have a single-line comment at the very top declaring its exact responsibility:
`// RESPONSIBILITY: Renders the read-only member profile header. Receives data via props. No API calls.`

39. **Explicit Data Flow Direction Comments**:
In every Context file and custom hook, document the data flow direction at the top:
`// DATA FLOW: API → useMembersTable.ts → MembersContext → MembersTable`

40. **Forbidden Patterns File (`[moduleName]_forbidden.md`)**:
Every module must have a tiny markdown file listing what is explicitly NOT allowed in that module.

41. **[Merged with Rule 15]**

42. **URL as State for Shareable Views**:
Any filterable, searchable, or paginated list page MUST sync its state to the URL as query parameters using `useSearchParams` / `useRouter`.

43. **[Merged with Rule 9]**

44. **Network State Enum (No Boolean `isLoading` Flags)**:
Never use multiple boolean flags for async state. Use a single typed enum defined in `_types.ts`: `type FetchState = 'idle' | 'loading' | 'success' | 'error'`.

45. **Sensitive Data Masking in UI**:
Any field displaying sensitive data must be masked by default in list views (e.g., `98****2310`). Use a dedicated `maskSensitiveData()` utility.

46. **No `console.log` in Production**:
All `console.log` calls are strictly forbidden in committed code. Use a centralized logger utility (`src/lib/logger.ts`). (Mechanically enforced via ESLint, see Rule 65).

47. **Co-located Test Files**:
Every custom hook and utility function must have a co-located test file (`use[X].test.ts`).

48. **Unsaved Changes Warning**:
Any modified form/modal must intercept `beforeunload` to warn the user: "You have unsaved changes."

49. **Copy-to-Clipboard on Sensitive IDs**:
Any field displaying a unique ID/tracking code must have a small copy icon next to it.

50. **Consistent Empty State per Entity**:
Every list/table must have a dedicated empty state component (`[Module]EmptyState.tsx`) with an icon, message, and CTA.

51. **Strict Import Order Convention**:
Enforce a strict order using ESLint `import/order`: React core, Third-party, Absolute internal (`@/lib`), Module-specific (`@/app/(erp)/...`), Types-only.

52. **Prop Spreading is Forbidden (`...props` ban)**:
Never write `<Component {...props} />`. All props must be explicitly named, except for primitive HTML wrappers.

53. **Conditional Rendering Pattern (No Inline Ternary Hell)**:
Deeply nested ternaries are forbidden. For 3+ conditions, use an early return pattern or `renderContent()` helper.

54. **Event Handler Naming Convention**:
Props must use the `on` prefix (`onSubmit`), internal handlers use `handle` prefix (`handleSubmit`).

55. **`useEffect` Dependency Array Audit Comment**:
Every `useEffect` must have a comment above explaining EXACTLY why those variables are in the dependency array.

56. **Global Shared Components Strict Scope**:
`src/components/ui/` is ONLY for generic, zero-business-logic primitives. Global components must NEVER contain module-specific API calls.

57. **`key` Prop Rules for Lists**:
Using `key={index}` is strictly forbidden for lists that can reorder/filter. Always use stable unique backend IDs.

58. **[Merged with Rule 5]**

59. **`next/font` for Font Loading**:
Never use Google Fonts CDN (`@import`). Always use `next/font/google`.

60. **Strict `tsconfig.json` Enforcement**:
Run with `strict: true`. No `@ts-ignore` or `@ts-nocheck`. (Mechanically enforced via pre-commit, see Rule 65).

61. **No Direct `localStorage` in Components**:
Never call `window.localStorage` directly inside a React component. Use a `useLocalStorage` hook.

62. **Standardized `ApiResponse<T>` Generic (The API Contract)**:
Every API call must be typed using a global `ApiResponse<T>` generic interface that perfectly matches the backend response envelope (Backend Rule 28). Both Success and Error responses must share this exact canonical shape:
`{ success: boolean, message: string, data: T | null, meta?: PaginationMeta, error?: string, statusCode?: number }`

63. **No Direct `router.push('/login')` in Components**:
Handle unauthenticated redirects centrally in `middleware.ts` or an API interceptor.

64. **[Merged with Rule 7]**

65. **Enforced Tooling Gates (Mechanical Blocking)**:
Rules against arbitrary Tailwind (Rule 36), `any` types (Rule 27), `console.log` (Rule 46), magic strings (Rule 35), and TS ignores (Rule 60) are not just "trust-based suggestions". 
You MUST implement **ESLint plugins** (`eslint-plugin-tailwindcss`, `@typescript-eslint/no-explicit-any`, `no-console`) and a **pre-commit hook** (`husky` + `lint-staged`) that runs `tsc --noEmit`, linters, and tests before any commit. These rules must be physically blocked by tooling to ensure extreme safety in an AI-driven codebase.

66. **Dependency-Addition Guardrail**:
AI agents frequently install redundant packages. **An AI cannot add a new dependency without checking `package.json` first.** Before adding a new library, you must explicitly flag why an existing approved library (e.g., React Hook Form, Zod, date-fns, Zustand, socket.io-client, lucide-react) does not suffice for the task.

67. **Zero Cross-Module Imports & Full Self-Containment (The Portable Folder Rule)**:
- **Zero Cross-Module Imports:** Module A (e.g., `billing`) is explicitly FORBIDDEN from importing anything from Module B (e.g., `attendance`) — no components, no hooks, no types, no constants. This must be mechanically enforced using ESLint (`no-restricted-imports` or `eslint-plugin-boundaries`).
- **Full Self-Containment:** Every feature module must be a completely self-contained unit. It may depend ONLY on: (a) npm packages, (b) generic zero-business-logic primitives from `src/components/ui/`, and (c) its own internal files. This guarantees the entire module folder can be deleted, copied, and pasted into a different project with zero broken imports.

68. **Strict Mobile-First Enforcement (Tailwind is not magic)**:
Tailwind does not automatically make things responsive. Every component must be built **mobile-first**: base Tailwind classes must target mobile (`<768px`), then overridden with `md:` (tablet) and `lg:/xl:` (desktop) prefixes as needed.
- No component is considered complete unless explicitly checked at all three breakpoints (375px, 768px, 1280px+). 
- Specific Mobile Patterns: KPI card rows must switch to horizontal scrolling or a 2-column grid on mobile. Charts must have reduced height and simplified/collapsed legends on mobile.

---
Think step-by-step. Create a detailed implementation plan first so I can review it, and then execute it perfectly without breaking existing data flows!

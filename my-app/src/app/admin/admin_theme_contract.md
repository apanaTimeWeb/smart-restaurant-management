# Theme Portability Contract: ADMIN

This module is designed to be completely portable and theme-independent.

## Required CSS Variables
To use this module in any other project, the following CSS variables MUST be defined in the root `globals.css` file:

- `--primary`: Main brand color (used for primary buttons, active nav items)
- `--primary-hover`: Hover state for primary buttons
- `--primary-subtle`: Soft background for active items
- `--bg-page`: Main application background
- `--bg-card`: Background for cards, panels, and tables
- `--bg-sidebar`: Background for the sidebar navigation
- `--bg-header`: Background for the top header
- `--bg-input`: Background for input fields
- `--border`: Default border color
- `--border-focus`: Border color for focused inputs
- `--text-primary`: Main text color
- `--text-secondary`: Muted text color for labels/captions
- `--text-disabled`: Disabled text color
- `--skeleton-base`: Base color for loading skeletons
- `--skeleton-highlight`: Highlight color for loading skeletons
- `--success`: Success status color
- `--warning`: Warning status color
- `--danger`: Danger/Error status color
- `--info`: Info status color

**CRITICAL RULE:** Never use hardcoded Tailwind color strings (e.g., `bg-blue-500`, `text-[#1A1A2E]`) inside this module's components. Always use the mapped Tailwind classes (e.g., `bg-card`, `text-primary`) that correspond to the CSS variables above.

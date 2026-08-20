# OwnerReservations Module Forbidden Patterns (Rule 40)

- NO relative imports (../ or ./). Always use @/app/hotel-owner/reservations/...
- NO ny types.
- NO hardcoded colors in JSX. Use Tailwind tokens.
- NO barrel re-exports (index.ts).
- NO direct cross-module imports.

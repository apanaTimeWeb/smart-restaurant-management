// RESPONSIBILITY: Single source of truth for ALL number, currency, date, and
// time formatting across the entire app. No component, hook, or utility may
// call .toLocaleString(), new Intl.*, or hardcode format strings directly.
// DATA FLOW: raw number/timestamp → formatters.ts function → display string → UI component
// Mainprompt Rule 21: Indian Numbering System (₹1,23,456.00), compact KPI format (₹12.4L).

// ─── Formatting Constants (Rule 35: No magic strings) ────────────────────────

const LOCALE_IN = "en-IN" as const;
const CURRENCY_INR = "INR" as const;
const CURRENCY_SYMBOL = "₹" as const;

const THOUSAND = 1_000 as const;
const LAKH = 100_000 as const;
const CRORE = 10_000_000 as const;

const MS_PER_MINUTE = 60_000 as const;
const MS_PER_HOUR = 3_600_000 as const;
const MS_PER_DAY = 86_400_000 as const;

const LABEL_JUST_NOW = "Just now" as const;
const LABEL_MIN_AGO = "min ago" as const;
const LABEL_HR_AGO = "hr ago" as const;
const LABEL_YESTERDAY = "Yesterday" as const;

// ─── Singleton Formatters (instantiated once, reused — Rule 3: no duplication) ─

const INR_FORMATTER = new Intl.NumberFormat(LOCALE_IN, {
  style: "currency",
  currency: CURRENCY_INR,
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const DATE_FORMATTER = new Intl.DateTimeFormat(LOCALE_IN, {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

const TIME_FORMATTER = new Intl.DateTimeFormat(LOCALE_IN, {
  hour: "2-digit",
  minute: "2-digit",
  hour12: true,
});

const DATETIME_FORMATTER = new Intl.DateTimeFormat(LOCALE_IN, {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hour12: true,
});

// ─── Currency Formatters ──────────────────────────────────────────────────────

/**
 * Formats a number as Indian Rupee currency using the Indian Numbering System.
 * Use for invoice totals, billing amounts, and precise financial values.
 *
 * @param amount - The numeric value to format (e.g. 123456)
 * @returns Formatted string e.g. "₹1,23,456.00"
 *
 * @example
 * formatCurrency(123456)  // "₹1,23,456.00"
 * formatCurrency(0)       // "₹0.00"
 * formatCurrency(1500.5)  // "₹1,500.50"
 */
export function formatCurrency(amount: number): string {
  return INR_FORMATTER.format(amount);
}

/**
 * Formats a number as compact Indian currency shorthand for KPI dashboard cards.
 * Thresholds: <1K → plain, 1K–99K → K, 1L–99L → L, 1Cr+ → Cr.
 *
 * @param amount - The numeric value to compact-format (e.g. 1240000)
 * @returns Compact string e.g. "₹12.4L", "₹2.3Cr", "₹12.4K", "₹850"
 *
 * @example
 * formatCurrencyCompact(850)        // "₹850"
 * formatCurrencyCompact(12400)      // "₹12.4K"
 * formatCurrencyCompact(1240000)    // "₹12.4L"
 * formatCurrencyCompact(23000000)   // "₹2.3Cr"
 */
export function formatCurrencyCompact(amount: number): string {
  if (amount >= CRORE) {
    return `${CURRENCY_SYMBOL}${(amount / CRORE).toFixed(1)}Cr`;
  }
  if (amount >= LAKH) {
    return `${CURRENCY_SYMBOL}${(amount / LAKH).toFixed(1)}L`;
  }
  if (amount >= THOUSAND) {
    return `${CURRENCY_SYMBOL}${(amount / THOUSAND).toFixed(1)}K`;
  }
  return `${CURRENCY_SYMBOL}${amount}`;
}

// ─── Number Formatters ────────────────────────────────────────────────────────

/**
 * Formats a decimal number as a percentage string.
 * Use for discount rates, tax percentages, and trend indicators.
 *
 * @param value - The raw decimal value (e.g. 12.456)
 * @param decimals - Number of decimal places to show. Defaults to 1.
 * @returns Formatted percentage string e.g. "12.5%"
 *
 * @example
 * formatPercent(12.456)     // "12.5%"
 * formatPercent(100)        // "100.0%"
 * formatPercent(5.678, 2)   // "5.68%"
 */
export function formatPercent(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`;
}

// ─── Date & Time Formatters ───────────────────────────────────────────────────

/**
 * Formats a Unix millisecond timestamp as a short Indian date string.
 * Use for reservation slots, expiry dates, and report headers.
 *
 * @param timestamp - Unix timestamp in milliseconds (e.g. Date.now())
 * @returns Formatted date string e.g. "25 Jul 2025"
 *
 * @example
 * formatDate(1753401600000)  // "25 Jul 2025"
 */
export function formatDate(timestamp: number): string {
  return DATE_FORMATTER.format(new Date(timestamp));
}

/**
 * Formats a Unix millisecond timestamp as a 12-hour time string.
 * Use for shift open/close times and order timestamps.
 *
 * @param timestamp - Unix timestamp in milliseconds
 * @returns Formatted time string e.g. "07:45 PM"
 *
 * @example
 * formatTime(1753401600000)  // "07:45 PM"
 */
export function formatTime(timestamp: number): string {
  return TIME_FORMATTER.format(new Date(timestamp));
}

/**
 * Formats a Unix millisecond timestamp as a combined date and time string.
 * Use for audit log entries and sales history records.
 *
 * @param timestamp - Unix timestamp in milliseconds
 * @returns Formatted datetime string e.g. "25 Jul 2025, 07:45 PM"
 *
 * @example
 * formatDateTime(1753401600000)  // "25 Jul 2025, 07:45 PM"
 */
export function formatDateTime(timestamp: number): string {
  return DATETIME_FORMATTER.format(new Date(timestamp));
}

/**
 * Formats a Unix millisecond timestamp as a human-readable relative time string.
 * Falls back to formatDate() for timestamps older than 1 day.
 * Use for KOT card timestamps, audit log entries, and order age indicators.
 *
 * @param timestamp - Unix timestamp in milliseconds
 * @returns Relative string e.g. "Just now", "2 min ago", "1 hr ago", "Yesterday", "25 Jul 2025"
 *
 * @example
 * formatRelativeTime(Date.now() - 30000)     // "Just now"
 * formatRelativeTime(Date.now() - 120000)    // "2 min ago"
 * formatRelativeTime(Date.now() - 3700000)   // "1 hr ago"
 * formatRelativeTime(Date.now() - 90000000)  // "Yesterday"
 */
export function formatRelativeTime(timestamp: number): string {
  const diffMs = Date.now() - timestamp;
  const diffMins = Math.floor(diffMs / MS_PER_MINUTE);
  const diffHrs = Math.floor(diffMs / MS_PER_HOUR);
  const diffDays = Math.floor(diffMs / MS_PER_DAY);

  if (diffMins < 1) return LABEL_JUST_NOW;
  if (diffMins < 60) return `${diffMins} ${LABEL_MIN_AGO}`;
  if (diffHrs < 24) return `${diffHrs} ${LABEL_HR_AGO}`;
  if (diffDays === 1) return LABEL_YESTERDAY;
  return formatDate(timestamp);
}

"use client";

/**
 * Simple utility to merge class names.
 * Filters out falsy values and joins the rest with spaces.
 * This mirrors the typical `cn` utility found in many Shadcn UI setups.
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

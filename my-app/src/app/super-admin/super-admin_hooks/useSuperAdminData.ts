"use client";

// RESPONSIBILITY: All data safety logic for the SuperAdmin module.
// exportBackup — serializes all 12 localStorage keys to a JSON file download.
// importRestore — reads a JSON file and writes all keys back to localStorage.
// emergencyReset — verifies SuperAdmin PIN, clears localStorage, re-seeds defaults.
// getStorageUsage — estimates bytes used across all keys vs 5MB limit.
// No JSX — pure logic hook consumed by admin/data/page.tsx.
// DATA FLOW: localStorage → useSuperAdminData → SuperAdminDataPanel → UI

import { useState, useCallback, useMemo } from "react";
import { STORAGE_KEYS, initializeLocalStorageSeeds } from "@/lib/localStorageSeeder";
import type { UseSuperAdminDataReturn, SuperAdminStorageUsage } from "@/app/super-admin/super-admin_types/SuperAdminTypes";

// ─── Constants (Rule 35: No magic strings / numbers) ─────────────────────────

const STORAGE_LIMIT_KB  = 5_120  as const; // 5MB in KB
const ADMIN_PIN         = "1234" as const; // placeholder — no auth module yet
const BACKUP_FILENAME   = "smart-pos-backup.json" as const;
const BACKUP_MIME_TYPE  = "application/json"       as const;

// All 12 keys to include in backup / restore
const ALL_KEYS = Object.values(STORAGE_KEYS) as string[];

// ─── Pure Helpers ─────────────────────────────────────────────────────────────

/**
 * Reads all 12 localStorage keys and returns them as a plain object.
 * Values are parsed from JSON strings back to their original types.
 */
function readAllKeys(): Record<string, unknown> {
  const snapshot: Record<string, unknown> = {};
  for (const key of ALL_KEYS) {
    const raw = window.localStorage.getItem(key);
    if (raw !== null) {
      try {
        snapshot[key] = JSON.parse(raw);
      } catch {
        snapshot[key] = raw;
      }
    }
  }
  return snapshot;
}

/**
 * Estimates total localStorage usage in KB across all 12 keys.
 * Uses byte length of JSON strings as approximation.
 */
function estimateUsageKb(): number {
  let totalBytes = 0;
  for (const key of ALL_KEYS) {
    const raw = window.localStorage.getItem(key);
    if (raw) totalBytes += key.length + raw.length;
  }
  return Math.round(totalBytes / 1024);
}

/**
 * Triggers a browser file download with the given JSON content.
 *
 * @param content  - JSON string to download
 * @param filename - Suggested filename for the download
 */
function triggerDownload(content: string, filename: string): void {
  const blob = new Blob([content], { type: BACKUP_MIME_TYPE });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href     = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * Manages all data safety operations: backup export, restore import,
 * emergency reset, and storage usage monitoring.
 *
 * @returns storageUsage, loading flags, exportBackup, importRestore, emergencyReset
 */
export function useSuperAdminData(): UseSuperAdminDataReturn {
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [isImporting, setIsImporting] = useState<boolean>(false);
  const [isResetting, setIsResetting] = useState<boolean>(false);

  // Live storage usage — recalculated on each render (cheap string scan)
  // Deps: none — reads directly from localStorage on each call
  const storageUsage = useMemo((): SuperAdminStorageUsage => {
    if (typeof window === "undefined") {
      return { usedKb: 0, limitKb: STORAGE_LIMIT_KB, usagePercent: 0 };
    }
    const usedKb       = estimateUsageKb();
    const usagePercent = Math.min(100, Math.round((usedKb / STORAGE_LIMIT_KB) * 100));
    return { usedKb, limitKb: STORAGE_LIMIT_KB, usagePercent };
  }, []);

  /**
   * Serializes all 12 localStorage keys to a timestamped JSON file
   * and triggers a browser download.
   */
  const exportBackup = useCallback(() => {
    setIsExporting(true);
    const snapshot  = readAllKeys();
    const payload   = JSON.stringify({ exportedAt: Date.now(), data: snapshot }, null, 2);
    const timestamp = new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"
    triggerDownload(payload, `smart-pos-backup-${timestamp}.json`);
    setIsExporting(false);
  }, []);

  /**
   * Reads a JSON backup file and restores all keys to localStorage.
   * Only writes keys that exist in STORAGE_KEYS — ignores unknown keys.
   *
   * @param file - The .json backup file selected by the user
   */
  const importRestore = useCallback(async (file: File): Promise<void> => {
    setIsImporting(true);
    return new Promise<void>((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const text    = e.target?.result as string;
          const parsed  = JSON.parse(text) as { data?: Record<string, unknown> };
          const data    = parsed.data ?? (parsed as Record<string, unknown>);

          for (const key of ALL_KEYS) {
            if (Object.prototype.hasOwnProperty.call(data, key)) {
              window.localStorage.setItem(key, JSON.stringify(data[key]));
            }
          }
        } catch {
          // Silent fail — invalid JSON file, no data written
        }
        setIsImporting(false);
        resolve();
      };
      reader.readAsText(file);
    });
  }, []);

  /**
   * Verifies the SuperAdmin PIN, clears all localStorage data, and re-seeds defaults.
   * Returns true on success, false if PIN is wrong.
   *
   * @param pin - 4-digit SuperAdmin PIN entered by user
   */
  const emergencyReset = useCallback((pin: string): boolean => {
    if (pin !== ADMIN_PIN) return false;

    setIsResetting(true);
    window.localStorage.clear();
    initializeLocalStorageSeeds();
    setIsResetting(false);

    // Force full page reload so all hooks re-read fresh seed data
    window.location.reload();
    return true;
  }, []);

  return {
    storageUsage,
    isExporting,
    isImporting,
    isResetting,
    exportBackup,
    importRestore,
    emergencyReset,
  };
}

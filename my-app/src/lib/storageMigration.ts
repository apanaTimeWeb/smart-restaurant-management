// RESPONSIBILITY: Data migration utility for legacy localStorage payloads.
// Ensures backward compatibility when new schema fields or statuses are introduced.
// DATA FLOW: initializeLocalStorageSeeds() -> runStorageMigrations() -> localStorage

import { STORAGE_KEYS } from "@/lib/localStorageSeeder";
import type { AppMenuItem, AppTable } from "@/types/appTypes";

const CURRENT_STORAGE_VERSION = 2;

export interface StorageMeta {
  version: number;
  lastMigratedAt: number;
}

/**
 * Checks localStorage schema version and applies non-destructive field migrations.
 */
export function runStorageMigrations(): void {
  if (typeof window === "undefined") return;

  try {
    const rawMeta = window.localStorage.getItem(STORAGE_KEYS.STORAGE_META);
    const meta: StorageMeta = rawMeta
      ? (JSON.parse(rawMeta) as StorageMeta)
      : { version: 1, lastMigratedAt: 0 };

    if (meta.version < 2) {
      // 1. Migrate Menu Items (Ensure dietaryTags and modifiers arrays exist)
      const rawMenu = window.localStorage.getItem(STORAGE_KEYS.MENU);
      if (rawMenu) {
        const menu = JSON.parse(rawMenu) as AppMenuItem[];
        const updatedMenu = menu.map((item) => ({
          ...item,
          dietaryTags: item.dietaryTags || (item.name.toLowerCase().includes("chicken") ? ["NON_VEG"] : ["VEG"]),
          modifiers: item.modifiers || [],
        }));
        window.localStorage.setItem(STORAGE_KEYS.MENU, JSON.stringify(updatedMenu));
      }

      // 2. Migrate Tables (Ensure mergedTables array exists)
      const rawTables = window.localStorage.getItem(STORAGE_KEYS.TABLES);
      if (rawTables) {
        const tables = JSON.parse(rawTables) as AppTable[];
        const updatedTables = tables.map((tbl) => ({
          ...tbl,
          mergedTables: tbl.mergedTables || [],
        }));
        window.localStorage.setItem(STORAGE_KEYS.TABLES, JSON.stringify(updatedTables));
      }

      // Update meta version
      const newMeta: StorageMeta = {
        version: CURRENT_STORAGE_VERSION,
        lastMigratedAt: Date.now(),
      };
      window.localStorage.setItem(STORAGE_KEYS.STORAGE_META, JSON.stringify(newMeta));
    }
  } catch (err) {
    console.error("Storage migration failed safely:", err);
  }
}

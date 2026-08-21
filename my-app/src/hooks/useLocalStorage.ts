
"use client";

import { useState, useEffect, useCallback, useRef } from "react";

const MASTER_DB_KEY = "smart_pos_master_db";

const GLOBAL_STORAGE_KEYS = [
  "app_users",
  "app_saas_tenants",
  "app_current_user",
  "active_tenant_id",
  "app_advance_reservations"
];

function getActiveTenantId() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem("active_tenant_id");
}

function getMasterDB() {
  if (typeof window === "undefined") return { tenants_data: {} };
  try {
    const raw = window.localStorage.getItem(MASTER_DB_KEY);
    return raw ? JSON.parse(raw) : { tenants_data: {} };
  } catch {
    return { tenants_data: {} };
  }
}

function saveMasterDB(db: any) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(MASTER_DB_KEY, JSON.stringify(db));
  // Dispatch custom event so other components in the SAME tab know master DB changed
  window.dispatchEvent(new CustomEvent("master_db_updated"));
}

export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void, () => void] {

  const initialValueRef = useRef(initialValue);

  useEffect(() => {
    initialValueRef.current = initialValue;
  }, [initialValue]);

  // Read function
  const readValue = useCallback((): T => {
    if (typeof window === "undefined") return initialValueRef.current;
    
    // Global keys bypass the master DB
    if (GLOBAL_STORAGE_KEYS.includes(key)) {
      try {
        const item = window.localStorage.getItem(key);
        return item ? (JSON.parse(item) as T) : initialValueRef.current;
      } catch { return initialValueRef.current; }
    }

    const tid = getActiveTenantId();
    if (!tid || tid === "SUPER_ADMIN") {
      // Fallback: If no tenant, return empty or global seeded data
      // For seamless transition, if no tenant, we fallback to flat keys (seeded data)
      try {
        const item = window.localStorage.getItem(key);
        return item ? (JSON.parse(item) as T) : initialValueRef.current;
      } catch { return initialValueRef.current; }
    }

    const db = getMasterDB();
    const existingData = db.tenants_data && db.tenants_data[tid] ? db.tenants_data[tid][key] : undefined;
    
    // Check if existing data is "empty" (like [] or {})
    const isEmpty = existingData === undefined || 
                    (Array.isArray(existingData) && existingData.length === 0) || 
                    (existingData !== null && typeof existingData === "object" && Object.keys(existingData).length === 0);

    if (!isEmpty) {
      return existingData as T;
    }
    
    // Migration: If tenant data for this key is missing or empty in master DB
    try {
      // 1. Check if they had an old scoped key (app_menu_T123) from previous version
      const oldScopedItem = window.localStorage.getItem(`${key}_${tid}`);
      if (oldScopedItem) {
         const legacyData = JSON.parse(oldScopedItem);
         if (Array.isArray(legacyData) && legacyData.length > 0) {
           if (!db.tenants_data[tid]) db.tenants_data[tid] = {};
           db.tenants_data[tid][key] = legacyData;
           setTimeout(() => saveMasterDB(db), 0);
           return legacyData as T;
         }
      }
      
      // 2. Fallback: migrate from the global flat seeded keys to the active tenant
      const item = window.localStorage.getItem(key);
      if (item) {
         const legacyData = JSON.parse(item);
         // If we're fallback migrating, only save if it actually has items (don't overwrite with empty)
         if ((Array.isArray(legacyData) && legacyData.length > 0) || (legacyData && !Array.isArray(legacyData) && Object.keys(legacyData).length > 0)) {
           if (!db.tenants_data[tid]) db.tenants_data[tid] = {};
           db.tenants_data[tid][key] = legacyData;
           setTimeout(() => saveMasterDB(db), 0);
           return legacyData as T;
         }
      }
    } catch {}

    // If still empty or no fallback, return the existing empty data or initialize it
    if (existingData !== undefined) return existingData as T;

    // If it doesn't exist, we save the initial empty value so the owner appears in the JSON!
    if (tid && tid !== "SUPER_ADMIN") {
      if (!db.tenants_data) db.tenants_data = {};
      if (!db.tenants_data[tid]) db.tenants_data[tid] = {};
      db.tenants_data[tid][key] = initialValueRef.current;
      setTimeout(() => saveMasterDB(db), 0);
    }
    return initialValueRef.current;
  }, [key]);

  const [storedValue, setStoredValue] = useState<T>(readValue);

  // Sync state if external changes happen
  useEffect(() => {
    setStoredValue(readValue());
  }, [readValue]);

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      if (typeof window === "undefined") return;

      try {
        setStoredValue((prev) => {
          const resolved = value instanceof Function ? value(prev) : value;
          
          // CRITICAL: Bail out if state didn't actually change to prevent infinite loops!
          if (prev === resolved) return prev;
          
          setTimeout(() => {
            if (GLOBAL_STORAGE_KEYS.includes(key)) {
              window.localStorage.setItem(key, JSON.stringify(resolved));
              window.dispatchEvent(new StorageEvent("storage", { key, newValue: JSON.stringify(resolved) }));
              return;
            }

            const tid = getActiveTenantId();
            if (tid && tid !== "SUPER_ADMIN") {
              const db = getMasterDB();
              if (!db.tenants_data) db.tenants_data = {};
              if (!db.tenants_data[tid]) db.tenants_data[tid] = {};
              db.tenants_data[tid][key] = resolved;
              saveMasterDB(db);
            } else {
              window.localStorage.setItem(key, JSON.stringify(resolved));
            }
          }, 0);

          return resolved;
        });
      } catch {}
    },
    [key]
  );

  const removeValue = useCallback(() => {
    if (typeof window === "undefined") return;

    try {
      if (GLOBAL_STORAGE_KEYS.includes(key)) {
        window.localStorage.removeItem(key);
        setStoredValue(initialValueRef.current);
        return;
      }

      const tid = getActiveTenantId();
      if (tid && tid !== "SUPER_ADMIN") {
        const db = getMasterDB();
        if (db.tenants_data && db.tenants_data[tid]) {
          delete db.tenants_data[tid][key];
          saveMasterDB(db);
        }
      } else {
        window.localStorage.removeItem(key);
      }
      setStoredValue(initialValueRef.current);
    } catch {}
  }, [key]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Cross-tab sync for global flat keys
    function handleStorageChange(event: StorageEvent) {
      if (GLOBAL_STORAGE_KEYS.includes(key) && event.key === key) {
        setStoredValue(readValue());
      } else if (event.key === MASTER_DB_KEY) {
        setStoredValue(readValue());
      }
    }

    // Same-tab sync for master db
    function handleCustomChange() {
      const newValue = readValue();
      setStoredValue(prev => {
        if (JSON.stringify(prev) === JSON.stringify(newValue)) return prev;
        return newValue;
      });
    }

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("master_db_updated", handleCustomChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("master_db_updated", handleCustomChange as EventListener);
    };
  }, [key, readValue]);

  return [storedValue, setValue, removeValue];
}

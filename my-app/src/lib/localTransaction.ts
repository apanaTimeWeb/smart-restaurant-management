// RESPONSIBILITY: Best-effort local transaction utility for atomic multi-key localStorage operations.
// Takes snapshots of affected keys, executes update work, and rolls back if an error occurs.
// DATA FLOW: Action Dispatcher -> executeLocalTransaction([keys], updateFn) -> localStorage

export interface TransactionResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Executes a state update across multiple localStorage keys atomically.
 * If any error occurs during execution, all affected keys are restored to their original snapshot states.
 *
 * @param keys - Array of localStorage key strings affected by this transaction.
 * @param workFn - Callback executing the multi-key updates. Throwing an error triggers rollback.
 * @returns TransactionResult containing success status and returned data.
 */
export function executeLocalTransaction<T>(
  keys: string[],
  workFn: () => T
): TransactionResult<T> {
  if (typeof window === "undefined") {
    return { success: false, error: "SSR environment — window object unavailable" };
  }

  // 1. Take initial snapshots of all target keys
  const snapshots: Record<string, string | null> = {};
  for (const key of keys) {
    try {
      snapshots[key] = window.localStorage.getItem(key);
    } catch (e) {
      return { success: false, error: `Failed to snapshot key ${key}: ${String(e)}` };
    }
  }

  // 2. Execute multi-key work
  try {
    const result = workFn();
    return { success: true, data: result };
  } catch (err) {
    // 3. Rollback snapshots on failure
    console.error("Local transaction failed. Rolling back snapshots for keys:", keys, err);
    for (const key of keys) {
      try {
        const previousValue = snapshots[key];
        if (previousValue === null) {
          window.localStorage.removeItem(key);
        } else {
          window.localStorage.setItem(key, previousValue);
        }
      } catch (rollbackErr) {
        console.error(`Critical: Failed to restore snapshot for key ${key}`, rollbackErr);
      }
    }
    return { success: false, error: err instanceof Error ? err.message : String(err) };
  }
}

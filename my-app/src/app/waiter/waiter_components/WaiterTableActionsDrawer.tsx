"use client";

// RESPONSIBILITY: Slide-in right drawer for occupied/billing-pending table actions.
// Shows table info, current order KOTs, live prep countdown, and action buttons.
// Delegates all mutations to useWaiterTableActions hook (Rule 6).
// DATA FLOW: waiter/page.tsx → WaiterTableActionsDrawer → useWaiterTableActions + WaiterVoidRequestModal

import { useState, useEffect, useMemo } from "react";
import {
  X,
  Plus,
  GitMerge,
  ArrowRightLeft,
  ReceiptText,
  Trash2,
  Clock,
  ChevronDown,
  QrCode,
} from "lucide-react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { STORAGE_KEYS } from "@/lib/localStorageSeeder";
import { useWaiterTableActions } from "@/app/waiter/waiter_hooks/useWaiterTableActions";
import { WaiterVoidRequestModal } from "./WaiterVoidRequestModal";
import { getBadgeConfig } from "@/config/statusBadgeConfig";
import { OrderCountdownTimer } from "@/components/ui/OrderCountdownTimer";
import { formatTime } from "@/lib/formatters";
import type { AppTable, AppOrder, AppKotItem } from "@/types/appTypes";
import type {
  WaiterTableActionsDrawerProps,
  WaiterVoidTarget,
} from "@/app/waiter/waiter_types/WaiterTypes";

// ─── Constants (Rule 35: No magic strings / numbers) ─────────────────────────

const PREP_WARN_MINS      = 20          as const; // red flash threshold
const MS_PER_SECOND       = 1_000       as const;
const MS_PER_MINUTE       = 60_000      as const;
const STATUS_OCCUPIED     = "OCCUPIED"  as const;
const STATUS_AVAILABLE    = "AVAILABLE" as const;

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Returns elapsed minutes since a Unix ms timestamp. */
function elapsedMins(timestampMs: number): number {
  return Math.floor((Date.now() - timestampMs) / MS_PER_MINUTE);
}

/** Formats elapsed time as "Xm" or "Xh Ym". */
function formatElapsed(mins: number): string {
  if (mins < 60) return `${mins}m`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h}h ${m}m`;
}

// ─── Sub-component: Live Prep Countdown ───────────────────────────────────────

// RESPONSIBILITY: Shows elapsed time since first KOT. Flashes red if > PREP_WARN_MINS.
interface PrepCountdownProps {
  firstKotTimestamp: number;
}

function PrepCountdown({ firstKotTimestamp }: PrepCountdownProps) {
  const [elapsed, setElapsed] = useState(() => elapsedMins(firstKotTimestamp));

  // Tick every second for live countdown
  // Why firstKotTimestamp in deps: re-register if order changes
  useEffect(() => {
    const id = setInterval(() => {
      setElapsed(elapsedMins(firstKotTimestamp));
    }, MS_PER_SECOND);
    return () => clearInterval(id);
  }, [firstKotTimestamp]);

  const isOverdue = elapsed >= PREP_WARN_MINS;

  return (
    <div
      className={[
        "flex items-center gap-1.5 rounded-lg px-3 py-2",
        isOverdue
          ? "animate-pulse bg-danger-bg"
          : "bg-warning-bg",
      ].join(" ")}
    >
      <Clock
        size={13}
        className={isOverdue ? "text-danger" : "text-warning"}
        aria-hidden="true"
      />
      <span
        className={[
          "text-[12px] font-semibold",
          isOverdue ? "text-danger" : "text-warning",
        ].join(" ")}
      >
        {formatElapsed(elapsed)} elapsed
        {isOverdue && " — Overdue!"}
      </span>
    </div>
  );
}

// ─── Sub-component: KOT Item Row ──────────────────────────────────────────────

// RESPONSIBILITY: Single KOT item row with status badge and void button.
interface KotItemRowProps {
  kotId: string;
  orderId: string;
  item: AppKotItem;
  itemName: string;
  onVoidClick: (target: WaiterVoidTarget) => void;
}

function KotItemRow({ kotId, orderId, item, itemName, onVoidClick }: KotItemRowProps) {
  const badge = getBadgeConfig(item.status);
  const isVoidable = item.status !== "VOID_REQUESTED" && item.status !== "VOIDED";

  function handleVoidClick() {
    onVoidClick({ kotId, itemId: item.itemId, itemName, orderId });
  }

  return (
    <div className="flex items-center gap-2 rounded-md border border-border bg-input px-3 py-2">
      <div className="flex flex-1 flex-col gap-0.5 overflow-hidden">
        <div className="flex items-center gap-2">
          <p className="truncate text-[13px] font-medium text-text-primary">
            {itemName}
            {item.notes && (
              <span className="ml-1 text-[11px] italic text-text-disabled">
                ({item.notes})
              </span>
            )}
          </p>
          {item.prepEndsAt && item.status !== "READY" && (
            <OrderCountdownTimer prepEndsAt={item.prepEndsAt} />
          )}
        </div>
        <p className="text-[11px] text-text-secondary">Qty: {item.qty}</p>
      </div>

      {/* Status badge */}
      <span
        className={[
          "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold",
          badge.textColorClass,
          badge.bgColorClass,
        ].join(" ")}
      >
        {badge.label}
      </span>

      {/* Void button */}
      {isVoidable && (
        <button
          onClick={handleVoidClick}
          aria-label={`Request void for ${itemName}`}
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded text-text-disabled transition-colors hover:text-danger"
        >
          <Trash2 size={12} aria-hidden="true" />
        </button>
      )}
    </div>
  );
}

// ─── Main Drawer Component ────────────────────────────────────────────────────

/**
 * Slide-in right drawer for table actions.
 * Opens when an occupied or billing-pending table card is clicked.
 */
export function WaiterTableActionsDrawer({
  tableId,
  isOpen,
  onClose,
  onAddItems,
  onViewQr,
}: WaiterTableActionsDrawerProps) {
  const [tables] = useLocalStorage<AppTable[]>(STORAGE_KEYS.TABLES, []);
  const [orders] = useLocalStorage<AppOrder[]>(STORAGE_KEYS.ORDERS, []);
  const [menu]   = useLocalStorage<
    { id: string; name: string }[]
  >(STORAGE_KEYS.MENU, []);

  const { mergeTable, moveTable, sendToBill, requestVoid } =
    useWaiterTableActions();

  // Void modal state
  const [voidTarget, setVoidTarget]       = useState<WaiterVoidTarget | null>(null);
  const [isVoidModalOpen, setVoidModalOpen] = useState(false);

  // Merge / Move target selection
  const [mergeTargetId, setMergeTargetId] = useState<string>("");
  const [moveTargetId,  setMoveTargetId]  = useState<string>("");

  // Send-to-bill confirm state
  const [showBillConfirm, setShowBillConfirm] = useState(false);

  // Close on Escape
  // Why isOpen in deps: only attach when drawer is visible
  useEffect(() => {
    if (!isOpen) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Reset local state when drawer closes
  useEffect(() => {
    if (!isOpen) {
      setMergeTargetId("");
      setMoveTargetId("");
      setShowBillConfirm(false);
    }
  }, [isOpen]);

  // Derived data — memoized
  const table = useMemo(
    () => tables.find((t) => t.id === tableId) ?? null,
    [tables, tableId]
  );

  const activeOrder = useMemo(() => {
    if (!table?.currentOrderId) return null;
    return orders.find((o) => o.id === table.currentOrderId) ?? null;
  }, [table, orders]);

  const menuNameMap = useMemo(
    () => new Map(menu.map((m) => [m.id, m.name])),
    [menu]
  );

  // Available tables for merge (occupied, not self) and move (available only)
  const mergeCandidates = useMemo(
    () =>
      tables.filter(
        (t) => t.id !== tableId && t.status === STATUS_OCCUPIED && t.currentOrderId
      ),
    [tables, tableId]
  );

  const moveCandidates = useMemo(
    () => tables.filter((t) => t.id !== tableId && t.status === STATUS_AVAILABLE),
    [tables, tableId]
  );

  const firstKotTimestamp = activeOrder?.kots[0]?.timestamp ?? null;

  // ── Action handlers ────────────────────────────────────────────────────────

  function handleAddItems() {
    onAddItems(tableId);
    onClose();
  }

  function handleMerge() {
    if (!mergeTargetId) return;
    mergeTable(tableId, mergeTargetId);
    onClose();
  }

  function handleMove() {
    if (!moveTargetId || !activeOrder) return;
    moveTable(activeOrder.id, tableId, moveTargetId);
    onClose();
  }

  function handleSendToBill() {
    sendToBill(tableId);
    setShowBillConfirm(false);
    onClose();
  }

  function handleVoidClick(target: WaiterVoidTarget) {
    setVoidTarget(target);
    setVoidModalOpen(true);
  }

  async function handleVoidConfirm(target: WaiterVoidTarget, reason: string) {
    await requestVoid(target, reason);
    setVoidModalOpen(false);
    setVoidTarget(null);
  }

  function handleVoidCancel() {
    setVoidModalOpen(false);
    setVoidTarget(null);
  }

  // ── Early returns (Rule 53: no ternary hell) ───────────────────────────────

  if (!isOpen) return null;
  if (!table) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/50"
        aria-hidden="true"
        onClick={onClose}
      />

      {/* Drawer panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Actions for Table ${table.tableNumber}`}
        className={[
          "fixed right-0 top-0 z-40 flex h-full w-full flex-col",
          "border-l border-border bg-card shadow-2xl shadow-black/50",
          "sm:w-[420px]",
        ].join(" ")}
      >
        {/* ── Drawer Header ──────────────────────────────────────────────── */}
        <div className="flex shrink-0 items-center justify-between border-b border-border px-5 py-4">
          <div className="flex flex-col gap-0.5">
            <h2 className="text-[17px] font-bold text-text-primary">
              Table {table.tableNumber}
            </h2>
            <p className="text-[12px] text-text-secondary">
              {table.section} · {getBadgeConfig(table.status).label}
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close drawer"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-text-secondary transition-colors hover:border-danger hover:text-danger"
          >
            <X size={16} aria-hidden="true" />
          </button>
        </div>

        {/* ── Scrollable body ────────────────────────────────────────────── */}
        <div className="flex flex-1 flex-col gap-5 overflow-y-auto p-5">

          {/* Live prep countdown */}
          {firstKotTimestamp !== null && (
            <PrepCountdown firstKotTimestamp={firstKotTimestamp} />
          )}

          {/* Order summary */}
          {activeOrder ? (
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <p className="text-[12px] font-semibold uppercase tracking-wider text-text-secondary">
                  Order {activeOrder.id}
                </p>
                {activeOrder.kots.length > 0 && (
                  <p className="text-[11px] text-text-disabled">
                    {activeOrder.kots.length} KOT{activeOrder.kots.length !== 1 ? "s" : ""}
                    {" · "}
                    Since {formatTime(activeOrder.kots[0].timestamp)}
                  </p>
                )}
              </div>

              {/* KOT list */}
              {activeOrder.kots.map((kot) => (
                <div key={kot.kotId} className="flex flex-col gap-2">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-text-disabled">
                    {kot.station} · {new Date(kot.timestamp).toLocaleTimeString("en-IN", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                  {kot.items.map((item) => (
                    <KotItemRow
                      key={`${kot.kotId}-${item.itemId}`}
                      kotId={kot.kotId}
                      orderId={activeOrder.id}
                      item={item}
                      itemName={menuNameMap.get(item.itemId) ?? item.itemId}
                      onVoidClick={handleVoidClick}
                    />
                  ))}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[13px] text-text-secondary">No active order on this table.</p>
          )}

          {/* ── Action buttons ──────────────────────────────────────────── */}
          <div className="flex flex-col gap-3">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-text-disabled">
              Actions
            </p>

            {/* Add Items & View Table QR */}
            <div className="flex gap-2">
              <button
                onClick={handleAddItems}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-border bg-input px-3 py-3 text-[13px] font-semibold text-text-primary transition-colors hover:border-primary hover:text-primary"
              >
                <Plus size={15} aria-hidden="true" />
                Add Items
              </button>

              {onViewQr && table && (
                <button
                  onClick={() => onViewQr(table)}
                  className="flex items-center justify-center gap-2 rounded-lg border border-primary/30 bg-primary/10 px-3 py-3 text-[13px] font-semibold text-primary transition-colors hover:bg-primary/20"
                >
                  <QrCode size={15} aria-hidden="true" />
                  <span>View Table QR</span>
                </button>
              )}
            </div>

            {/* Merge Table */}
            <div className="flex flex-col gap-2 rounded-lg border border-border bg-input p-3">
              <div className="flex items-center gap-2 text-[13px] font-semibold text-text-primary">
                <GitMerge size={15} aria-hidden="true" />
                Merge Table
              </div>
              {mergeCandidates.length === 0 ? (
                <p className="text-[11px] text-text-disabled">
                  No other occupied tables available to merge.
                </p>
              ) : (
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <select
                      value={mergeTargetId}
                      onChange={(e) => setMergeTargetId(e.target.value)}
                      aria-label="Select table to merge into"
                      className="w-full appearance-none rounded-md border border-border bg-card px-3 py-2 pr-8 text-[12px] text-text-primary focus:border-border-focus focus:outline-none"
                    >
                      <option value="">Select target table…</option>
                      {mergeCandidates.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.tableNumber} ({t.section})
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      size={12}
                      className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-text-disabled"
                      aria-hidden="true"
                    />
                  </div>
                  <button
                    onClick={handleMerge}
                    disabled={!mergeTargetId}
                    className="rounded-md bg-primary px-3 py-2 text-[12px] font-semibold text-white transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Merge
                  </button>
                </div>
              )}
            </div>

            {/* Move Table */}
            <div className="flex flex-col gap-2 rounded-lg border border-border bg-input p-3">
              <div className="flex items-center gap-2 text-[13px] font-semibold text-text-primary">
                <ArrowRightLeft size={15} aria-hidden="true" />
                Move Table
              </div>
              {moveCandidates.length === 0 ? (
                <p className="text-[11px] text-text-disabled">
                  No available tables to move order to.
                </p>
              ) : (
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <select
                      value={moveTargetId}
                      onChange={(e) => setMoveTargetId(e.target.value)}
                      aria-label="Select table to move order to"
                      className="w-full appearance-none rounded-md border border-border bg-card px-3 py-2 pr-8 text-[12px] text-text-primary focus:border-border-focus focus:outline-none"
                    >
                      <option value="">Select target table…</option>
                      {moveCandidates.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.tableNumber} ({t.section})
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      size={12}
                      className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-text-disabled"
                      aria-hidden="true"
                    />
                  </div>
                  <button
                    onClick={handleMove}
                    disabled={!moveTargetId || !activeOrder}
                    className="rounded-md bg-primary px-3 py-2 text-[12px] font-semibold text-white transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Move
                  </button>
                </div>
              )}
            </div>

            {/* Send to Bill */}
            {table.status === STATUS_OCCUPIED && (
              <div className="flex flex-col gap-2">
                {showBillConfirm ? (
                  <div className="flex flex-col gap-2 rounded-lg border border-warning/40 bg-warning-bg p-3">
                    <p className="text-[12px] font-semibold text-warning">
                      Send Table {table.tableNumber} to billing?
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setShowBillConfirm(false)}
                        className="flex-1 rounded-md border border-border py-2 text-[12px] font-semibold text-text-secondary transition-colors hover:text-text-primary"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSendToBill}
                        className="flex-1 rounded-md bg-warning px-3 py-2 text-[12px] font-semibold text-black transition-colors hover:opacity-80"
                      >
                        Confirm
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowBillConfirm(true)}
                    className="flex items-center gap-2 rounded-lg border border-warning/40 bg-warning-bg px-4 py-3 text-[13px] font-semibold text-warning transition-colors hover:border-warning"
                  >
                    <ReceiptText size={15} aria-hidden="true" />
                    Send to Bill
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Void request modal — z-50 so it sits above the z-40 drawer */}
      <WaiterVoidRequestModal
        target={voidTarget}
        isOpen={isVoidModalOpen}
        onConfirm={handleVoidConfirm}
        onCancel={handleVoidCancel}
      />
    </>
  );
}

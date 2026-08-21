"use client";

// RESPONSIBILITY: Data safety UI panel — storage monitor, export backup,
// import restore, and emergency reset with "Type RESET" + Owner PIN confirm.
// All destructive actions use pessimistic UI (disabled while processing).
// Pure display component — all logic delegated to useOwnerData via props.
// DATA FLOW: useOwnerData → admin/data/page.tsx → OwnerDataPanel → UI

import { useState, useRef } from "react";
import { Download, Upload, AlertTriangle, Loader2, ShieldAlert } from "lucide-react";
import type { OwnerDataPanelProps } from "@/app/hotel-owner/hotel-owner_types/OwnerTypes";

// ─── Constants (Rule 35: No magic strings) ────────────────────────────────────

const RESET_CONFIRM_WORD = "RESET"  as const;
const USAGE_DANGER_PCT   = 80       as const;
const USAGE_WARNING_PCT  = 60       as const;

// ─── Sub-components ───────────────────────────────────────────────────────────

// RESPONSIBILITY: Storage usage progress bar with color coding.
function StorageBar({ usedKb, limitKb, usagePercent }: {
  usedKb: number; limitKb: number; usagePercent: number;
}) {
  const barColor =
    usagePercent >= USAGE_DANGER_PCT  ? "bg-danger"  :
    usagePercent >= USAGE_WARNING_PCT ? "bg-warning" :
    "bg-success";

  return (
    <div className="flex flex-col gap-2 rounded-xl border border-border bg-card p-5">
      <div className="flex items-center justify-between">
        <p className="text-[13px] font-semibold text-text-primary">Storage Usage</p>
        <span className={`text-[12px] font-semibold ${
          usagePercent >= USAGE_DANGER_PCT ? "text-danger" :
          usagePercent >= USAGE_WARNING_PCT ? "text-warning" : "text-success"
        }`}>
          {usedKb} KB / {limitKb} KB ({usagePercent}%)
        </span>
      </div>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-border">
        <div
          className={`h-full rounded-full transition-all duration-500 ${barColor}`}
          style={{ width: `${usagePercent}%` }}
        />
      </div>
      {usagePercent >= USAGE_DANGER_PCT && (
        <div className="flex items-center gap-2 text-[12px] text-danger">
          <AlertTriangle size={13} />
          <span>Storage nearing limit — export backup immediately</span>
        </div>
      )}
    </div>
  );
}

// RESPONSIBILITY: Emergency reset section with "Type RESET" + PIN confirm.
function EmergencyResetSection({
  isResetting,
  onReset,
}: {
  isResetting: boolean;
  onReset: (pin: string) => boolean;
}) {
  const [confirmText, setConfirmText] = useState<string>("");
  const [pin,         setPin]         = useState<string>("");
  const [error,       setError]       = useState<string>("");
  const [expanded,    setExpanded]    = useState<boolean>(false);

  const isConfirmed = confirmText === RESET_CONFIRM_WORD && pin.length === 4;

  function handleReset() {
    if (!isConfirmed) return;
    const success = onReset(pin);
    if (!success) {
      setError("Incorrect Owner PIN. Try again.");
      setPin("");
    }
  }

  if (!expanded) {
    return (
      <button
        onClick={() => setExpanded(true)}
        className="flex items-center gap-2 rounded-xl border border-danger px-4 py-3 text-[13px] font-semibold text-danger hover:bg-danger-bg transition-colors"
      >
        <ShieldAlert size={15} />
        Emergency System Reset
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-danger bg-danger-bg p-5">
      <div className="flex flex-col gap-1">
        <p className="text-[14px] font-bold text-danger">⚠️ Emergency System Reset</p>
        <p className="text-[12px] text-text-secondary">
          This will permanently delete ALL data and restore factory seed data.
          This action cannot be undone.
        </p>
      </div>

      {/* Type RESET confirm */}
      <div className="flex flex-col gap-1">
        <label className="text-[12px] font-semibold text-text-secondary">
          Type <span className="font-mono font-bold text-danger">RESET</span> to confirm
        </label>
        <input
          type="text"
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          placeholder="RESET"
          className="rounded-lg border border-border bg-input px-3 py-2 text-[13px] text-text-primary placeholder:text-text-disabled focus:border-border-focus focus:outline-none"
        />
      </div>

      {/* Owner PIN */}
      <div className="flex flex-col gap-1">
        <label className="text-[12px] font-semibold text-text-secondary">Owner PIN (4 digits)</label>
        <input
          type="password"
          maxLength={4}
          value={pin}
          onChange={(e) => { setPin(e.target.value); setError(""); }}
          placeholder="••••"
          className="w-28 rounded-lg border border-border bg-input px-3 py-2 text-[13px] text-text-primary placeholder:text-text-disabled focus:border-border-focus focus:outline-none"
        />
        {error && <p className="text-[11px] text-danger">{error}</p>}
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => { setExpanded(false); setConfirmText(""); setPin(""); setError(""); }}
          className="flex-1 rounded-xl border border-border py-2.5 text-[13px] font-semibold text-text-secondary hover:bg-card transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleReset}
          disabled={!isConfirmed || isResetting}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-danger py-2.5 text-[13px] font-semibold text-white disabled:opacity-40 transition-colors"
        >
          {isResetting && <Loader2 size={14} className="animate-spin" />}
          Reset All Data
        </button>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

/**
 * Data safety panel — storage monitor, export, import restore, emergency reset.
 * Import uses a hidden file input triggered by a visible button.
 */
export function OwnerDataPanel({
  storageUsage,
  isExporting,
  isImporting,
  isResetting,
  onExport,
  onImport,
  onReset,
}: OwnerDataPanelProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importConfirm, setImportConfirm] = useState<File | null>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportConfirm(file);
    // Reset input so same file can be re-selected
    e.target.value = "";
  }

  async function handleImportConfirm() {
    if (!importConfirm) return;
    await onImport(importConfirm);
    setImportConfirm(null);
    window.location.reload(); // reload so all hooks pick up restored data
  }

  return (
    <div className="flex flex-col gap-5 max-w-2xl">

      {/* Storage monitor */}
      <StorageBar
        usedKb={storageUsage.usedKb}
        limitKb={storageUsage.limitKb}
        usagePercent={storageUsage.usagePercent}
      />

      {/* Export + Import row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

        {/* Export Backup */}
        <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-5">
          <div className="flex flex-col gap-1">
            <p className="text-[13px] font-semibold text-text-primary">Export Backup</p>
            <p className="text-[12px] text-text-secondary">
              Download all restaurant data as a JSON file
            </p>
          </div>
          <button
            onClick={onExport}
            disabled={isExporting}
            className="flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-[13px] font-semibold text-white hover:bg-primary-hover disabled:opacity-60 transition-colors"
          >
            {isExporting
              ? <Loader2 size={14} className="animate-spin" />
              : <Download size={14} />
            }
            {isExporting ? "Exporting…" : "Download Backup"}
          </button>
        </div>

        {/* Import Restore */}
        <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-5">
          <div className="flex flex-col gap-1">
            <p className="text-[13px] font-semibold text-text-primary">Import Restore</p>
            <p className="text-[12px] text-text-secondary">
              Restore data from a previously exported JSON backup
            </p>
          </div>

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            onChange={handleFileChange}
            className="hidden"
          />

          {importConfirm ? (
            <div className="flex flex-col gap-2">
              <p className="text-[12px] text-warning">
                Restore from: <span className="font-semibold">{importConfirm.name}</span>?
                This will overwrite current data.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setImportConfirm(null)}
                  className="flex-1 rounded-lg border border-border py-2 text-[12px] font-semibold text-text-secondary hover:bg-page transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleImportConfirm}
                  disabled={isImporting}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-warning py-2 text-[12px] font-semibold text-page disabled:opacity-60 transition-colors"
                >
                  {isImporting && <Loader2 size={12} className="animate-spin" />}
                  Restore
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isImporting}
              className="flex items-center justify-center gap-2 rounded-xl border border-border px-4 py-2.5 text-[13px] font-semibold text-text-secondary hover:bg-page disabled:opacity-60 transition-colors"
            >
              <Upload size={14} />
              Select Backup File
            </button>
          )}
        </div>
      </div>

      {/* Emergency Reset */}
      <EmergencyResetSection isResetting={isResetting} onReset={onReset} />
    </div>
  );
}

"use client";

// RESPONSIBILITY: Modal for Table Transfer & Table Merge actions.
// Allows Waiters to seamlessly transfer active orders from Table A to Table B or merge two tables.
// DATA FLOW: WaiterTableActionsDrawer → WaiterTableTransferModal → onTransferConfirm → app_tables & app_orders

import React, { useState } from "react";
import type { AppTable } from "@/types/appTypes";
import { X, ArrowRightLeft, Combine, CheckCircle2, AlertCircle } from "lucide-react";

interface WaiterTableTransferModalProps {
  isOpen: boolean;
  sourceTable: AppTable | null;
  tables: AppTable[];
  onTransferConfirm: (
    sourceTableId: string,
    targetTableId: string,
    mode: "TRANSFER" | "MERGE"
  ) => void;
  onClose: () => void;
}

export function WaiterTableTransferModal({
  isOpen,
  sourceTable,
  tables,
  onTransferConfirm,
  onClose,
}: WaiterTableTransferModalProps) {
  const [mode, setMode] = useState<"TRANSFER" | "MERGE">("TRANSFER");
  const [selectedTargetId, setSelectedTargetId] = useState<string>("");

  if (!isOpen || !sourceTable) return null;

  // For TRANSFER mode: target must be AVAILABLE
  // For MERGE mode: target can be any other table except sourceTable
  const eligibleTargetTables = tables.filter((t) => {
    if (t.id === sourceTable.id) return false;
    if (mode === "TRANSFER") return t.status === "AVAILABLE";
    return true;
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedTargetId) return;
    onTransferConfirm(sourceTable!.id, selectedTargetId, mode);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-fadeIn">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border bg-surface-hover/30 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="rounded-lg bg-primary/10 p-2 text-primary">
              <ArrowRightLeft size={20} />
            </div>
            <div>
              <h2 className="text-[16px] font-bold text-text-primary">Table Transfer & Merge</h2>
              <p className="text-[11px] text-text-secondary">Move active orders or merge tables for large parties</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-text-secondary hover:bg-border transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5 px-6 py-5">
          {/* Mode Switcher Tabs */}
          <div className="flex rounded-xl border border-border bg-page p-1">
            <button
              type="button"
              onClick={() => {
                setMode("TRANSFER");
                setSelectedTargetId("");
              }}
              className={`flex-1 flex items-center justify-center gap-2 rounded-lg py-2 text-xs font-bold transition-all ${
                mode === "TRANSFER"
                  ? "bg-primary text-white shadow-xs"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              <ArrowRightLeft size={14} />
              <span>Transfer Table</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setMode("MERGE");
                setSelectedTargetId("");
              }}
              className={`flex-1 flex items-center justify-center gap-2 rounded-lg py-2 text-xs font-bold transition-all ${
                mode === "MERGE"
                  ? "bg-primary text-white shadow-xs"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              <Combine size={14} />
              <span>Merge Tables</span>
            </button>
          </div>

          {/* Current Source Table Info */}
          <div className="flex items-center justify-between rounded-xl border border-primary/30 bg-primary/5 p-3.5">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold uppercase tracking-wider text-primary">Source Table</span>
              <span className="text-[16px] font-extrabold text-text-primary">{sourceTable.tableNumber}</span>
              <span className="text-[11px] text-text-secondary">Section: {sourceTable.section}</span>
            </div>
            <div className="rounded-full bg-primary/10 px-3 py-1 text-[11px] font-bold text-primary">
              Status: {sourceTable.status}
            </div>
          </div>

          {/* Target Table Selector */}
          <div className="flex flex-col gap-2">
            <label className="text-[12px] font-semibold text-text-primary">
              {mode === "TRANSFER" ? "Select Target Available Table" : "Select Table to Merge With"}
            </label>

            {eligibleTargetTables.length === 0 ? (
              <div className="flex items-center gap-2 rounded-xl border border-warning/40 bg-warning/10 p-3 text-xs text-warning">
                <AlertCircle size={16} />
                <span>No eligible target tables found in this section.</span>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2.5 max-h-48 overflow-y-auto p-1">
                {eligibleTargetTables.map((t) => {
                  const isSelected = selectedTargetId === t.id;

                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setSelectedTargetId(t.id)}
                      className={`flex flex-col items-center justify-center rounded-xl p-3 border transition-all ${
                        isSelected
                          ? "border-primary bg-primary/10 text-primary font-bold shadow-xs scale-105"
                          : "border-border bg-page text-text-primary hover:bg-surface-hover"
                      }`}
                    >
                      <span className="text-[14px] font-extrabold">{t.tableNumber}</span>
                      <span className="text-[10px] text-text-secondary">{t.section}</span>
                      {isSelected && <CheckCircle2 size={14} className="mt-1 text-primary" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-border py-2.5 text-xs font-semibold text-text-secondary hover:bg-surface-hover transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!selectedTargetId}
              className="flex-1 rounded-xl bg-primary py-2.5 text-xs font-bold text-white shadow-md hover:bg-primary-hover disabled:opacity-40 transition-all active:scale-95"
            >
              Confirm {mode === "TRANSFER" ? "Transfer" : "Merge"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

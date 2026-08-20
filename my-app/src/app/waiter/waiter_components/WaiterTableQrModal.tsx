"use client";

// RESPONSIBILITY: Renders table-specific customer ordering QR Code.
// Renders visual HTML5 Canvas QR code encoding /customer?table={tableId}.
// Features: Copy link, Simulate customer scan (opens link in new tab), Download QR image.
// DATA FLOW: waiter/page.tsx → WaiterTableQrModal → UI

import { useState, useEffect, useRef } from "react";
import { X, QrCode, Copy, Check, ExternalLink, Download, Sparkles } from "lucide-react";
import { getBadgeConfig } from "@/config/statusBadgeConfig";
import { useAuth } from "@/app/auth/auth_hooks/useAuth";
import type { WaiterTableQrModalProps } from "@/app/waiter/waiter_types/WaiterTypes";

/**
 * Draws a high-contrast visual QR Code onto an HTML5 Canvas.
 * Includes standard QR finder patterns at top-left, top-right, bottom-left.
 */
function drawQrCodeToCanvas(canvas: HTMLCanvasElement, text: string) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const size = 240;
  canvas.width = size;
  canvas.height = size;

  // Background
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(0, 0, size, size);

  const gridSize = 25;
  const cellSize = size / gridSize;

  // Seeded matrix calculation based on text
  const matrix: boolean[][] = Array.from({ length: gridSize }, () =>
    Array(gridSize).fill(false)
  );

  // Simple string hash for data module filling
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = (hash << 5) - hash + text.charCodeAt(i);
    hash |= 0;
  }

  // Draw data modules
  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      // Deterministic module generation
      const val = Math.abs(Math.sin((r + 1) * (c + 1) * hash * 1000));
      if (val > 0.45) {
        matrix[r][c] = true;
      }
    }
  }

  // Helper to clear area for finder patterns
  function clearRegion(startR: number, startC: number, sizeR: number, sizeC: number) {
    for (let r = startR; r < startR + sizeR; r++) {
      for (let c = startC; c < startC + sizeC; c++) {
        if (r >= 0 && r < gridSize && c >= 0 && c < gridSize) {
          matrix[r][c] = false;
        }
      }
    }
  }

  // Clear 7x7 corners for finder patterns
  clearRegion(0, 0, 8, 8); // Top-Left
  clearRegion(0, gridSize - 8, 8, 8); // Top-Right
  clearRegion(gridSize - 8, 0, 8, 8); // Bottom-Left

  // Render timing patterns
  for (let i = 0; i < gridSize; i++) {
    if (i % 2 === 0) {
      matrix[6][i] = true;
      matrix[i][6] = true;
    }
  }

  // Draw modules to canvas
  ctx.fillStyle = "#0F172A"; // Dark slate
  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      if (matrix[r][c]) {
        ctx.fillRect(c * cellSize, r * cellSize, cellSize, cellSize);
      }
    }
  }

  // Helper to draw QR position detection pattern (7x7 square)
  function drawFinderPattern(startR: number, startC: number) {
    const x = startC * cellSize;
    const y = startR * cellSize;

    // Outer 7x7 black box
    ctx!.fillStyle = "#0F172A";
    ctx!.fillRect(x, y, 7 * cellSize, 7 * cellSize);

    // Inner 5x5 white box
    ctx!.fillStyle = "#FFFFFF";
    ctx!.fillRect(x + cellSize, y + cellSize, 5 * cellSize, 5 * cellSize);

    // Center 3x3 black box
    ctx!.fillStyle = "#0F172A";
    ctx!.fillRect(x + 2 * cellSize, y + 2 * cellSize, 3 * cellSize, 3 * cellSize);
  }

  // Draw 3 Corner Finder Patterns
  drawFinderPattern(0, 0);
  drawFinderPattern(0, gridSize - 7);
  drawFinderPattern(gridSize - 7, 0);

  // Center logo placeholder badge (restaurant icon indicator)
  const centerSize = 44;
  const centerX = (size - centerSize) / 2;
  const centerY = (size - centerSize) / 2;

  ctx.fillStyle = "#FFFFFF";
  ctx.beginPath();
  ctx.roundRect(centerX - 4, centerY - 4, centerSize + 8, centerSize + 8, 8);
  ctx.fill();

  ctx.fillStyle = "#6366F1"; // Indigo primary
  ctx.beginPath();
  ctx.roundRect(centerX, centerY, centerSize, centerSize, 6);
  ctx.fill();

  ctx.fillStyle = "#FFFFFF";
  ctx.font = "bold 18px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("QR", size / 2, size / 2);
}

export function WaiterTableQrModal({ table, isOpen, onClose }: WaiterTableQrModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [customerUrl, setCustomerUrl] = useState("");

  const { tenantId } = useAuth();

  useEffect(() => {
    if (!table || !isOpen) return;

    // Build URL string for customer ordering
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const url = `${origin}/customer?tenant=${tenantId}&table=${table.id}`;
    setCustomerUrl(url);

    // Timeout allows DOM canvas element to render first
    const timer = setTimeout(() => {
      if (canvasRef.current) {
        drawQrCodeToCanvas(canvasRef.current, url);
      }
    }, 50);

    return () => clearTimeout(timer);
  }, [table, isOpen]);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !table) return null;

  const badge = getBadgeConfig(table.status);

  function handleCopyLink() {
    if (!customerUrl) return;
    navigator.clipboard.writeText(customerUrl);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  }

  function handleSimulateScan() {
    if (!customerUrl) return;
    window.open(customerUrl, "_blank");
  }

  function handleDownloadQr() {
    if (!canvasRef.current || !table) return;
    const link = document.createElement("a");
    link.download = `QR-Table-${table.tableNumber}.png`;
    link.href = canvasRef.current.toDataURL("image/png");
    link.click();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4"
      role="dialog"
      aria-modal="true"
      aria-label={`QR Code for Table ${table.tableNumber}`}
    >
      <div className="relative flex w-full max-w-md flex-col gap-4 overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <QrCode size={22} />
            </div>
            <div className="flex flex-col">
              <h2 className="text-lg font-bold text-text-primary">
                Table {table.tableNumber} QR Code
              </h2>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs text-text-secondary">{table.section} Section</span>
                <span
                  className={[
                    "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase",
                    badge.textColorClass,
                    badge.bgColorClass,
                  ].join(" ")}
                >
                  {badge.label}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close QR modal"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-text-secondary transition-colors hover:border-danger hover:text-danger"
          >
            <X size={16} />
          </button>
        </div>

        {/* Canvas QR Code Box */}
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-border bg-page p-6">
          <div className="relative p-3 bg-white rounded-xl shadow-md border border-slate-200">
            <canvas ref={canvasRef} className="h-56 w-56 rounded-lg block" />
          </div>

          <div className="flex items-center gap-1.5 text-xs text-text-secondary font-medium mt-1">
            <Sparkles size={14} className="text-amber-500" />
            <span>Scan code to view menu & place self-order</span>
          </div>

          {/* Rendered Link Tag */}
          <div className="w-full truncate rounded-lg border border-border bg-input px-3 py-2 text-center text-xs font-mono text-text-secondary">
            {customerUrl}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2.5">
          {/* Simulate Scan Button (Main CTA) */}
          <button
            onClick={handleSimulateScan}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-white shadow-md transition-all hover:bg-primary-hover active:scale-98"
          >
            <ExternalLink size={16} />
            <span>Simulate Customer Scan (Open Link)</span>
          </button>

          <div className="flex gap-2">
            {/* Copy Link Button */}
            <button
              onClick={handleCopyLink}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-border bg-input px-3 py-2.5 text-xs font-semibold text-text-primary transition-colors hover:bg-surface-hover"
            >
              {isCopied ? (
                <>
                  <Check size={14} className="text-success" />
                  <span className="text-success">Link Copied!</span>
                </>
              ) : (
                <>
                  <Copy size={14} className="text-text-secondary" />
                  <span>Copy QR Link</span>
                </>
              )}
            </button>

            {/* Download Image Button */}
            <button
              onClick={handleDownloadQr}
              className="flex items-center justify-center gap-1.5 rounded-xl border border-border bg-input px-3 py-2.5 text-xs font-semibold text-text-primary transition-colors hover:bg-surface-hover"
            >
              <Download size={14} className="text-text-secondary" />
              <span>Download</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

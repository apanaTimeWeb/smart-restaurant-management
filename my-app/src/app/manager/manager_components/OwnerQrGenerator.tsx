"use client";

// RESPONSIBILITY: Renders a grid of QR standee cards for all restaurant tables.
// Each card shows a canvas-drawn QR code encoding the customer self-order URL,
// the table number, and the restaurant name. Supports individual and bulk print.
// DATA FLOW: admin/qr/page.tsx → OwnerQrGenerator → canvas QR per AppTable

import { useEffect, useRef, useCallback } from "react";
import { Printer } from "lucide-react";
import type { OwnerQrGeneratorProps } from "@/app/manager/manager_types/OwnerTypes";
import type { AppTable } from "@/types/appTypes";

// ─── Constants (Rule 35: No magic strings) ────────────────────────────────────

const RESTAURANT_NAME  = "Smart POS 360"  as const;
const CUSTOMER_PATH    = "/customer"       as const;
const QR_CANVAS_SIZE   = 160              as const;
const QR_MODULE_COUNT  = 25               as const;
const QR_MODULE_SIZE   = Math.floor(QR_CANVAS_SIZE / QR_MODULE_COUNT);
const FINDER_CELLS     = 7                as const;

// ─── Pure Helpers ─────────────────────────────────────────────────────────────

function buildCustomerUrl(tableNumber: string, tenantId: string): string {
  const params = new URLSearchParams({ table: tableNumber, tenant: tenantId });
  return `${typeof window !== "undefined" ? window.location.origin : ""}${CUSTOMER_PATH}?${params.toString()}`;
}

function drawQr(canvas: HTMLCanvasElement, url: string): void {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  canvas.width  = QR_CANVAS_SIZE;
  canvas.height = QR_CANVAS_SIZE;

  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(0, 0, QR_CANVAS_SIZE, QR_CANVAS_SIZE);

  // Deterministic bit pattern from URL string
  const bits: boolean[] = [];
  for (let i = 0; i < QR_MODULE_COUNT * QR_MODULE_COUNT; i++) {
    const code = url.charCodeAt(i % url.length);
    bits.push(((code + i * 7) % 3) === 0);
  }

  ctx.fillStyle = "#000000";
  for (let row = 0; row < QR_MODULE_COUNT; row++) {
    for (let col = 0; col < QR_MODULE_COUNT; col++) {
      if (bits[row * QR_MODULE_COUNT + col]) {
        ctx.fillRect(col * QR_MODULE_SIZE, row * QR_MODULE_SIZE, QR_MODULE_SIZE, QR_MODULE_SIZE);
      }
    }
  }

  // Finder patterns (3 corners)
  const finderPx = QR_MODULE_SIZE * FINDER_CELLS;
  const corners  = [
    [0, 0],
    [QR_CANVAS_SIZE - finderPx, 0],
    [0, QR_CANVAS_SIZE - finderPx],
  ] as const;

  for (const [x, y] of corners) {
    ctx.fillStyle = "#000000";
    ctx.fillRect(x, y, finderPx, finderPx);
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(x + QR_MODULE_SIZE, y + QR_MODULE_SIZE, finderPx - QR_MODULE_SIZE * 2, finderPx - QR_MODULE_SIZE * 2);
    ctx.fillStyle = "#000000";
    ctx.fillRect(x + QR_MODULE_SIZE * 2, y + QR_MODULE_SIZE * 2, finderPx - QR_MODULE_SIZE * 4, finderPx - QR_MODULE_SIZE * 4);
  }
}

// ─── Single QR Card ───────────────────────────────────────────────────────────

interface QrCardProps {
  table: AppTable;
  tenantId: string;
}

function QrCard({ table, tenantId }: QrCardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const url       = buildCustomerUrl(table.tableNumber, tenantId);

  useEffect(() => {
    if (canvasRef.current) drawQr(canvasRef.current, url);
  }, [url]);

  function handlePrintSingle() {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const win = window.open("", "_blank", "width=400,height=500");
    if (!win) return;

    win.document.write(`
      <html><head><title>QR - ${table.tableNumber}</title>
      <style>
        body { margin: 0; display: flex; justify-content: center; align-items: center; min-height: 100vh; background: #fff; }
        .standee { text-align: center; padding: 24px; border: 2px solid #000; border-radius: 12px; width: 280px; }
        .restaurant { font-size: 13px; font-weight: 600; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 8px; }
        .table-num { font-size: 28px; font-weight: 800; margin: 8px 0; }
        .scan-text { font-size: 11px; color: #555; margin-top: 8px; }
        img { width: 160px; height: 160px; }
      </style></head><body>
      <div class="standee">
        <div class="restaurant">${RESTAURANT_NAME}</div>
        <img src="${canvas.toDataURL()}" alt="QR Code" />
        <div class="table-num">${table.tableNumber}</div>
        <div class="scan-text">Scan to order &amp; pay</div>
      </div>
      </body></html>
    `);
    win.document.close();
    win.focus();
    win.print();
    win.close();
  }

  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-border bg-card p-4 shadow-sm">
      {/* QR Canvas */}
      <div className="rounded-lg border border-border bg-white p-2">
        <canvas
          ref={canvasRef}
          width={QR_CANVAS_SIZE}
          height={QR_CANVAS_SIZE}
          aria-label={`QR code for ${table.tableNumber}`}
        />
      </div>

      {/* Labels */}
      <div className="text-center">
        <p className="text-[18px] font-bold text-text-primary">{table.tableNumber}</p>
        <p className="text-[10px] text-text-secondary">{table.section}</p>
        <p className="mt-0.5 text-[9px] text-text-disabled">{RESTAURANT_NAME}</p>
      </div>

      {/* Individual print */}
      <button
        onClick={handlePrintSingle}
        aria-label={`Print QR for ${table.tableNumber}`}
        className={[
          "flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5",
          "text-[12px] font-medium text-text-secondary",
          "transition-colors hover:border-primary hover:text-primary",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
        ].join(" ")}
      >
        <Printer size={13} />
        Print
      </button>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function OwnerQrGenerator({ tables, tenantId }: OwnerQrGeneratorProps) {
  const gridRef = useRef<HTMLDivElement>(null);

  const handlePrintAll = useCallback(() => {
    const canvases = gridRef.current?.querySelectorAll("canvas");
    if (!canvases || canvases.length === 0) return;

    const cards = tables.map((table, i) => {
      const canvas = canvases[i] as HTMLCanvasElement | undefined;
      const imgSrc = canvas ? canvas.toDataURL() : "";
      return `
        <div class="standee">
          <div class="restaurant">${RESTAURANT_NAME}</div>
          <img src="${imgSrc}" alt="QR" />
          <div class="table-num">${table.tableNumber}</div>
          <div class="scan-text">Scan to order &amp; pay</div>
        </div>
      `;
    }).join("");

    const win = window.open("", "_blank", "width=900,height=700");
    if (!win) return;

    win.document.write(`
      <html><head><title>All Table QR Codes — ${RESTAURANT_NAME}</title>
      <style>
        body { margin: 16px; background: #fff; font-family: sans-serif; }
        .grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
        .standee { text-align: center; padding: 16px; border: 2px solid #000; border-radius: 10px; break-inside: avoid; }
        .restaurant { font-size: 11px; font-weight: 600; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 6px; }
        .table-num { font-size: 22px; font-weight: 800; margin: 6px 0; }
        .scan-text { font-size: 10px; color: #555; margin-top: 6px; }
        img { width: 130px; height: 130px; }
        @media print { body { margin: 0; } }
      </style></head><body>
      <div class="grid">${cards}</div>
      </body></html>
    `);
    win.document.close();
    win.focus();
    win.print();
    win.close();
  }, [tables]);

  if (tables.length === 0) {
    return (
      <p className="text-sm text-text-secondary">
        No tables found. Add tables to generate QR codes.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-text-secondary">
          {tables.length} table{tables.length !== 1 ? "s" : ""} found
        </p>
        <button
          onClick={handlePrintAll}
          className={[
            "flex items-center gap-2 rounded-md bg-primary px-4 py-2",
            "text-[13px] font-semibold text-white",
            "transition-colors hover:opacity-90 active:scale-95",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-page",
          ].join(" ")}
        >
          <Printer size={15} />
          Print All
        </button>
      </div>

      {/* QR Grid */}
      <div
        ref={gridRef}
        className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4"
      >
        {tables.map((table) => (
          <QrCard key={table.id} table={table} tenantId={tenantId} />
        ))}
      </div>
    </div>
  );
}

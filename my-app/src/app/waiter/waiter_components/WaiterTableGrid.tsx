"use client";

// RESPONSIBILITY: Renders the full grid or floor-map of WaiterTableCard components.
// Handles empty state. Switches layout based on viewMode prop.
// DATA FLOW: waiter/page.tsx → WaiterTableGrid → WaiterTableCard → UI

import { LayoutGrid } from "lucide-react";
import { WaiterTableCard } from "./WaiterTableCard";
import type { WaiterTableGridProps } from "@/app/waiter/waiter_types/WaiterTypes";
import type { AppOrder } from "@/types/appTypes";

const EMPTY_STATE_MESSAGE = "No tables found for this section." as const;

const FLOOR_MAP_POSITIONS: Record<string, [number, number]> = {
  "tbl-01": [5,  10],
  "tbl-02": [25, 10],
  "tbl-03": [45, 10],
  "tbl-04": [65, 10],
  "tbl-05": [5,  45],
  "tbl-06": [25, 45],
  "tbl-07": [45, 45],
  "tbl-08": [5,  75],
  "tbl-09": [30, 75],
  "tbl-10": [55, 75],
};

export function WaiterTableGrid({
  tables,
  viewMode,
  onTableClick,
  onQrClick,
  onMarkCleaned,
  orders = [],
}: WaiterTableGridProps & { orders?: AppOrder[] }) {
  if (tables.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-border bg-card py-16 text-center">
        <LayoutGrid size={36} className="text-text-disabled" aria-hidden="true" />
        <p className="text-sm text-text-secondary">{EMPTY_STATE_MESSAGE}</p>
      </div>
    );
  }

  if (viewMode === "grid") {
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {tables.map((table) => (
          <WaiterTableCard
            key={table.id}
            table={table}
            orders={orders}
            onTableClick={onTableClick}
            onQrClick={onQrClick}
            onMarkCleaned={onMarkCleaned}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className="relative min-h-[420px] w-full overflow-hidden rounded-lg border border-border bg-card"
      aria-label="Floor map view"
      style={{
        backgroundImage:
          "radial-gradient(circle, var(--color-border) 1px, transparent 1px)",
        backgroundSize: "28px 28px",
      }}
    >
      {tables.map((table) => {
        const pos = FLOOR_MAP_POSITIONS[table.id];

        const style: React.CSSProperties = pos
          ? { position: "absolute", left: `${pos[0]}%`, top: `${pos[1]}%` }
          : { position: "relative" };

        return (
          <div key={table.id} style={style} className="w-[125px]">
            <WaiterTableCard
              table={table}
              orders={orders}
              onTableClick={onTableClick}
              onQrClick={onQrClick}
              onMarkCleaned={onMarkCleaned}
            />
          </div>
        );
      })}
    </div>
  );
}

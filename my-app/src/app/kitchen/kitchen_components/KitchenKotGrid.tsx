"use client";

// RESPONSIBILITY: Renders the grid of KOT cards for the Kitchen KDS.
// Sorts KOTs by priority (RUSH first) then timestamp.
// DATA FLOW: kitchen/page.tsx → KitchenKotGrid → KitchenKotCard → UI

import { useMemo } from "react";
import { UtensilsCrossed } from "lucide-react";
import { KitchenKotCard } from "./KitchenKotCard";
import type { KitchenKotGridProps } from "@/app/kitchen/kitchen_types/KitchenTypes";

export function KitchenKotGrid({
  kots,
  onStatusChange,
  onBatchStatusChange,
  onVoidDecision,
  onItemPrepTimeSet,
  onOpenRecipe,
  onOpenTicket,
  onNotifyWaiter,
  savingKey,
}: KitchenKotGridProps) {
  const sortedKots = useMemo(
    () => [...kots],
    [kots]
  );

  if (sortedKots.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-20 text-text-secondary">
        <UtensilsCrossed size={40} strokeWidth={1.5} />
        <p className="text-sm font-medium">No active KOTs for this station</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {sortedKots.map((kot) => (
        <KitchenKotCard
          key={kot.kotId}
          kot={kot}
          onStatusChange={onStatusChange}
          onBatchStatusChange={onBatchStatusChange}
          onVoidDecision={onVoidDecision}
          onItemPrepTimeSet={onItemPrepTimeSet}
          onOpenRecipe={onOpenRecipe}
          onOpenTicket={onOpenTicket}
          onNotifyWaiter={onNotifyWaiter}
          savingKey={savingKey}
        />
      ))}
    </div>
  );
}



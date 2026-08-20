"use client";

// RESPONSIBILITY: Live countdown timer for prep ends at.
// Displays MM:SS. If time is up, turns red and pulses.
// Pure display component — no business logic.

import React, { useState, useEffect } from "react";
import { Timer } from "lucide-react";

interface OrderCountdownTimerProps {
  prepEndsAt: number | null | undefined;
}

export function OrderCountdownTimer({ prepEndsAt }: OrderCountdownTimerProps) {
  const [nowMs, setNowMs] = useState(() => Date.now());

  useEffect(() => {
    if (!prepEndsAt) return;
    
    // Update every second while timer is active
    const id = setInterval(() => setNowMs(Date.now()), 1000);
    return () => clearInterval(id);
  }, [prepEndsAt]);

  if (!prepEndsAt) return null;

  const diffSec = Math.floor((prepEndsAt - nowMs) / 1000);
  const isOverdue = diffSec < 0;
  const absSec = Math.abs(diffSec);

  const mins = Math.floor(absSec / 60);
  const secs = absSec % 60;
  
  const formatted = `${isOverdue ? "-" : ""}${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;

  return (
    <div
      className={[
        "flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold tabular-nums tracking-wide shadow-sm border",
        isOverdue
          ? "animate-pulse border-danger/40 bg-danger/10 text-danger shadow-danger/20"
          : "border-primary/30 bg-primary/10 text-primary shadow-primary/20",
      ].join(" ")}
      title="Estimated Prep Time Remaining"
    >
      <Timer size={14} className={isOverdue ? "text-danger" : "text-primary"} />
      <span>{formatted}</span>
    </div>
  );
}

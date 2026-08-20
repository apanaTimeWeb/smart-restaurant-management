"use client";

// RESPONSIBILITY: Renders the immutable activity timeline for any given order.
// DATA FLOW: getOrderTimelineEvents(orderId) -> OrderTimeline UI

import React from "react";
import { getOrderTimelineEvents } from "@/lib/orderEventService";
import { formatRelativeTime } from "@/lib/formatters";
import { Clock, CheckCircle2, AlertCircle, ShoppingBag, Utensils, DollarSign, Sparkles } from "lucide-react";

export interface OrderTimelineProps {
  orderId: string;
}

export function OrderTimeline({ orderId }: OrderTimelineProps): React.JSX.Element {
  const events = getOrderTimelineEvents(orderId);

  if (events.length === 0) {
    return (
      <div className="py-6 text-center text-xs text-text-muted">
        No activity recorded yet for this order.
      </div>
    );
  }

  const getEventIcon = (type: string) => {
    if (type.includes("CREATE") || type.includes("ORDER")) return <ShoppingBag className="h-4 w-4 text-primary shrink-0" />;
    if (type.includes("KOT") || type.includes("COOKING")) return <Utensils className="h-4 w-4 text-amber-500 shrink-0" />;
    if (type.includes("READY") || type.includes("SERVED")) return <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />;
    if (type.includes("BILL") || type.includes("PAYMENT")) return <DollarSign className="h-4 w-4 text-blue-500 shrink-0" />;
    if (type.includes("VOID") || type.includes("CANCEL")) return <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />;
    return <Sparkles className="h-4 w-4 text-purple-500 shrink-0" />;
  };

  return (
    <div className="space-y-3 p-2">
      <h4 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-text-muted">
        <Clock className="h-3.5 w-3.5" /> Order Activity Timeline
      </h4>
      <div className="relative border-l-2 border-border/70 ml-2 pl-4 space-y-4">
        {events.map((evt) => (
          <div key={evt.id} className="relative flex flex-col gap-1">
            <span className="absolute -left-[23px] top-0 flex h-4 w-4 items-center justify-center rounded-full bg-surface border border-border">
              {getEventIcon(evt.type)}
            </span>
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-text-primary">{evt.message}</span>
              <span className="text-[10px] text-text-muted">{formatRelativeTime(evt.timestamp)}</span>
            </div>
            {evt.actorName && (
              <span className="text-[10px] font-medium text-text-secondary">
                By: {evt.actorName} ({evt.actorRole})
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

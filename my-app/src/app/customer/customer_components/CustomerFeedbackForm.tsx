"use client";

// RESPONSIBILITY: 5-star feedback form shown after order is complete.
// Tap-to-select star rating + optional comment textarea.
// Shows thank-you screen after successful submission.
// DATA FLOW: useCustomerOrder → customer/page.tsx → CustomerFeedbackForm → UI

import { useState } from "react";
import { Star, Loader2, Heart, LogOut } from "lucide-react";
import { ThemeToggle } from "@/components/Theme/ThemeToggle";
import { useAuth } from "@/app/auth/auth_hooks/useAuth";
import { useRouter } from "next/navigation";
import type { CustomerFeedbackFormProps } from "@/app/customer/customer_types/CustomerTypes";

// ─── Constants (Rule 35: No magic strings / numbers) ─────────────────────────

const STAR_COUNT      = 5  as const;
const MIN_RATING      = 1  as const;
const MAX_COMMENT_LEN = 300 as const;

const RATING_LABELS: Record<number, string> = {
  1: "Poor",
  2: "Fair",
  3: "Good",
  4: "Great",
  5: "Excellent!",
};

// ─── Sub-components ───────────────────────────────────────────────────────────

// RESPONSIBILITY: Interactive 5-star rating selector.
function StarRating({
  rating,
  hovered,
  onRate,
  onHover,
  onLeave,
}: {
  rating:  number;
  hovered: number;
  onRate:  (r: number) => void;
  onHover: (r: number) => void;
  onLeave: () => void;
}) {
  const displayRating = hovered > 0 ? hovered : rating;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex gap-2" onMouseLeave={onLeave}>
        {Array.from({ length: STAR_COUNT }, (_, i) => i + 1).map((star) => (
          <button
            key={star}
            onClick={() => onRate(star)}
            onMouseEnter={() => onHover(star)}
            onTouchStart={() => onHover(star)}
            aria-label={`Rate ${star} star${star !== 1 ? "s" : ""}`}
            className="transition-transform active:scale-90 hover:scale-110"
          >
            <Star
              size={40}
              className={[
                "transition-colors duration-150",
                star <= displayRating
                  ? "text-warning fill-warning"
                  : "text-border fill-transparent",
              ].join(" ")}
            />
          </button>
        ))}
      </div>
      {displayRating > 0 && (
        <p className="text-[15px] font-semibold text-text-primary">
          {RATING_LABELS[displayRating]}
        </p>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function CustomerFeedbackForm({
  orderId,
  tableNumber,
  onSubmit,
  isSubmitting,
}: CustomerFeedbackFormProps) {
  const [rating,  setRating]  = useState<number>(0);
  const [hovered, setHovered] = useState<number>(0);
  const [comment, setComment] = useState<string>("");

  const canSubmit = rating >= MIN_RATING && !isSubmitting;

  function handleSubmit() {
    if (!canSubmit) return;
    onSubmit(rating, comment.trim());
  }

  const { logout } = useAuth();
  const router = useRouter();

  return (
    <div className="flex flex-col gap-6 py-4">
      {/* Top Controls */}
      <div className="flex items-center justify-end gap-2 px-4">
        <ThemeToggle />
        <button
          onClick={() => { logout(); router.push("/auth/login"); }}
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-danger/10 text-danger hover:bg-danger hover:text-white transition-colors"
        >
          <LogOut size={16} />
        </button>
      </div>

      {/* Header */}
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success-bg">
          <Heart size={28} className="text-success" fill="currentColor" />
        </div>
        <h1 className="text-[22px] font-bold text-text-primary">How was your experience?</h1>
        <p className="mt-1 text-[13px] text-text-secondary">
          Table {tableNumber} · Order #{orderId.slice(-6).toUpperCase()}
        </p>
      </div>

      {/* Star rating */}
      <div className="rounded-2xl border border-border bg-card p-6 flex flex-col items-center gap-4">
        <p className="text-[14px] font-semibold text-text-primary">Tap to rate your meal</p>
        <StarRating
          rating={rating}
          hovered={hovered}
          onRate={setRating}
          onHover={setHovered}
          onLeave={() => setHovered(0)}
        />
      </div>

      {/* Comment */}
      <div className="rounded-2xl border border-border bg-card p-5 flex flex-col gap-3">
        <label
          htmlFor="feedback-comment"
          className="text-[13px] font-semibold text-text-secondary"
        >
          Tell us more (optional)
        </label>
        <textarea
          id="feedback-comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="What did you love? What can we improve?"
          maxLength={MAX_COMMENT_LEN}
          rows={4}
          className="w-full resize-none rounded-xl border border-border bg-input px-4 py-3 text-[14px] text-text-primary placeholder:text-text-disabled focus:border-border-focus focus:outline-none"
        />
        <p className="text-right text-[11px] text-text-disabled">
          {comment.length}/{MAX_COMMENT_LEN}
        </p>
      </div>

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={!canSubmit}
        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-4 text-[15px] font-bold text-white disabled:opacity-50 active:scale-95 transition-transform"
      >
        {isSubmitting && <Loader2 size={16} className="animate-spin" />}
        {isSubmitting ? "Submitting…" : "Submit Feedback"}
      </button>

      {rating === 0 && (
        <p className="text-center text-[12px] text-text-disabled">
          Please select a star rating to continue
        </p>
      )}
    </div>
  );
}

"use client";

import React from "react";
import { cn } from "@/lib/utils"; // utility for class merging

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  className?: string;
};

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "flex h-10 w-full rounded-md border border-border bg-input text-primary placeholder:text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = "Input";

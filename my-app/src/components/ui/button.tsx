"use client";

import React from "react";
import { cn } from "@/lib/utils"; // Assuming a classNames utility exists

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "destructive";
  className?: string;
  children: React.ReactNode;
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", className, children, ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50 disabled:pointer-events-none";
    const variantStyles = {
      primary: "bg-primary text-primary hover:bg-primary-hover",
      secondary: "bg-secondary text-primary hover:bg-primary-hover",
      destructive: "bg-destructive text-primary hover:bg-primary-hover",
    }[variant];
    return (
      <button
        ref={ref}
        className={cn(baseStyles, variantStyles, className)}
        {...props}
      >
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

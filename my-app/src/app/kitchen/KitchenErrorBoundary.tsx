"use client";

// RESPONSIBILITY: Typed Error Boundary component for Kitchen module (Rule 9)
import React, { Component, ReactNode } from "react";

interface KitchenErrorBoundaryProps {
  children: ReactNode;
}

interface KitchenErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class KitchenErrorBoundary extends Component<KitchenErrorBoundaryProps, KitchenErrorBoundaryState> {
  constructor(props: KitchenErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): KitchenErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error("KitchenErrorBoundary caught an error:", error, errorInfo);
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="p-6 m-4 bg-red-500/10 border border-red-500/30 rounded-xl text-center">
          <h2 className="text-lg font-bold text-red-500 mb-2">Kitchen Module Error</h2>
          <p className="text-sm text-text-secondary mb-4">{this.state.error?.message || "An unexpected error occurred in Kitchen module."}</p>
          <button
            onClick={this.handleReset}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
          >
            Retry
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

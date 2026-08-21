"use client";

// RESPONSIBILITY: Typed Error Boundary component for CustomerReservations module (Rule 9)
import React, { Component, ReactNode } from "react";

interface CustomerReservationsErrorBoundaryProps {
  children: ReactNode;
}

interface CustomerReservationsErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class CustomerReservationsErrorBoundary extends Component<CustomerReservationsErrorBoundaryProps, CustomerReservationsErrorBoundaryState> {
  constructor(props: CustomerReservationsErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): CustomerReservationsErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error("CustomerReservationsErrorBoundary caught an error:", error, errorInfo);
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="p-6 m-4 bg-red-500/10 border border-red-500/30 rounded-xl text-center">
          <h2 className="text-lg font-bold text-red-500 mb-2">CustomerReservations Module Error</h2>
          <p className="text-sm text-text-secondary mb-4">{this.state.error?.message || "An unexpected error occurred in CustomerReservations module."}</p>
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

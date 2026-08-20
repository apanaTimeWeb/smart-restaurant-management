"use client";

// RESPONSIBILITY: Typed Error Boundary component for Admin module (Rule 9)
import React, { Component, ReactNode } from "react";

interface AdminErrorBoundaryProps {
  children: ReactNode;
}

interface AdminErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class AdminErrorBoundary extends Component<AdminErrorBoundaryProps, AdminErrorBoundaryState> {
  constructor(props: AdminErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): AdminErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error("AdminErrorBoundary caught an error:", error, errorInfo);
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="p-6 m-4 bg-red-500/10 border border-red-500/30 rounded-xl text-center">
          <h2 className="text-lg font-bold text-red-500 mb-2">Admin Module Error</h2>
          <p className="text-sm text-text-secondary mb-4">{this.state.error?.message || "An unexpected error occurred in Admin module."}</p>
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

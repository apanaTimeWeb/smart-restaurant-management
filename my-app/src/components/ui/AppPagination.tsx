"use client";

// RESPONSIBILITY: Reusable, generic pagination bar component. Zero business logic.
// DATA FLOW: Parent Table Component → AppPagination.tsx → onPageChange / onPageSizeChange

import React from "react";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

export interface AppPaginationProps {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  pageSizeOptions?: number[];
}

export function AppPagination({
  currentPage,
  totalPages,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [5, 10, 25, 50],
}: AppPaginationProps): React.JSX.Element | null {
  if (totalItems === 0) return null;

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-2 py-3 text-xs text-text-secondary">
      {/* Items Counter Label */}
      <div>
        Showing <span className="font-semibold text-text-primary">{startItem}</span> to{" "}
        <span className="font-semibold text-text-primary">{endItem}</span> of{" "}
        <span className="font-semibold text-text-primary">{totalItems}</span> entries
      </div>

      {/* Page Controls & Page Size Selector */}
      <div className="flex items-center gap-4">
        {/* Page Size Selector */}
        {onPageSizeChange && (
          <div className="flex items-center gap-2">
            <span>Show:</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="rounded-md border border-border bg-input px-2 py-1 text-xs text-text-primary focus:border-border-focus focus:outline-none"
            >
              {pageSizeOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* First/Prev/Next/Last Buttons */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1}
            title="First Page"
            aria-label="First Page"
            className="rounded-md border border-border p-1.5 hover:bg-primary/10 hover:text-text-primary disabled:opacity-30 disabled:hover:bg-transparent"
          >
            <ChevronsLeft size={14} />
          </button>

          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            title="Previous Page"
            aria-label="Previous Page"
            className="rounded-md border border-border p-1.5 hover:bg-primary/10 hover:text-text-primary disabled:opacity-30 disabled:hover:bg-transparent"
          >
            <ChevronLeft size={14} />
          </button>

          <span className="px-2 font-medium text-text-primary">
            Page {currentPage} of {totalPages || 1}
          </span>

          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            title="Next Page"
            aria-label="Next Page"
            className="rounded-md border border-border p-1.5 hover:bg-primary/10 hover:text-text-primary disabled:opacity-30 disabled:hover:bg-transparent"
          >
            <ChevronRight size={14} />
          </button>

          <button
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage >= totalPages}
            title="Last Page"
            aria-label="Last Page"
            className="rounded-md border border-border p-1.5 hover:bg-primary/10 hover:text-text-primary disabled:opacity-30 disabled:hover:bg-transparent"
          >
            <ChevronsRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

"use client";

import React from "react";
import { MdChevronLeft, MdChevronRight } from "react-icons/md";

interface AdminPaginationProps {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  limit?: number;
  onPageChange: (page: number) => void;
  loading?: boolean;
}

const AdminPagination: React.FC<AdminPaginationProps> = ({
  currentPage,
  totalPages,
  totalCount,
  limit = 8,
  onPageChange,
  loading = false,
}) => {
  if (totalCount === 0) return null;

  const startEntry = (currentPage - 1) * limit + 1;
  const endEntry = Math.min(currentPage * limit, totalCount);

  // Generate page numbers with ellipses windowing
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 4) {
        for (let i = 1; i <= 5; i++) pages.push(i);
        pages.push("...");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 3) {
        pages.push(1);
        pages.push("...");
        for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push("...");
        pages.push(currentPage - 1);
        pages.push(currentPage);
        pages.push(currentPage + 1);
        pages.push("...");
        pages.push(totalPages);
      }
    }
    return pages;
  };

  const pages = getPageNumbers();

  return (
    <div className="p-4 sm:px-6 py-3.5 border-t border-zinc-100 flex flex-col sm:flex-row items-center justify-between gap-3 bg-white">
      {/* Entry Count Text */}
      <div className="text-xs text-zinc-500 font-medium flex items-center gap-1.5">
        <span>Showing</span>
        <strong className="text-zinc-900 font-mono font-bold">
          {startEntry}
        </strong>
        <span>to</span>
        <strong className="text-zinc-900 font-mono font-bold">
          {endEntry}
        </strong>
        <span>of</span>
        <strong className="text-zinc-900 font-mono font-bold">
          {totalCount}
        </strong>
        <span>entries</span>
        <span className="text-[10px] text-zinc-400 ml-1">
          (8 per page)
        </span>
        {loading && (
          <span className="ml-2 w-3.5 h-3.5 border-2 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin" />
        )}
      </div>

      {/* Page Navigation Controls */}
      <div className="flex items-center gap-1">
        {/* Previous Button */}
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1 || loading}
          className="p-1.5 rounded-lg border border-zinc-200 text-zinc-600 hover:bg-zinc-100 disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer"
          title="Previous Page"
        >
          <MdChevronLeft className="text-lg" />
        </button>

        {/* Page Buttons */}
        <div className="flex items-center gap-1">
          {pages.map((p, idx) => {
            if (p === "...") {
              return (
                <span
                  key={`ellipsis-${idx}`}
                  className="px-2 py-1 text-xs text-zinc-400 font-mono select-none"
                >
                  …
                </span>
              );
            }

            const pageNum = p as number;
            const isActive = pageNum === currentPage;

            return (
              <button
                key={`page-${pageNum}`}
                type="button"
                onClick={() => onPageChange(pageNum)}
                disabled={loading}
                className={`min-w-8 h-8 px-2 rounded-lg text-xs font-bold font-mono transition cursor-pointer ${
                  isActive
                    ? "bg-zinc-950 text-white shadow-xs"
                    : "text-zinc-600 hover:bg-zinc-100 border border-transparent hover:border-zinc-200"
                }`}
              >
                {pageNum}
              </button>
            );
          })}
        </div>

        {/* Next Button */}
        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages || loading}
          className="p-1.5 rounded-lg border border-zinc-200 text-zinc-600 hover:bg-zinc-100 disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer"
          title="Next Page"
        >
          <MdChevronRight className="text-lg" />
        </button>
      </div>
    </div>
  );
};

export default AdminPagination;


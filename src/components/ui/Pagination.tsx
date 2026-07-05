import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  const pages = Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
    if (totalPages <= 7) return i + 1;
    if (currentPage <= 4) return i + 1;
    if (currentPage >= totalPages - 3) return totalPages - 6 + i;
    return currentPage - 3 + i;
  });
  return (
    <div className="flex items-center gap-1">
      <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}
        className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
        <ChevronLeft className="w-4 h-4 text-slate-600" />
      </button>
      {pages.map(p => (
        <button key={p} onClick={() => onPageChange(p)}
          className={`w-9 h-9 flex items-center justify-center rounded-xl text-sm font-medium transition-all ${p === currentPage ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30' : 'border border-slate-200 hover:bg-slate-50 text-slate-600'}`}>
          {p}
        </button>
      ))}
      <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages}
        className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
        <ChevronRight className="w-4 h-4 text-slate-600" />
      </button>
    </div>
  );
}

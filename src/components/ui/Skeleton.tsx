import React from 'react';

interface SkeletonProps {
  className?: string;
  lines?: number;
  height?: string;
}

export function Skeleton({ className = '', height = 'h-4' }: SkeletonProps) {
  return <div className={`animate-pulse bg-slate-200 rounded-lg ${height} ${className}`} />;
}

export function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
      <Skeleton height="h-48" className="rounded-none" />
      <div className="p-4 space-y-3">
        <Skeleton className="w-3/4" />
        <Skeleton className="w-1/2" />
        <Skeleton className="w-full" />
        <div className="flex gap-2">
          <Skeleton className="flex-1 h-8" />
          <Skeleton className="flex-1 h-8" />
        </div>
      </div>
    </div>
  );
}

export function BusinessCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
      <Skeleton height="h-32" className="rounded-none" />
      <div className="p-4 space-y-3">
        <div className="flex gap-3">
          <Skeleton className="w-12 h-12 rounded-xl flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="w-3/4" />
            <Skeleton className="w-1/2" />
          </div>
        </div>
        <Skeleton className="w-full" />
        <Skeleton className="w-2/3" />
      </div>
    </div>
  );
}

export default Skeleton;

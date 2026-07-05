import React from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
  reviewCount?: number;
}

export default function StarRating({ rating, max = 5, size = 'md', showValue = false, reviewCount }: StarRatingProps) {
  const sizes = { sm: 'w-3 h-3', md: 'w-4 h-4', lg: 'w-5 h-5' };
  const textSizes = { sm: 'text-xs', md: 'text-sm', lg: 'text-base' };
  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center">
        {Array.from({ length: max }).map((_, i) => (
          <Star
            key={i}
            className={`${sizes[size]} ${i < Math.floor(rating) ? 'text-amber-400 fill-amber-400' : i < rating ? 'text-amber-400 fill-amber-200' : 'text-slate-300 fill-slate-100'}`}
          />
        ))}
      </div>
      {showValue && <span className={`font-semibold text-slate-700 ${textSizes[size]}`}>{rating.toFixed(1)}</span>}
      {reviewCount !== undefined && <span className={`text-slate-400 ${textSizes[size]}`}>({reviewCount.toLocaleString()})</span>}
    </div>
  );
}

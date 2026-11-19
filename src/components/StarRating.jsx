import React from 'react';
import { Star } from 'lucide-react';

export default function StarRating({
  rating = 0,
  size = 18,
  interactive = false,
  onSelect
}) {
  const rounded = Math.round(Number(rating) || 0);

  return (
    <div
      style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}
      aria-label={`Rating ${rating} out of 5`}
    >
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= rounded;
        return (
          <button
            key={star}
            type="button"
            disabled={!interactive}
            onClick={(e) => {
              if (interactive && onSelect) {
                e.stopPropagation();
                onSelect(star);
              }
            }}
            style={{
              background: 'transparent',
              border: 'none',
              padding: 0,
              cursor: interactive ? 'pointer' : 'default',
              display: 'inline-flex'
            }}
          >
            <Star
              size={size}
              fill={filled ? 'var(--star-gold)' : 'var(--star-empty)'}
              color={filled ? '#9a7d0a' : 'var(--star-empty)'}
              strokeWidth={1.6}
            />
          </button>
        );
      })}
    </div>
  );
}
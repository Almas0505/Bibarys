/**
 * Star Rating Component (readonly and editable)
 */

import { useState } from 'react';

interface RatingProps {
  value: number;
  onChange?: (rating: number) => void;
  readonly?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
}

export default function Rating({ 
  value, 
  onChange, 
  readonly = false, 
  size = 'md',
  showValue = false 
}: RatingProps) {
  const [hoverRating, setHoverRating] = useState(0);
  
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  const handleClick = (rating: number) => {
    if (!readonly && onChange) {
      onChange(rating);
    }
  };

  const handleMouseEnter = (rating: number) => {
    if (!readonly) {
      setHoverRating(rating);
    }
  };

  const handleMouseLeave = () => {
    if (!readonly) {
      setHoverRating(0);
    }
  };

  const displayRating = hoverRating || value;

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => handleClick(star)}
          onMouseEnter={() => handleMouseEnter(star)}
          onMouseLeave={handleMouseLeave}
          disabled={readonly}
          className={`${readonly ? '' : 'cursor-pointer hover:scale-110 transition-transform'} ${sizeClasses[size]}`}
          aria-label={`Rate ${star} stars`}
        >
          <svg
            className={`${star <= displayRating ? 'text-yellow-400' : 'text-gray-300'} fill-current`}
            viewBox="0 0 20 20"
          >
            <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
          </svg>
        </button>
      ))}
      {showValue && (
        <span className="ml-2 text-sm text-gray-600">
          {value.toFixed(1)}
        </span>
      )}
    </div>
  );
}

import React, { useState } from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  value: number; // 0 to 5 in 0.5 increments
  onChange?: (val: number) => void;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  readOnly?: boolean;
  showNumeric?: boolean;
  className?: string;
}

export const StarRating: React.FC<StarRatingProps> = ({
  value,
  onChange,
  size = 'md',
  readOnly = false,
  showNumeric = false,
  className = ''
}) => {
  const [hoverValue, setHoverValue] = useState<number | null>(null);

  const displayValue = hoverValue !== null ? hoverValue : value;

  const sizeStyles = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
    xl: 'w-7 h-7'
  };

  const textStyles = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
    xl: 'text-lg font-bold'
  };

  const handleMouseMove = (starIndex: number, e: React.MouseEvent<HTMLDivElement>) => {
    if (readOnly || !onChange) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const isHalf = x < rect.width / 2;
    const rating = isHalf ? starIndex - 0.5 : starIndex;
    setHoverValue(rating);
  };

  const handleClick = (starIndex: number, e: React.MouseEvent<HTMLDivElement>) => {
    if (readOnly || !onChange) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const isHalf = x < rect.width / 2;
    const rating = isHalf ? starIndex - 0.5 : starIndex;
    
    // Clicking the same rating clears it
    if (value === rating) {
      onChange(0);
    } else {
      onChange(rating);
    }
  };

  return (
    <div 
      className={`inline-flex items-center gap-1 ${className}`}
      onMouseLeave={() => !readOnly && setHoverValue(null)}
      id="letterboxd-star-rating-container"
    >
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((starIndex) => {
          const isFull = displayValue >= starIndex;
          const isHalf = displayValue >= starIndex - 0.5 && displayValue < starIndex;

          return (
            <div
              key={starIndex}
              id={`star-item-${starIndex}`}
              className={`relative cursor-pointer transition-transform duration-75 ${
                readOnly ? 'cursor-default' : 'hover:scale-110 active:scale-95'
              }`}
              onMouseMove={(e) => handleMouseMove(starIndex, e)}
              onClick={(e) => handleClick(starIndex, e)}
            >
              {/* Background empty star (Letterboxd muted dark grey) */}
              <Star 
                className={`${sizeStyles[size]} text-[#2c3440] fill-[#2c3440] stroke-none`} 
              />

              {/* Full Star Overlay (Letterboxd Bright Green) */}
              {isFull && (
                <div className="absolute inset-0 overflow-hidden">
                  <Star 
                    className={`${sizeStyles[size]} text-[#00e054] fill-[#00e054] stroke-none drop-shadow-[0_0_6px_rgba(0,224,84,0.3)]`} 
                  />
                </div>
              )}

              {/* Half Star Overlay */}
              {isHalf && (
                <div className="absolute inset-0 overflow-hidden w-1/2">
                  <Star 
                    className={`${sizeStyles[size]} text-[#00e054] fill-[#00e054] stroke-none`} 
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {showNumeric && displayValue > 0 && (
        <span className={`text-[#00e054] font-semibold tracking-wide ml-1.5 ${textStyles[size]}`}>
          {displayValue.toFixed(1)}
        </span>
      )}
    </div>
  );
};

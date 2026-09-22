import React from 'react';
import { Star } from 'lucide-react';

interface RatingHistogramProps {
  distribution?: Record<number, number>; // ratings 0.5, 1.0, 1.5 ... 5.0 -> count
  averageRating: number;
  totalRatings: number;
  className?: string;
}

export const RatingHistogram: React.FC<RatingHistogramProps> = ({
  distribution,
  averageRating,
  totalRatings,
  className = ''
}) => {
  // Generate realistic bell curve if custom distribution not passed
  const ratings = [0.5, 1.0, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0, 4.5, 5.0];

  const dist = distribution || {
    0.5: Math.round(totalRatings * 0.01),
    1.0: Math.round(totalRatings * 0.02),
    1.5: Math.round(totalRatings * 0.03),
    2.0: Math.round(totalRatings * 0.05),
    2.5: Math.round(totalRatings * 0.08),
    3.0: Math.round(totalRatings * 0.12),
    3.5: Math.round(totalRatings * 0.18),
    4.0: Math.round(totalRatings * 0.24),
    4.5: Math.round(totalRatings * 0.28),
    5.0: Math.round(totalRatings * 0.19),
  };

  const counts = Object.values(dist) as number[];
  const maxCount = Math.max(...counts, 1);

  return (
    <div className={`bg-[#181e24] border border-[#2c3440] rounded-lg p-4 ${className}`} id="rating-histogram-card">
      <div className="flex items-baseline justify-between mb-3 border-b border-[#2c3440]/60 pb-2">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-black text-white tracking-tight">{averageRating.toFixed(1)}</span>
          <div className="flex items-center text-[#00e054]">
            <Star className="w-4 h-4 fill-[#00e054] stroke-none" />
          </div>
          <span className="text-xs text-[#9ab] font-medium uppercase tracking-wider ml-1">Letterboxd Avg</span>
        </div>
        <div className="text-xs text-[#678] font-mono">
          {totalRatings.toLocaleString()} ratings
        </div>
      </div>

      {/* Vertical bars */}
      <div className="h-24 flex items-end justify-between gap-1.5 pt-2 px-1">
        {ratings.map((rate) => {
          const count = dist[rate] || 0;
          const heightPercent = Math.max(8, Math.round((count / maxCount) * 100));
          const isHighest = count === maxCount;

          return (
            <div 
              key={rate} 
              className="flex-1 flex flex-col items-center h-full justify-end group relative cursor-pointer"
              title={`${rate} stars: ${count.toLocaleString()} votes`}
            >
              {/* Tooltip on hover */}
              <div className="absolute -top-7 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none bg-[#14181c] text-[#00e054] text-[10px] font-mono py-0.5 px-1.5 rounded border border-[#2c3440] whitespace-nowrap z-20 shadow-lg">
                {rate}★ : {count.toLocaleString()}
              </div>

              {/* Bar */}
              <div 
                className={`w-full rounded-t-sm transition-all duration-300 ${
                  isHighest 
                    ? 'bg-[#00e054] shadow-[0_0_8px_rgba(0,224,84,0.4)]' 
                    : 'bg-[#445566] group-hover:bg-[#00e054]/80'
                }`}
                style={{ height: `${heightPercent}%` }}
              />

              {/* Star marker label underneath */}
              <span className="text-[9px] font-mono text-[#678] group-hover:text-[#00e054] mt-1.5 select-none">
                {rate % 1 === 0 ? `${rate}` : '·'}
              </span>
            </div>
          );
        })}
      </div>

      <div className="flex justify-between items-center text-[10px] text-[#678] pt-2 px-1 border-t border-[#2c3440]/40 mt-1 font-mono uppercase">
        <span>0.5★ lowest</span>
        <span>Rating Curve</span>
        <span>5.0★ masterpiece</span>
      </div>
    </div>
  );
};

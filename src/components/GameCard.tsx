import React from 'react';
import { Game } from '../types';
import { Check, Heart, Clock, Plus, Star } from 'lucide-react';

interface GameCardProps {
  game: Game;
  onSelect: (game: Game) => void;
  onQuickLog?: (game: Game) => void;
  onToggleWatchlist?: (gameId: string) => void;
  onToggleLike?: (gameId: string) => void;
  isPlayed?: boolean;
  isLiked?: boolean;
  isWatchlisted?: boolean;
  userRating?: number;
  showTitleBelow?: boolean;
  size?: 'sm' | 'md' | 'lg';
  rank?: number;
}

const GameCardComponent: React.FC<GameCardProps> = ({
  game,
  onSelect,
  onQuickLog,
  onToggleWatchlist,
  onToggleLike,
  isPlayed = false,
  isLiked = false,
  isWatchlisted = false,
  userRating,
  showTitleBelow = true,
  size = 'md',
  rank
}) => {
  const sizeClasses = {
    sm: 'w-full max-w-[130px]',
    md: 'w-full',
    lg: 'w-full max-w-[260px]'
  };

  const hltbMainHours = game.hltb?.mainStory || game.playtimeHours;

  return (
    <div 
      className={`group relative flex flex-col ${sizeClasses[size]} transition-transform duration-150 will-change-transform`}
      id={`game-card-${game.id}`}
    >
      {/* Poster Container */}
      <div 
        onClick={() => onSelect(game)}
        className="relative aspect-[2/3] w-full rounded-[4px] overflow-hidden bg-[#1f252d] border border-[#2c3440] cursor-pointer shadow-md group-hover:border-[#00e054] group-hover:shadow-[0_0_12px_rgba(0,224,84,0.25)] transition-all duration-150"
      >
        <img
          src={game.coverUrl}
          alt={game.title}
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
        />

        {/* Rank Badge (For ranked lists) or Featured Tag Badge */}
        {rank !== undefined ? (
          <div className="absolute top-1.5 left-1.5 bg-[#14181c]/90 text-[#00e054] font-mono text-xs font-bold px-1.5 py-0.5 rounded border border-[#2c3440] z-10">
            #{rank}
          </div>
        ) : game.featuredTag ? (
          <div className="absolute top-1.5 left-1.5 bg-[#ff8000] text-[#14181c] font-mono text-[9px] font-black uppercase px-1.5 py-0.5 rounded shadow z-10 pointer-events-none tracking-wider">
            {game.featuredTag}
          </div>
        ) : null}

        {/* User state badges on poster */}
        <div className="absolute top-1.5 right-1.5 flex flex-col gap-1 z-10 pointer-events-none">
          {isPlayed && (
            <div className="w-5 h-5 rounded-full bg-[#00e054] text-[#14181c] flex items-center justify-center shadow">
              <Check className="w-3.5 h-3.5 stroke-[3]" />
            </div>
          )}
          {isLiked && (
            <div className="w-5 h-5 rounded-full bg-[#ff8000] text-white flex items-center justify-center shadow">
              <Heart className="w-3 h-3 fill-current" />
            </div>
          )}
          {isWatchlisted && !isPlayed && (
            <div className="w-5 h-5 rounded-full bg-[#40bcf4] text-[#14181c] flex items-center justify-center shadow">
              <Clock className="w-3 h-3 stroke-[2.5]" />
            </div>
          )}
        </div>

        {/* Hover Overlay with Letterboxd Quick Actions (Pure CSS for 60fps performance) */}
        <div 
          className="absolute inset-0 bg-gradient-to-t from-[#14181c] via-[#14181c]/60 to-transparent transition-opacity duration-150 flex flex-col justify-between p-2 z-20 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto"
        >
          {/* Top of hover overlay: Rating & HLTB Time */}
          <div className="flex items-center justify-between gap-1">
            <div className="flex items-center gap-1 bg-[#14181c]/90 px-1.5 py-0.5 rounded text-[11px] font-bold text-[#00e054] shadow-sm">
              <Star className="w-3 h-3 fill-[#00e054] stroke-none" />
              <span>{game.averageRating.toFixed(1)}</span>
            </div>
            {hltbMainHours ? (
              <span className="text-[10px] text-[#40bcf4] font-mono font-bold bg-[#14181c]/90 px-1.5 py-0.5 rounded border border-[#40bcf4]/30 flex items-center gap-0.5 shadow-sm" title="HowLongToBeat Main Story">
                <Clock className="w-2.5 h-2.5" />
                {hltbMainHours}h
              </span>
            ) : null}
          </div>

          {/* User rating indicator if logged */}
          {userRating && (
            <div className="text-center">
              <span className="text-[10px] text-[#00e054] font-semibold bg-[#14181c]/90 px-1.5 py-0.5 rounded border border-[#00e054]/30">
                You: {userRating}★
              </span>
            </div>
          )}

          {/* Bottom of hover overlay: Quick action buttons */}
          <div className="flex items-center justify-center gap-1.5 pt-2" onClick={(e) => e.stopPropagation()}>
            {onToggleLike && (
              <button
                type="button"
                id={`card-like-btn-${game.id}`}
                onClick={() => onToggleLike(game.id)}
                title={isLiked ? "Unlike" : "Like"}
                className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
                  isLiked ? 'bg-[#ff8000] text-white' : 'bg-[#2c3440]/90 text-[#9ab] hover:text-[#ff8000] hover:bg-[#14181c]'
                }`}
              >
                <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-current' : ''}`} />
              </button>
            )}

            {onToggleWatchlist && (
              <button
                type="button"
                id={`card-watchlist-btn-${game.id}`}
                onClick={() => onToggleWatchlist(game.id)}
                title={isWatchlisted ? "In Backlog" : "Add to Backlog"}
                className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
                  isWatchlisted ? 'bg-[#40bcf4] text-[#14181c]' : 'bg-[#2c3440]/90 text-[#9ab] hover:text-[#40bcf4] hover:bg-[#14181c]'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
              </button>
            )}

            {onQuickLog && (
              <button
                type="button"
                id={`card-quicklog-btn-${game.id}`}
                onClick={() => onQuickLog(game)}
                title="Log, rate or review"
                className="w-7 h-7 rounded-full bg-[#00e054] text-[#14181c] font-black flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Title & Metadata below */}
      {showTitleBelow && (
        <div className="mt-1.5 flex flex-col">
          <button 
            type="button"
            onClick={() => onSelect(game)}
            className="text-left text-xs sm:text-[13px] font-semibold text-[#e0e6ed] hover:text-[#00e054] truncate transition-colors leading-tight"
            title={game.title}
          >
            {game.title}
          </button>
          <div className="flex items-center justify-between text-[11px] text-[#678] font-mono mt-0.5">
            <span>{game.releaseYear}</span>
            {hltbMainHours ? (
              <span className="text-[#40bcf4] font-medium" title="HowLongToBeat: Main Story length">
                {hltbMainHours}h
              </span>
            ) : userRating ? (
              <span className="text-[#00e054] font-medium">{userRating}★</span>
            ) : (
              <span className="text-[#9ab]">{game.platforms[0]?.split(' ')[0]}</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export const GameCard = React.memo(GameCardComponent);

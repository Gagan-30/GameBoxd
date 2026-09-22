import React, { useState } from 'react';
import { JournalEntry, Game } from '../types';
import { StarRating } from './StarRating';
import { 
  Calendar, RotateCcw, Heart, Share2, Edit3, Trash2, 
  Filter, Search, Clock, Tag, Gamepad2, ArrowUpDown 
} from 'lucide-react';

interface DiaryViewProps {
  entries: JournalEntry[];
  games: Game[];
  onSelectGame: (game: Game) => void;
  onEditEntry: (entry: JournalEntry) => void;
  onDeleteEntry: (entryId: string) => void;
  onShareEntry: (game: Game, entry: JournalEntry) => void;
  onOpenLogModal: () => void;
}

export const DiaryView: React.FC<DiaryViewProps> = ({
  entries = [],
  games = [],
  onSelectGame,
  onEditEntry,
  onDeleteEntry,
  onShareEntry,
  onOpenLogModal
}) => {
  const [filterYear, setFilterYear] = useState<string>('all');
  const [filterRating, setFilterRating] = useState<string>('all');
  const [replaysOnly, setReplaysOnly] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest' | 'highest'>('newest');

  const safeEntries = entries || [];

  // Extract unique years from entries
  const availableYears = Array.from(
    new Set(safeEntries.map(e => e.datePlayed ? e.datePlayed.split('-')[0] : '').filter(Boolean))
  ).sort().reverse();

  // Filter & Sort
  const filteredEntries = safeEntries.filter((entry) => {
    if (filterYear !== 'all' && (!entry.datePlayed || !entry.datePlayed.startsWith(filterYear))) return false;
    if (filterRating !== 'all' && (entry.rating || 0) < Number(filterRating)) return false;
    if (replaysOnly && !entry.isReplay) return false;
    if (searchQuery.trim() && !entry.gameTitle?.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  }).sort((a, b) => {
    if (sortOrder === 'newest') return new Date(b.datePlayed).getTime() - new Date(a.datePlayed).getTime();
    if (sortOrder === 'oldest') return new Date(a.datePlayed).getTime() - new Date(b.datePlayed).getTime();
    if (sortOrder === 'highest') return (b.rating || 0) - (a.rating || 0);
    return 0;
  });

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr + 'T00:00:00');
      const month = d.toLocaleString('en-US', { month: 'short' }).toUpperCase();
      const day = d.getDate();
      return { month, day };
    } catch {
      return { month: 'LOG', day: '' };
    }
  };

  const getGameById = (gameId: string) => games.find(g => g.id === gameId);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6" id="diary-view-container">
      {/* Diary Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#2c3440] pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-wider text-white flex items-center gap-3">
            <span>Diary & Log History</span>
            <span className="text-xs sm:text-sm font-mono font-normal text-[#00e054] bg-[#00e054]/10 border border-[#00e054]/30 px-2.5 py-0.5 rounded-full">
              {entries.length} logged
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-[#9ab] font-mono mt-1">
            Chronological record of every video game played, completed, reviewed, and re-experienced.
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenLogModal}
          className="bg-[#00e054] hover:bg-[#00e054]/90 text-[#14181c] font-black uppercase text-xs tracking-wider px-4 py-2 rounded-full shadow-[0_0_12px_rgba(0,224,84,0.3)] self-start md:self-auto transition-transform active:scale-95"
        >
          + Log Another Game
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-[#181e24] border border-[#2c3440] rounded-lg p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-[#678]" />
            <input
              type="text"
              placeholder="Filter by game title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-[#14181c] border border-[#2c3440] focus:border-[#00e054] rounded-md pl-8 pr-3 py-1.5 text-xs text-white placeholder-[#678] outline-none w-44"
            />
          </div>

          {/* Year Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-[#678] font-mono uppercase text-[10px]">Year:</span>
            <select
              value={filterYear}
              onChange={(e) => setFilterYear(e.target.value)}
              className="bg-[#14181c] border border-[#2c3440] text-white text-xs rounded px-2 py-1 outline-none font-mono"
            >
              <option value="all">All Years</option>
              {availableYears.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          {/* Rating Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-[#678] font-mono uppercase text-[10px]">Rating:</span>
            <select
              value={filterRating}
              onChange={(e) => setFilterRating(e.target.value)}
              className="bg-[#14181c] border border-[#2c3440] text-white text-xs rounded px-2 py-1 outline-none font-mono"
            >
              <option value="all">All Ratings</option>
              <option value="4.5">4.5★ & up</option>
              <option value="4.0">4.0★ & up</option>
              <option value="3.0">3.0★ & up</option>
            </select>
          </div>

          {/* Replays Only Toggle */}
          <button
            type="button"
            onClick={() => setReplaysOnly(!replaysOnly)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded border transition-colors ${
              replaysOnly 
                ? 'bg-[#00e054]/10 border-[#00e054] text-[#00e054]' 
                : 'border-[#2c3440] text-[#9ab] hover:border-[#9ab]'
            }`}
          >
            <RotateCcw className="w-3 h-3" />
            <span>Rewinds Only</span>
          </button>
        </div>

        {/* Sort */}
        <div className="flex items-center gap-1.5">
          <ArrowUpDown className="w-3 h-3 text-[#678]" />
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as any)}
            className="bg-[#14181c] border border-[#2c3440] text-white text-xs rounded px-2 py-1 outline-none font-mono"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="highest">Highest Rated</option>
          </select>
        </div>
      </div>

      {/* Letterboxd Chronological Diary Table */}
      {filteredEntries.length > 0 ? (
        <div className="bg-[#181e24] border border-[#2c3440] rounded-xl overflow-hidden shadow-lg">
          <div className="divide-y divide-[#2c3440]/60">
            {filteredEntries.map((entry) => {
              const { month, day } = formatDate(entry.datePlayed);
              const fullGame = getGameById(entry.gameId);

              return (
                <div 
                  key={entry.id} 
                  className="p-3.5 sm:p-4 hover:bg-[#1f252d] transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
                  id={`diary-row-${entry.id}`}
                >
                  {/* Left: Date & Poster & Title */}
                  <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                    {/* Date badge */}
                    <div className="w-12 text-center font-mono shrink-0">
                      <div className="text-xs text-[#9ab] font-bold tracking-wider">{month}</div>
                      <div className="text-lg font-black text-white leading-none">{day}</div>
                    </div>

                    {/* Poster thumbnail */}
                    <div 
                      onClick={() => fullGame && onSelectGame(fullGame)}
                      className="aspect-[2/3] w-12 sm:w-14 rounded overflow-hidden bg-[#14181c] border border-[#2c3440] shrink-0 cursor-pointer shadow group-hover:border-[#00e054] transition-colors"
                    >
                      <img
                        src={entry.gameCoverUrl}
                        alt={entry.gameTitle}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Details */}
                    <div className="min-w-0">
                      <div className="flex items-baseline gap-2">
                        <h3 
                          onClick={() => fullGame && onSelectGame(fullGame)}
                          className="font-extrabold text-sm sm:text-base text-white hover:text-[#00e054] cursor-pointer truncate transition-colors"
                        >
                          {entry.gameTitle}
                        </h3>
                        <span className="text-xs text-[#678] font-mono">
                          {entry.releaseYear}
                        </span>
                      </div>

                      {/* Letterboxd Ratings & Badges Row */}
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        <StarRating value={entry.rating} readOnly size="sm" showNumeric />
                        {entry.isLiked && (
                          <span title="Liked">
                            <Heart className="w-3.5 h-3.5 text-[#ff8000] fill-current" />
                          </span>
                        )}
                        {entry.isReplay && (
                          <span title="Replay" className="text-[#00e054]">
                            <RotateCcw className="w-3.5 h-3.5" />
                          </span>
                        )}
                        {entry.platform && (
                          <span className="text-[10px] font-mono bg-[#14181c] text-[#9ab] px-1.5 py-0.5 rounded border border-[#2c3440]">
                            {entry.platform}
                          </span>
                        )}
                        {entry.hoursPlayed && (
                          <span className="text-[10px] font-mono text-[#40bcf4] flex items-center gap-0.5">
                            <Clock className="w-2.5 h-2.5" />
                            {entry.hoursPlayed}h
                          </span>
                        )}
                      </div>

                      {/* Review snippet */}
                      {entry.reviewText && (
                        <p className="text-xs text-[#9ab] italic mt-1 line-clamp-2 max-w-xl">
                          "{entry.reviewText}"
                        </p>
                      )}

                      {/* Tags */}
                      {entry.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {entry.tags.map(tag => (
                            <span key={tag} className="text-[9px] font-mono text-[#678] bg-[#14181c] px-1 rounded">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Actions: Edit, Delete, Share */}
                  <div className="flex items-center gap-1.5 self-end sm:self-center opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={() => fullGame && onShareEntry(fullGame, entry)}
                      className="p-1.5 rounded text-[#9ab] hover:text-[#ff8000] hover:bg-[#14181c] transition-colors"
                      title="Generate Social Share Card"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onEditEntry(entry)}
                      className="p-1.5 rounded text-[#9ab] hover:text-[#00e054] hover:bg-[#14181c] transition-colors"
                      title="Edit this entry"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteEntry(entry.id)}
                      className="p-1.5 rounded text-[#9ab] hover:text-red-400 hover:bg-[#14181c] transition-colors"
                      title="Delete log"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="bg-[#181e24] border border-[#2c3440] rounded-xl p-12 text-center space-y-3">
          <Calendar className="w-10 h-10 text-[#678] mx-auto" />
          <h3 className="text-base font-bold text-white">No journal entries found</h3>
          <p className="text-xs text-[#9ab] max-w-sm mx-auto font-mono">
            {searchQuery || filterYear !== 'all' 
              ? 'Try changing your search query or filter settings.' 
              : 'Start building your gaming history by logging the games you have played!'}
          </p>
          <button
            type="button"
            onClick={onOpenLogModal}
            className="mt-2 bg-[#00e054] text-[#14181c] font-black uppercase text-xs tracking-wider px-4 py-2 rounded-full"
          >
            + Log Your First Game
          </button>
        </div>
      )}
    </div>
  );
};

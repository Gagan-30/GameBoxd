import React, { useState, useEffect } from 'react';
import { Game } from '../types';
import { Search, X, Sparkles, Plus, Star, ArrowRight, Loader2, Gamepad2, Clock } from 'lucide-react';
import { useLockBodyScroll } from '../hooks/useLockBodyScroll';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  allGames: Game[];
  onSelectGame: (game: Game) => void;
  onQuickLog: (game: Game) => void;
  onAddNewGameToDatabase: (game: Game) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  allGames = [],
  onSelectGame,
  onQuickLog,
  onAddNewGameToDatabase
}) => {
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [isSearchingApi, setIsSearchingApi] = useState(false);
  const [apiResults, setApiResults] = useState<Game[]>([]);

  useLockBodyScroll(isOpen);
  const [apiError, setApiError] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      setApiResults([]);
      setApiError('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filterCategories = [
    'all',
    'Action RPG',
    'CRPG',
    'Souls-like',
    'Open World',
    'Metroidvania',
    'Platformer',
    'Sci-Fi'
  ];

  const safeGames = allGames || [];

  // Local search
  const localResults = safeGames.filter(game => {
    const titleMatch = game.title?.toLowerCase().includes(query.toLowerCase());
    const devMatch = game.developer?.toLowerCase().includes(query.toLowerCase());
    const genreMatch = (game.genres || []).some(g => g.toLowerCase().includes(query.toLowerCase()));
    const matchesQuery = !query.trim() || titleMatch || devMatch || genreMatch;

    const matchesFilter = activeFilter === 'all' ||
      (game.genres || []).some(g => g.toLowerCase() === activeFilter.toLowerCase());

    return Boolean(matchesQuery && matchesFilter);
  });

  // Call API for live external lookup
  const handleLiveApiSearch = async () => {
    if (!query.trim()) return;
    setIsSearchingApi(true);
    setApiError('');

    try {
      const res = await fetch('/api/games/ai-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: query.trim() })
      });
      const data = await res.json();

      if (data.success && data.games && data.games.length > 0) {
        setApiResults(data.games);
        // Automatically register to local database
        data.games.forEach((newGame: Game) => {
          onAddNewGameToDatabase(newGame);
        });
      } else {
        setApiError('No new metadata found from game servers. Check spelling or try popular titles.');
      }
    } catch (e: any) {
      setApiError('External API unavailable. Showing local results.');
    } finally {
      setIsSearchingApi(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-start justify-center p-3 sm:p-6 pt-12 sm:pt-20 bg-[#0b0e11]/90 backdrop-blur-sm overflow-hidden transform-gpu will-change-transform"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-[#1b2228] border border-[#2c3440] rounded-xl w-full max-w-2xl shadow-2xl overflow-hidden relative animate-in zoom-in-95 flex flex-col max-h-[85vh]">
        {/* Search Input Bar */}
        <div className="p-3 sm:p-4 bg-[#14181c] border-b border-[#2c3440] flex items-center gap-3">
          <Search className="w-5 h-5 text-[#00e054] shrink-0" />
          <input
            type="text"
            placeholder="Search games, developers, genres (e.g. Elden Ring, Baldur's Gate)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleLiveApiSearch();
            }}
            className="flex-1 bg-transparent text-sm sm:text-base text-white placeholder-[#678] outline-none font-medium"
            autoFocus
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="text-[#678] hover:text-[#9ab] p-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="text-xs text-[#9ab] hover:text-white px-2 py-1 rounded bg-[#202830] border border-[#2c3440]"
          >
            Esc
          </button>
        </div>

        {/* Category Filters */}
        <div className="px-3 py-2 bg-[#181e24] border-b border-[#2c3440] flex items-center gap-1.5 overflow-x-auto text-xs no-scrollbar">
          {filterCategories.map(cat => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveFilter(cat)}
              className={`px-2.5 py-1 rounded-full text-[11px] font-mono whitespace-nowrap transition-colors uppercase ${
                activeFilter === cat 
                  ? 'bg-[#00e054] text-[#14181c] font-bold' 
                  : 'bg-[#14181c] text-[#9ab] hover:text-white border border-[#2c3440]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Results List */}
        <div className="p-3 sm:p-4 overflow-y-auto flex-1 space-y-2 custom-scrollbar">
          {/* External API button if search query exists */}
          {query.trim().length > 1 && (
            <div className="p-3 bg-[#14181c] rounded-lg border border-[#2c3440] flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#40bcf4]" />
                <span className="text-xs text-[#e0e6ed]">
                  Can't find it in local database? Pull live metadata & cover art for "{query}".
                </span>
              </div>
              <button
                type="button"
                onClick={handleLiveApiSearch}
                disabled={isSearchingApi}
                className="bg-[#40bcf4] hover:bg-[#40bcf4]/90 text-[#14181c] text-xs font-mono font-bold px-3 py-1.5 rounded flex items-center gap-1.5 shrink-0 transition-transform active:scale-95 disabled:opacity-50"
              >
                {isSearchingApi ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Searching API...</span>
                  </>
                ) : (
                  <>
                    <span>Live Metadata API</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          )}

          {apiError && (
            <div className="text-xs text-[#ff8000] font-mono p-2 bg-[#ff8000]/10 rounded border border-[#ff8000]/30">
              {apiError}
            </div>
          )}

          {/* Results grid / rows */}
          <div className="divide-y divide-[#2c3440]/60">
            {localResults.map(game => (
              <div
                key={game.id}
                className="py-2.5 px-2 hover:bg-[#1f252d] rounded-lg transition-colors flex items-center justify-between gap-3 group"
              >
                <div 
                  onClick={() => {
                    onSelectGame(game);
                    onClose();
                  }}
                  className="flex items-center gap-3 min-w-0 cursor-pointer flex-1"
                >
                  <img
                    src={game.coverUrl}
                    alt={game.title}
                    referrerPolicy="no-referrer"
                    className="w-10 h-14 object-cover rounded-[3px] border border-[#2c3440] shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="flex items-baseline gap-2">
                      <h4 className="text-sm font-bold text-white group-hover:text-[#00e054] truncate transition-colors">
                        {game.title}
                      </h4>
                      <span className="text-xs text-[#678] font-mono">{game.releaseYear}</span>
                    </div>
                    <div className="text-[11px] text-[#9ab] font-mono truncate">
                      {game.developer} · {game.genres.slice(0, 2).join(', ')}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 text-[10px] font-mono flex-wrap">
                      <span className="text-[#00e054] flex items-center gap-1">
                        <Star className="w-3 h-3 fill-[#00e054] stroke-none inline" />
                        <span>{game.averageRating.toFixed(1)} ★</span>
                      </span>
                      {(game.hltb?.mainStory || game.playtimeHours) && (
                        <span className="text-[#40bcf4] flex items-center gap-1 bg-[#14181c] px-1.5 py-0.5 leading-none rounded border border-[#2c3440]">
                          <Clock className="w-2.5 h-2.5 inline" />
                          <span>{game.hltb?.mainStory || game.playtimeHours}h HLTB</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      onQuickLog(game);
                      onClose();
                    }}
                    className="bg-[#00e054] text-[#14181c] font-black p-1.5 rounded-full hover:scale-110 active:scale-95 transition-transform"
                    title="Log / Review this game"
                  >
                    <Plus className="w-4 h-4 stroke-[3]" />
                  </button>
                </div>
              </div>
            ))}

            {localResults.length === 0 && !isSearchingApi && (
              <div className="py-12 text-center space-y-3">
                <Gamepad2 className="w-8 h-8 text-[#678] mx-auto" />
                <p className="text-xs text-[#9ab] font-mono">
                  No matches found for "{query}". Try searching via the Live Metadata API above.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

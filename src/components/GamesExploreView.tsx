import React, { useState, useMemo } from 'react';
import { Game, JournalEntry } from '../types';
import { GameCard } from './GameCard';
import { Sparkles, Flame, Trophy, Star, RefreshCw, Globe, Layers, Compass, ArrowUpDown } from 'lucide-react';

interface GamesExploreViewProps {
  games: Game[];
  journal: JournalEntry[];
  watchlist: string[];
  likedGames: string[];
  onSelectGame: (game: Game) => void;
  onQuickLog: (game: Game) => void;
  onToggleWatchlist: (gameId: string) => void;
  onToggleLike: (gameId: string) => void;
  onFetchOnlineGames?: () => void;
  isFetchingOnline?: boolean;
}

type SortOption = 'rating' | 'releaseYear' | 'title' | 'popular';

export const GamesExploreView: React.FC<GamesExploreViewProps> = ({
  games = [],
  journal = [],
  watchlist = [],
  likedGames = [],
  onSelectGame,
  onQuickLog,
  onToggleWatchlist,
  onToggleLike,
  onFetchOnlineGames,
  isFetchingOnline = false
}) => {
  const [activePlatformFilter, setActivePlatformFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'curated' | 'all'>('curated');
  const [sortBy, setSortBy] = useState<SortOption>('rating');
  const [searchQuery, setSearchQuery] = useState('');

  const safeGames = games || [];

  // Featured hero game
  const featuredGame = safeGames[0] || null;

  // Filter games by platform and search query
  const filteredGames = useMemo(() => {
    let list = safeGames;
    if (activePlatformFilter !== 'all') {
      const filterLower = activePlatformFilter.toLowerCase();
      list = list.filter(g => (g?.platforms || []).some(p => p.toLowerCase().includes(filterLower)));
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(g => 
        g.title.toLowerCase().includes(q) || 
        g.developer.toLowerCase().includes(q) ||
        (g.genres || []).some(genre => genre.toLowerCase().includes(q))
      );
    }
    return list;
  }, [safeGames, activePlatformFilter, searchQuery]);

  // Section collections for Curated view
  const popularGames = useMemo(() => filteredGames.slice(0, 8), [filteredGames]);
  const topRatedGames = useMemo(() => [...filteredGames].sort((a, b) => b.averageRating - a.averageRating).slice(0, 8), [filteredGames]);
  const recentReleases = useMemo(() => [...filteredGames].sort((a, b) => b.releaseYear - a.releaseYear).slice(0, 8), [filteredGames]);

  // Sorted list for "All Games" full catalog view
  const allSortedGames = useMemo(() => {
    const list = [...filteredGames];
    switch (sortBy) {
      case 'rating':
        return list.sort((a, b) => b.averageRating - a.averageRating);
      case 'releaseYear':
        return list.sort((a, b) => b.releaseYear - a.releaseYear);
      case 'title':
        return list.sort((a, b) => a.title.localeCompare(b.title));
      case 'popular':
      default:
        return list.sort((a, b) => (b.totalRatings || 0) - (a.totalRatings || 0));
    }
  }, [filteredGames, sortBy]);

  // O(1) status lookup sets
  const playedSet = useMemo(() => new Set((journal || []).map(e => e.gameId)), [journal]);
  const likedSet = useMemo(() => new Set(likedGames || []), [likedGames]);
  const watchlistSet = useMemo(() => new Set(watchlist || []), [watchlist]);
  const userRatingsMap = useMemo(() => {
    const map = new Map<string, number>();
    (journal || []).forEach(e => {
      if (e?.gameId) map.set(e.gameId, e.rating);
    });
    return map;
  }, [journal]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-8" id="games-explore-view">
      {/* Letterboxd Hero Spotlight Banner */}
      {featuredGame && (
        <div className="relative rounded-xl overflow-hidden border border-[#2c3440] bg-[#181e24] shadow-2xl">
          {/* Backdrop */}
          <div className="relative h-64 sm:h-80 md:h-96 w-full">
            <img
              src={featuredGame.backdropUrl}
              alt={featuredGame.title}
              className="w-full h-full object-cover object-center opacity-40 filter saturate-125"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#14181c] via-[#14181c]/60 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#14181c] via-[#14181c]/70 to-transparent" />
          </div>

          {/* Hero Content */}
          <div className="absolute inset-0 p-5 sm:p-8 flex flex-col justify-end max-w-2xl space-y-3 z-10">
            <div className="flex items-center gap-2">
              <span className="bg-[#ff8000] text-white text-[10px] font-black uppercase font-mono px-2 py-0.5 rounded shadow">
                Featured Spotlight
              </span>
              <span className="text-xs font-mono text-[#00e054] font-bold flex items-center gap-1">
                <Star className="w-3.5 h-3.5 fill-[#00e054] stroke-none" />
                <span>{featuredGame.averageRating.toFixed(1)} ★</span>
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
              {featuredGame.title}
            </h1>

            <p className="text-xs sm:text-sm text-[#c8d4e0] line-clamp-2 leading-relaxed">
              {featuredGame.synopsis}
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                type="button"
                onClick={() => onSelectGame(featuredGame)}
                className="bg-[#00e054] hover:bg-[#00e054]/90 text-[#14181c] font-black uppercase text-xs tracking-wider px-5 py-2.5 rounded-full shadow-[0_0_16px_rgba(0,224,84,0.3)] transition-transform active:scale-95"
              >
                View Game Details
              </button>

              <button
                type="button"
                onClick={() => onQuickLog(featuredGame)}
                className="bg-[#202830]/90 hover:bg-[#2c3440] text-white border border-[#2c3440] text-xs font-mono font-bold px-4 py-2.5 rounded-full flex items-center gap-1.5 transition-colors"
              >
                <span>+ Log or Rate</span>
              </button>

              {onFetchOnlineGames && (
                <button
                  type="button"
                  onClick={onFetchOnlineGames}
                  disabled={isFetchingOnline}
                  className="inline-flex items-center gap-1.5 text-xs font-mono text-[#40bcf4] hover:text-white px-3 py-2 rounded-full bg-[#181e24]/80 hover:bg-[#202830] border border-[#2c3440] transition-colors disabled:opacity-50"
                  title="Grab fresh trending games live from Steam online"
                >
                  <RefreshCw className={`w-3 h-3 ${isFetchingOnline ? 'animate-spin text-[#00e054]' : ''}`} />
                  <span>{isFetchingOnline ? 'Grabbing Online...' : 'Grab Online Games'}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Online Catalogue Control Bar & Platform Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#2c3440] pb-4">
        {/* Left: Platform Category Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
          {[
            { id: 'all', label: 'All Platforms' },
            { id: 'PC', label: 'PC & Steam' },
            { id: 'PlayStation', label: 'PlayStation' },
            { id: 'Nintendo', label: 'Nintendo Switch' },
            { id: 'Xbox', label: 'Xbox Series' }
          ].map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActivePlatformFilter(tab.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-mono transition-colors whitespace-nowrap ${
                activePlatformFilter === tab.id
                  ? 'bg-[#00e054] text-[#14181c] font-bold'
                  : 'text-[#9ab] hover:text-white bg-[#181e24] border border-[#2c3440]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Right: View switcher & Live online games status */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center bg-[#181e24] border border-[#2c3440] p-0.5 rounded-lg text-xs font-mono">
            <button
              type="button"
              onClick={() => setViewMode('curated')}
              className={`px-3 py-1 rounded flex items-center gap-1.5 transition-colors ${
                viewMode === 'curated'
                  ? 'bg-[#2c3440] text-white font-bold'
                  : 'text-[#9ab] hover:text-white'
              }`}
            >
              <Compass className="w-3.5 h-3.5 text-[#ff8000]" />
              <span>Highlights</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('all')}
              className={`px-3 py-1 rounded flex items-center gap-1.5 transition-colors ${
                viewMode === 'all'
                  ? 'bg-[#2c3440] text-white font-bold'
                  : 'text-[#9ab] hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-[#00e054]" />
              <span>All Games ({filteredGames.length})</span>
            </button>
          </div>

          {onFetchOnlineGames && (
            <button
              type="button"
              onClick={onFetchOnlineGames}
              disabled={isFetchingOnline}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#181e24] hover:bg-[#202830] border border-[#2c3440] text-xs font-mono text-[#9ab] hover:text-[#40bcf4] rounded-lg transition-colors disabled:opacity-50"
              title="Fetch fresh online games from Steam"
            >
              <Globe className="w-3.5 h-3.5 text-[#40bcf4]" />
              <span className="hidden sm:inline">Steam Online</span>
              <RefreshCw className={`w-3 h-3 ${isFetchingOnline ? 'animate-spin text-[#00e054]' : ''}`} />
            </button>
          )}
        </div>
      </div>

      {/* VIEW MODE 1: CURATED HIGHLIGHTS */}
      {viewMode === 'curated' && (
        <div className="space-y-10">
          {/* Section 1: Popular Games & Community Hits */}
          <section className="space-y-4" id="section-popular-games">
            <div className="flex items-center justify-between">
              <h2 className="text-base sm:text-lg font-black uppercase tracking-wider text-white flex items-center gap-2">
                <Flame className="w-4 h-4 text-[#ff8000]" />
                <span>Popular With Gamers</span>
              </h2>
              <button
                type="button"
                onClick={() => setViewMode('all')}
                className="text-xs font-mono text-[#00e054] hover:underline"
              >
                View all ({filteredGames.length}) →
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {popularGames.map(game => (
                <GameCard
                  key={game.id}
                  game={game}
                  onSelect={onSelectGame}
                  onQuickLog={onQuickLog}
                  onToggleWatchlist={onToggleWatchlist}
                  onToggleLike={onToggleLike}
                  isPlayed={playedSet.has(game.id)}
                  isLiked={likedSet.has(game.id)}
                  isWatchlisted={watchlistSet.has(game.id)}
                  userRating={userRatingsMap.get(game.id)}
                />
              ))}
            </div>
          </section>

          {/* Section 2: Highest Rated Masterpieces */}
          <section className="space-y-4" id="section-top-rated">
            <div className="flex items-center justify-between">
              <h2 className="text-base sm:text-lg font-black uppercase tracking-wider text-white flex items-center gap-2">
                <Trophy className="w-4 h-4 text-[#00e054]" />
                <span>Highest Rated Masterpieces</span>
              </h2>
              <span className="text-xs font-mono text-[#9ab]">4.7+ average score</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {topRatedGames.map(game => (
                <GameCard
                  key={game.id}
                  game={game}
                  onSelect={onSelectGame}
                  onQuickLog={onQuickLog}
                  onToggleWatchlist={onToggleWatchlist}
                  onToggleLike={onToggleLike}
                  isPlayed={playedSet.has(game.id)}
                  isLiked={likedSet.has(game.id)}
                  isWatchlisted={watchlistSet.has(game.id)}
                  userRating={userRatingsMap.get(game.id)}
                />
              ))}
            </div>
          </section>

          {/* Section 3: Recent & Modern Releases */}
          <section className="space-y-4" id="section-recent-releases">
            <div className="flex items-center justify-between">
              <h2 className="text-base sm:text-lg font-black uppercase tracking-wider text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#40bcf4]" />
                <span>Modern Releases & Additions</span>
              </h2>
              <span className="text-xs font-mono text-[#9ab]">2022 - 2025 catalog</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {recentReleases.map(game => (
                <GameCard
                  key={game.id}
                  game={game}
                  onSelect={onSelectGame}
                  onQuickLog={onQuickLog}
                  onToggleWatchlist={onToggleWatchlist}
                  onToggleLike={onToggleLike}
                  isPlayed={playedSet.has(game.id)}
                  isLiked={likedSet.has(game.id)}
                  isWatchlisted={watchlistSet.has(game.id)}
                  userRating={userRatingsMap.get(game.id)}
                />
              ))}
            </div>
          </section>
        </div>
      )}

      {/* VIEW MODE 2: ALL GAMES FULL CATALOG */}
      {viewMode === 'all' && (
        <section className="space-y-6" id="section-all-games">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#181e24] p-3.5 rounded-xl border border-[#2c3440]">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-[#00e054]" />
              <span className="text-sm font-bold text-white">Full Online & Curated Library</span>
              <span className="text-xs font-mono text-[#9ab]">({allSortedGames.length} games)</span>
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 text-xs font-mono">
              <ArrowUpDown className="w-3.5 h-3.5 text-[#678]" />
              <span className="text-[#9ab]">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="bg-[#14181c] border border-[#2c3440] text-[#e0e6ed] px-2.5 py-1 rounded text-xs focus:outline-none focus:border-[#00e054]"
              >
                <option value="rating">Highest Rated</option>
                <option value="popular">Most Popular</option>
                <option value="releaseYear">Newest Release</option>
                <option value="title">Alphabetical (A-Z)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {allSortedGames.map(game => (
              <GameCard
                key={game.id}
                game={game}
                onSelect={onSelectGame}
                onQuickLog={onQuickLog}
                onToggleWatchlist={onToggleWatchlist}
                onToggleLike={onToggleLike}
                isPlayed={playedSet.has(game.id)}
                isLiked={likedSet.has(game.id)}
                isWatchlisted={watchlistSet.has(game.id)}
                userRating={userRatingsMap.get(game.id)}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

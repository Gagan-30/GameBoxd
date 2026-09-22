import React from 'react';
import { JournalEntry, Game, Milestone } from '../types';
import { RatingHistogram } from './RatingHistogram';
import { 
  BarChart3, Trophy, Clock, Star, Flame, Sparkles, 
  Gamepad2, Calendar, Award, Share2, TrendingUp 
} from 'lucide-react';

interface StatsViewProps {
  journal: JournalEntry[];
  allGames: Game[];
  milestones: Milestone[];
  onOpenShareMilestone: (milestone?: Milestone) => void;
  onSelectGame: (game: Game) => void;
}

export const StatsView: React.FC<StatsViewProps> = ({
  journal = [],
  allGames = [],
  milestones = [],
  onOpenShareMilestone,
  onSelectGame
}) => {
  const safeJournal = journal || [];
  const safeGames = allGames || [];
  const getGame = (id: string) => safeGames.find(g => g.id === id);

  // Key numbers
  const totalGamesLogged = safeJournal.length;
  const totalHours = safeJournal.reduce((acc, entry) => acc + (entry.hoursPlayed || 0), 0);
  const totalRatingsCount = safeJournal.filter(e => (e.rating || 0) > 0).length;
  const averageRating = totalRatingsCount > 0
    ? safeJournal.reduce((acc, e) => acc + (e.rating || 0), 0) / totalRatingsCount
    : 0;

  const currentYear = new Date().getFullYear().toString();
  const loggedThisYear = safeJournal.filter(e => e.datePlayed?.startsWith(currentYear)).length;

  // Rating distribution calculation
  const distribution: Record<number, number> = {
    0.5: 0, 1.0: 0, 1.5: 0, 2.0: 0, 2.5: 0,
    3.0: 0, 3.5: 0, 4.0: 0, 4.5: 0, 5.0: 0
  };
  safeJournal.forEach(e => {
    if (e.rating && distribution[e.rating] !== undefined) {
      distribution[e.rating]++;
    }
  });

  // Decade / Year distribution
  const decadeCounts: Record<string, number> = {};
  safeJournal.forEach(e => {
    const year = e.releaseYear;
    const decade = `${Math.floor(year / 10) * 10}s`;
    decadeCounts[decade] = (decadeCounts[decade] || 0) + 1;
  });

  // Top Genres
  const genreCounts: Record<string, number> = {};
  safeJournal.forEach(e => {
    const game = getGame(e.gameId);
    if (game && game.genres) {
      game.genres.forEach(g => {
        genreCounts[g] = (genreCounts[g] || 0) + 1;
      });
    }
  });
  const sortedGenres = Object.entries(genreCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  // Top Platforms
  const platformCounts: Record<string, number> = {};
  safeJournal.forEach(e => {
    const p = e.platform || 'PC';
    platformCounts[p] = (platformCounts[p] || 0) + 1;
  });
  const sortedPlatforms = Object.entries(platformCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // Top Studios / Developers
  const devCounts: Record<string, number> = {};
  safeJournal.forEach(e => {
    const game = getGame(e.gameId);
    if (game && game.developer) {
      devCounts[game.developer] = (devCounts[game.developer] || 0) + 1;
    }
  });
  const sortedDevs = Object.entries(devCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // 5-Star Masterpieces
  const fiveStarEntries = safeJournal.filter(e => e.rating === 5.0);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-8" id="stats-dashboard-container">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#2c3440] pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-wider text-white flex items-center gap-3">
            <span>Lifetime Gaming Stats</span>
            <span className="text-xs sm:text-sm font-mono font-normal text-[#00e054] bg-[#00e054]/10 border border-[#00e054]/30 px-2.5 py-0.5 rounded-full">
              All-Time
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-[#9ab] font-mono mt-1">
            Visual breakdown of your gaming habits, rating curve, favorite genres, and playtimes.
          </p>
        </div>

        <button
          type="button"
          onClick={() => onOpenShareMilestone()}
          className="bg-[#181e24] hover:bg-[#202830] text-[#ff8000] hover:text-[#ff8000] border border-[#2c3440] hover:border-[#ff8000] text-xs font-mono font-bold py-2 px-4 rounded-full flex items-center gap-2 transition-all"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>Share Stats Card</span>
        </button>
      </div>

      {/* Top 4 Metric Highlights */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#181e24] border border-[#2c3440] rounded-xl p-4 sm:p-5 space-y-1 shadow">
          <div className="flex items-center justify-between text-[#9ab] text-xs font-mono uppercase">
            <span>Total Games Logged</span>
            <Gamepad2 className="w-4 h-4 text-[#00e054]" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white">{totalGamesLogged}</div>
          <div className="text-[11px] text-[#678] font-mono">Unique play diary entries</div>
        </div>

        <div className="bg-[#181e24] border border-[#2c3440] rounded-xl p-4 sm:p-5 space-y-1 shadow">
          <div className="flex items-center justify-between text-[#9ab] text-xs font-mono uppercase">
            <span>Total Time Invested</span>
            <Clock className="w-4 h-4 text-[#40bcf4]" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white">{totalHours} hrs</div>
          <div className="text-[11px] text-[#678] font-mono">{(totalHours / 24).toFixed(1)} full days of play</div>
        </div>

        <div className="bg-[#181e24] border border-[#2c3440] rounded-xl p-4 sm:p-5 space-y-1 shadow">
          <div className="flex items-center justify-between text-[#9ab] text-xs font-mono uppercase">
            <span>Average Rating</span>
            <Star className="w-4 h-4 text-[#00e054] fill-[#00e054]" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white">{averageRating.toFixed(2)}★</div>
          <div className="text-[11px] text-[#678] font-mono">Across {totalRatingsCount} rated titles</div>
        </div>

        <div className="bg-[#181e24] border border-[#2c3440] rounded-xl p-4 sm:p-5 space-y-1 shadow">
          <div className="flex items-center justify-between text-[#9ab] text-xs font-mono uppercase">
            <span>Logged in {currentYear}</span>
            <Calendar className="w-4 h-4 text-[#ff8000]" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white">{loggedThisYear}</div>
          <div className="text-[11px] text-[#678] font-mono">Current year progress</div>
        </div>
      </div>

      {/* Signature Letterboxd Rating Curve Section */}
      <div className="bg-[#181e24] border border-[#2c3440] rounded-xl p-5 sm:p-6 space-y-4 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-sm sm:text-base uppercase tracking-wider text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#00e054]" />
              <span>Letterboxd Star Rating Curve</span>
            </h3>
            <p className="text-xs text-[#9ab] font-mono mt-0.5">
              Personal distribution of ratings from 0.5 to 5.0 green stars.
            </p>
          </div>
          <div className="text-right">
            <span className="text-xs font-mono text-[#00e054] font-bold">
              {fiveStarEntries.length} Masterpieces (5.0★)
            </span>
          </div>
        </div>

        <RatingHistogram
          distribution={distribution}
          averageRating={averageRating}
          totalRatings={totalRatingsCount}
          className="border-0 bg-[#14181c] p-4"
        />
      </div>

      {/* Release Eras & Genres Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top Genres */}
        <div className="bg-[#181e24] border border-[#2c3440] rounded-xl p-5 space-y-4 shadow">
          <h3 className="font-extrabold text-xs uppercase font-mono tracking-wider text-white">
            Top Genres Played
          </h3>
          <div className="space-y-3">
            {sortedGenres.map(([genre, count]) => {
              const percentage = totalGamesLogged > 0 ? Math.round((count / totalGamesLogged) * 100) : 0;
              return (
                <div key={genre} className="space-y-1">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-white font-medium">{genre}</span>
                    <span className="text-[#9ab]">{count} games ({percentage}%)</span>
                  </div>
                  <div className="h-2 w-full bg-[#14181c] rounded-full overflow-hidden border border-[#2c3440]/60">
                    <div 
                      className="h-full bg-[#00e054] rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, Math.max(8, percentage))}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Platforms */}
        <div className="bg-[#181e24] border border-[#2c3440] rounded-xl p-5 space-y-4 shadow">
          <h3 className="font-extrabold text-xs uppercase font-mono tracking-wider text-white">
            Platform Distribution
          </h3>
          <div className="space-y-3">
            {sortedPlatforms.map(([platform, count]) => {
              const percentage = totalGamesLogged > 0 ? Math.round((count / totalGamesLogged) * 100) : 0;
              return (
                <div key={platform} className="space-y-1">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-white font-medium">{platform}</span>
                    <span className="text-[#40bcf4]">{count} titles</span>
                  </div>
                  <div className="h-2 w-full bg-[#14181c] rounded-full overflow-hidden border border-[#2c3440]/60">
                    <div 
                      className="h-full bg-[#40bcf4] rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, Math.max(8, percentage))}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Top Studios & Release Eras */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Most Played Studios */}
        <div className="bg-[#181e24] border border-[#2c3440] rounded-xl p-5 space-y-3 shadow">
          <h3 className="font-extrabold text-xs uppercase font-mono tracking-wider text-white">
            Most Played Studios & Creators
          </h3>
          <div className="divide-y divide-[#2c3440]/60 text-xs">
            {sortedDevs.map(([dev, count], i) => (
              <div key={dev} className="py-2.5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-[#00e054] font-mono font-bold w-4">#{i + 1}</span>
                  <span className="text-white font-semibold">{dev}</span>
                </div>
                <span className="text-[#9ab] font-mono">{count} logged</span>
              </div>
            ))}
          </div>
        </div>

        {/* Release Eras (Decades) */}
        <div className="bg-[#181e24] border border-[#2c3440] rounded-xl p-5 space-y-3 shadow">
          <h3 className="font-extrabold text-xs uppercase font-mono tracking-wider text-white">
            Games by Release Era
          </h3>
          <div className="flex items-end justify-around gap-2 h-36 pt-4 px-2">
            {Object.entries(decadeCounts).map(([decade, count]) => {
              const max = Math.max(...(Object.values(decadeCounts) as number[]), 1);
              const heightPct = Math.round((count / max) * 100);

              return (
                <div key={decade} className="flex-1 flex flex-col items-center h-full justify-end group">
                  <div className="text-[10px] text-[#00e054] font-mono mb-1">{count}</div>
                  <div 
                    className="w-full bg-[#2c3440] group-hover:bg-[#ff8000] rounded-t-sm transition-all duration-300"
                    style={{ height: `${Math.max(12, heightPct)}%` }}
                  />
                  <div className="text-[11px] font-mono text-[#9ab] mt-2">{decade}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 5-Star Masterpieces Showcase */}
      {fiveStarEntries.length > 0 && (
        <div className="bg-[#181e24] border border-[#2c3440] rounded-xl p-5 sm:p-6 space-y-4 shadow">
          <div className="flex items-center justify-between border-b border-[#2c3440] pb-3">
            <h3 className="font-extrabold text-xs uppercase font-mono tracking-wider text-white flex items-center gap-2">
              <Star className="w-4 h-4 text-[#00e054] fill-[#00e054]" />
              <span>Your 5-Star Masterpieces Hall of Fame</span>
            </h3>
            <span className="text-xs font-mono text-[#00e054] font-bold">
              {fiveStarEntries.length} games awarded 5.0★
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 pt-2">
            {fiveStarEntries.map(entry => {
              const game = getGame(entry.gameId);
              if (!game) return null;
              return (
                <div 
                  key={entry.id}
                  onClick={() => onSelectGame(game)}
                  className="aspect-[2/3] rounded overflow-hidden bg-[#14181c] border border-[#2c3440] hover:border-[#00e054] cursor-pointer relative group transition-all"
                  title={`${entry.gameTitle} (${entry.releaseYear})`}
                >
                  <img
                    src={entry.gameCoverUrl}
                    alt={entry.gameTitle}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/70 to-transparent p-1.5 text-center">
                    <div className="text-[10px] text-white font-bold truncate">{entry.gameTitle}</div>
                    <div className="text-[9px] text-[#00e054] font-mono">★★★★★</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Milestone Achievements */}
      <div className="bg-[#181e24] border border-[#2c3440] rounded-xl p-5 sm:p-6 space-y-4 shadow">
        <div className="flex items-center justify-between border-b border-[#2c3440] pb-3">
          <h3 className="font-extrabold text-xs uppercase font-mono tracking-wider text-white flex items-center gap-2">
            <Trophy className="w-4 h-4 text-[#ff8000]" />
            <span>Gaming Milestones & Badges</span>
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          {milestones.map(m => (
            <div 
              key={m.id} 
              className={`p-4 rounded-xl border flex items-center justify-between transition-all ${
                m.isUnlocked 
                  ? 'bg-[#14181c] border-[#ff8000]/40 shadow-[0_0_12px_rgba(255,128,0,0.1)]' 
                  : 'bg-[#14181c]/50 border-[#2c3440] opacity-60'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  m.isUnlocked ? 'bg-[#ff8000]/20 text-[#ff8000]' : 'bg-[#2c3440] text-[#678]'
                }`}>
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-xs sm:text-sm text-white">{m.title}</h4>
                  <p className="text-[11px] text-[#9ab]">{m.subtitle}</p>
                </div>
              </div>

              {m.isUnlocked && (
                <button
                  type="button"
                  onClick={() => onOpenShareMilestone(m)}
                  className="p-2 text-[#9ab] hover:text-[#ff8000] rounded hover:bg-[#202830] transition-colors"
                  title="Share this milestone"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

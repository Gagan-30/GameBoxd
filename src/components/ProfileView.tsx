import React, { useState } from 'react';
import { UserProfile, Game, JournalEntry, CustomList, GameCollection } from '../types';
import { GameCard } from './GameCard';
import { StarRating } from './StarRating';
import { 
  Heart, Calendar, MapPin, Globe, Edit, Share2, 
  Gamepad2, Plus, Trophy, Clock, Sparkles, Layers 
} from 'lucide-react';
import { useLockBodyScroll } from '../hooks/useLockBodyScroll';

interface ProfileViewProps {
  profile: UserProfile;
  allGames: Game[];
  journal: JournalEntry[];
  lists: CustomList[];
  collections?: GameCollection[];
  watchlist: string[];
  likedGames: string[];
  onSelectGame: (game: Game) => void;
  onSelectCollection?: (collectionId: string) => void;
  onUpdateFavoriteFour: (slotIndex: number, gameId: string) => void;
  onShareProfile: () => void;
  onQuickLog: (game: Game) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  profile,
  allGames = [],
  journal = [],
  lists = [],
  collections = [],
  watchlist = [],
  likedGames = [],
  onSelectGame,
  onSelectCollection,
  onUpdateFavoriteFour,
  onShareProfile,
  onQuickLog
}) => {
  const [activeTab, setActiveTab] = useState<'diary' | 'collections' | 'watchlist' | 'lists' | 'likes'>('diary');
  const [pickerSlot, setPickerSlot] = useState<number | null>(null);

  useLockBodyScroll(pickerSlot !== null);

  const safeGames = allGames || [];
  const safeJournal = journal || [];
  const getGame = (id: string) => safeGames.find(g => g.id === id);

  const totalHours = safeJournal.reduce((acc, e) => acc + (e.hoursPlayed || 0), 0);
  const averageRating = safeJournal.length > 0 
    ? safeJournal.reduce((acc, e) => acc + (e.rating || 0), 0) / safeJournal.length 
    : 0;

  const avatarSrc = (profile as any)?.avatarUrl || (profile as any)?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80';
  const favIds = profile?.favoriteGameIds || (profile as any)?.favoriteGames || [];
  const favoriteGames = favIds.map(getGame).filter(Boolean) as Game[];
  const watchlistGames = (watchlist || []).map(getGame).filter(Boolean) as Game[];
  const likedGameObjects = (likedGames || []).map(getGame).filter(Boolean) as Game[];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-8" id="profile-view-container">
      {/* Profile Header */}
      <div className="bg-[#181e24] border border-[#2c3440] rounded-xl p-6 sm:p-8 space-y-6 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="relative">
              <img
                src={avatarSrc}
                alt={profile.displayName}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-2 border-[#00e054] shadow-lg"
              />
              <span className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-[#00e054] border-2 border-[#181e24] flex items-center justify-center text-[10px] text-black font-black">
                ✓
              </span>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-white">{profile.displayName}</h1>
                <span className="text-xs text-[#00e054] font-mono bg-[#00e054]/10 border border-[#00e054]/30 px-2 py-0.5 rounded-full">
                  PRO GAMER
                </span>
              </div>
              <div className="text-xs text-[#678] font-mono">@{profile.handle}</div>
              <p className="text-xs sm:text-sm text-[#9ab] max-w-lg leading-relaxed pt-1">
                {profile.bio}
              </p>

              <div className="flex flex-wrap items-center gap-4 text-[11px] font-mono text-[#678] pt-1">
                {profile.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {profile.location}
                  </span>
                )}
                {profile.website && (
                  <span className="flex items-center gap-1 text-[#40bcf4]">
                    <Globe className="w-3 h-3" />
                    {profile.website}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  Joined {profile.joinedDate}
                </span>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="flex sm:w-44 gap-2 w-full sm:w-auto shrink-0">
            <button
              type="button"
              onClick={onShareProfile}
              className="w-full flex items-center justify-center gap-1.5 bg-[#ff8000] hover:bg-[#ff8000]/90 text-white font-mono font-bold text-xs px-4 py-2 rounded-full shadow transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share Profile</span>
            </button>
          </div>
        </div>

        {/* Profile Stats Ribbon */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 border-t border-[#2c3440] pt-4 text-center">
          <div className="bg-[#14181c] p-2.5 rounded-lg border border-[#2c3440]/60">
            <div className="text-lg sm:text-xl font-black text-white">{journal.length}</div>
            <div className="text-[10px] uppercase font-mono text-[#9ab]">Games Logged</div>
          </div>
          <div className="bg-[#14181c] p-2.5 rounded-lg border border-[#2c3440]/60">
            <div className="text-lg sm:text-xl font-black text-[#40bcf4]">{totalHours} hrs</div>
            <div className="text-[10px] uppercase font-mono text-[#9ab]">Time Played</div>
          </div>
          <div className="bg-[#14181c] p-2.5 rounded-lg border border-[#2c3440]/60">
            <div className="text-lg sm:text-xl font-black text-[#00e054]">
              {averageRating > 0 ? averageRating.toFixed(2) : '0.0'}★
            </div>
            <div className="text-[10px] uppercase font-mono text-[#9ab]">Average Rating</div>
          </div>
          <div className="bg-[#14181c] p-2.5 rounded-lg border border-[#2c3440]/60">
            <div className="text-lg sm:text-xl font-black text-[#ff8000]">{lists.length}</div>
            <div className="text-[10px] uppercase font-mono text-[#9ab]">Lists Curated</div>
          </div>
        </div>
      </div>

      {/* Iconic Letterboxd FAVORITE FOUR Section */}
      <section className="space-y-3" id="favorite-four-section">
        <div className="flex items-center justify-between border-b border-[#2c3440] pb-2">
          <h2 className="text-sm uppercase font-mono font-black tracking-wider text-[#9ab] flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#00e054]" />
            <span>Favorite Four Games</span>
          </h2>
          <span className="text-[11px] font-mono text-[#678]">
            Click any poster to inspect or replace slot
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[0, 1, 2, 3].map((slotIdx) => {
            const game = favoriteGames[slotIdx];

            return (
              <div
                key={slotIdx}
                className="group relative aspect-[2/3] rounded-lg overflow-hidden bg-[#181e24] border-2 border-[#2c3440] hover:border-[#00e054] transition-all shadow-lg flex flex-col items-center justify-center text-center cursor-pointer"
                onClick={() => {
                  if (game) onSelectGame(game);
                  else setPickerSlot(slotIdx);
                }}
              >
                {game ? (
                  <>
                    <img
                      src={game.coverUrl}
                      alt={game.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/80 to-transparent p-2.5 text-center">
                      <div className="text-xs font-bold text-white truncate">{game.title}</div>
                      <div className="text-[10px] font-mono text-[#00e054]">
                        {game.releaseYear} · {game.averageRating.toFixed(1)}★
                      </div>
                    </div>
                    {/* Hover replace button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPickerSlot(slotIdx);
                      }}
                      className="absolute top-2 right-2 bg-black/80 hover:bg-[#00e054] hover:text-black text-white p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-mono"
                    >
                      Change
                    </button>
                  </>
                ) : (
                  <div 
                    onClick={() => setPickerSlot(slotIdx)}
                    className="p-4 space-y-2 flex flex-col items-center justify-center text-[#678] hover:text-[#00e054] transition-colors"
                  >
                    <Plus className="w-8 h-8 stroke-[1.5]" />
                    <span className="text-xs font-mono uppercase font-bold">Pick Favorite #{slotIdx + 1}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Profile Sub-Tabs Navigation */}
      <div className="border-b border-[#2c3440] flex items-center gap-6 text-xs font-mono uppercase tracking-wider overflow-x-auto no-scrollbar">
        {[
          { id: 'diary', label: `Logged Diary (${journal.length})` },
          { id: 'collections', label: `Collections (${collections.length})` },
          { id: 'watchlist', label: `Watchlist Backlog (${watchlist.length})` },
          { id: 'lists', label: `Lists (${lists.length})` },
          { id: 'likes', label: `Liked Games (${likedGames.length})` }
        ].map(tab => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as any)}
            className={`pb-3 font-bold transition-colors relative whitespace-nowrap ${
              activeTab === tab.id ? 'text-white' : 'text-[#678] hover:text-[#9ab]'
            }`}
          >
            <span>{tab.label}</span>
            {activeTab === tab.id && (
              <div className="absolute bottom-0 inset-x-0 h-0.5 bg-[#00e054]" />
            )}
          </button>
        ))}
      </div>

      {/* Sub-Tab Content */}
      <div>
        {activeTab === 'collections' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            {collections.map(col => {
              const colGames = col.gameIds.map(getGame).filter(Boolean) as Game[];
              return (
                <div
                  key={col.id}
                  onClick={() => onSelectCollection && onSelectCollection(col.id)}
                  className="group relative bg-[#181e24] border border-[#2c3440] hover:border-[#00e054] rounded-xl overflow-hidden shadow-lg cursor-pointer transition-all duration-300"
                >
                  <div className="relative aspect-[16/9] w-full overflow-hidden bg-[#14181c]">
                    <img
                      src={col.coverArtUrl}
                      alt={col.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 filter brightness-75"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#181e24] via-transparent to-transparent" />
                    <div 
                      className="absolute top-0 inset-x-0 h-1" 
                      style={{ backgroundColor: col.themeColor || '#00e054' }} 
                    />
                    <div className="absolute top-2.5 right-2.5 bg-[#14181c]/80 backdrop-blur-md border border-[#2c3440] px-2 py-0.5 rounded text-[10px] font-mono text-white">
                      {colGames.length} {colGames.length === 1 ? 'game' : 'games'}
                    </div>
                  </div>
                  <div className="p-4 space-y-1.5">
                    <h4 className="font-bold text-white text-sm uppercase tracking-wide group-hover:text-[#00e054] transition-colors">
                      {col.name}
                    </h4>
                    <p className="text-xs text-[#9ab] line-clamp-2 leading-relaxed">
                      {col.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {activeTab === 'diary' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {journal.map(entry => {
              const game = getGame(entry.gameId);
              if (!game) return null;
              return (
                <div key={entry.id} className="space-y-1">
                  <GameCard
                    game={game}
                    onSelect={onSelectGame}
                    onQuickLog={onQuickLog}
                    isPlayed={true}
                    userRating={entry.rating}
                    isLiked={entry.isLiked}
                  />
                  <div className="text-[10px] font-mono text-[#678] text-center">
                    {entry.datePlayed}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {activeTab === 'watchlist' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {watchlistGames.map(game => (
              <GameCard
                key={game.id}
                game={game}
                onSelect={onSelectGame}
                onQuickLog={onQuickLog}
                isWatchlisted={true}
              />
            ))}
            {watchlistGames.length === 0 && (
              <div className="col-span-full py-12 text-center text-xs text-[#9ab] font-mono">
                Your backlog is empty. Add games to your watchlist using the clock icon!
              </div>
            )}
          </div>
        )}

        {activeTab === 'likes' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {likedGameObjects.map(game => (
              <GameCard
                key={game.id}
                game={game}
                onSelect={onSelectGame}
                onQuickLog={onQuickLog}
                isLiked={true}
              />
            ))}
          </div>
        )}

        {activeTab === 'lists' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {lists.map(list => (
              <div key={list.id} className="bg-[#181e24] p-4 rounded-xl border border-[#2c3440] space-y-2">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-white text-sm">{list.title}</h4>
                  <span className="text-xs text-[#ff8000] font-mono">♥ {list.likesCount}</span>
                </div>
                <p className="text-xs text-[#9ab] line-clamp-2">{list.description}</p>
                <div className="text-[11px] font-mono text-[#678]">{list.gameIds.length} games</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Picker Modal for "Favorite Four" */}
      {pickerSlot !== null && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => setPickerSlot(null)}
        >
          <div 
            className="bg-[#1b2228] border border-[#2c3440] rounded-xl w-full max-w-lg p-5 space-y-4 shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#2c3440] pb-2">
              <h3 className="font-bold text-sm text-white uppercase font-mono">
                Select Game for Favorite #{pickerSlot + 1}
              </h3>
              <button 
                type="button" 
                onClick={() => setPickerSlot(null)}
                className="text-xs text-[#9ab] hover:text-white"
              >
                Close
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2.5 max-h-72 overflow-y-auto custom-scrollbar">
              {allGames.map(g => (
                <div
                  key={g.id}
                  onClick={() => {
                    onUpdateFavoriteFour(pickerSlot, g.id);
                    setPickerSlot(null);
                  }}
                  className="aspect-[2/3] rounded overflow-hidden border border-[#2c3440] hover:border-[#00e054] cursor-pointer relative group"
                >
                  <img src={g.coverUrl} alt={g.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-x-0 bottom-0 bg-black/80 p-1 text-[10px] text-white truncate font-medium text-center">
                    {g.title}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

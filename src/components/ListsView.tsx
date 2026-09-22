import React, { useState } from 'react';
import { CustomList, Game } from '../types';
import { GameCard } from './GameCard';
import { Plus, ListOrdered, Heart, Share2, Trash2, Edit, Check, Lock, Globe, X, Search } from 'lucide-react';
import { useLockBodyScroll } from '../hooks/useLockBodyScroll';

interface ListsViewProps {
  lists: CustomList[];
  allGames: Game[];
  onSelectGame: (game: Game) => void;
  onCreateList: (list: Omit<CustomList, 'id' | 'createdAt' | 'updatedAt' | 'likesCount'>) => void;
  onDeleteList: (listId: string) => void;
  onLikeList: (listId: string) => void;
}

export const ListsView: React.FC<ListsViewProps> = ({
  lists = [],
  allGames = [],
  onSelectGame,
  onCreateList,
  onDeleteList,
  onLikeList
}) => {
  const [selectedListId, setSelectedListId] = useState<string | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const safeLists = lists || [];
  const safeGames = allGames || [];

  // New list form state
  const [newListTitle, setNewListTitle] = useState('');
  const [newListDesc, setNewListDesc] = useState('');
  const [isRanked, setIsRanked] = useState(true);
  const [isPublic, setIsPublic] = useState(true);
  const [selectedGameIds, setSelectedGameIds] = useState<string[]>([]);
  const [gameSearchQuery, setGameSearchQuery] = useState('');

  useLockBodyScroll(createModalOpen);

  const getGame = (id: string) => safeGames.find(g => g.id === id);

  const activeList = selectedListId ? safeLists.find(l => l.id === selectedListId) : null;

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newListTitle.trim() || selectedGameIds.length === 0) return;

    onCreateList({
      title: newListTitle.trim(),
      description: newListDesc.trim(),
      isRanked,
      isPublic,
      gameIds: selectedGameIds,
      notes: {}
    });

    setNewListTitle('');
    setNewListDesc('');
    setSelectedGameIds([]);
    setCreateModalOpen(false);
  };

  const toggleSelectGameForList = (gameId: string) => {
    if (selectedGameIds.includes(gameId)) {
      setSelectedGameIds(selectedGameIds.filter(id => id !== gameId));
    } else {
      setSelectedGameIds([...selectedGameIds, gameId]);
    }
  };

  const filteredSearchGames = gameSearchQuery.trim()
    ? safeGames.filter(g => g.title?.toLowerCase().includes(gameSearchQuery.toLowerCase()))
    : safeGames.slice(0, 8);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6" id="lists-view-container">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#2c3440] pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-wider text-white flex items-center gap-3">
            <span>Curated & Custom Lists</span>
            <span className="text-xs sm:text-sm font-mono font-normal text-[#40bcf4] bg-[#40bcf4]/10 border border-[#40bcf4]/30 px-2.5 py-0.5 rounded-full">
              {safeLists.length} lists
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-[#9ab] font-mono mt-1">
            Organize personal rankings, themed marathons, franchise rankings, and recommendations.
          </p>
        </div>

        <button
          type="button"
          id="create-list-btn"
          onClick={() => setCreateModalOpen(true)}
          className="bg-[#00e054] hover:bg-[#00e054]/90 text-[#14181c] font-black uppercase text-xs tracking-wider px-4 py-2 rounded-full shadow-[0_0_12px_rgba(0,224,84,0.3)] self-start sm:self-auto transition-transform active:scale-95 flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Start a New List</span>
        </button>
      </div>

      {/* If a list is selected: Detail View */}
      {activeList ? (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="flex items-center justify-between bg-[#181e24] p-4 rounded-xl border border-[#2c3440]">
            <div className="space-y-1">
              <button
                type="button"
                onClick={() => setSelectedListId(null)}
                className="text-xs font-mono text-[#40bcf4] hover:underline mb-1 inline-block"
              >
                ← Back to all lists
              </button>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black text-white">{activeList.title}</h2>
                {activeList.isRanked && (
                  <span className="bg-[#14181c] text-[#00e054] text-[10px] font-mono uppercase px-2 py-0.5 rounded border border-[#2c3440]">
                    Ranked
                  </span>
                )}
              </div>
              <p className="text-xs text-[#9ab] max-w-2xl">{activeList.description}</p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => onLikeList(activeList.id)}
                className="flex items-center gap-1.5 bg-[#14181c] hover:bg-[#202830] text-[#ff8000] border border-[#2c3440] px-3 py-1.5 rounded-full text-xs font-mono transition-colors"
              >
                <Heart className="w-3.5 h-3.5 fill-current" />
                <span>{activeList.likesCount}</span>
              </button>
              <button
                type="button"
                onClick={() => onDeleteList(activeList.id)}
                className="p-2 text-[#678] hover:text-red-400 rounded hover:bg-[#14181c] transition-colors"
                title="Delete list"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Games Grid in this list */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {activeList.gameIds.map((gameId, index) => {
              const game = getGame(gameId);
              if (!game) return null;
              const note = activeList.notes?.[gameId];

              return (
                <div key={gameId} className="flex flex-col space-y-2">
                  <GameCard
                    game={game}
                    onSelect={onSelectGame}
                    rank={activeList.isRanked ? index + 1 : undefined}
                    size="md"
                  />
                  {note && (
                    <p className="text-[11px] text-[#9ab] italic bg-[#181e24] p-2 rounded border border-[#2c3440]">
                      "{note}"
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* All Lists: Iconic Letterboxd Stacked Posters Preview */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {lists.map((list) => {
            const previewGames = list.gameIds.slice(0, 5).map(getGame).filter(Boolean) as Game[];

            return (
              <div
                key={list.id}
                onClick={() => setSelectedListId(list.id)}
                className="bg-[#181e24] hover:bg-[#1b2228] border border-[#2c3440] hover:border-[#40bcf4] rounded-xl p-4 sm:p-5 transition-all cursor-pointer group shadow-lg flex flex-col justify-between space-y-4"
                id={`list-card-${list.id}`}
              >
                {/* List Header */}
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-base sm:text-lg font-black text-white group-hover:text-[#40bcf4] transition-colors">
                      {list.title}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-[#ff8000] font-mono shrink-0">
                      <Heart className="w-3.5 h-3.5 fill-current" />
                      <span>{list.likesCount}</span>
                    </div>
                  </div>
                  <p className="text-xs text-[#9ab] line-clamp-2 mt-1 leading-relaxed">
                    {list.description}
                  </p>
                </div>

                {/* Iconic Letterboxd 5-Poster Overlapping Collage */}
                <div className="relative h-28 sm:h-32 flex items-center justify-start overflow-hidden pt-2">
                  <div className="flex items-center -space-x-8 sm:-space-x-10 transition-transform group-hover:translate-x-1">
                    {previewGames.map((game, i) => (
                      <div
                        key={game.id}
                        style={{ zIndex: 10 + i }}
                        className="relative aspect-[2/3] h-24 sm:h-28 rounded-[3px] overflow-hidden bg-[#14181c] border border-[#2c3440] shadow-xl group-hover:shadow-[0_4px_16px_rgba(0,0,0,0.6)] transition-all duration-200"
                      >
                        <img
                          src={game.coverUrl}
                          alt={game.title}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* List Footer */}
                <div className="flex items-center justify-between text-[11px] font-mono text-[#678] border-t border-[#2c3440]/60 pt-2.5">
                  <div className="flex items-center gap-2">
                    <span className="text-white font-bold">{list.gameIds.length} games</span>
                    <span>·</span>
                    <span>{list.isRanked ? 'Ranked Order' : 'Unranked'}</span>
                  </div>
                  <span>Updated {list.updatedAt}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create List Modal */}
      {createModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-hidden"
          onClick={(e) => {
            if (e.target === e.currentTarget) setCreateModalOpen(false);
          }}
        >
          <div className="bg-[#1b2228] border border-[#2c3440] rounded-xl w-full max-w-xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden relative my-auto animate-in zoom-in-95 p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-[#2c3440] pb-3 shrink-0">
              <h3 className="font-black text-sm uppercase tracking-wider text-white">
                Create a New Custom List
              </h3>
              <button
                type="button"
                onClick={() => setCreateModalOpen(false)}
                className="text-[#9ab] hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4 overflow-y-auto flex-1 custom-scrollbar pr-1">
              <div className="space-y-1">
                <label className="text-[11px] uppercase font-mono text-[#9ab] tracking-wider">
                  List Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. My Favorite Cozy Autumn Games"
                  value={newListTitle}
                  onChange={(e) => setNewListTitle(e.target.value)}
                  className="w-full bg-[#14181c] border border-[#2c3440] focus:border-[#00e054] rounded px-3 py-2 text-sm text-white placeholder-[#678] outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] uppercase font-mono text-[#9ab] tracking-wider">
                  Description
                </label>
                <textarea
                  rows={2}
                  placeholder="What theme or criteria defines this list?..."
                  value={newListDesc}
                  onChange={(e) => setNewListDesc(e.target.value)}
                  className="w-full bg-[#14181c] border border-[#2c3440] focus:border-[#00e054] rounded p-2.5 text-xs text-white placeholder-[#678] outline-none resize-none"
                />
              </div>

              <div className="flex items-center gap-6 text-xs text-[#9ab]">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isRanked}
                    onChange={(e) => setIsRanked(e.target.checked)}
                    className="rounded border-[#2c3440] text-[#00e054] focus:ring-0 bg-[#14181c]"
                  />
                  <span>Ranked order (1, 2, 3...)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isPublic}
                    onChange={(e) => setIsPublic(e.target.checked)}
                    className="rounded border-[#2c3440] text-[#00e054] focus:ring-0 bg-[#14181c]"
                  />
                  <span>Public list</span>
                </label>
              </div>

              {/* Game Search & Add */}
              <div className="space-y-2">
                <label className="text-[11px] uppercase font-mono text-[#9ab] tracking-wider flex items-center justify-between">
                  <span>Select Games to Include ({selectedGameIds.length} selected)</span>
                </label>
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-[#678]" />
                  <input
                    type="text"
                    placeholder="Search games to add to list..."
                    value={gameSearchQuery}
                    onChange={(e) => setGameSearchQuery(e.target.value)}
                    className="w-full bg-[#14181c] border border-[#2c3440] focus:border-[#00e054] rounded pl-8 pr-3 py-1.5 text-xs text-white placeholder-[#678] outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 max-h-48 overflow-y-auto pt-1 custom-scrollbar">
                  {filteredSearchGames.map((game) => {
                    const isSelected = selectedGameIds.includes(game.id);
                    return (
                      <button
                        key={game.id}
                        type="button"
                        onClick={() => toggleSelectGameForList(game.id)}
                        className={`flex items-center gap-2 p-1.5 rounded border text-left transition-colors ${
                          isSelected 
                            ? 'bg-[#00e054]/15 border-[#00e054] text-white' 
                            : 'bg-[#14181c] border-[#2c3440] text-[#9ab] hover:border-[#9ab]'
                        }`}
                      >
                        <img
                          src={game.coverUrl}
                          alt={game.title}
                          className="w-7 h-10 object-cover rounded-[2px] shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="text-xs font-bold truncate text-white">{game.title}</div>
                          <div className="text-[10px] font-mono text-[#678]">{game.releaseYear}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Submit */}
              <div className="flex justify-end gap-3 pt-3 border-t border-[#2c3440]">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-3 py-1.5 text-xs font-semibold text-[#9ab] hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newListTitle.trim() || selectedGameIds.length === 0}
                  className="bg-[#00e054] hover:bg-[#00e054]/90 disabled:opacity-40 text-[#14181c] font-black uppercase text-xs tracking-wider px-5 py-2 rounded shadow"
                >
                  Create List
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

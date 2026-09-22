import React, { useState, useEffect } from 'react';
import { Game, JournalEntry, FriendActivity, CustomList, GameCollection } from '../types';
import { StarRating } from './StarRating';
import { RatingHistogram } from './RatingHistogram';
import { 
  X, Check, Heart, Clock, Plus, Share2, ListPlus, 
  ExternalLink, Gamepad2, Calendar, Building, Sparkles, MessageSquare,
  Play, Loader2, Layers, CheckCircle2
} from 'lucide-react';
import { useLockBodyScroll } from '../hooks/useLockBodyScroll';

interface GameDetailModalProps {
  game: Game | null;
  onClose: () => void;
  onOpenLogModal: (game: Game) => void;
  onToggleWatchlist: (gameId: string) => void;
  onToggleLike: (gameId: string) => void;
  isPlayed: boolean;
  isLiked: boolean;
  isWatchlisted: boolean;
  userRating?: number;
  userEntry?: JournalEntry;
  userLists?: CustomList[];
  userCollections?: GameCollection[];
  onAddToList?: (listId: string, gameId: string) => void;
  onToggleGameInCollection?: (collectionId: string, gameId: string) => void;
  onOpenShareModal?: (game: Game, entry?: JournalEntry) => void;
  friendActivities?: FriendActivity[];
  allGames?: Game[];
  onSelectGame?: (game: Game) => void;
}

export const GameDetailModal: React.FC<GameDetailModalProps> = ({
  game,
  onClose,
  onOpenLogModal,
  onToggleWatchlist,
  onToggleLike,
  isPlayed,
  isLiked,
  isWatchlisted,
  userRating,
  userEntry,
  userLists = [],
  userCollections = [],
  onAddToList,
  onToggleGameInCollection,
  onOpenShareModal,
  friendActivities = [],
  allGames = [],
  onSelectGame
}) => {
  const [listSelectorOpen, setListSelectorOpen] = useState(false);
  const [collectionSelectorOpen, setCollectionSelectorOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'reviews' | 'cast'>('overview');
  const [trailerId, setTrailerId] = useState<string | null>(game?.trailerYoutubeId || null);
  const [trailerTitle, setTrailerTitle] = useState<string | null>(null);
  const [isLoadingTrailer, setIsLoadingTrailer] = useState(false);
  const [isTrailerModalOpen, setIsTrailerModalOpen] = useState(false);

  useLockBodyScroll(Boolean(game));

  // Fetch YouTube trailer if not pre-populated on the game
  useEffect(() => {
    if (!game) {
      setTrailerId(null);
      return;
    }

    if (game.trailerYoutubeId) {
      setTrailerId(game.trailerYoutubeId);
      setTrailerTitle(`${game.title} - Official Trailer`);
      setIsLoadingTrailer(false);
      return;
    }

    let isCancelled = false;
    setIsLoadingTrailer(true);

    fetch(`/api/games/trailer?title=${encodeURIComponent(game.title)}&year=${game.releaseYear || ''}`)
      .then(async (res) => {
        if (!res.ok) throw new Error('Trailer not found');
        return res.json();
      })
      .then((data) => {
        if (!isCancelled && data.videoId) {
          setTrailerId(data.videoId);
          setTrailerTitle(data.title || `${game.title} - Official Trailer`);
        }
      })
      .catch(() => {
        if (!isCancelled) {
          setTrailerId(null);
        }
      })
      .finally(() => {
        if (!isCancelled) {
          setIsLoadingTrailer(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [game?.id, game?.title, game?.trailerYoutubeId, game?.releaseYear]);

  // Handle ESC key to close trailer modal first if open
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isTrailerModalOpen) {
          e.stopPropagation();
          setIsTrailerModalOpen(false);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isTrailerModalOpen]);

  if (!game) return null;

  // Filter friend activities relevant to this game
  const relevantFriendActs = (friendActivities || []).filter(a => a?.gameId === game.id);

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-[#0b0e11]/90 backdrop-blur-sm overflow-y-auto transform-gpu will-change-transform custom-scrollbar"
      id="game-detail-modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isTrailerModalOpen) onClose();
      }}
    >
      <div 
        className="bg-[#14181c] border border-[#2c3440] w-full max-w-4xl min-h-screen sm:min-h-0 sm:rounded-xl shadow-2xl overflow-hidden relative my-auto text-[#e0e6ed]"
        id="game-detail-modal-dialog"
      >
        {/* Close Button */}
        <button
          type="button"
          id="close-game-detail-btn"
          onClick={onClose}
          className="absolute top-4 right-4 z-30 w-9 h-9 rounded-full bg-[#14181c]/80 hover:bg-[#2c3440] text-white flex items-center justify-center border border-[#2c3440] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Cinematic Backdrop Banner */}
        <div className="relative h-56 sm:h-72 w-full overflow-hidden bg-[#181e24]">
          <img
            src={game.backdropUrl || game.coverUrl}
            alt={game.title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-top opacity-50 filter saturate-125"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#14181c] via-[#14181c]/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#14181c] via-transparent to-[#14181c]/80" />
        </div>

        {/* Content Body */}
        <div className="px-4 sm:px-8 pb-8 relative -mt-20 sm:-mt-24 z-20">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8">
            {/* Left Column: Poster & Letterboxd Action Box (cols 4) */}
            <div className="md:col-span-4 flex flex-col items-center sm:items-start">
              {/* Poster */}
              <div className="relative aspect-[2/3] w-44 sm:w-56 rounded-md overflow-hidden bg-[#1f252d] border border-[#2c3440] shadow-2xl shrink-0">
                <img
                  src={game.coverUrl}
                  alt={game.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                {userEntry ? (
                  <div className="absolute top-2 left-2 bg-[#14181c]/90 text-[#00e054] px-2 py-0.5 rounded font-mono text-xs font-bold border border-[#00e054]/40">
                    Logged
                  </div>
                ) : game.featuredTag ? (
                  <div className="absolute top-2 left-2 bg-[#ff8000] text-[#14181c] px-2 py-0.5 rounded font-mono text-[10px] font-black uppercase shadow tracking-wider">
                    {game.featuredTag}
                  </div>
                ) : null}
              </div>

              {/* Letterboxd Action Box */}
              <div className="w-full max-w-[14rem] sm:max-w-none mt-4 bg-[#1b2228] border border-[#2c3440] rounded-lg p-3 space-y-3">
                {/* 3 Icons Row: Played, Liked, Watchlist */}
                <div className="flex items-center justify-around border-b border-[#2c3440] pb-2.5">
                  <button
                    type="button"
                    onClick={() => onOpenLogModal(game)}
                    className={`flex flex-col items-center gap-1 group transition-colors ${
                      isPlayed ? 'text-[#00e054]' : 'text-[#9ab] hover:text-white'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      isPlayed ? 'bg-[#00e054]/20 border border-[#00e054]' : 'bg-[#14181c] border border-[#2c3440]'
                    }`}>
                      <Check className="w-4 h-4 stroke-[2.5]" />
                    </div>
                    <span className="text-[10px] font-mono uppercase">Played</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onToggleLike(game.id)}
                    className={`flex flex-col items-center gap-1 group transition-colors ${
                      isLiked ? 'text-[#ff8000]' : 'text-[#9ab] hover:text-white'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      isLiked ? 'bg-[#ff8000]/20 border border-[#ff8000]' : 'bg-[#14181c] border border-[#2c3440]'
                    }`}>
                      <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                    </div>
                    <span className="text-[10px] font-mono uppercase">Like</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onToggleWatchlist(game.id)}
                    className={`flex flex-col items-center gap-1 group transition-colors ${
                      isWatchlisted ? 'text-[#40bcf4]' : 'text-[#9ab] hover:text-white'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      isWatchlisted ? 'bg-[#40bcf4]/20 border border-[#40bcf4]' : 'bg-[#14181c] border border-[#2c3440]'
                    }`}>
                      <Clock className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-mono uppercase">Backlog</span>
                  </button>
                </div>

                {/* User Current Rating */}
                <div className="flex flex-col items-center justify-center gap-1 py-1">
                  <span className="text-[10px] text-[#678] font-mono uppercase tracking-wider">
                    {userEntry ? 'Your Rating' : 'Rate this game'}
                  </span>
                  <StarRating
                    value={userEntry?.rating || 0}
                    onChange={() => onOpenLogModal(game)}
                    size="lg"
                    showNumeric
                  />
                </div>

                {/* Main Action Button */}
                <button
                  type="button"
                  onClick={() => onOpenLogModal(game)}
                  className="w-full bg-[#00e054] hover:bg-[#00e054]/90 text-[#14181c] font-extrabold uppercase text-xs tracking-wider py-2 rounded-md shadow flex items-center justify-center gap-1.5 transition-all active:scale-95"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                  <span>{userEntry ? 'Edit Review / Log' : 'Review or Log'}</span>
                </button>

                {/* Dedicated 'Watch Trailer' Button in Action Box */}
                <button
                  type="button"
                  id="action-watch-trailer-btn"
                  onClick={() => {
                    if (trailerId) setIsTrailerModalOpen(true);
                  }}
                  disabled={!trailerId && !isLoadingTrailer}
                  className={`w-full text-xs font-mono font-bold uppercase tracking-wider py-2 px-3 rounded-md flex items-center justify-center gap-2 transition-all border ${
                    trailerId
                      ? 'bg-[#ff0000]/15 hover:bg-[#ff0000] text-[#ff4e45] hover:text-white border-[#ff0000]/40 hover:border-[#ff0000] shadow-md cursor-pointer active:scale-95 group'
                      : isLoadingTrailer
                      ? 'bg-[#181e24] text-[#9ab] border-[#2c3440] cursor-wait'
                      : 'bg-[#14181c] text-[#556] border-[#222830] cursor-not-allowed opacity-60'
                  }`}
                  title={trailerId ? `Watch Official Trailer for ${game.title}` : isLoadingTrailer ? 'Finding official trailer...' : 'No trailer available'}
                >
                  {isLoadingTrailer ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-[#ff4e45]" />
                      <span>Finding Trailer...</span>
                    </>
                  ) : trailerId ? (
                    <>
                      <Play className="w-3.5 h-3.5 fill-current transition-transform group-hover:scale-110" />
                      <span>Watch Trailer</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 text-[#556]" />
                      <span>No Trailer Available</span>
                    </>
                  )}
                </button>

                {/* Secondary buttons */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  {/* Collections Dropdown */}
                  <div className="relative">
                    <button
                      type="button"
                      id="game-detail-collections-btn"
                      onClick={() => {
                        setCollectionSelectorOpen(!collectionSelectorOpen);
                        setListSelectorOpen(false);
                      }}
                      className="w-full bg-[#14181c] hover:bg-[#202830] text-[#9ab] hover:text-[#00e054] border border-[#2c3440] hover:border-[#00e054]/40 text-[11px] font-mono py-1.5 px-2 rounded flex items-center justify-center gap-1 transition-colors"
                      title="Manage Collections for this game"
                    >
                      <Layers className="w-3.5 h-3.5 text-[#00e054]" />
                      <span>Collections</span>
                    </button>

                    {collectionSelectorOpen && (
                      <div className="absolute left-0 bottom-full mb-1 w-56 bg-[#1f252d] border border-[#2c3440] rounded-lg shadow-2xl p-2.5 z-30 text-xs space-y-1.5">
                        <div className="text-[10px] font-mono uppercase tracking-wider text-[#9ab] px-1 pb-1 border-b border-[#2c3440] flex items-center justify-between">
                          <span>Themed Collections</span>
                          <span className="text-[#00e054] font-bold">Toggle</span>
                        </div>
                        {userCollections.length > 0 ? (
                          <div className="space-y-1 max-h-48 overflow-y-auto custom-scrollbar">
                            {userCollections.map((c) => {
                              const isIn = c.gameIds.includes(game.id);
                              return (
                                <button
                                  key={c.id}
                                  type="button"
                                  onClick={() => {
                                    if (onToggleGameInCollection) {
                                      onToggleGameInCollection(c.id, game.id);
                                    }
                                  }}
                                  className={`w-full text-left px-2 py-1.5 rounded flex items-center justify-between text-xs transition-colors ${
                                    isIn 
                                      ? 'bg-[#202830] text-[#00e054] font-bold' 
                                      : 'text-[#cad2db] hover:bg-[#2c3440]'
                                  }`}
                                >
                                  <div className="flex items-center gap-2 truncate">
                                    <span 
                                      className="w-2 h-2 rounded-full shrink-0" 
                                      style={{ backgroundColor: c.themeColor || '#00e054' }} 
                                    />
                                    <span className="truncate">{c.name}</span>
                                  </div>
                                  <span className={`w-4 h-4 rounded flex items-center justify-center text-[10px] shrink-0 ${
                                    isIn ? 'bg-[#00e054] text-black font-bold' : 'border border-[#2c3440]'
                                  }`}>
                                    {isIn ? '✓' : ''}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="text-[11px] text-[#678] font-mono p-2 text-center">
                            No collections created yet.
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Add to List Dropdown */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => {
                        setListSelectorOpen(!listSelectorOpen);
                        setCollectionSelectorOpen(false);
                      }}
                      className="w-full bg-[#14181c] hover:bg-[#202830] text-[#9ab] hover:text-white border border-[#2c3440] text-[11px] font-mono py-1.5 px-2 rounded flex items-center justify-center gap-1 transition-colors"
                    >
                      <ListPlus className="w-3.5 h-3.5" />
                      <span>Add to list</span>
                    </button>

                    {listSelectorOpen && (
                      <div className="absolute right-0 bottom-full mb-1 w-48 bg-[#1f252d] border border-[#2c3440] rounded-lg shadow-xl p-2 z-30 text-xs space-y-1 max-h-48 overflow-y-auto custom-scrollbar">
                        <div className="text-[10px] font-mono uppercase text-[#9ab] px-1">Select List:</div>
                        {(userLists || []).map((l) => (
                          <button
                            key={l.id}
                            type="button"
                            onClick={() => {
                              if (onAddToList) onAddToList(l.id, game.id);
                              setListSelectorOpen(false);
                            }}
                            className="w-full text-left px-2 py-1.5 rounded hover:bg-[#2c3440] truncate text-white"
                          >
                            {l.title}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Share button */}
                <button
                  type="button"
                  onClick={() => {
                    if (onOpenShareModal) onOpenShareModal(game, userEntry);
                  }}
                  className="w-full bg-[#14181c] hover:bg-[#202830] text-[#9ab] hover:text-[#ff8000] border border-[#2c3440] text-[11px] font-mono py-1.5 px-2 rounded flex items-center justify-center gap-1 transition-colors"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Share Card</span>
                </button>
              </div>
            </div>

            {/* Right Column: Title, Metadata, Synopsis, Histogram, Reviews (cols 8) */}
            <div className="md:col-span-8 space-y-6">
              {/* Header Title & Director/Studio info */}
              <div>
                {game.featuredTag && (
                  <div className="mb-2">
                    <span className="inline-flex items-center gap-1.5 bg-[#ff8000] text-[#14181c] font-black uppercase text-[11px] font-mono px-3 py-1 rounded shadow tracking-wider">
                      ★ {game.featuredTag}
                    </span>
                  </div>
                )}
                <div className="flex flex-wrap items-baseline gap-3">
                  <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                    {game.title}
                  </h1>
                  <span className="text-xl text-[#9ab] font-light font-mono">
                    {game.releaseYear}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-[#9ab] mt-1.5">
                  <span>Directed & Developed by</span>
                  <span className="text-white font-semibold underline decoration-[#2c3440] underline-offset-4">
                    {game.developer}
                  </span>
                  <span>·</span>
                  <span>Published by {game.publisher}</span>
                </div>

                {/* Genre chips & Quick Trailer Chip */}
                <div className="flex flex-wrap items-center gap-1.5 mt-3">
                  {game.genres.map((g) => (
                    <span 
                      key={g} 
                      className="bg-[#202830] hover:bg-[#2c3440] text-[#9ab] hover:text-[#00e054] text-[11px] font-mono px-2.5 py-1 rounded-full border border-[#2c3440] cursor-pointer transition-colors"
                    >
                      {g}
                    </span>
                  ))}
                  {game.metacritic && (
                    <span className="bg-[#66cc33]/15 text-[#66cc33] border border-[#66cc33]/30 text-[11px] font-mono font-bold px-2 py-1 rounded">
                      Metacritic {game.metacritic}
                    </span>
                  )}
                  <span className="bg-[#00e054]/10 text-[#00e054] border border-[#00e054]/30 text-[11px] font-mono font-bold px-2 py-1 rounded">
                    ★ {game.averageRating.toFixed(1)} / 5.0
                  </span>
                </div>
              </div>

              {/* HowLongToBeat.com Completion Length Times */}
              <div className="bg-[#14181c] border border-[#2c3440] rounded-lg p-3 sm:p-4 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold uppercase font-mono tracking-wider text-[#40bcf4]">
                    <Clock className="w-3.5 h-3.5 text-[#40bcf4]" />
                    <span>Completion Time</span>
                  </div>
                  <span className="text-[10px] font-mono text-[#678] bg-[#1f252d] px-2 py-0.5 rounded border border-[#2c3440]/80">
                    Source: howlongtobeat.com
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div className="bg-[#181e24] p-2.5 rounded border border-[#2c3440] flex flex-col">
                    <span className="text-[10px] uppercase font-mono text-[#9ab]">Main Story</span>
                    <span className="text-base font-bold text-white font-mono mt-0.5">
                      {game.hltb?.mainStory || game.playtimeHours || 25} <span className="text-xs font-normal text-[#678]">Hours</span>
                    </span>
                  </div>
                  <div className="bg-[#181e24] p-2.5 rounded border border-[#2c3440] flex flex-col">
                    <span className="text-[10px] uppercase font-mono text-[#9ab]">Main + Extra</span>
                    <span className="text-base font-bold text-[#40bcf4] font-mono mt-0.5">
                      {game.hltb?.mainExtra || Math.round((game.hltb?.mainStory || 25) * 1.8)} <span className="text-xs font-normal text-[#678]">Hours</span>
                    </span>
                  </div>
                  <div className="bg-[#181e24] p-2.5 rounded border border-[#2c3440] flex flex-col">
                    <span className="text-[10px] uppercase font-mono text-[#9ab]">Completionist</span>
                    <span className="text-base font-bold text-[#00e054] font-mono mt-0.5">
                      {game.hltb?.completionist || Math.round((game.hltb?.mainStory || 25) * 2.8)} <span className="text-xs font-normal text-[#678]">Hours</span>
                    </span>
                  </div>
                  <div className="bg-[#181e24] p-2.5 rounded border border-[#2c3440] flex flex-col">
                    <span className="text-[10px] uppercase font-mono text-[#9ab]">All Styles</span>
                    <span className="text-base font-bold text-[#e0e6ed] font-mono mt-0.5">
                      {game.hltb?.allStyles || Math.round((game.hltb?.mainStory || 25) * 1.7)} <span className="text-xs font-normal text-[#678]">Hours</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Official Game Description */}
              <div className="space-y-2 border-t border-[#2c3440]/60 pt-4">
                <div className="text-[11px] uppercase font-mono text-[#9ab] tracking-wider font-bold">
                  Official Game Description
                </div>
                <div className="text-sm text-[#c8d4e0] leading-relaxed">
                  <p>{game.officialDescription || game.synopsis}</p>
                </div>
              </div>

              {/* Supported Platforms */}
              <div className="space-y-1.5">
                <div className="text-[11px] uppercase font-mono text-[#678] tracking-wider">
                  Available Platforms
                </div>
                <div className="flex flex-wrap gap-2 text-xs font-mono">
                  {game.platforms.map((p) => (
                    <span key={p} className="bg-[#14181c] px-2.5 py-1 rounded border border-[#2c3440] text-[#9ab]">
                      {p}
                    </span>
                  ))}
                </div>
              </div>

              {/* Letterboxd Signature Rating Histogram */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs uppercase font-mono text-[#9ab] tracking-wider">
                  <span>Community Rating Distribution</span>
                  <span className="text-[10px] text-[#9ab] font-mono">{(game.totalRatings || 1250).toLocaleString()} ratings</span>
                </div>
                <RatingHistogram
                  averageRating={game.averageRating}
                  totalRatings={game.totalRatings}
                />
              </div>

              {/* User's Own Log (if exists) */}
              {userEntry && (
                <div className="bg-[#1b2228] border border-[#00e054]/30 rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#00e054] font-bold uppercase font-mono flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Your Diary Entry from {userEntry.datePlayed}</span>
                    </span>
                    <div className="flex items-center gap-2">
                      <StarRating value={userEntry.rating} readOnly size="sm" />
                      {userEntry.isLiked && <Heart className="w-3.5 h-3.5 text-[#ff8000] fill-current" />}
                    </div>
                  </div>
                  {userEntry.reviewText ? (
                    <p className="text-xs sm:text-sm text-[#e0e6ed] italic pl-2 border-l-2 border-[#00e054]">
                      "{userEntry.reviewText}"
                    </p>
                  ) : (
                    <p className="text-xs text-[#678] italic">No review text written.</p>
                  )}
                  {userEntry.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {userEntry.tags.map(t => (
                        <span key={t} className="text-[10px] bg-[#14181c] text-[#9ab] px-2 py-0.5 rounded font-mono border border-[#2c3440]">
                          #{t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Friend Activity Section on this game */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between border-b border-[#2c3440] pb-2">
                  <h3 className="text-xs uppercase font-mono text-[#9ab] tracking-wider flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-[#40bcf4]" />
                    <span>Friend & Community Logs</span>
                  </h3>
                  <span className="text-xs font-mono text-[#678]">
                    {relevantFriendActs.length} logs
                  </span>
                </div>

                {relevantFriendActs.length > 0 ? (
                  <div className="space-y-3">
                    {relevantFriendActs.map((act) => (
                      <div key={act.id} className="bg-[#181e24] border border-[#2c3440] rounded-lg p-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <img
                              src={act.userAvatar}
                              alt={act.userName}
                              className="w-7 h-7 rounded-full object-cover border border-[#2c3440]"
                            />
                            <div>
                              <span className="text-xs font-bold text-white hover:underline cursor-pointer">
                                {act.userName}
                              </span>
                              <span className="text-[11px] text-[#678] font-mono ml-2">{act.timestamp}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {act.rating && <StarRating value={act.rating} readOnly size="sm" />}
                            {act.isLiked && <Heart className="w-3.5 h-3.5 text-[#ff8000] fill-current" />}
                          </div>
                        </div>

                        {act.reviewText && (
                          <p className="text-xs text-[#c8d4e0] leading-relaxed pl-2 border-l-2 border-[#2c3440]">
                            {act.reviewText}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs text-[#678] font-mono py-2 italic">
                    None of your followed friends have logged this game yet. Be the first to review!
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Video Modal Overlay for YouTube Trailer */}
      {isTrailerModalOpen && trailerId && (
        <div 
          className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-6 bg-black/95 backdrop-blur-md"
          id="video-trailer-modal-backdrop"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsTrailerModalOpen(false);
          }}
        >
          <div 
            className="bg-[#14181c] border border-[#2c3440] w-full max-w-4xl rounded-xl shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col relative my-auto"
            id="video-trailer-modal-dialog"
          >
            {/* Video Modal Header */}
            <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-[#2c3440] bg-[#181e24]">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="w-7 h-7 rounded-full bg-[#ff0000] text-white flex items-center justify-center shrink-0 shadow">
                  <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                </span>
                <div className="min-w-0">
                  <h2 className="text-sm sm:text-base font-bold text-white truncate flex items-center gap-2">
                    <span>{game.title}</span>
                    <span className="text-xs text-[#9ab] font-mono font-normal">({game.releaseYear})</span>
                  </h2>
                  <div className="text-[11px] text-[#9ab] font-mono truncate">
                    {trailerTitle || 'Official Game Trailer'} · {game.developer}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={`https://www.youtube.com/watch?v=${trailerId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#1f252d] hover:bg-[#2c3440] text-[#9ab] hover:text-white border border-[#2c3440] text-xs font-mono transition-colors"
                  title="Open in YouTube (new tab)"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Open YouTube</span>
                </a>

                <button
                  type="button"
                  id="close-trailer-modal-btn"
                  onClick={() => setIsTrailerModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-[#1f252d] hover:bg-[#2c3440] text-[#9ab] hover:text-white flex items-center justify-center border border-[#2c3440] transition-colors"
                  title="Close Trailer (Esc)"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* 16:9 Aspect Ratio Video Frame */}
            <div className="relative w-full aspect-video bg-black flex items-center justify-center">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${trailerId}?autoplay=1&rel=0&modestbranding=1`}
                title={`${game.title} Official Trailer`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="w-full h-full border-0"
              />
            </div>

            {/* Video Modal Footer */}
            <div className="px-4 sm:px-6 py-2.5 bg-[#101418] border-t border-[#2c3440] flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-[#9ab]">
              <div className="flex items-center gap-3">
                <span className="text-[#00e054] font-bold">★ {game.averageRating.toFixed(1)}</span>
                <span>·</span>
                <span>{game.genres.slice(0, 2).join(', ')}</span>
                {game.metacritic && (
                  <>
                    <span>·</span>
                    <span className="text-[#66cc33]">Metascore {game.metacritic}</span>
                  </>
                )}
              </div>
              <div className="text-[11px] text-[#678]">
                Press <kbd className="bg-[#1b2228] px-1.5 py-0.5 rounded border border-[#2c3440] text-white">ESC</kbd> or click outside to exit
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

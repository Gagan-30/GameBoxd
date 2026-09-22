import React, { useState } from 'react';
import { motion } from 'motion/react';
import { FriendActivity, Game, UserProfile } from '../types';
import { StarRating } from './StarRating';
import { Heart, MessageSquare, UserPlus, UserCheck, Send, Share2, Sparkles, Trophy } from 'lucide-react';

interface SocialFeedViewProps {
  activities: FriendActivity[];
  allGames: Game[];
  currentUser: UserProfile;
  onSelectGame: (game: Game) => void;
  onToggleFollow: (handle: string) => void;
  onLikeActivity: (activityId: string) => void;
  onAddComment: (activityId: string, text: string) => void;
  onViewMemberProfile: (handle: string) => void;
}

export const SocialFeedView: React.FC<SocialFeedViewProps> = ({
  activities = [],
  allGames = [],
  currentUser,
  onSelectGame,
  onToggleFollow,
  onLikeActivity,
  onAddComment,
  onViewMemberProfile
}) => {
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});
  const [feedFilter, setFeedFilter] = useState<'following' | 'all'>('following');
  const [likeAnimKeys, setLikeAnimKeys] = useState<Record<string, number>>({});

  const safeGames = allGames || [];
  const safeActivities = activities || [];
  const getGame = (id: string) => safeGames.find(g => g.id === id);

  const handleLike = (activityId: string) => {
    setLikeAnimKeys(prev => ({
      ...prev,
      [activityId]: (prev[activityId] || 0) + 1
    }));
    onLikeActivity(activityId);
  };

  const handleCommentSubmit = (activityId: string, e: React.FormEvent) => {
    e.preventDefault();
    const text = commentInputs[activityId]?.trim();
    if (!text) return;
    onAddComment(activityId, text);
    setCommentInputs({ ...commentInputs, [activityId]: '' });
  };

  const toggleComments = (actId: string) => {
    setExpandedComments({ ...expandedComments, [actId]: !expandedComments[actId] });
  };

  // Sample community members to discover
  const suggestedMembers = [
    {
      name: 'Elena Rostova',
      handle: 'elenagames',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      bio: 'Soulsborne scholar, soundtrack collector. Top 4: Elden Ring, Bloodborne, Hollow Knight, NieR: Automata',
      gamesLogged: 342,
      favFour: ['elden-ring', 'bloodborne', 'hollow-knight', 'disco-elysium']
    },
    {
      name: 'Kai Nakamura',
      handle: 'kainaka',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      bio: 'Indie puzzle detective. Always seeking outer worlds and time loops.',
      gamesLogged: 189,
      favFour: ['outer-wilds', 'celeste', 'portal-2', 'hades-2']
    },
    {
      name: 'Sarah Jenkins',
      handle: 'sarahj_plays',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      bio: 'CRPG addict. 400+ hours in Baldur’s Gate 3 and counting.',
      gamesLogged: 215,
      favFour: ['baldurs-gate-3', 'disco-elysium', 'witcher-3', 'cyberpunk-2077']
    }
  ];

  const followingList = currentUser?.following || [];
  const userHandle = currentUser?.handle || 'alex_mercer';

  const filteredActivities = safeActivities.filter(act => {
    if (feedFilter === 'following') {
      return followingList.includes(act.userHandle) || act.userHandle === userHandle;
    }
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6" id="social-feed-view">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#2c3440] pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-wider text-white flex items-center gap-3">
            <span>Friends & Social Activity</span>
            <span className="w-2 h-2 rounded-full bg-[#00e054] animate-ping" />
          </h1>
          <p className="text-xs sm:text-sm text-[#9ab] font-mono mt-1">
            Follow friends, discover what the community is playing right now, read logs, and exchange thoughts.
          </p>
        </div>

        {/* Tab filter: Following vs Community */}
        <div className="flex items-center gap-1 bg-[#181e24] p-1 rounded-lg border border-[#2c3440] text-xs font-mono">
          <button
            type="button"
            onClick={() => setFeedFilter('following')}
            className={`px-3 py-1.5 rounded transition-colors ${
              feedFilter === 'following' ? 'bg-[#2c3440] text-white font-bold' : 'text-[#9ab] hover:text-white'
            }`}
          >
            Friends Following ({followingList.length})
          </button>
          <button
            type="button"
            onClick={() => setFeedFilter('all')}
            className={`px-3 py-1.5 rounded transition-colors ${
              feedFilter === 'all' ? 'bg-[#2c3440] text-white font-bold' : 'text-[#9ab] hover:text-white'
            }`}
          >
            All Activity
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Activity Feed (cols 8) */}
        <div className="lg:col-span-8 space-y-4">
          {filteredActivities.map((act) => {
            const game = getGame(act.gameId);
            const isCommentsOpen = expandedComments[act.id];

            return (
              <div 
                key={act.id} 
                className="bg-[#181e24] border border-[#2c3440] rounded-xl p-4 sm:p-5 space-y-3 shadow-md"
                id={`activity-${act.id}`}
              >
                {/* User Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => onViewMemberProfile(act.userHandle)}
                      className="w-10 h-10 rounded-full overflow-hidden border border-[#2c3440] hover:border-[#00e054] transition-colors shrink-0"
                    >
                      <img
                        src={act.userAvatar}
                        alt={act.userName}
                        className="w-full h-full object-cover"
                      />
                    </button>
                    <div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => onViewMemberProfile(act.userHandle)}
                          className="font-bold text-sm text-white hover:text-[#00e054] transition-colors"
                        >
                          {act.userName}
                        </button>
                        <span className="text-xs text-[#678] font-mono">@{act.userHandle}</span>
                      </div>
                      <div className="text-[11px] text-[#9ab] font-mono">
                        {act.action === 'reviewed' && 'reviewed a game'}
                        {act.action === 'logged' && 'logged play session'}
                        {act.action === 'created_list' && `curated a new list: "${act.listTitle}"`}
                        <span> · {act.timestamp}</span>
                      </div>
                    </div>
                  </div>

                  {/* Rating / Likes on header */}
                  {act.rating && (
                    <div className="flex items-center gap-1.5">
                      <StarRating value={act.rating} readOnly size="sm" showNumeric />
                    </div>
                  )}
                </div>

                {/* Game Card / Content Box */}
                <div className="flex gap-4 bg-[#14181c] p-3 rounded-lg border border-[#2c3440]">
                  <div 
                    onClick={() => game && onSelectGame(game)}
                    className="aspect-[2/3] w-16 sm:w-20 rounded overflow-hidden bg-[#1f252d] border border-[#2c3440] shrink-0 cursor-pointer shadow hover:border-[#00e054] transition-colors"
                  >
                    <img
                      src={act.gameCoverUrl}
                      alt={act.gameTitle}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-baseline gap-2">
                      <h4 
                        onClick={() => game && onSelectGame(game)}
                        className="font-extrabold text-sm sm:text-base text-white hover:text-[#00e054] cursor-pointer truncate transition-colors"
                      >
                        {act.gameTitle}
                      </h4>
                      <span className="text-xs text-[#678] font-mono">{act.releaseYear}</span>
                    </div>

                    {act.reviewText && (
                      <p className="text-xs sm:text-sm text-[#c8d4e0] leading-relaxed pt-1">
                        "{act.reviewText}"
                      </p>
                    )}

                    {act.listTitle && act.listGameIds && (
                      <div className="pt-1 flex items-center gap-2 text-xs text-[#40bcf4] font-mono">
                        <span>Includes {act.listGameIds.length} titles</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Bar: Likes & Comments */}
                <div className="flex items-center justify-between pt-1 border-t border-[#2c3440]/60 text-xs">
                  <div className="flex items-center gap-4">
                    <motion.button
                      type="button"
                      id={`like-activity-btn-${act.id}`}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleLike(act.id)}
                      className={`relative flex items-center gap-1.5 transition-colors font-mono select-none px-2 py-1 rounded-md -ml-2 hover:bg-[#202730]/60 ${
                        act.hasUserLiked ? 'text-[#ff8000]' : 'text-[#9ab] hover:text-[#ff8000]'
                      }`}
                      title={act.hasUserLiked ? 'Unlike' : 'Like'}
                      aria-label={act.hasUserLiked ? 'Unlike activity' : 'Like activity'}
                    >
                      <span className="relative flex items-center justify-center">
                        <motion.span
                          key={`heart-${act.id}-${likeAnimKeys[act.id] || 0}`}
                          animate={likeAnimKeys[act.id] ? {
                            scale: [1, 1.34, 0.94, 1.18, 1],
                            rotate: [0, -7, 5, -2, 0]
                          } : {}}
                          transition={{
                            duration: 0.45,
                            ease: [0.22, 1, 0.36, 1],
                            times: [0, 0.28, 0.52, 0.78, 1]
                          }}
                          className="inline-flex items-center justify-center"
                        >
                          <Heart className={`w-4 h-4 transition-colors duration-200 ${act.hasUserLiked ? 'fill-current' : ''}`} />
                        </motion.span>

                        {/* Radiant pulse ripple expanding behind the heart on like */}
                        {likeAnimKeys[act.id] && act.hasUserLiked && (
                          <motion.span
                            key={`ripple-${act.id}-${likeAnimKeys[act.id]}`}
                            initial={{ scale: 0.8, opacity: 0.7 }}
                            animate={{ scale: 2.2, opacity: 0 }}
                            transition={{ duration: 0.45, ease: 'easeOut' }}
                            className="absolute w-4 h-4 rounded-full bg-[#ff8000]/30 pointer-events-none"
                          />
                        )}
                      </span>

                      <motion.span
                        key={`likes-count-${act.id}-${act.likesCount}`}
                        initial={likeAnimKeys[act.id] ? { y: -2, opacity: 0.8 } : false}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.2 }}
                      >
                        {act.likesCount}
                      </motion.span>
                    </motion.button>

                    <button
                      type="button"
                      onClick={() => toggleComments(act.id)}
                      className="flex items-center gap-1.5 text-[#9ab] hover:text-[#40bcf4] transition-colors font-mono"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>{act.comments.length} comments</span>
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => game && onSelectGame(game)}
                    className="text-[11px] font-mono text-[#00e054] hover:underline"
                  >
                    View Game Page →
                  </button>
                </div>

                {/* Expandable Comments Drawer */}
                {isCommentsOpen && (
                  <div className="pt-3 border-t border-[#2c3440] space-y-3 animate-in fade-in">
                    {act.comments.map((comment) => (
                      <div key={comment.id} className="flex gap-2.5 bg-[#14181c] p-2.5 rounded-lg border border-[#2c3440]/80">
                        <img
                          src={comment.userAvatar}
                          alt={comment.userName}
                          className="w-6 h-6 rounded-full object-cover shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-baseline gap-2">
                            <span className="text-xs font-bold text-white">{comment.userName}</span>
                            <span className="text-[10px] text-[#678] font-mono">{comment.timestamp}</span>
                          </div>
                          <p className="text-xs text-[#c8d4e0] mt-0.5">{comment.text}</p>
                        </div>
                      </div>
                    ))}

                    {/* Add Comment Input */}
                    <form onSubmit={(e) => handleCommentSubmit(act.id, e)} className="flex gap-2 pt-1">
                      <input
                        type="text"
                        placeholder="Write a comment..."
                        value={commentInputs[act.id] || ''}
                        onChange={(e) => setCommentInputs({ ...commentInputs, [act.id]: e.target.value })}
                        className="flex-1 bg-[#14181c] border border-[#2c3440] focus:border-[#00e054] rounded-lg px-3 py-1.5 text-xs text-white placeholder-[#678] outline-none"
                      />
                      <button
                        type="submit"
                        disabled={!commentInputs[act.id]?.trim()}
                        className="bg-[#00e054] hover:bg-[#00e054]/90 disabled:opacity-40 text-[#14181c] font-bold p-1.5 rounded-lg transition-transform active:scale-95"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </form>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Right Column: Discover Friends & Letterboxd "Favorite Four" Spotlight (cols 4) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Member Suggestions */}
          <div className="bg-[#181e24] border border-[#2c3440] rounded-xl p-4 sm:p-5 space-y-4 shadow-md">
            <div className="flex items-center justify-between border-b border-[#2c3440] pb-2.5">
              <h3 className="font-extrabold text-xs uppercase tracking-wider text-white flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-[#00e054]" />
                <span>Popular Gamers to Follow</span>
              </h3>
            </div>

            <div className="space-y-4">
              {suggestedMembers.map((member) => {
                const isFollowing = followingList.includes(member.handle);

                return (
                  <div key={member.handle} className="space-y-2 pb-3 border-b border-[#2c3440]/50 last:border-0 last:pb-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={member.avatar}
                          alt={member.name}
                          className="w-9 h-9 rounded-full object-cover border border-[#2c3440]"
                        />
                        <div>
                          <div className="font-bold text-xs text-white">{member.name}</div>
                          <div className="text-[10px] text-[#678] font-mono">@{member.handle} · {member.gamesLogged} games</div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => onToggleFollow(member.handle)}
                        className={`text-xs font-mono px-2.5 py-1 rounded transition-colors flex items-center gap-1 ${
                          isFollowing
                            ? 'bg-[#2c3440] text-[#00e054]'
                            : 'bg-[#00e054] text-[#14181c] font-bold hover:bg-[#00e054]/90'
                        }`}
                      >
                        {isFollowing ? (
                          <>
                            <UserCheck className="w-3 h-3" />
                            <span>Following</span>
                          </>
                        ) : (
                          <>
                            <UserPlus className="w-3 h-3" />
                            <span>Follow</span>
                          </>
                        )}
                      </button>
                    </div>

                    <p className="text-[11px] text-[#9ab] line-clamp-2 leading-relaxed">
                      {member.bio}
                    </p>

                    {/* Member's Favorite 4 mini showcase */}
                    <div className="flex items-center gap-1.5 pt-1">
                      <span className="text-[9px] uppercase font-mono text-[#678]">Fav 4:</span>
                      <div className="flex items-center gap-1">
                        {member.favFour.map(gid => {
                          const g = getGame(gid);
                          if (!g) return null;
                          return (
                            <img
                              key={gid}
                              src={g.coverUrl}
                              alt={g.title}
                              title={g.title}
                              onClick={() => onSelectGame(g)}
                              className="w-6 h-8 rounded-[2px] object-cover border border-[#2c3440] cursor-pointer hover:border-[#00e054]"
                            />
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

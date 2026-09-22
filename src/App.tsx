import React, { useState, useEffect } from 'react';
import { Game, JournalEntry, CustomList, UserProfile, FriendActivity, Milestone, GameCollection } from './types';
import { 
  getStoredGames, saveStoredGames, 
  getStoredJournal, saveStoredJournal, 
  getStoredLists, saveStoredLists, 
  getStoredCollections, saveStoredCollections,
  getStoredProfile, saveStoredProfile, 
  getStoredActivities, saveStoredActivities, 
  getStoredWatchlist, saveStoredWatchlist, 
  getStoredLikedGames, saveStoredLikedGames, 
  getStoredMilestones, saveStoredMilestones 
} from './utils/storage';

// Components
import { Header } from './components/Header';
import { MobileBottomNav } from './components/MobileBottomNav';
import { GamesExploreView } from './components/GamesExploreView';
import { DiaryView } from './components/DiaryView';
import { CollectionsView } from './components/CollectionsView';
import { ListsView } from './components/ListsView';
import { SocialFeedView } from './components/SocialFeedView';
import { StatsView } from './components/StatsView';
import { ProfileView } from './components/ProfileView';

// Modals
import { GameDetailModal } from './components/GameDetailModal';
import { LogModal } from './components/LogModal';
import { SearchModal } from './components/SearchModal';
import { ShareMilestoneModal } from './components/ShareMilestoneModal';
import { useLockBodyScroll } from './hooks/useLockBodyScroll';

export default function App() {
  // Navigation State
  const [activeTab, setActiveTab] = useState<'games' | 'diary' | 'collections' | 'lists' | 'activity' | 'stats' | 'profile'>('games');

  // Core Data States (hydrated from local storage)
  const [games, setGames] = useState<Game[]>(() => getStoredGames());
  const [journal, setJournal] = useState<JournalEntry[]>(() => getStoredJournal());
  const [lists, setLists] = useState<CustomList[]>(() => getStoredLists());
  const [collections, setCollections] = useState<GameCollection[]>(() => getStoredCollections());
  const [profile, setProfile] = useState<UserProfile>(() => getStoredProfile());
  const [activities, setActivities] = useState<FriendActivity[]>(() => getStoredActivities());
  const [watchlist, setWatchlist] = useState<string[]>(() => getStoredWatchlist());
  const [likedGames, setLikedGames] = useState<string[]>(() => getStoredLikedGames());
  const [milestones, setMilestones] = useState<Milestone[]>(() => getStoredMilestones());

  // Connectivity State
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);

  // Modal States
  const [selectedGameForDetail, setSelectedGameForDetail] = useState<Game | null>(null);
  const [selectedGameForLog, setSelectedGameForLog] = useState<Game | null>(null);
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isFetchingOnline, setIsFetchingOnline] = useState(false);
  
  // Share Modal State
  const [shareData, setShareData] = useState<{
    isOpen: boolean;
    game?: Game | null;
    entry?: JournalEntry | null;
    milestone?: Milestone | null;
  }>({
    isOpen: false,
    game: null,
    entry: null,
    milestone: null
  });

  // Lock body scrolling whenever any modal is open to eliminate duplicate scrollbars
  const isAnyModalOpen = Boolean(
    selectedGameForDetail ||
    selectedGameForLog ||
    isSearchModalOpen ||
    shareData.isOpen
  );
  useLockBodyScroll(isAnyModalOpen);

  // Listen to connectivity events
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Fetch live trending games online on startup
  useEffect(() => {
    fetchOnlineGames();
  }, []);

  // Fetch games online directly from Steam catalogue endpoint
  const fetchOnlineGames = async () => {
    setIsFetchingOnline(true);
    try {
      const res = await fetch('/api/games/online');
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.games) && data.games.length > 0) {
          setGames(prevGames => {
            const existingIds = new Set(prevGames.map(g => g.id));
            const existingTitles = new Set(prevGames.map(g => g.title.toLowerCase().trim()));
            const newOnlineGames = data.games.filter(
              (g: Game) => !existingIds.has(g.id) && !existingTitles.has(g.title.toLowerCase().trim())
            );
            if (newOnlineGames.length === 0) return prevGames;
            const updated = [...prevGames, ...newOnlineGames];
            saveStoredGames(updated);
            return updated;
          });
        }
      }
    } catch (e) {
      console.warn('Failed to fetch online games:', e);
    } finally {
      setIsFetchingOnline(false);
    }
  };

  // Auto-save collections to storage
  useEffect(() => {
    saveStoredCollections(collections);
  }, [collections]);

  // Reload data helper for backups & restores
  const reloadAllData = () => {
    setGames(getStoredGames());
    setJournal(getStoredJournal());
    setLists(getStoredLists());
    setCollections(getStoredCollections());
    setProfile(getStoredProfile());
    setActivities(getStoredActivities());
    setWatchlist(getStoredWatchlist());
    setLikedGames(getStoredLikedGames());
    setMilestones(getStoredMilestones());
  };

  // Check and unlock milestones dynamically
  const checkMilestones = (currentJournal: JournalEntry[]) => {
    let updated = false;
    const nextMilestones = milestones.map(m => {
      let isUnlocked = m.isUnlocked;
      let currentCount = m.currentCount;

      if (m.id === 'first-log') {
        currentCount = currentJournal.length;
        if (currentCount >= 1 && !isUnlocked) isUnlocked = true;
      } else if (m.id === 'ten-games') {
        currentCount = currentJournal.length;
        if (currentCount >= 10 && !isUnlocked) isUnlocked = true;
      } else if (m.id === 'souls-veteran') {
        const soulGames = currentJournal.filter(e => {
          const g = games.find(game => game.id === e.gameId);
          return g?.genres.includes('Souls-like');
        });
        currentCount = soulGames.length;
        if (currentCount >= 3 && !isUnlocked) isUnlocked = true;
      }

      if (isUnlocked !== m.isUnlocked || currentCount !== m.currentCount) {
        updated = true;
        return { ...m, isUnlocked, currentCount };
      }
      return m;
    });

    if (updated) {
      setMilestones(nextMilestones);
      saveStoredMilestones(nextMilestones);
    }
  };

  // --- Handlers ---

  // Logging & Editing
  const handleSaveJournalEntry = (entryData: Partial<JournalEntry>) => {
    let nextJournal: JournalEntry[];

    if (editingEntry) {
      // Update existing
      nextJournal = journal.map(item => 
        item.id === editingEntry.id ? { ...item, ...entryData } as JournalEntry : item
      );
    } else {
      // Create new
      const newEntry: JournalEntry = {
        id: `entry-${Date.now()}`,
        gameId: entryData.gameId!,
        gameTitle: entryData.gameTitle!,
        gameCoverUrl: entryData.gameCoverUrl!,
        releaseYear: entryData.releaseYear || 2024,
        rating: entryData.rating || 4.0,
        isLiked: !!entryData.isLiked,
        isReplay: !!entryData.isReplay,
        datePlayed: entryData.datePlayed || new Date().toISOString().split('T')[0],
        reviewText: entryData.reviewText || '',
        platform: entryData.platform || 'PC',
        tags: entryData.tags || [],
        containsSpoilers: entryData.containsSpoilers || false,
        hoursPlayed: entryData.hoursPlayed || 0,
        createdAt: new Date().toISOString()
      };
      nextJournal = [newEntry, ...journal];

      // Add corresponding friend activity
      const newActivity: FriendActivity = {
        id: `act-${Date.now()}`,
        userId: profile.id,
        userName: profile.displayName,
        userAvatar: (profile as any).avatarUrl || (profile as any).avatar,
        userHandle: profile.handle,
        action: newEntry.reviewText ? 'reviewed' : 'logged',
        gameId: newEntry.gameId,
        gameTitle: newEntry.gameTitle,
        gameCoverUrl: newEntry.gameCoverUrl,
        releaseYear: newEntry.releaseYear,
        rating: newEntry.rating,
        isLiked: newEntry.isLiked,
        reviewText: newEntry.reviewText,
        isReplay: newEntry.isReplay,
        timestamp: 'Just now',
        likesCount: 0,
        hasUserLiked: false,
        comments: []
      };
      const nextActivities = [newActivity, ...activities];
      setActivities(nextActivities);
      saveStoredActivities(nextActivities);
    }

    setJournal(nextJournal);
    saveStoredJournal(nextJournal);
    checkMilestones(nextJournal);

    // Also update liked games list if liked
    if (entryData.isLiked && entryData.gameId && !likedGames.includes(entryData.gameId)) {
      const nextLikes = [...likedGames, entryData.gameId];
      setLikedGames(nextLikes);
      saveStoredLikedGames(nextLikes);
    }

    setSelectedGameForLog(null);
    setEditingEntry(null);
  };

  const handleDeleteJournalEntry = (entryId: string) => {
    if (window.confirm('Delete this journal entry?')) {
      const nextJournal = journal.filter(e => e.id !== entryId);
      setJournal(nextJournal);
      saveStoredJournal(nextJournal);
    }
  };

  const handleToggleWatchlist = (gameId: string) => {
    const next = watchlist.includes(gameId)
      ? watchlist.filter(id => id !== gameId)
      : [...watchlist, gameId];
    setWatchlist(next);
    saveStoredWatchlist(next);
  };

  const handleToggleLike = (gameId: string) => {
    const next = likedGames.includes(gameId)
      ? likedGames.filter(id => id !== gameId)
      : [...likedGames, gameId];
    setLikedGames(next);
    saveStoredLikedGames(next);
  };

  // Custom Lists
  const handleCreateList = (listData: Omit<CustomList, 'id' | 'createdAt' | 'updatedAt' | 'likesCount'>) => {
    const newList: CustomList = {
      ...listData,
      id: `list-${Date.now()}`,
      likesCount: 0,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0]
    };
    const nextLists = [newList, ...lists];
    setLists(nextLists);
    saveStoredLists(nextLists);

    // Also push to social feed
    const listActivity: FriendActivity = {
      id: `act-${Date.now()}`,
      userId: profile.id,
      userName: profile.displayName,
      userAvatar: (profile as any).avatarUrl || (profile as any).avatar,
      userHandle: profile.handle,
      action: 'created_list',
      gameId: listData.gameIds[0] || 'elden-ring',
      gameTitle: listData.title,
      gameCoverUrl: games.find(g => g.id === listData.gameIds[0])?.coverUrl || '',
      releaseYear: 2025,
      listTitle: listData.title,
      listGameIds: listData.gameIds,
      timestamp: 'Just now',
      likesCount: 0,
      hasUserLiked: false,
      comments: []
    };
    const nextActs = [listActivity, ...activities];
    setActivities(nextActs);
    saveStoredActivities(nextActs);
  };

  const handleDeleteList = (listId: string) => {
    if (window.confirm('Delete this list?')) {
      const next = lists.filter(l => l.id !== listId);
      setLists(next);
      saveStoredLists(next);
    }
  };

  const handleLikeList = (listId: string) => {
    const next = lists.map(l => l.id === listId ? { ...l, likesCount: l.likesCount + 1 } : l);
    setLists(next);
    saveStoredLists(next);
  };

  const handleAddGameToList = (listId: string, gameId: string) => {
    const nextLists = lists.map(l => {
      if (l.id === listId && !l.gameIds.includes(gameId)) {
        return {
          ...l,
          gameIds: [...l.gameIds, gameId],
          updatedAt: new Date().toISOString().split('T')[0]
        };
      }
      return l;
    });
    setLists(nextLists);
    saveStoredLists(nextLists);
  };

  // Themed Collections Handlers
  const handleCreateCollection = (collectionData: Omit<GameCollection, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newCol: GameCollection = {
      ...collectionData,
      id: `col-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    const nextCols = [newCol, ...collections];
    setCollections(nextCols);
    saveStoredCollections(nextCols);
  };

  const handleUpdateCollection = (updated: GameCollection) => {
    const nextCols = collections.map(c => c.id === updated.id ? updated : c);
    setCollections(nextCols);
    saveStoredCollections(nextCols);
  };

  const handleDeleteCollection = (collectionId: string) => {
    const nextCols = collections.filter(c => c.id !== collectionId);
    setCollections(nextCols);
    saveStoredCollections(nextCols);
  };

  const handleToggleGameInCollection = (collectionId: string, gameId: string) => {
    const nextCols = collections.map(col => {
      if (col.id !== collectionId) return col;
      const alreadyIncluded = col.gameIds.includes(gameId);
      return {
        ...col,
        gameIds: alreadyIncluded 
          ? col.gameIds.filter(id => id !== gameId) 
          : [...col.gameIds, gameId],
        updatedAt: new Date().toISOString()
      };
    });
    setCollections(nextCols);
    saveStoredCollections(nextCols);
  };

  // Social Feed Handlers
  const handleToggleFollow = (handle: string) => {
    const isFollowing = profile.following.includes(handle);
    const nextFollowing = isFollowing
      ? profile.following.filter(h => h !== handle)
      : [...profile.following, handle];

    const nextProfile = { ...profile, following: nextFollowing };
    setProfile(nextProfile);
    saveStoredProfile(nextProfile);
  };

  const handleLikeActivity = (activityId: string) => {
    const next = activities.map(act => {
      if (act.id === activityId) {
        const hasLiked = act.hasUserLiked;
        return {
          ...act,
          hasUserLiked: !hasLiked,
          likesCount: hasLiked ? Math.max(0, act.likesCount - 1) : act.likesCount + 1
        };
      }
      return act;
    });
    setActivities(next);
    saveStoredActivities(next);
  };

  const handleAddComment = (activityId: string, text: string) => {
    const next = activities.map(act => {
      if (act.id === activityId) {
        return {
          ...act,
          comments: [
            ...act.comments,
            {
              id: `comment-${Date.now()}`,
              userId: profile.id,
              userName: profile.displayName,
              userAvatar: (profile as any).avatarUrl || (profile as any).avatar,
              text,
              timestamp: 'Just now'
            }
          ]
        };
      }
      return act;
    });
    setActivities(next);
    saveStoredActivities(next);
  };

  // Favorite Four update
  const handleUpdateFavoriteFour = (slotIndex: number, gameId: string) => {
    const favIds = [...(profile.favoriteGameIds || (profile as any).favoriteGames || [])];
    favIds[slotIndex] = gameId;
    const nextProfile = { ...profile, favoriteGameIds: favIds, favoriteGames: favIds };
    setProfile(nextProfile as any);
    saveStoredProfile(nextProfile as any);
  };

  // Add new game discovered via AI search or online catalogue
  const handleAddNewGame = (newGame: Game) => {
    if (!games.some(g => g.id === newGame.id || g.title.toLowerCase() === newGame.title.toLowerCase())) {
      const nextGames = [newGame, ...games];
      setGames(nextGames);
      saveStoredGames(nextGames);
    }
  };

  return (
    <div className="min-h-screen bg-[#14181c] text-[#e0e6ed] flex flex-col font-sans selection:bg-[#00e054] selection:text-black">
      {/* Main Header */}
      <Header
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenSearch={() => setIsSearchModalOpen(true)}
        onOpenLogModal={() => {
          setSelectedGameForLog(games[0] || null);
          setEditingEntry(null);
        }}
        onOpenMilestoneModal={() => {
          setShareData({
            isOpen: true,
            game: null,
            entry: null,
            milestone: milestones[0] || null
          });
        }}
        currentUser={profile}
        totalGamesLogged={journal.length}
        collectionsCount={collections.length}
      />

      {/* Primary Application Content Router */}
      <main className="flex-1 pb-20 md:pb-8">
        {activeTab === 'games' && (
          <GamesExploreView
            games={games}
            journal={journal}
            watchlist={watchlist}
            likedGames={likedGames}
            onSelectGame={setSelectedGameForDetail}
            onQuickLog={(game) => {
              setSelectedGameForLog(game);
              setEditingEntry(null);
            }}
            onToggleWatchlist={handleToggleWatchlist}
            onToggleLike={handleToggleLike}
            onFetchOnlineGames={fetchOnlineGames}
            isFetchingOnline={isFetchingOnline}
          />
        )}

        {activeTab === 'diary' && (
          <DiaryView
            entries={journal}
            games={games}
            onSelectGame={setSelectedGameForDetail}
            onEditEntry={(entry) => {
              const game = games.find(g => g.id === entry.gameId);
              setSelectedGameForLog(game || null);
              setEditingEntry(entry);
            }}
            onDeleteEntry={handleDeleteJournalEntry}
            onShareEntry={(game, entry) => {
              setShareData({
                isOpen: true,
                game,
                entry,
                milestone: null
              });
            }}
            onOpenLogModal={() => {
              setSelectedGameForLog(games[0] || null);
              setEditingEntry(null);
            }}
          />
        )}

        {activeTab === 'collections' && (
          <CollectionsView
            collections={collections}
            allGames={games}
            onSelectGame={setSelectedGameForDetail}
            onQuickLog={(game) => {
              setSelectedGameForLog(game);
              setEditingEntry(null);
            }}
            onCreateCollection={handleCreateCollection}
            onUpdateCollection={handleUpdateCollection}
            onDeleteCollection={handleDeleteCollection}
            onOpenShareCollection={(col) => {
              const firstGame = games.find(g => col.gameIds.includes(g.id)) || games[0];
              setShareData({
                isOpen: true,
                game: firstGame || null,
                entry: null,
                milestone: null
              });
            }}
          />
        )}

        {activeTab === 'lists' && (
          <ListsView
            lists={lists}
            allGames={games}
            onSelectGame={setSelectedGameForDetail}
            onCreateList={handleCreateList}
            onDeleteList={handleDeleteList}
            onLikeList={handleLikeList}
          />
        )}

        {activeTab === 'activity' && (
          <SocialFeedView
            activities={activities}
            allGames={games}
            currentUser={profile}
            onSelectGame={setSelectedGameForDetail}
            onToggleFollow={handleToggleFollow}
            onLikeActivity={handleLikeActivity}
            onAddComment={handleAddComment}
            onViewMemberProfile={() => setActiveTab('profile')}
          />
        )}

        {activeTab === 'stats' && (
          <StatsView
            journal={journal}
            allGames={games}
            milestones={milestones}
            onSelectGame={setSelectedGameForDetail}
            onOpenShareMilestone={(m) => {
              setShareData({
                isOpen: true,
                game: null,
                entry: null,
                milestone: m || milestones[0]
              });
            }}
          />
        )}

        {activeTab === 'profile' && (
          <ProfileView
            profile={profile}
            allGames={games}
            journal={journal}
            lists={lists}
            collections={collections}
            watchlist={watchlist}
            likedGames={likedGames}
            onSelectGame={setSelectedGameForDetail}
            onSelectCollection={() => setActiveTab('collections')}
            onUpdateFavoriteFour={handleUpdateFavoriteFour}
            onShareProfile={() => {
              setShareData({
                isOpen: true,
                game: null,
                entry: null,
                milestone: null
              });
            }}
            onQuickLog={(game) => {
              setSelectedGameForLog(game);
              setEditingEntry(null);
            }}
          />
        )}
      </main>

      {/* Mobile-First Sticky Bottom Navigation */}
      <MobileBottomNav
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenLogModal={() => {
          setSelectedGameForLog(games[0] || null);
          setEditingEntry(null);
        }}
        onOpenSearch={() => setIsSearchModalOpen(true)}
        totalGamesLogged={journal.length}
        currentUser={profile}
      />

      {/* Modals */}
      {/* 1. Game Detail Modal */}
      {selectedGameForDetail && (
        <GameDetailModal
          game={selectedGameForDetail}
          onClose={() => setSelectedGameForDetail(null)}
          onOpenLogModal={(game) => {
            setSelectedGameForLog(game);
            setEditingEntry(null);
            setSelectedGameForDetail(null);
          }}
          onToggleWatchlist={handleToggleWatchlist}
          onToggleLike={handleToggleLike}
          isPlayed={journal.some(e => e.gameId === selectedGameForDetail.id)}
          isLiked={likedGames.includes(selectedGameForDetail.id)}
          isWatchlisted={watchlist.includes(selectedGameForDetail.id)}
          userRating={journal.find(e => e.gameId === selectedGameForDetail.id)?.rating}
          userEntry={journal.find(e => e.gameId === selectedGameForDetail.id)}
          userLists={lists}
          userCollections={collections}
          onAddToList={handleAddGameToList}
          onToggleGameInCollection={handleToggleGameInCollection}
          onOpenShareModal={(game, entry) => {
            setShareData({
              isOpen: true,
              game,
              entry: entry || null,
              milestone: null
            });
          }}
          friendActivities={activities}
          allGames={games}
          onSelectGame={(g) => setSelectedGameForDetail(g)}
        />
      )}

      {/* 2. Log & Review Modal */}
      {selectedGameForLog && (
        <LogModal
          game={selectedGameForLog}
          initialGame={selectedGameForLog}
          isOpen={true}
          onClose={() => {
            setSelectedGameForLog(null);
            setEditingEntry(null);
          }}
          onSaveLog={handleSaveJournalEntry}
          onSave={handleSaveJournalEntry}
          existingEntry={editingEntry}
          allGames={games}
          onSelectGameForLog={(g) => setSelectedGameForLog(g)}
        />
      )}

      {/* 3. Global Search & Live API Discovery Modal */}
      <SearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        allGames={games}
        onSelectGame={setSelectedGameForDetail}
        onQuickLog={(game) => {
          setSelectedGameForLog(game);
          setEditingEntry(null);
        }}
        onAddNewGameToDatabase={handleAddNewGame}
      />

      {/* Social Share & Milestone Card Generator */}
      <ShareMilestoneModal
        isOpen={shareData.isOpen}
        onClose={() => setShareData({ isOpen: false, game: null, entry: null, milestone: null })}
        game={shareData.game}
        entry={shareData.entry}
        milestone={shareData.milestone}
        userProfile={profile}
        favoriteGames={(games || []).filter(g => (profile?.favoriteGameIds || (profile as any)?.favoriteGames || []).includes(g.id))}
      />
    </div>
  );
}

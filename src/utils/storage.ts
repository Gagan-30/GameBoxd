import { Game, JournalEntry, CustomList, UserProfile, FriendActivity, Milestone, GameCollection } from '../types';
import { INITIAL_GAMES, INITIAL_FRIENDS_ACTIVITY, INITIAL_USER_LISTS, INITIAL_USER_PROFILE, INITIAL_USER_JOURNAL, INITIAL_MILESTONES, INITIAL_COLLECTIONS } from '../data/initialGames';
import { ADDITIONAL_GAMES } from '../data/moreGames';

const STORAGE_KEYS = {
  VERSION_FLAG: 'gameboxd_cleaned_initial_games_v5',
  GAMES: 'gameboxd_games_v5',
  JOURNAL: 'gameboxd_journal_v2',
  LISTS: 'gameboxd_lists_v2',
  COLLECTIONS: 'gameboxd_collections_v2',
  PROFILE: 'gameboxd_profile_v2',
  ACTIVITY: 'gameboxd_activity_v2',
  MILESTONES: 'gameboxd_milestones_v2',
  WATCHLIST: 'gameboxd_watchlist_v2',
  LIKED_GAMES: 'gameboxd_liked_games_v2',
  BACKUP_HISTORY: 'gameboxd_backup_history_v2',
};

// Check and perform one-time migration to clear all initial games from previous sessions
function ensureCleanInitialStorage() {
  try {
    const isCleaned = localStorage.getItem(STORAGE_KEYS.VERSION_FLAG);
    if (!isCleaned) {
      // Migrate or initialize games with updated official descriptions and HLTB times
      localStorage.setItem(STORAGE_KEYS.GAMES, JSON.stringify(ALL_DEFAULT_GAMES));
      localStorage.setItem(STORAGE_KEYS.VERSION_FLAG, 'true');
    }
  } catch (e) {
    console.warn('Local storage check warning:', e);
  }
}

// Run immediately
ensureCleanInitialStorage();

// Combine all default games
export const ALL_DEFAULT_GAMES: Game[] = [...INITIAL_GAMES, ...ADDITIONAL_GAMES];

export function getStoredGames(): Game[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.GAMES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.GAMES, JSON.stringify(ALL_DEFAULT_GAMES));
      return ALL_DEFAULT_GAMES;
    }
    const parsed: Game[] = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      // Merge official metadata (HLTB, official description) for default games while preserving any custom added games
      const defaultMap = new Map(ALL_DEFAULT_GAMES.map(g => [g.id, g]));
      const merged = parsed.map(game => {
        const official = defaultMap.get(game.id);
        if (official) {
          return {
            ...game,
            officialDescription: official.officialDescription || game.officialDescription,
            hltb: official.hltb || game.hltb,
            synopsis: official.synopsis || game.synopsis,
            averageRating: official.averageRating || game.averageRating,
            trailerYoutubeId: official.trailerYoutubeId || game.trailerYoutubeId
          };
        }
        return game;
      });

      // Also ensure any default games not present are included
      ALL_DEFAULT_GAMES.forEach(dg => {
        if (!merged.some(g => g.id === dg.id)) {
          merged.push(dg);
        }
      });

      return merged;
    }
    return ALL_DEFAULT_GAMES;
  } catch (e) {
    return ALL_DEFAULT_GAMES;
  }
}

export function saveStoredGames(games: Game[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.GAMES, JSON.stringify(games || []));
  } catch (e) {
    console.error('Failed to save games:', e);
  }
}

export function getStoredJournal(): JournalEntry[] {
  try {
    ensureCleanInitialStorage();
    const raw = localStorage.getItem(STORAGE_KEYS.JOURNAL);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.JOURNAL, JSON.stringify([]));
      return [];
    }
    const parsed: JournalEntry[] = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
}

export function saveStoredJournal(journal: JournalEntry[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.JOURNAL, JSON.stringify(journal || []));
  } catch (e) {
    console.error('Failed to save journal:', e);
  }
}

export function getStoredLists(): CustomList[] {
  try {
    ensureCleanInitialStorage();
    const raw = localStorage.getItem(STORAGE_KEYS.LISTS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.LISTS, JSON.stringify([]));
      return [];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
}

export function saveStoredLists(lists: CustomList[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.LISTS, JSON.stringify(lists || []));
  } catch (e) {
    console.error('Failed to save lists:', e);
  }
}

export function getStoredCollections(): GameCollection[] {
  try {
    ensureCleanInitialStorage();
    const raw = localStorage.getItem(STORAGE_KEYS.COLLECTIONS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.COLLECTIONS, JSON.stringify(INITIAL_COLLECTIONS));
      return INITIAL_COLLECTIONS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    localStorage.setItem(STORAGE_KEYS.COLLECTIONS, JSON.stringify(INITIAL_COLLECTIONS));
    return INITIAL_COLLECTIONS;
  } catch (e) {
    return INITIAL_COLLECTIONS;
  }
}

export function saveStoredCollections(collections: GameCollection[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.COLLECTIONS, JSON.stringify(collections || []));
  } catch (e) {
    console.error('Failed to save collections:', e);
  }
}

export function getStoredProfile(): UserProfile {
  try {
    ensureCleanInitialStorage();
    const raw = localStorage.getItem(STORAGE_KEYS.PROFILE);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(INITIAL_USER_PROFILE));
      return INITIAL_USER_PROFILE;
    }
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') {
      return INITIAL_USER_PROFILE;
    }
    return {
      ...INITIAL_USER_PROFILE,
      ...parsed,
      favoriteGameIds: Array.isArray(parsed.favoriteGameIds) ? parsed.favoriteGameIds : []
    };
  } catch (e) {
    return INITIAL_USER_PROFILE;
  }
}

export function saveStoredProfile(profile: UserProfile) {
  try {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
  } catch (e) {
    console.error('Failed to save profile:', e);
  }
}

export function getStoredActivities(): FriendActivity[] {
  try {
    ensureCleanInitialStorage();
    const raw = localStorage.getItem(STORAGE_KEYS.ACTIVITY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.ACTIVITY, JSON.stringify([]));
      return [];
    }
    const parsed: FriendActivity[] = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
}

export function saveStoredActivities(activities: FriendActivity[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.ACTIVITY, JSON.stringify(activities || []));
  } catch (e) {
    console.error('Failed to save activities:', e);
  }
}

export function getStoredWatchlist(): string[] {
  try {
    ensureCleanInitialStorage();
    const raw = localStorage.getItem(STORAGE_KEYS.WATCHLIST);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.WATCHLIST, JSON.stringify([]));
      return [];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
}

export function saveStoredWatchlist(ids: string[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.WATCHLIST, JSON.stringify(ids || []));
  } catch (e) {
    console.error('Failed to save watchlist:', e);
  }
}

export function getStoredLikedGames(): string[] {
  try {
    ensureCleanInitialStorage();
    const raw = localStorage.getItem(STORAGE_KEYS.LIKED_GAMES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.LIKED_GAMES, JSON.stringify([]));
      return [];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
}

export function saveStoredLikedGames(ids: string[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.LIKED_GAMES, JSON.stringify(ids || []));
  } catch (e) {
    console.error('Failed to save liked games:', e);
  }
}

export function getStoredMilestones(): Milestone[] {
  try {
    ensureCleanInitialStorage();
    const raw = localStorage.getItem(STORAGE_KEYS.MILESTONES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.MILESTONES, JSON.stringify(INITIAL_MILESTONES));
      return INITIAL_MILESTONES;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : INITIAL_MILESTONES;
  } catch (e) {
    return INITIAL_MILESTONES;
  }
}

export function saveStoredMilestones(milestones: Milestone[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.MILESTONES, JSON.stringify(milestones || []));
  } catch (e) {
    console.error('Failed to save milestones:', e);
  }
}

// Completely clear all stored data
export function clearAllLocalData() {
  localStorage.setItem(STORAGE_KEYS.GAMES, JSON.stringify([]));
  localStorage.setItem(STORAGE_KEYS.JOURNAL, JSON.stringify([]));
  localStorage.setItem(STORAGE_KEYS.LISTS, JSON.stringify([]));
  localStorage.setItem(STORAGE_KEYS.WATCHLIST, JSON.stringify([]));
  localStorage.setItem(STORAGE_KEYS.LIKED_GAMES, JSON.stringify([]));
  localStorage.setItem(STORAGE_KEYS.ACTIVITY, JSON.stringify([]));
  localStorage.setItem(STORAGE_KEYS.MILESTONES, JSON.stringify(INITIAL_MILESTONES));
  localStorage.setItem(STORAGE_KEYS.VERSION_FLAG, 'true');
}

// Generate Full Backup Bundle
export function generateBackupBundle() {
  return {
    version: '2.0.0',
    exportDate: new Date().toISOString(),
    games: getStoredGames(),
    journal: getStoredJournal(),
    lists: getStoredLists(),
    profile: getStoredProfile(),
    watchlist: getStoredWatchlist(),
    likedGames: getStoredLikedGames(),
    milestones: getStoredMilestones()
  };
}

// Restore Full Backup Bundle
export function restoreBackupBundle(bundle: any): boolean {
  try {
    if (!bundle || typeof bundle !== 'object') return false;
    if (bundle.games && Array.isArray(bundle.games)) saveStoredGames(bundle.games);
    if (bundle.journal && Array.isArray(bundle.journal)) saveStoredJournal(bundle.journal);
    if (bundle.lists && Array.isArray(bundle.lists)) saveStoredLists(bundle.lists);
    if (bundle.profile) saveStoredProfile(bundle.profile);
    if (bundle.watchlist && Array.isArray(bundle.watchlist)) saveStoredWatchlist(bundle.watchlist);
    if (bundle.likedGames && Array.isArray(bundle.likedGames)) saveStoredLikedGames(bundle.likedGames);
    if (bundle.milestones && Array.isArray(bundle.milestones)) saveStoredMilestones(bundle.milestones);
    return true;
  } catch (err) {
    console.error('Restore error:', err);
    return false;
  }
}

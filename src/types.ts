export interface GameCompletionTimes {
  mainStory: number;      // Hours for main story (from howlongtobeat.com)
  mainExtra: number;      // Hours for main + extra/sides (from howlongtobeat.com)
  completionist: number;  // Hours for completionist/100% (from howlongtobeat.com)
  allStyles?: number;     // Hours average across all play styles
}

export interface Game {
  id: string;
  title: string;
  slug: string;
  coverUrl: string;
  backdropUrl: string;
  releaseDate: string;
  releaseYear: number;
  developer: string;
  publisher: string;
  genres: string[];
  platforms: string[];
  synopsis: string;
  officialDescription?: string; // Full official game description
  averageRating: number; // Placeholder rating value (e.g. 4.8)
  totalRatings: number;
  metacritic?: number;
  playtimeHours?: number;
  hltb?: GameCompletionTimes;   // Completion length times from howlongtobeat.com
  featuredTag?: string;
  trailerYoutubeId?: string; // YouTube video ID for official trailer
}

export interface JournalEntry {
  id: string;
  gameId: string;
  gameTitle: string;
  gameCoverUrl: string;
  releaseYear: number;
  rating: number; // 0.5 to 5.0 in 0.5 increments
  isLiked: boolean;
  isReplay: boolean;
  datePlayed: string; // YYYY-MM-DD
  reviewText?: string;
  platform?: string;
  tags: string[];
  containsSpoilers?: boolean;
  hoursPlayed?: number;
  createdAt: string;
}

export interface GameCollection {
  id: string;
  name: string;              // e.g. "Finished", "Backlog", "All-Time Favorites"
  description: string;       // Custom themed description
  coverArtUrl: string;       // Unique cover art image URL
  themeColor?: string;       // Hex or color identifier, e.g. '#00e054', '#40bcf4', '#ff8000', '#a855f7'
  icon?: string;             // Lucide icon identifier
  gameIds: string[];         // List of game IDs included in this collection
  isDefault?: boolean;       // Built-in preset
  createdAt: string;
  updatedAt: string;
}

export interface CustomList {
  id: string;
  title: string;
  description: string;
  isRanked: boolean;
  isPublic: boolean;
  gameIds: string[];
  notes?: Record<string, string>; // gameId -> personal list note
  likesCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface UserAccount {
  id: string;
  username: string;
  email: string;
  displayName: string;
  avatarUrl: string;
  bio?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface UserProfile {
  id: string;
  username: string;
  handle: string;
  displayName: string;
  email?: string;
  avatarUrl: string;
  bio: string;
  headerUrl: string;
  location?: string;
  website?: string;
  favoriteGameIds: string[]; // Exactly Letterboxd's signature "Favorite Four"
  following: string[]; // list of user handles
  followers: string[];
  joinedDate: string;
}

export interface ActivityComment {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  text: string;
  timestamp: string;
}

export interface FriendActivity {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  userHandle: string;
  action: 'logged' | 'reviewed' | 'liked' | 'created_list';
  gameId: string;
  gameTitle: string;
  gameCoverUrl: string;
  releaseYear: number;
  rating?: number;
  isLiked?: boolean;
  reviewText?: string;
  isReplay?: boolean;
  listTitle?: string;
  listGameIds?: string[];
  timestamp: string;
  likesCount: number;
  hasUserLiked?: boolean;
  comments: ActivityComment[];
}

export interface CloudBackupRecord {
  id: string;
  timestamp: string;
  gamesLoggedCount: number;
  reviewsCount: number;
  listsCount: number;
  checksum: string;
  sizeKb: number;
}

export interface Milestone {
  id: string;
  title: string;
  subtitle: string;
  type: 'count' | 'streak' | 'genre' | 'rating' | 'online_library';
  icon: string;
  achievedAt: string;
  targetCount: number;
  currentCount: number;
  isUnlocked: boolean;
}

export type AppTab = 'games' | 'diary' | 'collections' | 'lists' | 'activity' | 'stats' | 'profile';

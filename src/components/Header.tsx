import React, { useState } from 'react';
import { Search, Plus, Trophy, Share2, User, Sparkles, Folder, Calendar, BarChart3, ListOrdered } from 'lucide-react';
import { UserProfile, AppTab } from '../types';

interface HeaderProps {
  activeTab?: AppTab | 'journal' | 'members';
  currentTab?: AppTab | 'journal' | 'members';
  onSelectTab: (tab: AppTab) => void;
  onOpenLogModal: () => void;
  onOpenSearch?: () => void;
  onOpenSearchModal?: () => void;
  onOpenMilestoneModal?: () => void;
  currentUser?: UserProfile;
  userProfile?: UserProfile;
  totalGamesLogged?: number;
  collectionsCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  currentTab,
  onSelectTab,
  onOpenLogModal,
  onOpenSearch,
  onOpenSearchModal,
  onOpenMilestoneModal,
  currentUser,
  userProfile,
  totalGamesLogged = 0,
  collectionsCount = 0
}) => {
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  // Normalize current tab
  const tab: AppTab = (activeTab || currentTab || 'games') === 'journal' 
    ? 'diary' 
    : (activeTab || currentTab || 'games') === 'members' 
      ? 'activity' 
      : ((activeTab || currentTab || 'games') as AppTab);

  // Normalizing modal open handlers
  const handleOpenSearch = onOpenSearch || onOpenSearchModal || (() => {});

  // Safely fallback user profile
  const profile = currentUser || userProfile || {
    id: 'me',
    username: 'alex_mercer',
    handle: 'alex_mercer',
    displayName: 'Alex Mercer',
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
    bio: 'Avid gamer, backlog conqueror.',
    headerUrl: '',
    favoriteGameIds: [],
    following: [],
    followers: [],
    joinedDate: 'Joined Recently'
  };

  const avatarSrc = (profile as any)?.avatarUrl || (profile as any)?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80';
  const displayName = profile?.displayName || 'Alex Mercer';
  const handle = profile?.handle || 'alex_mercer';

  return (
    <header className="sticky top-0 z-40 bg-[#14181c]/95 backdrop-blur-md border-b border-[#2c3440] transition-colors" id="main-letterboxd-header">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-3">
        {/* Left: Letterboxd Iconic 3-Circle Logo & Brand */}
        <div className="flex items-center gap-6">
          <button
            type="button"
            onClick={() => onSelectTab('games')}
            className="flex items-center gap-2 group text-left cursor-pointer focus:outline-none"
            id="letterboxd-brand-logo"
          >
            {/* The signature 3 overlapping circles */}
            <div className="flex items-center -space-x-1.5 transition-transform group-hover:scale-105">
              <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-[#ff8000] ring-1 ring-[#14181c] shadow" />
              <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-[#00e054] ring-1 ring-[#14181c] shadow z-10" />
              <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-[#40bcf4] ring-1 ring-[#14181c] shadow" />
            </div>

            <div className="flex flex-col">
              <span className="font-extrabold text-base sm:text-lg tracking-wider text-white uppercase font-['Space_Grotesk'] leading-none">
                GAMEBOXD
              </span>
              <span className="text-[9px] text-[#9ab] tracking-widest uppercase hidden sm:block font-mono">
                The Letterboxd for Games
              </span>
            </div>
          </button>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 font-bold text-xs uppercase tracking-wider text-[#9ab]">
            <button
              type="button"
              id="nav-tab-games"
              onClick={() => onSelectTab('games')}
              className={`px-3 py-1.5 rounded transition-colors ${
                tab === 'games' ? 'text-white bg-[#202830]' : 'hover:text-white hover:bg-[#1b2228]'
              }`}
            >
              Games
            </button>
            <button
              type="button"
              id="nav-tab-diary"
              onClick={() => onSelectTab('diary')}
              className={`px-3 py-1.5 rounded transition-colors flex items-center gap-1.5 ${
                tab === 'diary' ? 'text-white bg-[#202830]' : 'hover:text-white hover:bg-[#1b2228]'
              }`}
            >
              <span>Diary</span>
              {totalGamesLogged > 0 && (
                <span className="bg-[#2c3440] text-[#00e054] text-[10px] font-mono px-1.5 py-0.5 leading-none rounded-full">
                  {totalGamesLogged}
                </span>
              )}
            </button>
            <button
              type="button"
              id="nav-tab-collections"
              onClick={() => onSelectTab('collections')}
              className={`px-3 py-1.5 rounded transition-colors flex items-center gap-1.5 ${
                tab === 'collections' ? 'text-white bg-[#202830]' : 'hover:text-white hover:bg-[#1b2228]'
              }`}
            >
              <span>Collections</span>
              {collectionsCount > 0 && (
                <span className="bg-[#2c3440] text-[#00e054] text-[10px] font-mono px-1.5 py-0.5 leading-none rounded-full">
                  {collectionsCount}
                </span>
              )}
            </button>
            <button
              type="button"
              id="nav-tab-lists"
              onClick={() => onSelectTab('lists')}
              className={`px-3 py-1.5 rounded transition-colors ${
                tab === 'lists' ? 'text-white bg-[#202830]' : 'hover:text-white hover:bg-[#1b2228]'
              }`}
            >
              Lists
            </button>
            <button
              type="button"
              id="nav-tab-activity"
              onClick={() => onSelectTab('activity')}
              className={`px-3 py-1.5 rounded transition-colors ${
                tab === 'activity' ? 'text-white bg-[#202830]' : 'hover:text-white hover:bg-[#1b2228]'
              }`}
            >
              Activity
            </button>
            <button
              type="button"
              id="nav-tab-stats"
              onClick={() => onSelectTab('stats')}
              className={`px-3 py-1.5 rounded transition-colors ${
                tab === 'stats' ? 'text-white bg-[#202830]' : 'hover:text-white hover:bg-[#1b2228]'
              }`}
            >
              Stats
            </button>
          </nav>
        </div>

        {/* Right: Search, + LOG, Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Search Bar / Button */}
          <button
            type="button"
            id="header-search-trigger"
            onClick={handleOpenSearch}
            className="flex items-center gap-2 bg-[#202830] hover:bg-[#2c3440] text-[#9ab] hover:text-white px-2.5 sm:px-3 py-1.5 rounded-full border border-[#2c3440] text-xs transition-colors cursor-pointer"
            title="Search games (Ctrl/Cmd+K)"
          >
            <Search className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">Search games, lists...</span>
            <kbd className="hidden lg:inline bg-[#14181c] text-[#678] text-[10px] px-1 rounded border border-[#2c3440]">
              ⌘K
            </kbd>
          </button>

          {/* Letterboxd Iconic "+ LOG" Green Button */}
          <button
            type="button"
            id="header-log-game-button"
            onClick={onOpenLogModal}
            className="bg-[#00e054] hover:bg-[#00e054]/90 text-[#14181c] font-black uppercase text-xs sm:text-sm tracking-wider px-3 sm:px-4 py-1.5 rounded-full flex items-center gap-1 shadow-[0_0_12px_rgba(0,224,84,0.3)] hover:scale-105 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Log</span>
          </button>

          {/* Profile Dropdown */}
          <div className="relative">
            <button
              type="button"
              id="header-profile-avatar"
              onClick={() => setProfileMenuOpen(!profileMenuOpen)}
              className="w-8 h-8 rounded-full overflow-hidden border border-[#2c3440] hover:border-[#00e054] transition-colors focus:outline-none ring-offset-2 ring-offset-[#14181c] focus:ring-1 focus:ring-[#00e054]"
              title="Profile & Quick Links"
            >
              <img
                src={avatarSrc}
                alt={displayName}
                className="w-full h-full object-cover"
              />
            </button>

            {/* Dropdown Menu */}
            {profileMenuOpen && (
              <div 
                className="absolute right-0 mt-2 w-64 bg-[#1b2228] border border-[#2c3440] rounded-xl shadow-2xl py-2 z-50 text-xs font-mono animate-in fade-in zoom-in-95 duration-100"
                id="header-profile-dropdown"
              >
                {/* User Identity Header */}
                <div 
                  onClick={() => {
                    onSelectTab('profile');
                    setProfileMenuOpen(false);
                  }}
                  className="px-3 py-2 border-b border-[#2c3440] flex items-center gap-2.5 cursor-pointer hover:bg-[#202830] transition-colors"
                >
                  <img
                    src={avatarSrc}
                    alt={displayName}
                    className="w-9 h-9 rounded-full object-cover border border-[#00e054]"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-white truncate text-xs">{displayName}</div>
                    <div className="text-[11px] text-[#00e054] truncate">@{handle}</div>
                  </div>
                </div>

                <div className="py-1">
                  <button
                    type="button"
                    onClick={() => {
                      onSelectTab('profile');
                      setProfileMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-[#e0e6ed] hover:bg-[#2c3440] hover:text-[#00e054] font-medium flex items-center justify-between transition-colors"
                  >
                    <span>Profile & Favorite Four</span>
                    <span className="text-[10px] text-[#00e054] font-mono">Top 4</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onSelectTab('diary');
                      setProfileMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-[#e0e6ed] hover:bg-[#2c3440] hover:text-[#00e054] flex items-center gap-2 transition-colors"
                  >
                    <Calendar className="w-3.5 h-3.5 text-[#9ab]" />
                    <span>My Game Diary & Reviews</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onSelectTab('collections');
                      setProfileMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-[#e0e6ed] hover:bg-[#2c3440] hover:text-[#00e054] flex items-center gap-2 transition-colors"
                  >
                    <Folder className="w-3.5 h-3.5 text-[#9ab]" />
                    <span>My Collections</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onSelectTab('lists');
                      setProfileMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-[#e0e6ed] hover:bg-[#2c3440] hover:text-[#00e054] flex items-center gap-2 transition-colors"
                  >
                    <ListOrdered className="w-3.5 h-3.5 text-[#9ab]" />
                    <span>My Custom Lists</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onSelectTab('stats');
                      setProfileMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-[#e0e6ed] hover:bg-[#2c3440] hover:text-[#00e054] flex items-center gap-2 transition-colors"
                  >
                    <BarChart3 className="w-3.5 h-3.5 text-[#9ab]" />
                    <span>My Gaming Stats & Rating Curve</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (onOpenMilestoneModal) {
                        onOpenMilestoneModal();
                      } else {
                        onSelectTab('stats');
                      }
                      setProfileMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-[#e0e6ed] hover:bg-[#2c3440] hover:text-[#ff8000] flex items-center justify-between transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <Share2 className="w-3.5 h-3.5 text-[#ff8000]" />
                      <span>Milestones & Share Cards</span>
                    </span>
                    <Sparkles className="w-3 h-3 text-[#ff8000]" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

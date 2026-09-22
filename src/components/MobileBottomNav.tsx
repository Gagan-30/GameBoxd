import React from 'react';
import { Gamepad2, Search, Plus, Calendar, BarChart3, Users, User, Layers } from 'lucide-react';
import { AppTab, UserProfile } from '../types';

interface MobileBottomNavProps {
  activeTab?: AppTab | 'journal' | 'members';
  currentTab?: AppTab | 'journal' | 'members';
  onSelectTab: (tab: AppTab) => void;
  onOpenLogModal: () => void;
  onOpenSearch?: () => void;
  onOpenSearchModal?: () => void;
  totalGamesLogged?: number;
  currentUser?: UserProfile;
  userProfile?: UserProfile;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  currentTab,
  onSelectTab,
  onOpenLogModal,
  onOpenSearch,
  onOpenSearchModal,
  totalGamesLogged = 0,
  currentUser,
  userProfile
}) => {
  const tab: AppTab = (activeTab || currentTab || 'games') === 'journal' 
    ? 'diary' 
    : (activeTab || currentTab || 'games') === 'members' 
      ? 'activity' 
      : ((activeTab || currentTab || 'games') as AppTab);

  const profile = currentUser || userProfile;
  const avatarSrc = (profile as any)?.avatarUrl || (profile as any)?.avatar;

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#14181c]/95 backdrop-blur-lg border-t border-[#2c3440] px-2 py-1 pb-safe" id="mobile-bottom-nav">
      <div className="flex items-center justify-around">
        {/* Games tab */}
        <button
          type="button"
          id="mobile-nav-games"
          onClick={() => onSelectTab('games')}
          className={`flex flex-col items-center gap-1 py-1 px-2 transition-colors ${
            tab === 'games' ? 'text-[#00e054]' : 'text-[#678] hover:text-[#9ab]'
          }`}
        >
          <Gamepad2 className="w-5 h-5" />
          <span className="text-[10px] font-semibold tracking-wider uppercase">Games</span>
        </button>

        {/* Collections tab */}
        <button
          type="button"
          id="mobile-nav-collections"
          onClick={() => onSelectTab('collections')}
          className={`flex flex-col items-center gap-1 py-1 px-2 transition-colors ${
            tab === 'collections' ? 'text-[#00e054]' : 'text-[#678] hover:text-[#9ab]'
          }`}
        >
          <Layers className="w-5 h-5" />
          <span className="text-[10px] font-semibold tracking-wider uppercase">Collections</span>
        </button>

        {/* Big Center Action Button: + LOG */}
        <button
          type="button"
          id="mobile-nav-log-btn"
          onClick={onOpenLogModal}
          className="relative -top-2 w-12 h-12 rounded-full bg-[#00e054] text-[#14181c] flex items-center justify-center shadow-[0_0_16px_rgba(0,224,84,0.4)] active:scale-95 transition-transform"
          aria-label="Log Game"
        >
          <Plus className="w-6 h-6 stroke-[3]" />
        </button>

        {/* Diary */}
        <button
          type="button"
          id="mobile-nav-diary"
          onClick={() => onSelectTab('diary')}
          className={`relative flex flex-col items-center gap-1 py-1 px-2 transition-colors ${
            tab === 'diary' ? 'text-[#00e054]' : 'text-[#678] hover:text-[#9ab]'
          }`}
        >
          <Calendar className="w-5 h-5" />
          <span className="text-[10px] font-semibold tracking-wider uppercase">Diary</span>
          {totalGamesLogged > 0 && (
            <span className="absolute top-0 right-1 w-2 h-2 rounded-full bg-[#00e054]" />
          )}
        </button>

        {/* Profile */}
        <button
          type="button"
          id="mobile-nav-profile"
          onClick={() => onSelectTab('profile')}
          className={`flex flex-col items-center gap-1 py-1 px-2 transition-colors ${
            tab === 'profile' ? 'text-[#00e054]' : 'text-[#678] hover:text-[#9ab]'
          }`}
        >
          {avatarSrc ? (
            <img
              src={avatarSrc}
              alt="Profile"
              className={`w-5 h-5 rounded-full object-cover border ${
                tab === 'profile' ? 'border-[#00e054]' : 'border-[#2c3440]'
              }`}
            />
          ) : (
            <User className="w-5 h-5" />
          )}
          <span className="text-[10px] font-semibold tracking-wider uppercase">Profile</span>
        </button>
      </div>
    </div>
  );
};



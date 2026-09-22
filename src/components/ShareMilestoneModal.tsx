import React, { useState, useRef } from 'react';
import { Game, JournalEntry, Milestone, UserProfile } from '../types';
import { StarRating } from './StarRating';
import { 
  X, Share2, Copy, Download, Check, Twitter, 
  Sparkles, Trophy, ExternalLink, Flame 
} from 'lucide-react';
import { useLockBodyScroll } from '../hooks/useLockBodyScroll';

interface ShareMilestoneModalProps {
  isOpen: boolean;
  onClose: () => void;
  game?: Game | null;
  entry?: JournalEntry | null;
  milestone?: Milestone | null;
  userProfile: UserProfile;
  favoriteGames?: Game[];
}

export const ShareMilestoneModal: React.FC<ShareMilestoneModalProps> = ({
  isOpen,
  onClose,
  game,
  entry,
  milestone,
  userProfile,
  favoriteGames = []
}) => {
  const [copiedText, setCopiedText] = useState(false);
  const [copiedImage, setCopiedImage] = useState(false);
  const [cardTheme, setCardTheme] = useState<'letterboxd-dark' | 'emerald' | 'amber'>('letterboxd-dark');
  const cardRef = useRef<HTMLDivElement>(null);

  useLockBodyScroll(isOpen);

  if (!isOpen) return null;

  const profile = userProfile || {
    displayName: 'Alex Mercer',
    handle: 'alex_mercer',
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80'
  };

  // Title & subtitle text for sharing
  const shareTitle = milestone 
    ? milestone.title 
    : game 
      ? `${game.title} (${game.releaseYear})`
      : `${profile.displayName}'s Gaming Highlights`;

  const shareText = milestone
    ? `🏆 Unlocked Milestone on Gameboxd: ${milestone.title}! ${milestone.subtitle}`
    : entry && game
      ? `🎮 Just logged ${game.title} (${entry.rating}★ on Gameboxd):\n"${entry.reviewText || 'Masterpiece.'}"`
      : `🎮 Check out my video game diary on Gameboxd!`;

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2000);
    } catch (e) {
      console.warn('Copy failed:', e);
    }
  };

  const handleShareTwitter = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank');
  };

  const handleShareReddit = () => {
    const url = `https://www.reddit.com/submit?title=${encodeURIComponent(shareTitle)}&text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank');
  };

  const handleDownloadCard = () => {
    // Generate simple high-resolution canvas snapshot of the card
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 630;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Background
    ctx.fillStyle = '#14181c';
    ctx.fillRect(0, 0, 1200, 630);

    // Subtle border
    ctx.strokeStyle = '#2c3440';
    ctx.lineWidth = 4;
    ctx.strokeRect(20, 20, 1160, 590);

    // 3 Letterboxd circles in top left
    ctx.fillStyle = '#ff8000';
    ctx.beginPath();
    ctx.arc(60, 65, 14, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#00e054';
    ctx.beginPath();
    ctx.arc(76, 65, 14, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#40bcf4';
    ctx.beginPath();
    ctx.arc(92, 65, 14, 0, Math.PI * 2);
    ctx.fill();

    // Gameboxd header text
    ctx.font = 'bold 22px monospace';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('GAMEBOXD · LETTERBOXD FOR GAMES', 120, 72);

    // Title
    ctx.font = 'bold 44px sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(shareTitle.slice(0, 35), 60, 170);

    // Rating / Subtitle
    if (entry) {
      ctx.font = '32px sans-serif';
      ctx.fillStyle = '#00e054';
      ctx.fillText(`${'★'.repeat(Math.round(entry.rating))} (${entry.rating} / 5.0)`, 60, 230);
    } else if (milestone) {
      ctx.font = '28px sans-serif';
      ctx.fillStyle = '#ff8000';
      ctx.fillText(milestone.subtitle, 60, 230);
    }

    // Review snippet
    if (entry?.reviewText) {
      ctx.font = 'italic 24px sans-serif';
      ctx.fillStyle = '#99aabb';
      ctx.fillText(`"${entry.reviewText.slice(0, 80)}..."`, 60, 310);
    }

    // User watermark bottom
    ctx.font = '20px monospace';
    ctx.fillStyle = '#667788';
    ctx.fillText(`Logged by @${profile.handle} · Verified Gamers Club`, 60, 550);

    // Download trigger
    const image = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.download = `gameboxd-${shareTitle.toLowerCase().replace(/[^a-z0-9]/g, '-')}.png`;
    a.href = image;
    a.click();
    setCopiedImage(true);
    setTimeout(() => setCopiedImage(false), 2500);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-hidden animate-in fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-[#1b2228] border border-[#2c3440] rounded-xl w-full max-w-xl max-h-[90vh] flex flex-col shadow-2xl overflow-y-auto custom-scrollbar relative my-auto p-5 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#2c3440] pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#ff8000]" />
            <h3 className="font-black text-sm uppercase tracking-wider text-white">
              Social Milestone & Review Card
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-[#9ab] hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* The Graphic Card Preview (Letterboxd Style) */}
        <div 
          ref={cardRef}
          className="relative rounded-xl overflow-hidden border border-[#2c3440] p-5 sm:p-6 bg-[#14181c] shadow-2xl transition-all"
          id="social-share-preview-card"
        >
          {/* Backdrop blur effect */}
          {game && (
            <div className="absolute inset-0 overflow-hidden opacity-20 pointer-events-none">
              <img
                src={game.backdropUrl || game.coverUrl}
                alt=""
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover filter blur-md scale-110"
              />
            </div>
          )}

          <div className="relative z-10 space-y-4">
            {/* Top Bar: Letterboxd 3-dot logo */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex items-center -space-x-1">
                  <div className="w-3 h-3 rounded-full bg-[#ff8000]" />
                  <div className="w-3 h-3 rounded-full bg-[#00e054] z-10" />
                  <div className="w-3 h-3 rounded-full bg-[#40bcf4]" />
                </div>
                <span className="text-[10px] font-extrabold font-mono tracking-widest text-white uppercase">
                  GAMEBOXD
                </span>
              </div>

              <div className="flex items-center gap-2 text-[10px] font-mono text-[#9ab]">
                <span>@{profile.handle}</span>
              </div>
            </div>

            {/* Main Content: Poster & Details */}
            {game ? (
              <div className="flex items-center gap-4">
                <img
                  src={game.coverUrl}
                  alt={game.title}
                  referrerPolicy="no-referrer"
                  className="w-20 h-28 object-cover rounded-[3px] border border-[#2c3440] shrink-0 shadow-lg"
                />
                <div className="space-y-1.5 min-w-0">
                  <h4 className="text-lg sm:text-xl font-black text-white leading-tight truncate">
                    {game.title}
                  </h4>
                  <div className="text-xs text-[#9ab] font-mono">
                    {game.releaseYear} · {game.developer}
                  </div>

                  {entry && (
                    <div className="flex items-center gap-2 pt-1">
                      <StarRating value={entry.rating} readOnly size="md" showNumeric />
                      {entry.isLiked && <span className="text-[#ff8000] text-xs">♥ Liked</span>}
                    </div>
                  )}

                  {entry?.hoursPlayed && (
                    <div className="text-[11px] text-[#40bcf4] font-mono">
                      Logged {entry.hoursPlayed} hours of playtime
                    </div>
                  )}
                </div>
              </div>
            ) : milestone ? (
              <div className="flex items-center gap-4 py-2">
                <div className="w-16 h-16 rounded-full bg-[#ff8000]/20 border border-[#ff8000] text-[#ff8000] flex items-center justify-center shrink-0">
                  <Trophy className="w-8 h-8" />
                </div>
                <div>
                  <div className="text-[10px] uppercase font-mono text-[#ff8000] font-bold">
                    Milestone Unlocked
                  </div>
                  <h4 className="text-xl font-black text-white">{milestone.title}</h4>
                  <p className="text-xs text-[#9ab] font-mono mt-0.5">{milestone.subtitle}</p>
                </div>
              </div>
            ) : null}

            {/* Review quote */}
            {entry?.reviewText && (
              <div className="bg-[#1b2228]/80 backdrop-blur-sm p-3 rounded-lg border border-[#2c3440] text-xs text-[#c8d4e0] italic leading-relaxed">
                "{entry.reviewText}"
              </div>
            )}

            {/* Favorite 4 Mini-Row (if no specific game) */}
            {!game && favoriteGames.length > 0 && (
              <div className="pt-2">
                <div className="text-[10px] uppercase font-mono text-[#678] mb-1.5">
                  Favorite Four Games:
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {favoriteGames.slice(0, 4).map(g => (
                    <div key={g.id} className="aspect-[2/3] rounded overflow-hidden border border-[#2c3440]">
                      <img src={g.coverUrl} alt={g.title} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Footer watermark */}
            <div className="flex items-center justify-between text-[9px] font-mono text-[#678] border-t border-[#2c3440]/60 pt-2">
              <span>Track games with friends on Gameboxd</span>
              <span>letterboxd.games/@{userProfile.handle}</span>
            </div>
          </div>
        </div>

        {/* Share Buttons */}
        <div className="space-y-3 pt-2">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button
              type="button"
              onClick={handleCopyText}
              className="flex items-center justify-center gap-1.5 bg-[#14181c] hover:bg-[#202830] border border-[#2c3440] text-xs font-mono text-[#9ab] hover:text-white py-2 rounded transition-colors"
            >
              {copiedText ? <Check className="w-3.5 h-3.5 text-[#00e054]" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedText ? 'Copied!' : 'Copy Text'}</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadCard}
              className="flex items-center justify-center gap-1.5 bg-[#14181c] hover:bg-[#202830] border border-[#2c3440] text-xs font-mono text-[#9ab] hover:text-[#00e054] py-2 rounded transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-[#00e054]" />
              <span>{copiedImage ? 'Saved PNG!' : 'Download Card'}</span>
            </button>

            <button
              type="button"
              onClick={handleShareTwitter}
              className="flex items-center justify-center gap-1.5 bg-[#14181c] hover:bg-[#202830] border border-[#2c3440] text-xs font-mono text-[#9ab] hover:text-[#40bcf4] py-2 rounded transition-colors"
            >
              <Twitter className="w-3.5 h-3.5 text-[#40bcf4]" />
              <span>Post to X</span>
            </button>

            <button
              type="button"
              onClick={handleShareReddit}
              className="flex items-center justify-center gap-1.5 bg-[#14181c] hover:bg-[#202830] border border-[#2c3440] text-xs font-mono text-[#9ab] hover:text-[#ff8000] py-2 rounded transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5 text-[#ff8000]" />
              <span>Reddit</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

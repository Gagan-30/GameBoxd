import React, { useState, useEffect } from 'react';
import { Game, JournalEntry } from '../types';
import { StarRating } from './StarRating';
import { X, Heart, RotateCcw, Calendar, Clock, Tag, AlertTriangle, Check } from 'lucide-react';
import { useLockBodyScroll } from '../hooks/useLockBodyScroll';

interface LogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveLog?: (entry: Partial<JournalEntry> & { game: Game }) => void;
  onSave?: (entry: Partial<JournalEntry> & { game?: Game }) => void;
  initialGame?: Game | null;
  game?: Game | null;
  existingEntry?: JournalEntry | null;
  allGames: Game[];
  onSelectGameForLog?: (game: Game) => void;
}

export const LogModal: React.FC<LogModalProps> = ({
  isOpen,
  onClose,
  onSaveLog,
  onSave,
  initialGame,
  game,
  existingEntry,
  allGames = [],
  onSelectGameForLog
}) => {
  const activeInitialGame = game || initialGame || null;
  const [selectedGame, setSelectedGame] = useState<Game | null>(activeInitialGame);
  const [searchQuery, setSearchQuery] = useState('');

  useLockBodyScroll(isOpen);
  const [rating, setRating] = useState<number>(existingEntry?.rating || 4.0);
  const [isLiked, setIsLiked] = useState<boolean>(existingEntry?.isLiked || false);
  const [isReplay, setIsReplay] = useState<boolean>(existingEntry?.isReplay || false);
  const [datePlayed, setDatePlayed] = useState<string>(
    existingEntry?.datePlayed || new Date().toISOString().split('T')[0]
  );
  const [platform, setPlatform] = useState<string>(existingEntry?.platform || '');
  const [reviewText, setReviewText] = useState<string>(existingEntry?.reviewText || '');
  const [tags, setTags] = useState<string>(existingEntry?.tags ? existingEntry.tags.join(', ') : '');
  const [containsSpoilers, setContainsSpoilers] = useState<boolean>(existingEntry?.containsSpoilers || false);
  const [hoursPlayed, setHoursPlayed] = useState<number | ''>(existingEntry?.hoursPlayed || '');

  useEffect(() => {
    const currentTargetGame = game || initialGame;
    if (currentTargetGame) {
      setSelectedGame(currentTargetGame);
      if (!platform && currentTargetGame.platforms && currentTargetGame.platforms.length > 0) {
        setPlatform(currentTargetGame.platforms[0]);
      }
    }
  }, [game, initialGame]);

  useEffect(() => {
    if (existingEntry) {
      setRating(existingEntry.rating);
      setIsLiked(existingEntry.isLiked);
      setIsReplay(existingEntry.isReplay);
      setDatePlayed(existingEntry.datePlayed);
      setPlatform(existingEntry.platform || '');
      setReviewText(existingEntry.reviewText || '');
      setTags(existingEntry.tags.join(', '));
      setContainsSpoilers(existingEntry.containsSpoilers || false);
      setHoursPlayed(existingEntry.hoursPlayed || '');
    }
  }, [existingEntry]);

  if (!isOpen) return null;

  const safeGames = allGames || [];
  const filteredGames = searchQuery.trim()
    ? safeGames.filter(g => g.title?.toLowerCase().includes(searchQuery.toLowerCase()))
    : safeGames.slice(0, 5);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGame) return;

    const parsedTags = tags
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0);

    const logPayload = {
      id: existingEntry?.id,
      gameId: selectedGame.id,
      gameTitle: selectedGame.title,
      gameCoverUrl: selectedGame.coverUrl,
      releaseYear: selectedGame.releaseYear,
      rating,
      isLiked,
      isReplay,
      datePlayed,
      reviewText: reviewText.trim() || undefined,
      platform: platform || selectedGame.platforms[0] || 'PC',
      tags: parsedTags,
      containsSpoilers,
      hoursPlayed: typeof hoursPlayed === 'number' ? hoursPlayed : undefined,
      game: selectedGame
    };

    if (onSaveLog) {
      onSaveLog(logPayload);
    } else if (onSave) {
      onSave(logPayload);
    }

    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-hidden animate-in fade-in duration-150"
      id="letterboxd-log-modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        className="bg-[#1b2228] border border-[#2c3440] rounded-xl w-full max-w-xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden relative my-auto animate-in zoom-in-95 duration-200"
        id="letterboxd-log-modal-dialog"
      >
        {/* Header bar */}
        <div className="bg-[#14181c] px-4 py-3 border-b border-[#2c3440] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#00e054]" />
            <h2 className="font-extrabold text-sm uppercase tracking-wider text-white">
              {existingEntry ? 'Edit Journal Entry' : 'Log Game / Add to Diary'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-full flex items-center justify-center text-[#9ab] hover:text-white hover:bg-[#2c3440] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1 custom-scrollbar">
          {/* Game Selection if not already selected */}
          {!selectedGame ? (
            <div className="space-y-2">
              <label className="text-xs uppercase font-mono text-[#9ab] tracking-wider">
                Select Game to Log
              </label>
              <input
                type="text"
                placeholder="Search game title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#14181c] border border-[#2c3440] focus:border-[#00e054] rounded-lg px-3 py-2 text-sm text-white placeholder-[#678] outline-none"
                autoFocus
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pt-1 custom-scrollbar">
                {filteredGames.map((game) => (
                  <button
                    key={game.id}
                    type="button"
                    onClick={() => {
                      setSelectedGame(game);
                      setPlatform(game.platforms[0] || 'PC');
                      onSelectGameForLog?.(game);
                    }}
                    className="flex items-center gap-2.5 p-1.5 rounded-lg bg-[#14181c]/60 hover:bg-[#202830] border border-[#2c3440] text-left transition-colors"
                  >
                    <img
                      src={game.coverUrl}
                      alt={game.title}
                      referrerPolicy="no-referrer"
                      className="w-9 h-12 object-cover rounded-[3px] shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-white truncate">{game.title}</div>
                      <div className="text-[11px] text-[#678] font-mono">{game.releaseYear} · {game.developer}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* Selected Game Letterboxd Summary Banner */
            <div className="flex items-center justify-between bg-[#14181c] p-3 rounded-lg border border-[#2c3440]">
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src={selectedGame.coverUrl}
                  alt={selectedGame.title}
                  referrerPolicy="no-referrer"
                  className="w-12 h-16 object-cover rounded-[3px] border border-[#2c3440] shrink-0 shadow"
                />
                <div className="min-w-0">
                  <h3 className="text-base font-black text-white truncate leading-snug">
                    {selectedGame.title}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-[#9ab] font-mono mt-0.5">
                    <span>{selectedGame.releaseYear}</span>
                    <span>·</span>
                    <span className="truncate">{selectedGame.developer}</span>
                  </div>
                </div>
              </div>
              {!initialGame && (
                <button
                  type="button"
                  onClick={() => setSelectedGame(null)}
                  className="text-xs text-[#40bcf4] hover:underline font-mono ml-2 shrink-0"
                >
                  Change
                </button>
              )}
            </div>
          )}

          {/* Letterboxd Rating & Like Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-[#14181c] p-3.5 rounded-lg border border-[#2c3440]">
            <div>
              <div className="text-[11px] uppercase font-mono text-[#9ab] mb-1 tracking-wider">
                Rating
              </div>
              <StarRating
                value={rating}
                onChange={setRating}
                size="lg"
                showNumeric
              />
            </div>

            <div className="flex items-center justify-start sm:justify-end gap-3 pt-1 sm:pt-0">
              {/* Like Button */}
              <button
                type="button"
                id="log-modal-like-toggle"
                onClick={() => setIsLiked(!isLiked)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold transition-all ${
                  isLiked
                    ? 'bg-[#ff8000]/10 border-[#ff8000] text-[#ff8000]'
                    : 'border-[#2c3440] text-[#9ab] hover:border-[#ff8000] hover:text-[#ff8000]'
                }`}
              >
                <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-current' : ''}`} />
                <span>Like</span>
              </button>

              {/* Replay Toggle */}
              <button
                type="button"
                id="log-modal-replay-toggle"
                onClick={() => setIsReplay(!isReplay)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold transition-all ${
                  isReplay
                    ? 'bg-[#00e054]/10 border-[#00e054] text-[#00e054]'
                    : 'border-[#2c3440] text-[#9ab] hover:border-[#00e054] hover:text-[#00e054]'
                }`}
                title="I’ve played this game before"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Replay</span>
              </button>
            </div>
          </div>

          {/* Date Played & Platform */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="flex items-center gap-1 text-[11px] uppercase font-mono text-[#9ab] tracking-wider">
                <Calendar className="w-3 h-3 text-[#40bcf4]" />
                <span>Date Played</span>
              </label>
              <input
                type="date"
                value={datePlayed}
                onChange={(e) => setDatePlayed(e.target.value)}
                className="w-full bg-[#14181c] border border-[#2c3440] focus:border-[#00e054] rounded px-2.5 py-1.5 text-xs text-white outline-none font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="flex items-center gap-1 text-[11px] uppercase font-mono text-[#9ab] tracking-wider">
                <span>Platform</span>
              </label>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                className="w-full bg-[#14181c] border border-[#2c3440] focus:border-[#00e054] rounded px-2.5 py-1.5 text-xs text-white outline-none font-mono"
              >
                {selectedGame?.platforms.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
                <option value="PC">PC</option>
                <option value="PlayStation 5">PlayStation 5</option>
                <option value="PlayStation 4">PlayStation 4</option>
                <option value="Nintendo Switch">Nintendo Switch</option>
                <option value="Xbox Series X/S">Xbox Series X/S</option>
                <option value="Steam Deck">Steam Deck</option>
                <option value="Retro">Retro Console / Handheld</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="flex items-center gap-1 text-[11px] uppercase font-mono text-[#9ab] tracking-wider">
                <Clock className="w-3 h-3 text-[#00e054]" />
                <span>Hours Played</span>
              </label>
              <input
                type="number"
                min="0"
                step="1"
                placeholder="e.g. 45"
                value={hoursPlayed}
                onChange={(e) => setHoursPlayed(e.target.value ? Number(e.target.value) : '')}
                className="w-full bg-[#14181c] border border-[#2c3440] focus:border-[#00e054] rounded px-2.5 py-1.5 text-xs text-white outline-none font-mono placeholder-[#678]"
              />
            </div>
          </div>

          {/* Review Text Area */}
          <div className="space-y-1">
            <label className="flex items-center justify-between text-[11px] uppercase font-mono text-[#9ab] tracking-wider">
              <span>Review / Journal Entry</span>
              <span className="text-[10px] text-[#678] lowercase">optional</span>
            </label>
            <textarea
              rows={4}
              placeholder="What did you think of the art direction, bosses, atmosphere, combat pacing, or music?..."
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              className="w-full bg-[#14181c] border border-[#2c3440] focus:border-[#00e054] rounded-lg p-3 text-sm text-white placeholder-[#678] outline-none resize-none leading-relaxed"
            />
          </div>

          {/* Tags & Spoilers */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-[11px] uppercase font-mono text-[#9ab] tracking-wider">
                <Tag className="w-3 h-3 text-[#40bcf4]" />
                <span>Tags (comma separated)</span>
              </div>
              <label className="flex items-center gap-1.5 cursor-pointer select-none text-xs text-[#9ab] hover:text-[#ff8000]">
                <input
                  type="checkbox"
                  checked={containsSpoilers}
                  onChange={(e) => setContainsSpoilers(e.target.checked)}
                  className="rounded border-[#2c3440] text-[#ff8000] focus:ring-0 bg-[#14181c]"
                />
                <span className="flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3 text-[#ff8000]" />
                  Contains spoilers
                </span>
              </label>
            </div>
            <input
              type="text"
              placeholder="e.g. 100% Run, Platinum Trophy, Masterpiece, DLC, Couch Co-op"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="w-full bg-[#14181c] border border-[#2c3440] focus:border-[#00e054] rounded px-3 py-1.5 text-xs text-white placeholder-[#678] outline-none font-mono"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-[#2c3440]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded text-xs font-semibold text-[#9ab] hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!selectedGame}
              id="log-modal-submit-btn"
              className="bg-[#00e054] hover:bg-[#00e054]/90 disabled:opacity-40 disabled:hover:bg-[#00e054] text-[#14181c] font-black uppercase text-xs tracking-wider px-6 py-2 rounded shadow flex items-center gap-1.5 transition-transform active:scale-95"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>Save Entry</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

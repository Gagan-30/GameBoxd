import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GameCollection, Game } from '../types';
import { GameCard } from './GameCard';
import {
  Folder, Plus, CheckCircle2, Clock, Heart, Trophy, Sparkles,
  Gamepad2, Flame, Bookmark, Shield, Trash2, Edit3, Share2,
  ArrowLeft, Search, Check, Layers, Image as ImageIcon,
  Clock3, Star, Filter, ArrowUpDown, X
} from 'lucide-react';
import { useLockBodyScroll } from '../hooks/useLockBodyScroll';

interface CollectionsViewProps {
  collections: GameCollection[];
  allGames: Game[];
  onSelectGame: (game: Game) => void;
  onQuickLog?: (game: Game) => void;
  onCreateCollection: (collection: Omit<GameCollection, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdateCollection: (collection: GameCollection) => void;
  onDeleteCollection: (collectionId: string) => void;
  onOpenShareCollection?: (collection: GameCollection) => void;
}

// Curated unique cover art gallery options
export const CURATED_COVER_ARTS = [
  {
    id: 'cover-victory',
    label: 'Victory Gold',
    url: 'https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?w=800&auto=format&fit=crop&q=80',
    category: 'Achievement / Finished'
  },
  {
    id: 'cover-backlog',
    label: 'Retro Cartridge Shelf',
    url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&auto=format&fit=crop&q=80',
    category: 'Backlog / Library'
  },
  {
    id: 'cover-favorites',
    label: 'Golden Gamepad Aura',
    url: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&auto=format&fit=crop&q=80',
    category: 'Favorites / Hall of Fame'
  },
  {
    id: 'cover-cyberpunk',
    label: 'Neon Megacity',
    url: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=800&auto=format&fit=crop&q=80',
    category: 'Sci-Fi / Cyberpunk'
  },
  {
    id: 'cover-fantasy',
    label: 'Dark Bonfire & Blade',
    url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80',
    category: 'Soulsborne / Fantasy'
  },
  {
    id: 'cover-cozy',
    label: 'Lofi Study Glow',
    url: 'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=800&auto=format&fit=crop&q=80',
    category: 'Cozy & Chill'
  },
  {
    id: 'cover-adventure',
    label: 'Alpine Odyssey',
    url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&auto=format&fit=crop&q=80',
    category: 'Open World RPG'
  },
  {
    id: 'cover-synth',
    label: 'Synthwave Horizon',
    url: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&auto=format&fit=crop&q=80',
    category: 'Retro & Indie'
  }
];

const THEME_COLORS = [
  { name: 'Letterboxd Green', hex: '#00e054' },
  { name: 'Sky Cyan', hex: '#40bcf4' },
  { name: 'Amber Orange', hex: '#ff8000' },
  { name: 'Arcade Purple', hex: '#a855f7' },
  { name: 'Neon Rose', hex: '#f43f5e' },
  { name: 'Championship Gold', hex: '#eab308' }
];

const AVAILABLE_ICONS = [
  { id: 'CheckCircle2', label: 'Finished', component: CheckCircle2 },
  { id: 'Clock', label: 'Backlog', component: Clock },
  { id: 'Heart', label: 'Favorite', component: Heart },
  { id: 'Trophy', label: 'Mastery', component: Trophy },
  { id: 'Sparkles', label: 'Curated', component: Sparkles },
  { id: 'Gamepad2', label: 'Gaming', component: Gamepad2 },
  { id: 'Flame', label: 'Hot', component: Flame },
  { id: 'Bookmark', label: 'Saved', component: Bookmark },
  { id: 'Shield', label: 'Classic', component: Shield }
];

const TEMPLATE_PRESETS = [
  {
    name: 'Finished',
    description: 'Games conquered from opening scene to final credits. Beaten, celebrated, and archived into the hall of fame.',
    coverArtUrl: 'https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?w=800&auto=format&fit=crop&q=80',
    themeColor: '#00e054',
    icon: 'CheckCircle2'
  },
  {
    name: 'Backlog',
    description: 'The ever-expanding library of masterpieces queued up and waiting their turn on the active priority queue.',
    coverArtUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&auto=format&fit=crop&q=80',
    themeColor: '#40bcf4',
    icon: 'Clock'
  },
  {
    name: 'All-Time Favorites',
    description: 'The defining titles and transcendent gaming experiences that shaped my taste, memories, and journey forever.',
    coverArtUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&auto=format&fit=crop&q=80',
    themeColor: '#ff8000',
    icon: 'Heart'
  },
  {
    name: 'Cozy Weekend Escapes',
    description: 'Low-stress, atmospheric comfort games perfect for rainy Sundays with warm coffee and gentle soundscapes.',
    coverArtUrl: 'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=800&auto=format&fit=crop&q=80',
    themeColor: '#a855f7',
    icon: 'Sparkles'
  },
  {
    name: 'Soulsborne Mastery',
    description: 'High-difficulty, punishing combat tests demanding unwavering precision, mastery, and unyielding perseverance.',
    coverArtUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80',
    themeColor: '#f43f5e',
    icon: 'Flame'
  }
];

export const CollectionsView: React.FC<CollectionsViewProps> = ({
  collections = [],
  allGames = [],
  onSelectGame,
  onQuickLog,
  onCreateCollection,
  onUpdateCollection,
  onDeleteCollection,
  onOpenShareCollection
}) => {
  const [selectedCollectionId, setSelectedCollectionId] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingCollection, setEditingCollection] = useState<GameCollection | null>(null);

  // Search and filter inside collection detail view
  const [detailSearchQuery, setDetailSearchQuery] = useState('');
  const [detailSortBy, setDetailSortBy] = useState<'default' | 'rating' | 'releaseYear' | 'hours' | 'title'>('default');
  const [isAddGamesModalOpen, setIsAddGamesModalOpen] = useState(false);

  // Form State for Create / Edit
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formCoverArtUrl, setFormCoverArtUrl] = useState(CURATED_COVER_ARTS[0].url);
  const [formThemeColor, setFormThemeColor] = useState('#00e054');
  const [formIcon, setFormIcon] = useState('CheckCircle2');
  const [formSelectedGameIds, setFormSelectedGameIds] = useState<string[]>([]);
  const [gamePickerSearch, setGamePickerSearch] = useState('');
  const [coverArtTab, setCoverArtTab] = useState<'presets' | 'games' | 'custom'>('presets');

  useLockBodyScroll(isCreateModalOpen || isAddGamesModalOpen);

  const safeCollections = collections || [];
  const safeGames = allGames || [];
  const getGame = (id: string) => safeGames.find(g => g.id === id);

  // Selected Active Collection
  const activeCollection = useMemo(() => {
    return safeCollections.find(c => c.id === selectedCollectionId) || null;
  }, [safeCollections, selectedCollectionId]);

  // Open Create Modal
  const handleOpenCreateModal = () => {
    setEditingCollection(null);
    setFormName('');
    setFormDescription('');
    setFormCoverArtUrl(CURATED_COVER_ARTS[0].url);
    setFormThemeColor('#00e054');
    setFormIcon('CheckCircle2');
    setFormSelectedGameIds([]);
    setGamePickerSearch('');
    setCoverArtTab('presets');
    setIsCreateModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (col: GameCollection) => {
    setEditingCollection(col);
    setFormName(col.name);
    setFormDescription(col.description);
    setFormCoverArtUrl(col.coverArtUrl || CURATED_COVER_ARTS[0].url);
    setFormThemeColor(col.themeColor || '#00e054');
    setFormIcon(col.icon || 'CheckCircle2');
    setFormSelectedGameIds([...col.gameIds]);
    setGamePickerSearch('');
    setCoverArtTab('presets');
    setIsCreateModalOpen(true);
  };

  // Apply template preset
  const handleApplyPreset = (preset: typeof TEMPLATE_PRESETS[0]) => {
    setFormName(preset.name);
    setFormDescription(preset.description);
    setFormCoverArtUrl(preset.coverArtUrl);
    setFormThemeColor(preset.themeColor);
    setFormIcon(preset.icon);
  };

  // Save Collection (Create or Edit)
  const handleSaveCollection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    if (editingCollection) {
      onUpdateCollection({
        ...editingCollection,
        name: formName.trim(),
        description: formDescription.trim(),
        coverArtUrl: formCoverArtUrl.trim() || CURATED_COVER_ARTS[0].url,
        themeColor: formThemeColor,
        icon: formIcon,
        gameIds: formSelectedGameIds,
        updatedAt: new Date().toISOString()
      });
    } else {
      onCreateCollection({
        name: formName.trim(),
        description: formDescription.trim(),
        coverArtUrl: formCoverArtUrl.trim() || CURATED_COVER_ARTS[0].url,
        themeColor: formThemeColor,
        icon: formIcon,
        gameIds: formSelectedGameIds,
        isDefault: false
      });
    }

    setIsCreateModalOpen(false);
    setEditingCollection(null);
  };

  // Toggle game in collection selection
  const handleToggleGame = (gameId: string) => {
    setFormSelectedGameIds(prev => 
      prev.includes(gameId) ? prev.filter(id => id !== gameId) : [...prev, gameId]
    );
  };

  // Quick remove game from active collection
  const handleRemoveGameFromActive = (gameId: string) => {
    if (!activeCollection) return;
    onUpdateCollection({
      ...activeCollection,
      gameIds: activeCollection.gameIds.filter(id => id !== gameId),
      updatedAt: new Date().toISOString()
    });
  };

  // Quick add game to active collection
  const handleAddGameToActive = (gameId: string) => {
    if (!activeCollection || activeCollection.gameIds.includes(gameId)) return;
    onUpdateCollection({
      ...activeCollection,
      gameIds: [...activeCollection.gameIds, gameId],
      updatedAt: new Date().toISOString()
    });
  };

  // Calculate statistics for active collection
  const activeGames = useMemo(() => {
    if (!activeCollection) return [];
    return activeCollection.gameIds.map(getGame).filter(Boolean) as Game[];
  }, [activeCollection, safeGames]);

  const filteredActiveGames = useMemo(() => {
    let result = [...activeGames];
    if (detailSearchQuery.trim()) {
      const q = detailSearchQuery.toLowerCase();
      result = result.filter(g => 
        g.title.toLowerCase().includes(q) || 
        g.genres.some(gen => gen.toLowerCase().includes(q))
      );
    }

    if (detailSortBy === 'rating') {
      result.sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0));
    } else if (detailSortBy === 'releaseYear') {
      result.sort((a, b) => (b.releaseYear || 0) - (a.releaseYear || 0));
    } else if (detailSortBy === 'hours') {
      result.sort((a, b) => (b.playtimeHours || b.hltb?.mainStory || 0) - (a.playtimeHours || a.hltb?.mainStory || 0));
    } else if (detailSortBy === 'title') {
      result.sort((a, b) => a.title.localeCompare(b.title));
    }
    return result;
  }, [activeGames, detailSearchQuery, detailSortBy]);

  const collectionStats = useMemo(() => {
    if (!activeGames.length) return { totalHours: 0, avgRating: 0, genresCount: 0 };
    const totalHours = activeGames.reduce((acc, g) => acc + (g.playtimeHours || g.hltb?.mainStory || 0), 0);
    const avgRating = activeGames.reduce((acc, g) => acc + (g.averageRating || 0), 0) / activeGames.length;
    const allGenres = new Set(activeGames.flatMap(g => g.genres || []));
    return {
      totalHours,
      avgRating: avgRating.toFixed(1),
      genresCount: allGenres.size
    };
  }, [activeGames]);

  // Helper to render icon
  const renderIcon = (iconName?: string, className = 'w-4 h-4') => {
    const item = AVAILABLE_ICONS.find(i => i.id === iconName);
    const IconComponent = item ? item.component : Layers;
    return <IconComponent className={className} />;
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6" id="collections-feature-container">
      {/* View Header */}
      {!activeCollection && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#2c3440] pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-wider text-white flex items-center gap-2.5">
                <Layers className="w-6 h-6 text-[#00e054]" />
                <span>Themed Collections</span>
              </h1>
              <span className="text-xs font-mono font-bold text-[#00e054] bg-[#00e054]/10 border border-[#00e054]/30 px-2.5 py-0.5 rounded-full">
                {safeCollections.length} Curated
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[#9ab] font-mono leading-relaxed max-w-2xl">
              Group your games into custom themed collections—such as Finished, Backlog, and All-Time Favorites—featuring custom cover art, distinctive palettes, and tailored descriptions.
            </p>
          </div>

          <button
            type="button"
            id="create-new-collection-btn"
            onClick={handleOpenCreateModal}
            className="bg-[#00e054] hover:bg-[#00e054]/90 text-[#14181c] font-black uppercase text-xs tracking-wider px-4 py-2.5 rounded-full shadow-[0_0_15px_rgba(0,224,84,0.3)] self-start sm:self-auto transition-transform active:scale-95 flex items-center gap-2 cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>New Collection</span>
          </button>
        </div>
      )}

      {/* ========================================================= */}
      {/* 1. COLLECTION DETAIL VIEW */}
      {/* ========================================================= */}
      {activeCollection ? (
        <div className="space-y-6" id={`collection-detail-${activeCollection.id}`}>
          {/* Back Navigation Bar */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              id="back-to-collections-btn"
              onClick={() => {
                setSelectedCollectionId(null);
                setDetailSearchQuery('');
              }}
              className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#9ab] hover:text-white transition-colors bg-[#1b2228] px-3 py-1.5 rounded-lg border border-[#2c3440] hover:border-[#40bcf4]"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>All Collections</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleOpenEditModal(activeCollection)}
                className="flex items-center gap-1.5 text-xs font-mono text-[#9ab] hover:text-white bg-[#1b2228] hover:bg-[#202830] px-3 py-1.5 rounded-lg border border-[#2c3440] transition-colors"
                title="Edit collection details and cover art"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Collection</span>
              </button>

              {onOpenShareCollection && (
                <button
                  type="button"
                  onClick={() => onOpenShareCollection(activeCollection)}
                  className="flex items-center gap-1.5 text-xs font-mono text-[#ff8000] hover:text-white bg-[#1b2228] hover:bg-[#ff8000]/20 px-3 py-1.5 rounded-lg border border-[#2c3440] hover:border-[#ff8000]/40 transition-colors"
                  title="Share Collection Card"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Share</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  if (window.confirm(`Are you sure you want to delete collection "${activeCollection.name}"?`)) {
                    onDeleteCollection(activeCollection.id);
                    setSelectedCollectionId(null);
                  }
                }}
                className="p-1.5 text-red-400 hover:text-white hover:bg-red-500/20 rounded-lg border border-[#2c3440] hover:border-red-500/40 transition-colors"
                title="Delete Collection"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Cinematic Hero Card showcasing Unique Cover Art */}
          <div 
            className="relative rounded-2xl overflow-hidden border border-[#2c3440] shadow-2xl bg-[#181e24] min-h-[260px] sm:min-h-[300px] flex flex-col justify-end p-6 sm:p-8"
            style={{
              borderColor: activeCollection.themeColor ? `${activeCollection.themeColor}55` : '#2c3440'
            }}
          >
            {/* Background Unique Cover Art with Gradient Scrim */}
            <div className="absolute inset-0 z-0">
              <img
                src={activeCollection.coverArtUrl}
                alt={activeCollection.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-center filter brightness-[0.45] saturate-[1.2] scale-105 transition-transform duration-700 hover:scale-100"
              />
              <div 
                className="absolute inset-0"
                style={{
                  background: `linear-gradient(to top, #14181c 0%, rgba(20,24,28,0.85) 50%, rgba(20,24,28,0.3) 100%)`
                }}
              />
              {/* Subtle theme color aura in corner */}
              <div 
                className="absolute top-0 right-0 w-80 h-80 rounded-full blur-3xl opacity-20 pointer-events-none"
                style={{ backgroundColor: activeCollection.themeColor || '#00e054' }}
              />
            </div>

            {/* Collection Metadata overlay */}
            <div className="relative z-10 space-y-4 max-w-3xl">
              {/* Top pill with Icon and Theme */}
              <div className="flex flex-wrap items-center gap-2.5">
                <span 
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider text-white shadow-lg backdrop-blur-md border border-white/10"
                  style={{ backgroundColor: activeCollection.themeColor || '#00e054' }}
                >
                  {renderIcon(activeCollection.icon, 'w-3.5 h-3.5 text-white stroke-[2.5]')}
                  <span>Theme Collection</span>
                </span>

                <span className="bg-[#14181c]/80 backdrop-blur-md text-[#9ab] border border-[#2c3440] px-3 py-1 rounded-full text-xs font-mono">
                  {activeGames.length} {activeGames.length === 1 ? 'Game' : 'Games'}
                </span>

                {collectionStats.totalHours > 0 && (
                  <span className="bg-[#14181c]/80 backdrop-blur-md text-[#40bcf4] border border-[#40bcf4]/30 px-3 py-1 rounded-full text-xs font-mono flex items-center gap-1">
                    <Clock3 className="w-3 h-3" />
                    <span>~{collectionStats.totalHours} hrs</span>
                  </span>
                )}

                {Number(collectionStats.avgRating) > 0 && (
                  <span className="bg-[#14181c]/80 backdrop-blur-md text-[#00e054] border border-[#00e054]/30 px-3 py-1 rounded-full text-xs font-mono flex items-center gap-1">
                    <Star className="w-3 h-3 fill-current" />
                    <span>{collectionStats.avgRating} avg</span>
                  </span>
                )}
              </div>

              {/* Title */}
              <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight uppercase">
                {activeCollection.name}
              </h2>

              {/* Unique Themed Description */}
              <p className="text-sm sm:text-base text-[#cad2db] leading-relaxed font-sans max-w-2xl">
                {activeCollection.description || 'Custom curated collection of games.'}
              </p>
            </div>
          </div>

          {/* Collection Toolbar (Search, Sort, Add Games) */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#181e24] p-3 rounded-xl border border-[#2c3440]">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#678] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={`Search inside ${activeCollection.name}...`}
                value={detailSearchQuery}
                onChange={(e) => setDetailSearchQuery(e.target.value)}
                className="w-full bg-[#14181c] border border-[#2c3440] focus:border-[#00e054] rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-[#678] focus:outline-none"
              />
              {detailSearchQuery && (
                <button
                  type="button"
                  onClick={() => setDetailSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#678] hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 text-xs font-mono text-[#9ab] bg-[#14181c] px-2.5 py-1.5 rounded-lg border border-[#2c3440]">
                <ArrowUpDown className="w-3.5 h-3.5 text-[#678]" />
                <select
                  value={detailSortBy}
                  onChange={(e) => setDetailSortBy(e.target.value as any)}
                  className="bg-transparent text-white focus:outline-none cursor-pointer"
                >
                  <option value="default" className="bg-[#14181c]">Sort: Default</option>
                  <option value="rating" className="bg-[#14181c]">Sort: Highest Rated</option>
                  <option value="releaseYear" className="bg-[#14181c]">Sort: Release Year</option>
                  <option value="hours" className="bg-[#14181c]">Sort: Playtime Hours</option>
                  <option value="title" className="bg-[#14181c]">Sort: Alphabetical</option>
                </select>
              </div>

              <button
                type="button"
                id="add-games-to-collection-btn"
                onClick={() => setIsAddGamesModalOpen(true)}
                className="bg-[#00e054] hover:bg-[#00e054]/90 text-[#14181c] text-xs font-black uppercase tracking-wider px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 shadow active:scale-95 transition-all shrink-0"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
                <span>Add Games</span>
              </button>
            </div>
          </div>

          {/* Games Grid in Collection */}
          {filteredActiveGames.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
              {filteredActiveGames.map((game) => (
                <div key={game.id} className="relative group">
                  <GameCard
                    game={game}
                    onSelect={onSelectGame}
                    onQuickLog={onQuickLog}
                  />

                  {/* Quick Remove from this collection button overlay on hover */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveGameFromActive(game.id);
                    }}
                    className="absolute top-2 right-2 p-1 rounded bg-[#14181c]/90 hover:bg-red-500 text-[#9ab] hover:text-white border border-[#2c3440] hover:border-red-500 shadow-md opacity-0 group-hover:opacity-100 transition-opacity z-20"
                    title={`Remove from ${activeCollection.name}`}
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-[#181e24] border border-[#2c3440] rounded-xl space-y-4 p-6">
              <div className="w-12 h-12 rounded-full bg-[#202830] flex items-center justify-center mx-auto text-[#678]">
                {renderIcon(activeCollection.icon, 'w-6 h-6')}
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white">No games match this criteria</h3>
                <p className="text-xs text-[#9ab] font-mono max-w-sm mx-auto">
                  {detailSearchQuery ? `No titles found matching "${detailSearchQuery}".` : 'This collection currently has no games added.'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddGamesModalOpen(true)}
                className="inline-flex items-center gap-1.5 bg-[#00e054] text-[#14181c] font-black uppercase text-xs px-4 py-2 rounded-lg"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>Add Games from Catalog</span>
              </button>
            </div>
          )}
        </div>
      ) : (
        /* ========================================================= */
        /* 2. ALL COLLECTIONS GRID VIEW */
        /* ========================================================= */
        <div className="space-y-8">
          {/* Preset Quick Starters Bar (if user wants to spin up Finished, Backlog, or Favorites easily) */}
          <div className="bg-[#181e24] border border-[#2c3440] rounded-xl p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#9ab]">
                <Sparkles className="w-3.5 h-3.5 text-[#00e054]" />
                <span>Quick Collection Templates</span>
              </div>
              <span className="text-[11px] text-[#678] font-mono">1-click create</span>
            </div>

            <div className="flex flex-wrap gap-2">
              {TEMPLATE_PRESETS.map((preset) => {
                const alreadyExists = safeCollections.some(c => c.name.toLowerCase() === preset.name.toLowerCase());
                return (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => {
                      if (!alreadyExists) {
                        onCreateCollection({
                          name: preset.name,
                          description: preset.description,
                          coverArtUrl: preset.coverArtUrl,
                          themeColor: preset.themeColor,
                          icon: preset.icon,
                          gameIds: [],
                          isDefault: true
                        });
                      }
                    }}
                    disabled={alreadyExists}
                    className={`text-xs font-mono px-3 py-1.5 rounded-lg border flex items-center gap-2 transition-all ${
                      alreadyExists
                        ? 'bg-[#14181c]/60 text-[#678] border-[#2c3440] cursor-default'
                        : 'bg-[#1b2228] hover:bg-[#202830] text-white border-[#2c3440] hover:border-[#00e054] cursor-pointer'
                    }`}
                  >
                    <span 
                      className="w-2 h-2 rounded-full" 
                      style={{ backgroundColor: preset.themeColor }}
                    />
                    <span>{preset.name}</span>
                    {alreadyExists && <span className="text-[10px] text-[#00e054]">✓ Created</span>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Collections Grid Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="collections-grid">
            {safeCollections.map((col) => {
              const gamesInCol = col.gameIds.map(getGame).filter(Boolean) as Game[];
              const totalHours = gamesInCol.reduce((acc, g) => acc + (g.playtimeHours || g.hltb?.mainStory || 0), 0);

              return (
                <motion.div
                  key={col.id}
                  whileHover={{ y: -4 }}
                  transition={{ duration: 0.2 }}
                  onClick={() => setSelectedCollectionId(col.id)}
                  className="group relative bg-[#181e24] border border-[#2c3440] hover:border-[#40bcf4] rounded-2xl overflow-hidden shadow-xl cursor-pointer flex flex-col transition-all duration-300"
                  style={{
                    borderColor: col.themeColor ? `${col.themeColor}40` : '#2c3440'
                  }}
                >
                  {/* Top Unique Cover Art Area */}
                  <div className="relative aspect-[16/9] w-full overflow-hidden bg-[#14181c]">
                    <img
                      src={col.coverArtUrl || CURATED_COVER_ARTS[0].url}
                      alt={col.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 filter brightness-[0.75] saturate-[1.1]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#181e24] via-[#181e24]/40 to-transparent" />

                    {/* Accent Color Top Bar */}
                    <div 
                      className="absolute top-0 inset-x-0 h-1"
                      style={{ backgroundColor: col.themeColor || '#00e054' }}
                    />

                    {/* Icon Pill in Cover */}
                    <div className="absolute top-3 left-3 flex items-center gap-2">
                      <span 
                        className="p-1.5 rounded-lg text-white shadow-md backdrop-blur-md border border-white/10"
                        style={{ backgroundColor: col.themeColor || '#00e054' }}
                      >
                        {renderIcon(col.icon, 'w-3.5 h-3.5 text-white stroke-[2.5]')}
                      </span>
                    </div>

                    {/* Game Count Pill */}
                    <div className="absolute top-3 right-3 bg-[#14181c]/80 backdrop-blur-md border border-[#2c3440] px-2.5 py-1 rounded-full text-[11px] font-mono text-[#e0e6ed] shadow">
                      {gamesInCol.length} {gamesInCol.length === 1 ? 'game' : 'games'}
                    </div>

                    {/* Bottom Mini Game Cover Stack Preview */}
                    <div className="absolute bottom-2 right-3 flex items-center -space-x-3">
                      {gamesInCol.slice(0, 4).map((g, idx) => (
                        <img
                          key={g.id}
                          src={g.coverUrl}
                          alt={g.title}
                          referrerPolicy="no-referrer"
                          className="w-7 h-10 rounded object-cover border border-[#2c3440] shadow-md transform hover:scale-110 transition-transform"
                          style={{ zIndex: 10 - idx }}
                        />
                      ))}
                      {gamesInCol.length > 4 && (
                        <div className="w-7 h-10 rounded bg-[#202830] border border-[#2c3440] flex items-center justify-center text-[10px] font-mono text-white z-0 shadow-md">
                          +{gamesInCol.length - 4}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-1.5">
                      <h3 className="text-lg font-black text-white uppercase tracking-tight group-hover:text-[#40bcf4] transition-colors flex items-center justify-between">
                        <span>{col.name}</span>
                      </h3>
                      <p className="text-xs text-[#9ab] line-clamp-2 leading-relaxed">
                        {col.description || 'Themed gaming collection.'}
                      </p>
                    </div>

                    {/* Footer Info & Quick Stats */}
                    <div className="flex items-center justify-between pt-3 border-t border-[#2c3440] text-[11px] font-mono text-[#678]">
                      <div className="flex items-center gap-3">
                        {totalHours > 0 && (
                          <span className="flex items-center gap-1 text-[#40bcf4]">
                            <Clock3 className="w-3 h-3" />
                            <span>{totalHours}h</span>
                          </span>
                        )}
                        <span>Updated {new Date(col.updatedAt || col.createdAt).toLocaleDateString()}</span>
                      </div>

                      <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(col)}
                          className="p-1.5 rounded text-[#9ab] hover:text-white hover:bg-[#2c3440] transition-colors"
                          title="Edit collection"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm(`Delete collection "${col.name}"?`)) {
                              onDeleteCollection(col.id);
                            }
                          }}
                          className="p-1.5 rounded text-[#9ab] hover:text-red-400 hover:bg-red-500/10 transition-colors"
                          title="Delete collection"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 3. CREATE / EDIT COLLECTION MODAL */}
      {/* ========================================================= */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-hidden">
          <div className="bg-[#181e24] border border-[#2c3440] rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-[#2c3440] bg-[#14181c]">
              <div className="flex items-center gap-2.5">
                <div 
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-white"
                  style={{ backgroundColor: formThemeColor }}
                >
                  {renderIcon(formIcon, 'w-4 h-4 text-white')}
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-black text-white uppercase tracking-wider">
                    {editingCollection ? 'Edit Collection' : 'Create Custom Themed Collection'}
                  </h2>
                  <p className="text-[11px] text-[#9ab] font-mono">
                    Unique cover art, custom descriptions, and palette styling
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1.5 text-[#678] hover:text-white rounded-lg hover:bg-[#202830] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form Content */}
            <form onSubmit={handleSaveCollection} className="p-5 sm:p-6 space-y-6 overflow-y-auto flex-1 custom-scrollbar">
              {/* Quick Template Selector if creating new */}
              {!editingCollection && (
                <div className="space-y-2">
                  <div className="text-xs font-mono uppercase text-[#9ab] flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#00e054]" />
                    <span>Choose a Theme Starter or Build from Scratch:</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {TEMPLATE_PRESETS.slice(0, 3).map((p) => (
                      <button
                        key={p.name}
                        type="button"
                        onClick={() => handleApplyPreset(p)}
                        className={`p-2.5 rounded-lg border text-left text-xs font-mono transition-all flex items-center gap-2 ${
                          formName === p.name 
                            ? 'bg-[#202830] border-[#00e054] text-white shadow-sm' 
                            : 'bg-[#14181c] border-[#2c3440] text-[#9ab] hover:border-[#678]'
                        }`}
                      >
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: p.themeColor }} />
                        <span className="truncate font-bold">{p.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Title & Description Fields */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-[#9ab] mb-1.5">
                    Collection Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Finished, Backlog, All-Time Favorites, Cozy Weekend..."
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full bg-[#14181c] border border-[#2c3440] focus:border-[#00e054] rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-[#9ab] mb-1.5">
                    Description & Theme Story
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Describe what binds these games together (e.g. Completed games, prioritized backlog queue, defining favorites)..."
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    className="w-full bg-[#14181c] border border-[#2c3440] focus:border-[#00e054] rounded-lg px-3.5 py-2 text-sm text-white focus:outline-none resize-none"
                  />
                </div>
              </div>

              {/* Unique Cover Art Selector */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-mono uppercase tracking-wider text-[#9ab] flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-[#40bcf4]" />
                    <span>Unique Cover Art</span>
                  </label>

                  {/* Tabs */}
                  <div className="flex items-center gap-1 bg-[#14181c] p-1 rounded-lg border border-[#2c3440] text-[11px] font-mono">
                    <button
                      type="button"
                      onClick={() => setCoverArtTab('presets')}
                      className={`px-2.5 py-1 rounded ${coverArtTab === 'presets' ? 'bg-[#202830] text-[#00e054]' : 'text-[#678] hover:text-white'}`}
                    >
                      Curated Art
                    </button>
                    <button
                      type="button"
                      onClick={() => setCoverArtTab('games')}
                      className={`px-2.5 py-1 rounded ${coverArtTab === 'games' ? 'bg-[#202830] text-[#00e054]' : 'text-[#678] hover:text-white'}`}
                    >
                      Game Backdrops
                    </button>
                    <button
                      type="button"
                      onClick={() => setCoverArtTab('custom')}
                      className={`px-2.5 py-1 rounded ${coverArtTab === 'custom' ? 'bg-[#202830] text-[#00e054]' : 'text-[#678] hover:text-white'}`}
                    >
                      Custom URL
                    </button>
                  </div>
                </div>

                {/* Tab: Curated Presets */}
                {coverArtTab === 'presets' && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {CURATED_COVER_ARTS.map((art) => (
                      <button
                        key={art.id}
                        type="button"
                        onClick={() => setFormCoverArtUrl(art.url)}
                        className={`group relative aspect-[16/9] rounded-lg overflow-hidden border-2 transition-all ${
                          formCoverArtUrl === art.url ? 'border-[#00e054] shadow-[0_0_10px_rgba(0,224,84,0.4)]' : 'border-[#2c3440] hover:border-[#678]'
                        }`}
                      >
                        <img
                          src={art.url}
                          alt={art.label}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                        <span className="absolute bottom-1 left-1.5 right-1.5 text-[10px] font-mono text-white truncate text-left">
                          {art.label}
                        </span>
                        {formCoverArtUrl === art.url && (
                          <div className="absolute top-1 right-1 bg-[#00e054] text-black w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold">
                            ✓
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                )}

                {/* Tab: Game Backdrops */}
                {coverArtTab === 'games' && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 max-h-48 overflow-y-auto p-1 custom-scrollbar">
                    {safeGames.slice(0, 12).map((g) => (
                      <button
                        key={g.id}
                        type="button"
                        onClick={() => setFormCoverArtUrl(g.backdropUrl || g.coverUrl)}
                        className={`group relative aspect-[16/9] rounded-lg overflow-hidden border-2 transition-all ${
                          formCoverArtUrl === (g.backdropUrl || g.coverUrl)
                            ? 'border-[#00e054] shadow-[0_0_10px_rgba(0,224,84,0.4)]'
                            : 'border-[#2c3440] hover:border-[#678]'
                        }`}
                      >
                        <img
                          src={g.backdropUrl || g.coverUrl}
                          alt={g.title}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                        <span className="absolute bottom-1 left-1.5 right-1.5 text-[10px] font-mono text-white truncate text-left">
                          {g.title}
                        </span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Tab: Custom Image URL */}
                {coverArtTab === 'custom' && (
                  <div className="space-y-2">
                    <input
                      type="url"
                      placeholder="Paste image URL (https://...)"
                      value={formCoverArtUrl}
                      onChange={(e) => setFormCoverArtUrl(e.target.value)}
                      className="w-full bg-[#14181c] border border-[#2c3440] focus:border-[#00e054] rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                    />
                    {formCoverArtUrl && (
                      <div className="aspect-[21/9] w-full max-w-sm rounded-lg overflow-hidden border border-[#2c3440] bg-[#14181c]">
                        <img
                          src={formCoverArtUrl}
                          alt="Cover Art Preview"
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = CURATED_COVER_ARTS[0].url;
                          }}
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Theme Color & Icon Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Accent Color */}
                <div className="space-y-2">
                  <label className="block text-xs font-mono uppercase tracking-wider text-[#9ab]">
                    Accent Theme Color
                  </label>
                  <div className="flex items-center gap-2">
                    {THEME_COLORS.map((col) => (
                      <button
                        key={col.hex}
                        type="button"
                        onClick={() => setFormThemeColor(col.hex)}
                        className={`w-7 h-7 rounded-full transition-transform ${
                          formThemeColor === col.hex ? 'scale-125 ring-2 ring-white shadow-lg' : 'hover:scale-110 opacity-70 hover:opacity-100'
                        }`}
                        style={{ backgroundColor: col.hex }}
                        title={col.name}
                      />
                    ))}
                  </div>
                </div>

                {/* Icon Selector */}
                <div className="space-y-2">
                  <label className="block text-xs font-mono uppercase tracking-wider text-[#9ab]">
                    Collection Icon
                  </label>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {AVAILABLE_ICONS.map((ic) => (
                      <button
                        key={ic.id}
                        type="button"
                        onClick={() => setFormIcon(ic.id)}
                        className={`p-2 rounded-lg border transition-all ${
                          formIcon === ic.id 
                            ? 'bg-[#202830] border-[#00e054] text-[#00e054]' 
                            : 'bg-[#14181c] border-[#2c3440] text-[#678] hover:text-white'
                        }`}
                        title={ic.label}
                      >
                        {renderIcon(ic.id, 'w-4 h-4')}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Game Selector (Add / Remove games directly in form) */}
              <div className="space-y-3 pt-2 border-t border-[#2c3440]">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-mono uppercase tracking-wider text-[#9ab] flex items-center gap-2">
                    <span>Select Games for this Collection</span>
                    <span className="text-[#00e054] font-bold">({formSelectedGameIds.length} selected)</span>
                  </label>
                </div>

                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-[#678] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search game catalog to include..."
                    value={gamePickerSearch}
                    onChange={(e) => setGamePickerSearch(e.target.value)}
                    className="w-full bg-[#14181c] border border-[#2c3440] rounded-lg pl-8 pr-3 py-1.5 text-xs text-white focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1 custom-scrollbar">
                  {safeGames
                    .filter(g => !gamePickerSearch.trim() || g.title.toLowerCase().includes(gamePickerSearch.toLowerCase()))
                    .map((g) => {
                      const isSelected = formSelectedGameIds.includes(g.id);
                      return (
                        <div
                          key={g.id}
                          onClick={() => handleToggleGame(g.id)}
                          className={`flex items-center gap-2.5 p-2 rounded-lg border cursor-pointer transition-all ${
                            isSelected 
                              ? 'bg-[#202830] border-[#00e054] text-white' 
                              : 'bg-[#14181c] border-[#2c3440] text-[#9ab] hover:border-[#678]'
                          }`}
                        >
                          <img
                            src={g.coverUrl}
                            alt={g.title}
                            referrerPolicy="no-referrer"
                            className="w-8 h-11 object-cover rounded shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-bold truncate text-white">{g.title}</div>
                            <div className="text-[10px] font-mono text-[#678]">
                              {g.releaseYear} · {g.genres[0]}
                            </div>
                          </div>
                          <div className={`w-5 h-5 rounded flex items-center justify-center shrink-0 ${
                            isSelected ? 'bg-[#00e054] text-black font-bold text-xs' : 'border border-[#2c3440]'
                          }`}>
                            {isSelected && '✓'}
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#2c3440]">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-xs font-mono text-[#9ab] hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!formName.trim()}
                  className="bg-[#00e054] hover:bg-[#00e054]/90 disabled:opacity-50 text-[#14181c] font-black uppercase text-xs tracking-wider px-5 py-2.5 rounded-lg shadow active:scale-95 transition-all"
                >
                  {editingCollection ? 'Save Collection Changes' : 'Create Collection'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 4. QUICK ADD GAMES MODAL (Inside Collection Detail) */}
      {/* ========================================================= */}
      {isAddGamesModalOpen && activeCollection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#181e24] border border-[#2c3440] rounded-2xl w-full max-w-lg max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-[#2c3440] bg-[#14181c] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Plus className="w-4 h-4 text-[#00e054]" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Add Games to "{activeCollection.name}"
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddGamesModalOpen(false)}
                className="text-[#678] hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 flex-1 overflow-y-auto space-y-2 custom-scrollbar">
              {safeGames.map((g) => {
                const isInCollection = activeCollection.gameIds.includes(g.id);
                return (
                  <div
                    key={g.id}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-[#14181c] border border-[#2c3440] hover:border-[#678]"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={g.coverUrl}
                        alt={g.title}
                        referrerPolicy="no-referrer"
                        className="w-9 h-12 rounded object-cover shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-white truncate">{g.title}</div>
                        <div className="text-[10px] font-mono text-[#678]">
                          {g.releaseYear} · {g.genres.slice(0, 2).join(', ')}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        if (isInCollection) {
                          handleRemoveGameFromActive(g.id);
                        } else {
                          handleAddGameToActive(g.id);
                        }
                      }}
                      className={`text-xs font-mono px-3 py-1.5 rounded-lg transition-all ${
                        isInCollection
                          ? 'bg-red-500/15 text-red-400 hover:bg-red-500/25 border border-red-500/30'
                          : 'bg-[#00e054] text-[#14181c] font-bold hover:bg-[#00e054]/90'
                      }`}
                    >
                      {isInCollection ? 'Remove' : 'Add'}
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="p-3 border-t border-[#2c3440] bg-[#14181c] flex justify-end">
              <button
                type="button"
                onClick={() => setIsAddGamesModalOpen(false)}
                className="bg-[#202830] hover:bg-[#2c3440] text-white text-xs font-mono px-4 py-2 rounded-lg"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

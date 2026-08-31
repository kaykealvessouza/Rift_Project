import React from 'react';
import { Layers, Library, Sparkles, FileText, Activity } from 'lucide-react';

interface NavbarProps {
  activeTab: 'catalog' | 'collection' | 'decks' | 'import-export';
  setActiveTab: (tab: 'catalog' | 'collection' | 'decks' | 'import-export') => void;
  collectionCompletion: number | null;
  totalDecks: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  collectionCompletion,
  totalDecks
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Brand Logo & Info */}
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-white font-bold shadow-sm ring-1 ring-indigo-500/30">
            <span>R</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold tracking-tight text-slate-900">Rift</span>
              <span className="text-sm font-normal text-slate-400">| Deck Architect</span>
            </div>
            <p className="text-[11px] text-slate-500">Riftbound TCG Deck & Collection Manager</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 sm:gap-2">
          <button
            id="nav-tab-catalog"
            onClick={() => setActiveTab('catalog')}
            className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition-all ${
              activeTab === 'catalog'
                ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-xs font-semibold'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Library className="h-4 w-4" />
            <span>Catálogo</span>
          </button>

          <button
            id="nav-tab-collection"
            onClick={() => setActiveTab('collection')}
            className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition-all ${
              activeTab === 'collection'
                ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-xs font-semibold'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Layers className="h-4 w-4" />
            <span>Coleção</span>
            {collectionCompletion !== null && (
              <span className="ml-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-indigo-600 border border-slate-200">
                {collectionCompletion}%
              </span>
            )}
          </button>

          <button
            id="nav-tab-decks"
            onClick={() => setActiveTab('decks')}
            className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition-all ${
              activeTab === 'decks'
                ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-xs font-semibold'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Sparkles className="h-4 w-4" />
            <span>Decks</span>
            <span className="ml-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700 border border-slate-200">
              {totalDecks}
            </span>
          </button>

          <button
            id="nav-tab-import-export"
            onClick={() => setActiveTab('import-export')}
            className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition-all ${
              activeTab === 'import-export'
                ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-xs font-semibold'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <FileText className="h-4 w-4" />
            <span>Import / Export</span>
          </button>
        </nav>

        {/* Backend REST Status */}
        <div className="hidden items-center gap-2 md:flex">
          <div className="flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <Activity className="h-3.5 w-3.5 text-emerald-600" />
            <span>Backend Sincronizado</span>
          </div>
        </div>
      </div>
    </header>
  );
};

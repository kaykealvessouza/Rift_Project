import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/common/Navbar.js';
import { CatalogView } from './components/catalog/CatalogView.js';
import { CollectionView } from './components/collection/CollectionView.js';
import { DeckListView } from './components/decks/DeckListView.js';
import { DeckDetailView } from './components/decks/DeckDetailView.js';
import { ImportExportView } from './components/importExport/ImportExportView.js';
import { collectionApi, decksApi } from './api/index.js';
import { CheckCircle2, XCircle, Info, X } from 'lucide-react';

interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

export default function App() {
  const [activeTab, setActiveTab] = useState<'catalog' | 'collection' | 'decks' | 'import-export'>('catalog');
  const [selectedDeckId, setSelectedDeckId] = useState<number | null>(null);
  
  // Header global metrics
  const [collectionCompletion, setCollectionCompletion] = useState<number | null>(null);
  const [totalDecks, setTotalDecks] = useState<number>(0);

  // Toast Notifications
  const [toasts, setToasts] = useState<Toast[]>([]);

  const notify = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = (id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Global metrics sync
  const refreshGlobalMetrics = useCallback(async () => {
    try {
      const [comp, decks] = await Promise.all([
        collectionApi.getCompletion(),
        decksApi.getDecks()
      ]);
      setCollectionCompletion(comp.percentage);
      setTotalDecks(decks.length);
    } catch {
      // Ignora erro inicial de carregamento
    }
  }, []);

  useEffect(() => {
    refreshGlobalMetrics();
  }, [refreshGlobalMetrics]);

  // Tab change handler
  const handleTabChange = (tab: 'catalog' | 'collection' | 'decks' | 'import-export') => {
    setActiveTab(tab);
    if (tab !== 'decks') {
      setSelectedDeckId(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-600 selection:text-white flex flex-col">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        collectionCompletion={collectionCompletion}
        totalDecks={totalDecks}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-16 pt-2">
        {activeTab === 'catalog' && (
          <CatalogView
            onCollectionUpdated={refreshGlobalMetrics}
            notify={notify}
          />
        )}

        {activeTab === 'collection' && (
          <CollectionView
            onCollectionUpdated={refreshGlobalMetrics}
            notify={notify}
          />
        )}

        {activeTab === 'decks' && (
          <>
            {selectedDeckId !== null ? (
              <DeckDetailView
                deckId={selectedDeckId}
                onBack={() => {
                  setSelectedDeckId(null);
                  refreshGlobalMetrics();
                }}
                onCollectionUpdated={refreshGlobalMetrics}
                notify={notify}
              />
            ) : (
              <DeckListView
                onSelectDeck={(id) => setSelectedDeckId(id)}
                notify={notify}
              />
            )}
          </>
        )}

        {activeTab === 'import-export' && (
          <ImportExportView
            onCollectionUpdated={refreshGlobalMetrics}
            notify={notify}
          />
        )}
      </main>

      {/* Floating Toast Notification Container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 rounded-xl border p-3.5 shadow-xl transition-all duration-300 bg-white ${
              toast.type === 'success'
                ? 'border-emerald-200 text-slate-800 ring-1 ring-emerald-100'
                : toast.type === 'error'
                ? 'border-rose-200 text-slate-800 ring-1 ring-rose-100'
                : 'border-indigo-200 text-slate-800 ring-1 ring-indigo-100'
            }`}
          >
            {toast.type === 'success' && <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />}
            {toast.type === 'error' && <XCircle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />}
            {toast.type === 'info' && <Info className="h-5 w-5 text-indigo-600 shrink-0 mt-0.5" />}

            <p className="flex-1 text-xs font-medium leading-relaxed">{toast.message}</p>

            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-slate-700 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

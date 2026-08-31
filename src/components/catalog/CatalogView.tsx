import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardFilterParams } from '../../types/index.js';
import { cardsApi, collectionApi } from '../../api/index.js';
import { CardCard } from './CardCard.js';
import { CardDetailModal } from './CardDetailModal.js';
import { Search, Filter, RefreshCw, X, ChevronLeft, ChevronRight, SlidersHorizontal, CloudDownload, Zap } from 'lucide-react';

interface CatalogViewProps {
  onCollectionUpdated?: () => void;
  notify?: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

const FACTIONS = ['Fury', 'Calm', 'Mind', 'Body', 'Chaos', 'Order', 'Colorless'];
const TYPES = ['UNIT', 'SPELL', 'RUNE', 'GEAR', 'LEGEND', 'CHAMPION', 'BATTLEFIELD'];
const RARITIES = ['COMMON', 'UNCOMMON', 'RARE', 'EPIC', 'SHOWCASE', 'LEGENDARY'];

export const CatalogView: React.FC<CatalogViewProps> = ({ onCollectionUpdated, notify }) => {
  const [allCatalogCards, setAllCatalogCards] = useState<Card[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(12);
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  // Filters state
  const [searchName, setSearchName] = useState('');
  const [selectedFaction, setSelectedFaction] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedRarity, setSelectedRarity] = useState<string>('');
  const [maxEnergy, setMaxEnergy] = useState<number | ''>('');
  const [minMight, setMinMight] = useState<number | ''>('');
  const [filterBanned, setFilterBanned] = useState<string>('all'); // 'all', 'banned', 'legal'

  // Collection quantities cache (cardId -> quantity)
  const [ownedQuantities, setOwnedQuantities] = useState<Record<string, number>>({});

  // Modal State
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [showFiltersMobile, setShowFiltersMobile] = useState(false);

  // Initial load: Preload all cards from memory cache + load collection quantities
  const loadInitialData = useCallback(async (forceRefresh = false) => {
    try {
      if (forceRefresh) setLoading(true);
      const [cards, collection] = await Promise.all([
        cardsApi.getAllCards(forceRefresh),
        collectionApi.getCollection().catch(() => [])
      ]);

      setAllCatalogCards(cards);

      const map: Record<string, number> = {};
      for (const item of collection) {
        map[item.card.id] = item.quantity;
      }
      setOwnedQuantities(map);
    } catch (err: any) {
      if (notify) notify(err.message || 'Erro ao carregar catálogo.', 'error');
    } finally {
      setLoading(false);
    }
  }, [notify]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // Instant in-memory filtering (Zero Network Latency)
  const filteredCards = useMemo(() => {
    const filters: CardFilterParams = {
      name: searchName.trim() || undefined,
      faction: selectedFaction || undefined,
      type: selectedType || undefined,
      rarity: selectedRarity || undefined,
      maxEnergy: maxEnergy !== '' ? Number(maxEnergy) : undefined,
      minMight: minMight !== '' ? Number(minMight) : undefined,
      banned: filterBanned === 'banned' ? true : filterBanned === 'legal' ? false : undefined
    };

    return cardsApi.filterCardsInMemory(allCatalogCards, filters);
  }, [allCatalogCards, searchName, selectedFaction, selectedType, selectedRarity, maxEnergy, minMight, filterBanned]);

  // Instant pagination calculation
  const totalCards = filteredCards.length;
  const totalPages = Math.max(1, Math.ceil(totalCards / pageSize));
  
  const currentCards = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredCards.slice(start, start + pageSize);
  }, [filteredCards, page, pageSize]);

  // Reset to page 1 if current page is out of bounds
  useEffect(() => {
    if (page > totalPages && totalPages > 0) {
      setPage(1);
    }
  }, [page, totalPages]);

  // Optimistic Quick Add to Collection
  const handleQuickAdd = async (card: Card) => {
    // Immediate UI update
    setOwnedQuantities((prev) => ({
      ...prev,
      [card.id]: (prev[card.id] || 0) + 1
    }));
    if (notify) notify(`+1 "${card.name}" adicionada à coleção!`, 'success');
    if (onCollectionUpdated) onCollectionUpdated();

    try {
      await collectionApi.addCard(card.id, 1);
    } catch (err: any) {
      // Revert on error
      setOwnedQuantities((prev) => ({
        ...prev,
        [card.id]: Math.max(0, (prev[card.id] || 1) - 1)
      }));
      if (notify) notify(err.message || 'Erro ao sincronizar com servidor.', 'error');
    }
  };

  // Modal Handlers with Optimistic Updates
  const handleModalAdd = async (cardId: string, qty: number) => {
    setOwnedQuantities((prev) => ({
      ...prev,
      [cardId]: (prev[cardId] || 0) + qty
    }));
    if (notify) notify('Quantidade adicionada com sucesso!', 'success');
    if (onCollectionUpdated) onCollectionUpdated();

    try {
      await collectionApi.addCard(cardId, qty);
    } catch (err: any) {
      if (notify) notify(err.message || 'Erro ao adicionar no servidor.', 'error');
    }
  };

  const handleModalDecrease = async (cardId: string, qty: number) => {
    setOwnedQuantities((prev) => ({
      ...prev,
      [cardId]: Math.max(0, (prev[cardId] || 0) - qty)
    }));
    if (notify) notify('Quantidade diminuída com sucesso.', 'info');
    if (onCollectionUpdated) onCollectionUpdated();

    try {
      await collectionApi.decreaseCard(cardId, qty);
    } catch (err: any) {
      if (notify) notify(err.message || 'Erro ao atualizar no servidor.', 'error');
    }
  };

  const handleModalDelete = async (cardId: string) => {
    setOwnedQuantities((prev) => {
      const copy = { ...prev };
      delete copy[cardId];
      return copy;
    });
    if (notify) notify('Carta removida da coleção.', 'info');
    if (onCollectionUpdated) onCollectionUpdated();

    try {
      await collectionApi.deleteCard(cardId);
    } catch (err: any) {
      if (notify) notify(err.message || 'Erro ao remover no servidor.', 'error');
    }
  };

  const clearAllFilters = () => {
    setSearchName('');
    setSelectedFaction('');
    setSelectedType('');
    setSelectedRarity('');
    setMaxEnergy('');
    setMinMight('');
    setFilterBanned('all');
    setPage(1);
  };

  const handleSyncApi = async () => {
    try {
      setIsSyncing(true);
      if (notify) notify('Sincronizando com a API oficial RiftScribe...', 'info');
      const res = await cardsApi.syncCards();
      if (notify) notify(`Sincronização concluída! ${res.totalCards} cartas carregadas.`, 'success');
      await loadInitialData(true);
    } catch (err: any) {
      if (notify) notify(err.message || 'Erro ao sincronizar com a API.', 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  const hasActiveFilters =
    Boolean(searchName) ||
    Boolean(selectedFaction) ||
    Boolean(selectedType) ||
    Boolean(selectedRarity) ||
    maxEnergy !== '' ||
    minMight !== '' ||
    filterBanned !== 'all';

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      {/* Header section */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Catálogo de Cartas
          </h1>
          <p className="text-sm text-slate-500">
            Explore as cartas de Riftbound ({totalCards} {totalCards === 1 ? 'encontrada' : 'encontradas'}). Cache instantâneo ativo.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick Search */}
          <div className="relative flex-1 sm:w-72">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              id="catalog-search-input"
              type="text"
              placeholder="Buscar pelo nome..."
              value={searchName}
              onChange={(e) => {
                setSearchName(e.target.value);
                setPage(1);
              }}
              className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-8 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-xs"
            />
            {searchName && (
              <button
                onClick={() => {
                  setSearchName('');
                  setPage(1);
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <button
            onClick={() => setShowFiltersMobile(!showFiltersMobile)}
            className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition-colors shadow-xs ${
              hasActiveFilters
                ? 'border-indigo-300 bg-indigo-50 text-indigo-700'
                : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <SlidersHorizontal className="h-4 w-4" />
            <span className="hidden sm:inline">Filtros</span>
            {hasActiveFilters && (
              <span className="h-2 w-2 rounded-full bg-indigo-600"></span>
            )}
          </button>

          <button
            title="Sincronizar com a API oficial RiftScribe (https://riftscribe.gg/api)"
            onClick={handleSyncApi}
            disabled={isSyncing}
            className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-indigo-600 disabled:opacity-50 transition-colors shadow-xs"
          >
            <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin text-indigo-600' : ''}`} />
            <span className="hidden md:inline">Sincronizar</span>
          </button>
        </div>
      </div>

      {/* Filter Bar (Collapsible on mobile, always visible or toggleable) */}
      <div className={`mt-4 rounded-xl border border-slate-200 bg-white p-4 shadow-xs transition-all ${showFiltersMobile ? 'block' : 'hidden md:block'}`}>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
          {/* Faction Filter */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Facção / Domínio</label>
            <select
              value={selectedFaction}
              onChange={(e) => {
                setSelectedFaction(e.target.value);
                setPage(1);
              }}
              className="w-full rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="">Todas as Facções</option>
              {FACTIONS.map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </div>

          {/* Type Filter */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Tipo de Carta</label>
            <select
              value={selectedType}
              onChange={(e) => {
                setSelectedType(e.target.value);
                setPage(1);
              }}
              className="w-full rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="">Todos os Tipos</option>
              {TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          {/* Rarity Filter */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Raridade</label>
            <select
              value={selectedRarity}
              onChange={(e) => {
                setSelectedRarity(e.target.value);
                setPage(1);
              }}
              className="w-full rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="">Todas as Raridades</option>
              {RARITIES.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          {/* Max Energy Filter */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Energia Máxima</label>
            <input
              type="number"
              min="0"
              max="20"
              placeholder="Ex: 5"
              value={maxEnergy}
              onChange={(e) => {
                setMaxEnergy(e.target.value ? Number(e.target.value) : '');
                setPage(1);
              }}
              className="w-full rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Min Might Filter */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Might Mínimo</label>
            <input
              type="number"
              min="0"
              max="20"
              placeholder="Ex: 3"
              value={minMight}
              onChange={(e) => {
                setMinMight(e.target.value ? Number(e.target.value) : '');
                setPage(1);
              }}
              className="w-full rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Ban Filter */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Status de Ban</label>
            <select
              value={filterBanned}
              onChange={(e) => {
                setFilterBanned(e.target.value);
                setPage(1);
              }}
              className="w-full rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="all">Todas as Cartas</option>
              <option value="legal">Apenas Válidas (Legais)</option>
              <option value="banned">Apenas Banidas</option>
            </select>
          </div>
        </div>

        {hasActiveFilters && (
          <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
            <span className="text-xs text-indigo-600 font-medium">
              Filtros ativos aplicados: {totalCards} cartas encontradas
            </span>
            <button
              onClick={clearAllFilters}
              className="text-xs font-medium text-slate-500 hover:text-rose-600 transition-colors flex items-center gap-1"
            >
              <X className="h-3 w-3" /> Limpar filtros
            </button>
          </div>
        )}
      </div>

      {/* Cards Grid */}
      <div className="mt-6">
        {loading && allCatalogCards.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <RefreshCw className="h-8 w-8 animate-spin text-indigo-600" />
            <p className="mt-3 text-sm text-slate-500 font-medium">Carregando catálogo completo na memória...</p>
          </div>
        ) : currentCards.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white py-16 px-4 text-center">
            <Filter className="h-10 w-10 text-slate-300" />
            <h3 className="mt-3 text-base font-semibold text-slate-800">Nenhuma carta encontrada</h3>
            <p className="mt-1 text-sm text-slate-500 max-w-sm">
              Nenhuma carta corresponde aos critérios de pesquisa selecionados. Tente ajustar os filtros.
            </p>
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="mt-4 rounded-lg bg-indigo-50 px-3.5 py-2 text-xs font-semibold text-indigo-600 hover:bg-indigo-100 transition-colors"
              >
                Redefinir Filtros
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {currentCards.map((card) => (
              <CardCard
                key={card.id}
                card={card}
                ownedQuantity={ownedQuantities[card.id] || 0}
                onSelectCard={(c) => setSelectedCard(c)}
                onQuickAdd={handleQuickAdd}
              />
            ))}
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-slate-200 pt-6 sm:flex-row">
          <p className="text-xs text-slate-500">
            Mostrando <span className="font-semibold text-slate-800">{Math.min((page - 1) * pageSize + 1, totalCards)}</span> até{' '}
            <span className="font-semibold text-slate-800">{Math.min(page * pageSize, totalCards)}</span> de{' '}
            <span className="font-semibold text-slate-800">{totalCards}</span> cartas
          </p>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs"
            >
              <ChevronLeft className="h-3.5 w-3.5" /> Anterior
            </button>

            <span className="px-3 text-xs font-semibold text-slate-700">
              Página {page} de {totalPages}
            </span>

            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs"
            >
              Próxima <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Card Detail Modal */}
      {selectedCard && (
        <CardDetailModal
          card={selectedCard}
          onClose={() => setSelectedCard(null)}
          ownedQuantity={ownedQuantities[selectedCard.id] || 0}
          onAdd={handleModalAdd}
          onDecrease={handleModalDecrease}
          onDelete={handleModalDelete}
        />
      )}
    </div>
  );
};

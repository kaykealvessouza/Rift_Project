import React, { useState, useEffect, useCallback } from 'react';
import { Card, CollectionCard } from '../../types/index.js';
import { collectionApi, cardsApi } from '../../api/index.js';
import { getFactionColor, getRarityBadge, getTypeLabel } from '../../utils/cardUtils.js';
import { CardDetailModal } from '../catalog/CardDetailModal.js';
import { RiftSymbol } from '../common/RiftSymbol.js';
import { Layers, Plus, Minus, Trash2, Search, Sparkles, RefreshCw, ExternalLink } from 'lucide-react';

interface CollectionViewProps {
  onCollectionUpdated?: () => void;
  notify?: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const CollectionView: React.FC<CollectionViewProps> = ({ onCollectionUpdated, notify }) => {
  const [collection, setCollection] = useState<CollectionCard[]>([]);
  const [completionPercentage, setCompletionPercentage] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFaction, setSelectedFaction] = useState('');
  const [selectedCardForModal, setSelectedCardForModal] = useState<Card | null>(null);

  // Quick Add Catalog Selector Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [catalogCards, setCatalogCards] = useState<Card[]>([]);
  const [catalogSearch, setCatalogSearch] = useState('');
  const [addingCardId, setAddingCardId] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [items, comp] = await Promise.all([
        collectionApi.getCollection(),
        collectionApi.getCompletion()
      ]);
      setCollection(items);
      setCompletionPercentage(comp.percentage);
    } catch (err: any) {
      if (notify) notify(err.message || 'Erro ao carregar coleção.', 'error');
    } finally {
      setLoading(false);
    }
  }, [notify]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle quantity changes with optimistic updates
  const handleIncrease = async (cardId: string) => {
    setCollection((prev) =>
      prev.map((item) =>
        item.card.id === cardId ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
    if (onCollectionUpdated) onCollectionUpdated();

    try {
      await collectionApi.addCard(cardId, 1);
    } catch (err: any) {
      await loadData();
      if (notify) notify(err.message || 'Erro ao somar carta.', 'error');
    }
  };

  const handleDecrease = async (cardId: string) => {
    setCollection((prev) =>
      prev
        .map((item) =>
          item.card.id === cardId ? { ...item, quantity: Math.max(0, item.quantity - 1) } : item
        )
        .filter((item) => item.quantity > 0)
    );
    if (onCollectionUpdated) onCollectionUpdated();

    try {
      await collectionApi.decreaseCard(cardId, 1);
    } catch (err: any) {
      await loadData();
      if (notify) notify(err.message || 'Erro ao diminuir carta.', 'error');
    }
  };

  const handleDelete = async (cardId: string) => {
    setCollection((prev) => prev.filter((item) => item.card.id !== cardId));
    if (notify) notify('Carta removida da coleção.', 'info');
    if (onCollectionUpdated) onCollectionUpdated();

    try {
      await collectionApi.deleteCard(cardId);
    } catch (err: any) {
      await loadData();
      if (notify) notify(err.message || 'Erro ao remover carta.', 'error');
    }
  };

  // Open Add Card modal using memory cache
  const openAddCardModal = async () => {
    setShowAddModal(true);
    try {
      const allCards = await cardsApi.getAllCards();
      setCatalogCards(allCards);
    } catch {
      // ignore
    }
  };

  const handleAddFromCatalogModal = async (cardId: string) => {
    setAddingCardId(cardId);
    const cardToAdd = catalogCards.find((c) => c.id === cardId);

    // Optimistic UI update
    if (cardToAdd) {
      setCollection((prev) => {
        const existing = prev.find((item) => item.card.id === cardId);
        if (existing) {
          return prev.map((item) =>
            item.card.id === cardId ? { ...item, quantity: item.quantity + 1 } : item
          );
        } else {
          return [...prev, { card: cardToAdd, quantity: 1, addedAt: new Date().toISOString() }];
        }
      });
    }

    if (notify) notify('Carta adicionada à coleção!', 'success');
    if (onCollectionUpdated) onCollectionUpdated();

    try {
      await collectionApi.addCard(cardId, 1);
    } catch (err: any) {
      await loadData();
      if (notify) notify(err.message || 'Erro ao adicionar.', 'error');
    } finally {
      setAddingCardId(null);
    }
  };

  // Filtered collection
  const filteredCollection = collection.filter((item) => {
    const matchesSearch = item.card.name.toLowerCase().includes(searchTerm.toLowerCase().trim());
    const matchesFaction = selectedFaction ? item.card.faction.toLowerCase() === selectedFaction.toLowerCase() : true;
    return matchesSearch && matchesFaction;
  });

  const totalCopies = collection.reduce((acc, curr) => acc + curr.quantity, 0);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      {/* Top Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Minha Coleção
          </h1>
          <p className="text-sm text-slate-500">
            Gerenciamento de cartas físicas e digitais possuídas para construção de decks.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            id="open-add-to-collection-btn"
            onClick={openAddCardModal}
            className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Adicionar Cartas</span>
          </button>

          <button
            title="Recarregar dados"
            onClick={() => loadData()}
            className="rounded-lg border border-slate-300 bg-white p-2 text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-xs"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin text-indigo-600' : ''}`} />
          </button>
        </div>
      </div>

      {/* Completion Progress Bar & Metrics */}
      <div className="mt-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-indigo-600" />
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-700">
                Progresso de Conclusão do Catálogo
              </span>
            </div>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-3xl font-bold tracking-tight text-slate-900">
                {completionPercentage}%
              </span>
              <span className="text-xs text-slate-500">
                ({collection.length} cartas distintas possuídas)
              </span>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="border-l border-slate-200 pl-4">
              <span className="text-xs font-medium text-slate-500">Total de Cópias</span>
              <p className="text-lg font-bold text-slate-900">{totalCopies} cartas</p>
            </div>
            <div className="border-l border-slate-200 pl-4">
              <span className="text-xs font-medium text-slate-500">Cartas Únicas</span>
              <p className="text-lg font-bold text-indigo-600">{collection.length}</p>
            </div>
          </div>
        </div>

        {/* Visual Progress Bar */}
        <div className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-slate-100 border border-slate-200">
          <div
            className="h-full rounded-full bg-indigo-600 transition-all duration-500"
            style={{ width: `${Math.min(100, Math.max(0, completionPercentage))}%` }}
          />
        </div>
      </div>

      {/* Search and Filters for Collection */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 sm:max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Filtrar coleção por nome..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-4 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-xs"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedFaction}
            onChange={(e) => setSelectedFaction(e.target.value)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-900 focus:border-indigo-500 focus:outline-none shadow-xs"
          >
            <option value="">Todas as Facções (Runas)</option>
            <option value="Fury">🔥 Fury (Fúria)</option>
            <option value="Calm">☀️ Calm (Calmaria)</option>
            <option value="Mind">🌀 Mind (Mente)</option>
            <option value="Body">🌿 Body (Corpo)</option>
            <option value="Chaos">⚡ Chaos (Caos)</option>
            <option value="Order">⚖️ Order (Ordem)</option>
            <option value="Colorless">⚪ Incolor (Colorless)</option>
          </select>
        </div>
      </div>

      {/* Collection List / Grid */}
      <div className="mt-4">
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <RefreshCw className="h-8 w-8 animate-spin text-indigo-600" />
          </div>
        ) : filteredCollection.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center shadow-xs">
            <Layers className="h-10 w-10 text-slate-400 mb-2" />
            <h3 className="text-base font-semibold text-slate-800">
              {collection.length === 0
                ? 'Sua coleção está vazia'
                : 'Nenhuma carta corresponde aos filtros'}
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mt-1">
              Adicione cartas através do catálogo ou importe uma lista na aba Import / Export.
            </p>
            <button
              onClick={openAddCardModal}
              className="mt-4 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-700 transition-colors shadow-xs"
            >
              Navegar no Catálogo
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {filteredCollection.map(({ card, quantity }) => {
              const factionTheme = getFactionColor(card.faction);
              const rarityTheme = getRarityBadge(card.rarity);
              const typeLabel = getTypeLabel(card.type);

              return (
                <div
                  key={card.id}
                  className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-3.5 shadow-xs hover:border-indigo-400 transition-all hover:shadow-lg"
                >
                  {/* Top Bar */}
                  <div>
                    <div className="flex items-start justify-between gap-1.5">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1 flex-wrap">
                          <span className={`rounded-md px-1.5 py-0.5 text-[9px] font-black uppercase border ${factionTheme.badge}`}>
                            {card.faction}
                          </span>
                          <span className={`rounded-md px-1.5 py-0.5 text-[9px] font-semibold ${rarityTheme.bg}`}>
                            {rarityTheme.label}
                          </span>
                        </div>
                        <h4
                          onClick={() => setSelectedCardForModal(card)}
                          className="mt-1.5 cursor-pointer font-black text-sm text-slate-900 hover:text-indigo-600 transition-colors line-clamp-1"
                        >
                          {card.name}
                        </h4>
                        <span className="text-[10px] text-slate-500 font-semibold">{typeLabel}</span>
                      </div>

                      {card.energy !== null && (
                        <RiftSymbol type="energy" value={card.energy} size="sm" className="shrink-0" />
                      )}
                    </div>

                    {/* Thumbnail (Full Portrait, clean without overlay) */}
                    <div
                      onClick={() => setSelectedCardForModal(card)}
                      className="relative mt-2.5 aspect-[3/4] w-full cursor-pointer overflow-hidden rounded-xl bg-slate-900/5 border border-slate-200 flex items-center justify-center"
                    >
                      <img
                        src={card.imageMedium || card.imageSmall || card.imageUrl || ''}
                        alt={card.name}
                        referrerPolicy="no-referrer"
                        className="h-full w-full object-contain transition-transform hover:scale-105"
                      />
                    </div>

                    {/* Stats Bar Below Thumbnail */}
                    <div className="mt-2 flex items-center gap-1.5 min-h-[20px]">
                      {card.might !== null && (
                        <RiftSymbol type="might" value={card.might} size="xs" />
                      )}
                      {card.power !== null && (
                        <RiftSymbol type="power" value={card.power} size="xs" />
                      )}
                    </div>
                  </div>

                  {/* Quantity Stepper & Delete */}
                  <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2.5">
                    <div className="flex items-center gap-1.5">
                      <button
                        title="Diminuir 1 cópia"
                        onClick={() => handleDecrease(card.id)}
                        className="flex h-7 w-7 items-center justify-center rounded-lg bg-white text-slate-700 hover:bg-slate-100 transition-colors border border-slate-300 shadow-2xs"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>

                      <span className="min-w-[2.2rem] text-center font-black text-slate-900 text-xs">
                        {quantity}x
                      </span>

                      <button
                        title="Adicionar 1 cópia"
                        onClick={() => handleIncrease(card.id)}
                        className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-600 hover:text-white transition-colors border border-indigo-200 shadow-2xs"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        title="Ver detalhes"
                        onClick={() => setSelectedCardForModal(card)}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </button>

                      <button
                        title="Remover da coleção"
                        onClick={() => handleDelete(card.id)}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Quick Add from Catalog Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="relative flex max-h-[85vh] w-full max-w-3xl flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-xl font-bold text-slate-900">
                  Adicionar Carta à Coleção
                </h3>
                <p className="text-xs text-slate-500">
                  Selecione qualquer carta do catálogo para incluir no seu acervo.
                </p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="rounded-full bg-slate-100 p-2 text-slate-500 hover:bg-slate-200 hover:text-slate-900 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Modal Search */}
            <div className="mt-4">
              <input
                type="text"
                placeholder="Pesquisar por nome da carta..."
                value={catalogSearch}
                onChange={(e) => setCatalogSearch(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-xs"
              />
            </div>

            {/* Modal Cards Grid */}
            <div className="mt-4 flex-1 overflow-y-auto pr-1">
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                {catalogCards
                  .filter((c) => c.name.toLowerCase().includes(catalogSearch.toLowerCase().trim()))
                  .map((card) => {
                    const factionTheme = getFactionColor(card.faction);
                    const isAdding = addingCardId === card.id;

                    return (
                      <div
                        key={card.id}
                        className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 hover:border-indigo-300 transition-colors"
                      >
                        <div className="flex items-center gap-2.5">
                          <img
                            src={card.imageUrl || card.imageSmall || ''}
                            alt={card.name}
                            referrerPolicy="no-referrer"
                            className="h-11 w-11 rounded-lg object-cover border border-slate-200 shrink-0"
                          />
                          <div>
                            <div className="flex items-center gap-1">
                              <span className={`rounded px-1 py-0.2 text-[8px] font-bold uppercase border ${factionTheme.badge}`}>
                                {card.faction}
                              </span>
                              <span className="text-[10px] text-slate-500">{getTypeLabel(card.type)}</span>
                            </div>
                            <h5 className="text-xs font-bold text-slate-900 line-clamp-1">{card.name}</h5>
                          </div>
                        </div>

                        <button
                          disabled={isAdding}
                          onClick={() => handleAddFromCatalogModal(card.id)}
                          className="flex items-center gap-1 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-indigo-700 transition-colors shrink-0 disabled:opacity-50 shadow-xs"
                        >
                          <Plus className="h-3.5 w-3.5" />
                          <span>Adicionar</span>
                        </button>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Card Detail Modal */}
      {selectedCardForModal && (
        <CardDetailModal
          card={selectedCardForModal}
          ownedQuantity={
            collection.find((c) => c.card.id === selectedCardForModal.id)?.quantity || 0
          }
          onClose={() => setSelectedCardForModal(null)}
          onAdd={async (id, qty) => {
            await collectionApi.addCard(id, qty);
            await loadData();
            if (onCollectionUpdated) onCollectionUpdated();
          }}
          onDecrease={async (id, qty) => {
            await collectionApi.decreaseCard(id, qty);
            await loadData();
            if (onCollectionUpdated) onCollectionUpdated();
          }}
          onDelete={async (id) => {
            await collectionApi.deleteCard(id);
            await loadData();
            setSelectedCardForModal(null);
            if (onCollectionUpdated) onCollectionUpdated();
          }}
        />
      )}
    </div>
  );
};

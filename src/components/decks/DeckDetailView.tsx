import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardZone, Deck, DeckCard, DeckValidationResult, VALID_ZONES } from '../../types/index.js';
import { decksApi, cardsApi, collectionApi, importExportApi } from '../../api/index.js';
import { getFactionColor, getRarityBadge, getTypeLabel } from '../../utils/cardUtils.js';
import { renderCardDescription } from '../../utils/textUtils.js';
import { RiftSymbol } from '../common/RiftSymbol.js';
import { CardDetailModal } from '../catalog/CardDetailModal.js';
import {
  ArrowLeft,
  Plus,
  Minus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FileDown,
  Copy,
  Sparkles,
  RefreshCw,
  Search,
  Zap,
  Swords,
  Shield,
  Layers,
  Check
} from 'lucide-react';

interface DeckDetailViewProps {
  deckId: number;
  onBack: () => void;
  onCollectionUpdated?: () => void;
  notify?: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const DeckDetailView: React.FC<DeckDetailViewProps> = ({
  deckId,
  onBack,
  onCollectionUpdated,
  notify
}) => {
  const [deck, setDeck] = useState<Deck | null>(null);
  const [deckCards, setDeckCards] = useState<DeckCard[]>([]);
  const [validation, setValidation] = useState<DeckValidationResult | null>(null);
  const [missingCards, setMissingCards] = useState<Record<string, number>>({});
  const [completion, setCompletion] = useState<number>(0);
  const [allCatalogCards, setAllCatalogCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'zones' | 'validation' | 'missing' | 'export'>('zones');

  // Selected Zone filter for zones view
  const [selectedZoneFilter, setSelectedZoneFilter] = useState<CardZone | 'ALL'>('ALL');

  // Add Card to Deck Modal
  const [showAddCardModal, setShowAddCardModal] = useState(false);
  const [modalSearch, setModalSearch] = useState('');
  const [modalZone, setModalZone] = useState<CardZone>('MAIN');
  const [modalQuantity, setModalQuantity] = useState<number>(1);
  const [addingCardId, setAddingCardId] = useState<string | null>(null);

  // Card detail modal
  const [cardModalData, setCardModalData] = useState<Card | null>(null);
  const [cardModalOwned, setCardModalOwned] = useState<number>(0);

  // Export state
  const [exportedText, setExportedText] = useState<string>('');
  const [copiedExport, setCopiedExport] = useState(false);

  // Lightweight refresh of deck cards and validation
  const refreshDeckState = useCallback(async () => {
    try {
      const [cards, valid, missing, comp] = await Promise.all([
        decksApi.getDeckCards(deckId),
        decksApi.validateDeck(deckId),
        decksApi.getMissingCards(deckId),
        decksApi.getDeckCompletion(deckId)
      ]);
      setDeckCards(cards);
      setValidation(valid);
      setMissingCards(missing);
      setCompletion(comp.percentage);
    } catch {
      // ignore
    }
  }, [deckId]);

  // Initial load all deck data
  const loadDeckData = useCallback(async () => {
    setLoading(true);
    try {
      const [decks, cards, valid, missing, comp, catalog] = await Promise.all([
        decksApi.getDecks(),
        decksApi.getDeckCards(deckId),
        decksApi.validateDeck(deckId),
        decksApi.getMissingCards(deckId),
        decksApi.getDeckCompletion(deckId),
        cardsApi.getAllCards()
      ]);

      const currentDeck = decks.find((d) => d.id === deckId);
      if (!currentDeck) {
        if (notify) notify('Deck não encontrado.', 'error');
        onBack();
        return;
      }

      setDeck(currentDeck);
      setDeckCards(cards);
      setValidation(valid);
      setMissingCards(missing);
      setCompletion(comp.percentage);
      setAllCatalogCards(catalog);
    } catch (err: any) {
      if (notify) notify(err.message || 'Erro ao carregar deck.', 'error');
    } finally {
      setLoading(false);
    }
  }, [deckId, onBack, notify]);

  useEffect(() => {
    loadDeckData();
  }, [loadDeckData]);

  // Handle Add Card to Deck with optimistic updates
  const handleAddCardToDeck = async (cardId: string) => {
    setAddingCardId(cardId);
    const cardData = allCatalogCards.find((c) => c.id === cardId);

    // Optimistic UI update
    if (cardData) {
      setDeckCards((prev) => {
        const existingIdx = prev.findIndex((item) => item.card.id === cardId && item.zone === modalZone);
        if (existingIdx !== -1) {
          const updated = [...prev];
          updated[existingIdx] = {
            ...updated[existingIdx],
            quantity: updated[existingIdx].quantity + modalQuantity
          };
          return updated;
        } else {
          return [...prev, { card: cardData, quantity: modalQuantity, zone: modalZone }];
        }
      });
    }

    if (notify) notify('Carta adicionada à zona com sucesso!', 'success');

    try {
      await decksApi.addCardToDeck(deckId, cardId, modalQuantity, modalZone);
      refreshDeckState();
    } catch (err: any) {
      if (notify) notify(err.message || 'Erro ao adicionar carta ao deck.', 'error');
      refreshDeckState();
    } finally {
      setAddingCardId(null);
    }
  };

  // Handle Decrease Card with optimistic updates
  const handleDecreaseCard = async (cardId: string) => {
    setDeckCards((prev) =>
      prev
        .map((item) =>
          item.card.id === cardId ? { ...item, quantity: Math.max(0, item.quantity - 1) } : item
        )
        .filter((item) => item.quantity > 0)
    );

    try {
      await decksApi.decreaseCardInDeck(deckId, cardId, 1);
      refreshDeckState();
    } catch (err: any) {
      if (notify) notify(err.message || 'Erro ao diminuir quantidade.', 'error');
      refreshDeckState();
    }
  };

  // Handle Remove Card with optimistic updates
  const handleRemoveCard = async (cardId: string) => {
    setDeckCards((prev) => prev.filter((item) => item.card.id !== cardId));
    if (notify) notify('Carta removida do deck.', 'info');

    try {
      await decksApi.deleteCardFromDeck(deckId, cardId);
      refreshDeckState();
    } catch (err: any) {
      if (notify) notify(err.message || 'Erro ao remover carta.', 'error');
      refreshDeckState();
    }
  };

  // Quick add missing card to player collection
  const handleAddMissingToCollection = async (cardId: string, qty: number) => {
    try {
      await collectionApi.addCard(cardId, qty);
      if (notify) notify(`+${qty} cópias adicionadas à sua coleção!`, 'success');
      if (onCollectionUpdated) onCollectionUpdated();
      refreshDeckState();
    } catch (err: any) {
      if (notify) notify(err.message || 'Erro ao adicionar à coleção.', 'error');
    }
  };

  // Handle Export Deck
  const handleLoadExport = async () => {
    try {
      const res = await importExportApi.exportDeck(deckId);
      setExportedText(res.text);
      setActiveTab('export');
    } catch (err: any) {
      if (notify) notify(err.message || 'Erro ao exportar deck.', 'error');
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(exportedText);
    setCopiedExport(true);
    setTimeout(() => setCopiedExport(false), 2000);
    if (notify) notify('Deck copiado para a área de transferência!', 'success');
  };

  const downloadExportTxt = () => {
    const element = document.createElement('a');
    const file = new Blob([exportedText], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = `${deck?.name.toLowerCase().replace(/\s+/g, '_') || 'deck'}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // Zone counts calculation
  const zoneCounts: Record<CardZone, number> = {
    LEGEND: 0,
    CHAMPION: 0,
    MAIN: 0,
    RUNE: 0,
    BATTLEFIELD: 0,
    SIDEBOARD: 0,
    SIDEBOARD_BATTLEFIELD: 0
  };

  for (const card of deckCards) {
    if (zoneCounts[card.zone] !== undefined) {
      zoneCounts[card.zone] += card.quantity;
    }
  }

  const totalCards = deckCards.reduce((acc, curr) => acc + curr.quantity, 0);
  const totalMissingCount: number = (Object.values(missingCards) as number[]).reduce((acc: number, curr: number) => acc + curr, 0);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      {/* Top Navigation Bar */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <button
            id="back-to-decks-btn"
            onClick={onBack}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-xs"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-slate-400">DECK #{deckId}</span>
              {validation?.valid ? (
                <span className="flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700">
                  <CheckCircle2 className="h-3 w-3 text-emerald-600" /> Deck Válido
                </span>
              ) : (
                <span className="flex items-center gap-1 rounded-full bg-rose-50 border border-rose-200 px-2.5 py-0.5 text-[11px] font-bold text-rose-700">
                  <XCircle className="h-3 w-3 text-rose-600" /> {(validation?.errors || []).length} Erros de Validação
                </span>
              )}
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              {deck?.name}
            </h1>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            id="deck-add-card-btn"
            onClick={() => {
              setModalZone('MAIN');
              setModalQuantity(1);
              setShowAddCardModal(true);
            }}
            className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-indigo-700 transition-colors shadow-sm"
          >
            <Plus className="h-4 w-4" />
            <span>Adicionar Carta</span>
          </button>

          <button
            onClick={handleLoadExport}
            className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-xs"
          >
            <FileDown className="h-4 w-4" />
            <span>Exportar</span>
          </button>

          <button
            title="Atualizar dados"
            onClick={() => loadDeckData()}
            className="rounded-lg border border-slate-300 bg-white p-2 text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-xs"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin text-indigo-600' : ''}`} />
          </button>
        </div>
      </div>

      {/* Stats and Completion Overview Banner */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {/* Card Count */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total de Cartas</span>
          <p className="mt-1 text-2xl font-bold text-slate-900">{totalCards} cartas</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Espalhadas em 7 zonas oficiais</p>
        </div>

        {/* Collection Completion % */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Na Coleção</span>
            <span className="text-xs font-bold text-indigo-600">{completion}%</span>
          </div>
          <p className="mt-1 text-2xl font-bold text-slate-900">{completion}% completo</p>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100 border border-slate-200">
            <div
              className="h-full rounded-full bg-indigo-600 transition-all duration-300"
              style={{ width: `${Math.min(100, Math.max(0, completion))}%` }}
            />
          </div>
        </div>

        {/* Missing Cards Status */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Cartas Faltantes</span>
          <p className="mt-1 text-2xl font-bold text-slate-900">
            {totalMissingCount > 0 ? (
              <span className="text-amber-600">{totalMissingCount} cópias</span>
            ) : (
              <span className="text-emerald-600">Nenhuma (100% pronto)</span>
            )}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">Comparado com a sua coleção atual</p>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="mt-6 flex border-b border-slate-200">
        <button
          id="deck-tab-zones"
          onClick={() => setActiveTab('zones')}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition-colors ${
            activeTab === 'zones'
              ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Layers className="h-4 w-4" />
          <span>Zonas do Deck</span>
          <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[11px] font-bold text-slate-700">
            {totalCards}
          </span>
        </button>

        <button
          id="deck-tab-validation"
          onClick={() => setActiveTab('validation')}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition-colors ${
            activeTab === 'validation'
              ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <CheckCircle2 className="h-4 w-4" />
          <span>Validação Oficial</span>
          {(validation?.errors || []).length > 0 && (
            <span className="rounded-full bg-rose-100 px-1.5 py-0.5 text-[10px] font-bold text-rose-700 border border-rose-200">
              {(validation?.errors || []).length}
            </span>
          )}
        </button>

        <button
          id="deck-tab-missing"
          onClick={() => setActiveTab('missing')}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition-colors ${
            activeTab === 'missing'
              ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <AlertTriangle className="h-4 w-4" />
          <span>Cartas Faltantes</span>
          {totalMissingCount > 0 && (
            <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-700 border border-amber-200">
              {totalMissingCount}
            </span>
          )}
        </button>

        <button
          id="deck-tab-export"
          onClick={handleLoadExport}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition-colors ${
            activeTab === 'export'
              ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <FileDown className="h-4 w-4" />
          <span>Exportar Lista</span>
        </button>
      </div>

      {/* TAB 1: ZONAS DO DECK */}
      {activeTab === 'zones' && (
        <div className="mt-6">
          {/* Quick Zone Filter pills */}
          <div className="flex flex-wrap items-center gap-2 pb-4">
            <button
              onClick={() => setSelectedZoneFilter('ALL')}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                selectedZoneFilter === 'ALL'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-300'
              }`}
            >
              Todas as Zonas ({totalCards})
            </button>

            {VALID_ZONES.map((zone) => {
              const count = zoneCounts[zone.id];
              return (
                <button
                  key={zone.id}
                  onClick={() => setSelectedZoneFilter(zone.id)}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                    selectedZoneFilter === zone.id
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-300'
                  }`}
                >
                  <span>{zone.label.split(' ')[0]}</span>
                  <span className="rounded bg-slate-100 px-1.5 py-0.2 text-[10px] font-bold text-slate-700">
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Zones list */}
          <div className="space-y-6">
            {VALID_ZONES.filter((z) => selectedZoneFilter === 'ALL' || selectedZoneFilter === z.id).map(
              (zone) => {
                const count = zoneCounts[zone.id];
                const cardsInZone = deckCards.filter((c) => c.zone === zone.id);

                // Rule compliance helper
                let isCompliant = true;
                let statusLabel = '';

                if (zone.id === 'LEGEND') {
                  isCompliant = count === 1;
                  statusLabel = count === 1 ? '1/1 (OK)' : `${count}/1 (Necessário 1)`;
                } else if (zone.id === 'CHAMPION') {
                  isCompliant = count === 1;
                  statusLabel = count === 1 ? '1/1 (OK)' : `${count}/1 (Necessário 1)`;
                } else if (zone.id === 'MAIN') {
                  isCompliant = count === 39;
                  statusLabel = count === 39 ? '39/39 (OK)' : `${count}/39 (Necessário 39)`;
                } else if (zone.id === 'RUNE') {
                  isCompliant = count === 12;
                  statusLabel = count === 12 ? '12/12 (OK)' : `${count}/12 (Necessário 12)`;
                } else if (zone.id === 'BATTLEFIELD') {
                  isCompliant = count === 3;
                  statusLabel = count === 3 ? '3/3 (OK)' : `${count}/3 (Necessário 3)`;
                } else if (zone.id === 'SIDEBOARD') {
                  isCompliant = count <= 8;
                  statusLabel = `${count}/8 max`;
                } else if (zone.id === 'SIDEBOARD_BATTLEFIELD') {
                  isCompliant = count <= 2;
                  statusLabel = `${count}/2 max`;
                }

                return (
                  <div
                    key={zone.id}
                    className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
                  >
                    {/* Zone Header */}
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-bold text-slate-900">
                            {zone.label}
                          </h3>
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                              isCompliant
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-rose-50 text-rose-700 border border-rose-200'
                            }`}
                          >
                            {statusLabel}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {zone.description} • Regra oficial: {zone.maxOrExact}
                        </p>
                      </div>

                      <button
                        onClick={() => {
                          setModalZone(zone.id);
                          setModalQuantity(1);
                          setShowAddCardModal(true);
                        }}
                        className="flex items-center gap-1 rounded-lg bg-slate-50 hover:bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 transition-colors self-start sm:self-auto border border-slate-300 shadow-xs"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        <span>Adicionar a esta Zona</span>
                      </button>
                    </div>

                    {/* Cards inside zone */}
                    {cardsInZone.length === 0 ? (
                      <div className="py-6 text-center text-xs text-slate-400 italic">
                        Nenhuma carta adicionada à zona {zone.label.split(' ')[0]}.
                      </div>
                    ) : (
                      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {cardsInZone.map((deckCard) => {
                          const cardData = allCatalogCards.find((c) => c.id === deckCard.cardId);
                          if (!cardData) return null;

                          const factionTheme = getFactionColor(cardData.faction);
                          const rarityTheme = getRarityBadge(cardData.rarity);

                          return (
                            <div
                              key={`${deckCard.cardId}-${deckCard.zone}`}
                              className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 shadow-xs hover:border-indigo-300 transition-all hover:bg-white"
                            >
                              <div
                                onClick={() => {
                                  setCardModalData(cardData);
                                  setCardModalOwned(0);
                                }}
                                className="flex items-center gap-2.5 cursor-pointer flex-1 min-w-0"
                              >
                                <img
                                  src={cardData.imageUrl || cardData.imageSmall || ''}
                                  alt={cardData.name}
                                  referrerPolicy="no-referrer"
                                  className="h-12 w-12 rounded-lg object-cover border border-slate-200 shrink-0"
                                />
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-1 flex-wrap">
                                    <span className={`rounded px-1 py-0.2 text-[8px] font-bold uppercase border ${factionTheme.badge}`}>
                                      {cardData.faction}
                                    </span>
                                    <span className={`rounded px-1 py-0.2 text-[8px] font-semibold ${rarityTheme.bg}`}>
                                      {rarityTheme.label}
                                    </span>
                                  </div>
                                  <h4 className="text-xs font-bold text-slate-900 truncate hover:text-indigo-600 mt-0.5">
                                    {cardData.name}
                                  </h4>
                                  <div className="flex items-center gap-1.5 text-[10px] text-slate-500 mt-0.5">
                                    <span>{getTypeLabel(cardData.type)}</span>
                                    {cardData.energy !== null && (
                                      <RiftSymbol type="energy" value={cardData.energy} size="xs" />
                                    )}
                                    {cardData.might !== null && (
                                      <RiftSymbol type="might" value={cardData.might} size="xs" />
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* Quantity Stepper in Deck */}
                              <div className="flex items-center gap-1 ml-2 shrink-0">
                                <button
                                  title="Diminuir 1"
                                  onClick={() => handleDecreaseCard(deckCard.cardId)}
                                  className="flex h-7 w-7 items-center justify-center rounded-md bg-white text-slate-700 hover:bg-slate-100 transition-colors border border-slate-300 shadow-xs"
                                >
                                  <Minus className="h-3 w-3" />
                                </button>

                                <span className="w-5 text-center font-bold text-slate-900 text-xs">
                                  {deckCard.quantity}x
                                </span>

                                <button
                                  title="Adicionar 1"
                                  onClick={async () => {
                                    await decksApi.addCardToDeck(deckId, deckCard.cardId, 1, deckCard.zone);
                                    await loadDeckData();
                                  }}
                                  className="flex h-7 w-7 items-center justify-center rounded-md bg-indigo-50 text-indigo-700 hover:bg-indigo-600 hover:text-white transition-colors border border-indigo-200 shadow-xs"
                                >
                                  <Plus className="h-3 w-3" />
                                </button>

                                <button
                                  title="Remover do deck"
                                  onClick={() => handleRemoveCard(deckCard.cardId)}
                                  className="flex h-7 w-7 items-center justify-center rounded-md bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors border border-rose-200 ml-1 shadow-xs"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              }
            )}
          </div>
        </div>
      )}

      {/* TAB 2: VALIDAÇÃO OFICIAL */}
      {activeTab === 'validation' && (
        <div className="mt-6 space-y-4">
          <div
            className={`rounded-xl border p-6 shadow-sm ${
              validation?.valid
                ? 'border-emerald-200 bg-emerald-50/50'
                : 'border-rose-200 bg-rose-50/50'
            }`}
          >
            <div className="flex items-start gap-4">
              {validation?.valid ? (
                <CheckCircle2 className="h-8 w-8 text-emerald-600 shrink-0" />
              ) : (
                <XCircle className="h-8 w-8 text-rose-600 shrink-0" />
              )}
              <div>
                <h3 className="text-xl font-bold tracking-tight text-slate-900">
                  {validation?.valid
                    ? 'Deck Totalmente Válido para Torneios Oficiais'
                    : 'Deck Contém Erros de Estrutura'}
                </h3>
                <p className="text-xs text-slate-600 mt-1">
                  Validação processada no servidor HTTP conforme a tabela oficial de regras de Riftbound.
                </p>
              </div>
            </div>

            {/* List of Blocking Errors */}
            {(validation?.errors || []).length > 0 && (
              <div className="mt-5 space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-rose-800">
                  Erros Bloqueantes (Devem ser corrigidos):
                </h4>
                <div className="space-y-1.5">
                  {validation?.errors.map((err, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 rounded-lg border border-rose-200 bg-white px-3.5 py-2 text-xs text-rose-800 shadow-xs"
                    >
                      <XCircle className="h-4 w-4 text-rose-600 shrink-0" />
                      <span>{err}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* List of Warnings */}
            {(validation?.warnings || []).length > 0 && (
              <div className="mt-5 space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-800">
                  Avisos Não Bloqueantes:
                </h4>
                <div className="space-y-1.5">
                  {validation?.warnings.map((warn, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 rounded-lg border border-amber-200 bg-white px-3.5 py-2 text-xs text-amber-800 shadow-xs"
                    >
                      <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
                      <span>{warn}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: CARTAS FALTANTES */}
      {activeTab === 'missing' && (
        <div className="mt-6 space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900">
              Cartas Faltantes vs. Coleção do Jogador
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              O backend compara a quantidade de cada carta exigida pelo deck com o que você possui na sua coleção.
            </p>

            {Object.keys(missingCards).length === 0 ? (
              <div className="mt-6 flex flex-col items-center justify-center rounded-xl border border-dashed border-emerald-300 bg-emerald-50/50 py-10 text-center">
                <CheckCircle2 className="h-10 w-10 text-emerald-600 mb-2" />
                <h4 className="text-sm font-bold text-emerald-800">Você possui todas as cartas deste deck!</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Seu acervo atende a 100% dos requisitos deste deck.
                </p>
              </div>
            ) : (
              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {(Object.entries(missingCards) as [string, number][]).map(([cardId, missingQty]) => {
                  const cardData = allCatalogCards.find((c) => c.id === cardId);
                  if (!cardData) return null;

                  return (
                    <div
                      key={cardId}
                      className="flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50/50 p-3 shadow-xs"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={cardData.imageUrl || cardData.imageSmall || ''}
                          alt={cardData.name}
                          referrerPolicy="no-referrer"
                          className="h-12 w-12 rounded-lg object-cover border border-slate-200 shrink-0"
                        />
                        <div>
                          <h5 className="text-xs font-bold text-slate-900">{cardData.name}</h5>
                          <span className="rounded bg-rose-50 px-1.5 py-0.5 text-[10px] font-bold text-rose-700 border border-rose-200">
                            Faltando {missingQty} {missingQty === 1 ? 'cópia' : 'cópias'}
                          </span>
                        </div>
                      </div>

                      <button
                        title="Adicionar à minha coleção"
                        onClick={() => handleAddMissingToCollection(cardId, missingQty)}
                        className="flex items-center gap-1 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-indigo-700 transition-colors shrink-0 shadow-xs"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        <span>Adquirir</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: EXPORTAR DECK */}
      {activeTab === 'export' && (
        <div className="mt-6 space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Exportar Deck Formatado
                </h3>
                <p className="text-xs text-slate-500">
                  Formato oficial agrupado por zona com cabeçalhos <code className="text-indigo-600 font-semibold"># ZONA</code>.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={copyToClipboard}
                  className="flex items-center gap-1.5 rounded-lg bg-white hover:bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 transition-colors border border-slate-300 shadow-xs"
                >
                  {copiedExport ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copiedExport ? 'Copiado!' : 'Copiar'}</span>
                </button>

                <button
                  onClick={downloadExportTxt}
                  className="flex items-center gap-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 px-3 py-1.5 text-xs font-bold text-white transition-colors shadow-xs"
                >
                  <FileDown className="h-3.5 w-3.5" />
                  <span>Baixar .txt</span>
                </button>
              </div>
            </div>

            <textarea
              readOnly
              rows={14}
              value={exportedText}
              className="mt-4 w-full rounded-xl border border-slate-300 bg-slate-50 p-4 font-mono text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-inner"
            />
          </div>
        </div>
      )}

      {/* Add Card to Deck Modal */}
      {showAddCardModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="relative flex max-h-[90vh] w-full max-w-3xl flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-xl font-bold text-slate-900">
                  Adicionar Carta ao Deck #{deckId}
                </h3>
                <p className="text-xs text-slate-500">
                  Selecione a zona de destino e a quantidade desejada.
                </p>
              </div>
              <button
                onClick={() => setShowAddCardModal(false)}
                className="rounded-full bg-slate-100 p-2 text-slate-500 hover:bg-slate-200 hover:text-slate-900 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Target Zone and Quantity Selection */}
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="text-xs font-semibold text-slate-700">Zona de Destino</label>
                <select
                  id="add-card-zone-select"
                  value={modalZone}
                  onChange={(e) => setModalZone(e.target.value as CardZone)}
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none shadow-xs"
                >
                  {VALID_ZONES.map((z) => (
                    <option key={z.id} value={z.id}>
                      {z.label} ({z.maxOrExact})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Quantidade</label>
                <input
                  type="number"
                  min="1"
                  max="40"
                  value={modalQuantity}
                  onChange={(e) => setModalQuantity(Math.max(1, Number(e.target.value) || 1))}
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none shadow-xs"
                />
              </div>
            </div>

            {/* Search Input */}
            <div className="mt-3">
              <input
                type="text"
                placeholder="Filtrar catálogo pelo nome..."
                value={modalSearch}
                onChange={(e) => setModalSearch(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none shadow-xs"
              />
            </div>

            {/* Catalog Grid */}
            <div className="mt-4 flex-1 overflow-y-auto pr-1">
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                {allCatalogCards
                  .filter((c) => c.name.toLowerCase().includes(modalSearch.toLowerCase().trim()))
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
                          onClick={() => handleAddCardToDeck(card.id)}
                          className="flex items-center gap-1 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-indigo-700 transition-colors shrink-0 disabled:opacity-50 shadow-xs"
                        >
                          <Plus className="h-3.5 w-3.5" />
                          <span>Adicionar ({modalQuantity}x)</span>
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
      {cardModalData && (
        <CardDetailModal
          card={cardModalData}
          ownedQuantity={cardModalOwned}
          onClose={() => setCardModalData(null)}
          onAdd={async (id, qty) => {
            await collectionApi.addCard(id, qty);
            if (onCollectionUpdated) onCollectionUpdated();
            await loadDeckData();
          }}
          onDecrease={async (id, qty) => {
            await collectionApi.decreaseCard(id, qty);
            if (onCollectionUpdated) onCollectionUpdated();
            await loadDeckData();
          }}
          onDelete={async (id) => {
            await collectionApi.deleteCard(id);
            if (onCollectionUpdated) onCollectionUpdated();
            await loadDeckData();
            setCardModalData(null);
          }}
        />
      )}
    </div>
  );
};

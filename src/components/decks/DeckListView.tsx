import React, { useState, useEffect, useCallback } from 'react';
import { Deck, DeckValidationResult } from '../../types/index.js';
import { decksApi } from '../../api/index.js';
import { Plus, Edit2, Trash2, CheckCircle2, AlertTriangle, XCircle, Sparkles, RefreshCw, FolderOpen } from 'lucide-react';

interface DeckListViewProps {
  onSelectDeck: (deckId: number) => void;
  notify?: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

interface DeckSummary {
  deck: Deck;
  cardCount: number;
  completion: number;
  validation: DeckValidationResult | null;
}

export const DeckListView: React.FC<DeckListViewProps> = ({ onSelectDeck, notify }) => {
  const [deckSummaries, setDeckSummaries] = useState<DeckSummary[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newDeckName, setNewDeckName] = useState('');
  const [renamingDeck, setRenamingDeck] = useState<Deck | null>(null);
  const [renamingName, setRenamingName] = useState('');
  const [deletingDeckId, setDeletingDeckId] = useState<number | null>(null);

  const loadDecks = useCallback(async () => {
    setLoading(true);
    try {
      const decks = await decksApi.getDecks();
      
      // Carrega informações resumidas de cada deck
      const summaries: DeckSummary[] = await Promise.all(
        decks.map(async (deck) => {
          try {
            const [cards, comp, valid] = await Promise.all([
              decksApi.getDeckCards(deck.id),
              decksApi.getDeckCompletion(deck.id),
              decksApi.validateDeck(deck.id)
            ]);

            const totalCards = cards.reduce((sum, c) => sum + c.quantity, 0);
            return {
              deck,
              cardCount: totalCards,
              completion: comp.percentage,
              validation: valid
            };
          } catch {
            return {
              deck,
              cardCount: 0,
              completion: 0,
              validation: null
            };
          }
        })
      );

      setDeckSummaries(summaries);
    } catch (err: any) {
      if (notify) notify(err.message || 'Erro ao carregar decks.', 'error');
    } finally {
      setLoading(false);
    }
  }, [notify]);

  useEffect(() => {
    loadDecks();
  }, [loadDecks]);

  // Create Deck
  const handleCreateDeck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeckName.trim()) return;

    try {
      const created = await decksApi.createDeck(newDeckName.trim());
      setNewDeckName('');
      setShowCreateModal(false);
      if (notify) notify(`Deck "${created.name}" criado com sucesso!`, 'success');
      await loadDecks();
      onSelectDeck(created.id);
    } catch (err: any) {
      if (notify) notify(err.message || 'Erro ao criar deck.', 'error');
    }
  };

  // Rename Deck
  const handleRenameDeck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!renamingDeck || !renamingName.trim()) return;

    try {
      const updated = await decksApi.renameDeck(renamingDeck.id, renamingName.trim());
      setRenamingDeck(null);
      setRenamingName('');
      if (notify) notify(`Deck renomeado para "${updated.name}"!`, 'success');
      await loadDecks();
    } catch (err: any) {
      if (notify) notify(err.message || 'Erro ao renomear deck.', 'error');
    }
  };

  // Delete Deck
  const handleDeleteDeck = async (id: number) => {
    try {
      await decksApi.deleteDeck(id);
      setDeletingDeckId(null);
      if (notify) notify('Deck excluído com sucesso.', 'info');
      await loadDecks();
    } catch (err: any) {
      if (notify) notify(err.message || 'Erro ao excluir deck.', 'error');
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Meus Decks
          </h1>
          <p className="text-sm text-slate-500">
            Construa e valide decks oficiais com contagem exata de zonas e checagem de coleção.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            id="create-deck-btn"
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Criar Novo Deck</span>
          </button>

          <button
            title="Recarregar decks"
            onClick={() => loadDecks()}
            className="rounded-lg border border-slate-300 bg-white p-2 text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-xs"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin text-indigo-600' : ''}`} />
          </button>
        </div>
      </div>

      {/* Decks Grid */}
      <div className="mt-8">
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <RefreshCw className="h-8 w-8 animate-spin text-indigo-600" />
          </div>
        ) : deckSummaries.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center shadow-xs">
            <FolderOpen className="h-12 w-12 text-slate-400 mb-3" />
            <h3 className="text-lg font-semibold text-slate-800">Você ainda não tem decks criados</h3>
            <p className="text-xs text-slate-500 max-w-sm mt-1">
              Crie seu primeiro deck para começar a adicionar lendas, campeões e montar sua estratégia.
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="mt-4 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-700 transition-colors shadow-xs"
            >
              Criar Primeiro Deck
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {deckSummaries.map(({ deck, cardCount, completion, validation }) => {
              const isValid = validation?.valid;
              const errorsCount = validation?.errors?.length || 0;
              const warningsCount = validation?.warnings?.length || 0;

              return (
                <div
                  key={deck.id}
                  id={`deck-card-${deck.id}`}
                  className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:border-indigo-400 transition-all hover:shadow-md group"
                >
                  <div>
                    {/* Top Bar with ID and Status */}
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono text-slate-400">DECK #{deck.id}</span>

                      {/* Validation Pill */}
                      {isValid ? (
                        <span className="flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700">
                          <CheckCircle2 className="h-3 w-3 text-emerald-600" /> Válido
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 rounded-full bg-rose-50 border border-rose-200 px-2.5 py-0.5 text-[11px] font-bold text-rose-700">
                          <XCircle className="h-3 w-3 text-rose-600" /> {errorsCount} {errorsCount === 1 ? 'pendência' : 'pendências'}
                        </span>
                      )}
                    </div>

                    {/* Deck Name */}
                    <h3
                      onClick={() => onSelectDeck(deck.id)}
                      className="mt-3 text-xl font-bold tracking-tight text-slate-900 group-hover:text-indigo-600 transition-colors cursor-pointer"
                    >
                      {deck.name}
                    </h3>

                    {/* Card count & Warnings */}
                    <div className="mt-2 flex items-center gap-3 text-xs text-slate-500">
                      <span>{cardCount} cartas no deck</span>
                      {warningsCount > 0 && (
                        <span className="flex items-center gap-1 text-amber-700 font-medium">
                          <AlertTriangle className="h-3 w-3 text-amber-600" /> {warningsCount} {warningsCount === 1 ? 'aviso' : 'avisos'}
                        </span>
                      )}
                    </div>

                    {/* Completion vs Collection Bar */}
                    <div className="mt-4 rounded-lg bg-slate-50 p-3 border border-slate-200">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-600 font-medium">Disponível na Coleção</span>
                        <span className="font-bold text-indigo-600">{completion}%</span>
                      </div>
                      <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-slate-200">
                        <div
                          className="h-full rounded-full bg-indigo-600 transition-all duration-300"
                          style={{ width: `${Math.min(100, Math.max(0, completion))}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-3">
                    <div className="flex items-center gap-1">
                      <button
                        title="Renomear Deck"
                        onClick={() => {
                          setRenamingDeck(deck);
                          setRenamingName(deck.name);
                        }}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>

                      <button
                        title="Excluir Deck"
                        onClick={() => setDeletingDeckId(deck.id)}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <button
                      onClick={() => onSelectDeck(deck.id)}
                      className="flex items-center gap-1.5 rounded-lg bg-indigo-50 border border-indigo-200 px-3.5 py-1.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-600 hover:text-white transition-all shadow-xs"
                    >
                      <span>Abrir Deck</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal: Criar Deck */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <form
            onSubmit={handleCreateDeck}
            className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl"
          >
            <h3 className="text-xl font-bold tracking-tight text-slate-900">Criar Novo Deck</h3>
            <p className="text-xs text-slate-500 mt-1">
              Escolha um nome único para o seu deck de Riftbound.
            </p>

            <div className="mt-4">
              <label className="text-xs font-semibold text-slate-700">Nome do Deck</label>
              <input
                type="text"
                autoFocus
                required
                placeholder="Ex: Aggro Noxus, Demacia Control..."
                value={newDeckName}
                onChange={(e) => setNewDeckName(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-xs"
              />
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowCreateModal(false);
                  setNewDeckName('');
                }}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-xs"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-700 transition-colors shadow-sm"
              >
                Criar Deck
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal: Renomear Deck */}
      {renamingDeck && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <form
            onSubmit={handleRenameDeck}
            className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl"
          >
            <h3 className="text-xl font-bold tracking-tight text-slate-900">Renomear Deck</h3>
            <p className="text-xs text-slate-500 mt-1">
              Atualize o nome do deck #{renamingDeck.id}.
            </p>

            <div className="mt-4">
              <label className="text-xs font-semibold text-slate-700">Novo Nome</label>
              <input
                type="text"
                autoFocus
                required
                value={renamingName}
                onChange={(e) => setRenamingName(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-xs"
              />
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setRenamingDeck(null)}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-xs"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-700 transition-colors shadow-sm"
              >
                Salvar Nome
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal: Confirmação de Exclusão */}
      {deletingDeckId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
            <h3 className="text-xl font-bold tracking-tight text-rose-600">Excluir Deck?</h3>
            <p className="text-xs text-slate-600 mt-2">
              Tem certeza que deseja excluir o deck #{deletingDeckId} e todas as suas cartas associadas? Esta ação não pode ser desfeita.
            </p>

            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setDeletingDeckId(null)}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-xs"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDeleteDeck(deletingDeckId)}
                className="rounded-lg bg-rose-600 px-4 py-2 text-xs font-bold text-white hover:bg-rose-700 transition-colors shadow-sm"
              >
                Sim, Excluir Deck
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

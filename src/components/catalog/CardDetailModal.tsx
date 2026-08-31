import React, { useState, useEffect } from 'react';
import { Card } from '../../types/index.js';
import { cardsApi } from '../../api/index.js';
import { getFactionColor, getRarityBadge, getTypeLabel } from '../../utils/cardUtils.js';
import { renderCardDescription } from '../../utils/textUtils.js';
import { RiftSymbol } from '../common/RiftSymbol.js';
import { X, Plus, Minus, Trash2, AlertOctagon, Sparkles } from 'lucide-react';

interface CardDetailModalProps {
  card: Card | null;
  onClose: () => void;
  ownedQuantity: number;
  onAdd: (cardId: string, quantity: number) => Promise<void>;
  onDecrease: (cardId: string, quantity: number) => Promise<void>;
  onDelete: (cardId: string) => Promise<void>;
}

export const CardDetailModal: React.FC<CardDetailModalProps> = ({
  card: initialCard,
  onClose,
  ownedQuantity,
  onAdd,
  onDecrease,
  onDelete
}) => {
  const [card, setCard] = useState<Card | null>(initialCard);

  useEffect(() => {
    setCard(initialCard);
    if (initialCard?.id && (!initialCard.description || !initialCard.flavorText)) {
      cardsApi.getCardById(initialCard.id).then((fresh) => {
        if (fresh) {
          setCard(fresh);
        }
      }).catch(() => {});
    }
  }, [initialCard?.id]);

  if (!card) return null;

  const factionTheme = getFactionColor(card.faction);
  const rarityTheme = getRarityBadge(card.rarity);
  const typeLabel = getTypeLabel(card.type);

  return (
    <div
      id="card-detail-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl"
      >
        {/* Close Button */}
        <button
          id="close-card-modal-btn"
          onClick={onClose}
          className="absolute top-4 right-4 z-10 rounded-full bg-slate-100 p-2.5 text-slate-600 hover:bg-slate-200 hover:text-slate-900 transition-colors shadow-xs"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Card Visual Artwork (Clean, no overlays on top of art) */}
          <div className="flex flex-col items-center">
            <div className="relative aspect-[3/4] w-full max-w-[340px] overflow-hidden rounded-2xl border border-slate-300 bg-slate-950 flex items-center justify-center shadow-lg">
              <img
                src={card.imageUrl || card.imageLarge || card.imageMedium || ''}
                alt={card.name}
                referrerPolicy="no-referrer"
                className="h-full w-full object-contain"
              />
            </div>

            {/* External Stats Row (Around the card, not over it) */}
            <div className="mt-3 flex w-full max-w-[340px] items-center justify-center gap-2 flex-wrap rounded-2xl border border-slate-200 bg-slate-50 p-2.5 shadow-2xs">
              {card.energy !== null && (
                <RiftSymbol type="energy" value={card.energy} size="md" showLabel />
              )}
              {card.might !== null && (
                <RiftSymbol type="might" value={card.might} size="md" showLabel />
              )}
              {card.power !== null && (
                <RiftSymbol type="power" value={card.power} size="md" showLabel />
              )}
              <span className="rounded-lg bg-slate-200/80 px-2 py-1 text-[10px] font-bold text-slate-700 uppercase tracking-wider">
                {card.orientation || 'VERTICAL'}
              </span>
            </div>
          </div>

          {/* Card Info & Collection Controls */}
          <div className="flex flex-col justify-between">
            <div>
              {/* Badges */}
              <div className="flex flex-wrap items-center gap-2">
                <span className={`rounded-lg px-2.5 py-1 text-xs font-black uppercase tracking-wider border ${factionTheme.badge}`}>
                  {card.faction}
                </span>
                <span className={`rounded-lg px-2.5 py-1 text-xs font-bold ${rarityTheme.bg}`}>
                  {rarityTheme.label}
                </span>
                <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700 border border-slate-200">
                  {typeLabel}
                </span>
                {card.banned && (
                  <span className="inline-flex items-center gap-1 rounded-lg bg-rose-100 px-2.5 py-1 text-xs font-black text-rose-800 border border-rose-300">
                    <AlertOctagon className="h-4 w-4" /> BANIDA
                  </span>
                )}
              </div>

              {/* Title */}
              <div className="mt-3.5 flex items-start justify-between gap-2">
                <div>
                  <h2 className="text-2xl font-black tracking-tight text-slate-900">
                    {card.name}
                  </h2>
                  <p className="text-xs text-slate-500 font-mono mt-1 font-semibold">
                    Set: {card.setId} • #{card.collectorNumber ? String(card.collectorNumber).padStart(3, '0') : card.id} {card.variant ? `• Variante: ${card.variant}` : ''}
                  </p>
                </div>

                {card.energy !== null && (
                  <RiftSymbol type="energy" value={card.energy} size="lg" className="shrink-0 shadow-md" />
                )}
              </div>

              {/* Card Rules / Description */}
              <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-2xs">
                <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-indigo-700">
                  <Sparkles className="h-4 w-4" /> Texto de Efeitos & Habilidades
                </div>
                <div className="mt-2 text-sm text-slate-800 leading-relaxed">
                  {card.description ? (
                    renderCardDescription(card.description)
                  ) : (
                    <span className="italic text-slate-500">Nenhum texto de efeito especial.</span>
                  )}
                </div>
              </div>

              {/* Flavor text */}
              {card.flavorText && (
                <div className="mt-3 rounded-2xl border border-slate-200 bg-slate-50/60 p-3.5 italic text-xs text-slate-600 leading-relaxed">
                  "{card.flavorText}"
                </div>
              )}
            </div>

            {/* Collection Actions Panel */}
            <div className="mt-6 rounded-2xl border border-indigo-200 bg-indigo-50/70 p-4.5 shadow-xs">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-800">
                    Na Sua Coleção
                  </h4>
                  <p className="text-2xl font-black text-slate-900">
                    {ownedQuantity} <span className="text-sm font-semibold text-slate-600">{ownedQuantity === 1 ? 'cópia' : 'cópias'}</span>
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {ownedQuantity > 0 && (
                    <>
                      <button
                        title="Remover 1 cópia"
                        onClick={() => onDecrease(card.id, 1)}
                        className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-slate-700 hover:bg-slate-100 transition-colors border border-slate-300 shadow-xs"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <button
                        title="Remover todas"
                        onClick={() => onDelete(card.id)}
                        className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 transition-colors shadow-xs"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </>
                  )}

                  <button
                    id="modal-add-card-btn"
                    onClick={() => onAdd(card.id, 1)}
                    className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-black text-white hover:bg-indigo-700 transition-colors shadow-sm"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Adicionar (+1)</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


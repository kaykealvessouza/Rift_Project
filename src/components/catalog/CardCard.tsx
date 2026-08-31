import React from 'react';
import { Card } from '../../types/index.js';
import { getFactionColor, getRarityBadge, getTypeLabel } from '../../utils/cardUtils.js';
import { renderCardDescription } from '../../utils/textUtils.js';
import { RiftSymbol } from '../common/RiftSymbol.js';
import { Plus, AlertOctagon, Info } from 'lucide-react';

interface CardCardProps {
  card: Card;
  ownedQuantity?: number;
  onSelect: (card: Card) => void;
  onQuickAdd?: (card: Card) => void;
  isCompact?: boolean;
}

export const CardCard: React.FC<CardCardProps> = ({
  card,
  ownedQuantity = 0,
  onSelect,
  onQuickAdd,
  isCompact = false
}) => {
  const factionTheme = getFactionColor(card.faction);
  const rarityTheme = getRarityBadge(card.rarity);
  const typeLabel = getTypeLabel(card.type);

  return (
    <div
      id={`card-${card.id}`}
      onClick={() => onSelect(card)}
      className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border bg-white border-slate-200 p-3 shadow-xs transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:border-indigo-400 cursor-pointer"
    >
      {/* Top Banner: Name, Type, Energy Cost */}
      <div>
        <div className="flex items-start justify-between gap-1.5">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className={`inline-block rounded-md px-1.5 py-0.5 text-[10px] font-black uppercase tracking-wider border ${factionTheme.badge}`}>
                {card.faction}
              </span>
              <span className={`inline-block rounded-md px-1.5 py-0.5 text-[10px] font-semibold ${rarityTheme.bg}`}>
                {rarityTheme.label}
              </span>
              {card.banned && (
                <span className="inline-flex items-center gap-0.5 rounded-md bg-rose-50 px-1.5 py-0.5 text-[10px] font-black text-rose-700 border border-rose-200">
                  <AlertOctagon className="h-3 w-3" /> Banida
                </span>
              )}
            </div>
            <h3 className="mt-1.5 text-sm font-black text-slate-900 line-clamp-1 group-hover:text-indigo-600 transition-colors">
              {card.name}
            </h3>
            <span className="text-[11px] font-semibold text-slate-500">
              {typeLabel} {card.variant ? `• ${card.variant}` : ''}
            </span>
          </div>

          {/* Energy Cost Symbol */}
          {card.energy !== null && (
            <RiftSymbol type="energy" value={card.energy} size="md" className="shrink-0" />
          )}
        </div>

        {/* Artwork Image in full portrait aspect ratio (Clean, no overlays on art) */}
        <div className="relative mt-2.5 aspect-[3/4] w-full overflow-hidden rounded-xl bg-slate-900/5 border border-slate-200 shadow-2xs flex items-center justify-center">
          <img
            src={card.imageMedium || card.imageSmall || card.imageUrl || ''}
            alt={card.name}
            loading="lazy"
            referrerPolicy="no-referrer"
            className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105"
          />
        </div>

        {/* Stats & Ownership Row (Positioned around the card image, never on top of art) */}
        <div className="mt-2 flex items-center justify-between gap-1.5 min-h-[24px]">
          <div className="flex items-center gap-1.5">
            {card.might !== null && (
              <RiftSymbol type="might" value={card.might} size="sm" />
            )}
            {card.power !== null && (
              <RiftSymbol type="power" value={card.power} size="sm" />
            )}
          </div>

          {ownedQuantity > 0 && (
            <span className="rounded-md bg-indigo-50 border border-indigo-200 px-1.5 py-0.5 text-[10px] font-black text-indigo-700">
              {ownedQuantity}x na Coleção
            </span>
          )}
        </div>

        {/* Card Rules / Description text */}
        {!isCompact && (card.description || card.flavorText) && (
          <div className="mt-2.5 text-xs text-slate-700 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
            {card.description && (
              <div className="line-clamp-3 text-[11px] font-medium text-slate-800">
                {renderCardDescription(card.description)}
              </div>
            )}
            {card.flavorText && (
              <p className="mt-1 line-clamp-1 italic text-[10px] text-slate-500 border-t border-slate-200/60 pt-1">
                "{card.flavorText}"
              </p>
            )}
          </div>
        )}
      </div>

      {/* Footer Details & Action */}
      <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2 text-[11px] text-slate-400">
        <span className="font-mono text-slate-500 font-semibold">
          #{card.collectorNumber ? String(card.collectorNumber).padStart(3, '0') : card.id}
        </span>
        
        <div className="flex items-center gap-1.5">
          <button
            title="Ver detalhes"
            onClick={(e) => {
              e.stopPropagation();
              onSelect(card);
            }}
            className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors"
          >
            <Info className="h-3.5 w-3.5" />
          </button>

          {onQuickAdd && (
            <button
              title="Adicionar 1 à Coleção"
              onClick={(e) => {
                e.stopPropagation();
                onQuickAdd(card);
              }}
              className="flex items-center gap-1 rounded-md bg-indigo-50 border border-indigo-200 px-2.5 py-1 text-xs font-bold text-indigo-700 hover:bg-indigo-600 hover:text-white transition-colors shadow-2xs"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Coleção</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};


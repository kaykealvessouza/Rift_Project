import React from 'react';

export type RiftIconType = 'energy' | 'might' | 'power' | 'rune' | 'fury' | 'calm' | 'mind' | 'body' | 'chaos' | 'order' | 'colorless';

interface RiftSymbolProps {
  type: RiftIconType;
  value?: string | number | null;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
  showLabel?: boolean;
}

export const RiftSymbol: React.FC<RiftSymbolProps> = ({
  type,
  value,
  size = 'md',
  className = '',
  showLabel = false
}) => {
  const sizeClasses = {
    xs: 'text-[9px] px-1 py-0.5 gap-0.5',
    sm: 'text-[10px] px-1.5 py-0.5 gap-1',
    md: 'text-xs px-2 py-0.5 gap-1',
    lg: 'text-sm font-black px-2.5 py-1 gap-1.5'
  };

  const iconSizes = {
    xs: 'h-2.5 w-2.5',
    sm: 'h-3 w-3',
    md: 'h-3.5 w-3.5',
    lg: 'h-4 w-4'
  };

  switch (type.toLowerCase()) {
    case 'energy':
      return (
        <div
          title={showLabel ? 'Custo de Energia' : `Energia: ${value ?? ''}`}
          className={`inline-flex items-center justify-center font-black rounded-lg text-white shadow-2xs border border-sky-300 bg-gradient-to-br from-sky-400 via-sky-500 to-indigo-600 ${sizeClasses[size]} ${className}`}
        >
          <svg className={`${iconSizes[size]} fill-current text-sky-100 shrink-0`} viewBox="0 0 24 24">
            <path d="M13 2L3 14h8l-2 8 11-13h-8l3-7z" />
          </svg>
          {showLabel && <span className="text-[10px] font-bold uppercase tracking-wider opacity-90">Energia</span>}
          {value !== undefined && value !== null && <span>{value}</span>}
        </div>
      );

    case 'might':
      return (
        <div
          title={showLabel ? 'Might (Força de Combate)' : `Might: ${value ?? ''}`}
          className={`inline-flex items-center justify-center font-black rounded-lg text-amber-950 shadow-2xs border border-amber-300 bg-gradient-to-br from-amber-300 via-amber-400 to-yellow-500 ${sizeClasses[size]} ${className}`}
        >
          {/* Authentic Riftbound Might faceted diamond power crest */}
          <svg className={`${iconSizes[size]} text-amber-950 shrink-0`} viewBox="0 0 24 24" fill="none">
            <path
              d="M12 1.5L16 8L22.5 12L16 16L12 22.5L8 16L1.5 12L8 8L12 1.5Z"
              fill="currentColor"
            />
            <path
              d="M12 5.5L14.5 9.5L18.5 12L14.5 14.5L12 18.5L9.5 14.5L5.5 12L9.5 9.5L12 5.5Z"
              fill="#FEF3C7"
              fillOpacity="0.85"
            />
          </svg>
          {showLabel && <span className="text-[10px] font-bold uppercase tracking-wider text-amber-950">Might</span>}
          {value !== undefined && value !== null && <span className="text-amber-950 font-black">{value}</span>}
        </div>
      );

    case 'power':
      return (
        <div
          title={showLabel ? 'Poder' : `Poder: ${value ?? ''}`}
          className={`inline-flex items-center justify-center font-black rounded-lg text-white shadow-2xs border border-rose-400 bg-gradient-to-br from-rose-500 to-red-600 ${sizeClasses[size]} ${className}`}
        >
          <svg className={`${iconSizes[size]} fill-current text-rose-100 shrink-0`} viewBox="0 0 24 24">
            <path d="M14.5 2.5L12 5 9.5 2.5 7 5l2.5 2.5L7 10l2.5 2.5L7 15l2.5 2.5L12 15l2.5 2.5L17 15l-2.5-2.5L17 10l-2.5-2.5L17 5l-2.5-2.5z" />
          </svg>
          {showLabel && <span className="text-[10px] font-bold uppercase tracking-wider opacity-90">Poder</span>}
          {value !== undefined && value !== null && <span>{value}</span>}
        </div>
      );

    case 'fury':
      return (
        <span
          title="Fury (Fúria)"
          className={`inline-flex items-center justify-center rounded-lg bg-red-600 text-white font-black text-[10px] px-1.5 py-0.5 border border-red-400 shadow-2xs ${className}`}
        >
          🔥 Fury
        </span>
      );

    case 'calm':
      return (
        <span
          title="Calm (Calmaria)"
          className={`inline-flex items-center justify-center rounded-lg bg-amber-500 text-white font-black text-[10px] px-1.5 py-0.5 border border-amber-300 shadow-2xs ${className}`}
        >
          ☀️ Calm
        </span>
      );

    case 'mind':
      return (
        <span
          title="Mind (Mente)"
          className={`inline-flex items-center justify-center rounded-lg bg-sky-600 text-white font-black text-[10px] px-1.5 py-0.5 border border-sky-400 shadow-2xs ${className}`}
        >
          🌀 Mind
        </span>
      );

    case 'body':
      return (
        <span
          title="Body (Corpo)"
          className={`inline-flex items-center justify-center rounded-lg bg-emerald-600 text-white font-black text-[10px] px-1.5 py-0.5 border border-emerald-400 shadow-2xs ${className}`}
        >
          🌿 Body
        </span>
      );

    case 'chaos':
      return (
        <span
          title="Chaos (Caos)"
          className={`inline-flex items-center justify-center rounded-lg bg-purple-600 text-white font-black text-[10px] px-1.5 py-0.5 border border-purple-400 shadow-2xs ${className}`}
        >
          ⚡ Chaos
        </span>
      );

    case 'order':
      return (
        <span
          title="Order (Ordem)"
          className={`inline-flex items-center justify-center rounded-lg bg-blue-700 text-white font-black text-[10px] px-1.5 py-0.5 border border-blue-400 shadow-2xs ${className}`}
        >
          ⚖️ Order
        </span>
      );

    case 'colorless':
      return (
        <span
          title="Colorless (Incolor)"
          className={`inline-flex items-center justify-center rounded-lg bg-slate-600 text-white font-black text-[10px] px-1.5 py-0.5 border border-slate-400 shadow-2xs ${className}`}
        >
          ⚪ Incolor
        </span>
      );

    case 'rune':
    default:
      return (
        <span
          title="Rune"
          className={`inline-flex items-center justify-center rounded-lg bg-indigo-600 text-white font-black text-[10px] px-1.5 py-0.5 border border-indigo-400 shadow-2xs ${className}`}
        >
          💎 Runa
        </span>
      );
  }
};


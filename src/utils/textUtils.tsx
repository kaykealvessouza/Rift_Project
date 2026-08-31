import React from 'react';

/**
 * Parses card descriptions with symbols like :rb_energy_1:, :rb_might_2:, :rb_rune_fury:, [Accelerate], etc.
 * and renders formatted spans with badges and icons matching the official game design.
 */
export function renderCardDescription(text: string | null | undefined): React.ReactNode {
  if (!text) return null;

  // Split text by tokens matching :rb_...: or bracket keywords [Keyword]
  const regex = /(:rb_[a-zA-Z0-9_]+:|\[[a-zA-Z0-9_\s]+\])/g;
  const parts = text.split(regex);

  return parts.map((part, index) => {
    if (!part) return null;

    // Symbol token :rb_...:
    if (part.startsWith(':rb_') && part.endsWith(':')) {
      const code = part.slice(4, -1); // e.g. "energy_1", "might_5", "rune_fury", "rune_calm"

      if (code.startsWith('energy_')) {
        const val = code.replace('energy_', '');
        return (
          <span
            key={index}
            title={`Energia ${val}`}
            className="inline-flex items-center gap-0.5 rounded-full bg-sky-500 text-white font-black text-[10px] px-1 py-0.2 mx-0.5 shadow-2xs border border-sky-300 align-middle"
          >
            ⚡ {val}
          </span>
        );
      }

      if (code.startsWith('might_')) {
        const val = code.replace('might_', '');
        return (
          <span
            key={index}
            title={`Might ${val}`}
            className="inline-flex items-center gap-1 rounded-md bg-amber-400 text-amber-950 font-black text-[10px] px-1.5 py-0.2 mx-0.5 shadow-2xs border border-amber-300 align-middle"
          >
            <svg className="h-2.5 w-2.5 text-amber-950 shrink-0" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 1.5L16 8L22.5 12L16 16L12 22.5L8 16L1.5 12L8 8L12 1.5Z" />
            </svg>
            {val}
          </span>
        );
      }

      if (code.startsWith('power_')) {
        const val = code.replace('power_', '');
        return (
          <span
            key={index}
            title={`Poder ${val}`}
            className="inline-flex items-center gap-0.5 rounded-md bg-red-500 text-white font-black text-[10px] px-1 py-0.2 mx-0.5 shadow-2xs border border-red-300 align-middle"
          >
            ⚔️ {val}
          </span>
        );
      }

      if (code.startsWith('rune_')) {
        const faction = code.replace('rune_', '');
        const colors: Record<string, string> = {
          fury: 'bg-red-600 border-red-400',
          calm: 'bg-amber-500 border-amber-300',
          mind: 'bg-sky-600 border-sky-400',
          body: 'bg-emerald-600 border-emerald-400',
          chaos: 'bg-purple-600 border-purple-400',
          order: 'bg-blue-700 border-blue-400'
        };
        const badgeColor = colors[faction.toLowerCase()] || 'bg-indigo-600 border-indigo-400';

        return (
          <span
            key={index}
            title={`Runa ${faction}`}
            className={`inline-flex items-center rounded-full text-white font-bold text-[9px] uppercase px-1.5 py-0.2 mx-0.5 shadow-2xs border ${badgeColor} align-middle`}
          >
            💎 {faction}
          </span>
        );
      }

      // Default generic symbol tag
      return (
        <span
          key={index}
          className="inline-flex items-center rounded bg-slate-200 text-slate-800 font-bold text-[10px] px-1 py-0.2 mx-0.5"
        >
          {code}
        </span>
      );
    }

    // Bracketed Keyword [Keyword]
    if (part.startsWith('[') && part.endsWith(']')) {
      const keyword = part.slice(1, -1);
      return (
        <span
          key={index}
          className="inline-flex items-center rounded-md bg-indigo-100 text-indigo-900 font-bold text-[11px] px-1.5 py-0.5 mx-0.5 border border-indigo-200 shadow-2xs"
        >
          {keyword}
        </span>
      );
    }

    // Regular plain text
    return <span key={index}>{part}</span>;
  });
}

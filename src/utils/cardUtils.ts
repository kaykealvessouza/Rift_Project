export function getFactionColor(faction: string): {
  badge: string;
  border: string;
  bg: string;
  text: string;
  glow: string;
} {
  switch (faction?.toLowerCase()) {
    case 'fury':
    case 'noxus':
      return {
        badge: 'bg-red-50 text-red-700 border-red-200',
        border: 'border-red-200',
        bg: 'from-red-50/40 to-white',
        text: 'text-red-700',
        glow: 'hover:border-red-400'
      };
    case 'mind':
    case 'piltover':
    case 'zaun':
    case 'piltover & zaun':
      return {
        badge: 'bg-sky-50 text-sky-800 border-sky-200',
        border: 'border-sky-200',
        bg: 'from-sky-50/40 to-white',
        text: 'text-sky-800',
        glow: 'hover:border-sky-400'
      };
    case 'body':
    case 'freljord':
      return {
        badge: 'bg-cyan-50 text-cyan-800 border-cyan-200',
        border: 'border-cyan-200',
        bg: 'from-cyan-50/40 to-white',
        text: 'text-cyan-800',
        glow: 'hover:border-cyan-400'
      };
    case 'calm':
    case 'demacia':
      return {
        badge: 'bg-amber-50 text-amber-800 border-amber-200',
        border: 'border-amber-200',
        bg: 'from-amber-50/40 to-white',
        text: 'text-amber-800',
        glow: 'hover:border-amber-400'
      };
    case 'order':
    case 'ionia':
      return {
        badge: 'bg-emerald-50 text-emerald-800 border-emerald-200',
        border: 'border-emerald-200',
        bg: 'from-emerald-50/40 to-white',
        text: 'text-emerald-800',
        glow: 'hover:border-emerald-400'
      };
    case 'chaos':
    case 'shadow isles':
      return {
        badge: 'bg-teal-50 text-teal-800 border-teal-200',
        border: 'border-teal-200',
        bg: 'from-teal-50/40 to-white',
        text: 'text-teal-800',
        glow: 'hover:border-teal-400'
      };
    case 'void':
      return {
        badge: 'bg-purple-50 text-purple-800 border-purple-200',
        border: 'border-purple-200',
        bg: 'from-purple-50/40 to-white',
        text: 'text-purple-800',
        glow: 'hover:border-purple-400'
      };
    case 'colorless':
    default:
      return {
        badge: 'bg-slate-100 text-slate-700 border-slate-200',
        border: 'border-slate-200',
        bg: 'from-slate-50 to-white',
        text: 'text-slate-700',
        glow: 'hover:border-indigo-400'
      };
  }
}

export function getRarityBadge(rarity: string): { bg: string; text: string; label: string } {
  switch (rarity?.toUpperCase()) {
    case 'SHOWCASE':
      return { bg: 'bg-amber-100 text-amber-900 border border-amber-400 font-bold', text: 'text-amber-800', label: 'Showcase' };
    case 'LEGENDARY':
      return { bg: 'bg-amber-50 text-amber-800 border border-amber-300 font-semibold', text: 'text-amber-700', label: 'Lendária' };
    case 'EPIC':
      return { bg: 'bg-purple-50 text-purple-800 border border-purple-200 font-semibold', text: 'text-purple-700', label: 'Épica' };
    case 'RARE':
      return { bg: 'bg-blue-50 text-blue-800 border border-blue-200 font-semibold', text: 'text-blue-700', label: 'Rara' };
    case 'UNCOMMON':
      return { bg: 'bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold', text: 'text-emerald-700', label: 'Incomum' };
    case 'COMMON':
    default:
      return { bg: 'bg-slate-100 text-slate-600 border border-slate-200', text: 'text-slate-600', label: 'Comum' };
  }
}

export function getTypeLabel(type: string): string {
  switch (type?.toUpperCase()) {
    case 'LEGEND': return 'Lenda';
    case 'CHAMPION': return 'Campeão';
    case 'UNIT': return 'Unidade';
    case 'SPELL': return 'Feitiço';
    case 'RUNE': return 'Runa';
    case 'GEAR':
    case 'EQUIPMENT': return 'Equipamento (Gear)';
    case 'BATTLEFIELD': return 'Campo de Batalha';
    default: return type;
  }
}

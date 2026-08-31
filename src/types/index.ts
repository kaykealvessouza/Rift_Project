export type CardZone =
  | 'LEGEND'
  | 'CHAMPION'
  | 'MAIN'
  | 'RUNE'
  | 'BATTLEFIELD'
  | 'SIDEBOARD'
  | 'SIDEBOARD_BATTLEFIELD';

export const VALID_ZONES: { id: CardZone; label: string; maxOrExact: string; description: string }[] = [
  { id: 'LEGEND', label: 'Lenda (Legend)', maxOrExact: 'Exatamente 1', description: 'Comandante e identidade do deck' },
  { id: 'CHAMPION', label: 'Campeão (Champion)', maxOrExact: 'Exatamente 1', description: 'Campeão principal em campo' },
  { id: 'MAIN', label: 'Deck Principal (Main)', maxOrExact: 'Exatamente 39', description: 'Unidades, Feitiços e Equipamentos' },
  { id: 'RUNE', label: 'Runas (Rune)', maxOrExact: 'Exatamente 12', description: 'Fonte de mana e energias' },
  { id: 'BATTLEFIELD', label: 'Campo de Batalha (Battlefield)', maxOrExact: 'Exatamente 3', description: 'Locais de confronto e efeitos passivos' },
  { id: 'SIDEBOARD', label: 'Reserva (Sideboard)', maxOrExact: 'Até 8', description: 'Cartas opcionais para substituição' },
  { id: 'SIDEBOARD_BATTLEFIELD', label: 'Reserva de Campo (Sideboard BF)', maxOrExact: 'Até 2', description: 'Campos opcionais de reserva' }
];

export interface Card {
  id: string;
  name: string;
  setId: string;
  collectorNumber: number | null;
  rarity: 'COMMON' | 'UNCOMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
  faction: string;
  type: 'LEGEND' | 'CHAMPION' | 'UNIT' | 'SPELL' | 'RUNE' | 'BATTLEFIELD' | 'EQUIPMENT';
  variant: string | null;
  orientation: string | null;
  power: number | null;
  energy: number | null;
  might: number | null;
  description: string | null;
  flavorText: string | null;
  imageUrl: string | null;
  imageSmall: string | null;
  imageMedium: string | null;
  imageLarge: string | null;
  imageBlurDataUrl: string | null;
  banned: boolean;
}

export interface CollectionCard {
  card: Card;
  quantity: number;
}

export interface DeckCard {
  cardId: string;
  quantity: number;
  zone: CardZone;
}

export interface Deck {
  id: number;
  name: string;
}

export interface DeckValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export interface ImportEntry {
  cardName: string;
  quantity: number;
  line: number;
}

export interface ParserError {
  line: number;
  content: string;
}

export interface MatchedCard {
  entry: ImportEntry;
  card: Card;
}

export interface ImportResult {
  foundCards: MatchedCard[];
  notFoundCards: ImportEntry[];
  parserErrors: ParserError[];
  success: boolean;
}

export interface ApiError {
  status: number;
  message: string;
}

export interface CardFilterParams {
  faction?: string;
  type?: string;
  name?: string;
  maxEnergy?: number;
  minMight?: number;
  setId?: string;
  rarity?: string;
  banned?: boolean;
}

export interface PaginatedCardsResponse {
  items: Card[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export type CardZone =
  | 'LEGEND'
  | 'CHAMPION'
  | 'MAIN'
  | 'RUNE'
  | 'BATTLEFIELD'
  | 'SIDEBOARD'
  | 'SIDEBOARD_BATTLEFIELD';

export const VALID_ZONES: CardZone[] = [
  'LEGEND',
  'CHAMPION',
  'MAIN',
  'RUNE',
  'BATTLEFIELD',
  'SIDEBOARD',
  'SIDEBOARD_BATTLEFIELD'
];

export interface CardStats {
  energy: number | null;
  might: number | null;
  power: number | null;
}

export interface CardThumbnails {
  small?: string | null;
  medium?: string | null;
  large?: string | null;
}

export interface CardApiResponse {
  id: string;
  public_code?: string;
  name: string;
  set_id?: string;
  collector_number?: number | null;
  rarity?: string;
  faction?: string;
  type?: string;
  variant?: string | null;
  orientation?: string | null;
  stats?: CardStats | null;
  description?: string | null;
  flavor_text?: string | null;
  image?: string | null;
  image_thumb?: CardThumbnails | null;
  image_blur_data_url?: string | null;
  is_banned?: boolean | null;
}

export interface Card {
  id: string;
  name: string;
  setId: string;
  collectorNumber: number | null;
  rarity: 'COMMON' | 'UNCOMMON' | 'RARE' | 'EPIC' | 'LEGENDARY' | string;
  faction: string;
  type: 'LEGEND' | 'CHAMPION' | 'UNIT' | 'SPELL' | 'RUNE' | 'BATTLEFIELD' | 'EQUIPMENT' | string;
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
  errors: string[];   // Bloqueiam o deck de ser considerado válido
  warnings: string[]; // Não bloqueiam, só avisam
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
  success: boolean; // true só se não houver parserErrors nem notFoundCards
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

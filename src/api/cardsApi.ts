import { request } from './client.js';
import { Card, CardFilterParams, PaginatedCardsResponse } from '../types/index.js';

const CACHE_STORAGE_KEY = 'rift_cards_catalog_v2';
let memoryCardsCache: Card[] | null = null;
let fetchPromise: Promise<Card[]> | null = null;

// Try to initialize from localStorage on startup for instant zero-latency boot
try {
  const stored = localStorage.getItem(CACHE_STORAGE_KEY);
  if (stored) {
    const parsed = JSON.parse(stored);
    if (Array.isArray(parsed) && parsed.length > 0) {
      memoryCardsCache = parsed;
    }
  }
} catch {
  // Ignore storage access errors
}

export const cardsApi = {
  /**
   * Preload and get all cards with multi-level caching (Memory -> LocalStorage -> Server API).
   * Ensures 0ms latency for all subsequent operations.
   */
  async getAllCards(forceRefresh = false): Promise<Card[]> {
    if (!forceRefresh && memoryCardsCache && memoryCardsCache.length > 0) {
      return memoryCardsCache;
    }

    if (fetchPromise && !forceRefresh) {
      return fetchPromise;
    }

    fetchPromise = (async () => {
      try {
        const cards = await request<Card[]>('/cards/all');
        if (Array.isArray(cards) && cards.length > 0) {
          memoryCardsCache = cards;
          try {
            localStorage.setItem(CACHE_STORAGE_KEY, JSON.stringify(cards));
          } catch {
            // Storage quota exceeded or disabled
          }
          return cards;
        }
      } catch (err) {
        console.warn('[cardsApi] Falha ao buscar /cards/all, tentando fallback paginado/busca:', err);
      }

      // Fallback: busca padrão
      try {
        const fallback = await request<Card[]>('/cards/search');
        if (Array.isArray(fallback) && fallback.length > 0) {
          memoryCardsCache = fallback;
          return fallback;
        }
      } catch {
        // Ignore fallback error
      }

      return memoryCardsCache || [];
    })().finally(() => {
      fetchPromise = null;
    });

    return fetchPromise;
  },

  /**
   * Instant in-memory search and filter with 0ms network latency.
   */
  filterCardsInMemory(cards: Card[], filters: CardFilterParams): Card[] {
    const nameQuery = filters.name?.trim().toLowerCase();
    const factionQuery = filters.faction?.trim().toLowerCase();
    const typeQuery = filters.type?.trim().toUpperCase();
    const rarityQuery = filters.rarity?.trim().toUpperCase();
    const setIdQuery = filters.setId?.trim().toLowerCase();

    return cards.filter((card) => {
      if (nameQuery && !card.name.toLowerCase().includes(nameQuery)) {
        return false;
      }
      if (factionQuery && card.faction.toLowerCase() !== factionQuery) {
        return false;
      }
      if (typeQuery && card.type.toUpperCase() !== typeQuery) {
        return false;
      }
      if (rarityQuery && card.rarity.toUpperCase() !== rarityQuery) {
        return false;
      }
      if (setIdQuery && !card.setId.toLowerCase().includes(setIdQuery)) {
        return false;
      }
      if (filters.maxEnergy !== undefined && filters.maxEnergy !== null) {
        if (card.energy === null || card.energy > Number(filters.maxEnergy)) {
          return false;
        }
      }
      if (filters.minMight !== undefined && filters.minMight !== null) {
        if (card.might === null || card.might < Number(filters.minMight)) {
          return false;
        }
      }
      if (filters.banned !== undefined && filters.banned !== null) {
        const isBanned = String(filters.banned) === 'true';
        if (card.banned !== isBanned) {
          return false;
        }
      }
      return true;
    });
  },

  async getCards(page = 1, pageSize = 20): Promise<PaginatedCardsResponse> {
    // Fast path: usa cache em memória se disponível
    if (memoryCardsCache && memoryCardsCache.length > 0) {
      const validPage = Math.max(1, page);
      const validPageSize = Math.max(1, Math.min(100, pageSize));
      const total = memoryCardsCache.length;
      const totalPages = Math.ceil(total / validPageSize);
      const startIndex = (validPage - 1) * validPageSize;
      const items = memoryCardsCache.slice(startIndex, startIndex + validPageSize);
      return {
        items,
        total,
        page: validPage,
        pageSize: validPageSize,
        totalPages
      };
    }

    const query = new URLSearchParams({
      page: String(page),
      pageSize: String(pageSize)
    });
    return request<PaginatedCardsResponse>(`/cards?${query.toString()}`);
  },

  async searchCards(filters: CardFilterParams): Promise<Card[]> {
    // Fast path: se o catálogo já foi carregado, filtra instantaneamente sem requisição de rede
    if (memoryCardsCache && memoryCardsCache.length > 0) {
      return this.filterCardsInMemory(memoryCardsCache, filters);
    }

    // Carrega o catálogo completo em background e filtra
    try {
      const all = await this.getAllCards();
      if (all.length > 0) {
        return this.filterCardsInMemory(all, filters);
      }
    } catch {
      // Fallback para endpoint remoto
    }

    const query = new URLSearchParams();
    if (filters.name) query.set('name', filters.name);
    if (filters.faction) query.set('faction', filters.faction);
    if (filters.type) query.set('type', filters.type);
    if (filters.setId) query.set('setId', filters.setId);
    if (filters.rarity) query.set('rarity', filters.rarity);
    if (filters.maxEnergy !== undefined && filters.maxEnergy !== null) {
      query.set('maxEnergy', String(filters.maxEnergy));
    }
    if (filters.minMight !== undefined && filters.minMight !== null) {
      query.set('minMight', String(filters.minMight));
    }
    if (filters.banned !== undefined && filters.banned !== null) {
      query.set('banned', String(filters.banned));
    }

    return request<Card[]>(`/cards/search?${query.toString()}`);
  },

  async getCardById(id: string): Promise<Card> {
    if (memoryCardsCache) {
      const local = memoryCardsCache.find((c) => c.id === id);
      if (local && local.description) {
        return local;
      }
    }
    return request<Card>(`/cards/${encodeURIComponent(id)}`);
  },

  async syncCards(): Promise<{ success: boolean; message: string; totalCards: number }> {
    const res = await request<{ success: boolean; message: string; totalCards: number }>('/cards/sync', {
      method: 'POST'
    });
    // Força atualização do cache local
    await this.getAllCards(true);
    return res;
  }
};

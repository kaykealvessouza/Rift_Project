import { CARD_CATALOG } from '../catalog.js';
import { Card, CardFilterParams, PaginatedCardsResponse } from '../types.js';
import { riftScribeClient } from './riftScribeClient.js';
import { CardMapper } from './cardMapper.js';

export class CardService {
  private catalog: Card[] = [...CARD_CATALOG];
  private isSyncing = false;

  constructor() {
    // Sincroniza em background caso haja novas cartas na API sem sobrescrever as descrições em cache
    this.syncFromRiftScribe().catch((err) => {
      console.warn('[CardService] Sincronização em background inicial concluída:', err?.message);
    });
  }

  public async syncFromRiftScribe(): Promise<{ count: number }> {
    if (this.isSyncing) {
      return { count: this.catalog.length };
    }

    this.isSyncing = true;
    try {
      console.log('[CardService] Sincronizando catálogo com a API RiftScribe (https://riftscribe.gg/api)...');
      const apiResponses = await riftScribeClient.getAllCards(100);
      if (apiResponses && apiResponses.length > 0) {
        // Preserva descrições e detalhes já cacheados
        const existingMap = new Map<string, Card>(this.catalog.map((c) => [c.id, c]));
        
        const mapped = apiResponses.map((r) => {
          const fresh = CardMapper.toCard(r);
          const existing = existingMap.get(fresh.id);
          if (existing) {
            if (!fresh.description && existing.description) fresh.description = existing.description;
            if (!fresh.flavorText && existing.flavorText) fresh.flavorText = existing.flavorText;
          }
          return fresh;
        });

        this.catalog = mapped;
        console.log(`[CardService] Catálogo sincronizado com sucesso: ${mapped.length} cartas.`);
        return { count: mapped.length };
      }
    } catch (error) {
      console.error('[CardService] Erro ao sincronizar com RiftScribe API:', error);
    } finally {
      this.isSyncing = false;
    }

    return { count: this.catalog.length };
  }

  public getCards(page = 1, pageSize = 20): PaginatedCardsResponse {
    const validPage = Math.max(1, page);
    const validPageSize = Math.max(1, Math.min(100, pageSize));
    const total = this.catalog.length;
    const totalPages = Math.ceil(total / validPageSize);

    const startIndex = (validPage - 1) * validPageSize;
    const items = this.catalog.slice(startIndex, startIndex + validPageSize);

    return {
      items,
      total,
      page: validPage,
      pageSize: validPageSize,
      totalPages
    };
  }

  public searchCards(filters: CardFilterParams): Card[] {
    return this.catalog.filter((card) => {
      if (filters.name && !card.name.toLowerCase().includes(filters.name.toLowerCase().trim())) {
        return false;
      }
      if (filters.faction && card.faction.toLowerCase() !== filters.faction.toLowerCase().trim()) {
        return false;
      }
      if (filters.type && card.type.toUpperCase() !== filters.type.toUpperCase().trim()) {
        return false;
      }
      if (filters.rarity && card.rarity.toUpperCase() !== filters.rarity.toUpperCase().trim()) {
        return false;
      }
      if (filters.setId && !card.setId.toLowerCase().includes(filters.setId.toLowerCase().trim())) {
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
  }

  public async getDetailedCard(id: string): Promise<Card | null> {
    const localCard = this.catalog.find((c) => c.id === id);
    if (localCard && localCard.description) {
      return localCard;
    }

    try {
      const apiCard = await riftScribeClient.getCardById(id);
      if (apiCard) {
        const mapped = CardMapper.toCard(apiCard);
        const idx = this.catalog.findIndex((c) => c.id === id);
        if (idx !== -1) {
          this.catalog[idx] = { ...this.catalog[idx], ...mapped };
          return this.catalog[idx];
        } else {
          this.catalog.push(mapped);
          return mapped;
        }
      }
    } catch (err) {
      console.warn(`[CardService] Falha ao buscar carta detalhada ${id} na API externa:`, err);
    }

    return localCard || null;
  }

  public async getCardByIdAsync(id: string): Promise<Card | null> {
    return this.getDetailedCard(id);
  }

  public getCardById(id: string): Card | null {
    const card = this.catalog.find((c) => c.id === id);
    return card || null;
  }

  public findByNameExact(name: string): Card | null {
    const normalizedTarget = name.trim().toLowerCase();
    return this.catalog.find((c) => c.name.trim().toLowerCase() === normalizedTarget) || null;
  }

  public getAllCards(): Card[] {
    return [...this.catalog];
  }
}

export const cardService = new CardService();



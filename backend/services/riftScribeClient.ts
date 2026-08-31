import { CardApiResponse } from '../types.js';

export class RiftScribeClient {
  private static readonly BASE_URL = 'https://riftscribe.gg/api';

  public async searchCards(query: string): Promise<any[]> {
    const url = `${RiftScribeClient.BASE_URL}/cards/search?q=${encodeURIComponent(query)}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Erro HTTP ao buscar cartas: ${response.status}`);
    }
    return await response.json();
  }

  public async getCardById(cardId: string): Promise<CardApiResponse | null> {
    const url = `${RiftScribeClient.BASE_URL}/cards/${encodeURIComponent(cardId)}`;
    const response = await fetch(url);
    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error(`Erro HTTP: ${response.status}`);
    }
    return await response.json();
  }

  public async getCardsRaw(limit: number, offset: number): Promise<CardApiResponse[]> {
    const url = `${RiftScribeClient.BASE_URL}/cards?limit=${limit}&offset=${offset}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Erro HTTP: ${response.status}`);
    }
    return await response.json();
  }

  public async getAllCards(pageSize = 100): Promise<CardApiResponse[]> {
    const allCards: CardApiResponse[] = [];
    let offset = 0;

    while (true) {
      try {
        const batch = await this.getCardsRaw(pageSize, offset);
        if (!batch || batch.length === 0) {
          break;
        }

        allCards.push(...batch);

        if (batch.length < pageSize) {
          break;
        }

        offset += pageSize;
      } catch (error) {
        console.warn(`[RiftScribeClient] Falha ao buscar lote offset=${offset}:`, error);
        break;
      }
    }

    return allCards;
  }
}

export const riftScribeClient = new RiftScribeClient();

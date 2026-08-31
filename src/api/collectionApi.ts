import { request } from './client.js';
import { CollectionCard } from '../types/index.js';

export const collectionApi = {
  getCollection(): Promise<CollectionCard[]> {
    return request<CollectionCard[]>('/collection');
  },

  getCompletion(): Promise<{ percentage: number }> {
    return request<{ percentage: number }>('/collection/completion');
  },

  addCard(cardId: string, quantity = 1): Promise<CollectionCard> {
    return request<CollectionCard>('/collection/cards', {
      method: 'POST',
      body: JSON.stringify({ cardId, quantity })
    });
  },

  decreaseCard(cardId: string, quantity = 1): Promise<{ cardId: string; quantity: number }> {
    return request<{ cardId: string; quantity: number }>(`/collection/cards/${encodeURIComponent(cardId)}/decrease`, {
      method: 'PATCH',
      body: JSON.stringify({ quantity })
    });
  },

  deleteCard(cardId: string): Promise<{ message: string }> {
    return request<{ message: string }>(`/collection/cards/${encodeURIComponent(cardId)}`, {
      method: 'DELETE'
    });
  },

  getCardQuantity(cardId: string): Promise<{ quantity: number }> {
    return request<{ quantity: number }>(`/collection/cards/${encodeURIComponent(cardId)}/quantity`);
  }
};

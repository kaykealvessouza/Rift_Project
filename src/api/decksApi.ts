import { request } from './client.js';
import { CardZone, Deck, DeckCard, DeckValidationResult } from '../types/index.js';

export const decksApi = {
  getDecks(): Promise<Deck[]> {
    return request<Deck[]>('/decks');
  },

  createDeck(name: string): Promise<Deck> {
    return request<Deck>('/decks', {
      method: 'POST',
      body: JSON.stringify({ name })
    });
  },

  renameDeck(id: number, name: string): Promise<Deck> {
    return request<Deck>(`/decks/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ name })
    });
  },

  deleteDeck(id: number): Promise<{ message: string }> {
    return request<{ message: string }>(`/decks/${id}`, {
      method: 'DELETE'
    });
  },

  getDeckCards(id: number): Promise<DeckCard[]> {
    return request<DeckCard[]>(`/decks/${id}/cards`);
  },

  addCardToDeck(id: number, cardId: string, quantity: number, zone: CardZone): Promise<DeckCard[]> {
    return request<DeckCard[]>(`/decks/${id}/cards`, {
      method: 'POST',
      body: JSON.stringify({ cardId, quantity, zone })
    });
  },

  deleteCardFromDeck(id: number, cardId: string): Promise<{ message: string }> {
    return request<{ message: string }>(`/decks/${id}/cards/${encodeURIComponent(cardId)}`, {
      method: 'DELETE'
    });
  },

  decreaseCardInDeck(id: number, cardId: string, quantity = 1): Promise<DeckCard[]> {
    return request<DeckCard[]>(`/decks/${id}/cards/${encodeURIComponent(cardId)}/decrease`, {
      method: 'PATCH',
      body: JSON.stringify({ quantity })
    });
  },

  validateDeck(id: number): Promise<DeckValidationResult> {
    return request<DeckValidationResult>(`/decks/${id}/validate`);
  },

  getMissingCards(id: number): Promise<Record<string, number>> {
    return request<Record<string, number>>(`/decks/${id}/missing`);
  },

  getDeckCompletion(id: number): Promise<{ percentage: number }> {
    return request<{ percentage: number }>(`/decks/${id}/completion`);
  }
};

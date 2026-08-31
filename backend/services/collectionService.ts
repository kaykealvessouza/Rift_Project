import { store } from '../store.js';
import { CollectionCard } from '../types.js';
import { cardService } from './cardService.js';

export class CollectionService {
  public getCollection(): CollectionCard[] {
    const result: CollectionCard[] = [];

    for (const [cardId, quantity] of store.collection.entries()) {
      if (quantity > 0) {
        const card = cardService.getCardById(cardId);
        if (card) {
          result.push({ card, quantity });
        }
      }
    }

    // Ordena por nome da carta
    result.sort((a, b) => a.card.name.localeCompare(b.card.name));
    return result;
  }

  public getCompletionPercentage(): number {
    const totalCardsInCatalog = cardService.getAllCards().length;
    if (totalCardsInCatalog === 0) return 0;

    let distinctOwned = 0;
    for (const [, quantity] of store.collection.entries()) {
      if (quantity >= 1) {
        distinctOwned++;
      }
    }

    const rawPercentage = (distinctOwned / totalCardsInCatalog) * 100;
    return Math.round(rawPercentage * 100) / 100;
  }

  public addCard(cardId: string, quantity = 1): CollectionCard {
    const card = cardService.getCardById(cardId);
    if (!card) {
      const error: any = new Error(`Nenhuma carta encontrada com o ID "${cardId}" no catálogo.`);
      error.status = 404;
      throw error;
    }

    if (!quantity || quantity <= 0) {
      const error: any = new Error('A quantidade deve ser um número maior que zero.');
      error.status = 400;
      throw error;
    }

    const currentQty = store.collection.get(cardId) || 0;
    const newQty = currentQty + quantity;
    store.collection.set(cardId, newQty);

    return {
      card,
      quantity: newQty
    };
  }

  public decreaseCard(cardId: string, quantity = 1): { cardId: string; quantity: number } {
    if (!quantity || quantity <= 0) {
      const error: any = new Error('A quantidade deve ser um número maior que zero.');
      error.status = 400;
      throw error;
    }

    const currentQty = store.collection.get(cardId);
    if (currentQty === undefined || currentQty <= 0) {
      const error: any = new Error(`Carta com o ID "${cardId}" não encontrada na coleção.`);
      error.status = 404;
      throw error;
    }

    const newQty = currentQty - quantity;
    if (newQty <= 0) {
      store.collection.delete(cardId);
      return { cardId, quantity: 0 };
    } else {
      store.collection.set(cardId, newQty);
      return { cardId, quantity: newQty };
    }
  }

  public deleteCard(cardId: string): void {
    if (!store.collection.has(cardId)) {
      const error: any = new Error(`Carta com o ID "${cardId}" não encontrada na coleção.`);
      error.status = 404;
      throw error;
    }
    store.collection.delete(cardId);
  }

  public getCardQuantity(cardId: string): number {
    return store.collection.get(cardId) || 0;
  }
}

export const collectionService = new CollectionService();

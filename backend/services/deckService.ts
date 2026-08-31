import { store } from '../store.js';
import { CardZone, Deck, DeckCard, DeckValidationResult, VALID_ZONES } from '../types.js';
import { cardService } from './cardService.js';
import { DeckValidator } from './deckValidator.js';

export class DeckService {
  public getDecks(): Deck[] {
    return [...store.decks];
  }

  public getDeckById(id: number): Deck | null {
    return store.decks.find((d) => d.id === id) || null;
  }

  public createDeck(name: string): Deck {
    const trimmedName = name ? name.trim() : '';
    if (!trimmedName) {
      const error: any = new Error('O nome do deck não pode estar vazio.');
      error.status = 400;
      throw error;
    }

    const existing = store.decks.find(
      (d) => d.name.toLowerCase() === trimmedName.toLowerCase()
    );
    if (existing) {
      const error: any = new Error(`Já existe um deck chamado "${trimmedName}".`);
      error.status = 409;
      throw error;
    }

    const newDeck: Deck = {
      id: store.getNextDeckId(),
      name: trimmedName
    };

    store.decks.push(newDeck);
    store.deckCards.set(newDeck.id, []);

    return newDeck;
  }

  public renameDeck(id: number, newName: string): Deck {
    const deck = store.decks.find((d) => d.id === id);
    if (!deck) {
      const error: any = new Error(`Nenhum deck encontrado com o ID ${id}.`);
      error.status = 404;
      throw error;
    }

    const trimmedName = newName ? newName.trim() : '';
    if (!trimmedName) {
      const error: any = new Error('O novo nome do deck não pode estar vazio.');
      error.status = 400;
      throw error;
    }

    const existingWithSameName = store.decks.find(
      (d) => d.id !== id && d.name.toLowerCase() === trimmedName.toLowerCase()
    );
    if (existingWithSameName) {
      const error: any = new Error(`Já existe um deck chamado "${trimmedName}".`);
      error.status = 409;
      throw error;
    }

    deck.name = trimmedName;
    return deck;
  }

  public deleteDeck(id: number): void {
    const index = store.decks.findIndex((d) => d.id === id);
    if (index === -1) {
      const error: any = new Error(`Nenhum deck encontrado com o ID ${id}.`);
      error.status = 404;
      throw error;
    }

    store.decks.splice(index, 1);
    store.deckCards.delete(id);
  }

  public getDeckCards(deckId: number): DeckCard[] {
    const deck = this.getDeckById(deckId);
    if (!deck) {
      const error: any = new Error(`Nenhum deck encontrado com o ID ${deckId}.`);
      error.status = 404;
      throw error;
    }

    return store.deckCards.get(deckId) || [];
  }

  public addCardToDeck(
    deckId: number,
    cardId: string,
    quantity: number,
    zone: string
  ): DeckCard[] {
    // 1. Validar se o deck existe
    const deck = this.getDeckById(deckId);
    if (!deck) {
      const error: any = new Error(`Nenhum deck encontrado com o ID ${deckId}.`);
      error.status = 404;
      throw error;
    }

    // 2. Validar se zone é válida (case-sensitive)
    if (!VALID_ZONES.includes(zone as CardZone)) {
      const error: any = new Error(
        `Zona inválida: "${zone}". Zonas válidas: LEGEND, CHAMPION, MAIN, RUNE, BATTLEFIELD, SIDEBOARD, SIDEBOARD_BATTLEFIELD.`
      );
      error.status = 400;
      throw error;
    }

    // 3. Validar se cardId existe no catálogo de cartas
    const card = cardService.getCardById(cardId);
    if (!card) {
      const error: any = new Error(`Nenhuma carta encontrada com o ID "${cardId}" no catálogo.`);
      error.status = 404;
      throw error;
    }

    const validQty = Math.max(1, quantity || 1);
    const typedZone = zone as CardZone;

    const cards = store.deckCards.get(deckId) || [];
    const existingIndex = cards.findIndex(
      (c) => c.cardId === cardId && c.zone === typedZone
    );

    if (existingIndex !== -1) {
      cards[existingIndex].quantity += validQty;
    } else {
      cards.push({
        cardId,
        quantity: validQty,
        zone: typedZone
      });
    }

    store.deckCards.set(deckId, cards);
    return cards;
  }

  public deleteCardFromDeck(deckId: number, cardId: string): void {
    const deck = this.getDeckById(deckId);
    if (!deck) {
      const error: any = new Error(`Nenhum deck encontrado com o ID ${deckId}.`);
      error.status = 404;
      throw error;
    }

    const cards = store.deckCards.get(deckId) || [];
    const filtered = cards.filter((c) => c.cardId !== cardId);

    if (filtered.length === cards.length) {
      const error: any = new Error(`Carta com ID "${cardId}" não encontrada no deck.`);
      error.status = 404;
      throw error;
    }

    store.deckCards.set(deckId, filtered);
  }

  public decreaseCardInDeck(deckId: number, cardId: string, quantity = 1): DeckCard[] {
    const deck = this.getDeckById(deckId);
    if (!deck) {
      const error: any = new Error(`Nenhum deck encontrado com o ID ${deckId}.`);
      error.status = 404;
      throw error;
    }

    const validQty = Math.max(1, quantity || 1);
    const cards = store.deckCards.get(deckId) || [];
    const target = cards.find((c) => c.cardId === cardId);

    if (!target) {
      const error: any = new Error(`Carta com ID "${cardId}" não encontrada no deck.`);
      error.status = 404;
      throw error;
    }

    target.quantity -= validQty;

    const updated = cards.filter((c) => c.quantity > 0);
    store.deckCards.set(deckId, updated);
    return updated;
  }

  public validateDeck(deckId: number): DeckValidationResult {
    const deck = this.getDeckById(deckId);
    if (!deck) {
      const error: any = new Error(`Nenhum deck encontrado com o ID ${deckId}.`);
      error.status = 404;
      throw error;
    }

    const cards = store.deckCards.get(deckId) || [];
    return DeckValidator.validate(cards);
  }

  public getMissingCards(deckId: number): Record<string, number> {
    const deck = this.getDeckById(deckId);
    if (!deck) {
      const error: any = new Error(`Nenhum deck encontrado com o ID ${deckId}.`);
      error.status = 404;
      throw error;
    }

    const deckCards = store.deckCards.get(deckId) || [];
    // Agrupa a quantidade total necessária de cada carta no deck
    const neededMap: Record<string, number> = {};
    for (const item of deckCards) {
      neededMap[item.cardId] = (neededMap[item.cardId] || 0) + item.quantity;
    }

    const missing: Record<string, number> = {};
    for (const [cardId, needed] of Object.entries(neededMap)) {
      const owned = store.collection.get(cardId) || 0;
      if (owned < needed) {
        missing[cardId] = needed - owned;
      }
    }

    return missing;
  }

  public getDeckCompletion(deckId: number): { percentage: number } {
    const deck = this.getDeckById(deckId);
    if (!deck) {
      const error: any = new Error(`Nenhum deck encontrado com o ID ${deckId}.`);
      error.status = 404;
      throw error;
    }

    const deckCards = store.deckCards.get(deckId) || [];
    if (deckCards.length === 0) {
      return { percentage: 0 };
    }

    // Agrupa por cardId
    const neededMap: Record<string, number> = {};
    let totalNeeded = 0;

    for (const item of deckCards) {
      neededMap[item.cardId] = (neededMap[item.cardId] || 0) + item.quantity;
      totalNeeded += item.quantity;
    }

    if (totalNeeded === 0) {
      return { percentage: 100 };
    }

    let satisfiedCount = 0;
    for (const [cardId, needed] of Object.entries(neededMap)) {
      const owned = store.collection.get(cardId) || 0;
      satisfiedCount += Math.min(owned, needed);
    }

    const percentage = Math.round((satisfiedCount / totalNeeded) * 10000) / 100;
    return { percentage };
  }
}

export const deckService = new DeckService();

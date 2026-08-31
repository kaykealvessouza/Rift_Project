import { Deck, DeckCard } from './types.js';

class DataStore {
  // cardId -> quantity
  public collection: Map<string, number> = new Map();

  // Decks list
  public decks: Deck[] = [];

  // deckId -> DeckCard[]
  public deckCards: Map<number, DeckCard[]> = new Map();

  private nextDeckId = 1;

  constructor() {
    this.seedInitialData();
  }

  private seedInitialData() {
    // Seed initial player collection with real cards from RiftScribe
    this.collection.set('ogn-247-298', 1); // Daughter of the Void (Legend)
    this.collection.set('ogn-251-298', 1); // Loose Cannon (Legend)
    this.collection.set('ogn-027-298', 2); // Darius, Trifarian
    this.collection.set('ogn-030-298', 2); // Jinx, Demolitionist
    this.collection.set('ogn-039-298', 2); // Kai'Sa, Survivor
    this.collection.set('ogn-007-298', 15); // Fury Rune
    this.collection.set('ogn-042-298', 15); // Calm Rune
    this.collection.set('ogn-275-298', 3); // Altar to Unity (Battlefield)
    this.collection.set('ogn-276-298', 3); // Aspirant's Climb (Battlefield)
    this.collection.set('ogn-001-298', 3); // Blazing Scorcher
    this.collection.set('ogn-002-298', 3); // Brazen Buccaneer
    this.collection.set('ogn-003-298', 3); // Chemtech Enforcer
    this.collection.set('ogn-004-298', 3); // Cleave
    this.collection.set('ogn-005-298', 3); // Disintegrate
    this.collection.set('ogn-006-298', 3); // Flame Chompers
    this.collection.set('ogn-008-298', 3); // Get Excited!
    this.collection.set('ogn-009-298', 3); // Hextech Ray
    this.collection.set('ogn-010-298', 3); // Legion Rearguard

    // Seed a sample starter deck: "Fury Burn Deck"
    const deck1: Deck = { id: this.nextDeckId++, name: 'Fury Aggro' };
    this.decks.push(deck1);
    this.deckCards.set(deck1.id, [
      { cardId: 'ogn-247-298', quantity: 1, zone: 'LEGEND' },
      { cardId: 'ogn-027-298', quantity: 1, zone: 'CHAMPION' },
      { cardId: 'ogn-275-298', quantity: 3, zone: 'BATTLEFIELD' },
      { cardId: 'ogn-007-298', quantity: 12, zone: 'RUNE' },
      { cardId: 'ogn-001-298', quantity: 3, zone: 'MAIN' },
      { cardId: 'ogn-002-298', quantity: 3, zone: 'MAIN' },
      { cardId: 'ogn-003-298', quantity: 3, zone: 'MAIN' },
      { cardId: 'ogn-004-298', quantity: 3, zone: 'MAIN' },
      { cardId: 'ogn-005-298', quantity: 3, zone: 'MAIN' },
      { cardId: 'ogn-006-298', quantity: 3, zone: 'MAIN' },
      { cardId: 'ogn-008-298', quantity: 3, zone: 'MAIN' },
      { cardId: 'ogn-009-298', quantity: 3, zone: 'MAIN' },
      { cardId: 'ogn-010-298', quantity: 3, zone: 'MAIN' }
    ]);
  }

  public getNextDeckId(): number {
    return this.nextDeckId++;
  }

  public resetAll() {
    this.collection.clear();
    this.decks = [];
    this.deckCards.clear();
    this.nextDeckId = 1;
    this.seedInitialData();
  }
}

export const store = new DataStore();

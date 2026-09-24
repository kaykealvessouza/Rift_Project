import fs from 'fs';
import path from 'path';
import { Deck, DeckCard } from './types.js';

const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'store.json');

interface PersistedData {
  nextDeckId: number;
  collection: Record<string, number>;
  decks: Deck[];
  deckCards: Record<string, DeckCard[]>;
}

class DataStore {
  // cardId -> quantity
  public collection: Map<string, number> = new Map();

  // Decks list
  public decks: Deck[] = [];

  // deckId -> DeckCard[]
  public deckCards: Map<number, DeckCard[]> = new Map();

  private nextDeckId = 1;

  constructor() {
    this.init();
  }

  private init() {
    try {
      if (fs.existsSync(DATA_FILE)) {
        const raw = fs.readFileSync(DATA_FILE, 'utf-8');
        const parsed: PersistedData = JSON.parse(raw);

        if (parsed && typeof parsed === 'object') {
          this.nextDeckId = typeof parsed.nextDeckId === 'number' ? parsed.nextDeckId : 1;
          this.decks = Array.isArray(parsed.decks) ? parsed.decks : [];

          this.collection.clear();
          if (parsed.collection && typeof parsed.collection === 'object') {
            for (const [cardId, qty] of Object.entries(parsed.collection)) {
              if (typeof qty === 'number' && qty > 0) {
                this.collection.set(cardId, qty);
              }
            }
          }

          this.deckCards.clear();
          if (parsed.deckCards && typeof parsed.deckCards === 'object') {
            for (const [deckIdStr, cards] of Object.entries(parsed.deckCards)) {
              const deckId = parseInt(deckIdStr, 10);
              if (!isNaN(deckId) && Array.isArray(cards)) {
                this.deckCards.set(deckId, cards);
              }
            }
          }

          console.log(`[DataStore] Dados carregados de data/store.json: ${this.collection.size} cartas na coleção, ${this.decks.length} decks.`);
          return;
        }
      }
    } catch (err) {
      console.warn('[DataStore] Erro ao ler store.json, inicializando com seed padrão:', err);
    }

    // Inicializa com dados padrão e persiste o primeiro arquivo
    this.seedInitialData();
    this.save();
  }

  public save() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      const collectionObj: Record<string, number> = {};
      for (const [cardId, qty] of this.collection.entries()) {
        collectionObj[cardId] = qty;
      }

      const deckCardsObj: Record<string, DeckCard[]> = {};
      for (const [deckId, cards] of this.deckCards.entries()) {
        deckCardsObj[deckId.toString()] = cards;
      }

      const payload: PersistedData = {
        nextDeckId: this.nextDeckId,
        collection: collectionObj,
        decks: this.decks,
        deckCards: deckCardsObj
      };

      const tmpFile = `${DATA_FILE}.tmp`;
      fs.writeFileSync(tmpFile, JSON.stringify(payload, null, 2), 'utf-8');
      fs.renameSync(tmpFile, DATA_FILE);
    } catch (err) {
      console.error('[DataStore] Erro ao salvar dados no arquivo JSON:', err);
    }
  }

  private seedInitialData() {
    this.collection.clear();
    this.decks = [];
    this.deckCards.clear();
    this.nextDeckId = 1;

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
    const id = this.nextDeckId++;
    this.save();
    return id;
  }

  public resetAll() {
    this.seedInitialData();
    this.save();
  }
}

export const store = new DataStore();

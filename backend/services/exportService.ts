import { CardZone, VALID_ZONES } from '../types.js';
import { cardService } from './cardService.js';
import { collectionService } from './collectionService.js';
import { deckService } from './deckService.js';

export class ExportService {
  public exportCollection(): string {
    const items = collectionService.getCollection();
    const lines = items.map((item) => `${item.quantity} ${item.card.name}`);
    return lines.join('\n');
  }

  public exportDeck(deckId: number): string {
    const deck = deckService.getDeckById(deckId);
    if (!deck) {
      const error: any = new Error(`Nenhum deck encontrado com o ID ${deckId}.`);
      error.status = 404;
      throw error;
    }

    const cards = deckService.getDeckCards(deckId);
    const sections: string[] = [];

    // Para cada zona na ordem oficial
    for (const zone of VALID_ZONES) {
      const zoneCards = cards.filter((c) => c.zone === zone);
      if (zoneCards.length > 0) {
        const lines: string[] = [`# ${zone}`];
        for (const entry of zoneCards) {
          const card = cardService.getCardById(entry.cardId);
          const name = card ? card.name : entry.cardId;
          lines.push(`${entry.quantity} ${name}`);
        }
        sections.push(lines.join('\n'));
      }
    }

    return sections.join('\n\n');
  }
}

export const exportService = new ExportService();

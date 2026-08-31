import { CardZone, DeckCard, DeckValidationResult } from '../types.js';

export class DeckValidator {
  public static validate(cards: DeckCard[]): DeckValidationResult {
    const counts: Record<CardZone, number> = {
      LEGEND: 0,
      CHAMPION: 0,
      MAIN: 0,
      RUNE: 0,
      BATTLEFIELD: 0,
      SIDEBOARD: 0,
      SIDEBOARD_BATTLEFIELD: 0
    };

    for (const entry of cards) {
      if (counts[entry.zone] !== undefined) {
        counts[entry.zone] += entry.quantity;
      }
    }

    const errors: string[] = [];
    const warnings: string[] = [];

    // Regras obrigatórias (Erros)
    if (counts.LEGEND !== 1) {
      errors.push(`Zona LEGEND deve conter exatamente 1 carta (atualmente: ${counts.LEGEND}).`);
    }

    if (counts.CHAMPION !== 1) {
      errors.push(`Zona CHAMPION deve conter exatamente 1 carta (atualmente: ${counts.CHAMPION}).`);
    }

    if (counts.MAIN !== 39) {
      errors.push(`Zona MAIN deve conter exatamente 39 cartas (atualmente: ${counts.MAIN}).`);
    }

    if (counts.RUNE !== 12) {
      errors.push(`Zona RUNE deve conter exatamente 12 cartas (atualmente: ${counts.RUNE}).`);
    }

    if (counts.BATTLEFIELD !== 3) {
      errors.push(`Zona BATTLEFIELD deve conter exatamente 3 cartas (atualmente: ${counts.BATTLEFIELD}).`);
    }

    // Regra: Não pode haver mais de 1 cópia do mesmo Battlefield
    const battlefieldCards = cards.filter((c) => c.zone === 'BATTLEFIELD');
    for (const bf of battlefieldCards) {
      if (bf.quantity > 1) {
        errors.push(`A zona BATTLEFIELD não permite cartas repetidas (carta ${bf.cardId} possui ${bf.quantity} cópias). Cada campo de batalha deve ser único.`);
      }
    }

    // Regras de aviso (Warnings)
    if (counts.SIDEBOARD > 8) {
      warnings.push(`Zona SIDEBOARD deve conter no máximo 8 cartas (atualmente: ${counts.SIDEBOARD}).`);
    }

    if (counts.SIDEBOARD_BATTLEFIELD > 2) {
      warnings.push(`Zona SIDEBOARD_BATTLEFIELD deve conter no máximo 2 cartas (atualmente: ${counts.SIDEBOARD_BATTLEFIELD}).`);
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }
}


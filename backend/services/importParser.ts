import { Card, ImportEntry, ImportResult, MatchedCard, ParserError } from '../types.js';
import { cardService } from './cardService.js';

export class ImportParser {
  public static parse(text: string): ImportResult {
    const lines = text.split(/\r?\n/);
    const foundCards: MatchedCard[] = [];
    const notFoundCards: ImportEntry[] = [];
    const parserErrors: ParserError[] = [];

    for (let i = 0; i < lines.length; i++) {
      const rawLine = lines[i];
      const trimmedLine = rawLine.trim();
      const lineNumber = i + 1; // 1-based line number

      // Ignora linhas em branco
      if (!trimmedLine) {
        continue;
      }

      // Ignora comentários (#, //, --)
      if (
        trimmedLine.startsWith('#') ||
        trimmedLine.startsWith('//') ||
        trimmedLine.startsWith('--')
      ) {
        continue;
      }

      // Procura o primeiro espaço ou tabulação separando quantidade e nome
      const match = trimmedLine.match(/^(\S+)\s+(.+)$/);
      if (!match) {
        parserErrors.push({
          line: lineNumber,
          content: rawLine
        });
        continue;
      }

      const qtyStr = match[1];
      const rawName = match[2];

      // Quantidade deve ser um inteiro estritamente positivo (> 0)
      if (!/^\d+$/.test(qtyStr)) {
        parserErrors.push({
          line: lineNumber,
          content: rawLine
        });
        continue;
      }

      const quantity = parseInt(qtyStr, 10);
      if (quantity <= 0) {
        parserErrors.push({
          line: lineNumber,
          content: rawLine
        });
        continue;
      }

      // Normaliza espaços múltiplos para um único espaço
      const normalizedCardName = rawName.replace(/\s+/g, ' ').trim();
      if (!normalizedCardName) {
        parserErrors.push({
          line: lineNumber,
          content: rawLine
        });
        continue;
      }

      // Busca a carta no catálogo por nome exato (case-insensitive)
      const matchedCard: Card | null = cardService.findByNameExact(normalizedCardName);

      const entry: ImportEntry = {
        cardName: normalizedCardName,
        quantity,
        line: lineNumber
      };

      if (matchedCard) {
        foundCards.push({
          entry,
          card: matchedCard
        });
      } else {
        notFoundCards.push(entry);
      }
    }

    const success = parserErrors.length === 0 && notFoundCards.length === 0;

    return {
      foundCards,
      notFoundCards,
      parserErrors,
      success
    };
  }
}

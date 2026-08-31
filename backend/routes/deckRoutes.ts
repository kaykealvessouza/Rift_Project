import { Router, Request, Response, NextFunction } from 'express';
import { deckService } from '../services/deckService.js';

export const deckRoutes = Router();

// GET /decks - Lista todos os decks
deckRoutes.get('/', (req: Request, res: Response, next: NextFunction) => {
  try {
    const decks = deckService.getDecks();
    res.json(decks);
  } catch (error) {
    next(error);
  }
});

// POST /decks - Cria um novo deck
deckRoutes.post('/', (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name } = req.body;
    const newDeck = deckService.createDeck(name);
    res.status(201).json(newDeck);
  } catch (error) {
    next(error);
  }
});

// PATCH /decks/:id - Renomeia um deck
deckRoutes.patch('/:id', (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { name } = req.body;
    const updated = deckService.renameDeck(id, name);
    res.json(updated);
  } catch (error) {
    next(error);
  }
});

// DELETE /decks/:id - Exclui deck e suas cartas
deckRoutes.delete('/:id', (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id, 10);
    deckService.deleteDeck(id);
    res.json({ message: `Deck ${id} excluído com sucesso.` });
  } catch (error) {
    next(error);
  }
});

// GET /decks/:id/cards - Lista cartas do deck
deckRoutes.get('/:id/cards', (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id, 10);
    const cards = deckService.getDeckCards(id);
    res.json(cards);
  } catch (error) {
    next(error);
  }
});

// POST /decks/:id/cards - Adiciona carta ao deck
deckRoutes.post('/:id/cards', (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { cardId, quantity, zone } = req.body;

    const cards = deckService.addCardToDeck(
      id,
      cardId,
      Number(quantity) || 1,
      zone
    );
    res.status(200).json(cards);
  } catch (error) {
    next(error);
  }
});

// DELETE /decks/:id/cards/:cardId - Remove carta do deck totalmente
deckRoutes.delete('/:id/cards/:cardId', (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { cardId } = req.params;

    deckService.deleteCardFromDeck(id, cardId);
    res.json({ message: `Carta "${cardId}" removida do deck com sucesso.` });
  } catch (error) {
    next(error);
  }
});

// PATCH /decks/:id/cards/:cardId/decrease - Diminui quantidade da carta no deck
deckRoutes.patch('/:id/cards/:cardId/decrease', (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { cardId } = req.params;
    const { quantity } = req.body;

    const updated = deckService.decreaseCardInDeck(id, cardId, Number(quantity) || 1);
    res.json(updated);
  } catch (error) {
    next(error);
  }
});

// GET /decks/:id/validate - Retorna resultado da validação
deckRoutes.get('/:id/validate', (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id, 10);
    const validation = deckService.validateDeck(id);
    res.json(validation);
  } catch (error) {
    next(error);
  }
});

// GET /decks/:id/missing - Retorna cartas faltantes vs. coleção
deckRoutes.get('/:id/missing', (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id, 10);
    const missing = deckService.getMissingCards(id);
    res.json(missing);
  } catch (error) {
    next(error);
  }
});

// GET /decks/:id/completion - Porcentagem de conclusão do deck
deckRoutes.get('/:id/completion', (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id, 10);
    const completion = deckService.getDeckCompletion(id);
    res.json(completion);
  } catch (error) {
    next(error);
  }
});

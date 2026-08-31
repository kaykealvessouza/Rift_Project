import { Router, Request, Response, NextFunction } from 'express';
import { collectionService } from '../services/collectionService.js';

export const collectionRoutes = Router();

// GET /collection - Lista todas as cartas da coleção
collectionRoutes.get('/', (req: Request, res: Response, next: NextFunction) => {
  try {
    const items = collectionService.getCollection();
    res.json(items);
  } catch (error) {
    next(error);
  }
});

// GET /collection/completion - Porcentagem de conclusão da coleção
collectionRoutes.get('/completion', (req: Request, res: Response, next: NextFunction) => {
  try {
    const percentage = collectionService.getCompletionPercentage();
    res.json({ percentage });
  } catch (error) {
    next(error);
  }
});

// POST /collection/cards - Adiciona ou soma quantidade à coleção
collectionRoutes.post('/cards', (req: Request, res: Response, next: NextFunction) => {
  try {
    const { cardId, quantity } = req.body;
    if (!cardId) {
      const error: any = new Error('O campo "cardId" é obrigatório.');
      error.status = 400;
      return next(error);
    }

    const updated = collectionService.addCard(cardId, Number(quantity) || 1);
    res.status(200).json(updated);
  } catch (error) {
    next(error);
  }
});

// PATCH /collection/cards/:cardId/decrease - Diminui quantidade
collectionRoutes.patch('/cards/:cardId/decrease', (req: Request, res: Response, next: NextFunction) => {
  try {
    const { cardId } = req.params;
    const { quantity } = req.body;

    const result = collectionService.decreaseCard(cardId, Number(quantity) || 1);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// DELETE /collection/cards/:cardId - Remove totalmente da coleção
collectionRoutes.delete('/cards/:cardId', (req: Request, res: Response, next: NextFunction) => {
  try {
    const { cardId } = req.params;
    collectionService.deleteCard(cardId);
    res.json({ message: `Carta com o ID "${cardId}" removida da coleção com sucesso.` });
  } catch (error) {
    next(error);
  }
});

// GET /collection/cards/:cardId/quantity - Quantidade possuída
collectionRoutes.get('/cards/:cardId/quantity', (req: Request, res: Response, next: NextFunction) => {
  try {
    const { cardId } = req.params;
    const quantity = collectionService.getCardQuantity(cardId);
    res.json({ quantity });
  } catch (error) {
    next(error);
  }
});

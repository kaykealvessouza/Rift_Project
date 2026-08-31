import { Router, Request, Response, NextFunction } from 'express';
import { cardService } from '../services/cardService.js';
import { CardFilterParams } from '../types.js';

export const cardRoutes = Router();

// GET /cards - Lista cartas com paginação
cardRoutes.get('/', (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string, 10) || 1;
    const pageSize = parseInt(req.query.pageSize as string, 10) || 20;

    const result = cardService.getCards(page, pageSize);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// GET /cards/search - Busca com filtros
cardRoutes.get('/search', (req: Request, res: Response, next: NextFunction) => {
  try {
    const filters: CardFilterParams = {
      name: req.query.name as string | undefined,
      faction: req.query.faction as string | undefined,
      type: req.query.type as string | undefined,
      setId: req.query.setId as string | undefined,
      rarity: req.query.rarity as string | undefined,
      maxEnergy: req.query.maxEnergy !== undefined ? Number(req.query.maxEnergy) : undefined,
      minMight: req.query.minMight !== undefined ? Number(req.query.minMight) : undefined,
      banned: req.query.banned !== undefined ? String(req.query.banned) === 'true' : undefined
    };

    const results = cardService.searchCards(filters);
    res.json(results);
  } catch (error) {
    next(error);
  }
});

// GET /cards/all - Retorna todas as cartas em cache para inicialização ultrarrápida do frontend
cardRoutes.get('/all', (req: Request, res: Response, next: NextFunction) => {
  try {
    const allCards = cardService.getAllCards();
    res.json(allCards);
  } catch (error) {
    next(error);
  }
});

// POST /cards/sync - Força sincronização com a API oficial RiftScribe
cardRoutes.post('/sync', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await cardService.syncFromRiftScribe();
    res.json({
      success: true,
      message: `Catálogo sincronizado com a API oficial RiftScribe.`,
      totalCards: result.count
    });
  } catch (error) {
    next(error);
  }
});

// GET /cards/:id - Detalhe de uma carta
cardRoutes.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const card = await cardService.getCardByIdAsync(id);

    if (!card) {
      const error: any = new Error(`Nenhuma carta encontrada com o ID "${id}" no catálogo.`);
      error.status = 404;
      return next(error);
    }

    res.json(card);
  } catch (error) {
    next(error);
  }
});

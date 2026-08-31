import { Router, Request, Response, NextFunction } from 'express';
import { collectionService } from '../services/collectionService.js';
import { exportService } from '../services/exportService.js';
import { ImportParser } from '../services/importParser.js';

export const importExportRoutes = Router();

// POST /import/collection - Importa texto para a coleção
importExportRoutes.post('/import/collection', (req: Request, res: Response, next: NextFunction) => {
  try {
    const { text } = req.body;
    if (typeof text !== 'string') {
      const error: any = new Error('O campo "text" com a lista de importação é obrigatório.');
      error.status = 400;
      return next(error);
    }

    const parseResult = ImportParser.parse(text);

    // Só salva se não houver NENHUM erro de parsing e NENHUMA carta não encontrada
    if (parseResult.success) {
      for (const matched of parseResult.foundCards) {
        collectionService.addCard(matched.card.id, matched.entry.quantity);
      }
    }

    res.json(parseResult);
  } catch (error) {
    next(error);
  }
});

// GET /export/collection - Exporta coleção em formato texto
importExportRoutes.get('/export/collection', (req: Request, res: Response, next: NextFunction) => {
  try {
    const text = exportService.exportCollection();
    res.json({ text });
  } catch (error) {
    next(error);
  }
});

// GET /decks/:id/export - Exporta deck agrupado por zona em formato texto
importExportRoutes.get('/decks/:id/export', (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id, 10);
    const text = exportService.exportDeck(id);
    res.json({ text });
  } catch (error) {
    next(error);
  }
});

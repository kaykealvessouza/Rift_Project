import express, { Request, Response, NextFunction, Router } from 'express';
import { cardRoutes } from './routes/cardRoutes.js';
import { collectionRoutes } from './routes/collectionRoutes.js';
import { deckRoutes } from './routes/deckRoutes.js';
import { importExportRoutes } from './routes/importExportRoutes.js';
import { ApiError } from './types.js';

export function createApiRouter(): Router {
  const apiRouter = Router();

  // Middleware para JSON body
  apiRouter.use(express.json());

  // Rotas REST da especificação
  apiRouter.use('/cards', cardRoutes);
  apiRouter.use('/collection', collectionRoutes);
  apiRouter.use('/decks', deckRoutes);
  apiRouter.use('/', importExportRoutes);

  // Tratamento de erro 404 para rotas /api não encontradas
  apiRouter.use((req: Request, res: Response, next: NextFunction) => {
    const error: any = new Error(`Rota da API não encontrada: ${req.method} ${req.originalUrl}`);
    error.status = 404;
    next(error);
  });

  // Middleware de tratamento global de erros conforme formato ApiError
  apiRouter.use((err: any, req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || 500;
    const message = err.message || 'Erro interno no servidor.';

    const apiError: ApiError = {
      status,
      message
    };

    res.status(status).json(apiError);
  });

  return apiRouter;
}

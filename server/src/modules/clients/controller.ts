import { Request, Response, NextFunction } from 'express';
import { getClients, createClient } from './service.js';
import { AuthenticatedRequest } from '../../middleware/auth.js';

export async function getClientsController(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const clients = await getClients();
    res.json({ success: true, data: clients });
  } catch (error) {
    next(error);
  }
}

export async function createClientController(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const authReq = req as AuthenticatedRequest;
    const client = await createClient(req.body);
    res.status(201).json({ success: true, data: client });
  } catch (error) {
    next(error);
  }
}
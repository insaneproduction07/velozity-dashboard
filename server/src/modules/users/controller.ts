import { Request, Response, NextFunction } from 'express';
import { getUsers, getUserById, updateUser } from './service.js';
import { AuthenticatedRequest } from '../../middleware/auth.js';

export async function getUsersController(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const authReq = req as AuthenticatedRequest;
    const users = await getUsers(authReq.user!);
    res.json({ success: true, data: users });
  } catch (error) {
    next(error);
  }
}

export async function getUserController(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = await getUserById(req.params.id);
    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
}

export async function updateUserController(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const authReq = req as AuthenticatedRequest;
    const user = await updateUser(req.params.id, req.body, authReq.user!);
    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
}
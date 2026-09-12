import { Request, Response, NextFunction } from 'express';
import { getNotifications, markNotificationRead, markAllNotificationsRead } from './service.js';
import { AuthenticatedRequest } from '../../middleware/auth.js';

export async function getNotificationsController(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const authReq = req as AuthenticatedRequest;
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 50);
    const unreadOnly = req.query.unreadOnly === 'true';

    const result = await getNotifications(authReq.user!.userId, { page, limit, unreadOnly });
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

export async function markNotificationReadController(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const authReq = req as AuthenticatedRequest;
    const notification = await markNotificationRead(authReq.user!.userId, req.params.id);
    res.json({ success: true, data: notification });
  } catch (error) {
    next(error);
  }
}

export async function markAllReadController(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const authReq = req as AuthenticatedRequest;
    const result = await markAllNotificationsRead(authReq.user!.userId);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}
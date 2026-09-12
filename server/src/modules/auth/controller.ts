import { Request, Response, NextFunction } from 'express';
import { register, login, refresh, logout, me } from './service.js';

export async function registerController(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await register(req.body);
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

export async function loginController(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await login(req.body, res);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

export async function refreshController(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await refresh(req, res);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

export async function logoutController(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await logout(req, res);
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
}

export async function meController(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) {
      throw new Error('User not attached to request');
    }
    const user = await me(userId);
    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
}
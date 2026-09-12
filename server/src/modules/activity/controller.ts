import { Request, Response, NextFunction } from 'express';
import { getActivity } from './service.js';
import { AuthenticatedRequest } from '../../middleware/auth.js';

export async function getActivityController(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const authReq = req as AuthenticatedRequest;
    const projectId = req.params.projectId;
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 50);

    const result = await getActivity(projectId, authReq.user!, { page, limit });
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}
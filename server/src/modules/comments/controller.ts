import { Request, Response, NextFunction } from 'express';
import { getComments, createComment } from './service.js';
import { AuthenticatedRequest } from '../../middleware/auth.js';

export async function getCommentsController(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const authReq = req as AuthenticatedRequest;
    const taskId = req.params.taskId;
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 50);

    const result = await getComments(taskId, authReq.user!, { page, limit });
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

export async function createCommentController(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const authReq = req as AuthenticatedRequest;
    const taskId = req.params.taskId;
    const comment = await createComment(taskId, req.body.content, authReq.user!);
    res.status(201).json({ success: true, data: comment });
  } catch (error) {
    next(error);
  }
}
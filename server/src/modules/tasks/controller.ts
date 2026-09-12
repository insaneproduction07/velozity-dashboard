import { Request, Response, NextFunction } from 'express';
import {
  getTasks,
  createTask,
  getTaskById,
  updateTask,
  assignTask,
  deleteTask,
} from './service.js';
import { AuthenticatedRequest } from '../../middleware/auth.js';

export async function getTasksController(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const authReq = req as AuthenticatedRequest;
    const projectId = req.params.projectId;
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 50);
    const status = req.query.status as any;
    const assigneeId = req.query.assigneeId as string | undefined;

    const result = await getTasks(projectId, authReq.user!, { page, limit, status, assigneeId });
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

export async function createTaskController(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const authReq = req as AuthenticatedRequest;
    const projectId = req.params.projectId;
    const dueDate = req.body.dueDate ? new Date(req.body.dueDate) : undefined;

    const task = await createTask(projectId, {
      title: req.body.title,
      description: req.body.description,
      priority: req.body.priority,
      assigneeId: req.body.assigneeId,
      dueDate,
    }, authReq.user!);

    res.status(201).json({ success: true, data: task });
  } catch (error) {
    next(error);
  }
}

export async function getTaskController(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const authReq = req as AuthenticatedRequest;
    const task = await getTaskById(req.params.id, authReq.user!);
    res.json({ success: true, data: task });
  } catch (error) {
    next(error);
  }
}

export async function updateTaskController(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const authReq = req as AuthenticatedRequest;
    const dueDate = req.body.dueDate ? new Date(req.body.dueDate) : undefined;

    const task = await updateTask(req.params.id, {
      title: req.body.title,
      description: req.body.description,
      status: req.body.status,
      priority: req.body.priority,
      dueDate,
    }, authReq.user!);

    res.json({ success: true, data: task });
  } catch (error) {
    next(error);
  }
}

export async function assignTaskController(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const authReq = req as AuthenticatedRequest;
    const task = await assignTask(req.params.id, req.body.assigneeId, authReq.user!);
    res.json({ success: true, data: task });
  } catch (error) {
    next(error);
  }
}

export async function deleteTaskController(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const authReq = req as AuthenticatedRequest;
    await deleteTask(req.params.id, authReq.user!);
    res.json({ success: true, message: 'Task deleted successfully' });
  } catch (error) {
    next(error);
  }
}
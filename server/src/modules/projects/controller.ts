import { Request, Response, NextFunction } from 'express';
import {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
} from './service.js';
import { AuthenticatedRequest } from '../../middleware/auth.js';

export async function getProjectsController(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const authReq = req as AuthenticatedRequest;
    const projects = await getProjects(authReq.user!);
    res.json({ success: true, data: projects });
  } catch (error) {
    next(error);
  }
}

export async function getProjectController(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const authReq = req as AuthenticatedRequest;
    const project = await getProjectById(req.params.id, authReq.user!);
    res.json({ success: true, data: project });
  } catch (error) {
    next(error);
  }
}

export async function createProjectController(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const authReq = req as AuthenticatedRequest;
    const project = await createProject(req.body, authReq.user!);
    res.status(201).json({ success: true, data: project });
  } catch (error) {
    next(error);
  }
}

export async function updateProjectController(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const authReq = req as AuthenticatedRequest;
    const project = await updateProject(req.params.id, req.body, authReq.user!);
    res.json({ success: true, data: project });
  } catch (error) {
    next(error);
  }
}

export async function deleteProjectController(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const authReq = req as AuthenticatedRequest;
    await deleteProject(req.params.id, authReq.user!);
    res.json({ success: true, message: 'Project deleted successfully' });
  } catch (error) {
    next(error);
  }
}
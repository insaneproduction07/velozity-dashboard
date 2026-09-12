import { Router } from 'express';
import {
  getTasksController,
  createTaskController,
  getTaskController,
  updateTaskController,
  assignTaskController,
  deleteTaskController,
} from './controller.js';
import { validate } from '../../middleware/validation.js';
import {
  getTasksSchema,
  createTaskSchema,
  getTaskSchema,
  updateTaskSchema,
  assignTaskSchema,
  deleteTaskSchema,
} from './validation.js';
import { authenticate } from '../../middleware/auth.js';

const router = Router();

router.get('/projects/:projectId/tasks', validate(getTasksSchema), authenticate, getTasksController);
router.post('/projects/:projectId/tasks', validate(createTaskSchema), authenticate, createTaskController);
router.get('/tasks/:id', validate(getTaskSchema), authenticate, getTaskController);
router.patch('/tasks/:id', validate(updateTaskSchema), authenticate, updateTaskController);
router.post('/tasks/:id/assign', validate(assignTaskSchema), authenticate, assignTaskController);
router.delete('/tasks/:id', validate(deleteTaskSchema), authenticate, deleteTaskController);

export default router;
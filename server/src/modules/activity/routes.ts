import { Router } from 'express';
import { getActivityController } from './controller.js';
import { validate } from '../../middleware/validation.js';
import { getActivitySchema } from './validation.js';
import { authenticate } from '../../middleware/auth.js';

const router = Router();

router.get('/projects/:projectId/activity', validate(getActivitySchema), authenticate, getActivityController);

export default router;
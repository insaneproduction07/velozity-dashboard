import { Router } from 'express';
import { getCommentsController, createCommentController } from './controller.js';
import { validate } from '../../middleware/validation.js';
import { getCommentsSchema, createCommentSchema } from './validation.js';
import { authenticate } from '../../middleware/auth.js';

const router = Router();

router.get('/tasks/:taskId/comments', validate(getCommentsSchema), authenticate, getCommentsController);
router.post('/tasks/:taskId/comments', validate(createCommentSchema), authenticate, createCommentController);

export default router;
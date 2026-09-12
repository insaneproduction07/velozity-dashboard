import { Router } from 'express';
import { getUsersController, getUserController, updateUserController } from './controller.js';
import { validate } from '../../middleware/validation.js';
import { getUsersSchema, getUserSchema, updateUserSchema } from './validation.js';
import { authenticate } from '../../middleware/auth.js';

const router = Router();

router.get('/', validate(getUsersSchema), authenticate, getUsersController);
router.get('/:id', validate(getUserSchema), authenticate, getUserController);
router.patch('/:id', validate(updateUserSchema), authenticate, updateUserController);

export default router;
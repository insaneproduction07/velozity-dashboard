import { Router } from 'express';
import { registerController, loginController, refreshController, logoutController, meController } from './controller.js';
import { validate } from '../../middleware/validation.js';
import { registerSchema, loginSchema, refreshSchema, logoutSchema, meSchema } from './validation.js';
import { authenticate } from '../../middleware/auth.js';

const router = Router();

router.post('/register', validate(registerSchema), registerController);
router.post('/login', validate(loginSchema), loginController);
router.post('/refresh', validate(refreshSchema), refreshController);
router.post('/logout', validate(logoutSchema), logoutController);
router.get('/me', validate(meSchema), authenticate, meController);

export default router;
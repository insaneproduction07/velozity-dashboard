import { Router } from 'express';
import { getClientsController, createClientController } from './controller.js';
import { validate } from '../../middleware/validation.js';
import { getClientsSchema, createClientSchema } from './validation.js';
import { authenticate } from '../../middleware/auth.js';
import { requireProjectManager } from '../../middleware/auth.js';

const router = Router();

router.get('/', validate(getClientsSchema), authenticate, getClientsController);
router.post('/', validate(createClientSchema), authenticate, requireProjectManager, createClientController);

export default router;
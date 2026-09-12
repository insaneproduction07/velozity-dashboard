import { Router } from 'express';
import { getNotificationsController, markNotificationReadController, markAllReadController } from './controller.js';
import { validate } from '../../middleware/validation.js';
import { getNotificationsSchema, markNotificationReadSchema, markAllReadSchema } from './validation.js';
import { authenticate } from '../../middleware/auth.js';
const router = Router();
router.get('/', validate(getNotificationsSchema), authenticate, getNotificationsController);
router.patch('/:id/read', validate(markNotificationReadSchema), authenticate, markNotificationReadController);
router.patch('/read-all', validate(markAllReadSchema), authenticate, markAllReadController);
export default router;
//# sourceMappingURL=routes.js.map
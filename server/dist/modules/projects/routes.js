import { Router } from 'express';
import { getProjectsController, getProjectController, createProjectController, updateProjectController, deleteProjectController, } from './controller.js';
import { validate } from '../../middleware/validation.js';
import { getProjectsSchema, getProjectSchema, createProjectSchema, updateProjectSchema, deleteProjectSchema, } from './validation.js';
import { authenticate } from '../../middleware/auth.js';
const router = Router();
router.get('/', validate(getProjectsSchema), authenticate, getProjectsController);
router.post('/', validate(createProjectSchema), authenticate, createProjectController);
router.get('/:id', validate(getProjectSchema), authenticate, getProjectController);
router.patch('/:id', validate(updateProjectSchema), authenticate, updateProjectController);
router.delete('/:id', validate(deleteProjectSchema), authenticate, deleteProjectController);
export default router;
//# sourceMappingURL=routes.js.map
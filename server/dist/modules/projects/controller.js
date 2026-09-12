import { getProjects, getProjectById, createProject, updateProject, deleteProject, } from './service.js';
export async function getProjectsController(req, res, next) {
    try {
        const authReq = req;
        const projects = await getProjects(authReq.user);
        res.json({ success: true, data: projects });
    }
    catch (error) {
        next(error);
    }
}
export async function getProjectController(req, res, next) {
    try {
        const authReq = req;
        const project = await getProjectById(req.params.id, authReq.user);
        res.json({ success: true, data: project });
    }
    catch (error) {
        next(error);
    }
}
export async function createProjectController(req, res, next) {
    try {
        const authReq = req;
        const project = await createProject(req.body, authReq.user);
        res.status(201).json({ success: true, data: project });
    }
    catch (error) {
        next(error);
    }
}
export async function updateProjectController(req, res, next) {
    try {
        const authReq = req;
        const project = await updateProject(req.params.id, req.body, authReq.user);
        res.json({ success: true, data: project });
    }
    catch (error) {
        next(error);
    }
}
export async function deleteProjectController(req, res, next) {
    try {
        const authReq = req;
        await deleteProject(req.params.id, authReq.user);
        res.json({ success: true, message: 'Project deleted successfully' });
    }
    catch (error) {
        next(error);
    }
}
//# sourceMappingURL=controller.js.map
import { getActivity } from './service.js';
export async function getActivityController(req, res, next) {
    try {
        const authReq = req;
        const projectId = req.params.projectId;
        const page = parseInt(req.query.page) || 1;
        const limit = Math.min(parseInt(req.query.limit) || 20, 50);
        const result = await getActivity(projectId, authReq.user, { page, limit });
        res.json({ success: true, data: result });
    }
    catch (error) {
        next(error);
    }
}
//# sourceMappingURL=controller.js.map
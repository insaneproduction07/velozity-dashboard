import { getComments, createComment } from './service.js';
export async function getCommentsController(req, res, next) {
    try {
        const authReq = req;
        const taskId = req.params.taskId;
        const page = parseInt(req.query.page) || 1;
        const limit = Math.min(parseInt(req.query.limit) || 20, 50);
        const result = await getComments(taskId, authReq.user, { page, limit });
        res.json({ success: true, data: result });
    }
    catch (error) {
        next(error);
    }
}
export async function createCommentController(req, res, next) {
    try {
        const authReq = req;
        const taskId = req.params.taskId;
        const comment = await createComment(taskId, req.body.content, authReq.user);
        res.status(201).json({ success: true, data: comment });
    }
    catch (error) {
        next(error);
    }
}
//# sourceMappingURL=controller.js.map
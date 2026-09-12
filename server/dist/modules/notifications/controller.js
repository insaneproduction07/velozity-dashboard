import { getNotifications, markNotificationRead, markAllNotificationsRead } from './service.js';
export async function getNotificationsController(req, res, next) {
    try {
        const authReq = req;
        const page = parseInt(req.query.page) || 1;
        const limit = Math.min(parseInt(req.query.limit) || 20, 50);
        const unreadOnly = req.query.unreadOnly === 'true';
        const result = await getNotifications(authReq.user.userId, { page, limit, unreadOnly });
        res.json({ success: true, data: result });
    }
    catch (error) {
        next(error);
    }
}
export async function markNotificationReadController(req, res, next) {
    try {
        const authReq = req;
        const notification = await markNotificationRead(authReq.user.userId, req.params.id);
        res.json({ success: true, data: notification });
    }
    catch (error) {
        next(error);
    }
}
export async function markAllReadController(req, res, next) {
    try {
        const authReq = req;
        const result = await markAllNotificationsRead(authReq.user.userId);
        res.json({ success: true, data: result });
    }
    catch (error) {
        next(error);
    }
}
//# sourceMappingURL=controller.js.map
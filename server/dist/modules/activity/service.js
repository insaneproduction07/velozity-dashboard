import { PrismaClient } from '@prisma/client';
import { AppError } from '../../utils/errors.js';
const prisma = new PrismaClient();
function toActivityResponse(activity) {
    return {
        id: activity.id,
        type: activity.type,
        message: activity.message,
        userId: activity.userId,
        projectId: activity.projectId,
        taskId: activity.taskId,
        createdAt: activity.createdAt,
        user: activity.user,
        task: activity.task,
    };
}
async function checkProjectAccess(userId, userRole, projectId) {
    if (userRole === 'ADMIN')
        return true;
    if (userRole === 'PROJECT_MANAGER') {
        const project = await prisma.project.findUnique({
            where: { id: projectId },
            select: { ownerId: true },
        });
        return project?.ownerId === userId;
    }
    if (userRole === 'DEVELOPER') {
        const task = await prisma.task.findFirst({
            where: { projectId, assigneeId: userId },
            select: { id: true },
        });
        return !!task;
    }
    return false;
}
export async function getActivity(projectId, requestingUser, query) {
    const hasAccess = await checkProjectAccess(requestingUser.userId, requestingUser.role, projectId);
    if (!hasAccess) {
        throw AppError.forbidden('Not authorized to access activity for this project');
    }
    const where = { projectId };
    const [activities, total] = await Promise.all([
        prisma.activity.findMany({
            where,
            include: {
                user: { select: { id: true, name: true, email: true, role: true, avatarUrl: true } },
                task: { select: { id: true, title: true } },
            },
            orderBy: { createdAt: 'desc' },
            skip: (query.page - 1) * query.limit,
            take: query.limit,
        }),
        prisma.activity.count({ where }),
    ]);
    return {
        items: activities.map(toActivityResponse),
        page: query.page,
        limit: query.limit,
        total,
    };
}
//# sourceMappingURL=service.js.map
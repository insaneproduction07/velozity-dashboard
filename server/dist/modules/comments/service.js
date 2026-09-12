import { PrismaClient, ActivityType } from '@prisma/client';
import { AppError } from '../../utils/errors.js';
import { emitCommentAdded, emitActivityNew } from '../../socket/index.js';
const prisma = new PrismaClient();
function toCommentResponse(comment) {
    return {
        id: comment.id,
        content: comment.content,
        taskId: comment.taskId,
        authorId: comment.authorId,
        createdAt: comment.createdAt,
        author: comment.author,
    };
}
async function checkTaskAccess(userId, userRole, taskId) {
    const task = await prisma.task.findUnique({
        where: { id: taskId },
        select: { id: true, projectId: true, title: true },
    });
    if (!task) {
        return { allowed: false };
    }
    if (userRole === 'ADMIN') {
        return { allowed: true, task };
    }
    if (userRole === 'PROJECT_MANAGER') {
        const project = await prisma.project.findUnique({
            where: { id: task.projectId },
            select: { ownerId: true },
        });
        if (project?.ownerId === userId) {
            return { allowed: true, task };
        }
        return { allowed: false };
    }
    if (userRole === 'DEVELOPER') {
        const assignedTask = await prisma.task.findFirst({
            where: { id: taskId, assigneeId: userId },
            select: { id: true },
        });
        if (assignedTask) {
            return { allowed: true, task };
        }
        return { allowed: false };
    }
    return { allowed: false };
}
export async function getComments(taskId, requestingUser, query) {
    const { allowed } = await checkTaskAccess(requestingUser.userId, requestingUser.role, taskId);
    if (!allowed) {
        throw AppError.forbidden('Not authorized to view comments on this task');
    }
    const [comments, total] = await Promise.all([
        prisma.comment.findMany({
            where: { taskId },
            include: {
                author: { select: { id: true, name: true, email: true, role: true, avatarUrl: true } },
            },
            orderBy: { createdAt: 'desc' },
            skip: (query.page - 1) * query.limit,
            take: query.limit,
        }),
        prisma.comment.count({ where: { taskId } }),
    ]);
    return {
        items: comments.map(toCommentResponse),
        page: query.page,
        limit: query.limit,
        total,
    };
}
export async function createComment(taskId, content, requestingUser) {
    const { allowed, task } = await checkTaskAccess(requestingUser.userId, requestingUser.role, taskId);
    if (!allowed || !task) {
        throw AppError.forbidden('Not authorized to comment on this task');
    }
    const taskWithProject = await prisma.task.findUnique({
        where: { id: taskId },
        select: { projectId: true },
    });
    const comment = await prisma.$transaction(async (tx) => {
        const newComment = await tx.comment.create({
            data: {
                content,
                taskId,
                authorId: requestingUser.userId,
            },
            include: {
                author: { select: { id: true, name: true, email: true, role: true, avatarUrl: true } },
            },
        });
        await tx.activity.create({
            data: {
                type: ActivityType.COMMENT_ADDED,
                message: `Comment added to "${task.title}"`,
                userId: requestingUser.userId,
                projectId: taskWithProject?.projectId || '',
                taskId,
            },
        });
        return newComment;
    });
    emitCommentAdded(taskWithProject?.projectId || '', toCommentResponse(comment));
    emitActivityNew(taskWithProject?.projectId || '', { type: ActivityType.COMMENT_ADDED, message: `Comment added to "${task.title}"`, userId: requestingUser.userId, projectId: taskWithProject?.projectId || '', taskId, createdAt: new Date() });
    return toCommentResponse(comment);
}
//# sourceMappingURL=service.js.map
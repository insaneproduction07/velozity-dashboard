import { PrismaClient, Role, TaskStatus, ActivityType, NotificationType } from '@prisma/client';
import { AppError } from '../../utils/errors.js';
import { emitTaskCreated, emitTaskUpdated, emitTaskAssigned, emitActivityNew } from '../../socket/index.js';
const prisma = new PrismaClient();
function toTaskResponse(task) {
    return {
        id: task.id,
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        projectId: task.projectId,
        assigneeId: task.assigneeId,
        creatorId: task.creatorId,
        dueDate: task.dueDate,
        createdAt: task.createdAt,
        updatedAt: task.updatedAt,
        assignee: task.assignee,
        creator: task.creator,
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
async function checkTaskAccess(userId, userRole, taskId) {
    const task = await prisma.task.findUnique({
        where: { id: taskId },
        select: {
            id: true,
            title: true,
            description: true,
            status: true,
            priority: true,
            projectId: true,
            assigneeId: true,
            creatorId: true,
            dueDate: true,
            createdAt: true,
            updatedAt: true,
            assignee: { select: { id: true, name: true, email: true, role: true, avatarUrl: true } },
            creator: { select: { id: true, name: true, email: true, role: true, avatarUrl: true } },
            project: { select: { id: true, ownerId: true } },
        },
    });
    if (!task) {
        return { allowed: false };
    }
    if (userRole === 'ADMIN') {
        return { allowed: true, task };
    }
    if (userRole === 'PROJECT_MANAGER') {
        if (task.project.ownerId === userId) {
            return { allowed: true, task };
        }
        return { allowed: false };
    }
    if (userRole === 'DEVELOPER') {
        if (task.assigneeId === userId) {
            return { allowed: true, task };
        }
        return { allowed: false };
    }
    return { allowed: false };
}
export async function getTasks(projectId, requestingUser, query) {
    const hasAccess = await checkProjectAccess(requestingUser.userId, requestingUser.role, projectId);
    if (!hasAccess) {
        throw AppError.forbidden('Not authorized to access this project');
    }
    const where = { projectId };
    if (requestingUser.role === 'DEVELOPER') {
        where.assigneeId = requestingUser.userId;
    }
    else if (query.assigneeId) {
        where.assigneeId = query.assigneeId;
    }
    if (query.status) {
        where.status = query.status;
    }
    const [tasks, total] = await Promise.all([
        prisma.task.findMany({
            where,
            include: {
                assignee: { select: { id: true, name: true, email: true, role: true, avatarUrl: true } },
                creator: { select: { id: true, name: true, email: true, role: true, avatarUrl: true } },
            },
            orderBy: { createdAt: 'desc' },
            skip: (query.page - 1) * query.limit,
            take: query.limit,
        }),
        prisma.task.count({ where }),
    ]);
    return {
        items: tasks.map(toTaskResponse),
        page: query.page,
        limit: query.limit,
        total,
    };
}
export async function createTask(projectId, data, requestingUser) {
    const hasAccess = await checkProjectAccess(requestingUser.userId, requestingUser.role, projectId);
    if (!hasAccess) {
        throw AppError.forbidden('Not authorized to create tasks in this project');
    }
    if (requestingUser.role === 'DEVELOPER') {
        throw AppError.forbidden('Developers cannot create tasks');
    }
    if (data.assigneeId) {
        const assignee = await prisma.user.findUnique({ where: { id: data.assigneeId } });
        if (!assignee) {
            throw AppError.notFound('Assignee not found');
        }
        if (assignee.role !== Role.DEVELOPER) {
            throw AppError.badRequest('Assignee must be a developer');
        }
        const hasProjectAccess = await checkProjectAccess(assignee.id, assignee.role, projectId);
        if (!hasProjectAccess) {
            throw AppError.badRequest('Assignee must have access to this project');
        }
    }
    const task = await prisma.$transaction(async (tx) => {
        const newTask = await tx.task.create({
            data: {
                title: data.title,
                description: data.description,
                priority: data.priority,
                projectId,
                assigneeId: data.assigneeId,
                creatorId: requestingUser.userId,
                dueDate: data.dueDate,
            },
            include: {
                assignee: { select: { id: true, name: true, email: true, role: true, avatarUrl: true } },
                creator: { select: { id: true, name: true, email: true, role: true, avatarUrl: true } },
            },
        });
        await tx.activity.create({
            data: {
                type: ActivityType.TASK_CREATED,
                message: `Task "${newTask.title}" created`,
                userId: requestingUser.userId,
                projectId,
                taskId: newTask.id,
            },
        });
        if (data.assigneeId) {
            await tx.activity.create({
                data: {
                    type: ActivityType.TASK_ASSIGNED,
                    message: `Task "${newTask.title}" assigned to ${newTask.assignee?.name || 'a developer'}`,
                    userId: requestingUser.userId,
                    projectId,
                    taskId: newTask.id,
                },
            });
            await tx.notification.create({
                data: {
                    type: NotificationType.TASK_ASSIGNED,
                    message: `You have been assigned to "${newTask.title}"`,
                    userId: data.assigneeId,
                    taskId: newTask.id,
                    projectId,
                },
            });
        }
        return newTask;
    });
    emitTaskCreated(projectId, toTaskResponse(task));
    emitActivityNew(projectId, { type: ActivityType.TASK_CREATED, message: `Task "${toTaskResponse(task).title}" created`, userId: requestingUser.userId, projectId, taskId: task.id, createdAt: new Date() });
    return toTaskResponse(task);
}
export async function getTaskById(taskId, requestingUser) {
    const { allowed, task } = await checkTaskAccess(requestingUser.userId, requestingUser.role, taskId);
    if (!allowed || !task) {
        throw AppError.forbidden('Not authorized to access this task');
    }
    return toTaskResponse(task);
}
export async function updateTask(taskId, data, requestingUser) {
    const { allowed, task } = await checkTaskAccess(requestingUser.userId, requestingUser.role, taskId);
    if (!allowed || !task) {
        throw AppError.forbidden('Not authorized to update this task');
    }
    if (requestingUser.role === 'DEVELOPER') {
        const allowedFields = ['title', 'description', 'status', 'priority', 'dueDate'];
        const hasDisallowedFields = Object.keys(data).some((key) => !allowedFields.includes(key));
        if (hasDisallowedFields) {
            throw AppError.forbidden('Developers can only update title, description, status, priority, and dueDate');
        }
    }
    if (data.status && data.status !== task.status) {
        const oldStatus = task.status;
        const updatedTask = await prisma.$transaction(async (tx) => {
            const newTask = await tx.task.update({
                where: { id: taskId },
                data,
                include: {
                    assignee: { select: { id: true, name: true, email: true, role: true, avatarUrl: true } },
                    creator: { select: { id: true, name: true, email: true, role: true, avatarUrl: true } },
                },
            });
            await tx.activity.create({
                data: {
                    type: ActivityType.TASK_STATUS_CHANGED,
                    message: `Task moved from ${oldStatus} to ${data.status}`,
                    userId: requestingUser.userId,
                    projectId: task.projectId,
                    taskId,
                },
            });
            if (data.status === TaskStatus.REVIEW) {
                const project = await tx.project.findUnique({
                    where: { id: task.projectId },
                    select: { ownerId: true },
                });
                if (project) {
                    await tx.notification.create({
                        data: {
                            type: NotificationType.TASK_MOVED_TO_REVIEW,
                            message: `Task "${newTask.title}" moved to In Review`,
                            userId: project.ownerId,
                            taskId,
                            projectId: task.projectId,
                        },
                    });
                }
            }
            return newTask;
        });
        emitTaskUpdated(task.projectId, toTaskResponse(updatedTask));
        emitActivityNew(task.projectId, { type: ActivityType.TASK_STATUS_CHANGED, message: `Task moved from ${oldStatus} to ${data.status}`, userId: requestingUser.userId, projectId: task.projectId, taskId, createdAt: new Date() });
        return toTaskResponse(updatedTask);
    }
    const updatedTask = await prisma.task.update({
        where: { id: taskId },
        data,
        include: {
            assignee: { select: { id: true, name: true, email: true, role: true, avatarUrl: true } },
            creator: { select: { id: true, name: true, email: true, role: true, avatarUrl: true } },
        },
    });
    if (Object.keys(data).length > 0) {
        await prisma.activity.create({
            data: {
                type: ActivityType.TASK_UPDATED,
                message: `Task "${updatedTask.title}" updated`,
                userId: requestingUser.userId,
                projectId: task.projectId,
                taskId,
            },
        });
        emitTaskUpdated(task.projectId, toTaskResponse(updatedTask));
        emitActivityNew(task.projectId, { type: ActivityType.TASK_UPDATED, message: `Task "${updatedTask.title}" updated`, userId: requestingUser.userId, projectId: task.projectId, taskId, createdAt: new Date() });
    }
    return toTaskResponse(updatedTask);
}
export async function assignTask(taskId, assigneeId, requestingUser) {
    const { allowed, task } = await checkTaskAccess(requestingUser.userId, requestingUser.role, taskId);
    if (!allowed || !task) {
        throw AppError.forbidden('Not authorized to assign this task');
    }
    if (requestingUser.role === 'DEVELOPER') {
        throw AppError.forbidden('Developers cannot assign tasks');
    }
    const assignee = await prisma.user.findUnique({ where: { id: assigneeId } });
    if (!assignee) {
        throw AppError.notFound('Assignee not found');
    }
    if (assignee.role !== Role.DEVELOPER) {
        throw AppError.badRequest('Assignee must be a developer');
    }
    const hasProjectAccess = await checkProjectAccess(assignee.id, assignee.role, task.projectId);
    if (!hasProjectAccess) {
        throw AppError.badRequest('Assignee must have access to this project');
    }
    const updatedTask = await prisma.$transaction(async (tx) => {
        const newTask = await tx.task.update({
            where: { id: taskId },
            data: { assigneeId },
            include: {
                assignee: { select: { id: true, name: true, email: true, role: true, avatarUrl: true } },
                creator: { select: { id: true, name: true, email: true, role: true, avatarUrl: true } },
            },
        });
        await tx.activity.create({
            data: {
                type: ActivityType.TASK_ASSIGNED,
                message: `Task "${newTask.title}" assigned to ${newTask.assignee?.name || 'a developer'}`,
                userId: requestingUser.userId,
                projectId: task.projectId,
                taskId,
            },
        });
        await tx.notification.create({
            data: {
                type: NotificationType.TASK_ASSIGNED,
                message: `You have been assigned to "${newTask.title}"`,
                userId: assigneeId,
                taskId,
                projectId: task.projectId,
            },
        });
        return newTask;
    });
    emitTaskAssigned(task.projectId, toTaskResponse(updatedTask), { id: assignee.id, name: assignee.name, email: assignee.email, role: assignee.role, avatarUrl: assignee.avatarUrl });
    emitActivityNew(task.projectId, { type: ActivityType.TASK_ASSIGNED, message: `Task "${toTaskResponse(updatedTask).title}" assigned to ${assignee.name}`, userId: requestingUser.userId, projectId: task.projectId, taskId, createdAt: new Date() });
    return toTaskResponse(updatedTask);
}
export async function deleteTask(taskId, requestingUser) {
    const { allowed, task } = await checkTaskAccess(requestingUser.userId, requestingUser.role, taskId);
    if (!allowed || !task) {
        throw AppError.forbidden('Not authorized to delete this task');
    }
    if (requestingUser.role === 'DEVELOPER') {
        throw AppError.forbidden('Developers cannot delete tasks');
    }
    await prisma.task.delete({ where: { id: taskId } });
}
//# sourceMappingURL=service.js.map
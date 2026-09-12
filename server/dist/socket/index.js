import { Server as SocketIOServer } from 'socket.io';
import { verifyAccessToken } from '../utils/jwt.js';
import { config } from '../config/index.js';
let io = null;
export function getIO() {
    if (!io) {
        throw new Error('Socket.IO not initialized');
    }
    return io;
}
export function initializeSocket(httpServer) {
    io = new SocketIOServer(httpServer, {
        cors: {
            origin: config.corsOrigin,
            credentials: true,
        },
    });
    io.use((socket, next) => {
        const token = socket.handshake.auth?.token;
        if (!token) {
            return next(new Error('Authentication required'));
        }
        try {
            const payload = verifyAccessToken(token);
            socket.user = payload;
            next();
        }
        catch {
            next(new Error('Invalid or expired token'));
        }
    });
    io.on('connection', (socket) => {
        console.log(`Socket connected: ${socket.id} (user: ${socket.user?.userId})`);
        socket.on('join:project', async (data) => {
            await handleJoinProject(socket, data);
        });
        socket.on('leave:project', (data) => {
            handleLeaveProject(socket, data);
        });
        socket.on('disconnect', () => {
            console.log(`Socket disconnected: ${socket.id}`);
        });
    });
    console.log('Socket.IO initialized');
    return io;
}
async function handleJoinProject(socket, data) {
    const { projectId } = data;
    if (!projectId) {
        socket.emit('socket:error', { message: 'projectId is required' });
        return;
    }
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();
    try {
        const project = await prisma.project.findUnique({
            where: { id: projectId },
            select: { id: true, ownerId: true },
        });
        if (!project) {
            socket.emit('socket:error', { message: 'Project not found' });
            return;
        }
        const hasAccess = await checkProjectAccess(socket.user.userId, socket.user.role, projectId);
        if (!hasAccess) {
            socket.emit('socket:error', { message: 'Not authorized to access this project' });
            return;
        }
        const room = `project:${projectId}`;
        socket.join(room);
        console.log(`Socket ${socket.id} joined room: ${room}`);
        socket.emit('joined:project', { projectId });
    }
    catch (error) {
        console.error('Join project error:', error);
        socket.emit('socket:error', { message: 'Failed to join project' });
    }
    finally {
        await prisma.$disconnect();
    }
}
function handleLeaveProject(socket, data) {
    const { projectId } = data;
    if (!projectId) {
        socket.emit('socket:error', { message: 'projectId is required' });
        return;
    }
    const room = `project:${projectId}`;
    socket.leave(room);
    console.log(`Socket ${socket.id} left room: ${room}`);
    socket.emit('left:project', { projectId });
}
async function checkProjectAccess(userId, userRole, projectId) {
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();
    try {
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
    finally {
        await prisma.$disconnect();
    }
}
export function emitTaskCreated(projectId, task) {
    if (!io)
        return;
    io.to(`project:${projectId}`).emit('task:created', { task });
}
export function emitTaskUpdated(projectId, task) {
    if (!io)
        return;
    io.to(`project:${projectId}`).emit('task:updated', { task });
}
export function emitTaskAssigned(projectId, task, assignee) {
    if (!io)
        return;
    io.to(`project:${projectId}`).emit('task:assigned', { task, assignee });
}
export function emitCommentAdded(projectId, comment) {
    if (!io)
        return;
    io.to(`project:${projectId}`).emit('comment:added', { comment });
}
export function emitActivityNew(projectId, activity) {
    if (!io)
        return;
    io.to(`project:${projectId}`).emit('activity:new', { activity });
}
//# sourceMappingURL=index.js.map
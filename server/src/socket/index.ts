import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';
import { verifyAccessToken, AccessTokenPayload } from '../utils/jwt.js';
import { config } from '../config/index.js';

export interface AuthenticatedSocket extends Socket {
  user?: AccessTokenPayload;
}

let io: SocketIOServer | null = null;

export function getIO(): SocketIOServer {
  if (!io) {
    throw new Error('Socket.IO not initialized');
  }
  return io;
}

export function initializeSocket(httpServer: HttpServer): SocketIOServer {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: config.corsOrigin,
      credentials: true,
    },
  });

  io.use((socket: AuthenticatedSocket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) {
      return next(new Error('Authentication required'));
    }

    try {
      const payload = verifyAccessToken(token);
      socket.user = payload;
      next();
    } catch {
      next(new Error('Invalid or expired token'));
    }
  });

  io.on('connection', (socket: AuthenticatedSocket) => {
    console.log(`Socket connected: ${socket.id} (user: ${socket.user?.userId})`);

    socket.on('join:project', async (data: { projectId: string }) => {
      await handleJoinProject(socket, data);
    });

    socket.on('leave:project', (data: { projectId: string }) => {
      handleLeaveProject(socket, data);
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });

  console.log('Socket.IO initialized');
  return io;
}

async function handleJoinProject(socket: AuthenticatedSocket, data: { projectId: string }): Promise<void> {
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

    const hasAccess = await checkProjectAccess(socket.user!.userId, socket.user!.role, projectId);
    if (!hasAccess) {
      socket.emit('socket:error', { message: 'Not authorized to access this project' });
      return;
    }

    const room = `project:${projectId}`;
    socket.join(room);
    console.log(`Socket ${socket.id} joined room: ${room}`);
    socket.emit('joined:project', { projectId });
  } catch (error) {
    console.error('Join project error:', error);
    socket.emit('socket:error', { message: 'Failed to join project' });
  } finally {
    await prisma.$disconnect();
  }
}

function handleLeaveProject(socket: AuthenticatedSocket, data: { projectId: string }): void {
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

async function checkProjectAccess(userId: string, userRole: string, projectId: string): Promise<boolean> {
  const { PrismaClient } = await import('@prisma/client');
  const prisma = new PrismaClient();

  try {
    if (userRole === 'ADMIN') return true;

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
  } finally {
    await prisma.$disconnect();
  }
}

export function emitTaskCreated(projectId: string, task: any): void {
  if (!io) return;
  io.to(`project:${projectId}`).emit('task:created', { task });
}

export function emitTaskUpdated(projectId: string, task: any): void {
  if (!io) return;
  io.to(`project:${projectId}`).emit('task:updated', { task });
}

export function emitTaskAssigned(projectId: string, task: any, assignee: any): void {
  if (!io) return;
  io.to(`project:${projectId}`).emit('task:assigned', { task, assignee });
}

export function emitCommentAdded(projectId: string, comment: any): void {
  if (!io) return;
  io.to(`project:${projectId}`).emit('comment:added', { comment });
}

export function emitActivityNew(projectId: string, activity: any): void {
  if (!io) return;
  io.to(`project:${projectId}`).emit('activity:new', { activity });
}
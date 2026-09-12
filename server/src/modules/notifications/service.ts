import { PrismaClient, Prisma } from '@prisma/client';
import { AppError } from '../../utils/errors.js';

const prisma = new PrismaClient();

interface NotificationWithTask {
  id: string;
  type: string;
  message: string;
  userId: string;
  taskId: string | null;
  projectId: string | null;
  readAt: Date | null;
  createdAt: Date;
  task: {
    id: string;
    title: string;
  } | null;
}

function toNotificationResponse(notification: NotificationWithTask) {
  return {
    id: notification.id,
    type: notification.type,
    message: notification.message,
    userId: notification.userId,
    taskId: notification.taskId,
    projectId: notification.projectId,
    readAt: notification.readAt,
    createdAt: notification.createdAt,
    task: notification.task,
  };
}

export async function getNotifications(
  userId: string,
  query: { page: number; limit: number; unreadOnly?: boolean }
): Promise<{ items: ReturnType<typeof toNotificationResponse>[]; page: number; limit: number; total: number }> {
  const where: Prisma.NotificationWhereInput = { userId };

  if (query.unreadOnly) {
    where.readAt = null;
  }

  const [notifications, total] = await Promise.all([
    prisma.notification.findMany({
      where,
      include: {
        task: { select: { id: true, title: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip: (query.page - 1) * query.limit,
      take: query.limit,
    }),
    prisma.notification.count({ where }),
  ]);

  return {
    items: notifications.map(toNotificationResponse),
    page: query.page,
    limit: query.limit,
    total,
  };
}

export async function markNotificationRead(
  userId: string,
  notificationId: string
): Promise<ReturnType<typeof toNotificationResponse>> {
  const notification = await prisma.notification.findUnique({
    where: { id: notificationId },
  });

  if (!notification) {
    throw AppError.notFound('Notification not found');
  }

  if (notification.userId !== userId) {
    throw AppError.forbidden('Not authorized to modify this notification');
  }

  if (notification.readAt) {
    return toNotificationResponse(notification as any);
  }

  const updated = await prisma.notification.update({
    where: { id: notificationId },
    data: { readAt: new Date() },
    include: {
      task: { select: { id: true, title: true } },
    },
  });

  return toNotificationResponse(updated);
}

export async function markAllNotificationsRead(userId: string): Promise<{ count: number }> {
  const result = await prisma.notification.updateMany({
    where: { userId, readAt: null },
    data: { readAt: new Date() },
  });

  return { count: result.count };
}
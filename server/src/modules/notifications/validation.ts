import { z } from 'zod';

export const getNotificationsSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(50).default(20),
    unreadOnly: z.coerce.boolean().optional(),
  }),
});

export const markNotificationReadSchema = z.object({
  params: z.object({
    id: z.string().cuid('Invalid notification ID'),
  }),
});

export const markAllReadSchema = z.object({});
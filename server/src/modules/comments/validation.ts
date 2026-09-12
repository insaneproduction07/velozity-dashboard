import { z } from 'zod';

export const getCommentsSchema = z.object({
  params: z.object({
    taskId: z.string().cuid('Invalid task ID'),
  }),
  query: z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(50).default(20),
  }),
});

export const createCommentSchema = z.object({
  params: z.object({
    taskId: z.string().cuid('Invalid task ID'),
  }),
  body: z.object({
    content: z.string().min(1, 'Content is required').max(5000),
  }),
});
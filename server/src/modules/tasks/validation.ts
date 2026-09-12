import { z } from 'zod';

export const getTasksSchema = z.object({
  params: z.object({
    projectId: z.string().cuid('Invalid project ID'),
  }),
  query: z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(50).default(20),
    status: z.enum(['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE', 'OVERDUE']).optional(),
    assigneeId: z.string().cuid().optional(),
  }),
});

export const createTaskSchema = z.object({
  params: z.object({
    projectId: z.string().cuid('Invalid project ID'),
  }),
  body: z.object({
    title: z.string().min(1, 'Title is required').max(200),
    description: z.string().max(5000).optional().nullable(),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).default('MEDIUM'),
    assigneeId: z.string().cuid('Invalid assignee ID').optional().nullable(),
    dueDate: z.string().datetime().optional().nullable(),
  }),
});

export const getTaskSchema = z.object({
  params: z.object({
    id: z.string().cuid('Invalid task ID'),
  }),
});

export const updateTaskSchema = z.object({
  params: z.object({
    id: z.string().cuid('Invalid task ID'),
  }),
  body: z.object({
    title: z.string().min(1).max(200).optional(),
    description: z.string().max(5000).optional().nullable(),
    status: z.enum(['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE', 'OVERDUE']).optional(),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
    dueDate: z.string().datetime().optional().nullable(),
  }).refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided',
  }),
});

export const deleteTaskSchema = z.object({
  params: z.object({
    id: z.string().cuid('Invalid task ID'),
  }),
});

export const assignTaskSchema = z.object({
  params: z.object({
    id: z.string().cuid('Invalid task ID'),
  }),
  body: z.object({
    assigneeId: z.string().cuid('Invalid assignee ID'),
  }),
});
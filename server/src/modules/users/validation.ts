import { z } from 'zod';

export const getUsersSchema = z.object({});

export const getUserSchema = z.object({
  params: z.object({
    id: z.string().cuid('Invalid user ID'),
  }),
});

export const updateUserSchema = z.object({
  params: z.object({
    id: z.string().cuid('Invalid user ID'),
  }),
  body: z.object({
    name: z.string().min(1).max(100).optional(),
    email: z.string().email('Invalid email address').toLowerCase().optional(),
    avatarUrl: z.string().url('Invalid URL').optional().nullable(),
    role: z.enum(['ADMIN', 'PROJECT_MANAGER', 'DEVELOPER']).optional(),
  }).refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided',
  }),
});
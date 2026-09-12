import { z } from 'zod';

export const getProjectsSchema = z.object({});

export const getProjectSchema = z.object({
  params: z.object({
    id: z.string().cuid('Invalid project ID'),
  }),
});

export const createProjectSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required').max(100),
    description: z.string().max(1000).optional().nullable(),
    clientId: z.string().cuid('Invalid client ID'),
    ownerId: z.string().cuid('Invalid owner ID').optional(),
  }),
});

export const updateProjectSchema = z.object({
  params: z.object({
    id: z.string().cuid('Invalid project ID'),
  }),
  body: z.object({
    name: z.string().min(1).max(100).optional(),
    description: z.string().max(1000).optional().nullable(),
    clientId: z.string().cuid('Invalid client ID').optional(),
    ownerId: z.string().cuid('Invalid owner ID').optional(),
  }).refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided',
  }),
});

export const deleteProjectSchema = z.object({
  params: z.object({
    id: z.string().cuid('Invalid project ID'),
  }),
});
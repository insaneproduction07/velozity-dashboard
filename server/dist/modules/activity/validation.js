import { z } from 'zod';
export const getActivitySchema = z.object({
    params: z.object({
        projectId: z.string().cuid('Invalid project ID'),
    }),
    query: z.object({
        page: z.coerce.number().int().positive().default(1),
        limit: z.coerce.number().int().positive().max(50).default(20),
    }),
});
//# sourceMappingURL=validation.js.map
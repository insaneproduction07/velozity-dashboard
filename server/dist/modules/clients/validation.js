import { z } from 'zod';
export const getClientsSchema = z.object({});
export const createClientSchema = z.object({
    body: z.object({
        name: z.string().min(1, 'Name is required').max(100),
        email: z.string().email('Invalid email address').toLowerCase().optional().nullable(),
        company: z.string().max(100).optional().nullable(),
    }),
});
//# sourceMappingURL=validation.js.map
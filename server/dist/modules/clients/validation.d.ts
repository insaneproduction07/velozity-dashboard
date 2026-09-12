import { z } from 'zod';
export declare const getClientsSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
export declare const createClientSchema: z.ZodObject<{
    body: z.ZodObject<{
        name: z.ZodString;
        email: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        company: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        email?: string | null | undefined;
        company?: string | null | undefined;
    }, {
        name: string;
        email?: string | null | undefined;
        company?: string | null | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    body: {
        name: string;
        email?: string | null | undefined;
        company?: string | null | undefined;
    };
}, {
    body: {
        name: string;
        email?: string | null | undefined;
        company?: string | null | undefined;
    };
}>;
//# sourceMappingURL=validation.d.ts.map
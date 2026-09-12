import { z } from 'zod';
export declare const getActivitySchema: z.ZodObject<{
    params: z.ZodObject<{
        projectId: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        projectId: string;
    }, {
        projectId: string;
    }>;
    query: z.ZodObject<{
        page: z.ZodDefault<z.ZodNumber>;
        limit: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        page: number;
        limit: number;
    }, {
        page?: number | undefined;
        limit?: number | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    query: {
        page: number;
        limit: number;
    };
    params: {
        projectId: string;
    };
}, {
    query: {
        page?: number | undefined;
        limit?: number | undefined;
    };
    params: {
        projectId: string;
    };
}>;
//# sourceMappingURL=validation.d.ts.map
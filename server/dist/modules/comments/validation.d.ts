import { z } from 'zod';
export declare const getCommentsSchema: z.ZodObject<{
    params: z.ZodObject<{
        taskId: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        taskId: string;
    }, {
        taskId: string;
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
        taskId: string;
    };
}, {
    query: {
        page?: number | undefined;
        limit?: number | undefined;
    };
    params: {
        taskId: string;
    };
}>;
export declare const createCommentSchema: z.ZodObject<{
    params: z.ZodObject<{
        taskId: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        taskId: string;
    }, {
        taskId: string;
    }>;
    body: z.ZodObject<{
        content: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        content: string;
    }, {
        content: string;
    }>;
}, "strip", z.ZodTypeAny, {
    params: {
        taskId: string;
    };
    body: {
        content: string;
    };
}, {
    params: {
        taskId: string;
    };
    body: {
        content: string;
    };
}>;
//# sourceMappingURL=validation.d.ts.map
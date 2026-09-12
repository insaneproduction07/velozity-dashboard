import { z } from 'zod';
export declare const getNotificationsSchema: z.ZodObject<{
    query: z.ZodObject<{
        page: z.ZodDefault<z.ZodNumber>;
        limit: z.ZodDefault<z.ZodNumber>;
        unreadOnly: z.ZodOptional<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        page: number;
        limit: number;
        unreadOnly?: boolean | undefined;
    }, {
        page?: number | undefined;
        limit?: number | undefined;
        unreadOnly?: boolean | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    query: {
        page: number;
        limit: number;
        unreadOnly?: boolean | undefined;
    };
}, {
    query: {
        page?: number | undefined;
        limit?: number | undefined;
        unreadOnly?: boolean | undefined;
    };
}>;
export declare const markNotificationReadSchema: z.ZodObject<{
    params: z.ZodObject<{
        id: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string;
    }, {
        id: string;
    }>;
}, "strip", z.ZodTypeAny, {
    params: {
        id: string;
    };
}, {
    params: {
        id: string;
    };
}>;
export declare const markAllReadSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
//# sourceMappingURL=validation.d.ts.map
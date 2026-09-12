import { z } from 'zod';
export declare const getProjectsSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
export declare const getProjectSchema: z.ZodObject<{
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
export declare const createProjectSchema: z.ZodObject<{
    body: z.ZodObject<{
        name: z.ZodString;
        description: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        clientId: z.ZodString;
        ownerId: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        clientId: string;
        description?: string | null | undefined;
        ownerId?: string | undefined;
    }, {
        name: string;
        clientId: string;
        description?: string | null | undefined;
        ownerId?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    body: {
        name: string;
        clientId: string;
        description?: string | null | undefined;
        ownerId?: string | undefined;
    };
}, {
    body: {
        name: string;
        clientId: string;
        description?: string | null | undefined;
        ownerId?: string | undefined;
    };
}>;
export declare const updateProjectSchema: z.ZodObject<{
    params: z.ZodObject<{
        id: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string;
    }, {
        id: string;
    }>;
    body: z.ZodEffects<z.ZodObject<{
        name: z.ZodOptional<z.ZodString>;
        description: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        clientId: z.ZodOptional<z.ZodString>;
        ownerId: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        name?: string | undefined;
        description?: string | null | undefined;
        ownerId?: string | undefined;
        clientId?: string | undefined;
    }, {
        name?: string | undefined;
        description?: string | null | undefined;
        ownerId?: string | undefined;
        clientId?: string | undefined;
    }>, {
        name?: string | undefined;
        description?: string | null | undefined;
        ownerId?: string | undefined;
        clientId?: string | undefined;
    }, {
        name?: string | undefined;
        description?: string | null | undefined;
        ownerId?: string | undefined;
        clientId?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    params: {
        id: string;
    };
    body: {
        name?: string | undefined;
        description?: string | null | undefined;
        ownerId?: string | undefined;
        clientId?: string | undefined;
    };
}, {
    params: {
        id: string;
    };
    body: {
        name?: string | undefined;
        description?: string | null | undefined;
        ownerId?: string | undefined;
        clientId?: string | undefined;
    };
}>;
export declare const deleteProjectSchema: z.ZodObject<{
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
//# sourceMappingURL=validation.d.ts.map
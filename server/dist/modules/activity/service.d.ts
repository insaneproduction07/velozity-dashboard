interface ActivityWithRelations {
    id: string;
    type: string;
    message: string;
    userId: string;
    projectId: string;
    taskId: string | null;
    createdAt: Date;
    user: {
        id: string;
        name: string;
        email: string;
        role: string;
        avatarUrl: string | null;
    };
    task: {
        id: string;
        title: string;
    } | null;
}
declare function toActivityResponse(activity: ActivityWithRelations): {
    id: string;
    type: string;
    message: string;
    userId: string;
    projectId: string;
    taskId: string | null;
    createdAt: Date;
    user: {
        id: string;
        name: string;
        email: string;
        role: string;
        avatarUrl: string | null;
    };
    task: {
        id: string;
        title: string;
    } | null;
};
export declare function getActivity(projectId: string, requestingUser: {
    userId: string;
    role: string;
}, query: {
    page: number;
    limit: number;
}): Promise<{
    items: ReturnType<typeof toActivityResponse>[];
    page: number;
    limit: number;
    total: number;
}>;
export {};
//# sourceMappingURL=service.d.ts.map
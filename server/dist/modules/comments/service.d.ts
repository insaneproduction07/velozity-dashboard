interface CommentWithAuthor {
    id: string;
    content: string;
    taskId: string;
    authorId: string;
    createdAt: Date;
    author: {
        id: string;
        name: string;
        email: string;
        role: string;
        avatarUrl: string | null;
    };
}
declare function toCommentResponse(comment: CommentWithAuthor): {
    id: string;
    content: string;
    taskId: string;
    authorId: string;
    createdAt: Date;
    author: {
        id: string;
        name: string;
        email: string;
        role: string;
        avatarUrl: string | null;
    };
};
export declare function getComments(taskId: string, requestingUser: {
    userId: string;
    role: string;
}, query: {
    page: number;
    limit: number;
}): Promise<{
    items: ReturnType<typeof toCommentResponse>[];
    page: number;
    limit: number;
    total: number;
}>;
export declare function createComment(taskId: string, content: string, requestingUser: {
    userId: string;
    role: string;
}): Promise<ReturnType<typeof toCommentResponse>>;
export {};
//# sourceMappingURL=service.d.ts.map
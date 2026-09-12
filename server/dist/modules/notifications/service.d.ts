interface NotificationWithTask {
    id: string;
    type: string;
    message: string;
    userId: string;
    taskId: string | null;
    projectId: string | null;
    readAt: Date | null;
    createdAt: Date;
    task: {
        id: string;
        title: string;
    } | null;
}
declare function toNotificationResponse(notification: NotificationWithTask): {
    id: string;
    type: string;
    message: string;
    userId: string;
    taskId: string | null;
    projectId: string | null;
    readAt: Date | null;
    createdAt: Date;
    task: {
        id: string;
        title: string;
    } | null;
};
export declare function getNotifications(userId: string, query: {
    page: number;
    limit: number;
    unreadOnly?: boolean;
}): Promise<{
    items: ReturnType<typeof toNotificationResponse>[];
    page: number;
    limit: number;
    total: number;
}>;
export declare function markNotificationRead(userId: string, notificationId: string): Promise<ReturnType<typeof toNotificationResponse>>;
export declare function markAllNotificationsRead(userId: string): Promise<{
    count: number;
}>;
export {};
//# sourceMappingURL=service.d.ts.map
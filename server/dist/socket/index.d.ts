import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';
import { AccessTokenPayload } from '../utils/jwt.js';
export interface AuthenticatedSocket extends Socket {
    user?: AccessTokenPayload;
}
export declare function getIO(): SocketIOServer;
export declare function initializeSocket(httpServer: HttpServer): SocketIOServer;
export declare function emitTaskCreated(projectId: string, task: any): void;
export declare function emitTaskUpdated(projectId: string, task: any): void;
export declare function emitTaskAssigned(projectId: string, task: any, assignee: any): void;
export declare function emitCommentAdded(projectId: string, comment: any): void;
export declare function emitActivityNew(projectId: string, activity: any): void;
//# sourceMappingURL=index.d.ts.map
export declare class AppError extends Error {
    readonly message: string;
    readonly statusCode: number;
    readonly code: string;
    readonly details?: unknown | undefined;
    constructor(message: string, statusCode?: number, code?: string, details?: unknown | undefined);
    static badRequest(message: string, details?: unknown): AppError;
    static unauthorized(message?: string): AppError;
    static forbidden(message?: string): AppError;
    static notFound(message?: string): AppError;
    static conflict(message: string, details?: unknown): AppError;
    static internal(message?: string): AppError;
}
export declare function isAppError(error: unknown): error is AppError;
//# sourceMappingURL=errors.d.ts.map
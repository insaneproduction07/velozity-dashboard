export class AppError extends Error {
    message;
    statusCode;
    code;
    details;
    constructor(message, statusCode = 500, code = 'INTERNAL_ERROR', details) {
        super(message);
        this.message = message;
        this.statusCode = statusCode;
        this.code = code;
        this.details = details;
        this.name = 'AppError';
    }
    static badRequest(message, details) {
        return new AppError(message, 400, 'BAD_REQUEST', details);
    }
    static unauthorized(message = 'Unauthorized') {
        return new AppError(message, 401, 'UNAUTHORIZED');
    }
    static forbidden(message = 'Forbidden') {
        return new AppError(message, 403, 'FORBIDDEN');
    }
    static notFound(message = 'Not found') {
        return new AppError(message, 404, 'NOT_FOUND');
    }
    static conflict(message, details) {
        return new AppError(message, 409, 'CONFLICT', details);
    }
    static internal(message = 'Internal server error') {
        return new AppError(message, 500, 'INTERNAL_ERROR');
    }
}
export function isAppError(error) {
    return error instanceof AppError;
}
//# sourceMappingURL=errors.js.map
import { ZodError } from 'zod';
import { isAppError } from '../utils/errors.js';
export function errorHandler(err, _req, res, _next) {
    if (isAppError(err)) {
        const response = {
            success: false,
            error: {
                code: err.code,
                message: err.message,
            },
        };
        if (err.details) {
            response.error.details = err.details;
        }
        return res.status(err.statusCode).json(response);
    }
    if (err instanceof ZodError) {
        return res.status(400).json({
            success: false,
            error: {
                code: 'VALIDATION_ERROR',
                message: 'Validation failed',
                details: err.errors.map((e) => ({
                    field: e.path.join('.'),
                    message: e.message,
                })),
            },
        });
    }
    console.error('Unhandled error:', err);
    return res.status(500).json({
        success: false,
        error: {
            code: 'INTERNAL_ERROR',
            message: 'An unexpected error occurred',
        },
    });
}
export function notFoundHandler(_req, res) {
    res.status(404).json({
        success: false,
        error: {
            code: 'NOT_FOUND',
            message: 'Route not found',
        },
    });
}
//# sourceMappingURL=errorHandler.js.map
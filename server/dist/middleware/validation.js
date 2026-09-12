import { ZodError } from 'zod';
import { AppError } from '../utils/errors.js';
export function validate(schema) {
    return async (req, _res, next) => {
        try {
            await schema.parseAsync({
                body: req.body,
                query: req.query,
                params: req.params,
            });
            next();
        }
        catch (error) {
            if (error instanceof ZodError) {
                next(error);
            }
            else {
                next(new AppError('Validation error', 400, 'VALIDATION_ERROR'));
            }
        }
    };
}
//# sourceMappingURL=validation.js.map
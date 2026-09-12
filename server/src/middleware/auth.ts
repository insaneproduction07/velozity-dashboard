import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, AccessTokenPayload } from '../utils/jwt.js';
import { AppError } from '../utils/errors.js';

export interface AuthenticatedRequest extends Request {
  user?: AccessTokenPayload;
}

export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(AppError.unauthorized('Access token required'));
  }

  const token = authHeader.slice(7);
  try {
    const payload = verifyAccessToken(token);
    (req as AuthenticatedRequest).user = payload;
    next();
  } catch {
    next(AppError.unauthorized('Invalid or expired access token'));
  }
}

export function requireRole(...allowedRoles: string[]) {
  return (req: AuthenticatedRequest, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(AppError.unauthorized('Authentication required'));
    }
    if (!allowedRoles.includes(req.user.role)) {
      return next(AppError.forbidden('Insufficient permissions'));
    }
    next();
  };
}

export const requireAdmin = requireRole('ADMIN');
export const requireProjectManager = requireRole('PROJECT_MANAGER', 'ADMIN');
export const requireDeveloper = requireRole('DEVELOPER', 'PROJECT_MANAGER', 'ADMIN');
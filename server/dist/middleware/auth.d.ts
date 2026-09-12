import { Request, Response, NextFunction } from 'express';
import { AccessTokenPayload } from '../utils/jwt.js';
export interface AuthenticatedRequest extends Request {
    user?: AccessTokenPayload;
}
export declare function authenticate(req: Request, _res: Response, next: NextFunction): void;
export declare function requireRole(...allowedRoles: string[]): (req: AuthenticatedRequest, _res: Response, next: NextFunction) => void;
export declare const requireAdmin: (req: AuthenticatedRequest, _res: Response, next: NextFunction) => void;
export declare const requireProjectManager: (req: AuthenticatedRequest, _res: Response, next: NextFunction) => void;
export declare const requireDeveloper: (req: AuthenticatedRequest, _res: Response, next: NextFunction) => void;
//# sourceMappingURL=auth.d.ts.map
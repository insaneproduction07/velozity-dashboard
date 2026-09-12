import { Response } from 'express';
export declare function setRefreshTokenCookie(res: Response, token: string): void;
export declare function clearRefreshTokenCookie(res: Response): void;
export declare function getRefreshTokenFromCookie(req: {
    cookies: Record<string, string | undefined>;
}): string | undefined;
//# sourceMappingURL=cookies.d.ts.map
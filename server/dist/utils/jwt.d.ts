export interface AccessTokenPayload {
    userId: string;
    role: string;
}
export declare function createAccessToken(payload: AccessTokenPayload): string;
export declare function verifyAccessToken(token: string): AccessTokenPayload;
export declare function createRefreshToken(): string;
export declare function verifyRefreshToken(token: string): {
    iat: number;
    exp: number;
    r: string;
};
//# sourceMappingURL=jwt.d.ts.map
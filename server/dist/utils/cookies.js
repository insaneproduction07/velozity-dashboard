import { config } from '../config/index.js';
export function setRefreshTokenCookie(res, token) {
    res.cookie(config.cookie.name, token, {
        httpOnly: true,
        secure: config.cookie.secure,
        sameSite: config.cookie.sameSite,
        maxAge: config.cookie.maxAge,
    });
}
export function clearRefreshTokenCookie(res) {
    res.clearCookie(config.cookie.name, {
        httpOnly: true,
        secure: config.cookie.secure,
        sameSite: config.cookie.sameSite,
    });
}
export function getRefreshTokenFromCookie(req) {
    return req.cookies?.[config.cookie.name];
}
//# sourceMappingURL=cookies.js.map
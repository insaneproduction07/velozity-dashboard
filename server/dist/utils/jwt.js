import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
import { randomBytes } from 'crypto';
export function createAccessToken(payload) {
    return jwt.sign(payload, config.jwt.accessSecret, {
        expiresIn: config.jwt.accessExpiresIn,
    });
}
export function verifyAccessToken(token) {
    return jwt.verify(token, config.jwt.accessSecret);
}
export function createRefreshToken() {
    const randomPart = randomBytes(16).toString('hex');
    return jwt.sign({ r: randomPart }, config.jwt.refreshSecret, {
        expiresIn: config.jwt.refreshExpiresIn,
    });
}
export function verifyRefreshToken(token) {
    return jwt.verify(token, config.jwt.refreshSecret);
}
//# sourceMappingURL=jwt.js.map
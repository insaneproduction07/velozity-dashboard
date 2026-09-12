import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
import { randomBytes } from 'crypto';

export interface AccessTokenPayload {
  userId: string;
  role: string;
}

export function createAccessToken(payload: AccessTokenPayload): string {
  return jwt.sign(payload, config.jwt.accessSecret, {
    expiresIn: config.jwt.accessExpiresIn as jwt.SignOptions['expiresIn'],
  });
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  return jwt.verify(token, config.jwt.accessSecret) as AccessTokenPayload;
}

export function createRefreshToken(): string {
  const randomPart = randomBytes(16).toString('hex');
  return jwt.sign({ r: randomPart }, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpiresIn as jwt.SignOptions['expiresIn'],
  });
}

export function verifyRefreshToken(token: string): { iat: number; exp: number; r: string } {
  return jwt.verify(token, config.jwt.refreshSecret) as { iat: number; exp: number; r: string };
}
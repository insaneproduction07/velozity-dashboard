import { Response } from 'express';
import { config } from '../config/index.js';

export function setRefreshTokenCookie(res: Response, token: string): void {
  res.cookie(config.cookie.name, token, {
    httpOnly: true,
    secure: config.cookie.secure,
    sameSite: config.cookie.sameSite,
    maxAge: config.cookie.maxAge,
  });
}

export function clearRefreshTokenCookie(res: Response): void {
  res.clearCookie(config.cookie.name, {
    httpOnly: true,
    secure: config.cookie.secure,
    sameSite: config.cookie.sameSite,
  });
}

export function getRefreshTokenFromCookie(req: { cookies: Record<string, string | undefined> }): string | undefined {
  return req.cookies?.[config.cookie.name];
}
import { PrismaClient, Role } from '@prisma/client';
import { AppError } from '../../utils/errors.js';
import { hashPassword, verifyPassword } from '../../utils/password.js';
import { createAccessToken, createRefreshToken, verifyRefreshToken, AccessTokenPayload } from '../../utils/jwt.js';
import { setRefreshTokenCookie, clearRefreshTokenCookie, getRefreshTokenFromCookie } from '../../utils/cookies.js';

const prisma = new PrismaClient();

interface SafeUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatarUrl: string | null;
}

function toSafeUser(user: { id: string; name: string; email: string; role: Role; avatarUrl: string | null }): SafeUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatarUrl: user.avatarUrl,
  };
}

export async function register(data: { name: string; email: string; password: string }): Promise<{ accessToken: string; user: SafeUser }> {
  const existingUser = await prisma.user.findUnique({ where: { email: data.email } });
  if (existingUser) {
    throw AppError.conflict('Email already registered');
  }

  const passwordHash = await hashPassword(data.password);

  const user = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      passwordHash,
      role: Role.DEVELOPER,
    },
  });

  const accessToken = createAccessToken({ userId: user.id, role: user.role });
  const refreshToken = createRefreshToken();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id,
      expiresAt,
    },
  });

  return { accessToken, user: toSafeUser(user) };
}

export async function login(data: { email: string; password: string }, res: { cookie: (name: string, value: string, options: any) => void }): Promise<{ accessToken: string; user: SafeUser }> {
  const user = await prisma.user.findUnique({ where: { email: data.email } });
  if (!user) {
    throw AppError.unauthorized('Invalid credentials');
  }

  const isValid = await verifyPassword(data.password, user.passwordHash);
  if (!isValid) {
    throw AppError.unauthorized('Invalid credentials');
  }

  const accessToken = createAccessToken({ userId: user.id, role: user.role });
  const refreshToken = createRefreshToken();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id,
      expiresAt,
    },
  });

  setRefreshTokenCookie(res as any, refreshToken);

  return { accessToken, user: toSafeUser(user) };
}

export async function refresh(req: { cookies: Record<string, string | undefined> }, res: { cookie: (name: string, value: string, options: any) => void }): Promise<{ accessToken: string }> {
  const refreshToken = getRefreshTokenFromCookie(req);
  if (!refreshToken) {
    clearRefreshTokenCookie(res as any);
    throw AppError.unauthorized('Refresh token not found');
  }

  let payload: { iat: number; exp: number };
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    clearRefreshTokenCookie(res as any);
    throw AppError.unauthorized('Invalid refresh token');
  }

  const storedToken = await prisma.refreshToken.findUnique({ where: { token: refreshToken } });
  if (!storedToken || storedToken.expiresAt < new Date()) {
    if (storedToken) {
      await prisma.refreshToken.delete({ where: { id: storedToken.id } });
    }
    clearRefreshTokenCookie(res as any);
    throw AppError.unauthorized('Refresh token expired or revoked');
  }

  const user = await prisma.user.findUnique({ where: { id: storedToken.userId } });
  if (!user) {
    await prisma.refreshToken.delete({ where: { id: storedToken.id } });
    clearRefreshTokenCookie(res as any);
    throw AppError.unauthorized('User not found');
  }

  await prisma.refreshToken.delete({ where: { id: storedToken.id } });

  const newRefreshToken = createRefreshToken();
  const newExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  await prisma.refreshToken.create({
    data: {
      token: newRefreshToken,
      userId: user.id,
      expiresAt: newExpiresAt,
    },
  });

  setRefreshTokenCookie(res as any, newRefreshToken);

  const accessToken = createAccessToken({ userId: user.id, role: user.role });

  return { accessToken };
}

export async function logout(req: { cookies: Record<string, string | undefined> }, res: { cookie: (name: string, value: string, options: any) => void }): Promise<void> {
  const refreshToken = getRefreshTokenFromCookie(req);
  if (refreshToken) {
    await prisma.refreshToken.deleteMany({ where: { token: refreshToken } });
  }
  clearRefreshTokenCookie(res as any);
}

export async function me(userId: string): Promise<SafeUser> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw AppError.notFound('User not found');
  }
  return toSafeUser(user);
}
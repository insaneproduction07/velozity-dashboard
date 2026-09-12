import { PrismaClient, Role } from '@prisma/client';
import { AppError } from '../../utils/errors.js';

const prisma = new PrismaClient();

interface SafeUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatarUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface MinimalUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatarUrl: string | null;
}

function toSafeUser(user: {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatarUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}): SafeUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatarUrl: user.avatarUrl,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

function toMinimalUser(user: {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatarUrl: string | null;
}): MinimalUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatarUrl: user.avatarUrl,
  };
}

export async function getUsers(requestingUser: { userId: string; role: string }): Promise<(SafeUser | MinimalUser)[]> {
  if (requestingUser.role === 'ADMIN') {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return users.map(toSafeUser);
  }

  if (requestingUser.role === 'PROJECT_MANAGER') {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return users.map(toSafeUser);
  }

  const users = await prisma.user.findMany({
    where: { id: requestingUser.userId },
  });
  return users.map(toMinimalUser);
}

export async function getUserById(id: string): Promise<SafeUser> {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) {
    throw AppError.notFound('User not found');
  }
  return toSafeUser(user);
}

export async function updateUser(
  id: string,
  data: { name?: string; email?: string; avatarUrl?: string | null; role?: Role },
  requestingUser: { userId: string; role: string }
): Promise<SafeUser> {
  if (requestingUser.role !== 'ADMIN') {
    throw AppError.forbidden('Only administrators can update users');
  }

  const existingUser = await prisma.user.findUnique({ where: { id } });
  if (!existingUser) {
    throw AppError.notFound('User not found');
  }

  if (data.email && data.email !== existingUser.email) {
    const emailExists = await prisma.user.findUnique({ where: { email: data.email } });
    if (emailExists) {
      throw AppError.conflict('Email already in use');
    }
  }

  if (data.role && data.role !== existingUser.role) {
    if (data.role === 'ADMIN' && existingUser.role !== 'ADMIN') {
      throw AppError.forbidden('Cannot promote user to ADMIN');
    }
  }

  const updatedUser = await prisma.user.update({
    where: { id },
    data: {
      name: data.name,
      email: data.email,
      avatarUrl: data.avatarUrl,
      role: data.role,
    },
  });

  return toSafeUser(updatedUser);
}
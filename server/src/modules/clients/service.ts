import { PrismaClient } from '@prisma/client';
import { AppError } from '../../utils/errors.js';

const prisma = new PrismaClient();

interface SafeClient {
  id: string;
  name: string;
  email: string | null;
  company: string | null;
  createdAt: Date;
  updatedAt: Date;
}

function toSafeClient(client: {
  id: string;
  name: string;
  email: string | null;
  company: string | null;
  createdAt: Date;
  updatedAt: Date;
}): SafeClient {
  return {
    id: client.id,
    name: client.name,
    email: client.email,
    company: client.company,
    createdAt: client.createdAt,
    updatedAt: client.updatedAt,
  };
}

export async function getClients(): Promise<SafeClient[]> {
  const clients = await prisma.client.findMany({
    orderBy: { createdAt: 'desc' },
  });
  return clients.map(toSafeClient);
}

export async function createClient(data: { name: string; email?: string | null; company?: string | null }): Promise<SafeClient> {
  const client = await prisma.client.create({
    data: {
      name: data.name,
      email: data.email,
      company: data.company,
    },
  });
  return toSafeClient(client);
}
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
function toSafeClient(client) {
    return {
        id: client.id,
        name: client.name,
        email: client.email,
        company: client.company,
        createdAt: client.createdAt,
        updatedAt: client.updatedAt,
    };
}
export async function getClients() {
    const clients = await prisma.client.findMany({
        orderBy: { createdAt: 'desc' },
    });
    return clients.map(toSafeClient);
}
export async function createClient(data) {
    const client = await prisma.client.create({
        data: {
            name: data.name,
            email: data.email,
            company: data.company,
        },
    });
    return toSafeClient(client);
}
//# sourceMappingURL=service.js.map
import { Role } from '@prisma/client';
interface ProjectWithRelations {
    id: string;
    name: string;
    description: string | null;
    clientId: string;
    ownerId: string;
    createdAt: Date;
    updatedAt: Date;
    client: {
        id: string;
        name: string;
        email: string | null;
        company: string | null;
    };
    owner: {
        id: string;
        name: string;
        email: string;
        role: Role;
    };
}
declare function toProjectResponse(project: ProjectWithRelations): {
    id: string;
    name: string;
    description: string | null;
    clientId: string;
    ownerId: string;
    createdAt: Date;
    updatedAt: Date;
    client: {
        id: string;
        name: string;
        email: string | null;
        company: string | null;
    };
    owner: {
        id: string;
        name: string;
        email: string;
        role: Role;
    };
};
export declare function getProjects(requestingUser: {
    userId: string;
    role: string;
}): Promise<ReturnType<typeof toProjectResponse>[]>;
export declare function getProjectById(projectId: string, requestingUser: {
    userId: string;
    role: string;
}): Promise<ReturnType<typeof toProjectResponse>>;
export declare function createProject(data: {
    name: string;
    description?: string | null;
    clientId: string;
    ownerId?: string;
}, requestingUser: {
    userId: string;
    role: string;
}): Promise<ReturnType<typeof toProjectResponse>>;
export declare function updateProject(projectId: string, data: {
    name?: string;
    description?: string | null;
    clientId?: string;
    ownerId?: string;
}, requestingUser: {
    userId: string;
    role: string;
}): Promise<ReturnType<typeof toProjectResponse>>;
export declare function deleteProject(projectId: string, requestingUser: {
    userId: string;
    role: string;
}): Promise<void>;
export {};
//# sourceMappingURL=service.d.ts.map
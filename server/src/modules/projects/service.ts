import { PrismaClient, Role, Prisma, ActivityType } from '@prisma/client';
import { AppError } from '../../utils/errors.js';
import { emitActivityNew } from '../../socket/index.js';

const prisma = new PrismaClient();

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

function toProjectResponse(project: ProjectWithRelations) {
  return {
    id: project.id,
    name: project.name,
    description: project.description,
    clientId: project.clientId,
    ownerId: project.ownerId,
    createdAt: project.createdAt,
    updatedAt: project.updatedAt,
    client: project.client,
    owner: project.owner,
  };
}

async function userHasProjectAccess(userId: string, userRole: string, projectId: string): Promise<boolean> {
  if (userRole === 'ADMIN') {
    return true;
  }

  if (userRole === 'PROJECT_MANAGER') {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { ownerId: true },
    });
    return project?.ownerId === userId;
  }

  if (userRole === 'DEVELOPER') {
    const task = await prisma.task.findFirst({
      where: {
        projectId,
        assigneeId: userId,
      },
      select: { id: true },
    });
    return !!task;
  }

  return false;
}

export async function getProjects(requestingUser: { userId: string; role: string }): Promise<ReturnType<typeof toProjectResponse>[]> {
  let where: Prisma.ProjectWhereInput = {};

  if (requestingUser.role === 'PROJECT_MANAGER') {
    where = { ownerId: requestingUser.userId };
  } else if (requestingUser.role === 'DEVELOPER') {
    const assignedProjects = await prisma.task.findMany({
      where: { assigneeId: requestingUser.userId },
      select: { projectId: true },
      distinct: ['projectId'],
    });
    const projectIds = assignedProjects.map((t) => t.projectId);
    where = { id: { in: projectIds } };
  }

  const projects = await prisma.project.findMany({
    where,
    include: {
      client: {
        select: { id: true, name: true, email: true, company: true },
      },
      owner: {
        select: { id: true, name: true, email: true, role: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return projects.map(toProjectResponse);
}

export async function getProjectById(projectId: string, requestingUser: { userId: string; role: string }): Promise<ReturnType<typeof toProjectResponse>> {
  const hasAccess = await userHasProjectAccess(requestingUser.userId, requestingUser.role, projectId);
  if (!hasAccess) {
    throw AppError.forbidden('Not authorized to access this project');
  }

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      client: {
        select: { id: true, name: true, email: true, company: true },
      },
      owner: {
        select: { id: true, name: true, email: true, role: true },
      },
    },
  });

  if (!project) {
    throw AppError.notFound('Project not found');
  }

  return toProjectResponse(project);
}

export async function createProject(
  data: { name: string; description?: string | null; clientId: string; ownerId?: string },
  requestingUser: { userId: string; role: string }
): Promise<ReturnType<typeof toProjectResponse>> {
  if (requestingUser.role === 'DEVELOPER') {
    throw AppError.forbidden('Developers cannot create projects');
  }

  const client = await prisma.client.findUnique({ where: { id: data.clientId } });
  if (!client) {
    throw AppError.notFound('Client not found');
  }

  let ownerId: string;

  if (requestingUser.role === 'PROJECT_MANAGER') {
    ownerId = requestingUser.userId;
    if (data.ownerId && data.ownerId !== requestingUser.userId) {
      throw AppError.forbidden('Project managers can only create projects for themselves');
    }
  } else {
    if (!data.ownerId) {
      throw AppError.badRequest('Admin must specify an ownerId (Project Manager)');
    }
    const owner = await prisma.user.findUnique({ where: { id: data.ownerId } });
    if (!owner) {
      throw AppError.notFound('Owner not found');
    }
    if (owner.role !== Role.PROJECT_MANAGER) {
      throw AppError.badRequest('Owner must be a Project Manager');
    }
    ownerId = data.ownerId;
  }

  const project = await prisma.$transaction(async (tx) => {
    const newProject = await tx.project.create({
      data: {
        name: data.name,
        description: data.description,
        clientId: data.clientId,
        ownerId,
      },
      include: {
        client: {
          select: { id: true, name: true, email: true, company: true },
        },
        owner: {
          select: { id: true, name: true, email: true, role: true },
        },
      },
    });

    await tx.activity.create({
      data: {
        type: ActivityType.PROJECT_CREATED,
        message: `Project "${newProject.name}" created`,
        userId: requestingUser.userId,
        projectId: newProject.id,
      },
    });

    return newProject;
  });

  emitActivityNew(project.id, { type: ActivityType.PROJECT_CREATED, message: `Project "${project.name}" created`, userId: requestingUser.userId, projectId: project.id, createdAt: new Date() });

  return toProjectResponse(project);
}

export async function updateProject(
  projectId: string,
  data: { name?: string; description?: string | null; clientId?: string; ownerId?: string },
  requestingUser: { userId: string; role: string }
): Promise<ReturnType<typeof toProjectResponse>> {
  if (requestingUser.role === 'DEVELOPER') {
    throw AppError.forbidden('Developers cannot update projects');
  }

  const hasAccess = await userHasProjectAccess(requestingUser.userId, requestingUser.role, projectId);
  if (!hasAccess) {
    throw AppError.forbidden('Not authorized to update this project');
  }

  if (requestingUser.role === 'PROJECT_MANAGER') {
    if (data.ownerId && data.ownerId !== requestingUser.userId) {
      throw AppError.forbidden('Project managers cannot transfer ownership');
    }
  }

  if (data.clientId) {
    const client = await prisma.client.findUnique({ where: { id: data.clientId } });
    if (!client) {
      throw AppError.notFound('Client not found');
    }
  }

  if (data.ownerId) {
    if (requestingUser.role !== 'ADMIN') {
      throw AppError.forbidden('Only administrators can change project ownership');
    }
    const owner = await prisma.user.findUnique({ where: { id: data.ownerId } });
    if (!owner) {
      throw AppError.notFound('Owner not found');
    }
    if (owner.role !== Role.PROJECT_MANAGER) {
      throw AppError.badRequest('Owner must be a Project Manager');
    }
  }

  const project = await prisma.project.update({
    where: { id: projectId },
    data: {
      name: data.name,
      description: data.description,
      clientId: data.clientId,
      ownerId: data.ownerId,
    },
    include: {
      client: {
        select: { id: true, name: true, email: true, company: true },
      },
      owner: {
        select: { id: true, name: true, email: true, role: true },
      },
    },
  });

  return toProjectResponse(project);
}

export async function deleteProject(projectId: string, requestingUser: { userId: string; role: string }): Promise<void> {
  const hasAccess = await userHasProjectAccess(requestingUser.userId, requestingUser.role, projectId);
  if (!hasAccess) {
    throw AppError.forbidden('Not authorized to delete this project');
  }

  if (requestingUser.role === 'DEVELOPER') {
    throw AppError.forbidden('Developers cannot delete projects');
  }

  await prisma.project.delete({ where: { id: projectId } });
}
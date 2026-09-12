import { PrismaClient, Role, TaskStatus, TaskPriority, ActivityType, NotificationType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const PASSWORD = 'password123';

async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

async function clearDatabase() {
  await prisma.notification.deleteMany();
  await prisma.activity.deleteMany();
  await prisma.task.deleteMany();
  await prisma.projectMember.deleteMany();
  await prisma.project.deleteMany();
  await prisma.client.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.user.deleteMany();
}

async function main() {
  console.log('🌱 Starting seed...');

  await clearDatabase();
  console.log('🗑️  Cleared existing data');

  const passwordHash = await hashPassword(PASSWORD);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      passwordHash,
      name: 'Admin User',
      role: Role.ADMIN,
    },
  });

  const pm1 = await prisma.user.create({
    data: {
      email: 'pm1@example.com',
      passwordHash,
      name: 'Project Manager One',
      role: Role.PROJECT_MANAGER,
    },
  });

  const pm2 = await prisma.user.create({
    data: {
      email: 'pm2@example.com',
      passwordHash,
      name: 'Project Manager Two',
      role: Role.PROJECT_MANAGER,
    },
  });

  const dev1 = await prisma.user.create({
    data: {
      email: 'dev1@example.com',
      passwordHash,
      name: 'Developer One',
      role: Role.DEVELOPER,
    },
  });

  const dev2 = await prisma.user.create({
    data: {
      email: 'dev2@example.com',
      passwordHash,
      name: 'Developer Two',
      role: Role.DEVELOPER,
    },
  });

  const dev3 = await prisma.user.create({
    data: {
      email: 'dev3@example.com',
      passwordHash,
      name: 'Developer Three',
      role: Role.DEVELOPER,
    },
  });

  const dev4 = await prisma.user.create({
    data: {
      email: 'dev4@example.com',
      passwordHash,
      name: 'Developer Four',
      role: Role.DEVELOPER,
    },
  });

  console.log('👥 Created 7 users');

  const client1 = await prisma.client.create({
    data: {
      name: 'Acme Corp',
      email: 'contact@acme.com',
      company: 'Acme Corporation',
    },
  });

  const client2 = await prisma.client.create({
    data: {
      name: 'Globex Inc',
      email: 'info@globex.com',
      company: 'Globex International',
    },
  });

  const client3 = await prisma.client.create({
    data: {
      name: 'Wayne Enterprises',
      email: 'hello@wayne.com',
      company: 'Wayne Enterprises',
    },
  });

  console.log('🏢 Created 3 clients');

  const project1 = await prisma.project.create({
    data: {
      name: 'Website Redesign',
      description: 'Complete redesign of company website',
      ownerId: pm1.id,
      clientId: client1.id,
    },
  });

  const project2 = await prisma.project.create({
    data: {
      name: 'Mobile App Development',
      description: 'Native iOS and Android app',
      ownerId: pm1.id,
      clientId: client2.id,
    },
  });

  const project3 = await prisma.project.create({
    data: {
      name: 'API Integration',
      description: 'Third-party API integrations',
      ownerId: pm2.id,
      clientId: client3.id,
    },
  });

  await prisma.projectMember.createMany({
    data: [
      { userId: dev1.id, projectId: project1.id },
      { userId: dev2.id, projectId: project1.id },
      { userId: dev3.id, projectId: project2.id },
      { userId: dev4.id, projectId: project2.id },
      { userId: dev1.id, projectId: project3.id },
      { userId: dev3.id, projectId: project3.id },
    ],
  });

  console.log('📁 Created 3 projects with members');

  const now = new Date();
  const pastDate = new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000);
  const futureDate = new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000);

  const tasks = await Promise.all([
    prisma.task.create({
      data: {
        title: 'Design homepage mockup',
        description: 'Create Figma mockups for new homepage',
        status: TaskStatus.DONE,
        priority: TaskPriority.HIGH,
        projectId: project1.id,
        assigneeId: dev1.id,
        creatorId: pm1.id,
        dueDate: futureDate,
      },
    }),
    prisma.task.create({
      data: {
        title: 'Implement header component',
        description: 'Build responsive header with navigation',
        status: TaskStatus.DONE,
        priority: TaskPriority.MEDIUM,
        projectId: project1.id,
        assigneeId: dev1.id,
        creatorId: pm1.id,
        dueDate: futureDate,
      },
    }),
    prisma.task.create({
      data: {
        title: 'Build footer component',
        description: 'Create footer with links and social icons',
        status: TaskStatus.IN_PROGRESS,
        priority: TaskPriority.MEDIUM,
        projectId: project1.id,
        assigneeId: dev2.id,
        creatorId: pm1.id,
        dueDate: futureDate,
      },
    }),
    prisma.task.create({
      data: {
        title: 'Set up CI/CD pipeline',
        description: 'Configure GitHub Actions for deployment',
        status: TaskStatus.REVIEW,
        priority: TaskPriority.HIGH,
        projectId: project1.id,
        assigneeId: dev2.id,
        creatorId: pm1.id,
        dueDate: futureDate,
      },
    }),
    prisma.task.create({
      data: {
        title: 'Write unit tests',
        description: 'Achieve 80% code coverage',
        status: TaskStatus.TODO,
        priority: TaskPriority.LOW,
        projectId: project1.id,
        assigneeId: dev1.id,
        creatorId: pm1.id,
        dueDate: futureDate,
      },
    }),
    prisma.task.create({
      data: {
        title: 'Design mobile app screens',
        description: 'Create all screen designs in Figma',
        status: TaskStatus.DONE,
        priority: TaskPriority.CRITICAL,
        projectId: project2.id,
        assigneeId: dev3.id,
        creatorId: pm1.id,
        dueDate: futureDate,
      },
    }),
    prisma.task.create({
      data: {
        title: 'Set up React Native project',
        description: 'Initialize project with TypeScript',
        status: TaskStatus.IN_PROGRESS,
        priority: TaskPriority.HIGH,
        projectId: project2.id,
        assigneeId: dev3.id,
        creatorId: pm1.id,
        dueDate: futureDate,
      },
    }),
    prisma.task.create({
      data: {
        title: 'Implement authentication flow',
        description: 'Login, register, password reset screens',
        status: TaskStatus.TODO,
        priority: TaskPriority.CRITICAL,
        projectId: project2.id,
        assigneeId: dev4.id,
        creatorId: pm1.id,
        dueDate: futureDate,
      },
    }),
    prisma.task.create({
      data: {
        title: 'Build dashboard screen',
        description: 'Main dashboard with metrics',
        status: TaskStatus.TODO,
        priority: TaskPriority.HIGH,
        projectId: project2.id,
        assigneeId: dev4.id,
        creatorId: pm1.id,
        dueDate: futureDate,
      },
    }),
    prisma.task.create({
      data: {
        title: 'Configure push notifications',
        description: 'Set up Firebase Cloud Messaging',
        status: TaskStatus.TODO,
        priority: TaskPriority.MEDIUM,
        projectId: project2.id,
        assigneeId: dev3.id,
        creatorId: pm1.id,
        dueDate: futureDate,
      },
    }),
    prisma.task.create({
      data: {
        title: 'Integrate payment API',
        description: 'Stripe integration for subscriptions',
        status: TaskStatus.IN_PROGRESS,
        priority: TaskPriority.CRITICAL,
        projectId: project3.id,
        assigneeId: dev1.id,
        creatorId: pm2.id,
        dueDate: futureDate,
      },
    }),
    prisma.task.create({
      data: {
        title: 'Set up webhook handlers',
        description: 'Handle Stripe webhook events',
        status: TaskStatus.REVIEW,
        priority: TaskPriority.HIGH,
        projectId: project3.id,
        assigneeId: dev1.id,
        creatorId: pm2.id,
        dueDate: futureDate,
      },
    }),
    prisma.task.create({
      data: {
        title: 'Create API documentation',
        description: 'OpenAPI/Swagger documentation',
        status: TaskStatus.TODO,
        priority: TaskPriority.MEDIUM,
        projectId: project3.id,
        assigneeId: dev3.id,
        creatorId: pm2.id,
        dueDate: futureDate,
      },
    }),
    prisma.task.create({
      data: {
        title: 'Implement rate limiting',
        description: 'Add rate limiting to all endpoints',
        status: TaskStatus.TODO,
        priority: TaskPriority.HIGH,
        projectId: project3.id,
        assigneeId: dev3.id,
        creatorId: pm2.id,
        dueDate: futureDate,
      },
    }),
    prisma.task.create({
      data: {
        title: 'Database migration scripts',
        description: 'Write migration scripts for new schema',
        status: TaskStatus.TODO,
        priority: TaskPriority.LOW,
        projectId: project3.id,
        assigneeId: dev1.id,
        creatorId: pm2.id,
        dueDate: futureDate,
      },
    }),
    prisma.task.create({
      data: {
        title: 'Overdue task - fix critical bug',
        description: 'Fix login issue affecting all users',
        status: TaskStatus.IN_PROGRESS,
        priority: TaskPriority.CRITICAL,
        projectId: project1.id,
        assigneeId: dev2.id,
        creatorId: pm1.id,
        dueDate: pastDate,
      },
    }),
    prisma.task.create({
      data: {
        title: 'Overdue task - security audit',
        description: 'Complete security audit for API',
        status: TaskStatus.TODO,
        priority: TaskPriority.HIGH,
        projectId: project2.id,
        assigneeId: dev4.id,
        creatorId: pm1.id,
        dueDate: pastDate,
      },
    }),
  ]);

  console.log('✅ Created 17 tasks');

  const overdueTasks = tasks.filter(t => t.dueDate && t.dueDate < now && t.status !== TaskStatus.DONE);
  console.log(`⏰ Found ${overdueTasks.length} overdue tasks`);

  await prisma.activity.createMany({
    data: [
      {
        type: ActivityType.PROJECT_CREATED,
        message: 'Project "Website Redesign" created',
        userId: pm1.id,
        projectId: project1.id,
      },
      {
        type: ActivityType.PROJECT_CREATED,
        message: 'Project "Mobile App Development" created',
        userId: pm1.id,
        projectId: project2.id,
      },
      {
        type: ActivityType.PROJECT_CREATED,
        message: 'Project "API Integration" created',
        userId: pm2.id,
        projectId: project3.id,
      },
      {
        type: ActivityType.TASK_CREATED,
        message: 'Task "Design homepage mockup" created',
        userId: pm1.id,
        projectId: project1.id,
        taskId: tasks[0].id,
      },
      {
        type: ActivityType.TASK_ASSIGNED,
        message: 'Task "Design homepage mockup" assigned to Developer One',
        userId: pm1.id,
        projectId: project1.id,
        taskId: tasks[0].id,
      },
      {
        type: ActivityType.TASK_STATUS_CHANGED,
        message: 'Task "Design homepage mockup" status changed to DONE',
        userId: dev1.id,
        projectId: project1.id,
        taskId: tasks[0].id,
      },
      {
        type: ActivityType.TASK_CREATED,
        message: 'Task "Implement header component" created',
        userId: pm1.id,
        projectId: project1.id,
        taskId: tasks[1].id,
      },
      {
        type: ActivityType.TASK_ASSIGNED,
        message: 'Task "Implement header component" assigned to Developer One',
        userId: pm1.id,
        projectId: project1.id,
        taskId: tasks[1].id,
      },
      {
        type: ActivityType.TASK_STATUS_CHANGED,
        message: 'Task "Implement header component" status changed to DONE',
        userId: dev1.id,
        projectId: project1.id,
        taskId: tasks[1].id,
      },
      {
        type: ActivityType.TASK_CREATED,
        message: 'Task "Build footer component" created',
        userId: pm1.id,
        projectId: project1.id,
        taskId: tasks[2].id,
      },
      {
        type: ActivityType.TASK_ASSIGNED,
        message: 'Task "Build footer component" assigned to Developer Two',
        userId: pm1.id,
        projectId: project1.id,
        taskId: tasks[2].id,
      },
      {
        type: ActivityType.TASK_STATUS_CHANGED,
        message: 'Task "Build footer component" status changed to IN_PROGRESS',
        userId: dev2.id,
        projectId: project1.id,
        taskId: tasks[2].id,
      },
      {
        type: ActivityType.TASK_CREATED,
        message: 'Task "Set up CI/CD pipeline" created',
        userId: pm1.id,
        projectId: project1.id,
        taskId: tasks[3].id,
      },
      {
        type: ActivityType.TASK_ASSIGNED,
        message: 'Task "Set up CI/CD pipeline" assigned to Developer Two',
        userId: pm1.id,
        projectId: project1.id,
        taskId: tasks[3].id,
      },
      {
        type: ActivityType.TASK_STATUS_CHANGED,
        message: 'Task "Set up CI/CD pipeline" status changed to REVIEW',
        userId: dev2.id,
        projectId: project1.id,
        taskId: tasks[3].id,
      },
      {
        type: ActivityType.TASK_CREATED,
        message: 'Task "Design mobile app screens" created',
        userId: pm1.id,
        projectId: project2.id,
        taskId: tasks[5].id,
      },
      {
        type: ActivityType.TASK_ASSIGNED,
        message: 'Task "Design mobile app screens" assigned to Developer Three',
        userId: pm1.id,
        projectId: project2.id,
        taskId: tasks[5].id,
      },
      {
        type: ActivityType.TASK_STATUS_CHANGED,
        message: 'Task "Design mobile app screens" status changed to DONE',
        userId: dev3.id,
        projectId: project2.id,
        taskId: tasks[5].id,
      },
      {
        type: ActivityType.TASK_CREATED,
        message: 'Task "Set up React Native project" created',
        userId: pm1.id,
        projectId: project2.id,
        taskId: tasks[6].id,
      },
      {
        type: ActivityType.TASK_ASSIGNED,
        message: 'Task "Set up React Native project" assigned to Developer Three',
        userId: pm1.id,
        projectId: project2.id,
        taskId: tasks[6].id,
      },
      {
        type: ActivityType.TASK_STATUS_CHANGED,
        message: 'Task "Set up React Native project" status changed to IN_PROGRESS',
        userId: dev3.id,
        projectId: project2.id,
        taskId: tasks[6].id,
      },
    ],
  });

  console.log('📝 Created activity records');

  const taskForNotification1 = tasks[2];
  const taskForNotification2 = tasks[3];

  await prisma.notification.createMany({
    data: [
      {
        type: NotificationType.TASK_ASSIGNED,
        message: 'You have been assigned to "Build footer component"',
        userId: dev2.id,
        taskId: taskForNotification1.id,
        projectId: project1.id,
      },
      {
        type: NotificationType.TASK_ASSIGNED,
        message: 'You have been assigned to "Set up CI/CD pipeline"',
        userId: dev2.id,
        taskId: taskForNotification2.id,
        projectId: project1.id,
      },
      {
        type: NotificationType.TASK_MOVED_TO_REVIEW,
        message: 'Task "Set up CI/CD pipeline" moved to In Review',
        userId: pm1.id,
        taskId: taskForNotification2.id,
        projectId: project1.id,
      },
      {
        type: NotificationType.TASK_ASSIGNED,
        message: 'You have been assigned to "Set up React Native project"',
        userId: dev3.id,
        taskId: tasks[6].id,
        projectId: project2.id,
      },
      {
        type: NotificationType.TASK_ASSIGNED,
        message: 'You have been assigned to "Implement authentication flow"',
        userId: dev4.id,
        taskId: tasks[7].id,
        projectId: project2.id,
      },
      {
        type: NotificationType.TASK_MOVED_TO_REVIEW,
        message: 'Task "Set up webhook handlers" moved to In Review',
        userId: pm2.id,
        taskId: tasks[11].id,
        projectId: project3.id,
      },
    ],
  });

  console.log('🔔 Created notifications (some unread)');

  const stats = {
    users: await prisma.user.count(),
    clients: await prisma.client.count(),
    projects: await prisma.project.count(),
    tasks: await prisma.task.count(),
    activities: await prisma.activity.count(),
    notifications: await prisma.notification.count(),
    overdueTasks: overdueTasks.length,
  };

  console.log('\n📊 Seed Summary:');
  console.table(stats);

  console.log('\n🔑 Test Credentials (password: password123):');
  console.log('  admin@example.com     - ADMIN');
  console.log('  pm1@example.com       - PROJECT_MANAGER');
  console.log('  pm2@example.com       - PROJECT_MANAGER');
  console.log('  dev1@example.com      - DEVELOPER');
  console.log('  dev2@example.com      - DEVELOPER');
  console.log('  dev3@example.com      - DEVELOPER');
  console.log('  dev4@example.com      - DEVELOPER');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
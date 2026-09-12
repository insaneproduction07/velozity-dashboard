import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { config } from './config/index.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import authRoutes from './modules/auth/routes.js';
import userRoutes from './modules/users/routes.js';
import clientRoutes from './modules/clients/routes.js';
import projectRoutes from './modules/projects/routes.js';
import taskRoutes from './modules/tasks/routes.js';
import commentRoutes from './modules/comments/routes.js';
import activityRoutes from './modules/activity/routes.js';
import notificationRoutes from './modules/notifications/routes.js';
export function createApp() {
    const app = express();
    app.use(helmet());
    app.use(cors({
        origin: config.corsOrigin,
        credentials: true,
    }));
    app.use(express.json());
    app.use(cookieParser());
    app.get('/health', (_req, res) => {
        res.json({ status: 'ok', timestamp: new Date().toISOString() });
    });
    app.use('/api/auth', authRoutes);
    app.use('/api/users', userRoutes);
    app.use('/api/clients', clientRoutes);
    app.use('/api/projects', projectRoutes);
    app.use('/api', taskRoutes);
    app.use('/api', commentRoutes);
    app.use('/api', activityRoutes);
    app.use('/api/notifications', notificationRoutes);
    app.use(notFoundHandler);
    app.use(errorHandler);
    return app;
}
//# sourceMappingURL=app.js.map
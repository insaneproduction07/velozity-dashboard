import { createServer } from 'http';
import { createApp } from './app.js';
import { config } from './config/index.js';
import { initializeSocket } from './socket/index.js';

const app = createApp();
const httpServer = createServer(app);

initializeSocket(httpServer);

httpServer.listen(config.port, () => {
  console.log(`Server running on port ${config.port} in ${config.nodeEnv} mode`);
});
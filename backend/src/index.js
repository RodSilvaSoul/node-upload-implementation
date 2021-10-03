import http from 'http';

import { logger } from './logger.js';
import { Router } from './routes.js';

const PORT = process.env.PORT || 3000;

const router = new Router();

const server = http.createServer(router.handler.bind(router));

const startServer = () => {
  const { address, port } = server.address();
  logger.info(`app running ate http://${address}:${port}`);
};

server.listen(PORT, startServer);

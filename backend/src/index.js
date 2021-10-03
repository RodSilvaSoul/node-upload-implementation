import http from 'http';
import { Server } from 'socket.io';

import { logger } from './logger.js';
import { Router } from './routes.js';

const PORT = process.env.PORT || 3000;

const router = new Router();

const server = http.createServer(router.handler.bind(router));

const io = new Server(server, {
  cors: {
    origin: '*',
    credentials: false,
  },
});

router.setSocketInstance(io)

io.on('connection', (socket) => logger.info(`someone connected: ${socket.id}`));


const startServer = () => {
  const { address, port } = server.address();
  logger.info(`app running ate http://${address}:${port}`);
};

server.listen(PORT, startServer);

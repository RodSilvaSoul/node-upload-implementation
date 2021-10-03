import https from 'https';
import fs from 'fs';

import { logger } from './logger.js';
import { Router } from './routes.js';

const PORT = process.env.PORT || 3000;

const localHostSSL = {
  key: fs.readFileSync('./certificates/key.pem'),
  cert: fs.readFileSync('./certificates/cert.pem'),
};

const router = new Router();

const server = https.createServer(localHostSSL, router.handler.bind(router));

const startServer = () => {
  const { address, port } = server.address();
  logger.info(`app running ate https://${address}:${port}`);
};

server.listen(PORT, startServer);

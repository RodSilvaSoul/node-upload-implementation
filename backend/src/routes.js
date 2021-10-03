import { resolve } from 'path';
import { parse } from 'url';
import { pipeline } from 'stream/promises';

import { logger } from './logger.js';
import { FileHelper } from './file-helper.js';
import { UploadHandler } from './upload-handler.js';
import { Utils } from './utils.js';

const __dirname = Utils.getDirname();
const defaultDownloadsFolder = resolve(__dirname, '../', 'downloads');

class Router {
  constructor(downloadsFolder = defaultDownloadsFolder) {
    this.downloadsFolder = downloadsFolder;
    this.fileHelper = FileHelper;
  }

  setSocketInstance(io) {
    this.io = io;
  }

  async unsupportedMethod(req, res) {
    res.writeHead(405);
    res.end('Unsupported method');
  }

  async options(req, res) {
    res.writeHead(204);
    res.end();
  }

  async post(req, res) {
    const { headers } = req;

    const {
      query: { socketId },
    } = parse(req.url, true);


    const uploadHandler = new UploadHandler({
      socketId,
      io: this.io,
      downloadsFolder: this.downloadsFolder,
    });

    const onFinish = (_res) => () => {
      _res.writeHead(200);
      const data = JSON.stringify({ result: 'Files uploaded with success!' });
      _res.end(data);
    };

    const busboyInstance = uploadHandler.registerEvents(headers, onFinish(res));

    await pipeline(req, busboyInstance);

    logger.info('Request finished with success!');
  }

  async get(req, res) {
    const files = await this.fileHelper.getFilesStatus(this.downloadsFolder);

    res.writeHead(200);
    res.end(JSON.stringify(files));
  }

  handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');

    const chosen = this[req.method.toLowerCase()] || this.unsupportedMethod;

    return chosen.apply(this, [req, res]);
  }
}

export { Router };

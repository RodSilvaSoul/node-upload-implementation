import { resolve } from 'path';
import { pipeline } from 'stream/promises';

import fs from 'fs';
import Busboy from 'busboy';
import { logger } from './logger.js';

class UploadHandler {
  constructor({ io, socketId, downloadsFolder, messageTimeDelay = 300 }) {
    this.io = io;
    this.socketId = socketId;
    this.downloadsFolder = downloadsFolder;
    this.ON_UPLOAD_EVENT = 'file-upload';
    this.messageTimeDelay = messageTimeDelay;
  }

  canEmit(lastExecution) {
    const timeCalc = Date.now() - lastExecution;
    return timeCalc >= this.messageTimeDelay;
  }

  handleBuffer(fileName) {
    this.lastMessageSent = Date.now();

    async function* handleData(source) {
      let processedAlready = 0;

      for await (const chunk of source) {
        yield chunk;

        processedAlready += chunk.length;
        if (!this.canEmit(this.lastMessageSent)) {
          continue;
        }

        this.io
          .to(this.socketId)
          .emit(this.ON_UPLOAD_EVENT, { processedAlready, fileName });

        this.lastMessageSent = Date.now();

        logger.info(
          `File [${fileName}] go ${processedAlready} bytes to ${this.socketId}`,
        );
      }
    }

    return handleData.bind(this);
  }

  async onFile(fieldName, file, filename) {
    const saveTo = resolve(this.downloadsFolder, filename);

    await pipeline(
      file,
      this.handleBuffer.apply(this, [filename]),
      fs.createWriteStream(saveTo),
    );
  }

  registerEvents(headers, onFinish) {
    const busboy = new Busboy({ headers });

    busboy.on('file', this.onFile.bind(this));
    busboy.on('finish', onFinish);

    return busboy;
  }
}

export { UploadHandler };

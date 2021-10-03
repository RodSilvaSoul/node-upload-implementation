import { jest, expect, describe, test, beforeEach } from '@jest/globals';
import fs from 'fs';
import { pipeline } from 'stream/promises';
import { resolve } from 'path';

import { UploadHandler } from '../../src/upload-handler.js';
import { TestUtil } from '../_test-util/test-util.js';
import { logger } from '../../src/logger.js';

describe('#UploadHandler test suite', () => {
  const ioObj = {
    to: (id) => ioObj,
    emit: (event, message) => {},
  };

  beforeEach(() => {
    jest.spyOn(logger, 'info').mockImplementation();
    jest.clearAllMocks();
  });

  describe('#registerEvents', () => {
    test('should call onFile and onFinish  functions on Busboy instance', () => {
      const uploadHandler = new UploadHandler({
        io: ioObj,
        sockedID: '01',
      });

      jest.spyOn(uploadHandler, uploadHandler.onFile.name).mockResolvedValue();

      const headers = {
        'content-type': 'multipart/form-data; boundary=',
      };

      const onFish = jest.fn();
      const busboyInstance = uploadHandler.registerEvents(headers, onFish);

      const readable = TestUtil.generateReadableStream(['chunk', 'of', 'data']);
      busboyInstance.emit('file', 'file', readable, 'any_file.data');
      busboyInstance.listeners('finish')[0].call();

      expect(uploadHandler.onFile).toHaveBeenCalled();
      expect(onFish).toHaveBeenCalled();
    });
  });

  describe('#onFile', () => {
    test('given a stream file it should save it on disk', async () => {
      const chunks = ['file', 'chunk'];
      const downloadsFolder = '/tmp';

      const handler = new UploadHandler({
        io: ioObj,
        sockedID: '01',
        downloadsFolder,
      });

      const onData = jest.fn();
      jest
        .spyOn(fs, fs.createWriteStream.name)
        .mockImplementation(() => TestUtil.generateWritableStream(onData));

      const onTransform = jest.fn();
      jest
        .spyOn(handler, handler.handleBuffer.name)
        .mockImplementation(() =>
          TestUtil.generateTransformStream(onTransform),
        );

      const params = {
        fieldName: 'photo',
        file: TestUtil.generateReadableStream(chunks),
        filename: 'image.photo',
      };

      await handler.onFile(...Object.values(params));

      expect(onData.mock.calls.join()).toEqual(chunks.join());
      expect(onTransform.mock.calls.join()).toEqual(chunks.join());

      const expectedFilename = resolve(
        handler.downloadsFolder,
        params.filename,
      );

      expect(fs.createWriteStream).toHaveBeenCalledWith(expectedFilename);
    });
  });

  describe('#handleBuffer', () => {
    test('should call emit function and it is a transform stream', async () => {
      jest.spyOn(ioObj, ioObj.emit.name);
      jest.spyOn(ioObj, ioObj.to.name);

      const handler = new UploadHandler({
        io: ioObj,
        sockedID: '01',
      });

      jest.spyOn(handler, handler.canEmit.name).mockReturnValue(true);

      const messages = ['hello', 'world'];
      const source = TestUtil.generateReadableStream(messages);
      const onWrite = jest.fn();
      const target = TestUtil.generateWritableStream(onWrite);

      await new pipeline(source, handler.handleBuffer('any_file.data'), target);

      expect(ioObj.to).toHaveBeenCalledTimes(messages.length);
      expect(ioObj.emit).toHaveBeenCalledTimes(messages.length);

      expect(onWrite.mock.calls.join()).toEqual(messages.join());
    });

    test('should message timerDelay as 2secs it should emit only two messages during 3 seconds period', async () => {
      jest.spyOn(ioObj, ioObj.emit.name);

      const day = '2021-10-02 00:00';
      const period = 2000;

      const onInitLastMessageSent = TestUtil.getTimeFormDate(`${day}:00`);

      const onFirstCanExecute = TestUtil.getTimeFormDate(`${day}:02`);
      const onFistUpdatedOnLastMessageSent = onFirstCanExecute;

      const onSecondCanExecute = TestUtil.getTimeFormDate(`${day}:03`);

      const onThirdCanExecute = TestUtil.getTimeFormDate(`${day}:04`);

      TestUtil.mockDateNow([
        onInitLastMessageSent,
        onFirstCanExecute,
        onFistUpdatedOnLastMessageSent,
        onSecondCanExecute,
        onThirdCanExecute,
      ]);

      const messages = ['hello', 'hello', 'word'];
      const source = TestUtil.generateReadableStream(messages);
      const fileName = 'any_file.data';
      const handler = new UploadHandler({
        io: ioObj,
        messageTimeDelay: period,
        sockedID: '01',
      });

      await pipeline(source, handler.handleBuffer(fileName));

      expect(ioObj.emit).toBeCalledTimes(2);
      const [firstEmitExecution, secondeEmitExecution] = ioObj.emit.mock.calls;

      expect(firstEmitExecution).toEqual([
        handler.ON_UPLOAD_EVENT,
        {
          processedAlready: 'hello'.length,
          fileName,
        },
      ]);

      expect(secondeEmitExecution).toEqual([
        handler.ON_UPLOAD_EVENT,
        {
          processedAlready: messages.join('').length,
          fileName,
        },
      ]);
    });
  });

  describe('#canExecute', () => {
    test('should return true when time is later tan specified delay', () => {
      const messageTimeDelay = 1000;
      const handle = new UploadHandler({
        io: {},
        sockedID: '',
        messageTimeDelay,
      });

      const lastExecution = TestUtil.getTimeFormDate('2022-06-01 00:00:00');

      const currentExecution = TestUtil.getTimeFormDate('2022-06-01 00:00:01');
      TestUtil.mockDateNow([currentExecution]);

      const result = handle.canEmit(lastExecution);

      expect(result).toBeTruthy();
    });

    test('should return false when time inst later than specified delay', () => {
      const messageTimeDelay = 2000;
      const handle = new UploadHandler({
        io: {},
        sockedID: '',
        messageTimeDelay,
      });

      const lastExecution = TestUtil.getTimeFormDate('2022-06-01 00:00:00');

      const currentExecution = TestUtil.getTimeFormDate('2022-06-01 00:00:01');
      TestUtil.mockDateNow([currentExecution]);

      const result = handle.canEmit(lastExecution);

      expect(result).toBeFalsy();
    });
  });
});

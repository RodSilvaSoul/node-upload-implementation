import {
  jest,
  expect,
  describe,
  beforeEach,
  test,
  beforeAll,
  afterAll,
} from '@jest/globals';
import { resolve } from 'path';
import { tmpdir } from 'os';
import { join } from 'path';

import fs from 'fs';
import FormData from 'form-data';

import { logger } from '../../src/logger.js';
import { TestUtil } from '../_test-util/test-util.js';
import { Router } from '../../src/routes.js';

describe('#Routes Integration Test', () => {
  describe('#getFileStatus', () => {
    let defaultDownloadsFolder = '';

    beforeAll(async () => {
      defaultDownloadsFolder = await fs.promises.mkdtemp(
        join(tmpdir(), 'downloads-'),
      );
    });

    afterAll(async () => {
      await fs.promises.rm(defaultDownloadsFolder, { recursive: true });
    });

    beforeEach(() => {
      jest.spyOn(logger, 'info').mockImplementation();
    });

    test('should upload file to the folder', async () => {
      const ioObj = {
        to: jest.fn(),
        emit: jest.fn(),
      };

      const fileName = 'cassandra.jpg';
      const fileStream = fs.createReadStream(
        resolve('.', 'test', 'integration', 'mocks', fileName),
      );

      const response = TestUtil.generateWritableStream(() => {});

      const form = new FormData();
      form.append('photo', fileStream);

      const defaultParams = {
        request: Object.assign(form, {
          headers: form.getHeaders(),
          method: 'POST',
          url: '?sockedId=10',
        }),

        response: Object.assign(response, {
          setHeader: jest.fn(),
          writeHead: jest.fn(),
          end: jest.fn(),
        }),
        values: () => Object.values(defaultParams),
      };

      const router = new Router(defaultDownloadsFolder);
      router.setSocketInstance(ioObj);

      const dirBeforeRan = await fs.promises.readdir(defaultDownloadsFolder);
      expect(dirBeforeRan).toEqual([]);

      await router.handler(...defaultParams.values());

      const dirAfterRan = await fs.promises.readdir(defaultDownloadsFolder);
      expect(dirAfterRan).toEqual([fileName]);

      expect(defaultParams.response.writeHead).toHaveBeenCalledWith(200);

      const expectedResult = JSON.stringify({
        result: 'Files uploaded with success!',
      });
      expect(defaultParams.response.end).toHaveBeenCalledWith(expectedResult);
    });
  });
});

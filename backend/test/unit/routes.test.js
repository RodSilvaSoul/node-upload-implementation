import { describe, test, expect, jest, beforeEach } from '@jest/globals';

import { Router } from '../../src/routes.js';
import { logger } from '../../src/logger.js';
import { TestUtil } from '../_test-util/test-util.js';
import { UploadHandler } from '../../src/upload-handler.js';

describe('#Routes test suite', () => {
  beforeEach(() => {
    jest.spyOn(logger, 'info').mockImplementation();
  });

  const request = TestUtil.generateReadableStream(['some file']);
  const response = TestUtil.generateWritableStream(() => {});

  const defaultParams = {
    request: Object.assign(request, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      method: '',
      body: {},
    }),

    response: Object.assign(response, {
      setHeader: jest.fn(),
      writeHead: jest.fn(),
      end: jest.fn(),
    }),
    values: () => Object.values(defaultParams),
  };

  describe('#setSocketInstance', () => {
    test('setSocket should store io instance', () => {
      const router = new Router();

      const ioObj = {
        to: (id) => ioObj,
        emit: (event, message) => {},
      };

      router.setSocketInstance(ioObj);
      expect(router.io).toStrictEqual(ioObj);
    });
  });

  describe('#handler', () => {
    test('given an not supported method it should choose unsupported method', () => {
      const router = new Router();
      const params = {
        ...defaultParams,
      };

      params.request.method = 'DELETE';

      router.handler(...params.values());

      expect(params.response.end).toHaveBeenCalledWith('Unsupported method');
      expect(params.response.writeHead).toHaveBeenCalledWith(405);
    });

    test('given method GET it should choose get route', async () => {
      const params = {
        ...defaultParams,
      };
      const router = new Router();

      params.request.method = 'GET';

      jest.spyOn(router, router.get.name).mockResolvedValue();

      await router.handler(...params.values());

      expect(router.get).toHaveBeenCalled();
    });

    test('given method POST it should choose post route', async () => {
      const params = {
        ...defaultParams,
      };
      const router = new Router();

      params.request.method = 'POST';

      jest.spyOn(router, router.post.name).mockResolvedValue();

      await router.handler(...params.values());

      expect(router.post).toHaveBeenCalled();
    });

    test('given method OPTIONS it should choose options route', async () => {
      const params = {
        ...defaultParams,
      };
      const router = new Router();

      params.request.method = 'OPTIONS';

      await router.handler(...params.values());

      expect(params.response.writeHead).toBeCalledWith(204);
      expect(params.response.end).toHaveBeenCalled();
    });
  });

  describe('#Get', () => {
    test('given method GET it should list all files downloaded', async () => {
      const router = new Router();
      const params = {
        ...defaultParams,
      };

      const filesStatusesMock = [
        {
          size: '2.54 MB',
          lastModified: '2021-10-01T15:48:44.362Z',
          owner: 'any_user',
          file: 'any_file.txt',
        },
      ];

      jest
        .spyOn(router.fileHelper, router.fileHelper.getFilesStatus.name)
        .mockResolvedValue(filesStatusesMock);

      params.request.method = 'GET';

      await router.handler(...params.values());

      expect(params.response.writeHead).toHaveBeenCalledWith(200);
      expect(params.response.end).toHaveBeenCalledWith(
        JSON.stringify(filesStatusesMock),
      );
    });
  });

  describe('#Post', () => {
    test('it should validate post workflow', async () => {
      const router = new Router('/tmp');

      const params = {
        ...defaultParams,
      };

      params.request.method = 'POST';
      params.request.url = '?sockedId=10';

      jest
        .spyOn(
          UploadHandler.prototype,
          UploadHandler.prototype.registerEvents.name,
        )
        .mockImplementation((headers, onFinish) => {
          const writable = TestUtil.generateWritableStream(() => {});
          writable.on('finish', onFinish);

          return writable;
        });

      await router.handler(...params.values());

      expect(UploadHandler.prototype.registerEvents).toHaveBeenCalled();
      expect(params.response.writeHead).toHaveBeenCalledWith(200);

      const expectedResult = JSON.stringify({
        result: 'Files uploaded with success!',
      });
      expect(params.response.end).toHaveBeenCalledWith(expectedResult);
    });
  });
});

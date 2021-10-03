import { describe, test, expect, jest } from '@jest/globals';
import fs from 'fs';
import { FileHelper } from '../../src/file-helper.js';

describe('#FileHelper', () => {
  describe('#getFileStatus', () => {
    test('it should return files statuses in correct format', async () => {
      const statMock = {
        dev: 66306,
        mode: 33204,
        nlink: 1,
        uid: 1000,
        gid: 1000,
        rdev: 0,
        blksize: 4096,
        ino: 6196471,
        size: 2539665,
        blocks: 4968,
        atimeMs: 1633103340882.4253,
        mtimeMs: 1633103340804,
        ctimeMs: 1633103340802.4258,
        birthtimeMs: 1633103324362.4895,
        atime: '2021-10-01T15:49:00.882Z',
        mtime: '2021-10-01T15:49:00.804Z',
        ctime: '2021-10-01T15:49:00.802Z',
        birthtime: '2021-10-01T15:48:44.362Z',
      };

      const mockUser = 'any_user';
      process.env.USER = mockUser;

      const filename = 'any_file.txt';

      jest
        .spyOn(fs.promises, fs.promises.readdir.name)
        .mockResolvedValue([filename]);

      jest
        .spyOn(fs.promises, fs.promises.stat.name)
        .mockResolvedValue(statMock);

      const result = await FileHelper.getFilesStatus('/tmp');

      const expectedResult = [
        {
          size: '2.54 MB',
          lastModified: statMock.birthtime,
          owner: mockUser,
          file: filename,
        },
      ];

      expect(fs.promises.stat).toHaveBeenCalledWith(`/tmp/${filename}`);
      expect(result).toMatchObject(expectedResult);
    });
  });
});

import { jest } from '@jest/globals';

import { Readable, Transform, Writable } from 'stream';

class TestUtil {
  static mockDateNow(periodsList) {
    const now = jest.spyOn(global.Date, global.Date.now.name);

    periodsList.forEach((time) => {
      now.mockReturnValueOnce(time);
    });
  }

  static getTimeFormDate(dateString) {
    return new Date(dateString);
  }

  static generateReadableStream(data) {
    return new Readable({
      objectMode: true,
      read() {
        for (const item of data) {
          this.push(item);
        }

        this.push(null);
      },
    });
  }

  static generateWritableStream(ondData) {
    return new Writable({
      objectMode: true,
      write(chunk, encoding, cb) {
        ondData(chunk);

        cb(null, chunk);
      },
    });
  }

  static generateTransformStream(onTransform) {
    return new Transform({
      objectMode: true,
      transform(chunk, encoding, cb) {
        onTransform(chunk);

        cb(null, chunk);
      },
    });
  }
}

export { TestUtil };

import { fileURLToPath } from 'url';
import { dirname } from 'path';

class Utils {
  static getDirname() {
    return dirname(fileURLToPath(import.meta.url));
  }
}

export { Utils };

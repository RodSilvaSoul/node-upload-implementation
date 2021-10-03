import { AppController } from './src/app-controller.js';
import { ConnectionManager } from './src/connection-manager.js';
import { DragAndDropManager } from './src/drag-and-drop-manager.js';
import { ViewManager } from './src/view-manager.js';

const API_URL = 'http://0.0.0.0:3000';

const appController = new AppController({
  viewManager: new ViewManager(),
  dragAndDropManager: new DragAndDropManager(),
  connectionManager: new ConnectionManager({
    apiUrl: API_URL,
  }),
});

try {
  await appController.init();
} catch (error) {
  console.error('error on initializing', error);
}

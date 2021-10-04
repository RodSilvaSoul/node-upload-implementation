class DragAndDropManager {
  constructor() {
    this.dropArea = document.getElementById('dropArea');
    this.onDropHandler = () => {};
  }

  init({ onDropHandler }) {
    this.onDropHandler = onDropHandler;

    this.disableDragAnDropEvents();
    this.enableHighLightOnDrag();
    this.enableDrop();
  }

  disableDragAnDropEvents() {
    const events = ['dragenter', 'dragover', 'dragleave', 'drop'];

    const setPreventDefault = (e) => {
      e.preventDefault();
      e.stopPropagation();
    };

    events.forEach((eventName) => {
      const getParams = () => [eventName, setPreventDefault, false];

      this.dropArea.addEventListener(...getParams());
      document.body.addEventListener(...getParams());
    });
  }

  enableHighLightOnDrag() {
    const events = ['dragenter', 'dragover'];

    const highlight = () => {
      this.dropArea.classList.add('highlight');
      this.dropArea.classList.add('drop-area');
    };

    events.forEach((eventName) => {
      this.dropArea.addEventListener(eventName, highlight, false);
    });
  }

  enableDrop() {
    const drop = (e) => {
      this.dropArea.classList.remove('drop-area');

      const files = e.dataTransfer.files;
      return this.onDropHandler(files);
    };

    this.dropArea.addEventListener('drop', drop, false);
  }
}

export { DragAndDropManager };

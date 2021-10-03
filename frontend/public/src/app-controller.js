class AppController {
  constructor({ connectionManager, viewManager, dragAndDropManager }) {
    this.connectionManager = connectionManager;
    this.viewManager = viewManager;
    this.dragAndDropManager = dragAndDropManager;

    this.uploadingFiles = new Map();
  }

  async init() {
    this.viewManager.configureFileBtnClick();
    this.viewManager.configureModal(M);
    this.viewManager.configureFileChange(this.onFileChange.bind(this));

    this.connectionManager.configureEvents({
      onProgress: this.onProgress.bind(this),
    });

    this.dragAndDropManager.init({
      onDropHandler: this.onFileChange.bind(this),
    });
    this.updateCurrentFiles()
  }

  updateProgress(fileName, percent) {
    const uploadingFiles = this.uploadingFiles;
    const currentFile = uploadingFiles.get(fileName);

    this.uploadingFiles.set(fileName, {
      ...currentFile,
      percent,
    });

    const total = [...uploadingFiles.values()]
      .map(({ percent }) => percent)
      .reduce((total, current) => total + current, 0);

    this.viewManager.updateStatus(Math.ceil(total / uploadingFiles.size));
  }

  async onProgress({ processedAlready, fileName }) {

    const file = this.uploadingFiles.get(fileName);
    const processed = Math.ceil((processedAlready / file.size) * 100);
    this.updateProgress(fileName, processed);

    if (processed < 98) return;

    return this.updateCurrentFiles();
  }

  async onFileChange(files) {
    this.viewManager.openModal();
    this.viewManager.updateStatus(0);

    const requests = [];

    for (const file of files) {
      this.uploadingFiles.set(file.name, {
        size: file.size,
        percent: 0,
      });

      requests.push(this.connectionManager.uploadFile(file));
    }

    await Promise.all(requests);

    this.viewManager.updateStatus(100);

    setTimeout(() => this.viewManager.closeModal(), 2000);

    await this.updateCurrentFiles(files);
    this.uploadingFiles.clear();
  }

  async updateCurrentFiles() {
    const files = await this.connectionManager.currentFiles();
    this.viewManager.updateCurrentFiles(files);
  }
}

export { AppController };

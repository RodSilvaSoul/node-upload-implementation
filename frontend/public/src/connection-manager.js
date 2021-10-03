class ConnectionManager {
  constructor({ apiUrl }) {
    this.apiUrl = apiUrl;
    this.ioClient = io.connect(apiUrl, { witchCredentials: false });
    this.shockedId = '';
  }

  onConnect() {
    this.shockedId = this.ioClient.id;
  }

  configureEvents({ onProgress }) {
    this.ioClient.on('connect', this.onConnect.bind(this));
    this.ioClient.on('file-upload', onProgress);
  }

  async uploadFile(file) {
    const formData = new FormData();
    formData.append('files', file);

    const response = await fetch(`${this.apiUrl}?socketId=${this.shockedId}`, {
      method: 'POST',
      body: formData,
    });

    return await response.json();
  }

  async currentFiles() {
    const response = await fetch(this.apiUrl);
    const files = response.json();

    return files;
  }
}

export { ConnectionManager };

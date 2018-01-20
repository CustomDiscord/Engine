const fs = require('fs-extra');
const EventEmitter = require('eventemitter3');

class Watcher extends EventEmitter {
  constructor() {
    super();
    this._watcher = {};
  }

  addFile(fileName, identifier = null) {
    if (!identifier) identifier = fileName;

    if (this._watcher[fileName]) throw new Error(fileName + 'already watched');

    const watcher = fs.watch(fileName, 'utf-8', type =>
      this._onFileChange(identifier, fileName, type)
    );
    this._watcher[fileName] = {
      identifier,
      watcher,
      fileName
    };
  }

  removeFile(fileName) {
    let watcher = this._watcher[fileName];
    if (!watcher)
      watcher = Object.keys(this._watcher)
        .map(id => this._watcher[id])
        .find(w => w.identifier === fileName);

    if (!watcher) return;

    watcher.watcher.close();
    delete watcher[watcher.fileName];
  }

  removeAllFiles() {
    Object.keys(this._watcher)
      .map(id => this._watcher[id])
      .forEach(w => w.watcher.close());
    this._watcher = {};
  }

  _onFileChange(identifier, fileName, type) {
    this.emit(type, fileName, identifier);
  }
}

module.exports = Watcher;

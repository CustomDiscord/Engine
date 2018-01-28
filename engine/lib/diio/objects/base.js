const EventEmitter = require('eventemitter3');

class Base extends EventEmitter {
  constructor(client, o) {
    super();

    this.client = client;
    Object.keys(o).forEach(k => {
      const normalized = k.replace(/_+([a-z0-9])/gi, m => m[1].toUpperCase());
      if (this._skipFields.indexOf(k) < 0 && o.hasOwnProperty(k)) {
        this[normalized] = o[k];
      }
    });
  }

  merge(o) {
    Object.keys(o).forEach(k => {
      const normalized = k.replace(/_+([a-z0-9])/gi, m => m[1].toUpperCase());
      if (o.hasOwnProperty(k)) {
        if (this._skipFields.indexOf(k) >= 0) {
          return;
        }
        if (
          !this.hasOwnProperty[normalized] &&
          this._optionalFields.indexOf(k) < 0
        ) {
          console.warn('[DIIO] setting unknown value in merge process!', k);
        }
        this[normalized] = o[k];
      }
    });
  }

  get _skipFields() {
    return [];
  }

  get _optionalFields() {
    return [];
  }
}

module.exports = Base;

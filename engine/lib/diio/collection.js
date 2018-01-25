class Collection {
  constructor(client, baseClass, data = [], options = {}) {
    if (!Array.isArray(data)) {
      options = data;
      data = [];
    }

    this.client = client;
    this._data = data;
    this._loadedData = new Map();
    this._notFound = options.onNotFound || function() {};
    this._found = options.onFound || function() {};
    this._selector = options.selector;

    this.cls = baseClass;
  }

  clear() {
    this._data = [];
    this._loadedData.clear();
  }

  add(data, initialize = false) {
    if (data instanceof this.cls) {
      this._loadedData.set(data.id, data);
    } else if (initialize) {
      data = new this.cls(this.client, data);
      this._loadedData.set(data.id, data);
    } else {
      this._data = data;
    }
  }

  addArray(arr) {
    this._data = this._data.concat(...arr);
  }

  get notFound() {
    return this._notFound;
  }

  get found() {
    return this._found;
  }

  get(identifier) {
    const id = identifier.id || identifier;

    if (this._loadedData.has(id)) {
      return this._loadedData.get(id);
    }

    let set = this._data.find(
      r => (this._selector ? this._selector === id : r.id === id)
    );

    if (!set) set = this.notFound(id);
    if (set) {
      const data = new this.cls(this.client, set);
      this.found(data);
      this._loadedData.set(data.id, data);
      this._data.splice(this._data.findIndex(r => r.id === id), 1);
      return data;
    }

    return null;
  }

  has(id) {
    return this.get(id) !== null;
  }

  find(compare) {
    // ugly loops
    for (const res of this._loadedData.values()) {
      if (compare(res)) {
        return res;
      }
    }

    //manually walk the tree
    let row;
    while ((row = this._data.shift())) {
      const data = new this.cls(this.client, row);
      this.found(data)._datathis._loadedData.set(data.id, data);

      if (compare(data)) {
        return data;
      }
    }
  }
  forEach(cb) {
    // abuse <3
    this.find(row => {
      cb(row);
      return false;
    });
  }
}

module.exports = Collection;

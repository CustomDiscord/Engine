const { getCurrentWindow, getCurrentWebContents } = require('electron').remote,
  path = require('path'),
  fs = require('fs'),
  Promise = require('bluebird');

// websocket
require('../lib/webSocket');

// prelaunch adjustments
const CD = {
  get conf() {
    /*const conf = fs.existsSync(path.join(__dirname, '..', '..', 'config.json'))
      ? require(path.join(__dirname, '..', '..', 'config.json'))
      : {};*/
    const conf = require('../../config');
    return conf;
  },

  get package() {
    return require(path.join(__dirname, '..', '..', 'package.json'));
  },

  get version() {
    return this.package.version;
  },

  engineRequire(pathName) {
    return require(`../${pathName}`);
  }
};

// persist local storage
Object.defineProperty(CD, 'localStorage', {
  writable: false,
  value: require('../lib/localStorage')
});

// The Discord client (powered by diio)
Object.defineProperty(CD, 'client', {
  writable: false,
  value: new (require('../lib/diio'))(CD)
});

Object.defineProperty(CD, 'plugins', {
  writable: false,
  value: new (require('../lib/pluginManager'))(CD)
});

// WS Bridge :D
WebSocket.onCreate = (socket, url) => {
  if (url.includes('encoding')) {
    CD.client.connect(socket);
  }
};

// TODO: Load Preload plugins
// TODO: Come up with a better name for Preload Plugins

process.once('loaded', async () => {
  window.include = (file, ...args) => {
    return require(path.resolve(__dirname, '..', file), ...args);
  };

  const ready = new Promise(rs => getCurrentWebContents().on('dom-ready', rs));

  //load core modules
  await CD.plugins.loadByPath(
    path.join(__dirname, '..', 'corePlugins', 'react'),
    true,
    true
  );
  await CD.plugins.loadByPath(
    path.join(__dirname, '..', 'corePlugins', 'settings'),
    true,
    true
  );
  await CD.plugins.loadByPath(
    path.join(__dirname, '..', 'corePlugins', 'commands'),
    true,
    true
  );
  await CD.plugins.loadByPath(
    path.join(__dirname, '..', 'corePlugins', 'changelog'),
    true,
    true
  );
  await CD.plugins.loadByPath(
    path.join(__dirname, '..', 'corePlugins', 'css'),
    true,
    true
  );

  await CD.plugins.loadPluginPath();

  if (CD.conf.debug) {
    window.CD = CD;
    _cdebug = window.console.debug;
    window.console.debug = (...args) => {
      if (window.CD.conf.debug) _cdebug(...args);
    };
  }
  ready.then(() => CD.plugins.ready());
});

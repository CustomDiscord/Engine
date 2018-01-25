const Command = require('./command'),
  EventEmitter = require('eventemitter3'),
  path = require('path');
/**
 * Abstract plugin class
 *
 * @version 0.1.0
 * @since 0.1.0
 * @author Nightmare
 * @class Plugin
 * @extends {EventEmitter}
 */
class Plugin extends EventEmitter {
  constructor(pm, meta) {
    super();

    this.manager = pm;
    this.CD = pm.CD;
    this.meta = meta;
    if (this.constructor == Plugin) {
      throw new Error('Cannot instantiate an abstract class!');
    }
    this._name = meta.package.name;
    this._commands = [];
    this.log('created');
  }

  get iconURL() {
    if (!this.hash) {
      this.hash =
        this._name.split('').reduce((a, b) => {
          a = (a << 5) - a + b.charCodeAt(0);
          return a & a;
        }, 0) % 4;
    }
    // TODO: have multiple images.
    //switch (this.hash) {}
    return 'data:image/png;base64,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';
  }

  async _preload() {
    this.path = path;
    this._verifyPackage();
    await Promise.resolve(this.preload());
    this.log('preloaded');
  }

  _load() {
    this.load();
    this.log('loaded');
  }

  _verifyPackage() {
    if (
      !this.meta.package.hasOwnProperty('author') ||
      !this.meta.package.hasOwnProperty('version') ||
      !this.meta.package.hasOwnProperty('description')
    ) {
      throw new Error(
        'A plugin must have an author, version, and description.'
      );
    }
  }

  _unload() {
    for (const command of this._commands) {
      this.CD.CommandHandler.unhookCommand(command.name);
    }
    if (this._cssWatcher) this._cssWatcher.close();
    let cssElement = document.getElementById(`CDCSS-${this._name}`);
    if (cssElement) cssElement.parentElement.removeChild(cssElement);

    this.removeAllListeners();

    this.unload();
    this.log('unloaded');
  }
  /**
   * Called when plugin is preloaded.
   * **NOTE:** Discord and Plugins are most likely not loaded here.
   *
   * @since 0.1.0
   * @version 0.1.0
   * @memberof Plugin
   */
  preload() {}

  /**
   * Called when plugin is loaded.
   * All plugins *should* be preloaded at this point.
   *
   * @since 0.1.0
   * @version 0.1.0
   * @memberof Plugin
   */
  load() {}

  /**
   * Called when the plugin is unloaded.
   * All plugins should unload in such a way that lets them be reloaded without issues.
   *
   * @since 0.1.0
   * @version 0.1.0
   * @memberof Plugin
   */
  unload() {}

  /**
   * Called when settings changed
   *
   * @since 0.1.0
   * @version 0.1.0
   * @memberof Plugin
   */
  settingsChanged() {}

  /**
   * Overwrite to customize the color of the plugin
   *
   * @readonly
   * @since 0.1.0
   * @version 0.1.0
   * @memberof Plugin
   */
  get color() {
    return 0x444444;
  }

  getSettingsNode(node, defaultValue) {
    let entry = this.settings;
    let nodes = node.split('.');
    let current = entry;
    let update = false;
    const nl = nodes.length - 1;
    for (let i = 0; i < nl; i++) {
      if (typeof current === 'object') {
        if (!current.hasOwnProperty(nodes[i])) {
          current[nodes[i]] = {};
          update = true;
        }
        current = current[nodes[i]];
      }
    }
    if (!current.hasOwnProperty(nodes[nl])) {
      current[nodes[nl]] = defaultValue;
      update = true;
    }
    if (update) this.settings = entry;

    return current[nodes[nl]];
  }

  setSettingsNode(node, value) {
    let entry = this.settings;
    let nodes = node.split('.');
    let current = entry;
    const nl = nodes.length - 1;
    for (let i = 0; i < nl; i++) {
      if (current[nodes[i]] === undefined || current[nodes[i]] === null) {
        current[nodes[i]] = {};
      } else {
        current = current[nodes[i]];
      }
    }
    current[nodes[nl]] = value;
    this.settings = entry;
  }

  get settings() {
    try {
      let res = JSON.parse(this.CD.localStorage.getItem(`CD-${this._name}`));
      if (res === null) {
        this.settings = {};
        return {};
      } else return res;
    } catch (err) {
      this.settings = {};
      return {};
    }
  }

  get hasSettings() {
    return this.CD.localStorage.getItem(`CD-${this._name}`) !== null;
  }

  set settings(val) {
    this.CD.localStorage.setItem(`CD-${this._name}`, JSON.stringify(val));
    this.settingsChanged();
  }

  log(...args) {
    this.console('log', ...args);
  }
  info(...args) {
    this.console('info', ...args);
  }

  warn(...args) {
    this.console('warn', ...args);
  }
  error(...args) {
    this.console('error', ...args);
  }

  console(action, ...args) {
    console[action](
      `%c[${this._name}]`,
      `color: #${this.color}; font-weight: bold;`,
      ...args
    );
  }

  registerCommand(options) {
    const command = new Command(this, options);
    this.manager.get('commands').hookCommand(command);
  }

  registerSettingsTab(name, component) {
    this.manager.get('settings')._registerSettingsTab(this, name, component);
  }
}

module.exports = Plugin;

const { EventEmitter } = require('eventemitter3'),
  fs = require('fs-extra'),
  path = require('path'),
  reload = require('require-reload'),
  Promise = require('bluebird');

/**
 * DIv4 Plugin Manager
 *
 * @version 0.1.0
 * @since 0.1.0
 * @private
 * @class PluginManager
 * @extends {EventEmitter}
 */
class PluginManager extends EventEmitter {
  constructor(CD) {
    super();
    this.CD = CD;
    this._ready = false;
    this.plugins = {};

    this.pluginsEnabled = {};
    if (CD.localStorage['CD-Plugins'] != '') {
      try {
        this.pluginsEnabled = JSON.parse(CD.localStorage['CD-Plugins']);
      } catch (ex) {}
    }

    this.basePath = this.expand(
      CD.conf.pluginPath || path.join(__dirname, '..', '..', '..', 'plugins')
    );
    fs.ensureDirSync(this.basePath);

    const dependencies = [];
  }

  expand(basePath) {
    const home =
      process.env.HOME ||
      process.env.USERPROFILE ||
      process.env.HOMEDRIVE + process.env.HOMEPATH;
    const appData = process.env.HOME
      ? path.join(process.env.HOME, '.config', 'CustomDiscord')
      : path.join(process.env.APPDATA, 'CustomDiscord');
    const discordPath = path.join(process.resourcesPath, '..', '..');

    fs.ensureDirSync(appData);
    return basePath
      .replace(/\\/g, '/')
      .replace(/^\.\//, path.join(__dirname, '..', '..', '..') + '/')
      .replace(/^~\//, home + '/')
      .replace(/^%\//, appData)
      .replace(/^\&\//, discordPath);
  }

  loadPluginPath() {
    //look through plugin directory
    return (
      Promise.resolve(fs.readdir(this.basePath))
        // prefix base path
        .map(f => path.join(this.basePath, f))
        // filter out non-directories
        .filter(f => fs.statSync(f).isDirectory())
        // filter out non node modules
        .filter(f => fs.existsSync(path.join(f, 'package.json')))
        // filter out non plugins
        .filter(
          f =>
            typeof require(path.join(f, 'package.json')).customdiscord ===
            typeof {}
        )
        // load plugins
        .each(m => {
          return this.load(m, false);
        })
        .then(() => this.emit('plugins-preloaded', Object.keys(this.plugins)))
    );
  }

  async loadByPath(pluginPath, force = true) {
    const pkg = reload(path.join(pluginPath, 'package.json'));
    if (!force && this.pluginsEnabled[pkg.name] === false) {
      // don't load disabled plugins unless forced
      return;
    }

    if (this.plugins[pkg.name] && this.plugins[pkg.name].loaded) {
      // no need to reload an already loaded plugin
      return;
    }

    if (this.plugins[pkg.name] && this.plugins[pkg.name].loading) {
      throw new Error(`CIRCULAR DEPENDENCY FOUND. ${pkg.name}, ABORTING!`);
    }

    const p = (this.plugins[pkg.name] = {
      path: pluginPath,
      package: pkg,
      loaded: false,
      loading: true,
      cls: null,
      inst: null
    });

    // check for dependencies
    if (pkg.customdiscord && Array.isArray(pkg.customdiscord.dependencies)) {
      await Promise.each(pkg.customdiscord.dependencies, dep => this.load(dep));
    }

    // load the plugin
    p.cls = reload(path.join(pluginPath, pkg.main || 'index'));
    p.inst = new p.cls(this, p);
    p.loaded = true;
    p.loading = false;

    await p.inst._preload();

    if (this._ready) {
      p.inst._load();
      this.emit('load', pkg.name);
    }
  }

  async load(plugin, force = true) {
    const pluginPath = path.resolve(this.basePath, plugin);
    if (!fs.existsSync(path.join(pluginPath, 'package.json'))) {
      throw new Error('plugin not found.', plugin);
    }

    return this.loadByPath(pluginPath, force);
  }

  async unload(name) {
    if (!this.plugins[name] || !this.plugins[name].loaded) {
      return true;
    }

    if (this._ready) {
      this.emit('unload', name);
    }

    const p = this.plugins[name];
    //unload
    await Promise.resolve(p.inst._unload());
    p.inst = null;
    p.loaded = false;
    return true;
  }

  async reload(name, recursive = false) {
    if (!this.plugins[name]) {
      return this.load(name, true);
    }

    const p = this.plugins[name];
    if (recursive && p.package.customdiscord) {
      await Promise.each(p.package.customdiscord.dependencies, dep =>
        this.reload(dep, recursive)
      );
    }

    await this.unload(name);
    return await this.load(name);
  }

  async enable(name, load = false) {
    const pluginPath = path.resolve(this.basePath, plugin);
    if (!fs.existsSync(path.join(pluginPath, 'package.json'))) {
      throw new Error('plugin not found.', plugin);
    }

    this.pluginsEnabled[name] = true;
    if (load) {
      return this.loa(name);
    }

    return true;
  }

  async disable(name, unload = false) {
    const pluginPath = path.resolve(this.basePath, plugin);
    if (!fs.existsSync(path.join(pluginPath, 'package.json'))) {
      throw new Error('Plugin not found', plugin);
    }

    this.pluginsEnabled[name] = false;
    if (unload) {
      return this.unload(name);
    }

    return true;
  }

  ready() {
    if (this._ready) return;

    this._ready = true;
    return Promise.each(
      Object.keys(this.plugins).map(n => this.plugins[n]),
      p => {
        if (p.loaded && p.inst) {
          p.inst._load();
        }
      }
    ).then(() => this.emit('plugins-loaded', Object.keys(this.plugins)));
  }

  get(name, raw = false) {
    if (!this.plugins || !this.plugins[name] || !this.plugins[name].loaded) {
      return null;
    }

    return raw ? this.plugins[name] : this.plugins[name].inst;
  }
}

module.exports = PluginManager;

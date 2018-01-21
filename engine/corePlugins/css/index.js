const Plugin = module.parent.require('../components/plugin'),
  postcss = require('postcss'),
  postcssImport = require('postcss-import'),
  fs = require('fs-extra'),
  path = require('path'),
  Watcher = module.parent.require('../watcher');

class css extends Plugin {
  preload() {
    this.postcss = postcss([postcssImport]);
    this.watcher = new Watcher();
    this.watcher.on('change', (fileName, identifier) =>
      this.onFileChange(identifier, fileName)
    );

    this.cssStack = {};
    this.manager.on('plugins-preloaded', plugins => {
      plugins.map(plugin => this.manager.get(plugin, true)).forEach(plugin => {
        const name = plugin.package.name;
        const css = plugin.package.customdiscord
          ? plugin.package.customdiscord.css
          : [] || [];
        if (!css.length) {
          return this.log(name, 'did not specify any css files, skipping');
        } else {
          this.cssStack[name] = {
            path: plugin.path,
            files: css
          };
          return this.log(
            name,
            'requested',
            css.length,
            'css files to be attached'
          );
        }
      });
    });

    this.manager.on('load', plugin =>
      this.loadPluginCss(this.manager.get(plugin, true))
    );
    this.manager.on('unload', plugin =>
      this.unloadPluginCss(this.manager.get(plugin, true))
    );
  }

  load() {
    Object.keys(this.cssStack).forEach(plugin => {
      this.cssStack[plugin].files.forEach(async fileName => {
        const filePath = path.resolve(this.cssStack[plugin].path, fileName);
        let content = await fs.readFile(filePath, 'utf-8');
        content = await this.postcss.process(content, {
          from: filePath,
          to: filePath,
          map: { annotation: false, inline: false, safe: false }
        });
        this.log(`attaching [${plugin}:${fileName}]`);
        document.head.appendChild(this._createStyle(content, plugin, fileName));
      });
    });

    this.getSettingsNode('stylesheets', []).forEach(async fileName => {
      const filePath = path.resolve(
        this.manager.expand(this.CD.conf.cssPath || './CSS'),
        fileName
      );
      let content = await fs.readFile(filePath, 'utf-8');
      content = await this.postcss.process(content, {
        from: filePath,
        to: filePath,
        map: { annotation: false, inline: false, safe: false }
      });
      this.log(`attaching userstyle [${fileName}]`);
      document.head.appendChild(
        this._createStyle(content, '$userstyle$', fileName)
      );
      this.watcher.addFile(filePath, fileName);
    });
  }

  unload() {}

  _createStyle(content, plugin, filename) {
    const style = document.createElement('style');
    style.dataset.plugin = plugin;
    style.dataset.filename = filename;
    style.appendChild(document.createTextNode(content));
    return style;
  }

  loadPluginCss(plugin) {
    const name = plugin.package.name;
    const css = plugin.package.customdiscord.css || [];
    if (!css.length) {
      return this.log(name, 'did not specify any css files, skipping');
    } else {
      css.forEach(async fileName => {
        const filePath = path.resolve(plugin.path, fileName);
        let content = await fs.readFile(filePath, 'utf-8');
        content = await this.postcss.process(content, {
          from: filePath,
          to: filePath,
          map: { annotation: false, inline: false, safe: false }
        });
        this.log(`attaching [${plugin.package.name}:${fileName}]`);
        document.head.appendChild(
          this._createStyle(content, plugin.package.name, fileName)
        );
      });
    }
  }

  unloadPluginCss(plugin) {
    Array.from(
      document.querySelectorAll(`style[data-plugin="${plugin.package.name}"]`)
    ).forEach(tag => tag.parentElement.removeChild(tag));
  }

  async onFileChange(fileName, filePath) {
    let content = await fs.readFile(filePath, 'utf-8');
    content = await this.postcss.process(content, {
      from: filePath,
      to: filePath,
      map: { annotation: false, inline: false, safe: false }
    });

    this.log(`attaching userstyle [${fileName}]`);
    const el = document.head.querySelector(
      `style[data-plugin="$userstyle$"][data-filename="${fileName}"]`
    );
    if (!el) {
      // what, weird, add it again anyway.
      document.head.appendChild(
        this._createStyle(content, '$userstyle$', fileName)
      );
    } else {
      while (el.firstChild) el.removeChild(el.firstChild);
      el.appendChild(document.createTextNode(content));
    }
  }
}

module.exports = css;

const path = require('path'),
  Module = require('module'),
  fs = require('fs'),
  electron = require('electron');

const conf = fs.existsSync(path.join(__dirname, 'config.json'))
  ? require(path.join(__dirname, 'config.json'))
  : {};

const enginePath = path.join(__dirname, 'engine');

Object.assign(exports, {
  inject(appPath) {
    const basePath = path.join(appPath, '..', 'app.asar');

    // fetch discord package.json
    const pkg = require(path.join(basePath, 'package.json'));

    // adjust electron root
    electron.app.getAppPath = () => basePath;

    // files to patch
    const patches = {
      splash: false,
      mainWindow: false
    };

    // overwrite (and restore) the .js compiler
    const oldLoader = Module._extensions['.js'];
    Module._extensions['.js'] = (mod, filename) => {
      let content = fs.readFileSync(filename, 'utf8');
      const fname = filename.toLowerCase();

      // TODO: Better patcher system

      // splash screen
      if (
        fname.endsWith('splashwindow.js') ||
        fname.endsWith(`app_bootstrap${path.sep}splashscreen.js`)
      ) {
        patches.splash = true;

        content = content
          //alias old var
          .replace(
            'this._window = new _electron.BrowserWindow(windowConfig);',
            'const splashWindow = this._window = new _electron.BrowserWindow(windowConfig);'
          )
          //and patch
          .replace(
            'new _electron.BrowserWindow(windowConfig);',
            `new _electron.BrowserWindow(Object.assign(windowConfig, {webPreferences: { preload: "${path
              .join(enginePath, 'preload', 'splash.js')
              .replace(/\\/g, '/')}" } }));`
          );

        // Main Window
      } else if (
        fname.endsWith(`app${path.sep}mainscreen.js`) ||
        fname.endsWith(`app.asar${path.sep}index.js`)
      ) {
        patches.mainWindow = true;
        content = content
          // preload customdiscord
          .replace(
            'webPreferences: {',
            `webPreferences: { preload: "${path
              .join(enginePath, 'preload', 'main.js')
              .replace(/\\/g, '/')}",`
          )

          //transparency!
          .replace('transparent: false', `transparent: ${conf.transparent}`);
        if (conf.transparent) {
          content = content.replace('backgroundColor: ACCOUNT_GREY,', '');
        }

        if (typeof conf.frame === typeof true) {
          // native frame
          content = content
            .replace('frame: false,', `frame: ${conf.frame},`)
            .replace(
              'mainWindowOptions.frame = true;',
              `mainWindowOptions.frame = ${conf.frame};`
            );
        }
      }
      // Check if all patches have finished and reset to the old loader.
      if (Object.values(patches).every(p => p)) {
        Module._extensions['.js'] = oldLoader;
      }

      return mod._compile(content, filename);
    };

    // Execute discords main file.
    Module._load(path.join(basePath, pkg.main), null, true);
  }
});

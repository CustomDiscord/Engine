const Plugin = module.parent.require('../components/plugin');

/**
 * React plugin created by Kura for DIv4
 * It works here with possibly some modification because the plugin systems are mostly the same if not exactly.
 *
 * @private
 * @author Kura
 * @class react
 * @extends {Plugin}
 */
class react extends Plugin {
  webPackLoad(fn, name = Math.random().toString()) {
    if (!window.webpackJsonp) {
      //if webpack isn't loaded yet, reschedule.
      setTimeout(this.webPackLoad.bind(this), 100, fn, name);
    } else {
      return setTimeout(window.webpackJsonp, 100, [name], { [name]: fn }, [
        name
      ]);
    }
  }

  registerReact() {
    return new Promise(rs =>
      this.webPackLoad((m, e, r) => {
        let reactExtracted = !!window.react;
        let reactDOMExtracted = !!window.ReactDOM;

        //search for react
        for (const key in r.c) {
          let mod = r.c[key];
          if (
            mod.exports.hasOwnProperty('PureComponent') &&
            mod.exports.hasOwnProperty('createElement')
          ) {
            this.React = mod.exports;
            reactExtracted = true;
          } else if (
            mod.exports.hasOwnProperty('render') &&
            mod.exports.hasOwnProperty('findDOMNode')
          ) {
            this.ReactDOM = mod.exports;
            reactDOMExtracted = true;
          }

          // no need to chec other components if we got react and reactdom already.
          if (reactExtracted && reactDOMExtracted) break;
        }
        window.React = this.React;
        window.ReactDOM = this.ReactDOM;
        rs(reactExtracted && reactDOMExtracted);
      })
    );
  }

  async preload() {
    window.CD = this.CD;
    this.observer = new MutationObserver(mutation => this.onMutate(mutation));
    let reactRegistered = await this.registerReact();
    while (!reactRegistered) reactRegistered = await this.registerReact();
  }

  load() {
    // start with cleanup
    this.observer.disconnect();
    this.observer.observe(document.getElementById('app-mount'), {
      childList: true,
      subtree: true
    });
    this.observer.observe(document.querySelector('html'), {
      attributes: true
    });
  }

  getReactInstance(node) {
    return node[
      Object.keys(node).find(key => key.startsWith('__reactInternalInstance'))
    ];
  }

  createElement(text) {
    return document.createRange().createContextualFragment(text);
  }

  createModal(content) {
    const root = document.querySelector('#app-mount>div');
    if (this._modal) this.destroyModal();
    this._modal = this.createElement(`
    <div class='theme-dark CD-modal'>
      <div class='callout-backdrop'></div>
      <div class='modal-2LIEKY' style='opacity: 1'>
        <div class='inner-1_1f7b CD-modal-inner expanded'>
          <div class='modal-3HOjGZ sizeMedium-1-2BNS'>
            ${content}
          </div>
        </div>
      </div>
    </div> `);

    this._modal
      .querySelector('.CD-modal-inner')
      .addEventListener('click', e => e.stopPropagation());

    let close = this._modal.querySelector('.CD-modal-close-button');
    if (close) close.addEventListener('click', this.destroyModal.bind(this));

    if (!this._hasSetKeyListener) {
      document.body.addEventListener('keyup', this._modalKeypress.bind(this));
      document.body.addEventListener('click', this.destroyModal.bind(this));
      this._hasSetKeyListener = true;
    }

    root.appendChild(this._modal);

    this._modal = root.querySelector('.CD-modal');
    const backdrop = this._modal.querySelector('.callout-backdrop');
    setTimeout(() => (backdrop.style.opacity = 0.6), 1);
  }

  _modalKeypress(e) {
    if (e.code === 'Escape') this.destroyModal();
  }

  destroyModal() {
    if (this._modal) {
      let backdrop = this._modal.querySelector('.callout-backdrop');
      let inner = this._modal.querySelector('.CD-modal-inner');
      let close = this._modal.querySelector('.CD-modal-close-button');
      backdrop.style.opacity = 0;
      inner.classList.remove('expanded');
      setTimeout(() => {
        if (close)
          close.addEventListener('click', this.destroyModal.bind(this));
        document.body.removeEventListener(
          'keyup',
          this._modalKeypress.bind(this)
        );
        document.body.removeEventListener(
          'click',
          this.destroyModal.bind(this)
        );
        this._modal.parentNode.removeChild(this._modal);
        this._modal = null;
      }, 200);
    }
  }

  get settingsTabs() {
    return {
      'User Settings': 'userSettings',
      'My Account': 'userAccount',
      'Privacy & Safety': 'privacySettings',
      'Authorized Apps': 'authorizedApps',
      Connections: 'connections',
      'Discord Nitro': 'nitro',
      'App Settings': 'appSettings',
      Voice: 'voiceSettings',
      Overlay: 'overlaySettings',
      Notifications: 'notificationSettings',
      Keybindings: 'keybindingSettings',
      Games: 'gameSettings',
      'Text & Images': 'messageSettings',
      Appearance: 'appearanceSettings',
      'Streamer Mode': 'streamerSettings',
      Language: 'languageSettings',
      'Change Log': 'changelog',
      'Log Out': 'logout'
    };
  }

  onMutate(muts) {
    this.emit('mutation'.muts);

    //change of language
    if (
      muts.length === 1 &&
      muts[0].type === 'attributes' &&
      muts[0].attributeName === 'lang'
    ) {
      return this.emit('languageChange', muts[0].target.attributes.lang.value);
    }

    muts.forEach(mut => {
      if (mut.addedNodes.length + mut.removedNodes.length === 0) {
        return;
      }

      const changed = (mut.addedNodes.length
        ? mut.addedNodes
        : mut.removedNodes)[0];
      const added = mut.addedNodes.length > 0;

      // Settings
      if (
        changed.classList &&
        (changed.classList.contains('layer') ||
          changed.classList.contains('layer-kosS71'))
      ) {
        const programSettings = !!changed.querySelector(
          '[class*="socialLinks"]'
        );
        if (programSettings && changed.childNodes.length > 0) {
          const child = changed.childNodes[0];
          if (child.className === 'ui.standard-sidebar-view') {
            if (added) {
              this.emit('settingsOpened', mut);
            } else {
              this.emit('settingsClosed', mut);
            }
          }
        }
      } else if (
        added &&
        changed.parentNode &&
        changed.parentNode.className === 'content-column default'
      ) {
        //TODO: MULTILINGUAL!
        const element = document.querySelector(
          '[class*="layer"] .sidebar .selected-eNoxEK'
        );
        this.emit(
          'settingsTab',
          this.settingsTabs[element.innerText] || 'unknown',
          mut
        );
      } else if (changed.classList && changed.classList.contains('chat')) {
        //Chat
        if (added) {
          this.emit('chatOpened', mut);
        } else {
          this.emit('chatClosed', mut);
        }
      } else if (
        changed.classList &&
        changed.classList.contains('channelTextArea-1HTP3C') &&
        added
      ) {
        this.emit('channelChanged', mut);
      } else if (changed.id === 'friends') {
        // Friends list
        if (added) {
          this.emit('friendsListOpened', mut);
        } else {
          this.emit('friendsListClosed', mut);
        }
      } else {
        // This did something different then i expected.. dunno what i expected but it wasn't a flood of elements
        //this.log(changed);
      }
    });
  }
}

module.exports = react;

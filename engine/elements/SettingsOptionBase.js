const Plugin = require('../lib/components/plugin');

class SettingsOptionBase extends window.React.Component {
  constructor(props) {
    super(props);
    if (!props.hasOwnProperty('plugin') || !(props.plugin instanceof Plugin)) {
      throw new Error('Settings Components must have a valid plugin property!');
    }
  }

  get plugin() {
    return this.props.plugin;
  }

  getProp() {
    return this.plugin.getSettingsNode(
      this.props.lsNode,
      this.props.defaultValue
    );
  }

  setProp(newVal) {
    const result = this.plugin.setSettingsNode(this.props.lsNode, newVal);
    if (typeof this.props.onSave === 'function') this.props.onSave();
    return result;
  }
}

module.exports = SettingsOptionBase;

class SettingsGeneral extends window.React.Component {
  render() {
    const {
      SettingsDivider,
      SettingsOptionTextbox,
      SettingsOptionFilebox,
      SettingsExpandableSection,
      SettingsOptionDescription,
      SettingsOptionToggle
    } = require('../../elements');

    return window.React.createElement(
      'div',
      {},
      window.React.createElement(SettingsOptionTextbox, {
        title: 'Custom Prefix',
        description: "This is the prefix you'll use for custom commands.",
        plugin: this.props.plugin,
        lsNode: 'commandPrefix',
        defaultValue: '//',
        reset: true
      })
    );
  }
}

module.exports = SettingsGeneral;

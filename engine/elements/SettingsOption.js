const e = window.React.createElement;

class SettingsOption extends window.React.Component {
  render() {
    return e(
      'div',
      { className: 'cd-settings-option' },
      `Option: ${this.props.title}`
    );
  }
}

module.exports = SettingsOption;

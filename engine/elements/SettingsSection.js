const e = window.React.createElement;

const { SettingsTitle, SettingsDescription } = require('./index');

class SettingsSection extends window.React.Component {
  render() {
    let comps = [];
    if (this.props.title) e(SettingsTitle, { text: this.props.title });
    if (this.props.description)
      comps.push(e(SettingsDescription, { text: this.props.description }));
    if (this.props.elements && Array.isArray(this.props.elements))
      comps.push(...this.props.elements);
    else if (this.props.element) comps.push(this.props.element);
    else if (this.props.Component) comps.push(e(this.props.component));
    return e(
      'div',
      { className: 'ui-form-item' },
      e(SettingsTitle, { text: this.props.text }),
      ...comps
    );
  }
}

module.exports = SettingsSection;

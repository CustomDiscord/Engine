const e = window.React.createElement;

const Base = require('./SettingsOptionBase');

const SettingsOptionTitle = require('./SettingsOptionTitle');
const SettingsOptionDescription = require('./SettingsOptionDescription');
const SettingsOptionButton = require('./SettingsOptionButton');

class SettingsOptionTextbox extends Base {
  constructor(props) {
    super(props);

    this.state = { value: this.getProp() };
  }

  render() {
    let titles = [
      e(
        'div',
        {
          className:
            'flex-lFgbSz flex-3B1Tl4 horizontal-2BEEBe horizontal-2VE-Fw flex-3B1Tl4 directionRow-yNbSvJ justifyStart-2yIZo0 alignStretch-1hwxMa noWrap-v6g9vO',
          style: {
            flex: '1 1 auto'
          }
        },
        e(SettingsOptionTitle, { text: this.props.title })
      )
    ];
    if (this.props.description)
      titles.push(
        e(SettingsOptionDescription, { text: this.props.description })
      );

    return e(
      'div',
      {},
      e(
        'div',
        {
          className:
            'flex-lFgbSz flex-3B1Tl4 vertical-3X17r5 flex-3B1Tl4 directionColumn-2h-LPR justifyStart-2yIZo0 alignStretch-1hwxMa noWrap-v6g9vO switchItem-1uofoz',
          style: {
            flex: '1 1 auto'
          }
        },
        ...titles
      ),
      e(
        'div',
        {
          className:
            'flex-lFgbSz flex-3B1Tl4 horizontal-2BEEBe horizontal-2VE-Fw flex-3B1Tl4 directionRow-yNbSvJ justifyStart-2yIZo0 alignStretch-1hwxMa noWrap-v6g9vO margin-bottom-20'
        },
        e('input', {
          className:
            'inputDefault-Y_U37D input-2YozMi size16-3IvaX_ flexChild-1KGW5q',
          type: this.props.type
            ? this.props.type
            : this.props.password ? 'password' : 'text',
          placeholder:
            this.props.defaultValue || this.props.placeholder || undefined,
          name: this.props.name || undefined,
          maxlength: this.props.maxlength || undefined,
          value: this.state.value,
          onChange: this.change.bind(this),
          style: {
            flex: '1 1 auto',
            display: 'inline-block'
          }
        }),
        this.props.apply
          ? e(SettingsOptionButton, {
              outline: false,
              text: 'Apply',
              onClick: this.apply.bind(this)
            })
          : undefined,
        this.props.reset
          ? e(SettingsOptionButton, {
              outline: true,
              text: 'Reset',
              onClick: this.reset.bind(this)
            })
          : undefined
      )
    );
  }

  apply(event) {
    let value = this.state.value || this.props.defaultValue;
    this.setProp(value);

    if (this.props.onApply) this.props.onApply(event);
  }

  change(event) {
    this.setState({ value: event.target.value });
    if (!this.props.apply)
      this.setProp(event.target.value || this.props.defaultValue);
  }

  reset(event) {
    this.setState({ value: '' });
    this.apply(event);
  }
}

module.exports = SettingsOptionTextbox;

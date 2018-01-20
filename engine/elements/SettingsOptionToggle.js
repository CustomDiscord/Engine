const e = window.React.createElement;

const Base = require('./SettingsOptionBase');

class SettingsOptionToggle extends Base {
  constructor(props) {
    super(props);

    this.state = {
      checked: this.getProp()
    };
  }

  click() {
    this.setProp(!this.getProp());
    this.setState(() => ({
      checked: this.getProp()
    }));
  }

  render() {
    return e(
      'div',
      {
        className:
          'flex-lFgbSz flex-3B1Tl4 vertical-3X17r5 flex-3B1Tl4 directionColumn-2h-LPR justifyStart-2yIZo0 alignStretch-1hwxMa noWrap-v6g9vO margin-top-20 margin-bottom-20',
        style: {
          flex: '1 1 auto'
        }
      },
      e(
        'div',
        {
          className:
            'flex-lFgbSz flex-3B1Tl4 horizontal-2BEEBe horizontal-2VE-Fw flex-3B1Tl4 directionRow-yNbSvJ justifyStart-2yIZo0 alignStart-pnSyE6 noWrap-v6g9vO',
          style: {
            flex: '1 1 auto'
          }
        },
        e(
          'h3',
          {
            className:
              'h3-gDcP8B title-1pmpPr size16-3IvaX_ height24-2pMcnc weightMedium-13x9Y8 defaultColor-v22dK1 title-3i-5G_ marginReset-3hwONl flexChild-1KGW5q',
            style: {
              flex: '1 1 auto'
            }
          },
          `${this.props.title}`
        ),
        e(
          'div',
          {
            className:
              'flexChild-1KGW5q switchEnabled-3CPlLV switch-3lyafC value-kmHGfs sizeDefault-rZbSBU size-yI1KRe themeDefault-3M0dJU ' +
              (this.state.checked
                ? 'valueChecked-3Bzkbm'
                : 'valueUnchecked-XR6AOk'),
            onClick: this.click.bind(this),
            style: {
              flex: '0 0 auto'
            }
          },
          e('input', {
            type: 'checkbox',
            className: `checkbox-1KYsPm checkboxEnabled-4QfryV checkbox-1KYsPm`,
            value: this.state.checked ? 'on' : 'off'
          }),
          e('div', {
            className: `switch-3lyafC ${
              this.state.checked ? 'checked-7qfgSb' : ''
            }`
          })
        )
      )
    );
  }
}

module.exports = SettingsOptionToggle;

const e = window.React.createElement;

const { dialog } = require('electron').remote;

const Base = require('./SettingsOptionBase');

const SettingsOptionTitle = require('./SettingsOptionTitle');
const SettingsOptionDescription = require('./SettingsOptionDescription');
const SettingsOptionButton = require('./SettingsOptionButton');

class SettingsOptionFilebox extends Base {
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

    let icon =
      this.props.buttonIcon ||
      'data:image/png;base64,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';

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
        e(
          'div',
          {
            className: 'ui-key-recorder ui-input-button default has-value',
            style: {
              width: '90%'
            }
          },
          e(
            'div',
            {
              className:
                'flex-lFgbSz flex-3B1Tl4 horizontal-2BEEBe horizontal-2VE-Fw flex-3B1Tl4 directionRow-yNbSvJ justifyStart-2yIZo0 alignStretch-1hwxMa noWrap-v6g9vO layout',
              style: {
                flex: '1 1 auto',
                background: 'none'
              }
            },
            e('input', {
              className:
                'inputDefault-Y_U37D input-2YozMi size16-3IvaX_ flexChild-1KGW5q',
              type: this.props.password ? 'password' : 'text',
              placeholder:
                this.props.defaultValue || this.props.placeholder || undefined,
              name: this.props.name || undefined,
              maxlength: this.props.maxlength || undefined,
              value: this.state.value,
              onChange: this.change.bind(this),
              style: {
                flex: '1 1 auto',
                background: 'none',
                border: 'none'
              }
            }),
            e(
              'div',
              {
                className:
                  'flex-lFgbSz flex-3B1Tl4 horizontal-2BEEBe horizontal-2VE-Fw flex-3B1Tl4 directionRow-yNbSvJ justifyStart-2yIZo0 alignStretch-1hwxMa noWrap-v6g9vO',
                style: {
                  flex: '0 1 auto',
                  margin: '0px'
                }
              },
              e(
                'button',
                {
                  type: 'button',
                  className:
                    'buttonGreyGhostDefault-2h5dqi buttonGhostDefault-2NFSwJ buttonDefault-2OLW-v button-2t3of8 buttonGhost-2Y7zWJ buttonGreyGhost-SfY7zU minGrow-1W9N45 min-K7DTfI ui-input-button-ui-button key-recorder-button',
                  onClick: this.fileSelector.bind(this)
                },
                e(
                  'div',
                  {
                    className:
                      'contentsDefault-nt2Ym5 contents-4L4hQM contentsGhost-2Yp1r8'
                  },
                  e(
                    'span',
                    {
                      className: 'key-recorder-button-text'
                    },
                    this.props.buttonName || 'Choose a file...'
                  ),
                  e('span', {
                    className: 'key-recorder-edit-icon',
                    style: {
                      backgroundImage: 'url(' + icon + ')'
                    }
                  })
                )
              )
            )
          )
        ),
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

  static get fileDialogDefaults() {
    return {
      title: 'Select a file',
      filters: [{ name: 'All Files', extentions: ['*'] }],
      properties: ['openFile'],
      required: false
    };
  }

  fileSelector() {
    let defaultDialogOptions = Object.assign(
      {},
      this.fileDialogDefaults,
      this.props.dialog
    );
    dialog.showOpenDialog(defaultDialogOptions, filePath => {
      if (!filePath || !filePath.length) {
        if (this.props.dialog.required) {
          dialog.showMessageBox({
            type: 'warning',
            message: 'You need to select a file.'
          });
          this.fileSelector();
        }
        return;
      }
      this.setState({ value: filePath[0], values: filePath });
    });
  }
}

module.exports = SettingsOptionFilebox;

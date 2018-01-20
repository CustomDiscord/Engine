const e = window.React.createElement;

class SettingsOptionDescription extends window.React.Component {
  render() {
    let extra = this.props.extra || [];
    return e(
      'div',
      {
        className:
          'description-3MVziF formText-1L-zZB note-UEZmbY marginTop4-2rEBfJ modeDefault-389VjU primary-2giqSn marginBottom20-2Ifj-2'
      },
      this.props.text,
      ...extra
    );
  }
}

module.exports = SettingsOptionDescription;

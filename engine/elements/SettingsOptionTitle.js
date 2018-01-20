const e = window.React.createElement;

class SettingsOptionTitle extends window.React.Component {
  render() {
    return e(
      'h3',
      {
        className:
          'h3-gDcP8B title-1pmpPr marginReset-3hwONl size16-3IvaX_ height24-2pMcnc weightMedium-13x9Y8 defaultColor-v22dK1 title-3i-5G_ marginReset-3hwONl flexChild-1KGW5q',
        style: {
          flex: '1 1 auto'
        }
      },
      this.props.text
    );
  }
}

module.exports = SettingsOptionTitle;

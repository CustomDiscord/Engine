const e = window.React.createElement;

class SettingsButtonConnection extends window.React.Component {
  get wrapperClass() {
    return 'wrapper-11sL4k accountBtn-yEZXoY'
  }
  get accountButtonClass() {
    return 'inner-21BDhs accountBtnInner-3zsU2z'
  }
  get connectionClass() {
    return 'connectionDelete-1E0cwj flexCenter-28Hs0n flex-3B1Tl4 justifyCenter-29N31w alignCenter-3VxkQP'
  }


  render() {
    if (!!this.props.delete) {
      return e(
        'button',
        {
          className: this.connectionClass + ' ' + this.props.className,
          type: 'button',
          onClick: this.props.onClick,
          style: {
            flex: '0 1 auto',
            backgroundImage: this.props.icon || '/assets/5be6cc17e596c02e7506f2776cfb1622.png'
          }
        }
      )
    }
    return e(
      'div',
      {
        className: this.wrapperClass + ' ' + this.props.className
      },
      e(
        'button',
        {
          className: this.accountButtonClass +  ' ' + this.props.classNameButton,
          type: 'button',
          onClick: this.props.onClick,
          style: {
            flex: '0 1 auto',
            backgroundImage: this.props.icon || '/assets/5be6cc17e596c02e7506f2776cfb1622.png'
          }
        }
      )
    )
  }
}

module.exports = SettingsButtonConnection;

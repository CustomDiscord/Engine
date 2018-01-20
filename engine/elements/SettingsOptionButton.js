const e = window.React.createElement;

class SettingsButton extends window.React.Component {
  get brandClass() {
    return 'flexChild-1KGW5q buttonBrandFilledDefault-2Rs6u5 buttonFilledDefault-AELjWf buttonDefault-2OLW-v button-2t3of8 buttonFilled-29g7b5 buttonBrandFilled-3Mv0Ra';
  }

  get outlineClass() {
    return 'flexChild-1KGW5q buttonRedOutlinedDefault-1VCgwL buttonOutlinedDefault-3FNQnZ buttonDefault-2OLW-v button-2t3of8 buttonOutlined-38aLSW buttonRedOutlined-2t9fm_';
  }

  get brandContentsClass() {
    return 'contentsDefault-nt2Ym5 contents-4L4hQM contentsFilled-3M8HCx contents-4L4hQM';
  }

  get outlineContentsClass() {
    return 'contentsDefault-nt2Ym5 contents-4L4hQM contentsOutlined-mJF6nQ contents-4L4hQM';
  }

  render() {
    return e(
      'button',
      {
        className: this.props.outline ? this.outlineClass : this.brandClass,
        type: 'button',
        onClick: this.props.onClick,
        style: {
          flex: '0 1 auto'
        }
      },
      e(
        'div',
        {
          className: this.props.outline
            ? this.outlineContentsClass
            : this.brandContentsClass
        },
        this.props.text
      )
    );
  }
}

module.exports = SettingsButton;

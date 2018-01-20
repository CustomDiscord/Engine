const e = window.React.createElement;

class SettingsTabs extends React.PureComponent {
  constructor() {
    super();
    this.props = this.props || {};
    this.state = {
      activeIndex: this.props.activeIndex || 0
    };
  }

  render() {
    const tabNodes = this.props.children.map((child, index) => {
      return e(
        'li',
        {
          onClick: () => this._handleClick(index),
          className: this.state.activeIndex === index ? 'active' : ''
        },
        child.props.display
      );
    });

    const contentNodes = e(
      'div',
      { className: 'cd-tabs-area' },
      this.props.children[this.state.activeIndex]
    );

    return e(
      'div',
      { className: 'cd-tabs' },
      e(
        'ul',
        {
          className:
            'item-2zi_5J marginBottom8-1mABJ4 horizontal-2VE-Fw flex-3B1Tl4 directionRow-yNbSvJ cardPrimaryEditable-2IQ7-V card-3DrRmC di-tabs-tab'
        },
        tabNodes
      ),
      e('section', {}, contentNodes)
    );
  }

  _handleClick(index) {
    this.setState({
      activeIndex: index
    });
  }
}

module.exports = SettingsTabs;

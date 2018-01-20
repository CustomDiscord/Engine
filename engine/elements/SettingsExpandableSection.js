const e = window.React.createElement;

const SettingsDivider = require('./SettingsDivider');

const titleDivClass =
  'flex-lFgbSz flex-3B1Tl4 horizontal-2BEEBe horizontal-2VE-Fw flex-3B1Tl4 directionRow-yNbSvJ justifyStart-2yIZo0 alignCenter-3VxkQP noWrap-v6g9vO header-qR6-lU foldableHeaderExpanded-3g_WYd';

function generateInnerSection(props) {
  let output = [];
  if (props.state.expanded) {
    if (props.props.components) {
      for (const comp of props.props.components)
        if (window.React.isValidElement(comp)) output.push(comp);
        else output.push(e(comp.component, comp));
    }
  }
  return output;
}

class SettingsExpandableSection extends window.React.Component {
  constructor(props) {
    super(props);

    this.state = { hover: false, expanded: false };
  }
  get h2Class() {
    let output =
      'h2-2ar_1B title-1pmpPr size16-3IvaX_ height20-165WbF weightSemiBold-T8sxWH defaultColor-v22dK1 title-16MQon flexChild-1KGW5q';
    if (this.state.hover) output += ' titleHovered-1YMLyx';
    else output += ' titleNormal-3eHHbm';
    return output;
  }

  get iconClass() {
    let output = 'expandIconBG-Li1qfl flexChild-1KGW5q';
    if (this.state.hover) output += ' expandIconBGHovered-2C1DhE';
    else output += ' expandIconBGNormal-2Ve5cT';
    return output;
  }

  mouseOver() {
    this.setState(() => ({
      hover: true
    }));
  }
  mouseOut() {
    this.setState(() => ({
      hover: false
    }));
  }

  click() {
    this.setState(prev => ({
      expanded: !prev.expanded
    }));
  }

  render() {
    return e(
      'div',
      {
        className:
          'ui-form-item sound-list expandableSection-1QgO0O user-settings-notifications'
      },
      e(
        'div',
        {},
        e(
          'div',
          {
            className: titleDivClass,
            style: {
              flex: '1 1 auto'
            },
            onClick: this.click.bind(this),
            onMouseOver: this.mouseOver.bind(this),
            onMouseOut: this.mouseOut.bind(this)
          },
          e(
            'h2',
            {
              className: this.h2Class,
              style: {
                flex: '1 1 auto'
              }
            },
            `${this.props.title}`
          ),
          e(
            'div',
            {
              className: this.iconClass,
              style: {
                flex: '0 1 auto'
              }
            },
            e(
              'svg',
              {
                className: `expandIcon-1EANE_ transition-2ebS5- ${
                  this.state.expanded ? '' : 'closed-2Hef-I'
                }`,
                width: '24',
                height: '24',
                viewBox: '0 0 24 24'
              },
              e('path', {
                className: 'expandIconForeground-3XL8Rh',
                fill: 'none',
                stroke: 'currentColor',
                'stroke-width': '2',
                'stroke-linecap': 'round',
                'stroke-linejoin': 'round',
                d: 'M7 10L12 15 17 10'
              })
            )
          )
        ),
        ...generateInnerSection(this)
      ),
      e(SettingsDivider)
    );
  }
}

module.exports = SettingsExpandableSection;

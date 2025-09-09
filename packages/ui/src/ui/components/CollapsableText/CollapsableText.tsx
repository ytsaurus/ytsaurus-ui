import React from 'react';
import cn from 'bem-cn-lite';
import Button from '../Button/Button';

import Yson from '../Yson/Yson';

import i18n from './i18n';

import './CollapsableText.scss';

const block = cn('elements-collapsable-text');

type CollapsableTextProps = {
    lineCount?: number;
    lineHeight?: number;
    collapsed?: boolean;
    onToggle?: ({collapsed}: {collapsed: boolean}) => void;
} & ContentProps;

type ContentProps =
    | {
          value: any;
          settings?: React.ComponentProps<typeof Yson>['settings'];

          children?: never;
      }
    | {
          value?: never;
          settings?: never;

          children?: React.ReactNode;
      };

type State = {
    collapsed: CollapsableTextProps['collapsed'];
};

class CollapsableText extends React.Component<CollapsableTextProps> {
    static defaultProps = {
        collapsed: true,
        lineHeight: 20,
        lineCount: 3,
    };

    state: State = {
        collapsed: this.props.collapsed,
    };

    private textRef = React.createRef<HTMLDivElement>();
    private textSize?: number;

    componentDidMount() {
        this.textSize = this.getTextSize();
        this.forceUpdate();
    }
    render() {
        const {collapsed} = this.state;

        const className = block({collapsed: collapsed ? 'yes' : undefined});

        return (
            <div className={className}>
                {this.renderContent()}
                {this.renderToggler()}
            </div>
        );
    }
    toggle = () => {
        const {onToggle} = this.props;

        const collapsed = !this.state.collapsed;

        this.setState({collapsed});

        if (typeof onToggle === 'function') {
            onToggle({collapsed});
        }
    };
    getTextSize() {
        return this.textRef.current?.offsetHeight;
    }
    renderContent() {
        const {value, settings, lineHeight, lineCount, children} = this.props;
        const {collapsed} = this.state;

        const className = block('text');
        const style = collapsed ? {maxHeight: lineCount! * lineHeight!} : undefined;

        return (
            <div className={className} style={style}>
                <div ref={this.textRef}>
                    {children ? children : <Yson settings={settings} value={value} />}
                </div>
            </div>
        );
    }
    renderToggler() {
        const {collapsed} = this.state;
        const {lineHeight, lineCount} = this.props;

        return (
            this.textSize! > lineHeight! * lineCount! && (
                <Button className={block('toggler')} view="flat" size="s" onClick={this.toggle}>
                    {collapsed ? i18n('show-more') : i18n('show-less')}
                </Button>
            )
        );
    }
}

export default CollapsableText;

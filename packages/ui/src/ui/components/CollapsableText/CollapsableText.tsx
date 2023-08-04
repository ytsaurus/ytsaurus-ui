import React, {Component} from 'react';
import PropTypes from 'prop-types';
import cn from 'bem-cn-lite';
import Button from '../../components/Button/Button';

import Yson from '../../components/Yson/Yson';

import './CollapsableText.scss';

export const propTypes = {
    value: PropTypes.any.isRequired,
    settings: PropTypes.object,
    lineCount: PropTypes.number,
    lineHeight: PropTypes.number,
    collapsed: PropTypes.bool,
    onToggle: PropTypes.func,
};

const defaultProps = {
    collapsed: true,
    lineHeight: 20,
    lineCount: 3,
};

const block = cn('elements-collapsable-text');

class CollapsableText extends Component {
    constructor(props) {
        super(props);

        this.toggle = this.toggle.bind(this);

        this.textBlock = null;
        this.textSize = null;

        this.state = {
            collapsed: props.collapsed,
        };
    }
    componentDidMount() {
        this.textSize = this.getTextSize();
        this.forceUpdate();
    }
    toggle() {
        const {onToggle} = this.props;

        const collapsed = !this.state.collapsed;

        this.setState({collapsed});

        if (typeof onToggle === 'function') {
            onToggle({collapsed});
        }
    }
    getTextSize() {
        const textBlock = this.textBlock;
        return textBlock && textBlock.offsetHeight;
    }
    renderText() {
        const {value, settings, lineHeight, lineCount} = this.props;
        const {collapsed} = this.state;

        const className = block('text');
        const style = collapsed ? {maxHeight: lineCount * lineHeight} : undefined;

        return (
            <div className={className} style={style}>
                <div
                    ref={(textBlock) => {
                        this.textBlock = textBlock;
                    }}
                >
                    <Yson settings={settings} value={value} />
                </div>
            </div>
        );
    }
    renderToggler() {
        const {collapsed} = this.state;
        const {lineHeight, lineCount} = this.props;

        return (
            this.textSize > lineHeight * lineCount && (
                <Button className={block('toggler')} view="flat" size="s" onClick={this.toggle}>
                    {collapsed ? 'Show more' : 'Show less'}
                </Button>
            )
        );
    }
    render() {
        const {collapsed} = this.state;

        const className = block({collapsed: collapsed ? 'yes' : undefined});

        return (
            <div className={className}>
                {this.renderText()}
                {this.renderToggler()}
            </div>
        );
    }
}

CollapsableText.propTypes = propTypes;
CollapsableText.defaultProps = defaultProps;

export default CollapsableText;

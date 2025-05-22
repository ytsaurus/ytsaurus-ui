import React from 'react';
import PropTypes from 'prop-types';
import cn from 'bem-cn-lite';

import split from 'split.js';

import './FlexSplitPane.scss';

const b = cn('flex-split');

class FlexSplitPane extends React.Component {
    static propTypes = {
        className: PropTypes.string,
        paneClassNames: PropTypes.array,
        direction: PropTypes.string,
        minSize: PropTypes.number,
        children: PropTypes.node,
        getInitialSizes: PropTypes.func,
        onResize: PropTypes.func,
        onResizeEnd: PropTypes.func,
        onSplit: PropTypes.func,
        onUnSplit: PropTypes.func,
        id: PropTypes.string,
    };

    static defaultProps = {
        onSplit: null,
        onUnSplit: null,
    };

    static VERTICAL = 'vertical';
    static HORIZONTAL = 'horizontal';

    componentDidMount() {
        this.checkSplit();
    }

    componentDidUpdate() {
        this.checkSplit();
    }

    componentWillUnmount() {
        this.destroySplit();
    }

    _ref = (node) => {
        this.pane = node;
    };
    _refFirst = (node) => {
        this.paneFirst = node;
    };
    _refSecond = (node) => {
        this.paneSecond = node;
    };

    checkSplit() {
        if (
            this.paneFirst &&
            this.paneSecond &&
            this.paneFirst.children.length &&
            this.paneSecond.children.length
        ) {
            this.split();
        } else {
            this.destroySplit();
        }
    }

    getInitialSizes() {
        const {getInitialSizes} = this.props;
        if (typeof getInitialSizes !== 'function') {
            return undefined;
        }
        const sizes = getInitialSizes();
        if (
            Array.isArray(sizes) &&
            Math.abs(sizes.reduce((acc, size) => acc + size, 0) - 100) < 1
        ) {
            return sizes;
        }
        return undefined;
    }

    split() {
        const {direction, minSize, onSplit} = this.props;

        if (!this.splitInstance) {
            this.splitInstance = split([this.paneFirst, this.paneSecond], {
                direction,
                sizes: this.getInitialSizes(),
                minSize,
                snapOffset: 0,
                elementStyle: function (dimension, size, gutterSize) {
                    return {
                        'flex-basis': `calc(${size}% - ${gutterSize}px)`,
                    };
                },
                gutterStyle: function (dimension, gutterSize) {
                    return {
                        'flex-basis': `${gutterSize}px`,
                    };
                },
                onDrag: this.props.onResize,
                onDragEnd: () => {
                    if (typeof this.props.onResizeEnd === 'function') {
                        this.props.onResizeEnd(this.splitInstance.getSizes());
                    }
                },
            });

            if (typeof onSplit === 'function') {
                onSplit();
            }
        }
    }

    destroySplit() {
        const {onUnSplit} = this.props;

        if (this.splitInstance) {
            this.splitInstance.destroy();
            this.splitInstance = null;

            if (typeof onUnSplit === 'function') {
                onUnSplit();
            }
        }
    }

    render() {
        const {direction, id, paneClassNames = []} = this.props;
        const [firstChild, ...restChildren] = this.props.children;
        return (
            <div ref={this._ref} className={b({direction}, this.props.className)}>
                <div ref={this._refFirst} className={b('pane', paneClassNames[0])}>
                    {firstChild}
                </div>
                <div className={b('pane', paneClassNames[1])} ref={this._refSecond} id={id}>
                    {restChildren}
                </div>
            </div>
        );
    }
}

export default FlexSplitPane;

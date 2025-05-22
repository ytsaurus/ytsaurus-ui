import React from 'react';
import PropTypes from 'prop-types';
import cn from 'bem-cn-lite';
import split from 'split.js';

import './FlexSplitPane.scss';

const b = cn('flex-split');

interface FlexSplitPaneProps {
    className?: string;
    paneClassNames?: string[];
    direction: 'vertical' | 'horizontal';
    minSize?: number;
    children: React.ReactNode;
    getInitialSizes?: () => number[];
    onResize?: (sizes: number[]) => void;
    onResizeEnd?: (sizes: number[]) => void;
    onSplit?: () => void;
    onUnSplit?: () => void;
    id?: string;
}

interface FlexSplitPaneState {
    initialSizes: number[] | null;
}

class FlexSplitPane extends React.Component<FlexSplitPaneProps, FlexSplitPaneState> {
    static propTypes = {
        className: PropTypes.string,
        paneClassNames: PropTypes.arrayOf(PropTypes.string),
        direction: PropTypes.string.isRequired,
        minSize: PropTypes.number,
        children: PropTypes.node.isRequired,
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

    static VERTICAL = 'vertical' as const;
    static HORIZONTAL = 'horizontal' as const;

    state: FlexSplitPaneState = {
        initialSizes: null,
    };

    private pane: HTMLDivElement | null = null;
    private paneFirst: HTMLDivElement | null = null;
    private paneSecond: HTMLDivElement | null = null;
    private splitInstance: ReturnType<typeof split> | null = null;

    componentDidMount() {
        this.checkSplit();
        window.addEventListener('resize', this.handleResize);
    }

    componentDidUpdate() {
        this.checkSplit();
    }

    componentWillUnmount() {
        this.destroySplit();
        window.removeEventListener('resize', this.handleResize);
    }

    _ref = (node: HTMLDivElement | null) => {
        this.pane = node;
    };

    _refFirst = (node: HTMLDivElement | null) => {
        this.paneFirst = node;
    };

    _refSecond = (node: HTMLDivElement | null) => {
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

    getInitialSizes(): number[] | undefined {
        const {getInitialSizes} = this.props;
        if (typeof getInitialSizes !== 'function') {
            return undefined;
        }
        const sizes = getInitialSizes();
        if (
            Array.isArray(sizes) &&
            Math.abs(sizes.reduce((acc, size) => acc + size, 0) - 100) < 1
        ) {
            this.setState({initialSizes: sizes});
            return sizes;
        }
        return undefined;
    }

    handleResize = () => {
        if (this.splitInstance) {
            const {minSize, direction} = this.props;
            const {initialSizes} = this.state;
            const containerSize =
                direction === FlexSplitPane.VERTICAL
                    ? this.pane?.offsetHeight
                    : this.pane?.offsetWidth;

            if (!containerSize || !minSize) return;

            const sizes = this.splitInstance.getSizes();
            const minSizePercent = (minSize / containerSize) * 100;

            // Check if any pane has become smaller than the minimum size
            const hasSmallPane = sizes.some((size: number) => size < minSizePercent);

            if (hasSmallPane) {
                // Check if at least one pane can get minSize
                const totalMinSize = minSizePercent * sizes.length;
                const canFitMinSize = totalMinSize <= 100;

                if (canFitMinSize) {
                    interface PaneInfo {
                        size: number;
                        index: number;
                        isSmall: boolean;
                    }

                    // Split panes into those smaller than minSize and those larger
                    const smallPanes: PaneInfo[] = sizes.map((size: number, index: number) => ({
                        size,
                        index,
                        isSmall: size < minSizePercent,
                    }));
                    const smallPanesCount = smallPanes.filter(
                        (pane: PaneInfo) => pane.isSmall,
                    ).length;

                    // Calculate space needed for small panes
                    const spaceForSmallPanes = smallPanesCount * minSizePercent;
                    // Remaining space to distribute between large panes
                    const remainingSpace = 100 - spaceForSmallPanes;

                    // Calculate total size of large panes to maintain proportions
                    const totalLargeSize = smallPanes
                        .filter((pane: PaneInfo) => !pane.isSmall)
                        .reduce((acc: number, pane: PaneInfo) => acc + pane.size, 0);

                    // Form new sizes
                    const newSizes = sizes.map((size: number, index: number) => {
                        const pane = smallPanes[index];
                        if (pane.isSmall) {
                            return minSizePercent;
                        } else {
                            // Maintain proportions for large panes
                            return (size / totalLargeSize) * remainingSpace;
                        }
                    });

                    this.splitInstance.setSizes(newSizes);
                } else {
                    // If no pane can get minSize, divide equally
                    const equalSize = 100 / sizes.length;
                    this.splitInstance.setSizes(sizes.map(() => equalSize));
                }
            } else if (initialSizes) {
                // If all panes are larger than minSize, return to initial proportions
                this.splitInstance.setSizes(initialSizes);
            }
        }
    };

    split() {
        const {direction, minSize, onSplit} = this.props;

        if (!this.splitInstance && this.paneFirst && this.paneSecond) {
            this.splitInstance = split([this.paneFirst, this.paneSecond], {
                direction,
                sizes: this.getInitialSizes(),
                minSize,
                snapOffset: 0,
                elementStyle: function (_, size, gutterSize) {
                    return {
                        'flex-basis': `calc(${size}% - ${gutterSize}px)`,
                    };
                },
                gutterStyle: function (_, gutterSize) {
                    return {
                        'flex-basis': `${gutterSize}px`,
                    };
                },
                onDrag: this.props.onResize,
                onDragEnd: () => {
                    if (typeof this.props.onResizeEnd === 'function' && this.splitInstance) {
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
        const [firstChild, ...restChildren] = React.Children.toArray(this.props.children);

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

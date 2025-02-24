import React from 'react';

import {Button, Icon} from '@gravity-ui/uikit';
import PropTypes from 'prop-types';

import cn from 'bem-cn-lite';
import i18n from '../i18n';
import {minute, year} from '../util';

import {
    buildTickFactory,
    ensureCovers,
    fromBounds,
    fromSelection,
    getCaptionRange,
    getInitialTimestamp,
    getTicks,
    globalDragHandler,
    zoomInterval,
} from './util';

import iconMinus from '@gravity-ui/icons/svgs/minus.svg';
import iconPlus from '@gravity-ui/icons/svgs/plus.svg';

import './TimelineRuler.scss';

const b = cn('yc-timeline-ruler');
const DEFAULT_ZOOM_IN_COEFF = 0.5;
const DEFAULT_ZOOM_OUT_COEFF = 2;

export class TimelineRuler extends React.Component {
    static propTypes = {
        displayNow: PropTypes.bool,
        from: PropTypes.number,
        to: PropTypes.number,
        leftBound: PropTypes.number,
        rightBound: PropTypes.number,
        maxRange: PropTypes.number,
        minRange: PropTypes.number,
        onUpdateBounds: PropTypes.func,
        onUpdateSelection: PropTypes.func,
        onNowReset: PropTypes.func,
        titles: PropTypes.object,
        height: PropTypes.number,
        hasZoomButtons: PropTypes.bool,
        hasNowButton: PropTypes.bool,
        belowSvg: PropTypes.func,
        belowSvgHeight: PropTypes.number,

        zoomFixedPoint: PropTypes.number,
        zoomSticksToNow: PropTypes.bool,
    };
    static defaultProps = {
        displayNow: true,
        maxRange: 50 * year,
        minRange: 5 * minute,
        height: 40,
        titles: {},
        hasZoomButtons: true,
        hasNowButton: true,
        belowSvgHeight: 0,
        zoomFixedPoint: 0.5,
    };
    static getDerivedStateFromProps(props, state) {
        const {width, timeOffset = 0, fromOffset = 0, toOffset = 0} = state;
        const {leftBound, rightBound, from, to, minRange} = props;
        const totalRange = Math.max(rightBound - leftBound || 0, minRange);
        const ratio = width / totalRange;
        const maxTickCount = Math.round(width / 80);
        const range = getCaptionRange(totalRange, maxTickCount);
        return {
            width,
            leftBound: leftBound + timeOffset,
            rightBound: rightBound + timeOffset,
            from: from + fromOffset,
            to: to + toOffset,
            totalRange,
            ratio,
            range,
        };
    }
    state = {};
    componentDidMount() {
        window.addEventListener('resize', this.onResize);
    }
    componentWillUnmount() {
        window.removeEventListener('resize', this.onResize);
    }
    _refRuler = (node) => {
        this.ruler = node;
        this.onResize();
    };
    getRatio() {
        return this.state.ratio;
    }
    timeToPosition(ts) {
        const {leftBound, ratio} = this.state;
        return (ts - leftBound) * ratio;
    }
    positionToTimeOffset(x) {
        const {ratio} = this.state;
        return Math.round(x / ratio);
    }
    getTotalHeight() {
        const {height, belowSvgHeight} = this.props;
        return belowSvgHeight + height;
    }
    getMinorTicks() {
        const {width, leftBound, rightBound, range} = this.state;
        const ticks = getTicks({leftBound, rightBound, range, width, calcTimestamp: true});
        const microTicks = getTicks({
            leftBound,
            rightBound,
            range: range / 10,
            width,
            initialTimestamp: getInitialTimestamp(leftBound - range, range),
        });
        return {
            ticks,
            microTicks,
        };
    }
    zoomBounds(multiplier, ratio = 0.5) {
        const {maxRange, minRange} = this.props;
        const oldBounds = fromBounds(this.props);
        const newBounds = zoomInterval(oldBounds, {maxRange, minRange, multiplier, ratio});
        const selection = fromSelection(this.props);
        ensureCovers(newBounds, selection);

        this.props.onUpdateBounds({
            leftBound: newBounds.start,
            rightBound: newBounds.end,
        });
    }
    zoomSelection(multiplier) {
        const {maxRange, minRange, zoomFixedPoint, zoomSticksToNow} = this.props;

        const oldBounds = fromBounds(this.props);
        const newBounds = zoomInterval(oldBounds, {multiplier, maxRange, minRange});

        const oldSelection = fromSelection(this.props);
        const newSelection = zoomInterval(oldSelection, {
            multiplier,
            maxRange,
            minRange,
            ratio: zoomFixedPoint,
        });

        if (zoomSticksToNow) {
            const now = Date.now();
            if (Math.abs(now - oldSelection.end) < 30000) {
                newSelection.start += now - newSelection.end;
                newSelection.end = now;
            }
        }

        this.props.onUpdateBounds({
            from: newSelection.start,
            to: newSelection.end,
            leftBound: newBounds.start,
            rightBound: newBounds.end,
        });
    }
    zoomIn = () => {
        this.zoomSelection(DEFAULT_ZOOM_IN_COEFF);
    };
    zoomOut = () => {
        this.zoomSelection(DEFAULT_ZOOM_OUT_COEFF);
    };

    onSelectionHandleMouseDown = (key) => {
        const {minRange} = this.props;

        const onMouseMove = (event) => {
            if (!isNaN(this.x)) {
                const clientX = event.clientX;

                const rawOffset = this.positionToTimeOffset(clientX - this.x);
                const rightOffset = Math.min(rawOffset, this.props.rightBound - this.props[key]);
                let offset = Math.max(rightOffset, this.props.leftBound - this.props[key]);
                switch (key) {
                    case 'to':
                        offset = Math.max(offset, this.props.from - this.props.to + minRange);
                        break;
                    case 'from':
                        offset = Math.min(offset, this.props.to - this.props.from - minRange);
                        break;
                }

                requestAnimationFrame(() => {
                    if (!isNaN(this.x)) {
                        this.setState({
                            [`${key}Offset`]: offset,
                        });
                    }
                });
            }
        };

        const onMouseUp = () => {
            this.x = undefined;
            const {[`${key}Offset`]: keyOffset} = this.state;
            if (keyOffset) {
                const {[key]: value} = this.state;
                this.props.onUpdateSelection({[key]: value});
                this.setState({
                    fromOffset: undefined,
                    toOffset: undefined,
                });
            }
        };

        return (event) => {
            if (event.button === 0) {
                this.x = event.clientX;
                globalDragHandler(onMouseMove, onMouseUp)(event);
            }
        };
    };
    onSelectionMouseDown = (event) => {
        const onMouseMove = (event) => {
            if (!isNaN(this.x)) {
                const clientX = event.clientX;
                const rawOffset = this.positionToTimeOffset(clientX - this.x);
                const rightOffset = Math.min(rawOffset, this.props.rightBound - this.props.to);
                const offset = Math.max(rightOffset, this.props.leftBound - this.props.from);
                requestAnimationFrame(() => {
                    if (!isNaN(this.x)) {
                        this.setState({
                            fromOffset: offset,
                            toOffset: offset,
                        });
                    }
                });
            }
        };

        const onMouseUp = () => {
            this.x = undefined;
            const {fromOffset, toOffset} = this.state;
            if (fromOffset || toOffset) {
                const {from, to} = this.state;
                this.props.onUpdateSelection({from, to});
                this.setState({
                    fromOffset: undefined,
                    toOffset: undefined,
                });
            }
        };

        if (event.button === 0) {
            this.x = event.clientX;
            globalDragHandler(onMouseMove, onMouseUp)(event);
        }
    };
    onRulerMouseDown = (event) => {
        if (event.button === 0) {
            this.x = event.clientX;
            globalDragHandler(this.onRulerMouseMove, this.onRulerMouseUp)(event);
        }
    };
    onRulerMouseMove = (event) => {
        if (!isNaN(this.x)) {
            const clientX = event.clientX;
            const rawOffset = this.positionToTimeOffset(clientX - this.x);
            const rightOffset = Math.min(rawOffset, this.props.rightBound - this.props.to);
            const offset = Math.max(rightOffset, this.props.leftBound - this.props.from);
            requestAnimationFrame(() => {
                if (!isNaN(this.x)) {
                    this.setState({
                        timeOffset: -offset,
                    });
                }
            });
        }
    };
    onRulerMouseUp = () => {
        this.x = undefined;
        const {timeOffset} = this.state;
        if (timeOffset) {
            const {leftBound, rightBound} = this.state;
            this.props.onUpdateBounds({leftBound, rightBound});
            this.setState({
                timeOffset: undefined,
            });
        }
    };
    onRulerWheel = (event) => {
        const boundingRect = event.currentTarget.getBoundingClientRect();
        const leftOffset = event.clientX - boundingRect.left;
        const width = boundingRect.width;
        const point = leftOffset / width;
        if (event.deltaY > 0) {
            this.zoomBounds(DEFAULT_ZOOM_OUT_COEFF, point);
        } else {
            this.zoomBounds(DEFAULT_ZOOM_IN_COEFF, point);
        }
    };
    onResize = () => {
        if (this.ruler && this.ruler.clientWidth !== this.state.width) {
            this.setState({width: this.ruler.clientWidth});
        }
    };
    renderNow() {
        const totalHeight = this.getTotalHeight();
        const {width} = this.state;
        const now = Math.round(this.timeToPosition(Date.now()));

        if (now > width - 4) {
            return null;
        }

        return <path className={b('now-tick')} d={`M${now - 1} 0 V${totalHeight}h2V0z`} />;
    }
    renderRuler() {
        const {width, leftBound, rightBound} = this.state;
        if (!width) {
            return null;
        }
        const {height, belowSvg} = this.props;
        const {ticks, microTicks} = this.getMinorTicks();
        const {from, to} = this.state;

        const totalHeight = this.getTotalHeight();

        return (
            <div
                onMouseDown={this.onRulerMouseDown}
                onWheel={this.onRulerWheel}
                className={b('container')}
            >
                <svg
                    className={b('ruler-svg')}
                    viewBox={`0 0 ${width} ${totalHeight}`}
                    width={width}
                    height={totalHeight}
                >
                    {Boolean(this.props.displayNow) && this.renderNow()}
                    <path
                        className={b('ruler-border')}
                        d={`M0 1 V${height - 1}h1V1z M${width} 1V${height - 1}h-1V1z`}
                    />
                    <path
                        className={b('ticks-major')}
                        d={ticks.map(buildTickFactory(1, 7, 1)).join('')}
                    />
                    <path
                        className={b('ticks-major')}
                        d={ticks.map(buildTickFactory(1, 7, height - 8)).join('')}
                    />
                    <path
                        className={b('ticks-minor')}
                        d={microTicks.map(buildTickFactory(1, 4, 1)).join('')}
                    />
                    <path
                        className={b('ticks-minor')}
                        d={microTicks.map(buildTickFactory(1, 4, height - 5)).join('')}
                    />
                    {belowSvg &&
                        belowSvg({
                            width,
                            height,
                            totalHeight,
                            leftBound,
                            rightBound,
                        })}
                </svg>

                <div className={b('controls-container')} style={{height}}>
                    <div className={b('labels-minor')}>
                        {ticks.map((tick) => (
                            <span
                                key={tick.timestamp}
                                className={b('label-minor')}
                                style={{left: tick.point}}
                            >
                                {tick.formatted}
                            </span>
                        ))}
                    </div>
                </div>

                <div
                    className={b('selection')}
                    onMouseDown={this.onSelectionMouseDown}
                    style={{
                        left: this.timeToPosition(from),
                        width: this.timeToPosition(to) - this.timeToPosition(from),
                    }}
                >
                    <div className={b('selection-interactive')} style={{height}}></div>
                    <div
                        className={b('selection-handle', {position: 'left'})}
                        onMouseDown={this.onSelectionHandleMouseDown('from')}
                    />
                    <div
                        className={b('selection-handle', {position: 'right'})}
                        onMouseDown={this.onSelectionHandleMouseDown('to')}
                    />
                </div>
            </div>
        );
    }
    render() {
        const {className, titles, hasZoomButtons, hasNowButton} = this.props;
        return (
            <div className={b(null, className)}>
                {hasZoomButtons && (
                    <div className={b('zoom')}>
                        <Button
                            view="flat"
                            size="l"
                            className={b('zoom-button')}
                            title={titles.zoomOut}
                            onClick={this.zoomOut}
                        >
                            <Icon data={iconMinus} size={16} height="100%" />
                        </Button>
                        <Button
                            view="flat"
                            size="l"
                            className={b('zoom-button')}
                            title={titles.zoomIn}
                            onClick={this.zoomIn}
                        >
                            <Icon data={iconPlus} size={16} height="100%" />
                        </Button>
                    </div>
                )}
                <div className={b('ruler')} ref={this._refRuler}>
                    {this.renderRuler()}
                </div>
                {hasNowButton && (
                    <Button
                        view="flat"
                        size="l"
                        title={titles.now}
                        className={b('now-button')}
                        onClick={this.props.onNowReset}
                    >
                        {i18n('label_now')}
                    </Button>
                )}
            </div>
        );
    }
}

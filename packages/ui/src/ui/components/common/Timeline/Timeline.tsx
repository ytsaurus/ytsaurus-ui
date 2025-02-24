import React from 'react';

import PropTypes from 'prop-types';

import cn from 'bem-cn-lite';

import {TimelinePicker} from './TimelinePicker/TimelinePicker';
import {TimelineRuler} from './TimelineRuler/TimelineRuler';
import {calculateShortcutTime} from './util';

import './Timeline.scss';

const b = cn('yc-timeline');
const MAX_WIDTH_RATIO = 50;

export const TimelineDefaultWrapper = ({picker, ruler}) => (
    <div className={b()}>
        {picker}
        {ruler}
    </div>
);

export const timelineDefaultProps = {
    hasPicker: true,
    hasRuler: true,
    hasDatePicker: true,
    padding: 0,
    wrapper: TimelineDefaultWrapper,
    maxSelectionToBoundsRatio: MAX_WIDTH_RATIO,
};

export class Timeline extends React.Component {
    static calculateShortcutTime = calculateShortcutTime;

    static propTypes = {
        from: PropTypes.number.isRequired,
        to: PropTypes.number.isRequired,
        padding: PropTypes.number,

        refreshInterval: PropTypes.string,
        shortcut: PropTypes.string,
        onUpdate: PropTypes.func,
        onRefreshUpdate: PropTypes.func,
        shortcuts: PropTypes.array,
        topShortcuts: PropTypes.array,
        refreshIntervals: PropTypes.array,

        minRange: PropTypes.number,
        maxRange: PropTypes.number,

        hasPicker: PropTypes.bool,
        hasRuler: PropTypes.bool,
        hasDatePicker: PropTypes.bool,
        hasRulerNowButton: PropTypes.bool,
        hasRulerZoomButtons: PropTypes.bool,
        wrapper: PropTypes.func,
        onBoundsUpdate: PropTypes.func,
        belowSvg: PropTypes.func,
        belowSvgHeight: PropTypes.number,

        zoomCoeffs: PropTypes.shape({
            in: PropTypes.number,
            out: PropTypes.number,
        }),
        zoomFixedPoint: PropTypes.number,
        zoomSticksToNow: PropTypes.bool,
        maxSelectionToBoundsRatio: PropTypes.number,
    };
    static defaultProps = timelineDefaultProps;
    state = {};
    static getDerivedStateFromProps(props, state) {
        const {from, to, padding, maxSelectionToBoundsRatio} = props;
        let leftBound = Math.min(Number(state.leftBound) || from, from);
        let rightBound = Math.max(Number(state.rightBound) || to, to);
        const diff = to - from;
        const ratio = (rightBound - leftBound) / diff;

        if (ratio > maxSelectionToBoundsRatio) {
            leftBound = from - ((from - leftBound) * maxSelectionToBoundsRatio) / ratio;
            rightBound = to + ((rightBound - to) * maxSelectionToBoundsRatio) / ratio;
        }
        if (padding) {
            const minRatio = Math.min(1 / (1 - padding), 2);
            const halfRange = Math.round((diff * minRatio) / 2);
            const middlePoint = Math.round(from + diff / 2);
            if (rightBound - leftBound < 2 * halfRange) {
                leftBound = Math.round(middlePoint - halfRange);
                rightBound = Math.round(middlePoint + halfRange);
            } else {
                const range = rightBound - leftBound;
                const sidePadding = Math.round((range * (1 - 1 / minRatio)) / 2);
                if (leftBound > from - sidePadding) {
                    leftBound = from - sidePadding;
                    rightBound = leftBound + range;
                }
                if (rightBound < to + sidePadding) {
                    rightBound = to + sidePadding;
                    leftBound = rightBound - range;
                }
            }
        }

        if (props.onBoundsUpdate) {
            if (leftBound !== state.leftBound || rightBound !== state.rightBound) {
                props.onBoundsUpdate({leftBound, rightBound});
            }
        }

        return {
            leftBound,
            rightBound,
        };
    }
    setTime = (data) => {
        const {leftBound, rightBound} = {...this.state, ...data};
        this.onBoundsUpdate({leftBound, rightBound});
        this.setState({leftBound, rightBound});
        this.onUpdate(data);
    };
    onShortcut = (shortcut, shortcutName) => {
        const {from, to} = calculateShortcutTime(shortcut);
        if (this.props.onUpdate && to !== from) {
            this.props.onUpdate({from, to, shortcut: shortcutName, shortcutValue: shortcut});
        }
    };
    onNowReset = () => {
        const {from, to} = this.props;
        const now = Date.now();
        if (this.props.onUpdate) {
            this.props.onUpdate({from: now - to + from, to: now, nowReset: true});
        }
    };
    onRefreshUpdate = (refreshInterval) => {
        if (this.props.onRefreshUpdate) {
            this.props.onRefreshUpdate(refreshInterval);
        }
    };
    onUpdate(data) {
        const {from, to} = {...this.props, ...data};
        if (
            this.props.onUpdate &&
            (from || to) &&
            !(from === this.props.from && to === this.props.to)
        ) {
            this.props.onUpdate({from, to});
        }
    }
    onBoundsUpdate(newBounds) {
        if (this.props.onBoundsUpdate) {
            const {leftBound, rightBound} = this.state;

            if (newBounds.leftBound !== leftBound || newBounds.rightBound !== rightBound) {
                this.props.onBoundsUpdate(newBounds);
            }
        }
    }
    renderRuler() {
        if (this.props.hasRuler === false) {
            return null;
        }

        const {leftBound, rightBound} = this.state;
        const {
            from,
            to,
            hasRulerNowButton,
            hasRulerZoomButtons,
            belowSvg,
            belowSvgHeight,
            zoomCoeffs,
            zoomFixedPoint,
            zoomSticksToNow,
            minRange,
            maxRange,
        } = this.props;
        return (
            <TimelineRuler
                className={b('ruler')}
                leftBound={leftBound}
                rightBound={rightBound}
                from={from}
                to={to}
                hasNowButton={hasRulerNowButton}
                hasZoomButtons={hasRulerZoomButtons}
                onNowReset={this.onNowReset}
                onUpdateBounds={this.setTime}
                onUpdateSelection={this.setTime}
                minRange={minRange}
                maxRange={maxRange}
                belowSvg={belowSvg}
                belowSvgHeight={belowSvgHeight}
                zoomCoeffs={zoomCoeffs}
                zoomFixedPoint={zoomFixedPoint}
                zoomSticksToNow={zoomSticksToNow}
            />
        );
    }
    renderPicker() {
        if (this.props.hasPicker === false) {
            return null;
        }

        const {
            from,
            to,
            shortcut,
            shortcuts,
            topShortcuts,
            hasDatePicker,
            refreshInterval,
            refreshIntervals,
        } = this.props;

        return (
            <TimelinePicker
                className={b('picker')}
                from={from}
                to={to}
                hasDatePicker={hasDatePicker}
                shortcuts={shortcuts}
                refreshInterval={refreshInterval}
                shortcut={shortcut}
                refreshIntervals={refreshIntervals}
                topShortcuts={topShortcuts}
                onUpdate={this.setTime}
                onRefreshUpdate={this.onRefreshUpdate}
                onShortcut={this.onShortcut}
            />
        );
    }
    render() {
        const {leftBound, rightBound} = this.state;

        return this.props.wrapper({
            picker: this.renderPicker(),
            ruler: this.renderRuler(),
            leftBound,
            rightBound,
        });
    }
}

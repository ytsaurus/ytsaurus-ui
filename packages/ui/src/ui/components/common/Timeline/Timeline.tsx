import React, {ReactNode} from 'react';

import cn from 'bem-cn-lite';

import {TimelinePicker} from './TimelinePicker/TimelinePicker';
import {TimelineRuler} from './TimelineRuler/TimelineRuler';
import {calculateShortcutTime} from './util';

import './Timeline.scss';

const b = cn('yc-timeline');
const MAX_WIDTH_RATIO = 50;

export interface TimelineProps {
    from: number;
    to: number;
    padding?: number;

    /** Minimal bounds range in ms (defaults to 5 minutes) */
    minRange?: number;
    /** Maximal bounds range in ms  (defaults to 50 years) */
    maxRange?: number;

    refreshInterval?: string;
    shortcut?: string;
    onUpdate?: (timespan: {
        from: number;
        to: number;
        shortcut?: string;
        nowReset?: boolean;
        shortcutValue?: string;
    }) => void;
    onRefreshUpdate?: (refreshInterval: string) => void;
    shortcuts?: TimelineShortcut[][];
    topShortcuts?: TimelineShortcut[];
    refreshIntervals?: TimelineRefreshInterval[];

    hasPicker?: boolean;
    hasRuler?: boolean;
    hasDatePicker?: boolean;
    hasRulerNowButton?: boolean;
    hasRulerZoomButtons?: boolean;
    wrapper?: (props: TimelineWrapperProps) => ReactNode;
    onBoundsUpdate?: (b: {leftBound: number; rightBound: number}) => void;

    /** Additional svg height below the ruler */
    belowSvgHeight?: number;
    /** Additional svg content to render in the ruler */
    belowSvg?: (p: TimelineBelowSvgProps) => ReactNode;

    /**
     * In [0; 1]. Determines fixed point of selected interval when zooming via +/- buttons.
     *
     * 0.5 means that the middle of interval will remain fixed,
     *
     * 0 means that `from` will not change, and
     *
     * 1 means that `to` will stay fixed
     * default 0.5
     */
    zoomCoeffs?: {
        in: number;
        out: number;
    };
    zoomFixedPoint?: number;
    zoomSticksToNow?: boolean;
    /**
     * Specifies how much can bounds be larger than selection.
     * The constraint is `maxSelectionToBoundsRatio * (to - from) >= (rightBound - leftBound)`
     * default 50
     */
    maxSelectionToBoundsRatio?: number;
}

export interface TimelineShortcut {
    title?: string;
    time: string;
}
export interface TimelineRefreshInterval {
    title?: string;
    value: string;
}

export interface TimelineWrapperProps {
    ruler: React.ReactNode;
    picker: React.ReactNode;
    leftBound: number;
    rightBound: number;
}

export interface TimelineBelowSvgProps {
    leftBound: number;
    rightBound: number;
    width: number;
    height: number;
    totalHeight: number;
}

export const TimelineDefaultWrapper = ({picker, ruler}: {picker: ReactNode; ruler: ReactNode}) => (
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

export class Timeline extends React.Component<TimelineProps> {
    static calculateShortcutTime = calculateShortcutTime;
    static defaultProps = timelineDefaultProps;
    static getDerivedStateFromProps(
        props: TimelineProps,
        state: {leftBound: number; rightBound: number},
    ) {
        const {from, to, padding, maxSelectionToBoundsRatio} = props;
        let leftBound = Math.min(Number(state.leftBound) || from, from);
        let rightBound = Math.max(Number(state.rightBound) || to, to);
        const diff = to - from;
        const ratio = (rightBound - leftBound) / diff;

        if (maxSelectionToBoundsRatio && ratio > maxSelectionToBoundsRatio) {
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

    state: {leftBound: number; rightBound: number} = {leftBound: 0, rightBound: 0};

    setTime = (data: {
        from: number;
        to: number;
        shortcut?: string;
        nowReset?: boolean;
        shortcutValue?: string;
    }) => {
        const {leftBound, rightBound} = {...this.state, ...data};
        this.onBoundsUpdate({leftBound, rightBound});
        this.setState({leftBound, rightBound});
        this.onUpdate(data);
    };
    onShortcut = (shortcut: string, shortcutName: string) => {
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
    onRefreshUpdate = (refreshInterval: string) => {
        if (this.props.onRefreshUpdate) {
            this.props.onRefreshUpdate(refreshInterval);
        }
    };
    onUpdate(data: {
        from: number;
        to: number;
        shortcut?: string;
        nowReset?: boolean;
        shortcutValue?: string;
    }) {
        const {from, to} = {...this.props, ...data};
        if (
            this.props.onUpdate &&
            (from || to) &&
            !(from === this.props.from && to === this.props.to)
        ) {
            this.props.onUpdate({from, to});
        }
    }
    onBoundsUpdate(newBounds: {leftBound: number; rightBound: number}) {
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

        const {from, to, shortcut, shortcuts, topShortcuts, hasDatePicker} = this.props;

        return (
            <TimelinePicker
                className={b('picker')}
                from={from}
                to={to}
                hasDatePicker={hasDatePicker}
                shortcuts={shortcuts}
                shortcut={shortcut}
                topShortcuts={topShortcuts}
                onUpdate={this.setTime}
                onShortcut={this.onShortcut}
            />
        );
    }
    render() {
        const {leftBound, rightBound} = this.state;

        return this.props.wrapper!({
            picker: this.renderPicker(),
            ruler: this.renderRuler(),
            leftBound,
            rightBound,
        });
    }
}

import React, {ReactNode} from 'react';

import cn from 'bem-cn-lite';

import {TimelinePicker} from '../common/Timeline/TimelinePicker/TimelinePicker';
import {TimelineRuler} from './TimelineRuler';
import {calculateShortcutTime} from '../common/Timeline/util';

import './Timeline.scss';

const b = cn('yc-timeline');

export interface TimelineProps {
    from: number;
    to: number;

    /** Minimal bounds range in ms (defaults to 5 minutes) */
    minRange?: number;
    /** Maximal bounds range in ms  (defaults to 50 years) */
    maxRange?: number;
    shortcut?: string;
    onUpdate?: (timespan: {
        from: number;
        to: number;
        shortcut?: string;
        nowReset?: boolean;
        shortcutValue?: string;
    }) => void;
    shortcuts?: TimelineShortcut[][];
    topShortcuts?: TimelineShortcut[];
    hasPicker?: boolean;
    hasRuler?: boolean;
    hasDatePicker?: boolean;
    hasRulerNowButton?: boolean;
    hasRulerZoomButtons?: boolean;
    wrapper?: (props: TimelineWrapperProps) => ReactNode;
    zoomFixedPoint?: number;
    zoomSticksToNow?: boolean;
}

export interface TimelineShortcut {
    title?: string;
    time: string;
}

export interface TimelineWrapperProps {
    ruler: React.ReactNode;
    picker: React.ReactNode;
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
    wrapper: TimelineDefaultWrapper,
};

const SHOW_IN_DEFAULT_SHORTCUTS: Array<Array<TimelineShortcut>> = [
    [
        {title: '5 minues', time: '5m'},
        {title: '30 minues', time: '30m'},
        {title: '2 hours', time: '2h'},
        {title: '6 hours', time: '6h'},
        {title: '12 hours', time: '12h'},
    ],
    [
        {title: '1 days', time: '1d'},
        {title: '1 week', time: '1w'},
        {title: '1 month', time: '1mo'},
        {title: '3 month', time: '3mo'},
        {title: '1 year', time: '1y'},
    ],
];

export class Timeline extends React.Component<TimelineProps> {
    static defaultProps = timelineDefaultProps;

    setTime = (data: {
        from: number;
        to: number;
        shortcut?: string;
        nowReset?: boolean;
        shortcutValue?: string;
    }) => {
        this.onUpdate(data);
    };

    onShortcut = (shortcut: string, shortcutName: string) => {
        const {from, to} = calculateShortcutTime(shortcut);
        if (this.props.onUpdate && to !== from) {
            this.props.onUpdate({from, to, shortcut: shortcutName, shortcutValue: shortcut});
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
    renderRuler() {
        if (this.props.hasRuler === false) {
            return null;
        }

        const {
            from,
            to,
            hasRulerNowButton,
            hasRulerZoomButtons,
            zoomFixedPoint,
            zoomSticksToNow,
            minRange,
            maxRange,
        } = this.props;
        return (
            <TimelineRuler
                className={b('ruler')}
                from={from}
                to={to}
                hasNowButton={hasRulerNowButton}
                hasScaleButtons={hasRulerZoomButtons}
                minRange={minRange}
                maxRange={maxRange}
                zoomFixedPoint={zoomFixedPoint}
                zoomSticksToNow={zoomSticksToNow}
                onUpdate={this.setTime}
            />
        );
    }
    renderPicker() {
        if (this.props.hasPicker === false || !this.props.topShortcuts?.length) {
            return null;
        }

        const {from, to, shortcut, shortcuts, topShortcuts, hasDatePicker} = this.props;

        return (
            <TimelinePicker
                className={b('picker')}
                from={from}
                to={to}
                hasDatePicker={hasDatePicker}
                shortcuts={shortcuts ?? SHOW_IN_DEFAULT_SHORTCUTS}
                shortcut={shortcut}
                topShortcuts={topShortcuts}
                onUpdate={this.setTime}
                onShortcut={this.onShortcut}
            />
        );
    }
    render() {
        return this.props.wrapper!({
            picker: this.renderPicker(),
            ruler: this.renderRuler(),
        });
    }
}

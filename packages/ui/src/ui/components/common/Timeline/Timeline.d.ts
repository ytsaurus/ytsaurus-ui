import {Component, ReactNode} from 'react';

export interface TimelineShortcut {
    title?: string;
    time: string;
}
export interface TimelineRefreshInterval {
    title?: string;
    value: string;
}

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
    zoomFixedPoint?: number;
    zoomSticksToNow?: boolean;
    /**
     * Specifies how much can bounds be larger than selection.
     * The constraint is `maxSelectionToBoundsRatio * (to - from) >= (rightBound - leftBound)`
     * default 50
     */
    maxSelectionToBoundsRatio?: number;
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

export const timelineDefaultProps: Partial<TimelineProps>;
/**
 * @deprecated use ThinTimeline (https://nda.ya.ru/t/WriYC26w78gpN7)
 */
export class Timeline extends Component<TimelineProps> {}

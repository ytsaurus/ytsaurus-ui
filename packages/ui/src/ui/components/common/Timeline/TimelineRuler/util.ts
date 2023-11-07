import {DateTimeInput, dateTimeParse} from '@gravity-ui/date-utils';

import {day, minute, month, week, year} from '../util';

const ranges = [
    minute,
    minute * 2,
    minute * 5,
    minute * 10,
    minute * 20,
    minute * 30,
    minute * 60,
    minute * 120,
    minute * 180,
    minute * 360,
    minute * 720,
    day,
    day * 2,
    day * 3,
    week,
    week * 2,
    month,
    month * 2,
    month * 3,
    year,
];

export function getCaptionRange(totalRange: number, tickCount: number) {
    for (let i = 0; i < ranges.length; i++) {
        if (tickCount * ranges[i] > totalRange) {
            return ranges[i];
        }
    }
    return year * Math.ceil(totalRange / (6 * year));
}

export function formatTickTimestamps(ts: DateTimeInput) {
    const time = dateTimeParse(ts)!;
    if (time.isSame(time.startOf('day'))) {
        return time.format('YYYY-MM-DD');
    }
    return time.format('HH:mm');
}

export function getInitialTimestamp(leftBound: number, range: number) {
    const offset = (leftBound + range - new Date().getTimezoneOffset() * minute) % range;
    if (range >= week) {
        let time = dateTimeParse(leftBound - offset + range)!;
        if (range >= year) {
            time = time.startOf('year');
        } else if (range >= month) {
            time = time.startOf('month');
        } else if (range >= week) {
            time = time.startOf('week');
        }
        return time.valueOf();
    }
    return leftBound - offset + range;
}

export function getNextTimestamp(ts: number, range: number) {
    const time = dateTimeParse(ts)!;
    if (range >= year) {
        return time.add(range / year, 'year').valueOf();
    }
    if (range >= month) {
        return time.add(range / month, 'month').valueOf();
    }
    if (range >= week) {
        return time.add(range / week, 'week').valueOf();
    }
    return ts + range;
}

interface GetTicksArgument {
    leftBound: number;
    rightBound: number;
    width: number;
    range: number;
    calcTimestamp: boolean;
    initialTimestamp: number;
}
export function getTicks({
    leftBound,
    rightBound,
    width,
    range,
    calcTimestamp,
    initialTimestamp,
}: GetTicksArgument) {
    const totalRange = rightBound - leftBound;
    const ratio = width / totalRange;
    let timestamp = initialTimestamp || getInitialTimestamp(leftBound, range);
    const points = [];
    while (timestamp < rightBound) {
        const point = (timestamp - leftBound) * ratio;
        if (calcTimestamp) {
            points.push({point, timestamp, formatted: formatTickTimestamps(timestamp)});
        } else {
            points.push({point});
        }
        timestamp = getNextTimestamp(timestamp, range);
    }
    return points;
}

interface Tick {
    point: number;
}
export function buildTickFactory(width = 1, height = 10, anchor = 0) {
    return (tick: Tick) =>
        `M${Math.floor(tick.point - width / 2)} ${anchor}v${height}h${width}V${anchor}z`;
}

type Handler = (ev: MouseEvent) => unknown;
export function globalDragHandler(onMouseMove: Handler, onMouseUp: Handler) {
    const EventListenerMode = {capture: true};

    function preventGlobalMouseEvents() {
        document.body.style.pointerEvents = 'none';
    }

    function restoreGlobalMouseEvents() {
        document.body.style.pointerEvents = 'auto';
    }

    function mousemoveListener(e: MouseEvent) {
        e.stopPropagation();
        onMouseMove(e);
        // do whatever is needed while the user is moving the cursor around
    }

    function mouseupListener(e: MouseEvent) {
        restoreGlobalMouseEvents();
        document.removeEventListener('mouseup', mouseupListener, EventListenerMode);
        document.removeEventListener('mousemove', mousemoveListener, EventListenerMode);
        e.stopPropagation();
        onMouseUp(e);
    }

    function captureMouseEvents(e: MouseEvent) {
        preventGlobalMouseEvents();
        document.addEventListener('mouseup', mouseupListener, EventListenerMode);
        document.addEventListener('mousemove', mousemoveListener, EventListenerMode);
        e.preventDefault();
        e.stopPropagation();
    }

    return captureMouseEvents;
}

interface Interval {
    start: number;
    end: number;
}
interface ZoomIntervalOptions {
    maxRange: number;
    minRange: number;
    ratio?: number;
    multiplier: number;
}
export function zoomInterval(
    {start, end}: Interval,
    {multiplier, ratio = 0.5, maxRange, minRange}: ZoomIntervalOptions,
): Interval {
    let range = end - start;
    const middle = start * (1 - ratio) + end * ratio;
    if (multiplier > 1) {
        range = Math.min(range * multiplier, maxRange);
    } else {
        range = Math.max(range * multiplier, minRange);
    }

    const newStart = Math.round(middle - range * ratio);
    const newEnd = Math.round(middle + range * (1 - ratio));

    return {
        start: newStart,
        end: newEnd,
    };
}
export function ensureCovers(outer: Interval, inner: Interval): void {
    if (outer.start > inner.start) {
        outer.end += inner.start - outer.start;
        outer.start = inner.start;
    }
    if (outer.end < inner.end) {
        outer.start += inner.end - outer.end;
        outer.end = inner.end;
    }
}

export function fromBounds(bounds: {leftBound: number; rightBound: number}): Interval {
    return {start: bounds.leftBound, end: bounds.rightBound};
}
export function fromSelection(selection: {from: number; to: number}): Interval {
    return {start: selection.from, end: selection.to};
}

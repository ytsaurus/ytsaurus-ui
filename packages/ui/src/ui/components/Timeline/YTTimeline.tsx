import React from 'react';
import cn from 'bem-cn-lite';

import useResizeObserver from '../../hooks/useResizeObserver';

import {Timeline, TimelineProps} from './Timeline';
import {calculateShortcutTime} from '../common/Timeline/util';

import './YTTimeline.scss';

const block = cn('yt-timeline');

interface Props extends Omit<TimelineProps, 'padding' | 'hasPicker' | 'wrapper'> {
    className?: string;
}

const DEFAULT_SHORTCUTS = [
    {
        title: '30m',
        time: '30m',
    },
    {
        title: '2h',
        time: '2h',
    },
    {
        title: '1d',
        time: '1d',
    },
    {
        title: '1w',
        time: '1w',
    },
    {
        title: '1mo',
        time: '1mo',
    },
    {
        time: 'custom',
    },
];

function YTTimelineImpl({className, topShortcuts, from, to, ...rest}: Props) {
    const [width, setWidth] = React.useState<number | undefined>();
    const [ref, setRef] = React.useState<HTMLDivElement | null>(null);

    const onResize = React.useCallback(
        ([item]: Array<ResizeObserverEntry>) => {
            const {width: w} = item?.contentRect || {};
            if (w !== width) {
                setWidth(w);
            }
        },
        [width, setWidth],
    );

    useResizeObserver({
        element: ref || undefined,
        onResize,
    });

    if (!from || !to) return null;

    return (
        <Timeline
            {...rest}
            from={from}
            to={to}
            key={width}
            hasPicker={true}
            topShortcuts={topShortcuts || DEFAULT_SHORTCUTS}
            wrapper={({ruler, picker}) => {
                return (
                    <div className={block(null, className)} ref={setRef}>
                        <div className={block('picker')}>{picker}</div>
                        <div className={block('ruler')}>{ruler}</div>
                    </div>
                );
            }}
        />
    );
}

export type TimelineUpdateValue = Parameters<Required<TimelineProps>['onUpdate']>[0];

export const YTTimeline = React.memo(YTTimelineImpl);

const ONE_DAY_MS = 24 * 3600 * 1000;

export function calcFromTo(timeRange: {from?: number; to?: number; shortcutValue?: string}) {
    const {from = Math.floor(Date.now() - ONE_DAY_MS), to = Math.ceil(Date.now())} =
        timeRange.shortcutValue !== undefined
            ? calculateShortcutTime(timeRange.shortcutValue)
            : timeRange;

    return {...timeRange, from, to};
}

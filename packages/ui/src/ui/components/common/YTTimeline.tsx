import React from 'react';
import cn from 'bem-cn-lite';

import {Timeline, TimelineProps} from './Timeline/Timeline';

import useResizeObserver from '../../hooks/useResizeObserver';

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

function YTTimelineImpl({className, topShortcuts, ...rest}: Props) {
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

    return (
        <Timeline
            {...rest}
            padding={0.05}
            hasPicker={true}
            topShortcuts={topShortcuts || DEFAULT_SHORTCUTS}
            wrapper={({ruler, picker}) => {
                return (
                    <div className={block(null, className)} ref={setRef}>
                        {picker}
                        <div className={block('ruler')}>{ruler}</div>
                    </div>
                );
            }}
        />
    );
}

export type TimelineUpdateValue = Parameters<Required<TimelineProps>['onUpdate']>[0];

export const YTTimeline = React.memo(YTTimelineImpl);

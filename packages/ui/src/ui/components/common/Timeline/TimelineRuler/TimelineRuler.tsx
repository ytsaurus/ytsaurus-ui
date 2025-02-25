import React, {FC} from 'react';

import {Button} from '@gravity-ui/uikit';

import cn from 'bem-cn-lite';
import {dateTimeParse} from '@gravity-ui/date-utils';
import {RangeDateSelection, RangeDateSelectionProps} from '@gravity-ui/date-components';

import './TimelineRuler.scss';
import {DateTime} from '@gravity-ui/date-utils/build/typings/dateTime';

const b = cn('yc-timeline-ruler');

type Props = {
    className?: string;
    displayNow?: boolean;
    from: number;
    to: number;
    maxRange?: number;
    minRange?: number;
    titles?: {
        now?: string;
        zoomIn?: string;
        zoomOut?: string;
    };
    zoomFixedPoint?: number;
    zoomSticksToNow?: boolean;
    hasNowButton?: boolean;
    onUpdate: (data: {from: number; to: number}) => void;
} & Omit<RangeDateSelectionProps, 'onUpdate'>;

export const TimelineRuler: FC<Props> = ({
    from,
    to,
    className,
    displayNow = true,
    hasNowButton = true,
    titles,
    onUpdate,
    ...restProps
}) => {
    const handeOnNowReset = () => {
        const now = Date.now();
        onUpdate({from: now - to + from, to: now});
    };

    const handleOnUpdate = (v: {start: DateTime; end: DateTime}) => {
        onUpdate({
            from: v.start.valueOf(),
            to: v.end.valueOf(),
        });
    };

    return (
        <div className={b(null, className)}>
            <div className={b('ruler')}>
                <RangeDateSelection
                    {...restProps}
                    value={{
                        start: dateTimeParse(from)!,
                        end: dateTimeParse(to)!,
                    }}
                    displayNow={displayNow}
                    onUpdate={handleOnUpdate}
                />
            </div>
            {hasNowButton && (
                <Button
                    view="flat"
                    title={titles?.now}
                    className={b('now-button')}
                    onClick={handeOnNowReset}
                >
                    Now
                </Button>
            )}
        </div>
    );
};

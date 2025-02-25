import React, {FC} from 'react';

import {Button, Icon} from '@gravity-ui/uikit';

import cn from 'bem-cn-lite';
import {dateTimeParse} from '@gravity-ui/date-utils';
import {RangeDateSelection} from '@gravity-ui/date-components';
import {zoomInterval} from './util';
import {minute, year} from '../util';

import iconMinus from '@gravity-ui/icons/svgs/minus.svg';
import iconPlus from '@gravity-ui/icons/svgs/plus.svg';

import './TimelineRuler.scss';
import {DateTime} from '@gravity-ui/date-utils/build/typings/dateTime';

const b = cn('yc-timeline-ruler');
const DEFAULT_ZOOM_IN_COEFF = 0.5;
const DEFAULT_ZOOM_OUT_COEFF = 2;

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
    hasZoomButtons?: boolean;
    hasNowButton?: boolean;
    onUpdate: (data: {from: number; to: number}) => void;
};

export const TimelineRuler: FC<Props> = ({
    from,
    to,
    maxRange = 50 * year,
    minRange = 5 * minute,
    className,
    displayNow = true,
    hasZoomButtons = true,
    hasNowButton = true,
    zoomFixedPoint = 0.5,
    zoomSticksToNow,
    titles,
    onUpdate,
}) => {
    const handeOnNowReset = () => {
        const now = Date.now();
        onUpdate({from: now - to + from, to: now});
    };

    const zoomSelection = (multiplier: number) => {
        const newSelection = zoomInterval(
            {start: from, end: to},
            {
                multiplier,
                maxRange,
                minRange,
                ratio: zoomFixedPoint,
            },
        );

        if (zoomSticksToNow) {
            const now = Date.now();
            if (Math.abs(now - to) < 30000) {
                newSelection.start += now - newSelection.end;
                newSelection.end = now;
            }
        }

        onUpdate({
            from: newSelection.start,
            to: newSelection.end,
        });
    };

    const handleOnZoomOut = () => {
        zoomSelection(DEFAULT_ZOOM_OUT_COEFF);
    };

    const handleOnZoomIn = () => {
        zoomSelection(DEFAULT_ZOOM_IN_COEFF);
    };

    const handleOnUpdate = (v: {start: DateTime; end: DateTime}) => {
        onUpdate({
            from: v.start.valueOf(),
            to: v.end.valueOf(),
        });
    };

    return (
        <div className={b(null, className)}>
            {hasZoomButtons && (
                <div className={b('zoom')}>
                    <Button
                        view="flat"
                        className={b('zoom-button')}
                        title={titles?.zoomOut}
                        onClick={handleOnZoomOut}
                    >
                        <Icon data={iconMinus} size={16} height="100%" />
                    </Button>
                    <Button
                        view="flat"
                        className={b('zoom-button')}
                        title={titles?.zoomIn}
                        onClick={handleOnZoomIn}
                    >
                        <Icon data={iconPlus} size={16} height="100%" />
                    </Button>
                </div>
            )}
            <div className={b('ruler')}>
                <RangeDateSelection
                    minValue={dateTimeParse(minRange)}
                    maxValue={dateTimeParse(maxRange)}
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

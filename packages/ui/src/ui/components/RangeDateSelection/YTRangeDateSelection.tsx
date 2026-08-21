import React from 'react';

import {Minus, Plus} from '@gravity-ui/icons';
import {Button, Icon} from '@gravity-ui/uikit';
import {
    RangeDateSelection,
    type RangeDateSelectionProps,
    type RangeValue,
} from '@gravity-ui/date-components';

import cn from 'bem-cn-lite';

import {type DateTime, dateTimeParse} from '../../utils/date-utils';

import i18n from './i18n';
import {ZOOM_IN_FACTOR, ZOOM_OUT_FACTOR, calculateZoomedRange} from './zoom';

import './YTRangeDateSelection.scss';

const block = cn('yt-range-date-selection');

export type YTRangeDateSelectionProps = Omit<RangeDateSelectionProps, 'value'> & {
    value: RangeValue<DateTime>;
};

export function YTRangeDateSelection({
    className,
    style,
    hasScaleButtons,
    scaleButtonsPosition = 'start',
    ...props
}: YTRangeDateSelectionProps) {
    const {value, onUpdate, minDuration, maxDuration} = props;

    const zoom = (factor: number) => {
        const {from, to} = calculateZoomedRange({
            from: value.start.valueOf(),
            to: value.end.valueOf(),
            factor,
            minDuration,
            maxDuration,
        });

        onUpdate?.({start: dateTimeParse(from)!, end: dateTimeParse(to)!});
    };

    const scaleButtons = hasScaleButtons ? (
        <div className={block('buttons', {position: scaleButtonsPosition})}>
            <Button
                view="flat-secondary"
                size="xs"
                title={i18n('action_zoom-out')}
                aria-label={i18n('action_zoom-out')}
                onClick={() => zoom(ZOOM_OUT_FACTOR)}
            >
                <Icon data={Minus} />
            </Button>
            <Button
                view="flat-secondary"
                size="xs"
                title={i18n('action_zoom-in')}
                aria-label={i18n('action_zoom-in')}
                onClick={() => zoom(ZOOM_IN_FACTOR)}
            >
                <Icon data={Plus} />
            </Button>
        </div>
    ) : null;

    return (
        <div className={block(null, className)} style={style}>
            {scaleButtonsPosition === 'start' && scaleButtons}
            <RangeDateSelection {...props} className={block('selection')} />
            {scaleButtonsPosition === 'end' && scaleButtons}
        </div>
    );
}

import React from 'react';

import format from '../../../common/hammer/format';

export type ValueFormat = 'DateTime' | 'TimeDuration';

export type TemplateTimeProps<T extends ValueFormat = 'DateTime'> = {
    time: string | number;
    valueFormat?: T;
    settings?: {format?: Format<T>};
};

export type Format<T extends ValueFormat> = T extends 'TimeDuration'
    ? TimeDurationFormat
    : DateTimeFormat;

export type DateTimeFormat = 'human' | 'full' | 'short' | 'day' | 'month';

export type TimeDurationFormat =
    | 'years'
    | 'months'
    | 'days'
    | 'hours'
    | 'minutes'
    | 'seconds'
    | 'milliseconds';

export function TemplateTime<T extends ValueFormat = 'DateTime'>({
    time,
    valueFormat,
    settings,
}: TemplateTimeProps<T>) {
    const content = format[valueFormat ?? 'DateTime'](time, settings);

    return <span title={content}>{content}</span>;
}

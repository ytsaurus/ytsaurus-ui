import cn from 'bem-cn-lite';

import {Flex, Text as GravityText} from '@gravity-ui/uikit';

import format from '@ytsaurus/interface-helpers/lib/hammer/format';

const itemBlock = cn('meta-table-item');

export type ValueFormat = 'DateTime' | 'TimeDuration' | 'DateTimeTwoLines';

export type TemplateTimeProps<T extends ValueFormat = 'DateTime'> = {
    className?: string;
    time?: string | number;
    valueFormat?: T;
    settings?: {format?: Format<T>};
};

export type Format<T extends ValueFormat> = T extends 'TimeDuration'
    ? TimeDurationFormat
    : DateTimeFormat;

export type DateTimeFormat = 'human' | 'full' | 'short' | 'day' | 'month' | 'time';

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
    valueFormat = 'DateTime' as T,
    settings,
    ...rest
}: TemplateTimeProps<T>) {
    const className = itemBlock('time', rest.className);

    if (valueFormat === 'DateTimeTwoLines') {
        const title = format['DateTime'](time, settings);

        return (
            <Flex className={className} title={title} direction={'column'}>
                <GravityText variant="inherit" ellipsis>
                    {format.DateTime(time, {format: 'day'})}
                </GravityText>
                <GravityText variant="inherit" ellipsis>
                    {format.DateTime(time, {format: 'time'})}
                </GravityText>
            </Flex>
        );
    }

    const content = format[valueFormat](time, settings);
    return (
        <span className={className} title={content}>
            {content}
        </span>
    );
}

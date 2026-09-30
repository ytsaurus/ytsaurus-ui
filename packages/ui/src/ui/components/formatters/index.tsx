import React from 'react';
import {Progress, type ProgressProps} from '@gravity-ui/uikit';

import hammer from '../../common/hammer';

// TODO: here are defiend reworked components from /templates/utils, drop original functions once we switch to
// new components everywhere
export {default as FormattedText} from './FormattedText';
export {default as FormattedLink} from './FormattedLink';
export {default as FormattedTextOrLink} from './FormattedTextOrLink';
export {default as FormattedId} from './FormattedId/FormattedId';

type FormatterContext<T> = {
    props: {
        columns: Record<string, {get(item: T): unknown}>;
    };
};

export function printColumnAsBytes<T>(this: FormatterContext<T>, item: T, columnName: string) {
    const column = this.props.columns[columnName];
    return hammer.format['Bytes'](column.get(item));
}

export function printColumnAsNumber<T>(this: FormatterContext<T>, item: T, columnName: string) {
    const column = this.props.columns[columnName];
    return hammer.format['Number'](column.get(item));
}

export function printColumnAsFloatNumber<T>(
    this: FormatterContext<T>,
    item: T,
    columnName: string,
) {
    const column = this.props.columns[columnName];
    return hammer.format['Number'](column.get(item), {
        digits: 2,
        digitsOnlyForFloat: true,
    });
}

export function printColumnAsProgress<T>(this: FormatterContext<T>, item: T, columnName: string) {
    const column = this.props.columns[columnName];
    return <Progress {...(column.get(item) as ProgressProps)} />;
}

export function printColumnAsTimeDuration<T>(
    this: FormatterContext<T>,
    item: T,
    columnName: string,
) {
    const column = this.props.columns[columnName];
    return hammer.format['TimeDuration'](column.get(item));
}

export function printColumnAsTimeDurationWithMs<T>(
    this: FormatterContext<T>,
    item: T,
    columnName: string,
) {
    const column = this.props.columns[columnName];
    return hammer.format['TimeDuration'](column.get(item), {
        format: 'milliseconds',
    });
}

export function printColumnAsReadableField<T>(
    this: FormatterContext<T>,
    item: T,
    columnName: string,
) {
    const column = this.props.columns[columnName];
    return (
        <span className="elements-ellipsis">
            {hammer.format['ReadableField'](column.get(item))}
        </span>
    );
}

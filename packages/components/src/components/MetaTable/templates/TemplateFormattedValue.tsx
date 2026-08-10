import type {ReactNode} from 'react';
import cn from 'bem-cn-lite';
import {format as hammerFormat} from '../../../utils';

const block = cn('meta-table-item');

type FormatSettings = Record<string, unknown>;

type FormatFn = (value: unknown, settings?: FormatSettings) => ReactNode;

type Props = {
    value: string | number | undefined;
    format: string | FormatFn;
    settings?: FormatSettings;
};

function isFormatFn(format: Props['format']): format is FormatFn {
    return typeof format === 'function';
}

export function TemplateFormattedValue({value, format, settings}: Props) {
    const isFn = isFormatFn(format);
    const formatModifier = isFn ? undefined : format?.toLowerCase();
    const formatFn = isFn ? format : hammerFormat[format as keyof typeof hammerFormat];

    return (
        <span className={block('value', {format: formatModifier})}>
            {formatFn(value, settings)}
        </span>
    );
}

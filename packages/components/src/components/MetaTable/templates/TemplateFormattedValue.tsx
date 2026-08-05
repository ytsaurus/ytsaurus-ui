import type {ReactNode} from 'react';

import {format as hammerFormat} from '../../../utils';

import {itemBlock} from './utils';

type Props = {
    value?: string | number;
    format?: string | ((value: unknown, settings?: Record<string, unknown>) => ReactNode);
    settings?: Record<string, unknown>;
};

export function TemplateFormattedValue({value, format: formatKey, settings}: Props) {
    const fmtIsFunc = typeof formatKey === 'function';
    const fmtClass = fmtIsFunc ? undefined : (formatKey as string | undefined)?.toLowerCase();
    return (
        <span className={itemBlock('value', {format: fmtClass})}>
            {fmtIsFunc
                ? (formatKey as (value: unknown, settings?: Record<string, unknown>) => ReactNode)(
                      value,
                      settings,
                  )
                : formatKey
                  ? hammerFormat[formatKey as keyof typeof hammerFormat](value, settings)
                  : null}
        </span>
    );
}

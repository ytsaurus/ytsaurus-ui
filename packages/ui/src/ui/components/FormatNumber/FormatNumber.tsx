import React from 'react';
import cn from 'bem-cn-lite';
import format from '../../common/hammer/format';

import ClipboardButton from '../../components/ClipboardButton/ClipboardButton';
import {YTText} from '../../components/Text/Text';
import {Tooltip} from '../../components/Tooltip/Tooltip';
import {parseBytes} from '../../utils/parse/parse-bytes';

const block = cn('yt-format-number');

export type FormatNumberProps = FormatSettings & {
    className?: string;

    value?: number;
    tooltip?: string;
};

export type FormatSettings =
    | {
          type: 'Number';
          settings?: {digits?: number; digitsOnlyForFloat?: boolean};
      }
    | {
          type: 'NumberSmart';
          settings?: {significantDigits?: number};
      }
    | {
          type: 'Bytes';
          settings?: {digits?: number};
      };

export function FormatNumber({className, tooltip, ...rest}: FormatNumberProps) {
    const {content, title, prefix} = getFormattedValue(rest);

    const tooltipContent = tooltip ? <YTText color="secondary">{tooltip}</YTText> : null;

    return (
        <Tooltip
            className={block(null, className)}
            content={
                <>
                    {tooltipContent} <span>{title} </span>
                    <ClipboardButton view="clear" text={title} inlineMargins />
                </>
            }
        >
            {prefix}
            {content}
        </Tooltip>
    );
}

export const APROXIMATEDLY_EQUAL_TO = '\u2248';

function getFormattedValue({value, ...params}: FormatNumberProps): {
    content: string;
    title?: string;
    prefix?: string;
} {
    if (isNaN(value!)) {
        return {content: format.NO_VALUE};
    }

    const content: string = format[params.type](value, params.settings);
    const fullValue = String(value);

    const parsed =
        params.type === 'Bytes' ? parseBytes(content) : Number(content.replaceAll(' ', ''));

    return {
        content,
        title: fullValue,
        prefix: value !== parsed ? APROXIMATEDLY_EQUAL_TO : undefined,
    };
}

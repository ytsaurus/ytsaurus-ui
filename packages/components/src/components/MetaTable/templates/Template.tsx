import React from 'react';
import cn from 'bem-cn-lite';

import {Flex, Icon, type IconData, Link, Text} from '@gravity-ui/uikit';

import {format as hammerFormat} from '../../../utils';
import {ClipboardButton} from '../../ClipboardButton';

import {TemplateTime} from './TemplateTime';

const itemBlock = cn('meta-table-item');

/* ----------------------------------------------------------------------------------------------------------------- */

export function TemplateId({id}: {id?: string}) {
    return (
        <div className={itemBlock('id')}>
            <Text ellipsis>{id}</Text>
            &nbsp;
            <ClipboardButton view="flat-secondary" text={id ?? ''} size="s" />
        </div>
    );
}

/* ----------------------------------------------------------------------------------------------------------------- */

export function TemplateFormattedValue({
    value,
    format: formatKey,
    settings,
}: {
    value?: string | number;
    format?: string | ((value: unknown, settings?: Record<string, unknown>) => React.ReactNode);
    settings?: Record<string, unknown>;
}) {
    const fmtIsFunc = typeof formatKey === 'function';
    const fmtClass = fmtIsFunc ? undefined : (formatKey as string | undefined)?.toLowerCase();
    return (
        <span className={itemBlock('value', {format: fmtClass})}>
            {fmtIsFunc
                ? (
                      formatKey as (
                          value: unknown,
                          settings?: Record<string, unknown>,
                      ) => React.ReactNode
                  )(value, settings)
                : formatKey
                  ? hammerFormat[formatKey as keyof typeof hammerFormat](value, settings)
                  : null}
        </span>
    );
}

/* ----------------------------------------------------------------------------------------------------------------- */

export function TemplateReadable({value = hammerFormat.NO_VALUE}: {value?: string}) {
    return <span className={itemBlock('readable')}>{hammerFormat['ReadableField'](value)}</span>;
}

/* ----------------------------------------------------------------------------------------------------------------- */

type TampleteLinkProps = {
    url: string;
    text?: string;
    icon?: IconData;
    withClipboard?: boolean;
    shiftText?: string;
    hoverContent?: React.ReactNode;
    maxWidth?: number;
};

function TemplateLink({
    url,
    icon: IconComponent,
    text = '',
    shiftText,
    withClipboard,
    hoverContent,
    maxWidth,
}: TampleteLinkProps) {
    return (
        <Flex
            gap={2}
            wrap="nowrap"
            alignItems="center"
            className={itemBlock('link')}
            style={{maxWidth}}
        >
            <Text ellipsis>
                <Link title={url} href={url}>
                    {IconComponent && <Icon data={IconComponent} size={14} />}
                    {text}
                </Link>
            </Text>

            {withClipboard && (
                <ClipboardButton
                    view="flat-secondary"
                    text={text}
                    shiftText={shiftText}
                    hoverContent={hoverContent}
                    size="s"
                />
            )}
        </Flex>
    );
}

/* ----------------------------------------------------------------------------------------------------------------- */

export function Template() {}

Template.Id = TemplateId;
Template.FormattedValue = TemplateFormattedValue;
Template.Readable = TemplateReadable;
Template.Time = TemplateTime;
Template.Link = TemplateLink;

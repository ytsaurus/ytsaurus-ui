import React, {Fragment} from 'react';
import cn from 'bem-cn-lite';

import {Text as GravityText, Icon, Link} from '@gravity-ui/uikit';

import formatUtils from '@ytsaurus/interface-helpers/lib/hammer/format';
import {ClipboardButton} from '../../ClipboardButton';

import {TemplateTime} from './TemplateTime';

const itemBlock = cn('meta-table-item');

/* ----------------------------------------------------------------------------------------------------------------- */

export function TemplateId({id}: {id?: string}) {
    return (
        <div className={itemBlock('id')}>
            <GravityText ellipsis>{id}</GravityText>
            &nbsp;
            <ClipboardButton view="flat-secondary" text={id ?? ''} size="s" />
        </div>
    );
}

/* ----------------------------------------------------------------------------------------------------------------- */

export function TemplateFormattedValue({
    value,
    format,
    settings,
}: {
    value?: string | number;
    format?: string | ((value: unknown, settings?: Record<string, unknown>) => React.ReactNode);
    settings?: Record<string, unknown>;
}) {
    const fmtIsFunc = typeof format === 'function';
    const fmt = fmtIsFunc ? undefined : (format as string)?.toLowerCase();
    return (
        <span className={itemBlock('value', {format: fmt})}>
            {fmtIsFunc
                ? (format as (v: unknown) => React.ReactNode)(value)
                : formatUtils[format as keyof typeof formatUtils](value, settings)}
        </span>
    );
}

/* ----------------------------------------------------------------------------------------------------------------- */

export function TemplateReadable({value = formatUtils.NO_VALUE}: {value?: string}) {
    return <span className={itemBlock('readable')}>{formatUtils['ReadableField'](value)}</span>;
}

/* ----------------------------------------------------------------------------------------------------------------- */

type IconData = React.ComponentType<React.SVGProps<SVGSVGElement>>;

function TemplateLink({
    url,
    icon: IconComponent,
    text = '',
    shiftText = undefined,
    withClipboard = false,
    hoverContent = undefined,
}: {
    url: string;
    text?: string;
    icon?: IconData;
    withClipboard?: boolean;
    shiftText?: string;
    hoverContent?: React.ReactNode;
}) {
    return (
        <Fragment>
            <div className={itemBlock('link', {clickable: withClipboard})}>
                <GravityText ellipsis>
                    <Link title={url} href={url}>
                        {IconComponent && <Icon data={IconComponent as never} size={14} />}
                        {text}
                    </Link>
                </GravityText>
                {withClipboard && (
                    <Fragment>
                        &nbsp;
                        <ClipboardButton
                            view="flat-secondary"
                            text={text}
                            shiftText={shiftText}
                            hoverContent={hoverContent}
                            size="s"
                        />
                    </Fragment>
                )}
            </div>
        </Fragment>
    );
}

/* ----------------------------------------------------------------------------------------------------------------- */

export function Template() {}

Template.Id = TemplateId;
Template.FormattedValue = TemplateFormattedValue;
Template.Readable = TemplateReadable;
Template.Time = TemplateTime;
Template.Link = TemplateLink;

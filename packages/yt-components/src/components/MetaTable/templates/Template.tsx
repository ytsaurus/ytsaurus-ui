import React, {Fragment} from 'react';
import cn from 'bem-cn-lite';

import DownloadIcon from '@gravity-ui/icons/svgs/arrow-down-to-line.svg';
import {Icon, Link} from '@gravity-ui/uikit';

import {hammer} from '../../../utils';
import {ClipboardButton} from '../../ClipboardButton';
import {CollapsableText} from '../../CollapsableText';

import {TemplateTime} from './TemplateTime';

const itemBlock = cn('meta-table-item');

/* ----------------------------------------------------------------------------------------------------------------- */

export function TemplateId({id}: {id?: string}) {
    return (
        <div className={itemBlock('id')}>
            <span className="elements-ellipsis">{id}</span>
            &nbsp;
            <ClipboardButton view="flat-secondary" text={id ?? ''} size="s" />
        </div>
    );
}

/* ----------------------------------------------------------------------------------------------------------------- */

export function TemplateValue({value}: {value?: string} = {}) {
    return <span className={itemBlock('value')}>{hammer.format['ValueOrDefault'](value)}</span>;
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
                : hammer.format[format as keyof typeof hammer.format](value, settings)}
        </span>
    );
}

/* ----------------------------------------------------------------------------------------------------------------- */

export function TemplateReadable({value = hammer.format.NO_VALUE}: {value?: string}) {
    return <span className={itemBlock('readable')}>{hammer.format['ReadableField'](value)}</span>;
}

/* ----------------------------------------------------------------------------------------------------------------- */

export function TemplateNumber({value = hammer.format.NO_VALUE}: {value?: string | number}) {
    return <span className={itemBlock('readable')}>{hammer.format['Number'](value)}</span>;
}

/* ----------------------------------------------------------------------------------------------------------------- */

export function TemplateCollapsableText({
    value,
    lineCount,
    settings,
}: {
    value: string;
    lineCount?: number;
    settings?: Record<string, unknown>;
}) {
    return <CollapsableText value={value} lineCount={lineCount} settings={settings} />;
}

/* ----------------------------------------------------------------------------------------------------------------- */

function TemplateShowError({
    error,
    onClick,
}: {
    error?: Record<string, unknown>;
    onClick?: () => void;
}) {
    return typeof error === 'object' ? (
        <Link view="secondary" href="#" onClick={onClick}>
            View
        </Link>
    ) : (
        hammer.format.NO_VALUE
    );
}

/* ----------------------------------------------------------------------------------------------------------------- */

function TemplateDownloadLink({size, url}: {url: string; size?: number}) {
    return (
        <span className={itemBlock('download-link')}>
            <Link title="Download" href={url}>
                <Icon data={DownloadIcon} size={16} />
            </Link>
            &emsp;
            {typeof size !== 'undefined' && (
                <span className="elements-ellipsis elements-secondary-text">
                    {hammer.format['Bytes'](size)}
                </span>
            )}
        </span>
    );
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
                <span className="elements-ellipsis">
                    <Link title={url} href={url}>
                        {IconComponent && <Icon data={IconComponent as never} size={16} />}
                        {text}
                    </Link>
                </span>
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
Template.Value = TemplateValue;
Template.FormattedValue = TemplateFormattedValue;
Template.Readable = TemplateReadable;
Template.Time = TemplateTime;
Template.Number = TemplateNumber;
Template.CollapsableText = TemplateCollapsableText;
Template.Error = TemplateShowError;
Template.DownloadLink = TemplateDownloadLink;
Template.Link = TemplateLink;

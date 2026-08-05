import React from 'react';
import cn from 'bem-cn-lite';
import {Link} from '@gravity-ui/uikit';

import hammer from '../../../common/hammer';
import CollapsableText from '../../../components/CollapsableText/CollapsableText';
import Icon from '../../../components/Icon/Icon';
import {ClickableText} from '../../../components/ClickableText/ClickableText';
import {type YsonSettings} from '../../../components/Yson/Yson';

export {
    TemplateFormattedValue,
    TemplateId,
    TemplateLink,
    TemplateReadable,
    TemplateTime,
} from '@ytsaurus/components';

const itemBlock = cn('meta-table-item');

/* ----------------------------------------------------------------------------------------------------------------- */

type TemplateValueProps = {
    value?: string;
};

export function TemplateValue({value}: TemplateValueProps = {}) {
    return <span className={itemBlock('value')}>{hammer.format['ValueOrDefault'](value)}</span>;
}

/* ----------------------------------------------------------------------------------------------------------------- */

type TemplateNumberProps = {
    value?: string | number;
};

export function TemplateNumber({value = hammer.format.NO_VALUE}: TemplateNumberProps) {
    return <span className={itemBlock('readable')}>{hammer.format['Number'](value)}</span>;
}

/* ----------------------------------------------------------------------------------------------------------------- */

type TemplateCollapsableTextProps = {
    value: string;
    lineCount?: number;
    settings?: YsonSettings;
};

export function TemplateCollapsableText({
    value,
    lineCount,
    settings,
}: TemplateCollapsableTextProps) {
    return <CollapsableText value={value} lineCount={lineCount} settings={settings} />;
}

/* ----------------------------------------------------------------------------------------------------------------- */

type TemplateErrorProps = {
    error?: unknown;
    onClick?: (event: React.MouseEvent) => void;
};

export function TemplateError({error, onClick}: TemplateErrorProps) {
    return typeof error === 'object' ? (
        <ClickableText onClick={onClick}>
            <span style={{color: 'var(--secondary-link)'}}>View</span>
        </ClickableText>
    ) : (
        hammer.format.NO_VALUE
    );
}

/* ----------------------------------------------------------------------------------------------------------------- */

type TemplateDownloadLinkProps = {
    url: string;
    size?: number;
};

export function TemplateDownloadLink({size, url}: TemplateDownloadLinkProps) {
    return (
        <span className={itemBlock('download-link')}>
            <Link title="Download" href={url} target="_blank">
                <Icon awesome="download" face="solid" />
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

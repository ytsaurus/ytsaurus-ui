import PropTypes from 'prop-types';
import React from 'react';
import cn from 'bem-cn-lite';
import {Link} from '@gravity-ui/uikit';

import hammer from '../../../common/hammer';
import CollapsableText from '../../../components/CollapsableText/CollapsableText';
import Icon from '../../../components/Icon/Icon';
import {ClickableText} from '../../../components/ClickableText/ClickableText';

export {
    TemplateFormattedValue,
    TemplateId,
    TemplateLink,
    TemplateReadable,
    TemplateTime,
} from '@ytsaurus/components';

const itemBlock = cn('meta-table-item');

/* ----------------------------------------------------------------------------------------------------------------- */

export function TemplateValue({value} = {}) {
    return <span className={itemBlock('value')}>{hammer.format['ValueOrDefault'](value)}</span>;
}

TemplateValue.propTypes = {
    value: PropTypes.string,
};

/* ----------------------------------------------------------------------------------------------------------------- */

export function TemplateNumber({value = hammer.format.NO_VALUE}) {
    return <span className={itemBlock('readable')}>{hammer.format['Number'](value)}</span>;
}

TemplateNumber.propTypes = {
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

/* ----------------------------------------------------------------------------------------------------------------- */

export function TemplateCollapsableText({value, lineCount, settings}) {
    return <CollapsableText value={value} lineCount={lineCount} settings={settings} />;
}

TemplateCollapsableText.propTypes = {
    value: PropTypes.string.isRequired,
    lineCount: PropTypes.number,
    settings: PropTypes.object,
};

/* ----------------------------------------------------------------------------------------------------------------- */

export function TemplateError({error, onClick}) {
    return typeof error === 'object' ? (
        <ClickableText onClick={onClick}>
            <span style={{color: 'var(--secondary-link)'}}>View</span>
        </ClickableText>
    ) : (
        hammer.format.NO_VALUE
    );
}

TemplateError.propTypes = {
    error: PropTypes.object,
    onClick: PropTypes.func,
};

/* ----------------------------------------------------------------------------------------------------------------- */

export function TemplateDownloadLink({size, url}) {
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

TemplateDownloadLink.propTypes = {
    url: PropTypes.string.isRequired,
    size: PropTypes.number,
};

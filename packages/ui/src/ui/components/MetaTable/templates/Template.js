import PropTypes from 'prop-types';
import React, {Fragment} from 'react';
import cn from 'bem-cn-lite';

import hammer from '../../../common/hammer';
import ClipboardButton from '../../../components/ClipboardButton/ClipboardButton';
import CollapsableText from '../../../components/CollapsableText/CollapsableText';
import Link from '../../../components/Link/Link';
import Icon from '../../../components/Icon/Icon';

const itemBlock = cn('meta-table-item');

/* ----------------------------------------------------------------------------------------------------------------- */

export function TemplateId({id}) {
    return (
        <div className={itemBlock('id')}>
            <span className="elements-ellipsis">{id}</span>
            &nbsp;
            <ClipboardButton view="flat-secondary" text={id} size="s" />
        </div>
    );
}

TemplateId.propTypes = {
    id: PropTypes.string,
};

/* ----------------------------------------------------------------------------------------------------------------- */

export function TemplateValue({value} = {}) {
    return <span className={itemBlock('value')}>{hammer.format['ValueOrDefault'](value)}</span>;
}

TemplateValue.propTypes = {
    value: PropTypes.string,
};

/* ----------------------------------------------------------------------------------------------------------------- */

export function TemplateFormattedValue({value, format, settings}) {
    const fmtIsFunc = typeof format === 'function';
    const fmt = fmtIsFunc ? undefined : format?.toLowerCase();
    return (
        <span className={itemBlock('value', {format: fmt})}>
            {fmtIsFunc ? format(value) : hammer.format[format](value, settings)}
        </span>
    );
}

TemplateFormattedValue.propTypes = {
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    format: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
    settings: PropTypes.object,
};

/* ----------------------------------------------------------------------------------------------------------------- */

export function TemplateReadable({value = hammer.format.NO_VALUE}) {
    return <span className={itemBlock('readable')}>{hammer.format['ReadableField'](value)}</span>;
}

TemplateReadable.propTypes = {
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

export function TemplateTime({time, valueFormat = 'DateTime', settings}) {
    const content = hammer.format[valueFormat](time, settings);

    return (
        <span className={itemBlock('time')} title={content}>
            {content}
        </span>
    );
}

TemplateTime.propTypes = {
    time: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    valueFormat: PropTypes.string,
    settings: PropTypes.object,
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

function TemplateShowError({error, onClick}) {
    return typeof error === 'object' ? (
        <Link theme="ghost" onClick={onClick}>
            View
        </Link>
    ) : (
        hammer.format.NO_VALUE
    );
}

TemplateShowError.propTypes = {
    error: PropTypes.object,
    onClick: PropTypes.func,
};

/* ----------------------------------------------------------------------------------------------------------------- */

function TemplateDownloadLink({size, url}) {
    return (
        <span className={itemBlock('download-link')}>
            <Link title="Download" url={url}>
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

/* -----------------------------------------------------------5------------------------------------------------------ */

function TemplateLink({
    url,
    icon,
    text = '',
    shiftText = undefined,
    face,
    withClipboard = false,
    hoverContent = undefined,
}) {
    return (
        <Fragment>
            <div className={itemBlock('link', {clickable: withClipboard})}>
                <span className="elements-ellipsis">
                    <Link title={url} url={url}>
                        {icon && <Icon awesome={icon} face={face} />}
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

TemplateLink.propTypes = {
    url: PropTypes.string.isRequired,
    text: PropTypes.string,
    icon: PropTypes.string,
    face: PropTypes.string,
    withClipboard: PropTypes.bool,
};

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

import React from 'react';
import unipika from '../../common/thor/unipika';
import block from 'bem-cn-lite';

import ClipboardButton from '../../components/ClipboardButton/ClipboardButton';
import {Tooltip} from '../Tooltip/Tooltip';
import Link from '../../components/Link/Link';

import hammer from '../../common/hammer';

import './utils.scss';

const tuBlock = block('template-utils');

function wrapRenderMethods(templates) {
    return Object.keys(templates).reduce((newTemplates, key) => {
        newTemplates[key] = templates[key];

        return newTemplates;
    }, {});
}

/**
 * Template must be a scoped function, because they are bound to elements-table component instance
 * @param {ViewModel} item
 * @param {String} columnName
 */
function defaultTemplate(item, columnName) {
    return String(hammer.format['ValueOrDefault'](item[columnName]));
}

function prepareTextProps(text, asHTML) {
    const props = {};

    if (asHTML) {
        // Need to render html strings
        props.dangerouslySetInnerHTML = {__html: text};
    } else {
        props.children = unipika.decode(String(text));
    }

    return props;
}

export function renderText(text, settings = {}) {
    let className = block('elements-text');

    if (settings.mix) {
        className = className(
            false,
            block(settings.mix.block)(settings.mix.elem, {
                ...settings.mix.mods,
            }),
        );
    } else {
        className = className();
    }

    const textProps = prepareTextProps(text, settings.asHTML);

    const title = settings.title || text;

    return <span {...textProps} title={title} className={className} />;
}

export function printColumnAsBytes(item, columnName) {
    const column = this.getColumn(columnName);
    return hammer.format['Bytes'](column.get(item));
}

export function printColumnAsNumber(item, columnName) {
    const column = this.getColumn(columnName);
    return hammer.format['Number'](column.get(item));
}

export function printColumnAsNumberSkipZero(item, columnName) {
    const column = this.getColumn(columnName);
    const value = column.get(item);
    return !value ? hammer.format.NO_VALUE : hammer.format['Number'](value);
}

export function printColumnAsTimeDurationWithMs(item, columnName) {
    const column = this.getColumn(columnName);
    return hammer.format['TimeDuration'](column.get(item), {
        format: 'milliseconds',
    });
}

export function printColumnAsReadableField(item, columnName) {
    const column = this.getColumn(columnName);
    return (
        <span className="elements-ellipsis">
            {hammer.format['ReadableField'](column.get(item))}
        </span>
    );
}

export function printColumnAsClickableReadableField(item, columnName) {
    const {handleItemClick} = this.props.templates.data;
    const column = this.getColumn(columnName);
    const text = hammer.format['ReadableField'](column.get(item));
    const handleClick = () => handleItemClick(column.get(item), columnName);

    return (
        <Link
            theme="primary"
            onClick={handleClick}
            className={'elements-monospace elements-ellipsis'}
        >
            {text}
        </Link>
    );
}

export function printColumnAsTime(item, columnName) {
    const column = this.getColumn(columnName);
    return (
        <span className="elements-ellipsis">
            {hammer.format['DateTime'](column.get(item), {format: 'full'})}
        </span>
    );
}

export function printColumnAsError(item, columnName) {
    const column = this.getColumn(columnName);
    const error = column.get(item);
    const showError = () => {
        if (this.props.templates.data.showError) {
            this.props.templates.data.showError(error, {hideOopsMsg: true});
        }
    };
    return typeof error === 'object' ? (
        <Link theme="ghost" onClick={showError}>
            View
        </Link>
    ) : (
        hammer.format.NO_VALUE
    );
}

export function printColumnAsClickableId(item, columnName, allowTooltip) {
    const {handleItemClick} = this.props.templates.data;
    const column = this.getColumn(columnName);
    const handleClick = () => handleItemClick(column.get(item), columnName);
    const text = column.get(item);
    return (
        <div className="elements-column_type_id elements-column_with-hover-button">
            <Link
                theme="primary"
                onClick={handleClick}
                className={'elements-monospace elements-ellipsis'}
            >
                <Tooltip
                    className={tuBlock('clickable-column-tooltip')}
                    content={allowTooltip ? text : null}
                >
                    {text}
                </Tooltip>
            </Link>
            &nbsp;
            <ClipboardButton
                text={text}
                view="flat-secondary"
                size="s"
                title={'Copy ' + columnName}
            />
        </div>
    );
}

// Using prepared table data
export function asBytes(item, columnName) {
    return hammer.format['Bytes'](item[columnName]);
}

export function asNumber(item, columnName) {
    return hammer.format['Number'](item[columnName]);
}

export default {
    __default__: defaultTemplate,
    _templates: {},
    add: function (templateId, templates) {
        this._templates[templateId] = wrapRenderMethods(templates);
    },
    get: function (templateId) {
        return this._templates[templateId] || {};
    },
};

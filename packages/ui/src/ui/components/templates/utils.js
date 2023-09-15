import React from 'react';
import unipika from '../../common/thor/unipika';
import block from 'bem-cn-lite';

import Link from '../../components/Link/Link';

import hammer from '../../common/hammer';
import {showErrorPopup} from '../../utils/utils';

import './utils.scss';

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

export function printColumnAsTime(item, columnName) {
    const value = this?.getColumn ? this.getColumn(columnName).get(item) : item[columnName];
    return <ColumnAsTime value={value} />;
}

export function ColumnAsTime({value}) {
    return (
        <span className="elements-ellipsis">
            {hammer.format['DateTime'](value, {format: 'full'})}
        </span>
    );
}

export function printColumnAsError(error) {
    const showError = () => {
        showErrorPopup(error, {hideOopsMsg: true});
    };
    return typeof error === 'object' ? (
        <Link theme="ghost" onClick={showError}>
            View
        </Link>
    ) : (
        hammer.format.NO_VALUE
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

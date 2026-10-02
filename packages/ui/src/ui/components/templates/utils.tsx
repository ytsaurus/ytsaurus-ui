import React from 'react';
import unipika from '../../common/thor/unipika';
import block from 'bem-cn-lite';
import {type YTError} from '../../../@types/types';
import {type LabelTheme} from '../Label';

import {ClickableText} from '../../components/ClickableText/ClickableText';

import hammer from '../../common/hammer';
import {showErrorPopup} from '../../utils/utils';
import i18n from './i18n';

import './utils.scss';

function wrapRenderMethods<T extends object>(templates: T): T {
    return Object.keys(templates).reduce((newTemplates, key) => {
        newTemplates[key as keyof T] = templates[key as keyof T];

        return newTemplates;
    }, {} as T);
}

/**
 * Template must be a scoped function, because they are bound to elements-table component instance
 * @param {ViewModel} item
 * @param {String} columnName
 */
function defaultTemplate<T, K extends keyof T>(item: T, columnName: K) {
    return String(hammer.format['ValueOrDefault'](item[columnName]));
}

function prepareTextProps(text: string | number | boolean | null | undefined, asHTML?: boolean) {
    const props: Pick<
        React.HTMLAttributes<HTMLSpanElement>,
        'children' | 'dangerouslySetInnerHTML'
    > = {};

    if (asHTML) {
        // Need to render html strings
        props.dangerouslySetInnerHTML = {__html: text as string};
    } else {
        props.children = unipika.decode(String(text));
    }

    return props;
}

type TextSettings = {
    asHTML?: boolean;
    title?: string;
    mix?: {block: string; elem?: string; mods?: Record<string, string | boolean | undefined>};
};

export function renderText(
    text: string | number | boolean | null | undefined,
    settings: TextSettings = {},
) {
    const textBlock = block('elements-text');
    let className: string;

    if (settings.mix) {
        className = textBlock(
            null,
            block(settings.mix.block)(settings.mix.elem as string, {
                ...settings.mix.mods,
            }),
        );
    } else {
        className = textBlock();
    }

    const textProps = prepareTextProps(text, settings.asHTML);

    const title = (settings.title || text) as string | undefined;

    return <span {...textProps} title={title} className={className} />;
}

export type TemplateContext<T, V> = {
    getColumn(name: string): {get(item: T): V; label?(value: V): LabelTheme};
};

export function printColumnAsBytes<T>(
    this: TemplateContext<T, number>,
    item: T,
    columnName: string,
) {
    const column = this.getColumn(columnName);
    return hammer.format['Bytes'](column.get(item));
}

export function printColumnAsNumber<T>(
    this: TemplateContext<T, number>,
    item: T,
    columnName: string,
) {
    const column = this.getColumn(columnName);
    return hammer.format['Number'](column.get(item));
}

export function printColumnAsTimeDurationWithMs<T>(
    this: TemplateContext<T, number>,
    item: T,
    columnName: string,
) {
    const column = this.getColumn(columnName);
    return hammer.format['TimeDuration'](column.get(item), {
        format: 'milliseconds',
    });
}

export function printColumnAsReadableField<T>(
    this: TemplateContext<T, string>,
    item: T,
    columnName: string,
) {
    const column = this.getColumn(columnName);
    return (
        <span className="elements-ellipsis">
            {hammer.format['ReadableField'](column.get(item))}
        </span>
    );
}

export function printColumnAsTime<T extends object>(
    this: TemplateContext<T, string | number> | void,
    item: T,
    columnName: string,
) {
    const value = this?.getColumn
        ? this.getColumn(columnName).get(item)
        : (item as Record<string, string | number>)[columnName];
    return <ColumnAsTime value={value} />;
}

export function ColumnAsTime({value}: {value: string | number}) {
    return (
        <span className="elements-ellipsis">
            {hammer.format['DateTime'](value, {format: 'full'})}
        </span>
    );
}

export function printColumnAsError(error: YTError | string | null | undefined) {
    const showError = () => {
        showErrorPopup(error as YTError, {hideOopsMsg: true});
    };
    return typeof error === 'object' ? (
        <ClickableText onClick={showError}>
            <span style={{color: 'var(--secondary-link)'}}>{i18n('action_view')}</span>
        </ClickableText>
    ) : (
        hammer.format.NO_VALUE
    );
}

// Using prepared table data
export function asBytes<K extends string>(item: Record<K, number>, columnName: K) {
    return hammer.format['Bytes'](item[columnName]);
}

export function asNumber<K extends string>(item: Record<K, number>, columnName: K) {
    return hammer.format['Number'](item[columnName]);
}

export default {
    __default__: defaultTemplate,
    _templates: {} as Record<string, object>,
    add<T>(
        templateId: string,
        templates: Record<string, (item: T, columnName: string) => React.ReactNode>,
    ) {
        this._templates[templateId] = wrapRenderMethods(templates);
    },
    get<
        T extends object = Record<
            string,
            (item: object | string, columnName?: string) => React.ReactNode
        >,
    >(templateId: string): T {
        return (this._templates[templateId] || {}) as T;
    },
};

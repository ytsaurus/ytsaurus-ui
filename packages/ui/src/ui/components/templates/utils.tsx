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

type RendererTemplates<T> = Record<string, (item: T, columnName: string) => React.ReactNode>;

function wrapRenderMethods<T>(templates: RendererTemplates<T>): RendererTemplates<T> {
    return Object.keys(templates).reduce<RendererTemplates<T>>((newTemplates, key) => {
        newTemplates[key] = templates[key];

        return newTemplates;
    }, {});
}

// Template must be a scoped function because it is bound to an elements-table component instance.
function defaultTemplate<T, K extends keyof T>(item: T, columnName: K) {
    return String(hammer.format['ValueOrDefault'](item[columnName]));
}

type TextSettings = {
    title?: string;
    mix?: {block: string; elem: string; mods?: Record<string, string | boolean | undefined>};
};

type HTMLTextProps = TextSettings & {text: string; asHTML: true};
type RenderTextProps =
    | (TextSettings & {text: string; asHTML?: boolean})
    | (TextSettings & {text: number | boolean | null | undefined; asHTML?: false});

function isHTMLText(props: RenderTextProps): props is HTMLTextProps {
    return Boolean(props.asHTML);
}

function prepareTextProps(props: RenderTextProps) {
    const textProps: Pick<
        React.HTMLAttributes<HTMLSpanElement>,
        'children' | 'dangerouslySetInnerHTML'
    > = {};

    if (isHTMLText(props)) {
        // Need to render html strings
        textProps.dangerouslySetInnerHTML = {__html: props.text};
    } else {
        textProps.children = unipika.decode(String(props.text));
    }

    return textProps;
}

export function renderText(props: RenderTextProps) {
    const {text} = props;
    const textBlock = block('elements-text');
    let className: string;

    if (props.mix) {
        className = textBlock(
            null,
            block(props.mix.block)(props.mix.elem, {
                ...props.mix.mods,
            }),
        );
    } else {
        className = textBlock();
    }

    const textProps = prepareTextProps(props);

    const title = (props.title || text) as string | undefined;

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

export function printColumnAsTime<T extends Record<K, string | number>, K extends string>(
    this: void,
    item: T,
    columnName: K,
): React.ReactElement;
export function printColumnAsTime<T extends object>(
    this: TemplateContext<T, string | number>,
    item: T,
    columnName: string,
): React.ReactElement;
export function printColumnAsTime(
    this: TemplateContext<Record<string, string | number>, string | number> | void,
    item: Record<string, string | number>,
    columnName: string,
) {
    const value = this?.getColumn ? this.getColumn(columnName).get(item) : item[columnName];
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

const registeredTemplates: Record<string, object> = {};

export default {
    __default__: defaultTemplate,
    _templates: registeredTemplates,
    add<T>(templateId: string, templates: RendererTemplates<T>) {
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

import {DialogField} from './Dialog';

import format from '../../common/hammer/format';
import {UnipikaSettings} from '../Yson/StructuredYson/StructuredYsonTypes';

export type OptionsGroup = {
    title: string;
    options: Array<OptionDescription>;
    hidden: boolean;
};

export type OptionDescription =
    | (Option<'string', string> & {choices?: Array<string>})
    | Option<'bool', boolean>
    | (Option<'uint64' | 'int64' | 'byte_count', number> & {
          max_value?: number;
          min_value?: number;
      })
    | Option<'yson', JsonAsString>
    | Option<'path' | 'pool', string>;

export type JsonAsString = string;

export type Option<TypeName extends string, T> = {
    name: string;
    type: TypeName;
    current_value?: T | null;
    default_value?: T;
    description?: string;
};

export function descriptionToDialogField<T = unknown>(
    item: OptionDescription,
    unipikaSettings: UnipikaSettings,
    {allowEdit}: {allowEdit: boolean},
): DialogField<T> & {initialValue?: unknown} {
    const common = {
        name: item.name,
        caption: format.ReadableField(item.name),
        tooltip: item.description,
    };
    const {default_value} = item;
    const extras = {
        disabled: !allowEdit,
        placeholder:
            default_value !== null && default_value !== undefined
                ? String(item.default_value)
                : undefined,
    };

    switch (item.type) {
        case 'string': {
            if (!item.choices?.length) {
                return {...common, type: 'text', extras};
            } else {
                return {
                    ...common,
                    type: 'select',
                    extras: {
                        ...extras,
                        width: 'max',
                        options: item.choices.map((value) => {
                            return {value, content: value};
                        }),
                        hasClear: true,
                    },
                };
            }
        }
        case 'bool':
            return {
                ...common,
                type: 'tumbler',
                extras,
                initialValue: item.current_value ?? item.default_value,
            };
        case 'int64':
        case 'uint64':
        case 'byte_count':
            return {
                ...common,
                type: item.type === 'byte_count' ? 'bytes' : 'number',
                extras: {
                    ...extras,
                    hidePrettyValue: true,
                    placeholder:
                        item.default_value !== undefined ? String(item.default_value) : undefined,
                    min: item.min_value,
                    max: item.max_value,
                },
            };
        case 'yson':
            return {
                ...common,
                type: 'json',
                fullWidth: true,
                extras: {
                    ...extras,
                    unipikaSettings,
                    minHeight: 200,
                },
            };
        case 'path':
            return {...common, type: 'path', extras};
        case 'pool':
            return {...common, type: 'pool', extras};
        default:
            return {...common, type: 'plain'};
    }
}

function makeConverter<T>() {
    return {
        toFieldValue(value: any) {
            return value as T;
        },
        fromFieldValue(value: any, _oldV?: any) {
            return value;
        },
    };
}

const CONVERTER: Record<string, ReturnType<typeof makeConverter>> = {
    number: {
        toFieldValue(value: unknown) {
            return {value: value as number | undefined};
        },
        fromFieldValue(value: any, _oldV?: any) {
            return value?.value;
        },
    },
    json: {
        toFieldValue(value: unknown) {
            return {value: value !== undefined ? JSON.stringify(value, null, 2) : undefined};
        },
        fromFieldValue(value: any, oldV?: any) {
            try {
                return JSON.parse(value.value);
            } catch {
                return oldV;
            }
        },
    },
    plain: {
        toFieldValue(value: unknown) {
            return JSON.stringify(value);
        },
        fromFieldValue(value: any, _oldV?: any) {
            return value !== undefined ? JSON.parse(value) : undefined;
        },
    },
};

function converterByType(type: DialogField['type']) {
    return CONVERTER[type!] ?? makeConverter<any>();
}

export function makeDialogFieldsFromDescription<FormValues = unknown>(
    data: Array<OptionsGroup>,
    unipikaSettings: UnipikaSettings,
    {allowEdit}: {allowEdit: boolean},
) {
    const currentValues: Record<string, any> = {};
    const typeByName: Record<
        string,
        {type: DialogField['type']; converter: ReturnType<typeof makeConverter>}
    > = {};
    return {
        fieldTypeByName: typeByName,
        initialValues: currentValues,
        fields: data?.map((group) => {
            const sectionFields: Array<DialogField<FormValues>> = group.options.map((item) => {
                const {initialValue, ...res} = descriptionToDialogField<FormValues>(
                    item,
                    unipikaSettings,
                    {allowEdit},
                );
                const {type} = res;

                const converter = converterByType(type);
                currentValues[item.name] =
                    initialValue ?? converter.toFieldValue(item.current_value);
                typeByName[item.name] = {type, converter};

                return res;
            });

            return {
                section: group.title,
                fields: sectionFields,
                collapsible: true,
                initialCollapsed: group.hidden,
            };
        }),
    };
}

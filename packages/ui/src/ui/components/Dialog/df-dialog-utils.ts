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
    {unipikaSettings, allowEdit}: MakeDialogFieldsOptions,
): DialogField<T> & {initialValue?: unknown; converter: Converter} {
    const common = {
        name: item.name,
        caption: format.ReadableField(item.name),
        tooltip: item.description,
        converter: makeConverter<any>(),
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
                    converter: CONVERTER.string_with_choices,
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
        case 'byte_count': {
            const valueFormat = item.type === 'byte_count' ? 'Bytes' : undefined;
            const defaultFormatted =
                valueFormat === 'Bytes'
                    ? format.Bytes(item.default_value)
                    : format.Number(item.default_value);
            return {
                ...common,
                type: 'number',
                extras: {
                    ...extras,
                    hidePrettyValue: true,
                    placeholder: item.default_value !== undefined ? defaultFormatted : undefined,
                    min: item.min_value,
                    max: item.max_value,
                    format: valueFormat,
                    integerOnly: true,
                    showHint: true,
                },
                converter: CONVERTER.number,
            };
        }
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
                converter: CONVERTER.json,
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
            return {value: value === null ? undefined : (value as number | undefined)};
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
    string_with_choices: {
        toFieldValue(value: string) {
            return value ? [value] : [];
        },
        fromFieldValue(value: Array<string>, _oldV?: any) {
            return value?.[0];
        },
    },
};

function converterByType(item: OptionDescription) {
    return CONVERTER[item.type] ?? makeConverter<any>();
}

type Converter = ReturnType<typeof converterByType>;

function makeDialogField<FormValues = any>(
    item: OptionDescription,
    dstInitialValues: any,
    dstConvertersByName: Record<string, {type: DialogField['type']; converter: Converter}>,
    options: MakeDialogFieldsOptions,
) {
    const {initialValue, converter, ...res} = descriptionToDialogField<FormValues>(item, options);
    const {type} = res;

    dstInitialValues[item.name] = initialValue ?? converter.toFieldValue(item.current_value);
    dstConvertersByName[item.name] = {type: type!, converter};

    return res;
}

type MakeDialogFieldsOptions = {
    allowEdit: boolean;
    unipikaSettings: UnipikaSettings;
};

export function makeDialogFieldsFromDescription<
    FormValues extends Record<string, unknown> = Record<string, unknown>,
>(data: Array<OptionsGroup>, options: MakeDialogFieldsOptions) {
    const initialValues: Record<string, any> = {};
    const typeByName: Record<
        string,
        {type: DialogField['type']; converter: ReturnType<typeof makeConverter>}
    > = {};
    return {
        fieldTypeByName: typeByName,
        initialValues: initialValues,
        fields: data?.map((group) => {
            const sectionFields: Array<DialogField<FormValues>> = group.options.map((item) => {
                return makeDialogField(item, initialValues, typeByName, options);
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

export function makeTabbedDialogFieldsFromDescription<
    FormValues extends Record<string, Record<string, unknown>> = Record<
        string,
        Record<string, unknown>
    >,
>(data: Array<OptionsGroup>, options: MakeDialogFieldsOptions) {
    const initialValues: Partial<FormValues> = {};
    const typeByName: Record<
        string,
        {type: DialogField['type']; converter: ReturnType<typeof makeConverter>}
    > = {};
    return {
        fieldTypeByName: typeByName,
        initialValues: initialValues,
        fields: data?.map((group, index) => {
            const group_name = `group_${index}`;
            const groupInitialValues = ((initialValues as any)[group_name] = {});
            const sectionFields: Array<DialogField<FormValues>> = group.options.map((item) => {
                return makeDialogField(item, groupInitialValues, typeByName, options);
            });

            return {
                name: group_name,
                title: group.title,
                type: 'tab-vertical' as const,
                fields: sectionFields,
            };
        }),
    };
}

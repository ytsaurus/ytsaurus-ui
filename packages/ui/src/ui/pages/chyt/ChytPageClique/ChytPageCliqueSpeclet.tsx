import React from 'react';
import {useDispatch, useSelector} from 'react-redux';
import reduce_ from 'lodash/reduce';

import format from '../../../common/hammer/format';

import Error from '../../../components/Error/Error';
import {DialogField, YTDFDialog} from '../../../components/Dialog/Dialog';

import {getChytCurrentAlias} from '../../../store/selectors/chyt';
import {
    getChytSpecletData,
    getChytSpecletDataAlias,
    getChytSpecletError,
} from '../../../store/selectors/chyt/speclet';
import {getEditJsonYsonSettings} from '../../../store/selectors/thor/unipika';
import {ChytCliqueOptionDescription} from '../../../store/actions/chyt/api';
import {chytLoadCliqueSpeclet, chytSetOptions} from '../../../store/actions/chyt/speclet';
import {ChytCliqueSpecletState} from '../../../store/reducers/chyt/speclet';
import {useThunkDispatch} from '../../../store/thunkDispatch';
import {YTError} from '../../../../@types/types';
import {UnipikaSettings} from '../../../components/Yson/StructuredYson/StructuredYsonTypes';

export function ChytPageCliqueSpeclet() {
    const dispatch = useDispatch();
    const alias = useSelector(getChytCurrentAlias);

    React.useMemo(() => {
        if (alias) {
            dispatch(chytLoadCliqueSpeclet(alias));
        }
    }, [alias]);

    const specletData = useSelector(getChytSpecletData);
    const dataAlias = useSelector(getChytSpecletDataAlias);
    const error = useSelector(getChytSpecletError);

    return (
        <React.Fragment>
            {error && <Error bottomMargin error={error} />}
            {!specletData ? null : (
                <ChytSpeclet
                    key={dataAlias}
                    alias={alias}
                    allowEdit={dataAlias === alias}
                    data={specletData}
                />
            )}
        </React.Fragment>
    );
}

function descriptionToDialogField(
    item: ChytCliqueOptionDescription,
    unipikaSettings: UnipikaSettings,
    allowEdit?: boolean,
): DialogField {
    const common = {
        name: item.name,
        caption: format.ReadableField(item.name),
        tooltip: item.description,
    };
    const extras = {disabled: !allowEdit};

    switch (item.type) {
        case 'string': {
            if (!item.choices?.length) {
                return {...common, type: 'text', extras};
            } else {
                console.warn('Use "select". Not implemented!');
                return {...common, type: 'text', extras};
            }
        }
        case 'bool':
            return {...common, type: 'tumbler', extras};
        case 'uint64':
            return {
                ...common,
                type: 'number',
                extras: {
                    ...extras,
                    hidePrettyValue: true,
                    placeholder:
                        item.default_value !== undefined ? String(item.default_value) : undefined,
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
                },
            };
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
    tumbler: makeConverter<boolean>(),
    text: makeConverter<string>(),
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

function ChytSpeclet({
    alias,
    data,
    allowEdit,
}: {
    allowEdit: boolean;
    alias: string;
    data: ChytCliqueSpecletState['data'];
}) {
    const dispatch = useThunkDispatch();
    const [error, setError] = React.useState<YTError | undefined>();

    const unipikaSettings = useSelector(getEditJsonYsonSettings);

    const {fields, initialValues, fieldTypeByName} = React.useMemo(() => {
        const currentValues: Record<string, any> = {};
        const typeByName: Record<
            string,
            {type: DialogField['type']; converter: ReturnType<typeof makeConverter>}
        > = {};
        return {
            fieldTypeByName: typeByName,
            initialValues: currentValues,
            fields: data?.map((group) => {
                const sectionFields: Array<DialogField> = group.options.map((item) => {
                    const res = descriptionToDialogField(item, unipikaSettings, allowEdit);

                    const {type} = res;
                    const converter = converterByType(type);
                    currentValues[item.name] = converter.toFieldValue(item.current_value);
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
    }, [data, allowEdit, unipikaSettings]);

    return (
        <React.Fragment>
            {error && <Error bottomMargin error={error} />}
            <YTDFDialog
                asLeftTopBlock
                visible
                modal={false}
                onAdd={(form) => {
                    const {values} = form.getState();
                    const diff = reduce_(
                        values as any,
                        (acc, value, key) => {
                            const oldValue = initialValues[key];
                            const {converter} = fieldTypeByName[key];
                            const oldV = converter.fromFieldValue(oldValue);
                            const v = converter.fromFieldValue(value, oldV);
                            if (v !== oldV) {
                                acc[key] = v;
                            }
                            return acc;
                        },
                        {} as Record<string, unknown>,
                    );
                    return dispatch(chytSetOptions(alias, diff))
                        .then(() => {
                            setError(undefined);
                        })
                        .catch((e: any) => setError(e));
                }}
                fields={fields ?? []}
                initialValues={initialValues}
            />
        </React.Fragment>
    );
}

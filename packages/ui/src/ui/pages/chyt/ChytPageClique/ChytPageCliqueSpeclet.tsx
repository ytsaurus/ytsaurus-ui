import React from 'react';
import {useDispatch, useSelector} from 'react-redux';
import reduce_ from 'lodash/reduce';

import format from '../../../common/hammer/format';

import Error from '../../../components/Error/Error';
import {DialogField, YTDFDialog} from '../../../components/Dialog/Dialog';

import {getChytCurrrentClique} from '../../../store/selectors/chyt';
import {
    getChytSpecletData,
    getChytSpecletDataAlias,
    getChytSpecletError,
} from '../../../store/selectors/chyt/speclet';
import {chytLoadCliqueSpeclet, chytSetOptions} from '../../../store/actions/chyt/speclet';
import {ChytCliqueSpecletState} from '../../../store/reducers/chyt/speclet';
import {useThunkDispatch} from '../../../store/thunkDispatch';
import {YTError} from '../../../../@types/types';

export function ChytPageCliqueSpeclet() {
    const dispatch = useDispatch();
    const alias = useSelector(getChytCurrrentClique);

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

function fieldType(optionType: 'string' | 'bool' | 'uint64' | 'yson') {
    switch (optionType) {
        case 'string':
            return 'text' as const;
        case 'bool':
            return 'tumbler' as const;
        case 'uint64':
            return 'number' as const;
        case 'yson':
            return 'json' as const;
        default:
            throw new Error(`Unexpected option type: ${optionType}`);
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

const CONVERTER = {
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
};

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

    const {fields, initialValues, fieldTypeByname} = React.useMemo(() => {
        const currentValues: Record<string, any> = {};
        const fieldTypeByname: Record<string, ReturnType<typeof fieldType>> = {};
        return {
            fieldTypeByname,
            initialValues: currentValues,
            fields: data?.map((group) => {
                const sectionFields: Array<DialogField> = group.options.map((item) => {
                    const type = (fieldTypeByname[item.name] = fieldType(item.type));
                    currentValues[item.name] = CONVERTER[type].toFieldValue(item.current_value);
                    fieldTypeByname[item.name] = fieldType(item.type);
                    const res = {
                        name: item.name,
                        type: fieldType(item.type),
                        caption: format.ReadableField(item.name),
                        tooltip: item.description,
                        fullWidth: type === 'json',
                    } as const;

                    const {extras} = Object.assign(res, {extras: {disabled: !allowEdit}});
                    if (type === 'number') {
                        Object.assign(extras, {hidePrettyValue: true});
                        if (item.default_value) {
                            Object.assign(extras, {placeholder: String(item.default_value)});
                        }
                    } else if (type === 'json') {
                        Object.assign(extras, {minHeight: 200});
                    }
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
    }, [data]);

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
                            const type = fieldTypeByname[key];
                            const oldV = CONVERTER[type].fromFieldValue(oldValue);
                            const v = CONVERTER[type].fromFieldValue(value, oldV);
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

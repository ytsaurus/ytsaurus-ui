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
            return 'text';
        case 'bool':
            return 'tumbler';
        case 'uint64':
            return 'number';
        case 'yson':
            return 'textarea';
        default:
            throw new Error(`Unexpected option type: ${optionType}`);
    }
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

    const {fields, initialValues, fieldTypeByname} = React.useMemo(() => {
        const currentValues: Record<string, any> = {};
        const fieldTypeByname: Record<string, DialogField['type']> = {};
        return {
            fieldTypeByname,
            initialValues: currentValues,
            fields: data?.map((group) => {
                const sectionFields: Array<DialogField> = group.options.map((item) => {
                    const type = (fieldTypeByname[item.name] = fieldType(item.type));
                    currentValues[item.name] =
                        type === 'number' ? {value: item.current_value} : item.current_value;
                    fieldTypeByname[item.name] = fieldType(item.type);
                    const res = {
                        name: item.name,
                        type: fieldType(item.type),
                        caption: format.ReadableField(item.name),
                        tooltip: item.description,
                        extras: {
                            disabled: !allowEdit,
                        },
                    } as const;
                    if (type === 'number') {
                        Object.assign(res.extras, {hidePrettyValue: true});
                        if (item.default_value) {
                            Object.assign(res.extras, {placeholder: String(item.default_value)});
                        }
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
                            const v = type === 'number' ? value.value : value;
                            const oldV = type === 'number' ? oldValue.value : oldValue;
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

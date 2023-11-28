import React from 'react';
import {useDispatch, useSelector} from 'react-redux';
import reduce_ from 'lodash/reduce';

import Error from '../../../components/Error/Error';
import {YTDFDialog} from '../../../components/Dialog/Dialog';
import {makeDialogFieldsFromDescription} from '../../../components/Dialog/df-dialog-utils';

import {getChytCurrentAlias} from '../../../store/selectors/chyt';
import {
    getChytSpecletData,
    getChytSpecletDataAlias,
    getChytSpecletError,
} from '../../../store/selectors/chyt/speclet';
import {getEditJsonYsonSettings} from '../../../store/selectors/thor/unipika';
import {chytLoadCliqueSpeclet, chytSetOptions} from '../../../store/actions/chyt/speclet';
import {ChytCliqueSpecletState} from '../../../store/reducers/chyt/speclet';
import {useThunkDispatch} from '../../../store/thunkDispatch';
import {YTError} from '../../../../@types/types';

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
            {!specletData ? null : <ChytSpeclet key={dataAlias} alias={alias} data={specletData} />}
        </React.Fragment>
    );
}

function ChytSpeclet({alias, data}: {alias: string; data: ChytCliqueSpecletState['data']}) {
    const dispatch = useThunkDispatch();
    const [error, setError] = React.useState<YTError | undefined>();

    const unipikaSettings = useSelector(getEditJsonYsonSettings);

    const {fields, initialValues, fieldTypeByName} = React.useMemo(() => {
        return makeDialogFieldsFromDescription(data ?? [], unipikaSettings, {allowEdit: false});
    }, [data, unipikaSettings]);

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
                footerProps={{hidden: true}}
            />
        </React.Fragment>
    );
}

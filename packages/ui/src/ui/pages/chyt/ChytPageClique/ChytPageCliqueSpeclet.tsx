import React from 'react';
import {useDispatch, useSelector} from 'react-redux';
import reduce_ from 'lodash/reduce';
import cn from 'bem-cn-lite';

import Button from '../../../components/Button/Button';
import Error from '../../../components/Error/Error';
import Icon from '../../../components/Icon/Icon';
import {YTDFDialog} from '../../../components/Dialog/Dialog';
import {UnipikaSettings} from '../../../components/Yson/StructuredYson/StructuredYsonTypes';
import {
    makeDialogFieldsFromDescription,
    makeTabbedDialogFieldsFromDescription,
} from '../../../components/Dialog/df-dialog-utils';

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

import './ChytPageCliqueSpeclet.scss';

const block = cn('yt-chyt-clique-speclet');

function useSpecletData() {
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
    const unipikaSettings = useSelector(getEditJsonYsonSettings);

    return {alias, specletData, dataAlias, error, unipikaSettings};
}

export function ChytPageCliqueSpeclet() {
    const {error, specletData, dataAlias, unipikaSettings} = useSpecletData();

    return (
        <React.Fragment>
            {error && <Error bottomMargin error={error} />}
            {!specletData ? null : (
                <React.Fragment>
                    <div className={block('edit')}>
                        <ChytSpecletEditButton />
                    </div>
                    <ChytSpeclet
                        key={dataAlias}
                        data={specletData}
                        unipikaSettings={unipikaSettings}
                    />
                </React.Fragment>
            )}
        </React.Fragment>
    );
}

function ChytSpeclet({
    data,
    unipikaSettings,
}: {
    unipikaSettings: UnipikaSettings;
    data: ChytCliqueSpecletState['data'];
}) {
    const {fields, initialValues} = React.useMemo(() => {
        return makeDialogFieldsFromDescription(data ?? [], {allowEdit: false, unipikaSettings});
    }, [data, unipikaSettings]);

    return (
        <div className={block()}>
            <YTDFDialog
                visible
                asLeftTopBlock
                onAdd={() => {
                    return Promise.resolve();
                }}
                fields={fields}
                initialValues={initialValues}
                footerProps={{hidden: true}}
            />
        </div>
    );
}

export function ChytSpecletEditButton() {
    const [visible, setVisible] = React.useState(false);

    const {error, specletData, dataAlias, alias, unipikaSettings} = useSpecletData();

    return (
        <React.Fragment>
            {error && <Error bottomMargin error={error} />}
            {!visible || !specletData ? null : (
                <ChytSpecletEditDialog
                    key={dataAlias}
                    data={specletData}
                    alias={alias}
                    unipikaSettings={unipikaSettings}
                    allowEdit={dataAlias === alias}
                    onClose={() => setVisible(false)}
                />
            )}
            <Button size="m" title={'Edit speclet'} onClick={() => setVisible(!visible)}>
                <Icon awesome={'pencil'} />
                Edit speclet
            </Button>
        </React.Fragment>
    );
}

function ChytSpecletEditDialog({
    alias,
    data,
    allowEdit,
    unipikaSettings,
    onClose,
}: {
    allowEdit: boolean;
    alias: string;
    data: ChytCliqueSpecletState['data'];
    unipikaSettings: UnipikaSettings;
    onClose: () => void;
}) {
    const dispatch = useThunkDispatch();
    const [error, setError] = React.useState<YTError | undefined>();

    const {fields, initialValues, fieldTypeByName} = React.useMemo(() => {
        return makeTabbedDialogFieldsFromDescription(data ?? [], {
            allowEdit,
            unipikaSettings,
        });
    }, [data, allowEdit, unipikaSettings]);

    return (
        <React.Fragment>
            {error && <Error bottomMargin error={error} />}
            <YTDFDialog
                visible
                onClose={onClose}
                onAdd={(form) => {
                    const {values: formValues} = form.getState();
                    const values = reduce_(
                        formValues,
                        (acc, tabValues) => {
                            return {...acc, ...tabValues};
                        },
                        {},
                    );
                    const initials = reduce_(
                        initialValues,
                        (acc, tabValues) => {
                            return {...acc, ...tabValues};
                        },
                        {},
                    );
                    const diff = reduce_(
                        values as any,
                        (acc, value, key) => {
                            const oldValue = initials[key as keyof typeof initials];
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
                    return diff
                        ? Promise.resolve(console.log(diff))
                        : dispatch(chytSetOptions(alias, diff))
                              .then(() => {
                                  setError(undefined);
                              })
                              .catch((e: any) => setError(e));
                }}
                fields={fields}
                initialValues={initialValues}
                headerProps={{title: `Edit ${alias}`}}
            />
        </React.Fragment>
    );
}

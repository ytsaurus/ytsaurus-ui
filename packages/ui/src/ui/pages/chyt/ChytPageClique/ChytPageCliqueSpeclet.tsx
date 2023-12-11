import React from 'react';
import {useDispatch, useSelector} from 'react-redux';
import reduce_ from 'lodash/reduce';
import cn from 'bem-cn-lite';

import Button from '../../../components/Button/Button';
import Error from '../../../components/Error/Error';
import Icon from '../../../components/Icon/Icon';
import {YTDFDialog} from '../../../components/Dialog/Dialog';
import Yson from '../../../components/Yson/Yson';
import {UnipikaSettings} from '../../../components/Yson/StructuredYson/StructuredYsonTypes';
import {makeTabbedDialogFieldsFromDescription} from '../../../components/Dialog/df-dialog-utils';

import {useUpdater} from '../../../hooks/use-updater';

import {getChytCurrentAlias} from '../../../store/selectors/chyt';
import {
    getChytSpecletData,
    getChytSpecletDataAlias,
    getChytSpecletError,
} from '../../../store/selectors/chyt/speclet';
import {getEditJsonYsonSettings} from '../../../store/selectors/thor/unipika';
import {chytApiAction} from '../../../store/actions/chyt/api';
import {chytLoadCliqueSpeclet, chytSetOptions} from '../../../store/actions/chyt/speclet';
import {ChytCliqueSpecletState} from '../../../store/reducers/chyt/speclet';
import {getCluster} from '../../../store/selectors/global';
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
    }, [alias, dispatch]);

    const specletData = useSelector(getChytSpecletData);
    const dataAlias = useSelector(getChytSpecletDataAlias);
    const error = useSelector(getChytSpecletError);
    const unipikaSettings = useSelector(getEditJsonYsonSettings);

    return {alias, specletData, dataAlias, error, unipikaSettings};
}

export function ChytPageCliqueSpeclet() {
    const {error, alias, specletData, unipikaSettings} = useSpecletData();

    return (
        <React.Fragment>
            {error && <Error bottomMargin error={error} />}
            {!specletData ? null : (
                <React.Fragment>
                    <div className={block('edit')}>
                        <ChytSpecletEditButton />
                    </div>
                    <ChytSpeclet alias={alias} unipikaSettings={unipikaSettings} />
                </React.Fragment>
            )}
        </React.Fragment>
    );
}

function ChytSpeclet({alias, unipikaSettings}: {alias: string; unipikaSettings: UnipikaSettings}) {
    const [data, setData] = React.useState<{
        loaded?: boolean;
        speclet?: unknown;
    }>({});
    const [error, setError] = React.useState<undefined | YTError>();
    const cluster = useSelector(getCluster);

    const update = React.useCallback(() => {
        if (alias) {
            chytApiAction('get_speclet', cluster, {alias})
                .then((res) => {
                    setData({loaded: true, speclet: res.result});
                    setError(undefined);
                })
                .catch((e) => {
                    setError(e);
                });
        }
    }, [alias, cluster]);

    useUpdater(update);

    return (
        <div className={block()}>
            {error && <Error className={block('raw-speclet-error')} error={error} bottomMargin />}
            {data.loaded && (
                <Yson
                    className={block('raw-speclet')}
                    value={data.speclet}
                    settings={unipikaSettings}
                    folding
                />
            )}
        </div>
    );
}

export function ChytSpecletEditButton({
    compact,
    className,
}: {
    compact?: boolean;
    className?: string;
}) {
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
            <Button
                size="m"
                view={compact ? 'normal' : undefined}
                className={className}
                title={'Edit speclet'}
                onClick={() => setVisible(!visible)}
            >
                <Icon awesome={'pencil'} />
                {!compact && 'Edit speclet'}
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
                size="l"
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

                    const {restart_on_speclet_change} = values as any;
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
                        {restart_on_speclet_change} as Record<string, unknown>,
                    );

                    if ('pool' in diff && !diff.pool) {
                        diff.pool = undefined;
                    }

                    return dispatch(chytSetOptions(alias, diff))
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

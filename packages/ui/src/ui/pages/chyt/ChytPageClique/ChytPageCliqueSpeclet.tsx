import React from 'react';
import {useDispatch, useSelector} from 'react-redux';
import reduce_ from 'lodash/reduce';
import cn from 'bem-cn-lite';

import Button from '../../../components/Button/Button';
import Error from '../../../components/Error/Error';
import Icon from '../../../components/Icon/Icon';
import {YTDFDialog} from '../../../components/Dialog';
import Yson from '../../../components/Yson/Yson';
import {UnipikaSettings} from '../../../components/Yson/StructuredYson/StructuredYsonTypes';
import {makeTabbedDialogFieldsFromDescription} from '../../../components/Dialog/df-dialog-utils';

import {useUpdater} from '../../../hooks/use-updater';

import {getChytCurrentAlias} from '../../../store/selectors/chyt';
import {
    getChytOptionsData,
    getChytOptionsDataAlias,
    getChytOptionsError,
} from '../../../store/selectors/chyt/options';
import {getEditJsonYsonSettings} from '../../../store/selectors/thor/unipika';
import {chytLoadCliqueSpeclet} from '../../../store/actions/chyt/speclet';
import {chytEditOptions, chytLoadCliqueOptions} from '../../../store/actions/chyt/options';
import {ChytCliqueOptionsState} from '../../../store/reducers/chyt/options';
import {
    getChytSpecletData,
    getChytSpecletDataAlias,
    getChytSpecletError,
    getChytSpecletLoaded,
} from '../../../store/selectors/chyt/speclet';
import {useThunkDispatch} from '../../../store/thunkDispatch';
import {YTError} from '../../../../@types/types';

import './ChytPageCliqueSpeclet.scss';

const block = cn('yt-chyt-clique-speclet');

function useSpecletData({
    showTooltipError,
    skipLoad,
}: {showTooltipError?: boolean; skipLoad?: boolean} = {}) {
    const dispatch = useDispatch();
    const alias = useSelector(getChytCurrentAlias);

    React.useMemo(() => {
        if (alias && !skipLoad) {
            dispatch(chytLoadCliqueOptions(alias, showTooltipError));
        }
    }, [alias, skipLoad, showTooltipError, dispatch]);

    const specletData = useSelector(getChytOptionsData);
    const dataAlias = useSelector(getChytOptionsDataAlias);
    const error = useSelector(getChytOptionsError);
    const unipikaSettings = useSelector(getEditJsonYsonSettings);

    return {alias, specletData, dataAlias, error, unipikaSettings};
}

export function ChytPageCliqueSpeclet() {
    const dispatch = useDispatch();
    const {error, alias, specletData, unipikaSettings} = useSpecletData({skipLoad: true});

    const update = React.useCallback(() => {
        if (alias) {
            dispatch(chytLoadCliqueSpeclet(alias));
        }
    }, [alias, dispatch]);

    useUpdater(update);

    return (
        <React.Fragment>
            {error && <Error bottomMargin error={error} />}
            {!specletData ? null : (
                <React.Fragment>
                    <div className={block('edit')}>
                        <ChytSpecletEditButton skipLoad />
                    </div>
                    <ChytSpeclet alias={alias} unipikaSettings={unipikaSettings} />
                </React.Fragment>
            )}
        </React.Fragment>
    );
}

function ChytSpeclet({alias, unipikaSettings}: {alias?: string; unipikaSettings: UnipikaSettings}) {
    const data = useSelector(getChytSpecletData);
    const error = useSelector(getChytSpecletError);
    const dataAlias = useSelector(getChytSpecletDataAlias);
    const loaded = useSelector(getChytSpecletLoaded);

    return dataAlias !== alias ? null : (
        <div className={block()}>
            {error && <Error className={block('raw-speclet-error')} error={error} bottomMargin />}
            {loaded && (
                <Yson
                    className={block('raw-speclet')}
                    value={data}
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
    skipLoad,
}: {
    compact?: boolean;
    className?: string;
    skipLoad?: boolean;
}) {
    const [visible, setVisible] = React.useState(false);

    const {specletData, dataAlias, alias, unipikaSettings} = useSpecletData({
        showTooltipError: true,
        skipLoad,
    });

    return (
        <React.Fragment>
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
                view={compact ? 'outlined' : undefined}
                className={className}
                title={'Edit speclet'}
                onClick={() => setVisible(!visible)}
                disabled={!specletData}
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
    data: ChytCliqueOptionsState['data'];
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
                className={block('dialog')}
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
                                if (v !== null && v !== undefined && v !== '') {
                                    acc[key] = v;
                                } else {
                                    acc[key] = undefined;
                                }
                            }
                            return acc;
                        },
                        {restart_on_speclet_change} as Record<string, unknown>,
                    );

                    return dispatch(chytEditOptions(alias, diff))
                        .then(() => {
                            setError(undefined);
                        })
                        .catch((e: any) => setError(e));
                }}
                fields={fields}
                initialValues={initialValues}
                headerProps={{
                    title: <span>Edit clique {alias}</span>,
                }}
            />
        </React.Fragment>
    );
}

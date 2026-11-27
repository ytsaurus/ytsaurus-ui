import React from 'react';
import {useClusterFromLocation} from '../../../hooks/use-cluster';
import cn from 'bem-cn-lite';

import {Text} from '@gravity-ui/uikit';

import format from '../../../common/hammer/format';

import {YTDFDialog, makeErrorFields} from '../../../containers/Dialog';
import {Bold} from '@ytsaurus/components';
import {type YTError} from '../../../types';
import {useDispatch} from '../../../store/redux-hooks';
import {chytListAction} from '../../../store/actions/chyt/list';

import './ChytConfirmation.scss';

import i18n from './i18n';

const block = cn('chyt-confirmation');

export type ChytConfirmationProps = {
    action: 'remove' | 'start' | 'stop' | 'restart';
    allowForceRestart?: boolean;
    alias: string;
    pool?: string;
    onClose: () => void;
    onAction?: (action: ChytConfirmationProps['action']) => void;
};

export function ChytConfirmation({
    action,
    alias,
    pool,
    allowForceRestart,
    onClose,
    onAction,
}: ChytConfirmationProps) {
    const onConfirm = () => {
        if (action) {
            onAction?.(action);
        }
    };
    switch (action) {
        case 'stop':
        case 'remove':
            return <ChytSimpleConfirmation {...{alias, action, onClose, onConfirm}} />;
        case 'restart':
            return <ChytRestartConfirmation {...{alias, allowForceRestart, onClose, onConfirm}} />;
        case 'start':
            return <ChytStartConfirmation {...{alias, onClose, onConfirm, pool}} />;
        default:
            return null;
    }
}

type ConfirmationProps = {
    alias: string;
    pool?: string;
    onClose: () => void;
    onConfirm: () => void;
};

function ChytSimpleConfirmation({
    alias,
    action,
    onClose,
    onConfirm,
}: ConfirmationProps & {action: 'remove' | 'stop'}) {
    const dispatch = useDispatch();
    const cluster = useClusterFromLocation();

    const [error, setError] = React.useState<YTError | undefined>();

    return (
        <YTDFDialog
            visible
            size="s"
            pristineSubmittable
            headerProps={{
                title: (
                    <>
                        {i18n(`title_${action}`)} {alias}
                    </>
                ),
            }}
            footerProps={{
                textApply: i18n(`action_${action}`),
            }}
            onAdd={() => {
                return dispatch(chytListAction(cluster, 'stop', {alias}))
                    .then(() => {
                        if (action === 'remove') {
                            return dispatch(chytListAction(cluster, 'remove', {alias}));
                        } else {
                            return null;
                        }
                    })
                    .then(() => {
                        onConfirm();
                        setError(undefined);
                    })
                    .catch((cause: any) => {
                        setError(cause);
                        throw cause;
                    });
            }}
            fields={[
                {
                    type: 'block',
                    name: 'text',
                    extras: {
                        children: <>{i18n('confirm_clique', {action, alias})}</>,
                    },
                },
                ...makeErrorFields([error]),
            ]}
            onClose={onClose}
        />
    );
}

function ChytRestartConfirmation({
    alias,
    allowForceRestart,
    onClose,
    onConfirm,
}: ConfirmationProps & {allowForceRestart?: boolean}) {
    const cluster = useClusterFromLocation();
    const dispatch = useDispatch();
    const [error, setError] = React.useState<YTError>();

    return (
        <YTDFDialog<{force?: boolean}>
            visible
            size="s"
            pristineSubmittable
            headerProps={{title: i18n('title_restart')}}
            footerProps={{textApply: i18n('action_restart')}}
            onClose={onClose}
            isApplyDisabled={(form) => Boolean(allowForceRestart && !form.values.force)}
            onAdd={(form) => {
                const force = allowForceRestart && form.getState().values.force;
                return dispatch(chytListAction(cluster, 'restart', {alias, ...(force && {force})}))
                    .then(onConfirm)
                    .catch((cause: YTError) => {
                        setError(cause);
                        throw cause;
                    });
            }}
            fields={[
                {
                    type: 'block',
                    name: 'text',
                    extras: {children: i18n('confirm_restart', {alias})},
                },
                ...(allowForceRestart
                    ? [
                          {
                              type: 'tumbler' as const,
                              name: 'force',
                              caption: i18n('field_force-restart'),
                              tooltip: i18n('context_force-restart'),
                          },
                      ]
                    : []),
                ...makeErrorFields([error]),
            ]}
        />
    );
}

type StartFormValues = {
    pool: string;
    untracked: boolean;
};

function ChytStartConfirmation({
    alias,
    onClose,
    pool,
    onConfirm,
}: Omit<ConfirmationProps, 'action'>) {
    const dispatch = useDispatch();
    const cluster = useClusterFromLocation();
    const [error, setError] = React.useState();

    return (
        <YTDFDialog<StartFormValues>
            visible
            size="s"
            className={block('start')}
            headerProps={{
                title: (
                    <>
                        {i18n('title_start')} <Bold>{alias}</Bold>
                    </>
                ),
            }}
            footerProps={{
                textApply: i18n('action_start'),
            }}
            onClose={onClose}
            initialValues={{pool}}
            onAdd={(form) => {
                const {untracked} = form.getState().values;
                return dispatch(chytListAction(cluster, 'start', {alias, untracked}))
                    .then(() => {
                        onConfirm();
                        setError(undefined);
                    })
                    .catch((cause: any) => {
                        setError(cause);
                        throw cause;
                    });
            }}
            isApplyDisabled={(state) => {
                const {pool: selectedPool, untracked} = state.values;

                return Boolean(!selectedPool && !untracked);
            }}
            fields={[
                {
                    type: 'plain',
                    name: 'pool',
                    caption: i18n('field_pool'),
                    extras: {
                        placeholder: format.NO_VALUE,
                    },
                },
                {
                    type: 'tumbler',
                    name: 'untracked',
                    tooltip: i18n('context_untracked'),
                    caption: i18n('field_untracked'),
                },
                {
                    type: 'block',
                    name: 'untrackedNotice',
                    visibilityCondition: {
                        when: 'untracked',
                        isActive: (v) => v,
                    },
                    extras: {
                        children: (
                            <Text color="warning" variant="body-2">
                                {i18n('alert_untracked-discouraged')}
                            </Text>
                        ),
                    },
                },
                ...makeErrorFields([error]),
            ]}
        />
    );
}

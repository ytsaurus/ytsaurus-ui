import React from 'react';

import format from '../../../common/hammer/format';

import {YTDFDialog, makeErrorFields} from '../../../components/Dialog/Dialog';
import {YTError} from '../../../types';
import {useThunkDispatch} from '../../../store/thunkDispatch';
import {chytListAction} from '../../../store/actions/chyt/list';
import {Text} from '@gravity-ui/uikit';

export type ChytConfirmationProps = {
    action: 'remove' | 'start' | 'stop';
    alias: string;
    pool?: string;
    onClose: () => void;
    onAction?: (action: ChytConfirmationProps['action']) => void;
};

export function ChytConfirmation({action, alias, pool, onClose, onAction}: ChytConfirmationProps) {
    const onConfirm = () => {
        if (action) {
            onAction?.(action);
        }
    };
    switch (action) {
        case 'stop':
        case 'remove':
            return <ChytSimpleConfirmation {...{alias, action, onClose, onConfirm}} />;
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
    const dispatch = useThunkDispatch();

    const [error, setError] = React.useState<YTError | undefined>();

    return (
        <YTDFDialog
            visible
            pristineSubmittable
            headerProps={{
                title: (
                    <>
                        {format.ReadableField(action)}{' '}
                        <Text variant="header-1" color="secondary">
                            {alias}
                        </Text>
                    </>
                ),
            }}
            footerProps={{textApply: `Yes, ${action} ${alias}`}}
            onAdd={() => {
                return dispatch(chytListAction('stop', {alias: alias}))
                    .then(() => {
                        if (action === 'remove') {
                            return dispatch(chytListAction('remove', {alias}));
                        } else {
                            return null;
                        }
                    })
                    .then(() => {
                        onConfirm();
                        setError(undefined);
                    })
                    .catch((error: any) => {
                        setError(error);
                        throw error;
                    });
            }}
            fields={[
                {
                    type: 'block',
                    name: 'text',
                    extras: {
                        children: `Are you sure you want to ${action} the clique '${alias}'?`,
                    },
                },
                ...makeErrorFields([error]),
            ]}
            onClose={onClose}
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
    const dispatch = useThunkDispatch();
    const [error, setError] = React.useState();

    return (
        <YTDFDialog<StartFormValues>
            visible
            headerProps={{
                title: (
                    <>
                        Start clique{' '}
                        <Text variant="header-1" color="secondary">
                            {alias}
                        </Text>
                    </>
                ),
            }}
            footerProps={{textApply: `Start clique '${alias}'`}}
            onClose={onClose}
            initialValues={{pool: pool ?? format.NO_VALUE}}
            onAdd={(form) => {
                const {untracked} = form.getState().values;
                return dispatch(chytListAction('start', {alias, untracked}))
                    .then(() => {
                        onConfirm();
                        setError(undefined);
                    })
                    .catch((error: any) => {
                        setError(error);
                        throw error;
                    });
            }}
            isApplyDisabled={(state) => {
                const {
                    values: {pool, untracked},
                } = state;
                return Boolean(!pool && !untracked);
            }}
            fields={[
                {
                    type: 'plain',
                    name: 'pool',
                    caption: 'Pool',
                },
                {
                    type: 'block',
                    name: 'poolNotice',
                    visibilityCondition: {
                        when: 'pool',
                        isActive: (v) => !v,
                    },
                    extras: ({pool, untracked}: StartFormValues) => {
                        return {
                            children:
                                !pool && !untracked ? (
                                    <Text color="warning">
                                        Pool is not set. Clique without a pool can be started only
                                        in untracked mode. Set the pool in speclet options to start
                                        the clique in normal mode.
                                    </Text>
                                ) : null,
                        };
                    },
                },
                {
                    type: 'tumbler',
                    name: 'untracked',
                    caption: 'Untracked',
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
                            <Text color="warning">
                                {`YT Operation for a clique in untracked mode is started using the
                                    current user's credentials in the user's default pool. Such
                                    clique is not tracked by the controller and will not be restarted in
                                    case of any failures or speclet updates. Usage of untracked cliques
                                    is strictly discouraged.`}
                            </Text>
                        ),
                    },
                },
                {
                    type: 'block',
                    name: 'validationError',
                },
                ...makeErrorFields([error]),
            ]}
        />
    );
}

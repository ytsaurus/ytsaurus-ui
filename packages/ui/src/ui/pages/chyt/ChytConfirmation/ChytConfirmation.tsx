import React from 'react';

import {YTDFDialog, makeErrorFields} from '../../../components/Dialog/Dialog';
import {YTError} from '../../../types';
import {useThunkDispatch} from '../../../store/thunkDispatch';
import {chytListAction} from '../../../store/actions/chyt/list';
import {getCluster} from '../../../store/selectors/global';
import {chytApiAction} from '../../../store/actions/chyt/api';
import {Text} from '@gravity-ui/uikit';
import {useSelector} from 'react-redux';

export function ChytConfirmation({
    action,
    alias,
    onClose,
    onAction,
}: {
    action?: 'remove' | 'start';
    alias: string;
    onClose: () => void;
    onAction?: (action: 'remove' | 'start') => void;
}) {
    const onConfirm = () => {
        if (action) {
            onAction?.(action);
        }
    };
    switch (action) {
        case 'remove':
            return <ChytDeleteConfirmation {...{alias, onClose, onConfirm}} />;
        case 'start':
            return <ChytStartConfirmation {...{alias, onClose, onConfirm}} />;
        default:
            return null;
    }
}

type ConfirmationProps = {alias: string; onClose: () => void; onConfirm: () => void};

function ChytDeleteConfirmation({alias, onClose, onConfirm}: ConfirmationProps) {
    const dispatch = useThunkDispatch();

    const [error, setError] = React.useState<YTError | undefined>();

    return (
        <YTDFDialog
            visible
            pristineSubmittable
            headerProps={{title: `Remove '${alias}'`}}
            footerProps={{textApply: `Yes, remove '${alias}'`}}
            onAdd={() => {
                return dispatch(chytListAction('stop', {alias}))
                    .then(() => {
                        return dispatch(chytListAction('remove', {alias}));
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
                        children: `You are sure you want to remove clique '${alias}'?`,
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

function ChytStartConfirmation({alias, onClose, onConfirm}: ConfirmationProps) {
    const dispatch = useThunkDispatch();
    const [error, setError] = React.useState();
    const [poolData, setPool] = React.useState<{pool?: string; loaded: boolean} | undefined>();
    const cluster = useSelector(getCluster);

    React.useEffect(() => {
        chytApiAction('get_brief_info', cluster, {alias}).then(({result}) => {
            setPool({pool: result.pool, loaded: true});
        });
    }, [alias, cluster]);

    return !poolData?.loaded ? null : (
        <YTDFDialog<StartFormValues>
            visible
            headerProps={{title: `Start '${alias}'`}}
            footerProps={{textApply: `Start '${alias}'`}}
            onClose={onClose}
            //            initialValues={{pool: poolData?.pool}}
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
                    type: 'pool',
                    name: 'pool',
                    caption: 'Pool',
                    extras: {
                        disabled: true,
                    },
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

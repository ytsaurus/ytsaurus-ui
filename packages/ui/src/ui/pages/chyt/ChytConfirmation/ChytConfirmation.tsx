import React from 'react';
import cn from 'bem-cn-lite';
import capitalize_ from 'lodash/capitalize';

import {Text} from '@gravity-ui/uikit';

import format from '../../../common/hammer/format';

import {YTDFDialog, makeErrorFields} from '../../../components/Dialog';
import {Bold} from '../../../components/Text/Text';
import {YTError} from '../../../types';
import {useThunkDispatch} from '../../../store/thunkDispatch';
import {chytListAction} from '../../../store/actions/chyt/list';

import './ChytConfirmation.scss';

const block = cn('chyt-confirmation');

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
            size="s"
            pristineSubmittable
            headerProps={{
                title: (
                    <>
                        {format.ReadableField(action)} {alias}
                    </>
                ),
            }}
            footerProps={{
                textApply: capitalize_(action),
            }}
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
                        children: (
                            <>
                                Are you sure you want to {action} the clique <Bold>{alias}</Bold>?
                            </>
                        ),
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
            size="s"
            className={block('start')}
            headerProps={{
                title: (
                    <>
                        Start clique <Bold>{alias}</Bold>
                    </>
                ),
            }}
            footerProps={{
                textApply: 'Start',
            }}
            onClose={onClose}
            initialValues={{pool: pool}}
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
                    extras: {
                        placeholder: format.NO_VALUE,
                    },
                },
                {
                    type: 'tumbler',
                    name: 'untracked',
                    tooltip:
                        "YT Operation for a clique in untracked mode is started using the current user's credentials in the user's default pool. Such clique is not tracked by the controller and will not be restarted in case of any failures or speclet updates.",
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
                            <Text color="warning" variant="body-2">
                                {`Usage of untracked cliques is strictly discouraged.`}
                            </Text>
                        ),
                    },
                },
                ...makeErrorFields([error]),
            ]}
        />
    );
}

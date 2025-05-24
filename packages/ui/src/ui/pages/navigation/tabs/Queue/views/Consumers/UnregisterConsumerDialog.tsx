import React from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {Text} from '@gravity-ui/uikit';

import {
    closeUnregisterDialog,
    getConsumerPath,
    getUnregisterDialogVisibility,
} from '../../../../../../store/reducers/navigation/tabs/queue/consumers';
import {useUnregisterConsumerMutation} from '../../../../../../store/api/navigation/tabs/queue/queue';

import {YTDFDialog, makeErrorFields} from '../../../../../../components/Dialog';
import {YTError} from '../../../../../../../@types/types';

export function UnregisterConsumerDialog() {
    const dispatch = useDispatch();
    const visible = useSelector(getUnregisterDialogVisibility);
    const consumerPath = useSelector(getConsumerPath);

    const onClose = () => dispatch(closeUnregisterDialog());

    const [update, {isLoading, error}] = useUnregisterConsumerMutation();

    return (
        <YTDFDialog
            visible={visible}
            headerProps={{title: 'Unregister consumer'}}
            fields={[
                {
                    name: 'delete',
                    type: 'block',
                    extras: {
                        children: (
                            <Text variant={'body-2'}>
                                Are you shure you want to unregister consumer?
                            </Text>
                        ),
                    },
                },
                ...makeErrorFields([error as YTError]),
            ]}
            onAdd={async () => {
                if (consumerPath) {
                    await update({consumerPath}).unwrap();
                }
            }}
            isApplyDisabled={(state) => {
                return state.hasValidationErrors || isLoading;
            }}
            onClose={onClose}
        />
    );
}

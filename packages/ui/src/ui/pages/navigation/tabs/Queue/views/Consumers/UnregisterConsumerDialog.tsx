import React from 'react';
import {useDispatch, useSelector} from '../../../../../../store/redux-hooks';
import {Text} from '@gravity-ui/uikit';

import {
    closeUnregisterDialog,
    getConsumerPath,
    getUnregisterDialogVisibility,
} from '../../../../../../store/reducers/navigation/tabs/queue/consumers';
import {useUnregisterConsumerMutation} from '../../../../../../store/api/navigation/tabs/queue/queue';

import {YTDFDialog, makeErrorFields} from '../../../../../../containers/Dialog';
import {type YTError} from '../../../../../../../@types/types';
import i18n from './i18n';

export function UnregisterConsumerDialog() {
    const dispatch = useDispatch();
    const visible = useSelector(getUnregisterDialogVisibility);
    const consumerPath = useSelector(getConsumerPath);

    const onClose = () => dispatch(closeUnregisterDialog());

    const [update, {isLoading, error}] = useUnregisterConsumerMutation();

    return (
        <YTDFDialog
            visible={visible}
            headerProps={{title: i18n('title_unregister-consumer')}}
            fields={[
                {
                    name: 'delete',
                    type: 'block',
                    extras: {
                        children: (
                            <Text variant={'body-2'}>{i18n('confirm_unregister-consumer')}</Text>
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

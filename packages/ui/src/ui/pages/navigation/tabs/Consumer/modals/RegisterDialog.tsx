import React from 'react';
import {useDispatch, useSelector} from 'react-redux';

import {
    getRegisterDialogVisibility,
    toggleRegisterDialog,
} from '../../../../../store/reducers/navigation/tabs/consumer/register';
import {useRegisterMutation} from '../../../../../store/api/navigation/tabs/consumer/consumer';

import {FormApi, YTDFDialog, makeErrorFields} from '../../../../../components/Dialog';

import {YT} from '../../../../../config/yt-config';

import {YTError} from '../../../../../../@types/types';

type FormValues = {
    queuePath: string;
    queueCluster: string;
};

export function RegisterConsumerDialog() {
    const dispatch = useDispatch();
    const visible = useSelector(getRegisterDialogVisibility);

    const onClose = () => dispatch(toggleRegisterDialog());

    const [update, {isLoading, error}] = useRegisterMutation();

    const clusterControlOptions = Object.keys(YT.clusters).map((cluster) => ({
        value: cluster,
        content: cluster,
    }));

    return (
        <YTDFDialog
            visible={visible}
            headerProps={{title: 'Register consumer to queue'}}
            fields={[
                {
                    type: 'select' as const,
                    name: 'queueCluster',
                    caption: 'Cluster',
                    extras: {
                        options: clusterControlOptions,
                        placeholder: 'Cluster',
                        width: 'max',
                        filterable: true,
                    },
                },
                {
                    type: 'text' as const,
                    name: 'queuePath',
                    caption: 'Path',
                    extras: {
                        placeholder: 'Path to queue...',
                    },
                },
                ...makeErrorFields([error as YTError]),
            ]}
            size={'m'}
            onAdd={async (form: FormApi<FormValues>) => {
                const {values} = form.getState();
                const newValues = {...values, queueCluster: values.queueCluster[0]};
                await update(newValues).unwrap();
            }}
            isApplyDisabled={(state) => {
                return state.hasValidationErrors || isLoading;
            }}
            onClose={onClose}
        />
    );
}

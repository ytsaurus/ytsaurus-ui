import React, {useMemo} from 'react';
import {useDispatch, useSelector} from 'react-redux';

import {
    getRegisterDialogVisibility,
    toggleRegisterDialog,
} from '../../../../../store/reducers/navigation/tabs/consumer/register';
import {useRegisterMutation} from '../../../../../store/api/navigation/tabs/consumer/consumer';
import {getCluster} from '../../../../../store/selectors/global';

import {FormApi, YTDFDialog, makeErrorFields} from '../../../../../components/Dialog';

import {makeClusterSelectOptionsSameEnv} from '../../../../../utils/navigation/tabs/make-cluster-select-options-same-env';

import {YTError} from '../../../../../../@types/types';

type FormValues = {
    queuePath: string;
    queueCluster: string;
};

export function RegisterConsumerDialog() {
    const dispatch = useDispatch();
    const visible = useSelector(getRegisterDialogVisibility);
    const cluster = useSelector(getCluster);

    const onClose = () => dispatch(toggleRegisterDialog());

    const [update, {isLoading, error}] = useRegisterMutation();

    const clusterControlOptions = useMemo(
        () => makeClusterSelectOptionsSameEnv(cluster),
        [cluster],
    );

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
                    required: true,
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

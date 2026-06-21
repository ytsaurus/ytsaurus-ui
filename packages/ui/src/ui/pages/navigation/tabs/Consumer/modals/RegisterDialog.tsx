import React, {useMemo} from 'react';
import {useDispatch, useSelector} from '../../../../../store/redux-hooks';

import {
    getRegisterDialogVisibility,
    toggleRegisterDialog,
} from '../../../../../store/reducers/navigation/tabs/consumer/register';
import {useRegisterMutation} from '../../../../../store/api/navigation/tabs/consumer/consumer';
import {selectCluster} from '../../../../../store/selectors/global';

import {type FormApi, YTDFDialog, makeErrorFields} from '../../../../../containers/Dialog';

import {makeClusterSelectOptionsSameEnv} from '../../../../../utils/navigation/tabs/make-cluster-select-options-same-env';

import {type YTError} from '../../../../../../@types/types';

import i18n from './i18n';

type FormValues = {
    queuePath: string;
    queueCluster: string;
};

export function RegisterConsumerDialog() {
    const dispatch = useDispatch();
    const visible = useSelector(getRegisterDialogVisibility);
    const cluster = useSelector(selectCluster);

    const onClose = () => dispatch(toggleRegisterDialog());

    const [update, {isLoading, error}] = useRegisterMutation();

    const clusterControlOptions = useMemo(
        () => makeClusterSelectOptionsSameEnv(cluster),
        [cluster],
    );

    return (
        <YTDFDialog
            visible={visible}
            headerProps={{title: i18n('title_register-consumer-to-queue')}}
            fields={[
                {
                    type: 'select' as const,
                    name: 'queueCluster',
                    caption: i18n('field_cluster'),
                    extras: {
                        options: clusterControlOptions,
                        placeholder: i18n('field_cluster'),
                        width: 'max',
                        filterable: true,
                    },
                },
                {
                    type: 'text' as const,
                    name: 'queuePath',
                    caption: i18n('field_path'),
                    required: true,
                    extras: {
                        placeholder: i18n('field_path-to-queue'),
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

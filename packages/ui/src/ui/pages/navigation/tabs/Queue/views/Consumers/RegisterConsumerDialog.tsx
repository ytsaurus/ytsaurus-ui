import React, {useMemo} from 'react';
import {useDispatch, useSelector} from 'react-redux';

import {
    getRegisterDialogVisibility,
    toggleRegisterDialog,
} from '../../../../../../store/reducers/navigation/tabs/queue/consumers';
import {useRegisterConsumerMutation} from '../../../../../../store/api/navigation/tabs/queue/queue';
import {getCluster} from '../../../../../../store/selectors/global';

import {FormApi, YTDFDialog, makeErrorFields} from '../../../../../../components/Dialog';

import {docsUrl} from '../../../../../../config';
import UIFactory from '../../../../../../UIFactory';
import {makeLink} from '../../../../../../utils/utils';
import {makeClusterSelectOptionsSameEnv} from '../../../../../../utils/navigation/tabs/make-cluster-select-options-same-env';

import {YTError} from '../../../../../../../@types/types';

type FormValues = {
    consumerPath: string;
    consumerCluster: string[];
    vital: boolean;
};

export function RegisterConsumerDialog() {
    const dispatch = useDispatch();
    const visible = useSelector(getRegisterDialogVisibility);
    const cluster = useSelector(getCluster);

    const onClose = () => dispatch(toggleRegisterDialog());

    const [update, {isLoading, error}] = useRegisterConsumerMutation();

    const clusterControlOptions = useMemo(
        () => makeClusterSelectOptionsSameEnv(cluster),
        [cluster],
    );

    return (
        <YTDFDialog
            visible={visible}
            headerProps={{title: 'Register consumer'}}
            fields={[
                {
                    type: 'select' as const,
                    name: 'consumerCluster',
                    caption: 'Cluster',
                    initialValue: [cluster],
                    extras: {
                        options: clusterControlOptions,
                        placeholder: 'Cluster',
                        width: 'max',
                        filterable: true,
                    },
                },
                {
                    type: 'text' as const,
                    name: 'consumerPath',
                    caption: 'Path',
                    required: true,
                    extras: {
                        placeholder: 'Path to consumer node...',
                    },
                },
                {
                    type: 'tumbler' as const,
                    name: 'vital',
                    caption: 'Vital',
                    tooltip: (
                        <div>
                            {docsUrl(
                                makeLink(
                                    UIFactory.docsUrls['dynamic-tables:queues#creating-a-consumer'],
                                    'Docs',
                                ),
                            )}
                        </div>
                    ),
                },
                ...makeErrorFields([error as YTError]),
            ]}
            size={'m'}
            onAdd={async (form: FormApi<FormValues>) => {
                const {values} = form.getState();
                const preparedValues = {...values, consumerCluster: values.consumerCluster[0]};
                await update(preparedValues).unwrap();
            }}
            isApplyDisabled={(state) => {
                return state.hasValidationErrors || isLoading;
            }}
            onClose={onClose}
        />
    );
}

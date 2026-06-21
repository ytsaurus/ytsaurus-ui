import React, {useMemo} from 'react';
import {useDispatch, useSelector} from '../../../../../../store/redux-hooks';

import {
    getRegisterDialogVisibility,
    toggleRegisterDialog,
} from '../../../../../../store/reducers/navigation/tabs/queue/consumers';
import {useRegisterConsumerMutation} from '../../../../../../store/api/navigation/tabs/queue/queue';
import {selectCluster} from '../../../../../../store/selectors/global';

import {type FormApi, YTDFDialog, makeErrorFields} from '../../../../../../containers/Dialog';

import {docsUrl} from '../../../../../../config';
import UIFactory from '../../../../../../UIFactory';
import {makeLink} from '../../../../../../utils/utils';
import {makeClusterSelectOptionsSameEnv} from '../../../../../../utils/navigation/tabs/make-cluster-select-options-same-env';

import i18n from './i18n';

import {type YTError} from '../../../../../../../@types/types';

type FormValues = {
    consumerPath: string;
    consumerCluster: string[];
    vital: boolean;
};

export function RegisterConsumerDialog() {
    const dispatch = useDispatch();
    const visible = useSelector(getRegisterDialogVisibility);
    const cluster = useSelector(selectCluster);

    const onClose = () => dispatch(toggleRegisterDialog());

    const [update, {isLoading, error}] = useRegisterConsumerMutation();

    const clusterControlOptions = useMemo(
        () => makeClusterSelectOptionsSameEnv(cluster),
        [cluster],
    );

    return (
        <YTDFDialog
            visible={visible}
            headerProps={{title: i18n('action_register-consumer')}}
            fields={[
                {
                    type: 'select' as const,
                    name: 'consumerCluster',
                    caption: i18n('field_cluster'),
                    initialValue: [cluster],
                    extras: {
                        options: clusterControlOptions,
                        placeholder: i18n('field_cluster'),
                        width: 'max',
                        filterable: true,
                    },
                },
                {
                    type: 'text' as const,
                    name: 'consumerPath',
                    caption: i18n('field_path'),
                    required: true,
                    extras: {
                        placeholder: i18n('context_consumer-path-placeholder'),
                    },
                },
                {
                    type: 'tumbler' as const,
                    name: 'vital',
                    caption: i18n('field_vital'),
                    tooltip: (
                        <div>
                            {docsUrl(
                                makeLink(
                                    UIFactory.docsUrls['dynamic-tables:queues#creating-a-consumer'],
                                    i18n('action_docs'),
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

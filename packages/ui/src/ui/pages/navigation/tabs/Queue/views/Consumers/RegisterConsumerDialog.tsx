import React from 'react';
import {useDispatch, useSelector} from 'react-redux';

import {
    getRegisterDialogVisibility,
    toggleRegisterDialog,
} from '../../../../../../store/reducers/navigation/tabs/queue/consumers';
import {useRegisterConsumerMutation} from '../../../../../../store/api/navigation/tabs/queue/queue';

import {FormApi, YTDFDialog, makeErrorFields} from '../../../../../../components/Dialog';

import {docsUrl} from '../../../../../../config';
import UIFactory from '../../../../../../UIFactory';
import {makeLink} from '../../../../../../utils/utils';
import {YT} from '../../../../../../config/yt-config';

import {YTError} from '../../../../../../../@types/types';

type FormValues = {
    consumerPath: string;
    vital: boolean;
};

export function RegisterConsumerDialog() {
    const dispatch = useDispatch();
    const visible = useSelector(getRegisterDialogVisibility);

    const onClose = () => dispatch(toggleRegisterDialog());

    const [update, {isLoading, error}] = useRegisterConsumerMutation();

    const clusterControlOptions = Object.keys(YT.clusters).map((cluster) => ({
        value: cluster,
        content: cluster,
    }));

    return (
        <YTDFDialog
            visible={visible}
            headerProps={{title: 'Register consumer'}}
            fields={[
                {
                    type: 'select' as const,
                    name: 'cluster',
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
                    name: 'consumerPath',
                    caption: 'Path',
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
                await update(values).unwrap();
            }}
            isApplyDisabled={(state) => {
                return state.hasValidationErrors || isLoading;
            }}
            onClose={onClose}
        />
    );
}

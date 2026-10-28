import React from 'react';
import {useDispatch, useSelector} from '../../../../../../store/redux-hooks';

import {
    getCreateDialogVisibility,
    toggleCreateDialog,
} from '../../../../../../store/reducers/navigation/tabs/queue/consumers';
import {useCreateConsumerMutation} from '../../../../../../store/api/navigation/tabs/queue/queue';

import {type FormApi, YTDFDialog, makeErrorFields} from '../../../../../../containers/Dialog';

import {docsUrl} from '../../../../../../config';
import UIFactory from '../../../../../../UIFactory';
import {makeLink} from '../../../../../../utils/utils';

import {type YTError} from '../../../../../../../@types/types';

import {validateCreateConsumerPath} from './utils';
import i18n from './i18n';

export type CreateConsumerFormValues = {
    consumerPath: string;
    multiConsumer?: boolean;
    consumerName?: string;
} & (
    | {
          register?: false | undefined;
          vital?: boolean;
      }
    | {
          register: true;
          vital: boolean;
      }
);

export function CreateConsumerDialog() {
    const dispatch = useDispatch();
    const visible = useSelector(getCreateDialogVisibility);

    const [update, {isLoading, error}] = useCreateConsumerMutation();

    const onClose = () => dispatch(toggleCreateDialog());

    return (
        <YTDFDialog<CreateConsumerFormValues>
            visible={visible}
            fields={[
                {
                    type: 'path' as const,
                    name: 'consumerPath',
                    caption: i18n('field_path'),
                    required: true,
                    validator: validateCreateConsumerPath,
                    extras: {
                        placeholder: i18n('context_consumer-path-placeholder'),
                    },
                },
                {
                    type: 'tumbler' as const,
                    name: 'multiConsumer',
                    caption: i18n('field_multi-consumer'),
                    initialValue: false,
                },
                {
                    type: 'tumbler' as const,
                    name: 'register',
                    caption: i18n('action_register-consumer'),
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
                    visibilityCondition: {
                        when: 'register',
                        isActive: (v) => Boolean(v),
                    },
                },
                {
                    type: 'text' as const,
                    name: 'consumerName',
                    caption: i18n('field_consumer-name'),
                    extras: {
                        placeholder: i18n('context_consumer-name-placeholder'),
                    },
                    visibilityCondition: {
                        when: ['multiConsumer', 'register'],
                        isActive: (multiConsumer, register) => Boolean(multiConsumer && register),
                    },
                },
                ...makeErrorFields([error as YTError]),
            ]}
            headerProps={{title: i18n('action_create-consumer')}}
            size={'m'}
            onAdd={async (form: FormApi<CreateConsumerFormValues>) => {
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

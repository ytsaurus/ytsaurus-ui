import React from 'react';
import {useDispatch, useSelector} from '../../../../../../store/redux-hooks';

import {
    getCreateDialogVisibility,
    toggleCreateDialog,
} from '../../../../../../store/reducers/navigation/tabs/queue/consumers';
import {useCreateConsumerMutation} from '../../../../../../store/api/navigation/tabs/queue/queue';

import {FormApi, YTDFDialog, makeErrorFields} from '../../../../../../components/Dialog';

import {docsUrl} from '../../../../../../config';
import UIFactory from '../../../../../../UIFactory';
import {makeLink} from '../../../../../../utils/utils';

import {YTError} from '../../../../../../../@types/types';

import {validateCreateConsumerPath} from './utils';

export type CreateConsumerFormValues = {
    consumerPath: string;
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
                    caption: 'Path',
                    required: true,
                    validator: validateCreateConsumerPath,
                    extras: {
                        placeholder: 'Path to consumer node...',
                    },
                },
                {
                    type: 'tumbler' as const,
                    name: 'register',
                    caption: 'Register consumer',
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
                    visibilityCondition: {
                        when: 'register',
                        isActive: (v) => Boolean(v),
                    },
                },
                ...makeErrorFields([error as YTError]),
            ]}
            headerProps={{title: 'Create consumer'}}
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

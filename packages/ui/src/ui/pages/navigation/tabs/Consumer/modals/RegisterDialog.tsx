import React from 'react';
import {useDispatch, useSelector} from 'react-redux';

import {
    getRegisterDialogVisibility,
    toggleRegisterDialog,
} from '../../../../../store/reducers/navigation/tabs/consumer/register';
import {useRegisterMutation} from '../../../../../store/api/navigation/tabs/consumer/consumer';

import {FormApi, YTDFDialog, makeErrorFields} from '../../../../../components/Dialog';

import {validatePathExistance} from '../../../../../utils/validators/validate-path-existance';

import {YTError} from '../../../../../../@types/types';

type FormValues = {
    queuePath: string;
};

export function RegisterConsumerDialog() {
    const dispatch = useDispatch();
    const visible = useSelector(getRegisterDialogVisibility);

    const onClose = () => dispatch(toggleRegisterDialog());

    const [update, {isLoading, error}] = useRegisterMutation();

    return (
        <YTDFDialog
            visible={visible}
            headerProps={{title: 'Register consumer to queue'}}
            fields={[
                {
                    type: 'path' as const,
                    name: 'queuePath',
                    caption: 'Path',
                    validator: validatePathExistance,
                    extras: {
                        placeholder: 'Path to queue...',
                    },
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

import React, {useMemo, useState} from 'react';
import {YTDFDialog, makeErrorFields} from '../../../components/Dialog';
import {AclRowGroup} from '../../../utils/acl/acl-types';
import includes_ from 'lodash/includes';

export interface Props {
    title: string;
    confirmText: string;
    handleClose: () => void;
    handleSubmit: (value: Partial<AclRowGroup>) => Promise<void>;
    initialData?: Partial<AclRowGroup>;
    disabledFields?: Array<keyof FormValues>;
    visible: boolean;
    mode?: 'delete';
}

interface FormValues {
    name: string;
    predicate: string;
    enabled: boolean;
}

export function EditRowGroupModal({
    visible,
    title,
    confirmText,
    handleClose,
    handleSubmit,
    initialData,
    disabledFields = [],
    mode,
}: Props) {
    const [error, setError] = useState(undefined);

    const initialValues = useMemo(() => {
        return {
            name: String(initialData?.name),
            predicate: initialData?.predicate,
            enabled: Boolean(initialData?.enabled),
        };
    }, [initialData]);

    return (
        <YTDFDialog<FormValues>
            pristineSubmittable={mode === 'delete'}
            visible={visible}
            modal={true}
            headerProps={{title}}
            footerProps={{textApply: confirmText}}
            onClose={() => {
                setError(undefined);
                handleClose();
            }}
            onAdd={(form) => {
                const {name, predicate, enabled} = form.getState().values;
                const submitResult: Partial<AclRowGroup> = {
                    name: name,
                    predicate,
                    enabled: enabled,
                };
                return handleSubmit(submitResult).catch((err) => {
                    setError(err);
                    throw err;
                });
            }}
            initialValues={initialValues}
            fields={[
                {
                    name: 'name',
                    type: 'text',
                    required: true,
                    caption: 'Name',
                    extras: {
                        placeholder: 'Row group name',
                        disabled: includes_(disabledFields, 'name'),
                    },
                },
                {
                    name: 'predicate',
                    type: 'textarea',
                    required: true,
                    caption: 'Rows',
                    extras: {
                        disabled: includes_(disabledFields, 'predicate'),
                    },
                },
                {
                    name: 'enabled',
                    type: 'tumbler',
                    caption: 'Enabled',
                    extras: {
                        disabled: includes_(disabledFields, 'enabled'),
                    },
                },
                ...makeErrorFields([error]),
            ]}
        />
    );
}

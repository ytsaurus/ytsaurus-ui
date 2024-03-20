import React, {useMemo, useState} from 'react';
import {YTDFDialog, makeErrorFields} from '../../../components/Dialog/Dialog';
import {AclColumnGroup} from '../../../utils/acl/acl-types';
import _ from 'lodash';

export interface Props {
    title: string;
    confirmText: string;
    handleClose: () => void;
    handleSubmit: (value: Partial<AclColumnGroup>) => Promise<void>;
    initialData?: Partial<AclColumnGroup>;
    disabledFields?: Array<keyof FormValues>;
    visible: boolean;
}

interface FormValues {
    name: string;
    columns: Array<{name: string}>;
    enabled: boolean;
}

export default function EditColumnGroupModal({
    visible,
    title,
    confirmText,
    handleClose,
    handleSubmit,
    initialData,
    disabledFields = [],
}: Props) {
    const [error, setError] = useState(undefined);

    const initialValues = useMemo(() => {
        return {
            name: String(initialData?.name),
            columns: _.map(initialData?.columns, (name) => ({name})),
            enabled: Boolean(initialData?.enabled),
        };
    }, [initialData]);

    return (
        <YTDFDialog<FormValues>
            pristineSubmittable
            visible={visible}
            modal={true}
            headerProps={{title}}
            footerProps={{textApply: confirmText}}
            onClose={() => {
                setError(undefined);
                handleClose();
            }}
            onAdd={(form) => {
                const {name, columns, enabled} = form.getState().values;
                const submitResult: Partial<AclColumnGroup> = {
                    name: name,
                    columns: _.map(columns, (el) => el.name),
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
                        placeholder: 'column group name',
                        disabled: _.includes(disabledFields, 'name'),
                    },
                },
                {
                    name: 'columns',
                    type: 'multi-text',
                    required: true,
                    caption: 'Columns',
                    extras: {
                        disabled: _.includes(disabledFields, 'columns'),
                    },
                },
                {
                    name: 'enabled',
                    type: 'tumbler',
                    caption: 'Enabled',
                    extras: {
                        disabled: _.includes(disabledFields, 'enabled'),
                    },
                },
                ...makeErrorFields([error]),
            ]}
        />
    );
}

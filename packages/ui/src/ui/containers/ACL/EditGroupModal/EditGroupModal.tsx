import includes_ from 'lodash/includes';
import React from 'react';
import {YTDFDialog, makeErrorFields} from '../../../components/Dialog';
import HelpLink from '../../../components/HelpLink/HelpLink';
import {useMemoizedIfEqual} from '../../../hooks';
import UIFactory from '../../../UIFactory';
import i18n from './i18n';

export function useEditColumnRowGroupModal({groupType}: {groupType: 'column' | 'row'}) {
    const handleClose = () => {
        setModalProps((prevProps) => ({
            ...prevProps,
            visible: false,
        }));
    };

    const [modalProps, setModalProps] = React.useState<EditGroupModalProps>({
        title: '',
        confirmText: '',
        disabledFields: [],
        initialData: undefined,
        visible: false,
        showPredicate: false,
        showColumns: false,
        handleClose,
        handleSubmit: (_value: Partial<EditGroupFormValues>) => Promise.resolve(),
        mode: 'Add',
    });

    const showColumns = groupType === 'column';
    const showPredicate = groupType === 'row';

    return {
        addGroup: ({submit}: {submit: (item: Partial<EditGroupFormValues>) => Promise<void>}) => {
            setModalProps({
                mode: 'Add',
                title: showColumns ? 'Add column group' : 'Add row group',
                confirmText: 'Add',
                disabledFields: ['enabled'],
                visible: true,
                initialData: {
                    name: '',
                    predicate: '',
                    columns: [],
                    enabled: false,
                },
                showColumns,
                showPredicate,
                handleSubmit: submit,
                handleClose,
            });
        },
        editGroup: ({
            item,
            submit,
        }: {
            item: EditGroupFormValues;
            submit: (item: Partial<EditGroupFormValues>) => Promise<void>;
        }) => {
            setModalProps({
                mode: 'Edit',
                title: showColumns ? `Edit column group` : `Edit row group`,
                confirmText: 'Save',
                initialData: {...item},
                disabledFields: [],
                visible: true,
                showColumns,
                showPredicate,
                handleSubmit: submit,
                handleClose,
            });
        },
        deleteGroup: ({
            item,
            submit,
        }: {
            item: EditGroupFormValues;
            submit: (item: Partial<EditGroupFormValues>) => Promise<void>;
        }) => {
            setModalProps({
                mode: 'Delete',
                title: showColumns ? `Delete column group` : `Delete row group`,
                confirmText: 'Delete',
                initialData: {...item},
                disabledFields: ['name', 'predicate', 'columns', 'enabled'],
                visible: true,
                showColumns,
                showPredicate,
                handleSubmit: submit,
                handleClose,
            });
        },
        editGroupModalNode: <EditGroupModal {...modalProps} />,
    };
}

interface EditGroupModalProps {
    title: string;
    confirmText: string;
    handleClose: () => void;
    handleSubmit: (value: Partial<EditGroupFormValues>) => Promise<void>;
    initialData?: Partial<EditGroupFormValues>;
    disabledFields?: Array<keyof EditGroupFormValues>;
    visible: boolean;
    showColumns?: boolean;
    showPredicate?: boolean;

    mode: 'Add' | 'Delete' | 'Edit';
}

export interface EditGroupFormValues {
    name: string;
    predicate?: string;
    columns?: Array<string>;
    enabled?: boolean;
}

function EditGroupModal({
    visible,
    title,
    confirmText,
    handleClose,
    handleSubmit,
    initialData,
    disabledFields = [],
    showColumns,
    showPredicate,
    mode,
}: EditGroupModalProps) {
    const [error, setError] = React.useState(undefined);

    const [initialValues] = useMemoizedIfEqual(initialData);

    return (
        <YTDFDialog<EditGroupFormValues>
            pristineSubmittable={mode === 'Delete'}
            visible={visible}
            modal={true}
            headerProps={{title}}
            footerProps={{textApply: confirmText}}
            onClose={() => {
                setError(undefined);
                handleClose();
            }}
            onAdd={(form) => {
                const {values} = form.getState();
                return handleSubmit(values).catch((err) => {
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
                        placeholder: 'Group name',
                        disabled: includes_(disabledFields, 'name'),
                    },
                },
                ...(showColumns
                    ? [
                          {
                              name: 'columns',
                              type: 'acl-columns' as const,
                              required: true,
                              caption: 'Columns',
                              tooltip: 'One column name per line',
                              extras: {
                                  disabled: includes_(disabledFields, 'columns'),
                              },
                          },
                      ]
                    : []),
                ...(showPredicate
                    ? [
                          {
                              name: 'predicate',
                              type: 'textarea' as const,
                              required: true,
                              caption: 'Rows',
                              tooltip: (
                                  <HelpLink
                                      url={UIFactory.docsUrls['acl:row-level-security']}
                                      text={i18n('managing-row-level-access')}
                                  />
                              ),
                              extras: {
                                  disabled: includes_(disabledFields, 'predicate'),
                                  placeholder: 'column1 = "Value1"',
                              },
                          },
                      ]
                    : []),
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

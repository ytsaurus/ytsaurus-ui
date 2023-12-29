import {compose} from 'redux';
import cn from 'bem-cn-lite';
import React, {useCallback, useMemo} from 'react';
import {DialogField, FormApi, YTDFDialog, makeErrorFields} from '../../../components/Dialog/Dialog';
import ErrorBoundary from '../../../components/ErrorBoundary/ErrorBoundary';
import Button from '../../../components/Button/Button';
import PermissionsControl from '../RequestPermissions/PermissionsControl/PermissionsControl';

import withVisible, {WithVisibleProps} from '../../../hocs/withVisible';

import './RequestPermissions.scss';
import {YTError} from '../../../types';
import {INHERITANCE_MODE_TYPES, IdmObjectType} from '../../../constants/acl';

import UIFactory from '../../../UIFactory';
import hammer from '../../../common/hammer';
import {map} from 'lodash';

import {docsUrl} from '../../../config';
import {makeLink} from '../../../utils/utils';
import {ACLType} from '../../../utils/acl/acl-types';

const block = cn('acl-request-permissions');

export type RequestPermissionsFieldsNames =
    | 'cluster'
    | 'path'
    | 'permissions'
    | 'subjects'
    | 'duration'
    | 'commentHeader'
    | 'comment'
    | 'inheritance_mode';

export interface Props extends WithVisibleProps {
    buttonText?: string;
    className?: string;
    cluster?: string;
    normalizedPoolTree?: string;
    path: string;
    idmKind: string;
    requestPermissions: (params: {
        values: FormValues;
        idmKind: string;
        aclType: ACLType;
    }) => Promise<void>;
    cancelRequestPermissions: (params: {idmKind: string; aclType: ACLType}) => unknown;
    error: YTError;
    onSuccess?: () => void;
    aclType: ACLType;
}

interface FormValues {
    path: string;
    cluster: string;
    permissions: {[x: string]: unknown} | null;
    subjects: Array<{
        value: string;
        type: 'users' | 'groups' | 'app';
        text?: string;
    }>;
    inheritance_mode?: string;
    duration?: string;
    comment?: string;
}

function RequestPermissions(props: Props) {
    const {
        buttonText = 'Request permissions',
        visible,
        handleShow,
        handleClose,
        className,
        path,
        idmKind,
        requestPermissions,
        cancelRequestPermissions,
        error,
        cluster,
        aclType,
        /*denyColumns,*/
    } = props;

    const onClose = useCallback(() => {
        handleClose();
        cancelRequestPermissions({idmKind, aclType});
    }, [handleClose, cancelRequestPermissions, idmKind, aclType]);

    const onAdd = useCallback(
        (form: FormApi<FormValues, Partial<FormValues>>) => {
            return requestPermissions({
                values: form.getState().values,
                idmKind,
                aclType,
            });
        },
        [requestPermissions, idmKind, aclType],
    );

    const currentCaption = `Current ${idmKind}`;
    const {permissionsToRequest: choices} = UIFactory.getAclPermissionsSettings()[idmKind];

    const firstItemDisabled = idmKind === IdmObjectType.ACCOUNT;
    const permissions = firstItemDisabled ? valueWithCheckedFirstChoice(choices) : null;

    const requestPermissionsFields: Record<
        RequestPermissionsFieldsNames,
        Omit<DialogField, 'name'>
    > = useMemo(() => {
        const disabledChoices = idmKind === IdmObjectType.ACCOUNT ? [0] : undefined;
        return {
            cluster: {
                type: 'plain',
                caption: 'Cluster',
                extras: {
                    className: block('cluster'),
                },
            },
            path: {
                type: 'text',
                caption: currentCaption,
                extras: {
                    disabled: !error,
                },
            },
            permissions: {
                type: 'permissions',
                caption: 'Permissions',
                tooltip: (
                    <>
                        {docsUrl(
                            makeLink(UIFactory.docsUrls['acl:permissions'], 'Permissions types'),
                            'Permissions types',
                        )}
                    </>
                ),
                required: true,
                extras: {
                    choices: choices,
                    disabledChoices,
                },
            },
            subjects: {
                type: 'acl-subjects',
                caption: 'Subjects',
                required: false,
                extras: {
                    placeholder: 'Enter group name, user name or login...',
                    allowedTypes: ['users', 'groups', 'app'],
                },
            },
            duration: {
                type: 'before-date',
                caption: 'Duration',
            },
            commentHeader: {
                type: 'block',
                className: block('modal-comments-header'),
                extras: {
                    children: (
                        <React.Fragment>
                            <div className={'is-dialog__label'}>Comment</div>
                            <div className={block('comment-notice')}>
                                Teams and people can be requested through the IDM after the access
                                group is created. If you have a more complex case please describe it
                                in the comments.
                            </div>
                        </React.Fragment>
                    ),
                },
            },
            comment: {
                type: 'textarea',
                className: block('modal-comments'),
            },
            inheritance_mode: {
                type: 'yt-select-single',
                caption: 'Inheritance mode',
                extras: {
                    items: map(INHERITANCE_MODE_TYPES, (value) => ({
                        value: value,
                        text: hammer.format['ReadableField'](value),
                    })),
                    hideClear: true,
                    hideFilter: true,
                    with: 'max',
                },
            },
        };
    }, [choices, currentCaption, error, idmKind]);

    const dialogFields = useMemo(() => {
        return UIFactory.getAclApi().requestPermissionsFields.map(
            (name) =>
                ({
                    ...requestPermissionsFields[name],
                    name: name,
                } as DialogField<FormValues>),
        );
    }, [requestPermissionsFields]);

    return (
        <ErrorBoundary>
            <div className={block(null, className)}>
                <Button view={'action'} onClick={handleShow}>
                    {buttonText}
                </Button>
                <YTDFDialog<FormValues>
                    pristineSubmittable
                    onClose={onClose}
                    className={block('modal')}
                    visible={Boolean(visible)}
                    onAdd={onAdd}
                    headerProps={{
                        title: 'Request permissions',
                    }}
                    initialValues={{
                        path,
                        permissions,
                        cluster,
                        inheritance_mode: INHERITANCE_MODE_TYPES.OBJECT_AND_DESCENDANTS,
                    }}
                    validate={(values) => {
                        const subjects = values.subjects;
                        const validationError: Record<
                            keyof Pick<FormValues, 'subjects'>,
                            string | undefined
                        > = {
                            subjects: undefined,
                        };

                        if (!subjects.length) {
                            const errorMessage = 'At least one subject should be selected.';
                            validationError.subjects = errorMessage;
                        }

                        return validationError;
                    }}
                    fields={[...dialogFields, ...makeErrorFields([error])]}
                />
            </div>
        </ErrorBoundary>
    );
}

export default compose(withVisible)(RequestPermissions);

function valueWithCheckedFirstChoice(choices: string | any[]) {
    if (!choices || choices.length < 1) {
        return {};
    }

    return {
        [PermissionsControl.getChoiceName(choices[0])]: choices[0],
    };
}

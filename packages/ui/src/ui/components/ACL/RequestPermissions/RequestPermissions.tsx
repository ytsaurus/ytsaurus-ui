import {compose} from 'redux';
import cn from 'bem-cn-lite';
import React, {useCallback} from 'react';
import Dialog, {FormApi, makeErrorFields} from '../../../components/Dialog/Dialog';
import ErrorBoundary from '../../../components/ErrorBoundary/ErrorBoundary';
import Button from '../../../components/Button/Button';
import PermissionsControl from '../RequestPermissions/PermissionsControl/PermissionsControl';

import withVisible, {WithVisibleProps} from '../../../hocs/withVisible';

import './RequestPermissions.scss';
import {PERMISSIONS_SETTINGS, IdmObjectType} from '../../../constants/acl';
import {YTError} from '../../../types';

const block = cn('acl-request-permissions');

interface Props extends WithVisibleProps {
    buttonText?: string;
    className?: string;
    cluster?: string;
    normalizedPoolTree?: string;
    path: string;
    idmKind: string;
    requestPermissions: (params: {values: FormValues; idmKind: string}) => Promise<any>;
    cancelRequestPermissions: (params: {idmKind: string}) => any;
    error: YTError;
    onSuccess?: () => void;
}

interface FormValues {
    path: string;
    cluster: string;
    permissions: {[x: string]: any} | null;
    subjects: Array<{
        value: string;
        type: 'users' | 'groups' | 'app';
        text?: string;
    }>;
    duration: string;
    comment: string;
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
        /*denyColumns,*/
    } = props;

    const onClose = useCallback(() => {
        handleClose();
        cancelRequestPermissions({idmKind});
    }, [handleClose, cancelRequestPermissions, idmKind]);

    const onAdd = useCallback(
        (form: FormApi<FormValues, Partial<FormValues>>) =>
            requestPermissions({
                values: form.getState().values,
                idmKind,
            }),
        [requestPermissions, idmKind],
    );

    const currentCaption = `Current ${idmKind}`;
    const {permissionsToRequest: choices} = PERMISSIONS_SETTINGS[idmKind];

    const firstItemDisabled = idmKind === IdmObjectType.ACCOUNT;
    const permissions = firstItemDisabled ? valueWithCheckedFirstChoice(choices) : null;
    const disabledChoices = idmKind === IdmObjectType.ACCOUNT ? [0] : undefined;

    return (
        <ErrorBoundary>
            <div className={block(null, className)}>
                <Button view={'action'} onClick={handleShow}>
                    {buttonText}
                </Button>
                <Dialog<FormValues>
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
                    fields={[
                        {
                            name: 'cluster',
                            type: 'plain',
                            caption: 'Cluster',
                            extras: {
                                className: block('cluster'),
                            },
                        },
                        {
                            name: 'path',
                            type: 'text',
                            caption: currentCaption,
                            extras: {
                                disabled: !error,
                            },
                        },
                        {
                            name: 'permissions',
                            type: 'permissions',
                            caption: 'Permissions',
                            required: true,
                            extras: {
                                choices: choices,
                                disabledChoices,
                            },
                        },
                        {
                            name: 'subjects',
                            type: 'acl-subjects',
                            caption: 'Subjects',
                            required: false,
                            extras: {
                                placeholder: 'Enter group name, user name or login...',
                                allowedTypes: ['users', 'groups', 'app'],
                            },
                        },
                        {
                            name: 'duration',
                            type: 'before-date',
                            caption: 'Duration',
                        },
                        {
                            name: 'commentHeader',
                            type: 'block',
                            className: block('modal-comments-header'),
                            extras: {
                                children: (
                                    <React.Fragment>
                                        <div className={'is-dialog__label'}>Comment</div>
                                        <div className={block('comment-notice')}>
                                            Teams and people can be requested through the IDM after
                                            the access group is created. If you have a more complex
                                            case please describe it in the comments.
                                        </div>
                                    </React.Fragment>
                                ),
                            },
                        },
                        {
                            name: 'comment',
                            type: 'textarea',
                            className: block('modal-comments'),
                        },
                        ...makeErrorFields([error]),
                    ]}
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

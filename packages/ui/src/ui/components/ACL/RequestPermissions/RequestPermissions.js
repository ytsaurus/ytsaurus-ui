import PropTypes from 'prop-types';
import {compose} from 'redux';
import cn from 'bem-cn-lite';
import React, {useCallback} from 'react';
import Dialog, {makeErrorFields} from '../../../components/Dialog/Dialog';
import ErrorBoundary from '../../../components/ErrorBoundary/ErrorBoundary';
import Button from '../../../components/Button/Button';
import PermissionsControl from '../RequestPermissions/PermissionsControl/PermissionsControl';

import withVisible from '../../../hocs/withVisible';

import './RequestPermissions.scss';
import {PERMISSIONS_SETTINGS, IdmObjectType} from '../../../constants/acl';

const block = cn('acl-request-permissions');

RequestPermissions.propTypes = {
    buttonText: PropTypes.string,

    // from withVisible
    visible: PropTypes.bool.isRequired,
    handleClose: PropTypes.func.isRequired,
    handleShow: PropTypes.func.isRequired,

    // from parent
    className: PropTypes.string,
    cluster: PropTypes.string,
    path: PropTypes.string.isRequired,
    idmKind: PropTypes.string.isRequired,
    requestPermissions: PropTypes.func.isRequired,
    cancelRequestPermissions: PropTypes.func.isRequired,
    error: PropTypes.any,
};

function RequestPermissions(props) {
    const {
        buttonText,
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
        (form) =>
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
    const disabledChoices = idmKind === IdmObjectType.ACCOUNT ? [0] : null;

    return (
        <ErrorBoundary>
            <div className={block(null, className)}>
                <Button view={'action'} onClick={handleShow}>
                    {buttonText}
                </Button>
                <Dialog
                    pristineSubmittable
                    onClose={onClose}
                    className={block('modal')}
                    confirmText="Send"
                    visible={visible}
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
                        const validationError = {
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

RequestPermissions.defaultProps = {
    buttonText: 'Request permissions',
};

export default compose(withVisible)(RequestPermissions);

function valueWithCheckedFirstChoice(choices) {
    if (!choices || choices.length < 1) {
        return {};
    }

    return {
        [PermissionsControl.getChoiceName(choices[0])]: choices[0],
    };
}
